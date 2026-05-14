"use client"

import React, { useEffect } from 'react'
import { 
  format, 
  addMonths, 
  subMonths, 
  addYears,
  subYears,
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  eachDayOfInterval 
} from 'date-fns'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MiniCalendarProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  activeCategories: string[]
  setActiveCategories: React.Dispatch<React.SetStateAction<string[]>>
}

export default function MiniCalendar({ 
  selectedDate, 
  onDateChange,
  searchQuery,
  setSearchQuery,
  activeCategories,
  setActiveCategories
}: MiniCalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(startOfMonth(selectedDate))

  useEffect(() => {
    setCurrentMonth(startOfMonth(selectedDate))
  }, [selectedDate])

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const nextYear = () => setCurrentMonth(addYears(currentMonth, 1))
  const prevYear = () => setCurrentMonth(subYears(currentMonth, 1))

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  })

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  const toggleCategory = (id: string) => {
    setActiveCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  const categoryOptions = [
    { id: 'event', label: '会議', color: 'bg-terracotta' },
    { id: 'success', label: '来客 / 外出', color: 'bg-green-600' },
    { id: 'warning', label: '締切', color: 'bg-amber-600' },
    { id: 'info', label: 'イベント', color: 'bg-blue-600' },
  ]

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between px-1 mb-2">
        <div className="flex items-center gap-1">
          <button onClick={prevYear} className="p-1 hover:bg-cream rounded-md transition-colors text-stone/50">
            <ChevronsLeft size={14} />
          </button>
          <button onClick={prevMonth} className="p-1 hover:bg-cream rounded-md transition-colors text-stone/50">
            <ChevronLeft size={14} />
          </button>
        </div>
        
        <h3 className="text-[13px] font-bold text-near-black">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>

        <div className="flex items-center gap-1">
          <button onClick={nextMonth} className="p-1 hover:bg-cream rounded-md transition-colors text-stone/50">
            <ChevronRight size={14} />
          </button>
          <button onClick={nextYear} className="p-1 hover:bg-cream rounded-md transition-colors text-stone/50">
            <ChevronsRight size={14} />
          </button>
        </div>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {weekDays.map((day, i) => (
          <div key={i} className="text-[10px] font-bold text-stone/60 text-center py-1">
            {day}
          </div>
        ))}
        {calendarDays.map((day, i) => {
          const isToday = isSameDay(day, new Date())
          const isSelected = isSameDay(day, selectedDate)
          
          return (
            <button
              key={i}
              onClick={() => onDateChange(day)}
              className={cn(
                "h-8 w-8 mx-auto flex items-center justify-center rounded-full text-[11px] transition-all relative",
                !isSameMonth(day, monthStart) ? "text-stone/20" : "text-near-black font-medium",
                isSelected && "bg-[#2563eb] text-white font-bold shadow-md shadow-blue-500/20",
                isToday && !isSelected && "ring-2 ring-[#2563eb] ring-offset-1 text-[#2563eb]",
                !isSelected && "hover:bg-cream"
              )}
            >
              {format(day, 'd')}
            </button>
          )
        })}
      </div>

      {/* Search Filter */}
      <div className="relative pt-2">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone/50" />
        <input 
          type="text" 
          placeholder="イベントを検索"
          value={searchQuery || ''}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-ivory/30 border border-cream rounded-xl pl-9 pr-4 py-2.5 text-[13px] text-near-black placeholder:text-stone/40 focus:outline-none focus:ring-2 focus:ring-terracotta/10 transition-all"
        />
      </div>

      {/* Filter Groups */}
      <div className="space-y-4 pt-2 px-1">
        <h4 className="text-[10px] font-bold text-stone uppercase tracking-[0.2em] mb-2">カレンダー一覧</h4>
        {categoryOptions.map((filter) => (
          <label key={filter.id} className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input 
                type="checkbox" 
                checked={activeCategories.includes(filter.id)}
                onChange={() => toggleCategory(filter.id)}
                className={cn(
                  "peer h-5 w-5 appearance-none rounded-md border border-cream transition-all",
                  activeCategories.includes(filter.id) ? filter.color : "bg-white"
                )}
              />
              <svg className="absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span className="text-[14px] font-medium text-stone/80 group-hover:text-near-black transition-colors">{filter.label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
