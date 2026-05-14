"use client"

import React from 'react'
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { ja } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import './calendar.css'
import CustomToolbar from './CustomToolbar'

// Setup Localizer
const locales = { 'ja': ja }

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

interface PorociaCalendarProps {
  events: any[]
  date: Date
  view: View
  onView: (view: View) => void
  onNavigate: (date: Date) => void
  onSelectSlot: (slot: any) => void
  onSelectEvent: (event: any) => void
}

export default function PorociaCalendar({ 
  events, 
  date, 
  view, 
  onView, 
  onNavigate,
  onSelectSlot,
  onSelectEvent
}: PorociaCalendarProps) {

  const eventPropGetter = (event: any) => {
    let backgroundColor = 'var(--terracotta)'
    if (event.type === 'warning') backgroundColor = '#d97706'
    if (event.type === 'success') backgroundColor = '#059669'
    if (event.type === 'info') backgroundColor = '#2563eb'
    return { style: { backgroundColor } }
  }

  return (
    <div className="h-full overflow-hidden rounded-2xl border border-cream bg-white shadow-sm">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        culture="ja"
        view={view}
        onView={onView}
        date={date}
        onNavigate={onNavigate}
        eventPropGetter={eventPropGetter}
        selectable
        onSelectSlot={onSelectSlot}
        onSelectEvent={onSelectEvent}
        popup={true}
        components={{
          toolbar: CustomToolbar
        }}
        messages={{
          next: "次へ",
          previous: "前へ",
          today: "今日",
          month: "月",
          week: "週",
          day: "日",
          agenda: "予定リスト",
          noEventsInRange: "この期間内に予定はありません。",
        }}
      />
    </div>
  )
}
