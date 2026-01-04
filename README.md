# JARVIS 0.5 - AI Assistant Chatbot

## 🤖 What is JARVIS 0.5?

An intelligent conversational AI powered by **LangChain**, **LangGraph**, and **Groq's Llama 3.3 70B** that combines document analysis with real-time tool execution for weather, currency conversion, web search, and more.

**🔗 Live Demo:** [https://custom-agent-ai-next-js-version.vercel.app/](https://custom-agent-ai-next-js-version.vercel.app/)

---

## 💡 Why I Built This?

To learn about **LLMs**, **LangChain**, and **agentic AI systems** - this project serves as a foundation for building further upgraded versions and understanding how AI agents can orchestrate multiple tools intelligently.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📄 **PDF Document Analysis** | Upload and query PDF documents using OCR technology |
| 🔍 **Web Search** | Real-time information retrieval via Tavily API |
| 📚 **Wikipedia Integration** | Access encyclopedic knowledge instantly |
| 📰 **News Search** | Get the latest news articles on any topic |
| 🌤️ **Weather Information** | Current weather data for any location worldwide |
| 💱 **Currency Conversion** | Real-time exchange rates between currencies |
| 🌍 **Country Information** | Geographic and demographic data lookup |
| 💬 **Conversation Memory** | Thread-based context retention across messages |

---

## 🏗️ System Architecture

### Workflow Components

1. **Frontend Layer** - Next.js chat interface with file upload
2. **PDF Processing** - OCR.space API for text extraction
3. **Chat API** - LangGraph orchestration and context management
4. **Agent Node** - Groq LLM (Llama 3.3 70B) for decision making
5. **Tools Node** - Executes appropriate tools based on query
6. **Response** - Natural language answer delivered to user

### Architecture Flow

<div align="center">
<img width="479" height="644" alt="JARVIS Workflow" src="https://github.com/user-attachments/assets/77903771-8ecf-4832-9a7b-7f9cbc005205" />
</div>

---

## 🔄 Version Evolution

| **Old UI - DATA VERSE** | **New UI - JARVIS 0.5** |
|:---:|:---:|
| <img width="900" alt="DATA VERSE Old UI" src="https://github.com/user-attachments/assets/1b57f13a-1a81-43b6-a67b-601e6eadf9aa" /> | <img width="600" alt="JARVIS 0.5 New UI" src="https://github.com/user-attachments/assets/67feeee7-42bc-4a48-b4e5-555e3baeca64" /> |
| Browser-based AI chatbot with OpenRouter API (DeepSeek V3) | Agentic AI system with LangChain |
| **Features:** Real-time chat, mobile-friendly UI, smooth conversation flow | **Features:** PDF analysis (OCR), Multiple tools (Weather, Currency, Web Search), memory system, multi-tool orchestration |
| **Tech:** React.js, JavaScript, CSS3, OpenRouter API | **Tech:** Next.js 15, TypeScript, LangGraph, Groq Llama 3.3 70B |

---

## 🔍 Why OCR?

### The Problem
PDFs contain complex layouts, embedded fonts, images with text, and scanned documents - they're not plain text files.

### The Solution
We use **OCR.space API** because it:

✅ Handles all PDF types (born-digital and scanned)
✅ Extracts pure, clean text for LLM processing
✅ Works server-side for better performance

**Example:**
```javascript
// Scanned document or complex PDF
Input: contract.pdf (5MB, 20 pages)
↓
OCR Processing: Analyzes each page
↓
Output: "This agreement is entered into on..."
```

---

## 🎯 Case Handling

### **Case 1: Plain Text Query**

**Example:**
```
User: "What is photosynthesis?"
```

**Flow:** Query → Agent → Direct Response (no tools)

**Response:**
```
"Photosynthesis is the process by which plants..."
```

---

### **Case 2: Document Upload + Query**

**Example:**
```
User uploads: employment_contract.pdf
User asks: "What's the notice period?"
```

**Flow:**
1. PDF Upload → OCR API → Text Extracted
2. Text stored in state
3. Message constructed with document context
4. Agent analyzes content directly
5. Response: "According to the contract, the notice period is 30 days..."

---

### **Case 3: Tool Call Required**

**Example:**
```
User: "What's the weather in Tokyo?"
```

**Flow:**
1. Agent recognizes need for real-time data
2. Generates tool call: `weather(location: "Tokyo")`
3. Tool executes: Tokyo → Coordinates → Weather API → Data
4. Result returned to agent
5. Response: "The current weather in Tokyo is 12°C with moderate winds..."

---

### **Case 4: Multi-Tool Query**

**Example:**
```
User: "Compare weather in Paris vs London and convert 100 EUR to GBP"
```

**Flow:**
1. Agent generates 3 tool calls (2x weather, 1x currency)
2. Tools execute in parallel
3. Agent synthesizes all results
4. Response: "Paris is currently warmer at 15°C compared to London at 12°C. For your currency question, 100 EUR equals 85.50 GBP."

---

## ⚠️ Limitations

### **File Support**
- ✅ **Supported:** PDF documents only (single file per session)
- ❌ **Not Supported:** Images, videos, audio, multiple files, DOCX/XLSX

### **Why These Limitations?**

**Single File Design:**
- Simplified UX and clear focus
- Prevents context overload
- Current implementation uses `uploadedFiles[0]`

**Image/Video Not Supported:**
- Current LLM endpoint is text-only
- Groq API doesn't support multimodal inputs (vision)
- Would require vision-enabled model (GPT-4V, Claude 3) and different architecture

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling

### Backend
- **LangChain** - AI framework
- **LangGraph** - Workflow orchestration
- **Groq** - LLM API (Llama 3.3 70B)

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

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 Environment Variables

Create `.env.local` file:

```env
GROQ_API_KEY=your_groq_api_key_here
OCR_API_KEY=your_ocr_space_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
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
3. Wait for confirmation
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

MIT License

---

**Built with ❤️ for learning and practice**

*JARVIS 0.5 - Your Intelligent AI Assistant*
