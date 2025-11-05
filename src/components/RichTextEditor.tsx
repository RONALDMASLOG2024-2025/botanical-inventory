"use client";
import { useEffect, useRef, useState } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  rows?: number;
  className?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Enter text...",
  maxLength: _maxLength,
  rows = 4,
  className = "",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    // Set initial content only if it's different and we're not currently updating
    if (editorRef.current && !isUpdatingRef.current) {
      const currentContent = editorRef.current.innerHTML;
      const newContent = value || "";
      
      // Only update if content is actually different to avoid cursor jumps
      if (currentContent !== newContent) {
        editorRef.current.innerHTML = newContent;
      }
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current && !isUpdatingRef.current) {
      isUpdatingRef.current = true;
      
      const html = editorRef.current.innerHTML;
      // Always allow the change - let the parent component handle validation
      onChange(html);
      
      // Reset the flag after a short delay
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          execCommand('underline');
          break;
      }
    }
  };

  const execCommand = (command: string, value: string | undefined = undefined) => {
    if (!editorRef.current) return;
    
    // Save current selection
    const selection = window.getSelection();
    const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    
    // Focus the editor
    editorRef.current.focus();
    
    // Restore selection if it was saved
    if (range && selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
    
    try {
      // Execute the command
      const success = document.execCommand(command, false, value);
      
      if (!success) {
        console.warn(`Command ${command} failed`);
      }
      
      // Update the content after command execution
      setTimeout(() => {
        handleInput();
      }, 20);
    } catch (error) {
      console.error(`Error executing command ${command}:`, error);
    }
  };

  const insertList = (ordered: boolean) => {
    if (!editorRef.current) return;
    
    // Save current selection
    const selection = window.getSelection();
    const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    
    // Focus the editor
    editorRef.current.focus();
    
    // Restore selection if it was saved
    if (range && selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
    
    try {
      const command = ordered ? "insertOrderedList" : "insertUnorderedList";
      const success = document.execCommand(command, false, undefined);
      
      if (!success) {
        console.warn(`List command ${command} failed`);
      }
      
      setTimeout(() => {
        handleInput();
      }, 20);
    } catch (error) {
      console.error(`Error inserting list:`, error);
    }
  };

  const applyHeading = (tag: string) => {
    if (!editorRef.current) return;
    
    // Save current selection
    const selection = window.getSelection();
    const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    
    // Focus the editor
    editorRef.current.focus();
    
    // Restore selection if it was saved
    if (range && selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
    
    try {
      // Use formatBlock for headings
      const success = document.execCommand("formatBlock", false, `<${tag}>`);
      
      if (!success) {
        console.warn(`Heading command for ${tag} failed`);
      }
      
      setTimeout(() => {
        handleInput();
      }, 20);
    } catch (error) {
      console.error(`Error applying heading:`, error);
    }
  };

  const clearFormatting = () => {
    if (!editorRef.current) return;
    
    // Save current selection
    const selection = window.getSelection();
    const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    
    // Focus the editor
    editorRef.current.focus();
    
    // Restore selection if it was saved
    if (range && selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
    
    try {
      // Remove all formatting
      document.execCommand("removeFormat", false, undefined);
      // Reset to paragraph
      document.execCommand("formatBlock", false, "<p>");
      
      setTimeout(() => {
        handleInput();
      }, 20);
    } catch (error) {
      console.error(`Error clearing formatting:`, error);
    }
  };

  return (
    <div className={`border border-[hsl(var(--input))] rounded-lg overflow-hidden ${isFocused ? 'ring-2 ring-emerald-500 border-transparent' : ''} ${className}`}>
      {/* Toolbar */}
      <div className="bg-[hsl(var(--muted))] border-b border-[hsl(var(--border))] p-2 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            execCommand("bold");
          }}
          className="px-2.5 py-1.5 rounded hover:bg-[hsl(var(--accent))] text-[hsl(var(--foreground))] font-bold text-sm transition-colors"
          title="Bold (Ctrl+B)"
        >
          B
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            execCommand("italic");
          }}
          className="px-2.5 py-1.5 rounded hover:bg-[hsl(var(--accent))] text-[hsl(var(--foreground))] italic text-sm transition-colors"
          title="Italic (Ctrl+I)"
        >
          I
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            execCommand("underline");
          }}
          className="px-2.5 py-1.5 rounded hover:bg-[hsl(var(--accent))] text-[hsl(var(--foreground))] underline text-sm transition-colors"
          title="Underline (Ctrl+U)"
        >
          U
        </button>
        
        <div className="w-px h-6 bg-[hsl(var(--border))] mx-1"></div>
        
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            insertList(false);
          }}
          className="px-2.5 py-1.5 rounded hover:bg-[hsl(var(--accent))] text-[hsl(var(--foreground))] text-sm transition-colors"
          title="Bullet List"
        >
          • List
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            insertList(true);
          }}
          className="px-2.5 py-1.5 rounded hover:bg-[hsl(var(--accent))] text-[hsl(var(--foreground))] text-sm transition-colors"
          title="Numbered List"
        >
          1. List
        </button>
        
        <div className="w-px h-6 bg-[hsl(var(--border))] mx-1"></div>
        
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            applyHeading("h3");
          }}
          className="px-2.5 py-1.5 rounded hover:bg-[hsl(var(--accent))] text-[hsl(var(--foreground))] font-semibold text-sm transition-colors"
          title="Heading 3"
        >
          H3
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            applyHeading("h2");
          }}
          className="px-2.5 py-1.5 rounded hover:bg-[hsl(var(--accent))] text-[hsl(var(--foreground))] font-bold text-sm transition-colors"
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            applyHeading("p");
          }}
          className="px-2.5 py-1.5 rounded hover:bg-[hsl(var(--accent))] text-[hsl(var(--foreground))] text-sm transition-colors"
          title="Paragraph"
        >
          P
        </button>
        
        <div className="w-px h-6 bg-[hsl(var(--border))] mx-1"></div>
        
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            clearFormatting();
          }}
          className="px-2.5 py-1.5 rounded hover:bg-[hsl(var(--accent))] text-[hsl(var(--foreground))] text-sm transition-colors"
          title="Clear Formatting"
        >
          Clear
        </button>
      </div>

      {/* Editor Content */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`px-3 py-2 bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none min-h-[${rows * 1.5}rem] max-h-96 overflow-y-auto prose prose-sm max-w-none`}
        style={{ minHeight: `${rows * 1.5}rem` }}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />
      
      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: hsl(var(--muted-foreground));
          pointer-events: none;
        }
        [contenteditable] h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0.75rem 0;
          line-height: 1.3;
        }
        [contenteditable] h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0.5rem 0;
          line-height: 1.4;
        }
        [contenteditable] p {
          margin: 0.25rem 0;
          line-height: 1.6;
        }
        [contenteditable] ul, [contenteditable] ol {
          margin: 0.5rem 0;
          padding-left: 2rem;
        }
        [contenteditable] li {
          margin: 0.25rem 0;
          line-height: 1.6;
        }
        [contenteditable] strong, [contenteditable] b {
          font-weight: 700;
        }
        [contenteditable] em, [contenteditable] i {
          font-style: italic;
        }
        [contenteditable] u {
          text-decoration: underline;
        }
        [contenteditable]:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
}
