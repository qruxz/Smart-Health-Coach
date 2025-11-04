import { useState, useEffect } from "react";
import { 
  Home, MessageSquare, Activity, Target, User, TrendingUp,
  Send, Bot, Dumbbell, Apple, Calendar, Heart, Brain,
  Zap, Award, Clock, CheckCircle, X, Menu, LogOut,
  Sparkles, BarChart3, Plus, ChevronRight, Settings
} from "lucide-react";

const API_URL = "http://localhost:5001/api";

interface User {
  id: string;
  email: string;
  username: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  category?: string;
  timestamp: string;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  progress: number;
  target_date: string;
  completed: boolean;
}

export default function HealthCoachApp() {
  const [token, setToken] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Check if we have a token in memory (session-based for artifact)
    if (token) {
      fetchUser();
    }
  }, [token]);
  
  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setUser(await res.json());
      } else {
        logout();
      }
    } catch {
      logout();
    }
  };
  
  const logout = () => {
    setToken("");
    setUser(null);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">💜</div>
          <p className="text-purple-600 font-medium">Loading your health coach...</p>
        </div>
      </div>
    );
  }
  
  if (!token || !user) {
    return <AuthScreen onAuthSuccess={(newToken) => setToken(newToken)} setLoading={setLoading} />;
  }
  
  return <MainApp user={user} token={token} onLogout={logout} />;
}

function AuthScreen({ onAuthSuccess, setLoading }: any) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const handleSubmit = async () => {
    if (!email || !password || (mode === 'register' && !username)) {
      setError('Please fill all fields');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      if (mode === 'register') {
        const regRes = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, username, password })
        });
        
        if (!regRes.ok) {
          const data = await regRes.json();
          throw new Error(data.detail || 'Registration failed');
        }
      }
      
      const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (!loginRes.ok) {
        const data = await loginRes.json();
        throw new Error(data.detail || 'Login failed');
      }
      
      const data = await loginRes.json();
      onAuthSuccess(data.access_token);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-purple-100">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Heart className="text-white" size={36} />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Health Coach AI
            </h1>
            <p className="text-gray-600">Your personal wellness companion</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                placeholder="you@example.com"
              />
            </div>
            
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="johndoe"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                placeholder="••••••"
              />
            </div>
            
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}
            
            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition shadow-lg"
            >
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </div>
          
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError('');
              }}
              className="text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MainApp({ user, token, onLogout }: { user: User; token: string; onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<'chat' | 'goals' | 'analytics' | 'profile'>('chat');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-purple-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <Heart className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Health Coach AI
                </h1>
                <p className="text-xs text-gray-600">Welcome back, {user.username}!</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-2 hover:bg-purple-50 rounded-lg transition"
              title="Logout"
            >
              <LogOut size={18} className="text-purple-600" />
            </button>
          </div>
        </div>
      </header>
      
      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'chat' && <ChatView token={token} />}
        {activeTab === 'goals' && <GoalsView token={token} />}
        {activeTab === 'analytics' && <AnalyticsView token={token} />}
        {activeTab === 'profile' && <ProfileView token={token} user={user} />}
      </main>
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-purple-100 z-50">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex flex-col items-center gap-1 py-2 rounded-xl transition ${
                activeTab === 'chat' ? 'bg-purple-50 text-purple-600' : 'text-gray-600'
              }`}
            >
              <MessageSquare size={20} />
              <span className="text-xs font-medium">Chat</span>
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={`flex flex-col items-center gap-1 py-2 rounded-xl transition ${
                activeTab === 'goals' ? 'bg-purple-50 text-purple-600' : 'text-gray-600'
              }`}
            >
              <Target size={20} />
              <span className="text-xs font-medium">Goals</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex flex-col items-center gap-1 py-2 rounded-xl transition ${
                activeTab === 'analytics' ? 'bg-purple-50 text-purple-600' : 'text-gray-600'
              }`}
            >
              <TrendingUp size={20} />
              <span className="text-xs font-medium">Stats</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col items-center gap-1 py-2 rounded-xl transition ${
                activeTab === 'profile' ? 'bg-purple-50 text-purple-600' : 'text-gray-600'
              }`}
            >
              <User size={20} />
              <span className="text-xs font-medium">Profile</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}

function ChatView({ token }: { token: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const categories = [
    { id: 'nutrition', name: 'Nutrition', icon: Apple, color: 'from-green-500 to-emerald-600' },
    { id: 'fitness', name: 'Fitness', icon: Dumbbell, color: 'from-purple-500 to-indigo-600' },
    { id: 'wellness', name: 'Wellness', icon: Heart, color: 'from-pink-500 to-rose-600' },
    { id: 'schedule', name: 'Schedule', icon: Calendar, color: 'from-blue-500 to-cyan-600' },
  ];
  
  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: input,
          category: selectedCategory
        })
      });
      
      const data = await res.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        category: data.category,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {categories.map(cat => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
              className={`p-4 rounded-xl border-2 transition ${
                selectedCategory === cat.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-purple-200 bg-white hover:border-purple-300'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${cat.color} flex items-center justify-center mx-auto mb-2`}>
                <Icon size={20} className="text-white" />
              </div>
              <p className="text-sm font-medium text-gray-800">{cat.name}</p>
            </button>
          );
        })}
      </div>
      
      {/* Chat Messages */}
      <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-4 min-h-[400px] max-h-[500px] overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4">
              <Sparkles className="text-white" size={28} />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Start Your Health Journey</h3>
            <p className="text-gray-600 text-sm max-w-md">
              Ask me anything about nutrition, fitness, wellness, or get personalized workout and meal plans!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <Bot size={16} className="text-white" />
                  </div>
                )}
                <div className={`max-w-[80%] p-3 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-purple-50 text-gray-800'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="bg-purple-50 p-3 rounded-2xl">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Input */}
      <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about workouts, meals, wellness..."
            className="flex-1 px-4 py-2 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function GoalsView({ token }: { token: string }) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', description: '', category: 'fitness', target_date: '' });
  
  useEffect(() => {
    fetchGoals();
  }, []);
  
  const fetchGoals = async () => {
    try {
      const res = await fetch(`${API_URL}/goals`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGoals(data.goals || []);
      }
    } catch {}
  };
  
  const addGoal = async () => {
    if (!newGoal.title || !newGoal.target_date) return;
    
    try {
      await fetch(`${API_URL}/goals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newGoal)
      });
      
      setNewGoal({ title: '', description: '', category: 'fitness', target_date: '' });
      setShowAddGoal(false);
      fetchGoals();
    } catch {}
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">My Goals</h2>
        <button
          onClick={() => setShowAddGoal(!showAddGoal)}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition shadow-lg flex items-center gap-2"
        >
          <Plus size={18} />
          Add Goal
        </button>
      </div>
      
      {showAddGoal && (
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-6">
          <h3 className="font-bold text-gray-800 mb-4">Create New Goal</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Goal title"
              value={newGoal.title}
              onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
              className="w-full px-4 py-2 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-500"
            />
            <textarea
              placeholder="Description"
              value={newGoal.description}
              onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
              className="w-full px-4 py-2 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-500"
              rows={3}
            />
            <div className="grid grid-cols-2 gap-4">
              <select
                value={newGoal.category}
                onChange={(e) => setNewGoal({...newGoal, category: e.target.value})}
                className="px-4 py-2 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-500"
              >
                <option value="fitness">Fitness</option>
                <option value="nutrition">Nutrition</option>
                <option value="wellness">Wellness</option>
                <option value="weight">Weight</option>
              </select>
              <input
                type="date"
                value={newGoal.target_date}
                onChange={(e) => setNewGoal({...newGoal, target_date: e.target.value})}
                className="px-4 py-2 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={addGoal}
                className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition"
              >
                Create Goal
              </button>
              <button
                onClick={() => setShowAddGoal(false)}
                className="px-6 py-2 border border-purple-200 text-gray-600 rounded-xl hover:bg-purple-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid gap-4">
        {goals.map(goal => (
          <div key={goal.id} className="bg-white rounded-2xl shadow-sm border border-purple-100 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 mb-1">{goal.title}</h3>
                <p className="text-sm text-gray-600">{goal.description}</p>
              </div>
              {goal.completed && (
                <CheckCircle size={20} className="text-green-500" />
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium text-purple-600">{goal.progress}%</span>
              </div>
              <div className="w-full bg-purple-100 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
              
              <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full">{goal.category}</span>
                <span>Target: {new Date(goal.target_date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
        
        {goals.length === 0 && !showAddGoal && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <p className="text-gray-600">No goals yet. Create your first goal!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AnalyticsView({ token }: { token: string }) {
  const [analytics, setAnalytics] = useState<any>(null);
  
  useEffect(() => {
    fetchAnalytics();
  }, []);
  
  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${API_URL}/analytics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data.analytics);
      }
    } catch {}
  };
  
  if (!analytics) {
    return <div className="text-center py-12 text-gray-600">Loading...</div>;
  }
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Your Progress</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <Activity size={24} className="mb-3" />
          <div className="text-3xl font-bold mb-1">{analytics.total_workouts}</div>
          <div className="text-sm opacity-90">Total Workouts</div>
        </div>
        
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-6 text-white">
          <Apple size={24} className="mb-3" />
          <div className="text-3xl font-bold mb-1">{analytics.total_meals_logged}</div>
          <div className="text-sm opacity-90">Meals Logged</div>
        </div>
        
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white">
          <Target size={24} className="mb-3" />
          <div className="text-3xl font-bold mb-1">{analytics.active_goals}</div>
          <div className="text-sm opacity-90">Active Goals</div>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white">
          <Award size={24} className="mb-3" />
          <div className="text-3xl font-bold mb-1">{analytics.completed_goals}</div>
          <div className="text-sm opacity-90">Completed</div>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-6">
        <h3 className="font-bold text-gray-800 mb-4">Activity Overview</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Days Active</span>
            <span className="font-bold text-purple-600">{analytics.days_active}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Health Metrics Logged</span>
            <span className="font-bold text-purple-600">{analytics.metrics_logged}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileView({ token, user }: { token: string; user: User }) {
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  
  useEffect(() => {
    fetchProfile();
  }, []);
  
  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setProfile(await res.json());
      }
    } catch {}
  };
  
  const updateProfile = async (updates: any) => {
    try {
      await fetch(`${API_URL}/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      fetchProfile();
      setEditing(false);
    } catch {}
  };
  
  if (!profile) {
    return <div className="text-center py-12 text-gray-600">Loading profile...</div>;
  }
  
  const fitnessLevels = ['beginner', 'intermediate', 'advanced', 'athlete'];
  const healthGoals = ['weight_loss', 'muscle_gain', 'maintenance', 'endurance', 'flexibility'];
  const dietaryPrefs = ['vegetarian', 'vegan', 'keto', 'paleo', 'mediterranean', 'none'];
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Profile</h2>
        <button
          onClick={() => setEditing(!editing)}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition"
        >
          {editing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>
      
      {/* User Info Card */}
      <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
            {user.username[0].toUpperCase()}
          </div>
          <div>
            <h3 className="text-xl font-bold">{user.username}</h3>
            <p className="text-sm opacity-90">{user.email}</p>
          </div>
        </div>
      </div>
      
      {/* Health Profile */}
      <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Activity size={20} className="text-purple-600" />
          Health Profile
        </h3>
        
        {editing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                <input
                  type="number"
                  defaultValue={profile.profile.age || ''}
                  onChange={(e) => profile.profile.age = parseInt(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-500"
                  placeholder="25"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                <input
                  type="number"
                  defaultValue={profile.profile.weight || ''}
                  onChange={(e) => profile.profile.weight = parseInt(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-500"
                  placeholder="70"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
              <input
                type="number"
                defaultValue={profile.profile.height || ''}
                onChange={(e) => profile.profile.height = parseInt(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-500"
                placeholder="170"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fitness Level</label>
              <select
                defaultValue={profile.profile.fitness_level || 'beginner'}
                onChange={(e) => profile.profile.fitness_level = e.target.value}
                className="w-full px-4 py-2 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-500"
              >
                {fitnessLevels.map(level => (
                  <option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Health Goals</label>
              <div className="flex flex-wrap gap-2">
                {healthGoals.map(goal => (
                  <button
                    key={goal}
                    onClick={() => {
                      const goals = profile.profile.health_goals || [];
                      if (goals.includes(goal)) {
                        profile.profile.health_goals = goals.filter((g: string) => g !== goal);
                      } else {
                        profile.profile.health_goals = [...goals, goal];
                      }
                    }}
                    className={`px-4 py-2 rounded-xl text-sm transition ${
                      (profile.profile.health_goals || []).includes(goal)
                        ? 'bg-purple-600 text-white'
                        : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                    }`}
                  >
                    {goal.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Preferences</label>
              <div className="flex flex-wrap gap-2">
                {dietaryPrefs.map(pref => (
                  <button
                    key={pref}
                    onClick={() => {
                      const prefs = profile.profile.dietary_preferences || [];
                      if (prefs.includes(pref)) {
                        profile.profile.dietary_preferences = prefs.filter((p: string) => p !== pref);
                      } else {
                        profile.profile.dietary_preferences = [...prefs, pref];
                      }
                    }}
                    className={`px-4 py-2 rounded-xl text-sm transition ${
                      (profile.profile.dietary_preferences || []).includes(pref)
                        ? 'bg-pink-600 text-white'
                        : 'bg-pink-50 text-pink-600 hover:bg-pink-100'
                    }`}
                  >
                    {pref}
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={() => updateProfile({ profile: profile.profile })}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition shadow-lg font-medium"
            >
              Save Changes
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-purple-50 rounded-xl p-4">
                <div className="text-sm text-gray-600 mb-1">Age</div>
                <div className="text-xl font-bold text-purple-600">{profile.profile.age || 'Not set'}</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-4">
                <div className="text-sm text-gray-600 mb-1">Weight</div>
                <div className="text-xl font-bold text-purple-600">{profile.profile.weight ? `${profile.profile.weight} kg` : 'Not set'}</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-4">
                <div className="text-sm text-gray-600 mb-1">Height</div>
                <div className="text-xl font-bold text-purple-600">{profile.profile.height ? `${profile.profile.height} cm` : 'Not set'}</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-4">
                <div className="text-sm text-gray-600 mb-1">Fitness Level</div>
                <div className="text-xl font-bold text-purple-600 capitalize">{profile.profile.fitness_level || 'Not set'}</div>
              </div>
            </div>
            
            {profile.profile.health_goals && profile.profile.health_goals.length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Health Goals</div>
                <div className="flex flex-wrap gap-2">
                  {profile.profile.health_goals.map((goal: string) => (
                    <span key={goal} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                      {goal.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {profile.profile.dietary_preferences && profile.profile.dietary_preferences.length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Dietary Preferences</div>
                <div className="flex flex-wrap gap-2">
                  {profile.profile.dietary_preferences.map((pref: string) => (
                    <span key={pref} className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm capitalize">
                      {pref}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-6">
        <h3 className="font-bold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <button className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl hover:shadow-md transition text-left">
            <Dumbbell size={20} className="text-purple-600 mb-2" />
            <div className="font-medium text-gray-800 text-sm">Generate Workout</div>
          </button>
          <button className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl hover:shadow-md transition text-left">
            <Apple size={20} className="text-purple-600 mb-2" />
            <div className="font-medium text-gray-800 text-sm">Get Meal Plan</div>
          </button>
          <button className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl hover:shadow-md transition text-left">
            <Brain size={20} className="text-purple-600 mb-2" />
            <div className="font-medium text-gray-800 text-sm">Wellness Tips</div>
          </button>
          <button className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl hover:shadow-md transition text-left">
            <Calendar size={20} className="text-purple-600 mb-2" />
            <div className="font-medium text-gray-800 text-sm">Schedule Plan</div>
          </button>
        </div>
      </div>
    </div>
  );
}
