import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Lightbulb, CalendarPlus, Users, Clock } from 'lucide-react';

export default function AISuggestions() {
  //Featch Data from the server using Routing
 const { data: suggestions = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/ai/suggestions'],
    queryFn: async () => { 
      const res = await fetch('/api/ai/suggestions');
      return res.json();
    },
    refetchInterval: 5 * 60 * 1000,
  });

  const getIconForSuggestionType = (type: string) => {
    switch (type) {
      case 'schedule':
        return <CalendarPlus className="w-4 h-4" />;
      case 'delegate':
        return <Users className="w-4 h-4" />;
      case 'break':
        return <Clock className="w-4 h-4" />;
      default:
        return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getColorForSuggestionType = (type: string) => {
    switch (type) {
      case 'schedule':
        return 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300';
      case 'delegate':
        return 'bg-green-50 border-green-200 text-green-600 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300';
      case 'break':
        return 'bg-orange-50 border-orange-200 text-orange-600 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-300';
      default:
        return 'bg-purple-50 border-purple-200 text-purple-600 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-300';
    }
  };

  const getTextColorForSuggestionType = (type: string) => {
    switch (type) {
      case 'schedule':
        return 'text-blue-900 dark:text-blue-200';
      case 'delegate':
        return 'text-green-900 dark:text-green-200';
      case 'break':
        return 'text-orange-900 dark:text-orange-200';
      default:
        return 'text-purple-900 dark:text-purple-200';
    }
  };

  const getDescriptionColorForSuggestionType = (type: string) => {
    switch (type) {
      case 'schedule':
        return 'text-blue-700 dark:text-blue-300';
      case 'delegate':
        return 'text-green-700 dark:text-green-300';
      case 'break':
        return 'text-orange-700 dark:text-orange-300';
      default:
        return 'text-purple-700 dark:text-purple-300';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <CardTitle>AI Suggestions</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg p-3 h-16"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <CardTitle>AI Suggestions</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {suggestions.length === 0 ? (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No AI suggestions available right now.</p>
            <p className="text-xs mt-1">Add some context or tasks to get personalized suggestions!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {suggestions.map((suggestion: any, index: number) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${getColorForSuggestionType(suggestion.type)}`}
              >
                <div className="flex items-start space-x-2">
                  <div className="mt-1">
                    {getIconForSuggestionType(suggestion.type)}
                  </div>
                  <div>
                    <h4 className={`font-medium ${getTextColorForSuggestionType(suggestion.type)}`}>
                      {suggestion.type === 'schedule' && 'Optimize Your Schedule'}
                      {suggestion.type === 'delegate' && 'Team Collaboration'}
                      {suggestion.type === 'break' && 'Schedule Break'}
                      {suggestion.type === 'optimize' && 'Optimize Tasks'}
                    </h4>
                    <p className={`text-sm mt-1 ${getDescriptionColorForSuggestionType(suggestion.type)}`}>
                      {suggestion.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
