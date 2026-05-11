import { Hash } from "lucide-react";

export default function ChatIndexPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-background text-[--color-stone-gray]">
      <Hash className="mb-4 h-12 w-12 opacity-50" />
      <h2 className="text-xl font-medium text-[--color-near-black]">チャンネルを選択してください</h2>
      <p className="mt-2 text-sm text-stone">サイドバーからチャンネルを選択してチャットを開始してください</p>
    </div>
  );
}