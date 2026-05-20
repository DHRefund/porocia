"use client"

import React, { useState, useEffect } from 'react'
import { X, AlignLeft, Clock, Tag, Building2, Users, User } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { CalendarEvent, CalendarScope } from '@/lib/firebase/events'
import { useAuth } from '@/components/AuthProvider'
import { getAllGroups, Group } from '@/lib/firebase/members'
import { cn } from '@/lib/utils'

interface AddEventModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (event: any) => void
  onUpdate?: (id: string, updates: any) => void
  selectedSlot?: { start: Date, end: Date }
  editingEvent?: CalendarEvent | null
}

const SCOPE_OPTIONS: { id: CalendarScope; label: string; subLabel: string; icon: React.ReactNode }[] = [
  {
    id: 'company',
    label: '社内共有',
    subLabel: '全員が閲覧可能',
    icon: <Building2 size={15} />,
  },
  {
    id: 'group',
    label: 'グループ',
    subLabel: 'チームメンバーのみ',
    icon: <Users size={15} />,
  },
  {
    id: 'personal',
    label: '個人',
    subLabel: '自分のみ',
    icon: <User size={15} />,
  },
]

const EVENT_TYPES = [
  { id: 'event', label: '会議', color: 'bg-terracotta' },
  { id: 'success', label: '来客 / 外出', color: 'bg-green-600' },
  { id: 'warning', label: '締切', color: 'bg-amber-600' },
  { id: 'info', label: 'イベント', color: 'bg-blue-600' },
]

export default function AddEventModal({
  isOpen,
  onClose,
  onAdd,
  onUpdate,
  selectedSlot,
  editingEvent,
}: AddEventModalProps) {
  const { user, profile } = useAuth()
  const [title, setTitle] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [type, setType] = useState('event')
  const [scope, setScope] = useState<CalendarScope>('company')
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState('')

  // Load and filter user groups when opening the modal
  useEffect(() => {
    if (isOpen && user) {
      getAllGroups().then((allGroups) => {
        // Show all groups for admin, only groups user belongs to for regular members
        const userGroups = profile?.role === 'admin'
          ? allGroups
          : allGroups.filter(g => g.members.includes(user.uid))
        setGroups(userGroups)
        
        if (editingEvent && editingEvent.scope === 'group') {
          setSelectedGroupId(editingEvent.groupId || '')
        } else if (userGroups.length > 0) {
          setSelectedGroupId(userGroups[0].id)
        } else {
          setSelectedGroupId('')
        }
      }).catch(err => {
        console.error("Error loading groups:", err)
      })
    }
  }, [isOpen, user, profile, editingEvent])

  // Sync state with editingEvent or selectedSlot
  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title)
      setStart(format(editingEvent.start, "yyyy-MM-dd'T'HH:mm"))
      setEnd(format(editingEvent.end, "yyyy-MM-dd'T'HH:mm"))
      setType(editingEvent.type)
      setScope(editingEvent.scope || 'company')
      if (editingEvent.scope === 'group') {
        setSelectedGroupId(editingEvent.groupId || '')
      }
    } else if (selectedSlot) {
      setTitle('')
      setStart(format(selectedSlot.start, "yyyy-MM-dd'T'HH:mm"))
      setEnd(format(selectedSlot.end, "yyyy-MM-dd'T'HH:mm"))
      setType('event')
      setScope('company')
    } else {
      setTitle('')
      const now = new Date()
      setStart(format(now, "yyyy-MM-dd'T'HH:mm"))
      setEnd(format(new Date(now.getTime() + 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"))
      setType('event')
      setScope('company')
    }
  }, [selectedSlot, editingEvent, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error("タイトルを入力してください")
      return
    }

    if (scope === 'group' && !selectedGroupId) {
      toast.error("投稿先のグループを選択してください")
      return
    }

    const selectedGroupObj = groups.find(g => g.id === selectedGroupId)

    const eventData = {
      title,
      start: new Date(start),
      end: new Date(end),
      type,
      scope,
      ...(scope === 'group' ? {
        groupId: selectedGroupId,
        groupName: selectedGroupObj ? selectedGroupObj.name : ''
      } : {
        groupId: '',
        groupName: ''
      })
    }

    if (editingEvent && onUpdate) {
      onUpdate(editingEvent.id, eventData)
      toast.success("イベントを更新しました")
    } else {
      onAdd(eventData)
      toast.success("イベントを追加しました")
    }

    onClose()
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6">
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
            <h2 className="font-heading text-xl font-bold text-near-black">
              {editingEvent ? 'イベントを編集' : '新しいイベント'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-cream rounded-full text-stone transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">

          {/* ── Scope Selector ── */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-stone uppercase tracking-widest px-1">
              <Building2 size={14} /> 公開範囲
            </label>
            <div className="grid grid-cols-3 gap-2">
              {SCOPE_OPTIONS.map((option) => {
                const isActive = scope === option.id
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setScope(option.id)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 px-3 py-3 rounded-2xl border text-center transition-all duration-200",
                      isActive
                        ? "border-terracotta bg-terracotta/8 text-terracotta shadow-sm"
                        : "border-cream bg-white text-stone hover:bg-cream/60 hover:border-cream"
                    )}
                  >
                    <span className={cn("transition-colors", isActive ? "text-terracotta" : "text-stone/60")}>
                      {option.icon}
                    </span>
                    <span className="text-[13px] font-bold leading-none">{option.label}</span>
                    <span className={cn("text-[10px] leading-none", isActive ? "text-terracotta/70" : "text-stone/40")}>
                      {option.subLabel}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── Group Selector (Visible only when scope is group) ── */}
          {scope === 'group' && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
              <label className="flex items-center gap-2 text-xs font-bold text-stone uppercase tracking-widest px-1">
                <Users size={14} /> 投稿先グループ
              </label>
              {groups.length === 0 ? (
                <div className="text-xs text-rose-500 bg-rose-50 border border-rose-100 rounded-2xl px-4 py-3">
                  所属しているグループがありません。先に管理画面でグループを作成し、メンバーを割り当ててください。
                </div>
              ) : (
                <select
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  className="w-full bg-ivory/30 border border-cream rounded-2xl px-5 py-4 text-near-black focus:outline-none focus:ring-2 focus:ring-terracotta/20 transition-all text-sm font-bold appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23706e6b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1.25rem center',
                    backgroundSize: '1em'
                  }}
                >
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.members.length} 人)
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* ── Title Input ── */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-stone uppercase tracking-widest px-1">
              <AlignLeft size={14} /> タイトル
            </label>
            <input
              autoFocus
              type="text"
              value={title || ''}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="何をする予定ですか？"
              className="w-full bg-ivory/30 border border-cream rounded-2xl px-5 py-4 text-near-black placeholder:text-stone/50 focus:outline-none focus:ring-2 focus:ring-terracotta/20 transition-all"
            />
          </div>

          {/* ── Time Range ── */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-stone uppercase tracking-widest px-1">
                <Clock size={14} /> 開始
              </label>
              <input
                type="datetime-local"
                value={start || ''}
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
                value={end || ''}
                onChange={(e) => setEnd(e.target.value)}
                className="w-full bg-ivory/30 border border-cream rounded-2xl px-4 py-3 text-sm text-near-black focus:outline-none focus:ring-2 focus:ring-terracotta/20"
              />
            </div>
          </div>

          {/* ── Event Type / Color ── */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-xs font-bold text-stone uppercase tracking-widest px-1">
              <Tag size={14} /> カテゴリ
            </label>
            <div className="flex flex-wrap gap-3 px-1">
              {EVENT_TYPES.map((item) => (
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

          {/* ── Actions ── */}
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
              {editingEvent ? '更新する' : '保存する'}
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
