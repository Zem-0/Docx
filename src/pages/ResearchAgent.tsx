import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

const ResearchAgent = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Research Agent</h1>
        <p className="text-lg text-gray-600 mt-2">Your AI-powered research assistant. Ask anything.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Start a New Research Task</CardTitle>
          <CardDescription>Enter a topic or question to begin your research.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full items-center space-x-4">
            <Input type="text" placeholder="e.g., What are the latest trends in AI?" className="flex-1 text-base p-4" />
            <Button type="submit" size="lg">
              <Search className="h-5 w-5 mr-2" />
              Research
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
          <CardDescription>Your research results will appear here.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-12">
            <p>No research conducted yet.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ResearchAgentPageContainer = () => {
    return (
        <DashboardLayout>
            <ResearchAgent />
        </DashboardLayout>
    );
};

export default ResearchAgentPageContainer; 