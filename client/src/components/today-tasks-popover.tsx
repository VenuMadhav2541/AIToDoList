import { useQuery } from '@tanstack/react-query';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface Task {
  id: number;
  title: string;
  deadline?: string;
  status: 'pending' | 'completed';
}

export default function TodayTasksPopover({ children }: { children: React.ReactNode }) {
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
    queryFn: async () => {
      const res = await fetch('/api/tasks');
      return res.json();
    },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayTasks = tasks.filter((task) => {
    if (!task.deadline || task.status !== 'pending') return false;
    const deadline = new Date(task.deadline);
    deadline.setHours(0, 0, 0, 0);
    return deadline.getTime() === today.getTime();
  });

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent side="bottom" align="end" className="w-80">
        <h4 className="text-sm font-medium mb-2">Tasks Due Today</h4>
        {todayTasks.length === 0 ? (
          <p className="text-sm text-gray-500">No pending tasks for today 🎉</p>
        ) : (
          <ul className="space-y-2">
            {todayTasks.map((task) => (
              <li key={task.id} className="flex justify-between items-center">
                <span className="text-sm">{task.title}</span>
                <Badge variant="outline">{format(new Date(task.deadline!), 'p')}</Badge>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
