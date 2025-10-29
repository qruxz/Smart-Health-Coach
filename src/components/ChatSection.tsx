import { useState, useEffect, useRef } from "react";
import { Send, Activity, Calendar, Apple, Dumbbell, Moon, Heart, TrendingUp, Clock, Target, Zap, ChevronDown, User, Settings, Sparkles, BarChart3, Plus } from "lucide-react";

// API Configuration
const API_BASE_URL = 'http://localhost:5001';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  category?: string;
}

interface HealthMetric {
  label: string;
  value: string;
  icon: any;
  color: string;
  type: string;
}

interface UserProfile {
  profile: {
    name: string | null;
    fitness_level: string | null;
    health_goals: string[];
  };
}

const SmartHealthCoach = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your **Smart Health Coach** 🌟\n\nI can help you with:\n\n✅ **Personalized meal plans** - Custom nutrition based on your goals\n✅ **Workout schedules** - Tailored fitness routines\n✅ **Health tracking** - Monitor your progress\n✅ **Sleep optimization** - Better rest and recovery\n✅ **Wellness goals** - Achieve your health targets\n✅ **Progress analytics** - Data-driven insights\n\nWhat would you like to work on today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showMetrics, setShowMetrics] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const healthMetrics: HealthMetric[] = [
    { label: "Steps Today", value: "8,234", icon: Activity, color: "from-emerald-500 to-teal-600", type: "steps" },
    { label: "Calories", value: "1,850", icon: Zap, color: "from-orange-500 to-red-600", type: "calories" },
    { label: "Water", value: "6/8", icon: Heart, color: "from-blue-500 to-cyan-600", type: "water" },
    { label: "Sleep", value: "7.5h", icon: Moon, color: "from-purple-500 to-indigo-600", type: "sleep" },
  ];

  const categories = [
    { id: "nutrition", name: "Nutrition", icon: Apple, color: "bg-gradient-to-br from-green-500 to-emerald-600" },
    { id: "fitness", name: "Fitness", icon: Dumbbell, color: "bg-gradient-to-br from-orange-500 to-red-600" },
    { id: "schedule", name: "Schedule", icon: Calendar, color: "bg-gradient-to-br from-blue-500 to-cyan-600" },
    { id: "wellness", name: "Wellness", icon: Heart, color: "bg-gradient-to-br from-pink-500 to-rose-600" },
    { id: "goals", name: "Goals", icon: Target, color: "bg-gradient-to-br from-purple-500 to-indigo-600" },
    { id: "analytics", name: "Analytics", icon: TrendingUp, color: "bg-gradient-to-br from-yellow-500 to-amber-600" },
  ];

  const quickActions = [
    { text: "Create today's meal plan", category: "nutrition", icon: "🥗" },
    { text: "Design my 30-min workout", category: "fitness", icon: "💪" },
    { text: "Show my weekly progress", category: "analytics", icon: "📊" },
    { text: "Set a weight loss goal", category: "goals", icon: "🎯" },
    { text: "Improve my sleep quality", category: "wellness", icon: "😴" },
    { text: "Plan this week's schedule", category: "schedule", icon: "📅" },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Generate or retrieve session ID
    const storedSessionId = localStorage.getItem('health_coach_session');
    if (storedSessionId) {
      setSessionId(storedSessionId);
    } else {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('health_coach_session', newSessionId);
      setSessionId(newSessionId);
    }
    
    // Load user profile
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        headers: {
          'X-Session-ID': sessionId
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.profile);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const sendMessage = async (messageText: string, category: string | null) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': sessionId
        },
        body: JSON.stringify({ 
          message: messageText,
          category: category 
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      return {
        response: 'I\'m having trouble connecting right now, but I\'m here to help! 💪 Try again in a moment.',
        success: false,
      };
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
      category: selectedCategory || undefined
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageToSend = inputValue;
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await sendMessage(messageToSend, selectedCategory);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.response || "I'm here to help! Could you provide more details?",
        isUser: false,
        timestamp: new Date(),
        category: response.category
      };
      setMessages((prev) => [...prev, aiMessage]);
      
      // Update session ID if provided
      if (response.session_id) {
        setSessionId(response.session_id);
        localStorage.setItem('health_coach_session', response.session_id);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm here for you! Let's try that again. 🌟",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: string, category: string) => {
    setSelectedCategory(category);
    setInputValue(action);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const logMetric = async (type: string, value: string, unit: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/metrics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': sessionId
        },
        body: JSON.stringify({ type, value, unit })
      });
    } catch (error) {
      console.error('Failed to log metric:', error);
    }
  };

  const MessageBubble = ({ message }: { message: Message }) => {
    const formatText = (text: string) => {
      return text.split('\n').map((line, i) => {
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-cyan-200">$1</strong>');
        line = line.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
        line = line.replace(/`(.*?)`/g, '<code class="bg-slate-800 px-1 py-0.5 rounded text-xs">$1</code>');
        
        // Handle bullet points
        if (line.trim().startsWith('- ') || line.trim().startsWith('• ') || line.trim().startsWith('✅')) {
          line = '<span class="inline-block mr-2">•</span>' + line.replace(/^[-•✅]\s*/, '');
        }
        
        return <div key={i} dangerouslySetInnerHTML={{ __html: line }} className={i > 0 ? 'mt-1' : ''} />;
      });
    };

    return (
      <div className={`flex ${message.isUser ? "justify-end" : "justify-start"} mb-4 animate-fade-in`}>
        <div
          className={`max-w-xs lg:max-w-md px-5 py-4 rounded-3xl backdrop-blur-md transition-all duration-300 hover:scale-[1.02] ${
            message.isUser
              ? "bg-gradient-to-br from-cyan-500/30 to-blue-500/30 text-white border border-cyan-400/30 shadow-lg shadow-cyan-500/20"
              : "bg-gradient-to-br from-slate-800/60 to-slate-900/60 text-slate-100 border border-slate-700/50 shadow-xl"
          }`}
        >
          <div className="prose prose-sm prose-invert max-w-none leading-relaxed text-sm">
            {formatText(message.text)}
          </div>
          <p className={`text-xs mt-3 flex items-center gap-1 ${message.isUser ? "text-cyan-200/70" : "text-slate-400"}`}>
            <Clock size={12} />
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl h-[90vh] bg-slate-900/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 p-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '32px 32px'
            }}></div>
          </div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg transform hover:rotate-6 transition-transform">
                <Activity className="text-cyan-600" size={28} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  Smart Health Coach
                  <Sparkles size={20} className="text-yellow-300 animate-pulse" />
                </h1>
                <p className="text-cyan-100 text-sm flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  AI-Powered • Personalized for You
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="text-white hover:bg-white/10 p-2 rounded-xl transition-all hover:scale-110"
                title="Profile"
              >
                <User size={20} />
              </button>
              <button
                onClick={() => setShowMetrics(!showMetrics)}
                className="text-white hover:bg-white/10 p-2 rounded-xl transition-all hover:scale-110"
                title="Toggle metrics"
              >
                <ChevronDown size={20} className={`transform transition-transform ${showMetrics ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Health Metrics Dashboard */}
        {showMetrics && (
          <div className="bg-slate-800/50 p-4 border-b border-slate-700/50 animate-slide-down">
            <div className="grid grid-cols-4 gap-3">
              {healthMetrics.map((metric, index) => {
                const Icon = metric.icon;
                return (
                  <div
                    key={index}
                    onClick={() => logMetric(metric.type, metric.value, 'unit')}
                    className={`bg-gradient-to-br ${metric.color} p-4 rounded-2xl shadow-lg hover:scale-105 transition-all cursor-pointer group`}
                  >
                    <Icon size={20} className="text-white mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-white/80 text-xs font-medium">{metric.label}</p>
                    <p className="text-white text-xl font-bold">{metric.value}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Category Pills */}
        <div className="bg-slate-800/30 p-4 border-b border-slate-700/50">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all shadow-lg hover:scale-105 ${
                    selectedCategory === category.id
                      ? `${category.color} text-white scale-105`
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Icon size={16} />
                  <span className="text-sm font-medium">{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Messages Area */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-6 space-y-2 custom-scrollbar"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)',
          }}
        >
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {isLoading && (
            <div className="flex justify-start mb-4 animate-fade-in">
              <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 px-5 py-4 rounded-3xl border border-slate-700/50 shadow-xl">
                <div className="flex space-x-2 items-center">
                  <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full animate-bounce"></div>
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <span className="text-slate-400 text-sm ml-2">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {messages.length <= 2 && (
          <div className="p-4 bg-slate-800/30 border-t border-slate-700/50 animate-slide-up">
            <p className="text-slate-400 text-xs mb-3 font-medium flex items-center gap-2">
              <Sparkles size={14} /> Quick Actions
            </p>
            <div className="grid grid-cols-3 gap-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action.text, action.category)}
                  disabled={isLoading}
                  className="text-left p-3 bg-gradient-to-br from-slate-700/50 to-slate-800/50 hover:from-slate-600/50 hover:to-slate-700/50 text-slate-200 rounded-xl transition-all border border-slate-600/30 hover:border-cyan-500/30 hover:scale-105 shadow-lg disabled:opacity-50 group"
                >
                  <div className="text-xl mb-1 group-hover:scale-110 transition-transform inline-block">{action.icon}</div>
                  <div className="text-xs leading-tight">{action.text}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-6 bg-slate-800/50 border-t border-slate-700/50">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your health journey..."
              disabled={isLoading}
              className="flex-1 px-6 py-4 bg-slate-900/50 border border-slate-700 rounded-2xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-white placeholder-slate-500 text-sm transition-all shadow-inner"
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-700 disabled:to-slate-700 text-white p-4 rounded-2xl transition-all shadow-lg hover:shadow-cyan-500/20 hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </button>
          </div>
          <p className="text-slate-500 text-xs mt-3 text-center">
            Powered by Groq AI • Your health data is private and secure 🔒
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 0.7);
        }
        .scrollbar-thin::-webkit-scrollbar {
          height: 4px;
        }
        .scrollbar-thumb-slate-700::-webkit-scrollbar-thumb {
          background: rgb(51, 65, 85);
        }
      `}</style>
    </div>
  );
};

export default SmartHealthCoach;