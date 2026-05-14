"use client"

import React, { useState, useEffect } from 'react'
import { X, Calendar as CalendarIcon, Clock, Tag, AlignLeft } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface AddEventModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (event: any) => void
  selectedSlot?: { start: Date, end: Date }
}

export default function AddEventModal({ isOpen, onClose, onAdd, selectedSlot }: AddEventModalProps) {
  const [title, setTitle] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [type, setType] = useState('event')

  // Cập nhật thời gian khi người dùng click vào ô trên lịch
  useEffect(() => {
    if (selectedSlot) {
      setStart(format(selectedSlot.start, "yyyy-MM-dd'T'HH:mm"))
      setEnd(format(selectedSlot.end, "yyyy-MM-dd'T'HH:mm"))
    } else {
      const now = new Date()
      setStart(format(now, "yyyy-MM-dd'T'HH:mm"))
      setEnd(format(new Date(now.getTime() + 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"))
    }
  }, [selectedSlot, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error("タイトルを入力してください")
      return
    }

    const newEvent = {
      id: Math.random(),
      title,
      start: new Date(start),
      end: new Date(end),
      type
    }

    onAdd(newEvent)
    toast.success("イベントを追加しました", {
      description: title
    })
    
    // Reset & Close
    setTitle('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-near-black/40 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg overflow-hidden bg-background rounded-[32px] border border-cream shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-8 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-cream">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-terracotta/10 text-terracotta">
              <PlusIcon size={20} />
            </div>
            <h2 className="font-heading text-xl font-bold text-near-black">新しいイベント</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-cream rounded-full text-stone transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Title Input */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-stone uppercase tracking-widest px-1">
              <AlignLeft size={14} /> タイトル
            </label>
            <input 
              autoFocus
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="何をする予定ですか？"
              className="w-full bg-ivory/30 border border-cream rounded-2xl px-5 py-4 text-near-black placeholder:text-stone/50 focus:outline-none focus:ring-2 focus:ring-terracotta/20 transition-all"
            />
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-stone uppercase tracking-widest px-1">
                <Clock size={14} /> 開始
              </label>
              <input 
                type="datetime-local" 
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-full bg-ivory/30 border border-cream rounded-2xl px-4 py-3 text-sm text-near-black focus:outline-none focus:ring-2 focus:ring-terracotta/20"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-stone uppercase tracking-widest px-1">
                <Clock size={14} /> 終了
              </label>
              <input 
                type="datetime-local" 
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="w-full bg-ivory/30 border border-cream rounded-2xl px-4 py-3 text-sm text-near-black focus:outline-none focus:ring-2 focus:ring-terracotta/20"
              />
            </div>
          </div>

          {/* Event Type / Color */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-xs font-bold text-stone uppercase tracking-widest px-1">
              <Tag size={14} /> カテゴリ
            </label>
            <div className="flex flex-wrap gap-3 px-1">
              {[
                { id: 'event', label: '会議', color: 'bg-terracotta' },
                { id: 'success', label: '来客 / 外出', color: 'bg-green-600' },
                { id: 'warning', label: '締切', color: 'bg-amber-600' },
                { id: 'info', label: 'イベント', color: 'bg-blue-600' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setType(item.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all
                    ${type === item.id 
                      ? 'border-transparent text-white shadow-md ' + item.color
                      : 'border-cream bg-white text-stone hover:bg-cream'}
                  `}
                >
                  <div className={`w-2 h-2 rounded-full ${type === item.id ? 'bg-white' : item.color}`} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-sm font-bold text-stone hover:text-near-black transition-colors"
            >
              キャンセル
            </button>
            <button 
              type="submit"
              className="bg-terracotta text-ivory px-8 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-terracotta/20 hover:bg-[#bf5d3c] active:scale-95 transition-all"
            >
              保存する
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function PlusIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  )
}
