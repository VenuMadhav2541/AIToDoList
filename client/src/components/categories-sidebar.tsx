import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const defaultCategories = [
  { name: 'Work', color: 'blue', usageCount: 0 },
  { name: 'Personal', color: 'green', usageCount: 0 },
  { name: 'Learning', color: 'purple', usageCount: 0 },
  { name: 'Health', color: 'red', usageCount: 0 },
  { name: 'Shopping', color: 'orange', usageCount: 0 },
];

export default function CategoriesSidebar() {
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['/api/tasks'],
  });

  // Calculate task counts for each category
  const categoryStats = [...defaultCategories, ...categories].map(category => {
    const taskCount = tasks.filter((task: any) => task.category === category.name).length;
    return {
      ...category,
      taskCount,
    };
  });

  // Remove duplicates and sort by usage
  const uniqueCategories = categoryStats.reduce((acc: any[], current) => {
    const existing = acc.find(cat => cat.name === current.name);
    if (!existing) {
      acc.push(current);
    } else {
      existing.taskCount += current.taskCount;
    }
    return acc;
  }, []).sort((a, b) => b.taskCount - a.taskCount);

  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: string } = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      red: 'bg-red-500',
      orange: 'bg-orange-500',
    };
    return colorMap[color] || 'bg-gray-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {uniqueCategories.map((category) => (
            <div
              key={category.name}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
            >
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getColorClasses(category.color)}`}></div>
                <span className="text-gray-700 dark:text-gray-300">{category.name}</span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {category.taskCount} {category.taskCount === 1 ? 'task' : 'tasks'}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
