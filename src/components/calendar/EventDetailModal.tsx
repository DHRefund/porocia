"use client"

import React from 'react'
import { X, Clock, User, Tag, Trash2, Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { CalendarEvent } from '@/lib/firebase/events'
import { useAuth } from '@/components/AuthProvider'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

interface EventDetailModalProps {
  isOpen: boolean
  onClose: () => void
  event: CalendarEvent | null
  onDelete: (id: string) => void
}

export default function EventDetailModal({ isOpen, onClose, event, onDelete }: EventDetailModalProps) {
  const { user, profile } = useAuth()
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false)

  if (!isOpen || !event) return null

  // Kiểm tra quyền xóa: Là người tạo hoặc là Admin
  const canDelete = user?.uid === event.createdBy || profile?.role === 'admin'

  const handleDelete = () => {
    onDelete(event.id)
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-near-black/40 backdrop-blur-sm animate-in fade-in duration-300" 
          onClick={onClose}
        />

        {/* Modal Content */}
        <div className="relative w-full max-w-md overflow-hidden bg-background rounded-[32px] border border-cream shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-8 duration-300">
          
          {/* Header with Type Color */}
          <div className={`h-2 w-full ${getTypeColor(event.type)}`} />
          
          <div className="px-8 pt-6 pb-4 flex justify-between items-start">
            <div className="flex-1">
               <div className="flex items-center gap-2 mb-2 text-[10px] font-bold text-stone uppercase tracking-[0.2em]">
                 <CalendarIcon size={12} />
                 <span>Event Details</span>
               </div>
               <h2 className="font-heading text-2xl font-bold text-near-black leading-tight">
                 {event.title}
               </h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-cream rounded-full text-stone transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="px-8 py-6 space-y-6">
            {/* Time */}
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone/5 text-stone">
                <Clock size={16} />
              </div>
              <div>
                <p className="text-sm font-bold text-near-black">
                  {format(event.start, 'yyyy年 M月 d日 (E)', { locale: ja })}
                </p>
                <p className="text-xs text-stone mt-0.5">
                  {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
                </p>
              </div>
            </div>

            {/* Creator */}
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone/5 text-stone">
                <User size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-stone uppercase tracking-widest mb-0.5">作成者</p>
                <p className="text-sm font-medium text-near-black">{event.creatorName}</p>
              </div>
            </div>

            {/* Category */}
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone/5 text-stone">
                <Tag size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-stone uppercase tracking-widest mb-1.5">カテゴリ</p>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold text-white ${getTypeColor(event.type)}`}>
                  {getTypeLabel(event.type)}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-8 py-6 border-t border-cream bg-ivory/20 flex justify-between items-center">
            {canDelete ? (
              <button 
                onClick={() => setIsConfirmOpen(true)}
                className="flex items-center gap-2 text-destructive hover:bg-destructive/10 px-4 py-2 rounded-xl transition-all active:scale-95 text-xs font-bold"
              >
                <Trash2 size={14} />
                イベントを削除
              </button>
            ) : (
              <div className="text-[10px] text-stone italic">
                ※このイベントを削除する権限がありません
              </div>
            )}
            
            <button 
              onClick={onClose}
              className="bg-near-black text-ivory px-6 py-2 rounded-xl text-xs font-bold transition-all hover:bg-stone active:scale-95"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>

      {/* Reusable Confirm Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="イベントを削除"
        description="このイベントを削除してもよろしいですか？この操作は取り消せません。"
      />
    </>
  )
}

function getTypeColor(type: string) {
  switch (type) {
    case 'warning': return 'bg-amber-600'
    case 'success': return 'bg-green-600'
    case 'info': return 'bg-blue-600'
    default: return 'bg-terracotta'
  }
}

function getTypeLabel(type: string) {
  switch (type) {
    case 'warning': return '締切'
    case 'success': return '来客 / 外出'
    case 'info': return 'イベント'
    default: return '会議'
  }
}
