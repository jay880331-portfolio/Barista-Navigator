import { useState } from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { SectionNav } from '@/components/layout/SectionNav';
import { ChevronLeft, ChevronRight, CalendarDays, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────────────────

type EventType = 'official' | 'seminar' | 'meetup';

// ─── Constants ────────────────────────────────────────────────────────────────

const DAY_HEADERS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const MONTH_NAMES = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
];

const EVENT_TYPE_CONFIG: Record<EventType, { color: string; badgeLabel: string; legendLabel: string }> = {
  official: { color: '#D81919', badgeLabel: 'OFFICIAL', legendLabel: '공식행사' },
  seminar: { color: '#2563eb', badgeLabel: 'SEMINAR', legendLabel: '세미나 및 강연' },
  meetup: { color: '#f97316', badgeLabel: 'MEETUP', legendLabel: '바리스타 모임' },
};

// ─── Mock Data ────────────────────────────────────────────────────────────────

const CALENDAR_EVENTS: { date: string; type: EventType }[] = [
  { date: '2024-11-01', type: 'official' },
  { date: '2024-11-08', type: 'seminar' },
  { date: '2024-11-11', type: 'meetup' },
  { date: '2024-11-14', type: 'official' },
  { date: '2024-11-15', type: 'seminar' },
  { date: '2024-11-20', type: 'official' },
  { date: '2024-11-21', type: 'seminar' },
  { date: '2024-11-23', type: 'meetup' },
];

const UPCOMING_EVENTS = [
  {
    id: 'e-1',
    type: 'official' as EventType,
    title: '2024 서울 커피 엑스포',
    date: '2024.11.20',
    location: '코엑스 홀 A',
    image: 'https://picsum.photos/seed/coffee-expo-dark/200/280',
  },
  {
    id: 'e-2',
    type: 'seminar' as EventType,
    title: '브루잉 기초 세미나',
    date: '2024.11.21',
    location: '연남동 블루보틀',
    image: 'https://picsum.photos/seed/brewing-class/200/280',
  },
  {
    id: 'e-3',
    type: 'meetup' as EventType,
    title: '성수동 로스터리 투어',
    date: '2024.11.23',
    location: '성수동 카페거리 일대',
    image: 'https://picsum.photos/seed/roastery-tour/200/280',
  },
];

// ─── Calendar Helpers ─────────────────────────────────────────────────────────

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const days: { day: number; currentMonth: boolean; dateStr: string }[] = [];

  // Leading days from previous month
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const prevYear = month === 0 ? year - 1 : year;
    const prevMonth = month === 0 ? 11 : month - 1;
    days.push({
      day,
      currentMonth: false,
      dateStr: `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({
      day: d,
      currentMonth: true,
      dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
    });
  }

  // Trailing days to complete last row
  const remaining = 7 - (days.length % 7);
  if (remaining < 7) {
    const nextYear = month === 11 ? year + 1 : year;
    const nextMonth = month === 11 ? 0 : month + 1;
    for (let d = 1; d <= remaining; d++) {
      days.push({
        day: d,
        currentMonth: false,
        dateStr: `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      });
    }
  }

  return days;
}

// ─── Event Card ───────────────────────────────────────────────────────────────

function UpcomingEventCard({ event }: { event: typeof UPCOMING_EVENTS[0] }) {
  const config = EVENT_TYPE_CONFIG[event.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="mx-5 mb-4 flex overflow-hidden bg-white border border-[#e8e8e8]"
    >
      {/* Poster image */}
      <div className="w-[110px] shrink-0 overflow-hidden bg-[#1a1a1a]">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover opacity-75"
          style={{ aspectRatio: '3/4' }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col justify-between min-h-[140px]">
        <div>
          {/* Badge */}
          <span
            className="inline-block text-white text-xs font-black tracking-widest px-2 py-0.5 mb-2.5"
            style={{ backgroundColor: config.color }}
          >
            {config.badgeLabel}
          </span>

          {/* Title */}
          <h3 className="font-black text-sm leading-snug tracking-tight text-[#1a1a1a]">
            {event.title}
          </h3>
        </div>

        {/* Meta */}
        <div className="space-y-1.5 mt-3">
          <div className="flex items-center gap-1.5 text-xs text-[#6a6a6a] font-medium">
            <CalendarDays className="w-3 h-3 shrink-0 text-[#b0b0b0]" strokeWidth={1.5} />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#6a6a6a] font-medium">
            <MapPin className="w-3 h-3 shrink-0 text-[#b0b0b0]" strokeWidth={1.5} />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BrewCalendar() {
  const [currentYear, setCurrentYear] = useState(2024);
  const [currentMonth, setCurrentMonth] = useState(10); // 0-indexed: October=10 → November

  const calendarDays = getCalendarDays(currentYear, currentMonth);

  // Build event lookup map { dateStr → EventType[] }
  const eventMap = new Map<string, EventType[]>();
  CALENDAR_EVENTS.forEach((e) => {
    const existing = eventMap.get(e.date) ?? [];
    eventMap.set(e.date, [...existing, e.type]);
  });

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentYear((y) => y - 1); setCurrentMonth(11); }
    else setCurrentMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentYear((y) => y + 1); setCurrentMonth(0); }
    else setCurrentMonth((m) => m + 1);
  };

  return (
    <MobileLayout>
      {/* Section nav */}
      <SectionNav />

      {/* Editorial Header */}
      <div className="bg-white px-5 pt-5 pb-6 border-b border-[#f0f0f0]">
        <p className="label-caps text-[#D81919] mb-2">THE EDITORIAL</p>
        <h1
          className="font-black text-4xl leading-[0.92] tracking-tighter text-[#1a1a1a] italic"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          BREW<br />CALENDAR
        </h1>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white px-5 pt-5 pb-4">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-5">
          <span className="text-sm font-black tracking-wider text-[#1a1a1a]">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </span>
          <div className="flex items-center gap-0.5">
            <button
              onClick={prevMonth}
              className="w-8 h-8 flex items-center justify-center text-[#888] hover:text-black transition-colors"
              aria-label="이전 달"
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={2} />
            </button>
            <button
              onClick={nextMonth}
              className="w-8 h-8 flex items-center justify-center text-[#888] hover:text-black transition-colors"
              aria-label="다음 달"
            >
              <ChevronRight className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAY_HEADERS.map((d, i) => (
            <div
              key={d}
              className={cn(
                'text-center text-xs font-black tracking-widest pb-2',
                i === 0 ? 'text-[#D81919]' : 'text-[#b0b0b0]',
              )}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, idx) => {
            const eventTypes = eventMap.get(day.dateStr) ?? [];
            const isSunday = idx % 7 === 0;

            return (
              <div key={idx} className="flex flex-col items-center py-1.5 gap-1">
                <span
                  className={cn(
                    'text-sm font-bold leading-none',
                    !day.currentMonth && 'text-[#d0d0d0]',
                    day.currentMonth && isSunday ? 'text-[#D81919]' : '',
                    day.currentMonth && !isSunday ? 'text-[#1a1a1a]' : '',
                  )}
                >
                  {day.day}
                </span>
                {/* Event dots */}
                {eventTypes.length > 0 && (
                  <div className="flex gap-0.5">
                    {eventTypes.slice(0, 3).map((type, i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: EVENT_TYPE_CONFIG[type].color }}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 pt-4 border-t border-[#f0f0f0]">
          {(Object.entries(EVENT_TYPE_CONFIG) as [EventType, typeof EVENT_TYPE_CONFIG[EventType]][]).map(
            ([type, config]) => (
              <div key={type} className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: config.color }}
                />
                <span className="text-xs font-bold text-[#6a6a6a]">{config.legendLabel}</span>
              </div>
            ),
          )}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-[#f2f2f2] pt-6 pb-24">
        {/* Section header */}
        <div className="px-5 pb-4 flex items-center justify-between">
          <h2 className="text-sm font-black tracking-tight text-[#1a1a1a]">
            이번 주 다가오는 행사
          </h2>
          <span className="text-xs font-black tracking-widest text-[#9a9a9a]">UPCOMING</span>
        </div>

        {/* Event list — JOIN THE BREW CIRCLE banner inserted before last event */}
        {UPCOMING_EVENTS.map((event, idx) => (
          <div key={event.id}>
            {idx === 2 && (
              /* JOIN THE BREW CIRCLE Banner */
              <div className="mx-5 mb-4 p-6 bg-gradient-to-br from-[#1e0e05] to-[#5c2e0e]">
                <h3 className="font-black text-lg text-white leading-tight tracking-tight mb-2">
                  JOIN THE BREW CIRCLE
                </h3>
                <p className="text-xs text-[#d4a882] font-medium leading-relaxed">
                  전 세계 바리스타들이 원하는 가장 트렌디한 커피 세미나를 'BLENDING'에서 만나보세요.
                </p>
              </div>
            )}
            <UpcomingEventCard event={event} />
          </div>
        ))}
      </div>
    </MobileLayout>
  );
}
