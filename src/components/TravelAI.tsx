'use client'
import { useState } from 'react';

interface TravelAdviceResponse {
  agent_name: string;
  response: string;
  category: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  adviceData?: TravelAdviceResponse;
}

const categoryIcons = {
  information: '📋',
  transport: '✈️',
  dining: '🍽️'
};

const categoryColors = {
  information: 'border-blue-500 bg-blue-900/20',
  transport: 'border-green-500 bg-green-900/20',
  dining: 'border-yellow-500 bg-yellow-900/20'
};

export default function TravelAI() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your TravelAI assistant. I can help you with:\n\n📋 **Visa & Regulations** - Tax info, visa requirements, legal matters\n✈️ **Travel & Transport** - Routes, transportation options, hidden gems\n🍽️ **Dining & Food** - Restaurant recommendations, dietary restrictions\n\nHow can I help with your nomadic journey today?"
    }
  ]);

  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMessage: Message = { role: 'user', content: chatInput };
    setMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: chatInput }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: TravelAdviceResponse = await response.json();
      
      const aiMessage: Message = {
        role: 'assistant',
        content: data.response,
        adviceData: data
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };



  const getCategoryStyle = (category?: string) => {
    if (!category || !(category in categoryColors)) return 'border-gray-600 bg-gray-700';
    return categoryColors[category as keyof typeof categoryColors];
  };

  const getCategoryIcon = (category?: string) => {
    if (!category || !(category in categoryIcons)) return '🤖';
    return categoryIcons[category as keyof typeof categoryIcons];
  };


  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl shadow-lg border border-gray-600">
      {/* Collapsible Header */}
      <div className="border-b border-gray-700">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full p-6 text-left hover:bg-gray-700/30 transition-colors flex items-center justify-between"
        >
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              🧭 TravelAI Assistant
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Your intelligent travel companion for visa advice and travel planning
            </p>
          </div>
          
          {/* Collapse/Expand Icon */}
          <svg 
            className={`w-6 h-6 text-gray-400 transform transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`} 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {/* Collapsible Content */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isCollapsed ? 'max-h-0' : 'max-h-[600px]'}`}>
        {/* Messages Display */}
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : msg.adviceData 
                    ? getCategoryStyle(msg.adviceData.category)
                    : 'bg-gray-700 border border-gray-600'
              } rounded-lg p-3 shadow-sm border`}>
                
                {/* Agent Name for Travel Advice */}
                {msg.role === 'assistant' && msg.adviceData && (
                  <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-gray-300">
                    <span>{getCategoryIcon(msg.adviceData.category)}</span>
                    <span>{msg.adviceData.agent_name}</span>
                  </div>
                )}
                
                {/* Message Content */}
                <div className={`${msg.role === 'user' ? 'text-white' : 'text-gray-200'} whitespace-pre-wrap`}>
                  {msg.content}
                </div>

              </div>
            </div>
          ))}
        
          {/* Loading States */}
          {chatLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-700 text-gray-200 rounded-lg p-4 border border-gray-600">
                <div className="flex items-center gap-3 mb-2">
                  <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  <span className="font-medium">
                    TravelAI is analyzing your query...
                  </span>
                </div>
                <p className="text-gray-400 text-sm ml-8">This may take a few moments</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Input Area */}
        <div className="p-4 border-t border-gray-700">
          <form onSubmit={handleChatSubmit} className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask about visas, travel routes, restaurants, regulations..."
              className="flex-1 p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
              disabled={chatLoading}
            />
            <button
              type="submit"
              disabled={chatLoading || !chatInput.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {chatLoading ? '⏳' : 'Send'}
            </button>
          </form>
          
          <div className="mt-2 text-xs text-gray-500 text-center">
            Get expert advice on visas, regulations, and travel planning
          </div>
        </div>
      </div>
    </div>
  );
}