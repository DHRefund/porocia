import { ChatMessage } from "@/hooks/use-chat";

interface ChatInputProps {
  input: string;
  setInput: (val: string) => void;
  handleSend: () => void;
  sending: boolean;
  replyingTo?: ChatMessage | null;
  setReplyingTo?: (msg: ChatMessage | null) => void;
}

export function ChatInput({ 
  input, 
  setInput, 
  handleSend, 
  sending,
  replyingTo,
  setReplyingTo
}: ChatInputProps) {
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
      <div className="relative flex items-center rounded-full border border-cream bg-ivory p-2 pr-2 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
        <button className="flex h-10 w-10 flex-shrink-0 items-center justify-center text-stone transition-colors hover:text-dark">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M8 12h8"/>
            <path d="M12 8v8"/>
          </svg>
        </button>
        
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
  placeholder="Message the community..."
  className="flex-1 resize-none bg-transparent px-2 py-3 text-[15px] text-near-black placeholder:text-stone focus:outline-none overflow-hidden"
/>
        
        <div className="flex items-center gap-1">
          <button className="flex h-10 w-10 flex-shrink-0 items-center justify-center text-stone transition-colors hover:text-dark">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
              <line x1="9" x2="9.01" y1="9" y2="9"/>
              <line x1="15" x2="15.01" y1="9" y2="9"/>
            </svg>
          </button>

          <button
            onClick={handleSend}
            disabled={sending || !input.trim()}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-terracotta text-ivory transition-colors hover:bg-[#bf5d3c] disabled:opacity-60"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-0.5">
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
