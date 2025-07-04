import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Brain, Mail, MessageSquare, StickyNote, Upload, Mic, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ContextInput {
  email: string;
  messages: string;
  notes: string;
}

export default function ContextPage() {
  const [contextInput, setContextInput] = useState<ContextInput>({
    email: '',
    messages: '',
    notes: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: contextHistory = [], isLoading } = useQuery({
    queryKey: ['/api/context'],
  });

  const processContextMutation = useMutation({
    mutationFn: async (entries: any[]) => {
      const response = await fetch('/api/context/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entries }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to process context');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Context Processed Successfully",
        description: `AI identified ${data.extractedTasks?.length || 0} new tasks and ${data.suggestions?.length || 0} suggestions.`,
      });
      
      // Clear form
      setContextInput({
        email: '',
        messages: '',
        notes: ''
      });
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/context'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ai/suggestions'] });
    },
    onError: (error) => {
      toast({
        title: "Processing Failed",
        description: "Failed to process context with AI. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async () => {
    const entries = [];
    
    if (contextInput.email.trim()) {
      entries.push({
        content: contextInput.email,
        sourceType: 'email'
      });
    }
    
    if (contextInput.messages.trim()) {
      entries.push({
        content: contextInput.messages,
        sourceType: 'message'
      });
    }
    
    if (contextInput.notes.trim()) {
      entries.push({
        content: contextInput.notes,
        sourceType: 'note'
      });
    }
    
    if (entries.length === 0) {
      toast({
        title: "No Content",
        description: "Please add some context content before processing.",
        variant: "destructive",
      });
      return;
    }
    
    processContextMutation.mutate(entries);
  };

  const handleInputChange = (field: keyof ContextInput, value: string) => {
    setContextInput(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">Daily Context Input</CardTitle>
            <div className="flex items-center space-x-2 text-sm text-blue-600">
              <Brain className="w-4 h-4" />
              <span>AI Context Analysis</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Mail className="w-5 h-5 text-blue-600" />
                <h3 className="font-medium text-blue-900 dark:text-blue-200">Email Context</h3>
              </div>
              <Textarea
                placeholder="Paste important emails or summaries..."
                value={contextInput.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="h-32 resize-none border-blue-200 dark:border-blue-800 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <MessageSquare className="w-5 h-5 text-green-600" />
                <h3 className="font-medium text-green-900 dark:text-green-200">Messages</h3>
              </div>
              <Textarea
                placeholder="WhatsApp, Slack, or other messages..."
                value={contextInput.messages}
                onChange={(e) => handleInputChange('messages', e.target.value)}
                className="h-32 resize-none border-green-200 dark:border-green-800 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <StickyNote className="w-5 h-5 text-purple-600" />
                <h3 className="font-medium text-purple-900 dark:text-purple-200">Notes</h3>
              </div>
              <Textarea
                placeholder="Meeting notes, ideas, reminders..."
                value={contextInput.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="h-32 resize-none border-purple-200 dark:border-purple-800 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </Button>
              <Button variant="outline" size="sm">
                <Mic className="w-4 h-4 mr-2" />
                Voice Input
              </Button>
            </div>
            <Button 
              onClick={handleSubmit}
              disabled={processContextMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {processContextMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Process with AI
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Context History */}
      <Card>
        <CardHeader>
          <CardTitle>Context History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : contextHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No context entries yet. Add your first context above to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {contextHistory.map((entry: any) => (
                <div key={entry.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {formatTimeAgo(entry.createdAt)}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      entry.isProcessed 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {entry.isProcessed ? 'Processed' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                    {entry.content}
                  </p>
                  {entry.isProcessed && entry.extractedTasks && entry.extractedTasks.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      AI identified {entry.extractedTasks.length} task(s) and updated priorities.
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
