import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/hooks/use-chat";

interface ChatInputProps {
  input: string;
  setInput: (val: string) => void;
  handleSend: () => void;
  sending: boolean;
  replyingTo?: ChatMessage | null;
  setReplyingTo?: (msg: ChatMessage | null) => void;
}

const EMOJIS = [
  "😀", "😃", "😄", "😁", "😆", "😅", "😂",
  "🤣", "🥲", "☺️", "😊", "😇", "🙂", "🙃",
  "😉", "😌", "😍", "🥰", "😘", "😗", "😙",
  "😚", "😋", "😛", "😝", "😜", "🤪", "🤨",
  "🧐", "🤓", "😎", "🥸", "🤩", "🥳", "😏",
  "😒", "😞", "😔", "😟", "😕", "🙁", "☹️",
  "😣", "😖", "😫", "😩", "🥺", "😢", "😭",
  "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵",
  "🥶", "😱", "😨", "😰", "😥", "😓", "🤗"
];

export function ChatInput({ 
  input, 
  setInput, 
  handleSend, 
  sending,
  replyingTo,
  setReplyingTo
}: ChatInputProps) {
  const [showEmoji, setShowEmoji] = useState(false);
  const emojiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showEmoji) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmoji]);

  return (
    <div className="space-y-2">
      {/* Reply Preview */}
      {replyingTo && (
        <div className="mx-6 flex items-center justify-between gap-4 rounded-xl bg-cream/40 px-4 py-2 border-l-4 border-terracotta animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex-1 overflow-hidden">
            <p className="text-[10px] font-bold uppercase tracking-wider text-terracotta">
              Replying to {replyingTo.senderName}
            </p>
            <p className="truncate text-xs text-stone italic">
              {replyingTo.text}
            </p>
          </div>
          <button 
            onClick={() => setReplyingTo?.(null)}
            className="rounded-full p-1 hover:bg-cream text-stone transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      )}

      <div className="px-6 py-4">
        <div 
          className="relative flex flex-col rounded-xl bg-[#f2f4f7] p-3 shadow-sm border border-[#e8e2d9]" 
          ref={emojiRef}
        >
          {/* Emoji Picker Popup positioned above the entire input box */}
          {showEmoji && (
            <div className="absolute bottom-full left-0 mb-3 z-50 w-[320px] rounded-xl bg-white shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-[#e8e2d9] animate-in slide-in-from-bottom-2 duration-200 overflow-hidden flex flex-col">
              {/* Top Tabs */}
              <div className="flex px-2 pt-2 border-b border-[#e8e2d9]">
                <button className="px-4 py-2 text-[13px] font-medium text-stone hover:text-near-black transition-colors">
                  Sticker
                </button>
                <button className="px-4 py-2 text-[13px] font-bold text-[#3b82f6] border-b-[3px] border-[#3b82f6]">
                  Emoticon
                </button>
              </div>
              
              {/* Secondary Tabs */}
              <div className="flex px-3 py-2 border-b border-[#e8e2d9] gap-2 bg-[#fdfdfd]">
                <button className="p-1 rounded-md text-stone hover:bg-[#f0f2f5] transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-8.5c-1.11 4.5-2.2 6.9-4 8.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"></path></svg>
                </button>
                <button className="p-1 rounded-md bg-[#f0f2f5] text-near-black">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>
                </button>
              </div>

              {/* Emojis Grid */}
              <div 
                className="p-3 h-[220px] overflow-y-auto overflow-x-hidden scrollbar-thin overscroll-none"
                onWheel={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
              >
                <div className="grid grid-cols-7 gap-y-4 gap-x-1">
                  {EMOJIS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => {
                        setInput(input + emoji);
                        setShowEmoji(false);
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-[22px] hover:bg-[#f0f2f5] transition-colors hover:scale-110 mx-auto leading-none"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={1}
            placeholder="Enter your message (Enter: Send / Shift + Enter: New line)"
            className="w-full resize-none bg-transparent px-2 py-2 text-[15px] text-near-black placeholder:text-stone/80 focus:outline-none overflow-y-auto max-h-[150px] scrollbar-thin"
          />
          
          <div className="flex items-center justify-between mt-2 px-1">
            <div className="flex items-center gap-1.5 relative">
              <button className="p-1.5 text-stone hover:text-near-black hover:bg-stone/10 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </button>
              <button className="p-1.5 text-stone hover:text-near-black hover:bg-stone/10 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
              </button>
              <button className="p-1.5 text-stone hover:text-near-black hover:bg-stone/10 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>
              </button>
              
              <button 
                onClick={() => setShowEmoji(!showEmoji)}
                className={`p-1.5 rounded-full transition-colors ${showEmoji ? 'text-[#3b82f6] bg-[#3b82f6]/10' : 'text-stone hover:text-near-black hover:bg-stone/10'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                  <line x1="9" x2="9.01" y1="9" y2="9"/>
                  <line x1="15" x2="15.01" y1="9" y2="9"/>
                </svg>
              </button>
            </div>

            {/* Send button (optional, kept for accessibility) */}
            <button
              onClick={handleSend}
              disabled={sending || !input.trim()}
              className="p-1.5 rounded-full text-stone hover:bg-terracotta hover:text-ivory transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-stone"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-0.5">
                <line x1="22" x2="11" y1="2" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
