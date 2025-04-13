import { useState, useRef, useEffect } from "react";
import { Bold, Italic, List, AlignLeft, AlignCenter, AlignRight, Cloud } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface JournalEditorProps {
  content: string;
  onChange: (content: string) => void;
  minHeight?: string;
}

export default function JournalEditor({ content, onChange, minHeight = "200px" }: JournalEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Format functions
  const handleFormat = (command: string, value: string | null = null) => {
    document.execCommand(command, false, value);
    updateContentFromEditor();
  };

  const updateContentFromEditor = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // Set initial content and handle focus
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = content;
    }
  }, []); // Only on mount

  return (
    <div className={`border rounded-lg ${isFocused ? 'ring-2 ring-primary border-primary' : 'border-gray-300'}`}>
      <div className="flex flex-wrap space-x-1 mb-2 border-b border-gray-200 p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('bold')}
          className="p-1 h-8 w-8"
        >
          <Bold className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('italic')}
          className="p-1 h-8 w-8"
        >
          <Italic className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('insertUnorderedList')}
          className="p-1 h-8 w-8"
        >
          <List className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('justifyLeft')}
          className="p-1 h-8 w-8"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('justifyCenter')}
          className="p-1 h-8 w-8"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('justifyRight')}
          className="p-1 h-8 w-8"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        
        <div className="flex-grow"></div>
        
        <Button
          variant="ghost"
          size="sm"
          className="text-xs flex items-center"
        >
          <Cloud className="h-4 w-4 mr-1" />
          <span>Auto-save on</span>
        </Button>
      </div>
      
      <div
        ref={editorRef}
        contentEditable={true}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          updateContentFromEditor();
        }}
        onInput={updateContentFromEditor}
        className={`journal-content p-3 outline-none min-h-[${minHeight}]`}
        style={{ minHeight }}
      />
    </div>
  );
}
