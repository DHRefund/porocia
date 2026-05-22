import { Calendar, Wrench } from "lucide-react";

export default function EventsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
      <div className="relative">
        <div className="absolute inset-0 bg-olive/10 rounded-full blur-3xl animate-pulse" />
        <div className="relative bg-white border-2 border-cream rounded-3xl p-8 shadow-lg">
          <Calendar className="w-16 h-16 text-olive mx-auto animate-bounce" style={{ animationDuration: '2s' }} />
        </div>
      </div>

      <div className="space-y-3 max-w-md">
        <h1 className="text-3xl font-heading font-bold text-near-black">
          イベント管理
        </h1>
        <p className="text-stone text-lg">
          この機能は現在開発中です
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-stone/60 pt-4">
          <Wrench className="w-4 h-4" />
          <span>Coming Soon...</span>
        </div>
      </div>

      <div className="bg-ivory/50 border border-cream rounded-2xl p-6 max-w-lg">
        <p className="text-xs text-stone leading-relaxed">
          イベント管理ページでは、会社全体のイベント作成、編集、削除、参加者管理などの高度な機能を提供します。
        </p>
      </div>
    </div>
  );
}
