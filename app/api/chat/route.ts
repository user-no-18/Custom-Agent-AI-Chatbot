import { NextRequest, NextResponse } from 'next/server';
import { MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { ChatGroq } from "@langchain/groq";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { TavilySearch } from "@langchain/tavily";
import { MemorySaver } from '@langchain/langgraph';
import { WikipediaQueryRun } from "@langchain/community/tools/wikipedia_query_run";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

const checkpointer = new MemorySaver();

// ============== EXISTING TOOLS ==============

const tavilyTool = new TavilySearch({
    maxResults: 3,
    apiKey: process.env.TAVILY_API_KEY, 
    topic: 'general',
    includeAnswer: true,
    searchDepth: "basic",
});

const wikiTool = new WikipediaQueryRun({
    topKResults: 2,
    maxDocContentLength: 2000,
});

const loggingWikiTool = new DynamicStructuredTool({
    name: "wikipedia",
    description: "Search Wikipedia for factual, historical, or general knowledge questions.",
    schema: z.object({
        query: z.string().describe("Topic to search"),
    }),
    func: async ({ query }) => {
        console.log("📚 Wikipedia:", query);
        return await wikiTool.invoke(query);
    },
});

const loggingNewsTool = new DynamicStructuredTool({
    name: "news_search",
    description: "Search for recent news articles",
    schema: z.object({
        query: z.string().describe("News topic to search"),
    }),
    func: async ({ query }) => {
        console.log("📰 News:", query);
        const newsSearch = new TavilySearch({
            maxResults: 3,
            apiKey: process.env.TAVILY_API_KEY,
            topic: 'news',
            includeAnswer: true,
            searchDepth: "basic",
        });
        return await newsSearch.invoke(query);
    },
});

// ============== NEW TOOL: WEATHER ==============

const weatherTool = new DynamicStructuredTool({
    name: "weather",
    description: "Get current weather for a location. Just provide city name.",
    schema: z.object({
        location: z.string().describe("City name"),
    }),
    func: async ({ location }) => {
        console.log("🌤️ Weather:", location);
        try {
            // First, get coordinates from city name
            const geoResponse = await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`
            );
            const geoData = await geoResponse.json();
            
            if (!geoData.results || geoData.results.length === 0) {
                return `Location "${location}" not found`;
            }
            
            const { latitude, longitude, name, country } = geoData.results[0];
            
            // Get weather data
            const weatherResponse = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m`
            );
            const weather = await weatherResponse.json();
            
            const temp = weather.current.temperature_2m;
            const wind = weather.current.wind_speed_10m;
            const humidity = weather.current.relative_humidity_2m;
            
            return `${name}, ${country}: ${temp}°C, Wind: ${wind} km/h, Humidity: ${humidity}%`;
        } catch (error) {
            return "Failed to fetch weather data";
        }
    }
});

// ============== NEW TOOL: CURRENCY CONVERSION ==============

const currencyTool = new DynamicStructuredTool({
    name: "currency_conversion",
    description: "Convert currency between different currencies",
    schema: z.object({
        amount: z.number().describe("Amount to convert"),
        from_currency: z.string().describe("Source currency code (e.g., USD, EUR)"),
        to_currency: z.string().describe("Target currency code (e.g., EUR, GBP)"),
    }),
    func: async ({ amount, from_currency, to_currency }) => {
        console.log(`💱 Currency: ${amount} ${from_currency} to ${to_currency}`);
        try {
            const response = await fetch(
                `https://api.exchangerate-api.com/v4/latest/${from_currency.toUpperCase()}`
            );
            const data = await response.json();
            
            if (data.result === "error") {
                return `Currency ${from_currency} not found`;
            }
            
            const rate = data.rates[to_currency.toUpperCase()];
            if (!rate) {
                return `Currency ${to_currency} not found`;
            }
            
            const result = (amount * rate).toFixed(2);
            return `${amount} ${from_currency.toUpperCase()} = ${result} ${to_currency.toUpperCase()}`;
        } catch (error) {
            return "Failed to fetch exchange rates";
        }
    }
});

// ============== NEW TOOL: COUNTRY INFO ==============

const countryTool = new DynamicStructuredTool({
    name: "country_info",
    description: "Get information about a country (capital, population, languages, etc.)",
    schema: z.object({
        country: z.string().describe("Country name"),
    }),
    func: async ({ country }) => {
        console.log("🌍 Country:", country);
        try {
            const response = await fetch(
                `https://restcountries.com/v3.1/name/${encodeURIComponent(country)}`
            );
            const data = await response.json();
            
            if (data.status === 404) {
                return `Country "${country}" not found`;
            }
            
            const info = data[0];
            const capital = info.capital?.[0] || "N/A";
            const population = info.population?.toLocaleString() || "N/A";
            const region = info.region || "N/A";
            const languages = info.languages ? Object.values(info.languages).join(", ") : "N/A";
            
            return `${info.name.common}: Capital: ${capital}, Population: ${population}, Region: ${region}, Languages: ${languages}`;
        } catch (error) {
            return "Failed to fetch country information";
        }
    }
});

// ============== ALL TOOLS ==============

const tools = [tavilyTool, loggingWikiTool, loggingNewsTool, weatherTool, currencyTool, countryTool];
const toolNode = new ToolNode(tools);

// ============== LLM ==============

const llm = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0,
  maxRetries: 2,
  apiKey: process.env.GROQ_API_KEY,
}).bindTools(tools);

// ============== WORKFLOW FUNCTIONS ==============

async function callModel(state: any) {
  const response = await llm.invoke(state.messages);
  return { messages: [response] };
}

function shouldContinue(state: any) {
    const lastMessage = state.messages[state.messages.length - 1];
    if (lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
        return 'tools';
    }
    return '__end__';
}

// ============== WORKFLOW ==============

const workflow = new StateGraph(MessagesAnnotation)
  .addNode("agent", callModel)
  .addNode("tools", toolNode)
  .addEdge("__start__", "agent")
  .addConditionalEdges('agent', shouldContinue, {
    tools: "tools",
    __end__: "__end__"
  })
  .addEdge('tools','agent');

const app = workflow.compile({ checkpointer });

// ============== API ROUTE ==============

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, threadId, documentContent } = body;

    if (!message && !documentContent) {
      return NextResponse.json(
        { error: 'Message or document is required' },
        { status: 400 }
      );
    }

    console.log('🔄 Processing:', message || 'Document analysis');

    // Build final message
    let finalMessage = message || '';
    if (documentContent) {
      finalMessage = `I've uploaded a document. Here's my query: ${message || 'Please summarize this document'}

Document content (first 3000 chars):
${documentContent.substring(0, 3000)}`;
    }

    // Invoke agent
    const finalState = await app.invoke(
      { messages: [{ role: "user", content: finalMessage }] },
      { configurable: { thread_id: threadId || "default-thread" } }
    );

    const lastMessage = finalState.messages[finalState.messages.length - 1];
    
    console.log('✅ Response generated');

    return NextResponse.json({
      response: lastMessage.content,
      success: true
    });

  } catch (error: any) {
    console.error('❌ Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process message',
        details: error.message 
      },
      { status: 500 }
    );
  }
}