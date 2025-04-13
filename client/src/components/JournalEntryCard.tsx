import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JournalEntry } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { CalendarIcon, Edit2Icon, Trash2Icon } from "lucide-react";

interface JournalEntryCardProps {
  entry: JournalEntry;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (id: number) => void;
}

export default function JournalEntryCard({ entry, onEdit, onDelete }: JournalEntryCardProps) {
  const getIconForMood = (mood: string) => {
    switch (mood) {
      case 'happy':
        return '😊';
      case 'calm':
        return '😌';
      case 'neutral':
        return '😐';
      case 'tired':
        return '😴';
      case 'sad':
        return '😔';
      default:
        return '❓';
    }
  };
  
  const getMoodClass = (mood: string) => {
    switch (mood) {
      case 'happy':
        return 'mood-happy';
      case 'calm':
        return 'mood-calm';
      case 'neutral':
        return 'mood-neutral';
      case 'tired':
        return 'mood-tired';
      case 'sad':
        return 'mood-sad';
      default:
        return '';
    }
  };
  
  // Format date nicely
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Get relative time string
  const getRelativeTime = (dateString: string | Date) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };
  
  // Strip HTML for preview
  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };
  
  // Create a preview of content
  const contentPreview = stripHtml(entry.content).slice(0, 150) + 
    (stripHtml(entry.content).length > 150 ? '...' : '');
  
  return (
    <Card className="entry-card">
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <div className={`mood-indicator w-8 h-8 ${getMoodClass(entry.mood)}`}>
              {getIconForMood(entry.mood)}
            </div>
            <CardTitle className="text-lg">{formatDate(entry.date)}</CardTitle>
          </div>
        </div>
        <div className="text-xs text-muted-foreground flex items-center">
          <CalendarIcon className="mr-1 h-3 w-3" />
          {getRelativeTime(entry.date)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm journal-content">{contentPreview}</div>
        
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
      <CardFooter className="pt-1 justify-end gap-2">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onEdit(entry)}
          className="h-8 w-8 p-0"
        >
          <Edit2Icon className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onDelete(entry.id)}
          className="h-8 w-8 p-0 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
        >
          <Trash2Icon className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
