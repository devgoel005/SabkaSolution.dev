import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Sparkles, Bot, X, User, HelpCircle, PhoneCall, CheckCircle2, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const HELPLINE_PRESETS = [
  { text: 'Show National Helpline Directory', icon: <PhoneCall size={13} className="text-[#FF6B00]" /> },
  { text: 'How do I pass the Image Security Check?', icon: <ShieldCheck size={13} className="text-[#059669]" /> },
  { text: 'My report is failing, what should I do?', icon: <AlertCircle size={13} className="text-red-500" /> },
  { text: 'What is Sevak and how does it help?', icon: <HelpCircle size={13} className="text-[#3b82f6]" /> }
];

interface SevakChatbotProps {
  isEmbedded?: boolean;
}

export const SevakChatbot: React.FC<SevakChatbotProps> = ({ isEmbedded = false }) => {
  const { t } = useTranslation();
  const { user, showToast } = useApp();
  const [isOpen, setIsOpen] = useState(isEmbedded ? true : false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `🇮🇳 Namaste! I am **Sewak**, your dedicated Citizens Helpline & Support Assistant.

I am here to guide you through any issues with the application and provide immediate assistance. I specialize in:
- 📞 **Helpline Directory:** Instant contact details for MCD, BBMP, BMC, PWD, and Emergency state services.
- 🛡️ **Report Authenticity:** Tips to ensure your civic hazard reports pass our advanced 100% accuracy security checks (anti-AI fake image checks).
- ⚙️ **Application Support:** Resolving problems regarding Aadhaar verification, OTPs, or image upload errors.

How can I serve you today?`,
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
  }, [messages.length, isOpen]);

  useEffect(() => {
    const handleOpenEvent = () => {
      setIsOpen(true);
      setUnreadCount(0);
    };
    window.addEventListener('open-sevak-chatbot', handleOpenEvent);
    return () => {
      window.removeEventListener('open-sevak-chatbot', handleOpenEvent);
    };
  }, []);

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
      const response = await fetch('/api/sevak/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, {
          id: `sevak-${Date.now()}`,
          role: 'assistant',
          content: data.content,
          timestamp: new Date()
        }]);
      } else {
        throw new Error('Sevak API error');
      }
    } catch (error) {
      console.error('Sevak Chat Error:', error);
      // Beautiful high-fidelity fallback matching the helpline guidelines
      let fallbackText = '';
      const query = textToSend.toLowerCase();

      if (query.includes('helpline') || query.includes('directory') || query.includes('phone') || query.includes('number') || query.includes('contact')) {
        fallbackText = `📞 **Official Indian Civic Grievance Helpline Center Directory:**

- **National Emergency Support:** 112 (Police, Fire, Ambulance)
- **National Consumer Helpline:** 1915
- **Swachh Bharat Clean City Helpline:** 1969
- **anti-Corruption Vigilance (Lokayukta):** 1064
- **NHAI National Highway Emergency Helpline:** 1033
- **Bengaluru BBMP Grievances:** 080-22221188 / 080-22660000
- **Delhi MCD Central Control Room:** 1266 / 011-23212700
- **Mumbai BMC Disaster & Grievance Helpline:** 1916 / 022-22694727
- **UP PWD Highway Complaints:** 1800-180-5315

You can call these municipal agencies directly to get immediate physical relief for high-severity hazards in your ward.`;
      } else if (query.includes('security') || query.includes('pass') || query.includes('fake') || query.includes('image') || query.includes('verification') || query.includes('authenticity')) {
        fallbackText = `🛡️ **Guidelines for 100% Authentic Civic Submissions:**

To restrict fake entries and ensure perfect accuracy in results, our **AI Authenticity Agent** performs the following strict security validations on all reported images:
1. **No AI-Generated / Fake Images:** The agent runs pixel-density & noise-ratio analysis to reject computer-synthesized, modified, or generative images.
2. **Live Environmental Context:** Images must have verifiable perspective markers (natural road asphalt textures, sunlight shadows, or concrete depth).
3. **Hyperlocal GPS Check:** Ensure that your device has location permissions enabled so we can cross-reference the photo's EXIF coordinates with your selected ward.
4. **No Screenshots/Dupes:** Do not upload internet screenshots. Take a clear, real-time physical photo of the issue directly with your smartphone.

*Tip: Standardize your reports by capturing photos from a 45-degree angle under clear daylight.*`;
      } else if (query.includes('fail') || query.includes('error') || query.includes('upload') || query.includes('problem') || query.includes('cannot')) {
        fallbackText = `⚙️ **Troubleshooting App & Submission Issues:**

If you are facing problems filing a report or getting verification errors, please follow these basic guidelines:
1. **Mandatory Details Verification:** Ensure that you completed your name, state, city, and ward under your profile. Reports cannot be registered without authenticated civic ownership.
2. **File Size & Format:** Make sure your photo is in JPEG or PNG format and is under 5MB.
3. **Camera Permissions:** Ensure you gave browser permissions to access your camera and location.
4. **Relogin Check:** Try signing out and signing back in through Aadhaar DigiLocker. This refreshes your secure cryptographic token session.

Need further assistance? Call the **SabkaSolution National Tech Support** at **1800-111-2005** (toll-free).`;
      } else {
        fallbackText = `I have received your request. As **Sewak, the SabkaSolution Citizen Helpline**, I am strictly trained on municipal codes and troubleshooting steps.

Here is a quick helpline checklist for basic areas:
- 🛠️ **Road / Pothole Damage:** Contact local Ward Executive Engineer or report with high-contrast day photos.
- 🗑️ **Waste Management:** MCD/BBMP/BMC sanitation trucks are dispatched daily. Dial **1969** for garbage piling complaints.
- 💡 **Streetlight out:** PWD electrical control answers to local substation desks.
- 💬 **Need App Support?** Double check that your profile credentials (name, state, city, ward division) are fully filled out to pass security checks.

Please let me know if you need specific phone numbers, or if you want me to outline how to file a proper Right To Information (RTI) application!`;
      }

      setMessages(prev => [...prev, {
        id: `sevak-${Date.now()}`,
        role: 'assistant',
        content: fallbackText,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePresetClick = (text: string) => {
    handleSendMessage(text);
  };

  if (isEmbedded) {
    return (
      <div 
        className="w-full h-[380px] bg-slate-950 border border-slate-800/80 rounded-2xl flex flex-col justify-between overflow-hidden shadow-2xl relative font-sans"
        id="sevak-chat-drawer-embedded"
      >
        {/* Header */}
        <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-inner flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-white animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-xs tracking-tight text-white flex items-center gap-1">
                Sewak AI <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1 py-0.25 rounded-full font-bold">ASSISTANT</span>
              </h3>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-grow p-3 overflow-y-auto space-y-3" style={{ scrollbarWidth: 'thin' }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2 max-w-[90%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-[#FF6B00] text-white' : 'bg-slate-800 text-emerald-400'}`}>
                {msg.role === 'user' ? <User size={10} /> : <Bot size={10} />}
              </div>

              {/* Bubble */}
              <div className="flex flex-col gap-0.5">
                <div
                  className={`rounded-xl p-2 text-[11px] font-sans leading-normal whitespace-pre-wrap shadow-sm border ${
                    msg.role === 'user'
                      ? 'bg-[#FF6B00] text-white border-[#FF6B00]/40 rounded-tr-none'
                      : 'bg-slate-900 text-slate-200 border-slate-800 rounded-tl-none'
                  }`}
                >
                  {msg.content}
                </div>
                <span className={`text-[8px] text-slate-500 font-medium ${msg.role === 'user' ? 'text-right' : ''}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2 max-w-[80%]">
              <div className="w-6 h-6 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center shrink-0">
                <Bot size={10} />
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl rounded-tl-none p-2 flex items-center gap-1 shadow-sm">
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Form Input Footer */}
        <div className="p-2 border-t border-slate-800 bg-slate-950/60">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputValue);
            }}
            className="flex items-center gap-1.5"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type support request..."
              className="flex-grow bg-slate-900 border border-slate-800 rounded-full px-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all font-sans"
              id="sevak-chat-input-embedded"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="p-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0 cursor-pointer shadow-md active:scale-95"
            >
              <Send size={12} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Floating Sparkly Button Trigger for Sewak */}
      <div className="fixed bottom-8 right-8 z-[99]" id="sevak-trigger-container">
        <button
          onClick={handleOpen}
          className="relative group rounded-2xl bg-slate-950 text-white shadow-2xl border-2 border-emerald-500/50 transition-all duration-300 hover:scale-105 active:scale-95 hover:border-emerald-400 focus:outline-none cursor-pointer flex flex-col items-center justify-center gap-1.5 overflow-visible"
          style={{
            boxShadow: '0 16px 40px rgba(16, 185, 129, 0.3), 0 0 30px rgba(255, 107, 0, 0.15)'
          }}
          id="sevak-trigger-btn"
        >
          {/* Animated Pulsing Background Aura Wave behind the button */}
          <span className="absolute -inset-1.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-[#FF6B00] to-indigo-600 opacity-60 blur-lg transition-opacity duration-500 group-hover:opacity-100 animate-pulse -z-10" />
          <span className="absolute inset-0 rounded-2xl bg-slate-950 -z-5" />
          
          <div className="flex flex-col items-center justify-center gap-1 relative z-10 text-center">
            <Bot className="h-6 w-6 text-emerald-400 animate-pulse" />
            <span className="text-[10px] font-black tracking-widest text-slate-100 uppercase select-none flex flex-col items-center leading-tight">
              <span className="text-emerald-400">Sewak</span>
              <span className="text-[8px] text-slate-400 font-medium">Assistant</span>
            </span>
          </div>

          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white rounded-full text-[10px] font-extrabold flex items-center justify-center border-2 border-slate-950 animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Slide-out Glassmorphic Chat Panel */}
      {isOpen && (
        <div 
          className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-slate-900/95 text-slate-100 border-l border-slate-800 shadow-2xl z-[999] flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300 backdrop-blur-xl"
          id="sevak-chat-drawer"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-inner flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-tight text-white flex items-center gap-1">
                  Sewak AI <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full font-bold">ASSISTANT</span>
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">Citizen support & authenticity officer</p>
              </div>
            </div>

            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              id="sevak-close-btn"
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
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-[#FF6B00] text-white' : 'bg-slate-800 text-emerald-400'}`}>
                  {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>

                {/* Bubble */}
                <div className="flex flex-col gap-1">
                  <span className={`text-[10px] font-bold text-slate-400 px-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {msg.role === 'user' ? 'You' : 'Sewak AI'}
                  </span>
                  <div
                    className={`rounded-2xl p-3.5 text-xs font-sans leading-relaxed whitespace-pre-wrap shadow-sm border ${
                      msg.role === 'user'
                        ? 'bg-[#FF6B00] text-white border-[#FF6B00]/40 rounded-tr-none'
                        : 'bg-slate-950/80 text-slate-200 border-slate-800 rounded-tl-none'
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
                <div className="w-8 h-8 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center shrink-0">
                  <Bot size={14} />
                </div>
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl rounded-tl-none p-4 flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Prompt Suggestions */}
          <div className="px-4 pb-3 flex flex-col gap-1.5" id="sevak-presets">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider px-1">Common Support Requests</span>
            <div className="flex flex-wrap gap-1.5">
              {HELPLINE_PRESETS.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePresetClick(sug.text)}
                  className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-300 bg-slate-800/40 hover:bg-emerald-500/10 hover:text-emerald-400 border border-slate-800 hover:border-emerald-500/30 rounded-lg px-2.5 py-1.5 transition-all text-left cursor-pointer"
                >
                  {sug.icon}
                  <span>{sug.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form Input Footer */}
          <div className="p-3.5 border-t border-slate-800 bg-slate-950/60 shadow-[0_-4px_15px_rgba(0,0,0,0.3)]">
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
                placeholder="Type a support request..."
                className="flex-grow bg-slate-900 border border-slate-800 rounded-full px-5 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all font-sans"
                id="sevak-chat-input"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="p-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0 cursor-pointer shadow-lg hover:scale-105 active:scale-95"
                id="sevak-send-btn"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
