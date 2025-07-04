import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import TaskForm from '@/components/task-form';
import TaskList from '@/components/task-list';
import AISuggestions from '@/components/ai-suggestions';
import CategoriesSidebar from '@/components/categories-sidebar';
import { Sparkles, TriangleAlert, Clock, Plus, Filter, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Dashboard() {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('priority');

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['/api/tasks'],
  });

  const { data: suggestions = [], isLoading: suggestionsLoading } = useQuery({
    queryKey: ['/api/ai/suggestions'],
  });

  const pendingTasks = tasks.filter((task: any) => task.status === 'pending');
  const highPriorityTasks = pendingTasks.filter((task: any) => task.priority === 'high');
  const dueTodayTasks = pendingTasks.filter((task: any) => {
    if (!task.deadline) return false;
    const today = new Date().toDateString();
    return new Date(task.deadline).toDateString() === today;
  });

  const completedTasks = tasks.filter((task: any) => task.status === 'completed');
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  const handlePrioritize = async () => {
    try {
      const response = await fetch('/api/tasks/prioritize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        window.location.reload(); // Simple refresh to show updated priorities
      }
    } catch (error) {
      console.error('Failed to prioritize tasks:', error);
    }
  };

  if (tasksLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Insights Panel */}
      <Card className="ai-gradient text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Good morning! Alex</h2>
              <p className="text-blue-100">Based on your context, here's your AI-powered insights for today</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{pendingTasks.length}</div>
              <div className="text-sm text-blue-100">Pending Tasks</div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <TriangleAlert className="w-5 h-5 text-yellow-300" />
                <span className="font-medium">High Priority</span>
              </div>
              <div className="text-2xl font-bold mt-1">{highPriorityTasks.length}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-orange-300" />
                <span className="font-medium">Due Today</span>
              </div>
              <div className="text-2xl font-bold mt-1">{dueTodayTasks.length}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-300" />
                <span className="font-medium">AI Suggestions</span>
              </div>
              <div className="text-2xl font-bold mt-1">{suggestions.length}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Tasks Panel */}
        <div className="flex-1 space-y-6">
          {/* Task Creation Panel */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Quick Add Task</CardTitle>
                <div className="flex items-center space-x-2 text-sm text-blue-600">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Powered</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <TaskForm />
            </CardContent>
          </Card>

          {/* Tasks List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <CardTitle>Tasks</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={filter === 'pending' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('pending')}
                  >
                    Pending
                  </Button>
                  <Button
                    variant={filter === 'completed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('completed')}
                  >
                    Completed
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  Sort by Priority
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={handlePrioritize}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Optimize
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <TaskList tasks={tasks} filter={filter} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 space-y-6">
          <AISuggestions />
          <CategoriesSidebar />
          
          {/* Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
                  <span>Completed</span>
                  <span>{completedTasks.length} of {totalTasks}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">Productivity Score</span>
                  <span className="font-semibold text-blue-600">{progressPercentage}%</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {progressPercentage >= 70 ? "Great work! You're ahead of your weekly average." : "Keep going! You're making progress."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
