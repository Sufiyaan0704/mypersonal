import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { JournalEntry, InsertJournalEntry } from "@shared/schema";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MoodSelector from "@/components/MoodSelector";
import JournalEditor from "@/components/JournalEditor";
import MoodAnalysis from "@/components/MoodAnalysis";
import MoodChart from "@/components/MoodChart";
import { JournalEntryCard } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, ChevronDown, FileDown } from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const [showJournalDialog, setShowJournalDialog] = useState(false);
  const [selectedMood, setSelectedMood] = useState("neutral");
  const [journalContent, setJournalContent] = useState("");
  const [analysis, setAnalysis] = useState<{summary: string, keywords: string[]}>({
    summary: "",
    keywords: []
  });
  
  // Fetch recent entries
  const { data: entries, isLoading: isLoadingEntries } = useQuery<JournalEntry[]>({
    queryKey: ['/api/journal'],
  });
  
  // Create journal entry mutation
  const createEntryMutation = useMutation({
    mutationFn: async (newEntry: InsertJournalEntry) => {
      const res = await apiRequest('POST', '/api/journal', newEntry);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/journal'] });
      queryClient.invalidateQueries({ queryKey: ['/api/journal/recent/3'] });
      
      setShowJournalDialog(false);
      setJournalContent("");
      
      toast({
        title: "Journal Entry Saved",
        description: "Your mood and journal entry have been recorded.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error Saving Entry",
        description: "There was a problem saving your journal entry.",
        variant: "destructive",
      });
    }
  });
  
  // Handler to create a new journal entry
  const handleCreateEntry = () => {
    if (!journalContent.trim()) {
      toast({
        title: "Journal Entry Empty",
        description: "Please write something in your journal entry.",
        variant: "destructive",
      });
      return;
    }
    
    createEntryMutation.mutate({
      mood: selectedMood,
      content: journalContent,
      userId: 1, // Default user ID for demo
    });
  };
  
  // Format date for display
  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  // Export journal entries as JSON
  const handleExportEntries = () => {
    if (!entries || entries.length === 0) {
      toast({
        title: "No Entries to Export",
        description: "Create some journal entries first.",
        variant: "destructive",
      });
      return;
    }
    
    const dataStr = JSON.stringify(entries, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `garden-mindful-journal-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Journal Exported",
      description: "Your journal entries have been exported successfully.",
    });
  };
  
  const recentEntries = entries ? entries.slice(0, 3) : [];
  const hasSentimentData = entries?.some(entry => entry.sentiment !== null) || false;
  
  return (
    <div className="flex flex-col h-screen">
      <Header onNewEntry={() => setShowJournalDialog(true)} />
      
      <main className="flex flex-grow overflow-hidden">
        <Sidebar />
        
        <div className="flex-grow p-6 overflow-auto">
          {/* Mobile navigation */}
          <div className="md:hidden mb-6 flex justify-between items-center">
            <button className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="text-center">
              <h2 className="text-xl font-bold text-primary">Dashboard</h2>
            </div>
            <Button 
              variant="ghost"
              size="sm"
              onClick={() => setShowJournalDialog(true)}
              className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </Button>
          </div>
          
          {/* Dashboard Header */}
          <div className="hidden md:flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-dark">Dashboard</h2>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handleExportEntries}
                className="flex items-center"
              >
                <FileDown className="h-5 w-5 mr-2" />
                Export Journal
              </Button>
              <Button
                onClick={() => setShowJournalDialog(true)}
                className="flex items-center bg-primary text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                New Journal Entry
              </Button>
            </div>
          </div>
          
          {/* Dashboard Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarDays className="h-5 w-5 mr-2" />
                  Today's Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-medium">{getCurrentDate()}</div>
                {recentEntries.length > 0 ? (
                  <div className="text-sm text-muted-foreground mt-1">
                    You have {recentEntries.length} recent journal entries
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground mt-1">
                    No journal entries yet. Create your first one!
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Mood Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {hasSentimentData ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Average Sentiment</span>
                      <span className="text-sm">
                        {Math.round(
                          entries?.reduce((acc, entry) => acc + (entry.sentiment || 0), 0) / 
                          entries?.filter(e => e.sentiment !== null).length || 1
                        )}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Average Energy</span>
                      <span className="text-sm">
                        {Math.round(
                          entries?.reduce((acc, entry) => acc + (entry.energy || 0), 0) / 
                          entries?.filter(e => e.energy !== null).length || 1
                        )}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Words Written</span>
                      <span className="text-sm">
                        {entries?.reduce((acc, entry) => acc + (entry.wordCount || 0), 0)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground text-sm">
                    No mood data available yet. Create a journal entry to see your mood analysis.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <MoodChart entries={entries || []} isLoading={isLoadingEntries} />
          
          {/* Recent Entries */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Recent Journal Entries</h3>
              {recentEntries.length > 0 && (
                <Button variant="link" onClick={() => window.location.href = "/history"}>
                  View All
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
            
            {isLoadingEntries ? (
              <div className="grid grid-cols-1 gap-4 animate-pulse">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            ) : recentEntries.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {recentEntries.map(entry => (
                  <Card key={entry.id} className="entry-card">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`mood-indicator w-8 h-8 mood-${entry.mood}`}>
                            {entry.mood === 'happy' ? '😊' : 
                             entry.mood === 'calm' ? '😌' :
                             entry.mood === 'neutral' ? '😐' :
                             entry.mood === 'tired' ? '😴' : '😔'}
                          </div>
                          <CardTitle className="text-lg">
                            {new Date(entry.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div 
                        className="text-sm journal-content" 
                        dangerouslySetInnerHTML={{ 
                          __html: entry.content.length > 150 
                            ? entry.content.slice(0, 150) + '...' 
                            : entry.content
                        }}
                      />
                      
                      {entry.sentiment !== null && (
                        <div className="flex items-center mt-3 text-xs text-muted-foreground">
                          <div className="mr-3">
                            <span className="font-semibold">Sentiment:</span> {entry.sentiment}%
                          </div>
                          <div>
                            <span className="font-semibold">Energy:</span> {entry.energy}%
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="text-4xl mb-4">📝</div>
                  <h3 className="text-lg font-medium mb-2">No Journal Entries Yet</h3>
                  <p className="text-muted-foreground text-center max-w-sm mb-4">
                    Start journaling to track your daily mood and get AI-powered insights into your emotional patterns.
                  </p>
                  <Button onClick={() => setShowJournalDialog(true)}>
                    Create Your First Entry
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      
      {/* Journal Entry Dialog */}
      <Dialog open={showJournalDialog} onOpenChange={setShowJournalDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Daily Journal</DialogTitle>
            <DialogDescription>
              Record your thoughts and feelings for today
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-y-auto flex-grow py-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Today's Date</label>
              <div className="text-lg font-semibold">{getCurrentDate()}</div>
            </div>
            
            <MoodSelector
              selectedMood={selectedMood}
              onMoodSelect={setSelectedMood}
            />
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Journal Entry</label>
              <JournalEditor
                content={journalContent}
                onChange={setJournalContent}
                minHeight="200px"
              />
            </div>
            
            {createEntryMutation.isPending ? (
              <MoodAnalysis
                sentiment={null}
                energy={null}
                summary="Analyzing your mood..."
                keywords={[]}
                isLoading={true}
              />
            ) : createEntryMutation.isSuccess && createEntryMutation.data?.analysis ? (
              <MoodAnalysis
                sentiment={createEntryMutation.data.sentiment}
                energy={createEntryMutation.data.energy}
                summary={createEntryMutation.data.analysis.summary}
                keywords={createEntryMutation.data.analysis.keywords}
              />
            ) : null}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowJournalDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateEntry}
              disabled={createEntryMutation.isPending || !journalContent.trim()}
            >
              {createEntryMutation.isPending ? "Saving..." : "Save Entry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
