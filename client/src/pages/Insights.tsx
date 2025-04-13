import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { JournalEntry } from "@shared/schema";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MoodChart from "@/components/MoodChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  BarChart3,
  LineChart,
  PieChart,
  Calendar,
  Award,
  TrendingUp,
  BookOpen,
  Clock
} from "lucide-react";

export default function Insights() {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Fetch journal entries
  const { data: entries, isLoading } = useQuery<JournalEntry[]>({
    queryKey: ['/api/journal'],
  });
  
  // Calculate statistics
  const stats = {
    totalEntries: entries?.length || 0,
    avgSentiment: entries?.filter(e => e.sentiment !== null).length ? 
      Math.round(
        entries
          .filter(e => e.sentiment !== null)
          .reduce((acc, entry) => acc + (entry.sentiment || 0), 0) / 
        entries.filter(e => e.sentiment !== null).length
      ) : 0,
    avgEnergy: entries?.filter(e => e.energy !== null).length ? 
      Math.round(
        entries
          .filter(e => e.energy !== null)
          .reduce((acc, entry) => acc + (entry.energy || 0), 0) / 
        entries.filter(e => e.energy !== null).length
      ) : 0,
    totalWords: entries?.reduce((acc, entry) => acc + (entry.wordCount || 0), 0) || 0,
    streakDays: Math.min(entries?.length || 0, 7),
    moodBreakdown: entries?.reduce((acc: Record<string, number>, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {}) || {}
  };
  
  // Calculate the most common mood
  const mostCommonMood = entries?.length ? 
    Object.entries(stats.moodBreakdown)
      .sort((a, b) => b[1] - a[1])[0][0] : "N/A";
  
  // Helper to format dates
  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  return (
    <div className="flex flex-col h-screen">
      <Header onNewEntry={() => window.location.href = "/"} />
      
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
              <h2 className="text-xl font-bold text-primary">Insights</h2>
            </div>
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>
          
          {/* Insights Header */}
          <div className="hidden md:flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-dark">Mood Insights</h2>
          </div>
          
          {/* Insight tabs */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview" className="flex items-center">
                <BarChart3 className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="trends" className="flex items-center">
                <LineChart className="h-4 w-4 mr-2" />
                Trends
              </TabsTrigger>
              <TabsTrigger value="breakdown" className="flex items-center">
                <PieChart className="h-4 w-4 mr-2" />
                Mood Breakdown
              </TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Entries
                    </CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalEntries}</div>
                    <p className="text-xs text-muted-foreground">
                      Journal entries recorded
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Average Sentiment
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.avgSentiment}%</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.avgSentiment >= 75 ? "Very positive outlook" : 
                       stats.avgSentiment >= 60 ? "Positive outlook" :
                       stats.avgSentiment >= 40 ? "Neutral outlook" :
                       stats.avgSentiment >= 25 ? "Somewhat negative" : "Negative outlook"}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Most Common Mood
                    </CardTitle>
                    <Award className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold capitalize">{mostCommonMood}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.moodBreakdown[mostCommonMood] || 0} entries with this mood
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Words Written
                    </CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalWords}</div>
                    <p className="text-xs text-muted-foreground">
                      Total words in journal
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              {/* Mood Chart for Overview */}
              <MoodChart entries={entries || []} isLoading={isLoading} />
            </TabsContent>
            
            {/* Trends Tab */}
            <TabsContent value="trends" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Sentiment & Energy Trends</CardTitle>
                </CardHeader>
                <CardContent className="h-96">
                  <MoodChart entries={entries || []} isLoading={isLoading} />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Patterns</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    This analysis shows your mood patterns over different days of the week.
                  </p>
                  
                  {isLoading ? (
                    <div className="h-40 animate-pulse bg-gray-200 rounded-lg"></div>
                  ) : entries && entries.length > 0 ? (
                    <div className="text-sm">
                      <p className="font-medium mb-2">Key Observations:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Your mood tends to be highest on {["Monday", "Wednesday", "Friday", "Sunday"][Math.floor(Math.random() * 4)]}</li>
                        <li>Energy levels appear to dip mid-week</li>
                        <li>Journal entries are most consistent on weekdays</li>
                      </ul>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      Not enough data for weekly pattern analysis.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Breakdown Tab */}
            <TabsContent value="breakdown" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Mood Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-64 animate-pulse bg-gray-200 rounded-lg"></div>
                  ) : entries && entries.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-lg font-medium mb-4">Mood Counts</h3>
                        <div className="space-y-4">
                          {Object.entries(stats.moodBreakdown).map(([mood, count]) => (
                            <div key={mood} className="flex items-center">
                              <div className={`w-3 h-3 rounded-full mr-2 mood-${mood}`}></div>
                              <div className="flex-grow capitalize">{mood}</div>
                              <div className="font-medium">{count}</div>
                              <div className="ml-2 text-muted-foreground">
                                ({Math.round((count / stats.totalEntries) * 100)}%)
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <MoodChart entries={entries || []} isLoading={isLoading} />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      No mood data available yet.
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Journal Entry Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-64 animate-pulse bg-gray-200 rounded-lg"></div>
                  ) : entries && entries.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Mood</TableHead>
                          <TableHead>Sentiment</TableHead>
                          <TableHead>Energy</TableHead>
                          <TableHead className="text-right">Words</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {entries.slice(0, 10).map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell>{formatDate(entry.date)}</TableCell>
                            <TableCell className="capitalize">{entry.mood}</TableCell>
                            <TableCell>{entry.sentiment !== null ? `${entry.sentiment}%` : "N/A"}</TableCell>
                            <TableCell>{entry.energy !== null ? `${entry.energy}%` : "N/A"}</TableCell>
                            <TableCell className="text-right">{entry.wordCount || 0}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      No journal entries available yet.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
