import { useState } from "react";
import { SmilePlus, SmileIcon, Meh, Frown, Zap } from "lucide-react";

interface MoodSelectorProps {
  selectedMood: string;
  onMoodSelect: (mood: string) => void;
}

interface MoodOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  activeClass: string;
  hoverClass: string;
}

export default function MoodSelector({ selectedMood, onMoodSelect }: MoodSelectorProps) {
  const moodOptions: MoodOption[] = [
    {
      id: "happy",
      label: "Happy",
      icon: <SmilePlus className="h-8 w-8" />,
      activeClass: "border-primary bg-primary bg-opacity-10",
      hoverClass: "hover:border-primary hover:bg-primary hover:bg-opacity-10"
    },
    {
      id: "calm",
      label: "Calm",
      icon: <SmileIcon className="h-8 w-8" />,
      activeClass: "border-blue-500 bg-blue-50",
      hoverClass: "hover:border-blue-500 hover:bg-blue-50"
    },
    {
      id: "neutral",
      label: "Neutral",
      icon: <Meh className="h-8 w-8" />,
      activeClass: "border-yellow-500 bg-yellow-50",
      hoverClass: "hover:border-yellow-500 hover:bg-yellow-50"
    },
    {
      id: "tired",
      label: "Tired",
      icon: <Zap className="h-8 w-8" />,
      activeClass: "border-orange-500 bg-orange-50",
      hoverClass: "hover:border-orange-500 hover:bg-orange-50"
    },
    {
      id: "sad",
      label: "Sad",
      icon: <Frown className="h-8 w-8" />,
      activeClass: "border-red-500 bg-red-50",
      hoverClass: "hover:border-red-500 hover:bg-red-50"
    }
  ];

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-1">How are you feeling today?</label>
      <div className="flex flex-wrap gap-4">
        {moodOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => onMoodSelect(option.id)}
            className={`flex flex-col items-center p-3 rounded-lg border-2 mood-entry-transition ${
              selectedMood === option.id 
                ? option.activeClass 
                : `border-gray-200 ${option.hoverClass}`
            }`}
          >
            <div className={selectedMood === option.id ? "text-primary" : "text-gray-400"}>
              {option.icon}
            </div>
            <span className="mt-1 text-sm font-medium">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
