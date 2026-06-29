import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Sparkles, X, User, Bot, CornerDownRight, Check, HelpCircle, FileText, SendHorizonal } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const PRESET_SUGGESTIONS = [
  { text: 'How to file an RTI for water log?', icon: <FileText size={13} className="text-amber-500" /> },
  { text: 'Which body handles garbage cleaning?', icon: <HelpCircle size={13} className="text-[#06D6A0]" /> },
  { text: 'Draft a complaint tweet to PWD', icon: <Send size={13} className="text-cyan-500" /> },
  { text: 'How do citizens force a road repair?', icon: <Sparkles size={13} className="text-indigo-500" /> }
];

export const AICopilot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Namaste! I am your **SabkaSolution Sewak Copilot** 🇮🇳. 

I am specialized in Indian municipal laws, ward budgets, and social mobilization. I can help you:
- Draft formal grievances to municipal corporations (**MCD, BBMP, BMC, PWD**).
- Format and write **RTI applications** under the Right to Information Act, 2005.
- Compose viral social media tweets to grab commissioners' attention.
- Plan community campaigns with other local residents.

What civic issue are you facing in your neighborhood today?`,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (!isOpen && messages.length > 1) {
      setUnreadCount(prev => prev + 1);
    }
  }, [messages.length]);

  const handleOpen = () => {
    setIsOpen(true);
    setUnreadCount(0);
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.content,
          timestamp: new Date()
        }]);
      } else {
        throw new Error('Chat API returned an error');
      }
    } catch (error) {
      console.error('Copilot Chat Error:', error);
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ Sorry, my connectivity with the ward central server is currently intermittent. Please retry or ask me another question!`,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (text: string) => {
    handleSendMessage(text);
  };

  return (
    <>
      {/* Floating Sparkly Button Trigger */}
      <div className="fixed bottom-6 left-6 z-[99]" id="ai-copilot-trigger-container">
        <button
          onClick={handleOpen}
          className="relative group p-4 rounded-full bg-slate-950 text-white shadow-2xl border border-slate-800 transition-all duration-300 hover:scale-105 active:scale-95 hover:border-[#FF6B00]/40 focus:outline-none cursor-pointer"
          style={{
            boxShadow: '0 12px 30px rgba(255, 107, 0, 0.15)'
          }}
          id="ai-copilot-trigger"
        >
          {/* Animated Glow Border */}
          <span className="absolute inset-0 rounded-full bg-gradient-to-r from-[#FF6B00] via-purple-600 to-cyan-500 opacity-50 group-hover:opacity-100 blur-md transition-opacity -z-10" />
          
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" />
            <span className="text-xs font-bold tracking-wide pr-1 hidden sm:inline">✨ Sewak Copilot</span>
          </div>

          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF6B00] text-white rounded-full text-[10px] font-extrabold flex items-center justify-center border-2 border-slate-950 animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Slide-out Glassmorphic Chat Panel */}
      {isOpen && (
        <div 
          className="fixed inset-y-0 left-0 w-full sm:w-[450px] bg-slate-900/95 text-slate-100 border-r border-slate-800 shadow-2xl z-[999] flex flex-col justify-between overflow-hidden animate-in slide-in-from-left duration-300 backdrop-blur-xl"
          id="ai-copilot-drawer"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shadow-[0_4px_20px_rgba(255,107,0,0.1)]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-br from-[#FF6B00] to-indigo-600 shadow-[0_0_15px_rgba(255,107,0,0.5)] flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-tight text-white flex items-center gap-1">
                  Sewak Copilot <span className="text-[10px] bg-[#FF6B00]/20 text-[#FF6B00] px-1.5 py-0.5 rounded-full font-bold shadow-sm">GEMINI</span>
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">Hyperlocal legal & bylaws assistant</p>
              </div>
            </div>

            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-grow p-4 overflow-y-auto space-y-4" style={{ scrollbarWidth: 'thin' }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-lg ${msg.role === 'user' ? 'bg-[#FF6B00] text-white shadow-[#FF6B00]/10' : 'bg-slate-800 text-amber-400 shadow-slate-950/50'}`}>
                  {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>

                {/* Bubble */}
                <div className="flex flex-col gap-1">
                  <span className={`text-[10px] font-bold text-slate-400 px-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {msg.role === 'user' ? 'You' : 'Sewak Copilot'}
                  </span>
                  <div
                    className={`rounded-2xl p-3.5 text-xs font-sans leading-relaxed whitespace-pre-wrap shadow-md border ${
                      msg.role === 'user'
                        ? 'bg-[#FF6B00] text-white border-[#FF6B00]/40 rounded-tr-none shadow-[#FF6B00]/10'
                        : 'bg-slate-950/80 text-slate-200 border-slate-800 rounded-tl-none shadow-black/40'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className={`text-[9px] text-slate-500 font-medium ${msg.role === 'user' ? 'text-right' : ''}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {/* AI thinking bouncing dots */}
            {isLoading && (
              <div className="flex gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center shrink-0 shadow-lg shadow-slate-950/50">
                  <Bot size={14} />
                </div>
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl rounded-tl-none p-4 flex items-center gap-1.5 shadow-md shadow-black/40">
                  <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Prompt Suggestions (Only if messages length is short) */}
          {messages.length < 3 && (
            <div className="px-4 pb-3 flex flex-wrap gap-1.5" id="copilot-presets">
              {PRESET_SUGGESTIONS.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(sug.text)}
                  className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-300 bg-slate-800/40 hover:bg-[#FF6B00]/10 hover:text-[#FF6B00] border border-slate-800 hover:border-[#FF6B00]/30 rounded-lg px-2.5 py-1.5 transition-all text-left cursor-pointer"
                >
                  {sug.icon}
                  <span>{sug.text}</span>
                </button>
              ))}
            </div>
          )}

          {/* Form Input Footer */}
          <div className="p-3 border-t border-slate-800 bg-slate-950/40">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputValue);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about RTIs, bylaws, tweet drafts..."
                className="flex-grow bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#FF6B00] transition-colors font-sans"
                id="copilot-chat-input"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="p-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#CC5500] text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0 cursor-pointer"
                id="copilot-send-btn"
              >
                <SendHorizonal size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
