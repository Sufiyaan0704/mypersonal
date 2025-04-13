import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { JournalEntry } from "@shared/schema";

interface MoodChartProps {
  entries: JournalEntry[];
  isLoading?: boolean;
}

const MOOD_COLORS = {
  happy: "#4CAF50",  // green
  calm: "#3B82F6",   // blue
  neutral: "#F59E0B", // yellow
  tired: "#F97316",  // orange
  sad: "#EF4444",    // red
};

const RADIAN = Math.PI / 180;

// Custom label for pie chart
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${name} ${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function MoodChart({ entries, isLoading = false }: MoodChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [moodDistribution, setMoodDistribution] = useState<any[]>([]);
  const [energyOverTime, setEnergyOverTime] = useState<any[]>([]);

  useEffect(() => {
    if (entries && entries.length > 0) {
      // Prepare data for charts
      const processedData = entries.map(entry => ({
        date: new Date(entry.date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        sentiment: entry.sentiment || 0,
        energy: entry.energy || 0,
        mood: entry.mood
      })).reverse(); // Most recent last for time-series

      // Set sentiment over time (reverse for chronological order)
      setChartData(processedData);

      // Count occurrences of each mood
      const moodCounts: Record<string, number> = {};
      entries.forEach(entry => {
        moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
      });

      // Format data for pie chart
      const distribution = Object.keys(moodCounts).map(mood => ({
        name: mood.charAt(0).toUpperCase() + mood.slice(1),
        value: moodCounts[mood],
        color: MOOD_COLORS[mood as keyof typeof MOOD_COLORS] || "#999"
      }));
      setMoodDistribution(distribution);

      // Energy over time
      setEnergyOverTime(processedData);
    }
  }, [entries]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mood Trends</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <div className="animate-pulse w-full h-64 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mood Trends</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <p>No journal entries yet.</p>
            <p className="text-sm">Create entries to see your mood trends.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mood Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="sentiment">
          <TabsList className="mb-4">
            <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
            <TabsTrigger value="energy">Energy</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sentiment" className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 30,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="sentiment"
                  name="Sentiment Score"
                  stroke="#4CAF50"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="energy" className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={energyOverTime}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 30,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="energy" name="Energy Level" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="distribution" className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={moodDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {moodDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
