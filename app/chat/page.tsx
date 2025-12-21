'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  files?: string[];
}

// PDF Extractor
async function extractPDFText(file: File): Promise<string> {
  try {
    console.log(' Extracting PDF:', file.name);
    
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/extract-pdf', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.text) {
      throw new Error('No text extracted');
    }
    
    console.log(` Extracted ${data.text.length} characters`);
    return data.text;
  } catch (error: any) {
    console.error('PDF error:', error);
    return `[PDF: ${file.name}] - Could not extract text. Please describe what you need help with.`;
  }
}


const MessageBubble = ({ message }: { message: Message }) => {
  const isBot = message.sender === 'bot';
  
  return (
    <div 
    className={`flex px-4 py-3 transition-colors border-b border-gray-800/50
    ${isBot ? 'gap-3 justify-start' : 'gap-3 justify-end'}
  `}>
     
      <div className="flex-shrink-0 pt-1">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center  ${
          isBot 
            ? 'bg-black' 
            : 'bg-gray-900'
        }`}>
          {isBot ? (
            <Bot className="w-10 h-10 text-white" />
          ) : (
            <User className="w-5 h-5 text-white" />
          )}
        </div>
      </div>

      
      <div className="flex-1 min-w-0">
        
        <div className="flex items-center gap-2 mb-1">
          <span className="font-bold text-white text-[15px]">
            {isBot ? 'JARVIS' : 'You'}
          </span>
          <span className="text-gray-500 text-sm" suppressHydrationWarning>
            · {message.timestamp.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
          </span>
        </div>

       
        <div className="text-[15px] text-gray-100 leading-normal whitespace-pre-wrap break-words">
          {message.text}
        </div>

       
        {message.files && message.files.length > 0 && (
          <div className="mt-3 flex gap-2 flex-wrap">
            {message.files.map((file, idx) => (
              <div 
                key={idx}
                className="inline-flex items-center gap-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-300"
              >
                <span>📄</span>
                <span>{file}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const TypingIndicator = () => (
  <div className="flex gap-3 px-4 py-3">
    <div className="flex-shrink-0 pt-1">
      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
        <Bot className="w-5 h-5 text-white" />
      </div>
    </div>
    <div className="flex-1">
      <div className="font-bold text-white text-[15px] mb-1">JARVIS</div>
      <div className="flex gap-1.5">
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
      </div>
    </div>
  </div>
);


export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m JARVIS. Upload a PDF and ask me questions about it, or ask about weather, currency conversion, and more.',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [pdfContent, setPdfContent] = useState<string>('');
  const [extracting, setExtracting] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [sessionId] = useState(() => 'session-' + Math.random().toString(36).substring(7));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);


  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = inputRef.current.scrollHeight + 'px';
    }
  }, [inputText]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const pdfFiles = files.filter(f => f.type === 'application/pdf');
    
    if (pdfFiles.length === 0) {
      alert('Please select a PDF file');
      return;
    }
    
    setExtracting(true);
    
    try {
      const text = await extractPDFText(pdfFiles[0]);
      setPdfContent(text);
      setUploadedFiles([pdfFiles[0]]);
      
      const uploadMsg: Message = {
        id: Date.now().toString(),
        text: ` PDF uploaded: ${pdfFiles[0].name}\n\nNow ask me a question about it!`,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, uploadMsg]);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setExtracting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!inputText.trim() && uploadedFiles.length === 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText || '(Asking about uploaded PDF)',
      sender: 'user',
      timestamp: new Date(),
      files: uploadedFiles.map(f => f.name),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentInput,
          threadId: sessionId,
          documentContent: pdfContent || undefined,
        }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || 'I received your message.',
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      setUploadedFiles([]);
      setPdfContent('');
    } catch (error: any) {
      console.error('Error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Connection error. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white">
     
      <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-[15px] font-bold leading-tight">JARVIS 0.5</h1>
              <p className="text-[13px] text-gray-500">AI Assistant Chatbot</p>
            </div>
          </div>
        </div>
      </header>

     
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[600px] mx-auto">
          {messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

     
      <div className="border-t border-gray-800 bg-black">
        <div className="max-w-[600px] mx-auto">
          
          {uploadedFiles.length > 0 && (
            <div className="px-4 pt-3">
              <div className="flex gap-2 flex-wrap">
                {uploadedFiles.map((file, idx) => (
                  <div 
                    key={idx} 
                    className="inline-flex items-center gap-2 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm"
                  >
                    <span>📄 {file.name}</span>
                    <button 
                      onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== idx))}
                      className="text-gray-400 hover:text-white transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          
          {extracting && (
            <div className="px-4 pt-3 text-sm text-gray-500">
              🔄 Extracting PDF text...
            </div>
          )}
          
          
          <div className="p-4">
            <div className="flex items-end gap-2 bg-gray-900 border border-gray-800 rounded-full px-4 py-2 focus-within:border-blue-600 transition">
            
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={extracting}
                className="flex-shrink-0 p-2 text-blue-500 hover:bg-blue-500/10 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
                title="Attach PDF"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                disabled={extracting}
                className="hidden"
              />

              {/* Text Input */}
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="What's on your mind?"
                rows={1}
                className="flex-1 bg-transparent text-white placeholder-gray-600 outline-none resize-none max-h-32 py-2 text-[15px]"
              />

            
              <button
                onClick={handleSendMessage}
                disabled={(!inputText.trim() && uploadedFiles.length === 0) || isTyping}
                className="flex-shrink-0 p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-full transition"
                title="Send"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}