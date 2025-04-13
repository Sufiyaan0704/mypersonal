import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { JournalEntry } from "@shared/schema";
import { 
  Home, 
  BookOpen, 
  BarChart2, 
  Flower, 
  Settings 
} from "lucide-react";

interface MoodHistoryItem {
  date: string;
  mood: string;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const getMoodColor = (mood: string) => {
  switch(mood) {
    case 'happy': return 'bg-green-500';
    case 'calm': return 'bg-blue-500';
    case 'neutral': return 'bg-yellow-500';
    case 'tired': return 'bg-orange-500';
    case 'sad': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

const getMoodText = (mood: string) => {
  return mood.charAt(0).toUpperCase() + mood.slice(1);
};

export default function Sidebar() {
  const [location] = useLocation();
  
  const { data: recentEntries } = useQuery<JournalEntry[]>({
    queryKey: ['/api/journal/recent/3'],
  });
  
  const moodHistory = recentEntries ? recentEntries.map(entry => ({
    date: formatDate(entry.date),
    mood: entry.mood
  })) : [];
  
  // Count entries for stats
  const entryCount = recentEntries?.length || 0;
  
  return (
    <nav className="bg-white w-20 md:w-64 shadow-sm flex flex-col py-6 hidden md:flex">
      <div className="space-y-6 px-4">
        <div className="space-y-3">
          <Link href="/">
            <a className={`flex items-center space-x-3 p-2 rounded-lg ${location === '/' ? 'text-primary font-medium bg-primary bg-opacity-10' : 'text-dark hover:bg-gray-100'}`}>
              <Home className="h-6 w-6" />
              <span className="hidden md:inline">Dashboard</span>
            </a>
          </Link>
          
          <Link href="/history">
            <a className={`flex items-center space-x-3 p-2 rounded-lg ${location === '/history' ? 'text-primary font-medium bg-primary bg-opacity-10' : 'text-dark hover:bg-gray-100'}`}>
              <BookOpen className="h-6 w-6" />
              <span className="hidden md:inline">Journal History</span>
            </a>
          </Link>
          
          <Link href="/insights">
            <a className={`flex items-center space-x-3 p-2 rounded-lg ${location === '/insights' ? 'text-primary font-medium bg-primary bg-opacity-10' : 'text-dark hover:bg-gray-100'}`}>
              <BarChart2 className="h-6 w-6" />
              <span className="hidden md:inline">Insights</span>
            </a>
          </Link>
          
          <a href="#" className="flex items-center space-x-3 text-dark hover:bg-gray-100 p-2 rounded-lg transition">
            <Settings className="h-6 w-6" />
            <span className="hidden md:inline">Settings</span>
          </a>
        </div>
        
        <div className="border-t border-gray-200 pt-4 hidden md:block">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent Mood History</h3>
          
          {moodHistory.length > 0 ? (
            moodHistory.map((day, index) => (
              <div className="flex items-center space-x-3 mt-3" key={index}>
                <div className={`w-2 h-2 rounded-full ${getMoodColor(day.mood)}`}></div>
                <span className="text-sm">{day.date} - {getMoodText(day.mood)}</span>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500 mt-2">No mood entries yet</div>
          )}
        </div>
      </div>
      
      <div className="mt-auto px-4 hidden md:block">
        <div className="bg-primary bg-opacity-10 rounded-lg p-4">
          <h3 className="font-medium text-primary mb-2">Journal Stats</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Journal Entries:</span>
              <span className="font-medium">{entryCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Mood Streak:</span>
              <span className="font-medium">{Math.min(entryCount, 7)} days</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
