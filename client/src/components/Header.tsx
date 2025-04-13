import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Leaf } from "lucide-react";

interface HeaderProps {
  onNewEntry: () => void;
}

export default function Header({ onNewEntry }: HeaderProps) {
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm px-6 py-3 flex justify-between items-center">
      <div className="flex items-center">
        <Leaf className="h-8 w-8 text-primary" />
        <h1 className="text-xl font-bold ml-2 font-primary text-primary">Garden Mindful</h1>
      </div>
      
      <div className="flex items-center">
        <Button 
          onClick={onNewEntry}
          className="text-sm bg-secondary text-white px-4 py-2 rounded-full flex items-center hover:bg-opacity-90 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          New Entry
        </Button>
        
        <div className="relative ml-3">
          <button 
            onClick={() => {
              toast({
                title: "User Profile",
                description: "User profile functionality coming soon!",
              });
            }}
            className="flex items-center focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
              <span className="font-bold">G</span>
            </div>
            <span className="ml-2 text-sm font-medium hidden md:block">Guest User</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
