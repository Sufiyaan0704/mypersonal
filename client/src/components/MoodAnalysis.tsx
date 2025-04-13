import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { InfoIcon } from "lucide-react";

interface MoodAnalysisProps {
  sentiment: number | null;
  energy: number | null;
  summary: string;
  keywords: string[];
  isLoading?: boolean;
}

export default function MoodAnalysis({ 
  sentiment, 
  energy, 
  summary, 
  keywords = [],
  isLoading = false 
}: MoodAnalysisProps) {
  
  const getSentimentDescription = (value: number | null) => {
    if (value === null) return "Unknown";
    if (value >= 80) return "Very Positive";
    if (value >= 60) return "Positive";
    if (value >= 40) return "Neutral";
    if (value >= 20) return "Negative";
    return "Very Negative";
  };
  
  const getEnergyDescription = (value: number | null) => {
    if (value === null) return "Unknown";
    if (value >= 80) return "Very High";
    if (value >= 60) return "High";
    if (value >= 40) return "Moderate";
    if (value >= 20) return "Low";
    return "Very Low";
  };
  
  return (
    <div className="bg-green-50 p-4 rounded-lg border border-green-100 mb-6">
      <h4 className="font-medium text-primary mb-2 flex items-center">
        <InfoIcon className="h-5 w-5 mr-2" />
        AI Mood Analysis
      </h4>
      
      {isLoading ? (
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-green-200 rounded w-3/4"></div>
          <div className="h-4 bg-green-200 rounded w-1/2"></div>
          <div className="flex justify-between mt-4 gap-4">
            <div className="w-full">
              <div className="h-2 bg-green-200 rounded-full"></div>
            </div>
            <div className="w-full">
              <div className="h-2 bg-green-200 rounded-full"></div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="text-sm text-gray-700">{summary}</div>
          
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500 mb-1">Sentiment Score</div>
                <div className="text-xs font-medium text-primary">
                  {getSentimentDescription(sentiment)}
                </div>
              </div>
              <Progress value={sentiment || 0} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500 mb-1">Energy Level</div>
                <div className="text-xs font-medium text-blue-500">
                  {getEnergyDescription(energy)}
                </div>
              </div>
              <Progress value={energy || 0} className="h-2 bg-blue-100" indicatorClassName="bg-blue-500" />
            </div>
          </div>
          
          {keywords.length > 0 && (
            <div className="mt-3">
              <div className="text-xs text-gray-500 mb-1">Keywords</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {keywords.map((keyword, index) => (
                  <Badge key={index} variant="outline" className="bg-white">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
