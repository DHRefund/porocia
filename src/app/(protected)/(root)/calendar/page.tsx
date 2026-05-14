"use client"

import React, { useState, useEffect, useMemo } from 'react'
import PorociaCalendar from "@/components/calendar/PorociaCalendar";
import MiniCalendar from "@/components/calendar/MiniCalendar";
import AddEventModal from "@/components/calendar/AddEventModal";
import EventDetailModal from "@/components/calendar/EventDetailModal";
import { Calendar as CalendarIcon, Plus, Menu, Loader2 } from "lucide-react";
import { Views, View } from 'react-big-calendar';
import { subscribeToEvents, addCalendarEvent, deleteCalendarEvent, updateCalendarEvent, CalendarEvent } from "@/lib/firebase/events";
import { toast } from 'sonner';
import { useAuth } from "@/components/AuthProvider";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<View>(Views.MONTH)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  
  // Auth State
  const { user, profile } = useAuth()
  
  // State for Real Data
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategories, setActiveCategories] = useState<string[]>(['event', 'success', 'warning', 'info'])
  
  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date, end: Date } | undefined>()
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)

  // Subscribe to Firestore Events
  useEffect(() => {
    const unsubscribe = subscribeToEvents((fetchedEvents) => {
      setEvents(fetchedEvents)
      setIsLoading(false)
    })
    
    return () => unsubscribe()
  }, [])

  // Logic lọc sự kiện thời gian thực
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = activeCategories.includes(event.type)
      return matchesSearch && matchesCategory
    })
  }, [events, searchQuery, activeCategories])

  const handleSelectSlot = (slot: { start: Date, end: Date }) => {
    setEditingEvent(null)
    setSelectedSlot(slot)
    setIsAddModalOpen(true)
  }

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setIsDetailModalOpen(true)
  }

  const handleOpenEdit = (event: CalendarEvent) => {
    setIsDetailModalOpen(false)
    setEditingEvent(event)
    setIsAddModalOpen(true)
  }

  const handleAddEvent = async (newEventData: any) => {
    if (!user) {
      toast.error("ログインが必要です")
      return
    }

    try {
      await addCalendarEvent({
        title: newEventData.title,
        start: newEventData.start,
        end: newEventData.end,
        type: newEventData.type,
        createdBy: user.uid,
        creatorName: profile?.displayName || user.displayName || "Unknown User",
      })
    } catch (error) {
      toast.error("イベントの保存に失敗しました")
    }
  }

  const handleUpdateEvent = async (id: string, updates: any) => {
    try {
      await updateCalendarEvent(id, updates)
    } catch (error) {
      toast.error("更新に失敗しました")
    }
  }

  const handleDeleteEvent = async (id: string) => {
    try {
      await deleteCalendarEvent(id)
      toast.success("イベントを削除しました")
    } catch (error) {
      toast.error("削除に失敗しました")
    }
  }

  const handleOpenAddModal = () => {
    setEditingEvent(null)
    setSelectedSlot(undefined)
    setIsAddModalOpen(true)
  }

  return (
    <div className="flex h-[calc(100vh-5rem)] flex-col overflow-hidden bg-parchment text-near-black">
      
      {/* ── Top Header ── */}
      <div className="flex flex-shrink-0 items-center justify-between border-b border-cream/50 bg-background px-6 py-2.5 lg:px-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-cream rounded-xl text-stone transition-colors"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-terracotta/10 text-terracotta">
              <CalendarIcon size={15} />
            </div>
            <h1 className="font-heading text-lg font-bold tracking-tight">
              カレンダー
            </h1>
            {isLoading && <Loader2 size={16} className="animate-spin text-stone/50" />}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-1.5 border border-cream rounded-xl text-[13px] font-bold text-stone hover:bg-cream transition-colors"
          >
            今日
          </button>
          <button 
            onClick={handleOpenAddModal}
            className="flex h-9 items-center gap-2 rounded-xl bg-terracotta px-5 text-sm font-bold text-ivory shadow-md shadow-terracotta/20 transition-all hover:bg-[#bf5d3c] active:scale-95"
          >
            <Plus size={14} />
            作成
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside 
          className={`
            w-72 border-r border-cream bg-white/50 backdrop-blur-sm p-6 overflow-y-auto transition-all duration-300
            ${isSidebarOpen ? 'ml-0' : '-ml-72 opacity-0'}
          `}
        >
          <MiniCalendar 
            selectedDate={currentDate} 
            onDateChange={setCurrentDate}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeCategories={activeCategories}
            setActiveCategories={setActiveCategories}
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 p-4 lg:p-6 bg-parchment/30 overflow-hidden">
          <PorociaCalendar 
            events={filteredEvents}
            date={currentDate}
            view={view}
            onView={setView}
            onNavigate={setCurrentDate}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
          />
        </main>
      </div>

      {/* Modals */}
      <AddEventModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddEvent}
        onUpdate={handleUpdateEvent}
        selectedSlot={selectedSlot}
        editingEvent={editingEvent}
      />

      <EventDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        event={selectedEvent}
        onDelete={handleDeleteEvent}
        onEdit={handleOpenEdit}
      />
    </div>
  );
}
