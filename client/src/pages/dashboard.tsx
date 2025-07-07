import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import TaskForm from '@/components/task-form';
import TaskList from '@/components/task-list';
import AISuggestions from '@/components/ai-suggestions';
import CategoriesSidebar from '@/components/categories-sidebar';
import { Sparkles, TriangleAlert, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { type Task as DBTask } from '@shared/schema';

interface DashboardProps {
  searchTerm?: string;
}

export default function Dashboard({ searchTerm = '' }: DashboardProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'deadline' | 'createdAt'>('priority');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<DBTask[]>({
    queryKey: ['/api/tasks'],
    queryFn: async () => {
      const res = await fetch('/api/tasks');
      const json = await res.json();
      return json.map((task: DBTask) => ({
        ...task,
        deadline: task.deadline ? new Date(task.deadline) : undefined,
        createdAt: task.createdAt ? new Date(task.createdAt) : undefined,
        updatedAt: task.updatedAt ? new Date(task.updatedAt) : undefined,
      }));
    },
  });

  const { data: suggestions = [] } = useQuery({
    queryKey: ['/api/ai/suggestions'],
    queryFn: async () => {
      const res = await fetch('/api/ai/suggestions');
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });

  const pendingTasks = tasks.filter((task) => task.status === 'pending');
  const highPriorityTasks = pendingTasks.filter((task) => task.priority === 'high');
  const dueTodayTasks = pendingTasks.filter((task) => {
    if (!task.deadline) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(task.deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    return deadlineDate.getTime() === today.getTime();
  });

  const completedTasks = tasks.filter((task) => task.status === 'completed');
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  const filteredAndSortedTasks = tasks
    .filter((task) => {
      const matchesSearch =
        !searchTerm ||
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;
      if (filter !== 'all' && task.status !== filter) return false;
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
      return true;
    })
    .sort((a, b) => {
      const map = { high: 3, medium: 2, low: 1 };
      if (sortBy === 'priority') {
        return (map[b.priority] ?? 0) - (map[a.priority] ?? 0);
      } else if (sortBy === 'deadline') {
        const timeA = a.deadline ? a.deadline.getTime() : Number.MAX_SAFE_INTEGER;
        const timeB = b.deadline ? b.deadline.getTime() : Number.MAX_SAFE_INTEGER;
        return timeA - timeB;
      } else {
        const timeA = a.createdAt ? a.createdAt.getTime() : 0;
        const timeB = b.createdAt ? b.createdAt.getTime() : 0;
        return timeB - timeA;
      }
    });

  if (tasksLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="ai-gradient text-white" style={{ backgroundColor: 'black' }}>
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
        <div className="flex-1 space-y-6">
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

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <CardTitle>Tasks</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')}>
                    All
                  </Button>
                  <Button variant={filter === 'pending' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('pending')}>
                    Pending
                  </Button>
                  <Button variant={filter === 'completed' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('completed')}>
                    Completed
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value as typeof priorityFilter)}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="priority">Sort by Priority</option>
                  <option value="deadline">Sort by Deadline</option>
                  <option value="createdAt">Sort by Created Date</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <TaskList tasks={filteredAndSortedTasks} filter={filter} />
            </CardContent>
          </Card>
        </div>

        <div className="w-full lg:w-80 space-y-6">
          <AISuggestions />
          <CategoriesSidebar />

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
                  <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progressPercentage}%` }}></div>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">Productivity Score</span>
                  <span className="font-semibold text-blue-600">{progressPercentage}%</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {progressPercentage >= 70
                    ? "Great work! You're ahead of your weekly average."
                    : "Keep going! You're making progress."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}