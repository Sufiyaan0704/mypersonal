import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { JournalEntry, UpdateJournalEntry } from "@shared/schema";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MoodSelector from "@/components/MoodSelector";
import JournalEditor from "@/components/JournalEditor";
import MoodAnalysis from "@/components/MoodAnalysis";
import JournalEntryCard from "@/components/JournalEntryCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Search, CalendarRange, SortDesc } from "lucide-react";

export default function JournalHistory() {
  const { toast } = useToast();
  const [showJournalDialog, setShowJournalDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedMood, setSelectedMood] = useState("neutral");
  const [journalContent, setJournalContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<number | null>(null);
  
  // Fetch all journal entries
  const { data: entries, isLoading } = useQuery<JournalEntry[]>({
    queryKey: ['/api/journal'],
  });
  
  // Update journal entry mutation
  const updateEntryMutation = useMutation({
    mutationFn: async (data: { id: number, updates: UpdateJournalEntry }) => {
      const res = await apiRequest('PUT', `/api/journal/${data.id}`, data.updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/journal'] });
      queryClient.invalidateQueries({ queryKey: ['/api/journal/recent/3'] });
      
      setShowJournalDialog(false);
      setEditingEntry(null);
      setJournalContent("");
      
      toast({
        title: "Journal Entry Updated",
        description: "Your journal entry has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error Updating Entry",
        description: "There was a problem updating your journal entry.",
        variant: "destructive",
      });
    }
  });
  
  // Delete journal entry mutation
  const deleteEntryMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/journal/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/journal'] });
      queryClient.invalidateQueries({ queryKey: ['/api/journal/recent/3'] });
      
      setShowDeleteDialog(false);
      setEntryToDelete(null);
      
      toast({
        title: "Journal Entry Deleted",
        description: "Your journal entry has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error Deleting Entry",
        description: "There was a problem deleting your journal entry.",
        variant: "destructive",
      });
    }
  });
  
  // Create new journal entry - reuses the New Entry dialog for dashboard
  const handleNewEntry = () => {
    setEditingEntry(null);
    setSelectedMood("neutral");
    setJournalContent("");
    setShowJournalDialog(true);
  };
  
  // Handler to update journal entry
  const handleUpdateEntry = () => {
    if (!editingEntry) return;
    
    if (!journalContent.trim()) {
      toast({
        title: "Journal Entry Empty",
        description: "Please write something in your journal entry.",
        variant: "destructive",
      });
      return;
    }
    
    updateEntryMutation.mutate({
      id: editingEntry.id,
      updates: {
        mood: selectedMood,
        content: journalContent,
        sentiment: editingEntry.sentiment,
        energy: editingEntry.energy,
        wordCount: journalContent.split(/\s+/).filter(Boolean).length
      }
    });
  };
  
  // Handler to edit an entry
  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setSelectedMood(entry.mood);
    setJournalContent(entry.content);
    setShowJournalDialog(true);
  };
  
  // Handler to delete an entry
  const handleDeleteEntry = (id: number) => {
    setEntryToDelete(id);
    setShowDeleteDialog(true);
  };
  
  // Handler to confirm deletion
  const confirmDelete = () => {
    if (entryToDelete !== null) {
      deleteEntryMutation.mutate(entryToDelete);
    }
  };
  
  // Filter entries based on search query
  const filteredEntries = entries 
    ? entries.filter(entry => 
        entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.mood.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];
  
  return (
    <div className="flex flex-col h-screen">
      <Header onNewEntry={handleNewEntry} />
      
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
              <h2 className="text-xl font-bold text-primary">Journal History</h2>
            </div>
            <Button 
              variant="ghost"
              size="sm"
              onClick={handleNewEntry}
              className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </Button>
          </div>
          
          {/* Journal History Header */}
          <div className="hidden md:flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-dark">Journal History</h2>
            <div className="flex space-x-3">
              <Button
                onClick={handleNewEntry}
                className="flex items-center bg-primary text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                New Journal Entry
              </Button>
            </div>
          </div>
          
          {/* Search and filters */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search journal entries..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center whitespace-nowrap">
                <CalendarRange className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Date Range</span>
              </Button>
              
              <Button variant="outline" className="flex items-center whitespace-nowrap">
                <SortDesc className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Sort</span>
              </Button>
            </div>
          </div>
          
          {/* Journal entries */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          ) : filteredEntries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEntries.map(entry => (
                <JournalEntryCard
                  key={entry.id}
                  entry={entry}
                  onEdit={handleEditEntry}
                  onDelete={handleDeleteEntry}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-4xl mb-4">📝</div>
                {searchQuery ? (
                  <>
                    <h3 className="text-lg font-medium mb-2">No matching entries found</h3>
                    <p className="text-muted-foreground text-center max-w-sm">
                      Try adjusting your search or filters to find what you're looking for.
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-medium mb-2">No Journal Entries Yet</h3>
                    <p className="text-muted-foreground text-center max-w-sm mb-4">
                      Start journaling to track your daily mood and get AI-powered insights into your emotional patterns.
                    </p>
                    <Button onClick={handleNewEntry}>
                      Create Your First Entry
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      
      {/* Edit Journal Entry Dialog */}
      <Dialog open={showJournalDialog} onOpenChange={setShowJournalDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingEntry ? "Edit Journal Entry" : "New Journal Entry"}
            </DialogTitle>
            <DialogDescription>
              {editingEntry 
                ? `Editing entry from ${new Date(editingEntry.date).toLocaleDateString()}`
                : "Record your thoughts and feelings for today"
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-y-auto flex-grow py-4">
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
            
            {editingEntry && editingEntry.sentiment !== null && (
              <MoodAnalysis
                sentiment={editingEntry.sentiment}
                energy={editingEntry.energy}
                summary="Analysis from your original entry. Update your content and save to reanalyze."
                keywords={[]}
              />
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowJournalDialog(false);
                setEditingEntry(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={editingEntry ? handleUpdateEntry : handleNewEntry}
              disabled={updateEntryMutation.isPending || !journalContent.trim()}
            >
              {updateEntryMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your journal entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteEntryMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
