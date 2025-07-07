// CalendarPage.tsx
import { useQuery } from '@tanstack/react-query';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
} from 'date-fns';
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Task {
  id: number;
  title: string;
  description?: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed';
  deadline?: Date | string;
  estimatedTime?: string;
  aiEnhanced?: boolean;
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
    queryFn: async () => {
      const res = await fetch('/api/tasks');
      const json = await res.json();
      return json.map((task: any) => ({
        ...task,
        deadline: task.deadline ? new Date(task.deadline) : undefined,
      }));
    },
  });

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const getTasksForDate = (date: Date) => {
    return tasks.filter((task) => {
      if (!task.deadline) return false;
      const taskDate = new Date(task.deadline);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Prev
          </Button>
          <Button variant="outline" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {days.map((day) => {
          const dayTasks = getTasksForDate(day);
          const isToday = new Date().toDateString() === day.toDateString();

          return (
            <Card
              key={day.toISOString()}
              className={`shadow-md transition-all ${isToday ? 'ring-2 ring-blue-500' : ''}`}
            >
              <CardHeader className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 rounded-t-md">
                <CardTitle className="text-base flex items-center space-x-2">
                  <CalendarIcon className="w-4 h-4 text-blue-600" />
                  <span>{format(day, 'dd MMM yyyy')}</span>
                </CardTitle>
                <span className="text-sm text-gray-500">
                  {dayTasks.length} task(s)
                </span>
              </CardHeader>
              <CardContent className="space-y-2 py-4">
                {dayTasks.length === 0 ? (
                  <p className="text-sm text-gray-400">No tasks</p>
                ) : (
                  dayTasks.map((task) => (
                    <Badge
                      key={task.id}
                      variant="outline"
                      className={`truncate max-w-full cursor-pointer ${getPriorityColor(task.priority)}`}
                      onClick={() => setSelectedTask(task)}
                    >
                      {task.title}
                    </Badge>
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Task Detail Popup */}
      {selectedTask && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
          onClick={() => setSelectedTask(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full z-60"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">{selectedTask.title}</h2>
            {selectedTask.description && <p className="mb-2">{selectedTask.description}</p>}
            <p><strong>Category:</strong> {selectedTask.category}</p>
            <p><strong>Priority:</strong> {selectedTask.priority}</p>
            <p><strong>Status:</strong> {selectedTask.status}</p>
            {selectedTask.estimatedTime && <p><strong>Est. Time:</strong> {selectedTask.estimatedTime}</p>}
            {selectedTask.aiEnhanced && (
              <p className="text-purple-600 font-medium mt-2">AI Enhanced</p>
            )}
            <div className="text-right mt-4">
              <Button variant="secondary" onClick={() => setSelectedTask(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
