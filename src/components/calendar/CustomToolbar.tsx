"use client"

import React from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MoreVertical } from 'lucide-react'
import { ToolbarProps, View, Views } from 'react-big-calendar'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

export default function CustomToolbar({ 
  onNavigate, 
  onView, 
  view, 
  date 
}: ToolbarProps<any, any>) {
  
  const goToBack = () => onNavigate('PREV')
  const goToNext = () => onNavigate('NEXT')
  const goToToday = () => onNavigate('TODAY')

  const viewOptions = [
    { id: Views.DAY, label: 'Day' },
    { id: Views.WEEK, label: 'Week' },
    { id: Views.MONTH, label: 'Month' },
    { id: Views.AGENDA, label: 'Agenda' },
  ]

  return (
    <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-cream/50">
      
      {/* Left Section */}
      <div className="flex items-center gap-6">
        <button className="p-1 hover:bg-cream rounded-md text-stone/70 transition-colors">
          <MoreVertical size={20} />
        </button>

        <button 
          onClick={goToToday}
          className="flex items-center gap-2 px-4 py-1.5 hover:bg-cream rounded-lg text-[13px] font-bold text-near-black border border-cream/80 transition-all active:scale-95 shadow-sm"
        >
          <CalendarIcon size={14} className="text-stone" />
          Today
        </button>

        <div className="flex items-center gap-2">
          <button onClick={goToBack} className="p-1.5 hover:bg-cream rounded-full text-near-black transition-colors">
            <ChevronLeft size={22} />
          </button>
          <button onClick={goToNext} className="p-1.5 hover:bg-cream rounded-full text-near-black transition-colors">
            <ChevronRight size={22} />
          </button>
        </div>

        <h2 className="text-xl font-medium text-near-black ml-2 tracking-tight">
          {format(date, 'MMMM yyyy')}
        </h2>
      </div>

      {/* Right Section: View Switcher */}
      <div className="flex items-center bg-[#f0f1f3] p-1 rounded-xl border border-cream/30">
        {viewOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => onView(option.id as View)}
            className={`
              px-5 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-200
              ${view === option.id 
                ? 'bg-white text-near-black shadow-sm ring-1 ring-black/5 font-bold' 
                : 'text-stone/80 hover:text-near-black'}
            `}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
