# JARVIS 0.5 - AI Assistant Chatbot

An intelligent conversational AI powered by **LangChain**, **LangGraph**, and **Groq's Llama 3.3 70B** that combines document analysis with real-time tool execution for weather, currency conversion, web search, and more.

---

## 🚀 Features

- **📄 PDF Document Analysis** - Upload and query PDF documents using OCR
- **🔍 Web Search** - Real-time information retrieval via Tavily
- **📚 Wikipedia Integration** - Access encyclopedic knowledge
- **📰 News Search** - Get latest news articles
- **🌤️ Weather Information** - Current weather for any location
- **💱 Currency Conversion** - Real-time exchange rates
- **🌍 Country Information** - Geographic and demographic data
- **💬 Conversation Memory** - Thread-based context retention

---

## 📋 Table of Contents

- [Architecture](#architecture)
- [Why OCR?](#why-ocr)
- [Case Handling](#case-handling)
- [Limitations](#limitations)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Usage](#usage)

---

## 🏗️ Architecture

```
User Input → Frontend (React) → API Routes → LangGraph Agent → Tools → Response
                                      ↓
                                 PDF OCR API
```

### Workflow Components

1. **Frontend Layer** - Next.js chat interface with file upload
2. **PDF Processing** - OCR.space API for text extraction
3. **Chat API** - LangGraph orchestration and context management
4. **Agent Node** - Groq LLM (Llama 3.3 70B) for decision making
5. **Tools Node** - Executes appropriate tools based on query
6. **Response** - Natural language answer delivered to user

---

## 🔍 Why OCR?

### The Problem
PDFs are **not plain text files**. They contain:
- Complex layouts with columns, tables, and graphics
- Embedded fonts and formatting
- Images with text overlays
- Scanned documents (images of pages)

### The Solution: OCR (Optical Character Recognition)
We use **OCR.space API** because:

✅ **Handles All PDF Types**
- Born-digital PDFs (created from Word, etc.)
- Scanned documents (photos of paper)
- Mixed content (text + images)

✅ **Extracts Pure Text**
- Converts visual content to machine-readable text
- Removes formatting complexity
- Provides clean input for LLM processing

✅ **No Client-Side Processing**
- Server-side extraction = faster performance
- No large PDF libraries in browser
- Works across all devices

### How It Works
```
PDF Upload → Convert to Buffer → OCR API → Extract Text → Send to LLM
```

**Example:**
```javascript
// Scanned document or complex PDF
Input: contract.pdf (5MB, 20 pages, mixed layouts)
↓
OCR Processing: Analyzes each page
↓
Output: "This agreement is entered into on..."
(Clean text ready for AI analysis)
```

---

## 🎯 Case Handling

The system intelligently handles three distinct scenarios:

### **Case 1: Plain Text Query (No Tools)**

**Scenario:** User asks a general knowledge question

**Example:**
```
User: "What is photosynthesis?"
```

**Flow:**
1. Message sent to Chat API
2. LangGraph Agent receives query
3. LLM has sufficient knowledge to answer
4. **No tool calls triggered**
5. Direct response generated
6. Return to user

**Agent Decision:**
```javascript
// shouldContinue function
if (lastMessage.tool_calls.length === 0) {
  return '__end__';  // Skip tools, end workflow
}
```

**Response:**
```
"Photosynthesis is the process by which plants..."
```

---

### **Case 2: Document Upload + Query**

**Scenario:** User uploads PDF and asks about its content

**Example:**
```
User uploads: employment_contract.pdf
User asks: "What's the notice period?"
```

**Flow:**
1. **PDF Upload Handling**
   ```javascript
   File → /api/extract-pdf → OCR.space API → Text Extracted
   ```

2. **Text Storage**
   ```javascript
   setPdfContent(extractedText)  // Store in state
   ```

3. **Message Construction**
   ```javascript
   finalMessage = `I've uploaded a document. Here's my query: What's the notice period?
   
   Document content (first 3000 chars):
   ${documentContent.substring(0, 3000)}`
   ```

4. **Agent Processing**
   - Receives document context + query
   - LLM analyzes document content
   - **No external tools needed** (answer is in document)
   - Extracts relevant information

5. **Response**
   ```
   "According to the contract, the notice period is 30 days..."
   ```

**Key Point:** Document content is passed directly to LLM as context, no tool execution required.

---

### **Case 3: Tool Call Required**

**Scenario:** User asks for real-time or external information

**Example:**
```
User: "What's the weather in Tokyo?"
```

**Flow:**
1. **Message to Agent**
   ```javascript
   { role: "user", content: "What's the weather in Tokyo?" }
   ```

2. **Agent Analysis**
   - LLM recognizes: "This requires current weather data"
   - Generates tool call:
   ```javascript
   tool_calls: [{
     name: "weather",
     args: { location: "Tokyo" }
   }]
   ```

3. **Conditional Routing**
   ```javascript
   // shouldContinue detects tool_calls
   if (tool_calls.length > 0) {
     return 'tools';  // Route to Tools Node
   }
   ```

4. **Tool Execution**
   ```javascript
   // Weather Tool Flow
   Tokyo → Geocoding API → (35.6762, 139.6503)
         ↓
   Coordinates → Open-Meteo API → Weather Data
         ↓
   Result: "Tokyo, Japan: 12°C, Wind: 15 km/h, Humidity: 60%"
   ```

5. **Return to Agent**
   - Tool result added to conversation
   - Agent formats natural response

6. **Final Response**
   ```
   "The current weather in Tokyo is 12°C with moderate winds..."
   ```

---

### **Case 4: Multi-Tool Complex Query**

**Scenario:** Query requires multiple tools

**Example:**
```
User: "Compare weather in Paris vs London and convert 100 EUR to GBP"
```

**Flow:**
1. **Agent First Call**
   ```javascript
   tool_calls: [
     { name: "weather", args: { location: "Paris" } },
     { name: "weather", args: { location: "London" } },
     { name: "currency_conversion", args: { amount: 100, from: "EUR", to: "GBP" } }
   ]
   ```

2. **Parallel Tool Execution**
   - Weather tool (Paris) → "Paris: 15°C"
   - Weather tool (London) → "London: 12°C"
   - Currency tool → "100 EUR = 85.50 GBP"

3. **Agent Second Call**
   - Receives all 3 tool results
   - Synthesizes information
   - **No more tool calls needed**
   - Generates comprehensive answer

4. **Response**
   ```
   "Paris is currently warmer at 15°C compared to London at 12°C.
   For your currency question, 100 EUR equals 85.50 GBP."
   ```

---

## ⚠️ Limitations

### **File Support**
- ✅ **Supported:** PDF documents only
- ❌ **Not Supported:**
  - Multiple file uploads (single PDF per session)
  - Images (JPG, PNG, etc.)
  - Videos (MP4, AVI, etc.)
  - Audio files
  - Other document formats (DOCX, XLSX, etc.)

### **Why These Limitations?**

**Single File Design:**
- Simplified UX - clear focus on one document
- Prevents context overload for LLM
- Current implementation: `uploadedFiles[0]` used
- To support multiple files, would need:
  ```javascript
  // Would require restructuring
  uploadedFiles.map(file => extractPDFText(file))
  // Combine all texts
  // Manage token limits
  ```

**Image/Video Not Supported:**
- Current LLM endpoint: Text-only
- OCR.space: Optimized for document text extraction
- Groq API: Does not support multimodal inputs (vision)
- Would require:
  - Vision-enabled model (GPT-4V, Claude 3)
  - Image preprocessing pipeline
  - Higher API costs
  - Different tool architecture

**Future Enhancement Path:**
```javascript
// Potential multimodal support
if (file.type.includes('image')) {
  // Vision API call
  const description = await visionAPI(file);
} else if (file.type === 'application/pdf') {
  // Current OCR flow
  const text = await ocrAPI(file);
}
```

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

### Backend
- **LangChain** - AI framework
- **LangGraph** - Workflow orchestration
- **Groq** - LLM API (Llama 3.3 70B)
- **MemorySaver** - Conversation state management

### Tools & APIs
- **Tavily** - Web search
- **Wikipedia API** - Knowledge base
- **OCR.space** - PDF text extraction
- **Open-Meteo** - Weather data
- **ExchangeRate API** - Currency conversion
- **RestCountries API** - Country information

---

## 📦 Installation

```bash
# Clone repository
git clone <your-repo-url>
cd jarvis-chatbot

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 Environment Variables

Create `.env.local` file:

```env
# Required
GROQ_API_KEY=your_groq_api_key_here
OCR_API_KEY=your_ocr_space_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here

# Optional (tools will be disabled if not provided)
# OPENAI_API_KEY=your_openai_key  # If using OpenAI
```

### Get API Keys:
- **Groq:** [console.groq.com](https://console.groq.com)
- **OCR.space:** [ocr.space/ocrapi](https://ocr.space/ocrapi)
- **Tavily:** [tavily.com](https://tavily.com)

---

## 🎮 Usage

### Basic Chat
```
User: "What is the capital of France?"
JARVIS: "The capital of France is Paris."
```

### PDF Analysis
1. Click paperclip icon
2. Select PDF file
3. Wait for "PDF uploaded" confirmation
4. Ask questions:
   ```
   User: "Summarize the main points"
   User: "What does section 3 say about refunds?"
   ```

### Tool Usage
```
User: "What's the weather in Mumbai?"
JARVIS: "Mumbai, India: 28°C, Wind: 12 km/h, Humidity: 75%"

User: "Convert 50 USD to INR"
JARVIS: "50 USD = 4,150.00 INR"

User: "Tell me about Japan"
JARVIS: "Japan: Capital: Tokyo, Population: 125,584,838..."
```

---

## 📊 Workflow Diagram

```
┌─────────────┐
│ User Input  │
└──────┬──────┘
       │
       ├─────────────────┐
       │                 │
   PDF Upload      Text Message
       │                 │
   ┌───▼────┐       ┌────▼─────┐
   │  OCR   │       │ Chat API │
   │  API   │       └────┬─────┘
   └───┬────┘            │
       │                 │
   Extract Text    ┌─────▼──────┐
       │           │ LangGraph  │
       └──────────►│   Agent    │
                   └─────┬──────┘
                         │
                   ┌─────▼─────┐
                   │  Decision │
                   └─────┬─────┘
                         │
            ┌────────────┼────────────┐
            │            │            │
      No Tool      Document     Tool Call
       Needed       Context       Needed
            │            │            │
            │            │      ┌─────▼─────┐
            │            │      │   Tools   │
            │            │      │   Node    │
            │            │      └─────┬─────┘
            │            │            │
            └────────────┴────────────┘
                         │
                   ┌─────▼──────┐
                   │  Response  │
                   └─────┬──────┘
                         │
                   ┌─────▼──────┐
                   │  Display   │
                   └────────────┘
```

---

## 🤝 Contributing

Contributions welcome! Areas for improvement:
- Multi-file upload support
- Image analysis (vision models)
- Voice input/output
- Export conversation history
- Custom tool creation

---

## 📄 License

MIT License - See LICENSE file for details

---



**Built with ❤️ for learning and practice**

*JARVIS 0.5 - Your Intelligent AI Assistant*
