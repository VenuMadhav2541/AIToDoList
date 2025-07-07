import { Route, Switch, useLocation } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { queryClient } from '@/lib/queryClient';
import Dashboard from '@/pages/dashboard';
import ContextPage from '@/pages/context';
import CalendarPage from '@/pages/CalendarPage';
import TodayTasksPopover from '@/components/today-tasks-popover';
import { Brain, Bell, User, Search, Calendar } from 'lucide-react';
import { useState } from 'react';
import ThemeToggle from '@/components/theme-toggle';

 // Header component

function Header({ onSearch }: { onSearch: (term: string) => void }) {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'context' | 'calendar'>('dashboard');
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchInput.trim().toLowerCase());
  };

  /** Navigate & highlight tab */
  const go = (tab: 'dashboard' | 'context' | 'calendar') => {
    setActiveTab(tab);
    if (tab === 'dashboard') navigate('/');
    if (tab === 'context') navigate('/context');
    if (tab === 'calendar') navigate('/calendar');
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* brand + tabs */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 ai-gradient rounded-lg flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Smart&nbsp;Todo
              </h1>
            </div>

            {/* nav tabs */}
            <div className="hidden md:flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {(['dashboard', 'context', 'calendar'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => go(tab)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab
                      ? 'text-white bg-blue-600'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {tab[0].toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* search + misc icons */}
          <div className="flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search tasks…"
                className="w-64 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            </form>
            <ThemeToggle />

            <TodayTasksPopover>
              <button className="relative p-2 text-gray-400 hover:text-gray-500">
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 block h-2 w-2 bg-red-400 rounded-full" />
              </button>
            </TodayTasksPopover>

            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

// App entry
export default function App() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header onSearch={setSearchTerm} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Switch>
            <Route path="/" component={() => <Dashboard searchTerm={searchTerm} />} />
            <Route path="/context" component={ContextPage} />
            <Route path="/calendar" component={CalendarPage} />
            <Route>
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Page not found
                </h2>
              </div>
            </Route>
          </Switch>
        </main>
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}
