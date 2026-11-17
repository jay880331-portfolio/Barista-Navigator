import { useState, useMemo } from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { CalendarDays, MapPin, Trophy, Users, BookOpen, Wrench, ExternalLink, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { format, differenceInDays, isBefore, startOfDay } from 'date-fns';
import { ko } from 'date-fns/locale';

// ─── Types ────────────────────────────────────────────────────────────────────

type EventCategory = 'all' | 'competition' | 'event' | 'seminar' | 'workshop';

interface BaristaEvent {
  id: string;
  category: Exclude<EventCategory, 'all'>;
  title: string;
  organizer: string;
  location: string;
  startDate: Date;
  endDate?: Date;
  description: string;
  url?: string;
  featured?: boolean;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const EVENTS: BaristaEvent[] = [
  {
    id: '1',
    category: 'competition',
    title: 'Korea Barista Championship 2026',
    organizer: '한국바리스타협회 (KBA)',
    location: '서울 COEX 홀 B',
    startDate: new Date('2026-04-18'),
    endDate: new Date('2026-04-20'),
    description: '전국 최고의 바리스타들이 모이는 국내 최대 바리스타 대회. 에스프레소, 브루잉, 라떼아트 3개 부문.',
    featured: true,
  },
  {
    id: '2',
    category: 'event',
    title: 'Seoul Coffee Festival 2026',
    organizer: '서울커피페스티벌 조직위원회',
    location: '동대문 DDP',
    startDate: new Date('2026-04-25'),
    endDate: new Date('2026-04-27'),
    description: '국내외 유명 로스터리와 카페가 참가하는 대형 커피 축제. 시음, 클래스, 전시 운영.',
    featured: true,
  },
  {
    id: '3',
    category: 'seminar',
    title: '스페셜티 커피 원두 품질 평가 세미나',
    organizer: 'SCA Korea Chapter',
    location: '강남 SCA 교육센터',
    startDate: new Date('2026-05-03'),
    description: 'Q-Grader 강사가 직접 진행하는 원두 품질 평가 실습 세미나. 참가 인원 20명 한정.',
  },
  {
    id: '4',
    category: 'competition',
    title: 'World Latte Art Championship — 아시아 예선',
    organizer: 'World Coffee Events',
    location: '부산 BEXCO',
    startDate: new Date('2026-05-10'),
    endDate: new Date('2026-05-11'),
    description: '세계 라떼아트 챔피언십 아시아 지역 예선. 상위 입상자는 월드 파이널 진출 자격 부여.',
    featured: true,
  },
  {
    id: '5',
    category: 'workshop',
    title: '핸드드립 추출 마스터클래스',
    organizer: 'Brewing Lab Seoul',
    location: '홍대 브루잉랩',
    startDate: new Date('2026-05-15'),
    description: '푸어오버, 클레버, 에어로프레스 3가지 방식의 핸드드립 추출 심화 워크샵.',
  },
  {
    id: '6',
    category: 'seminar',
    title: '카페 경영 & 메뉴 개발 세미나',
    organizer: '한국외식창업연구소',
    location: '역삼 비즈니스센터',
    startDate: new Date('2026-05-22'),
    description: '카페 창업 및 운영 전략, 시즌 메뉴 개발 노하우를 공유하는 실무 세미나.',
  },
  {
    id: '7',
    category: 'competition',
    title: 'Cup of Excellence — 심사위원 참관 행사',
    organizer: 'Alliance for Coffee Excellence',
    location: '서울 페어몬트 호텔',
    startDate: new Date('2026-06-05'),
    description: '올해 COE 수상 원두 시음 및 심사 과정 공개 행사. 바리스타 네트워킹 포함.',
  },
  {
    id: '8',
    category: 'workshop',
    title: '에스프레소 다이얼링 & 머신 튜닝 워크샵',
    organizer: 'La Marzocco Korea',
    location: '이태원 라마르조꼬 쇼룸',
    startDate: new Date('2026-06-13'),
    description: 'GB5 머신을 이용한 에스프레소 추출 변수 조절 및 머신 유지보수 실습.',
  },
  {
    id: '9',
    category: 'event',
    title: '바리스타 네트워킹 나이트',
    organizer: 'Barista Guild Korea',
    location: '성수 스페셜티 카페',
    startDate: new Date('2026-06-20'),
    description: '전국 바리스타들이 모이는 네트워킹 파티. 자유로운 정보 교류와 친목 도모.',
  },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES: { id: EventCategory; label: string; icon: React.ElementType }[] = [
  { id: 'all', label: '전체', icon: CalendarDays },
  { id: 'competition', label: '대회', icon: Trophy },
  { id: 'event', label: '행사', icon: Users },
  { id: 'seminar', label: '세미나', icon: BookOpen },
  { id: 'workshop', label: '워크샵', icon: Wrench },
];

const CATEGORY_STYLES: Record<Exclude<EventCategory, 'all'>, { bg: string; text: string; label: string }> = {
  competition: { bg: 'bg-[#D81919]/10', text: 'text-[#D81919]', label: '대회' },
  event: { bg: 'bg-blue-50', text: 'text-blue-600', label: '행사' },
  seminar: { bg: 'bg-amber-50', text: 'text-amber-600', label: '세미나' },
  workshop: { bg: 'bg-emerald-50', text: 'text-emerald-600', label: '워크샵' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDaysLeft(date: Date): number {
  return differenceInDays(startOfDay(date), startOfDay(new Date()));
}

function isPast(date: Date): boolean {
  return isBefore(startOfDay(date), startOfDay(new Date()));
}

// ─── Event Card ───────────────────────────────────────────────────────────────

function EventCard({ event }: { event: BaristaEvent }) {
  const daysLeft = getDaysLeft(event.startDate);
  const past = isPast(event.startDate);
  const catStyle = CATEGORY_STYLES[event.category];

  return (
    <div className={cn('bg-white overflow-hidden flex', past && 'opacity-60')}>
      {/* Left date column */}
      <div className="w-16 shrink-0 flex flex-col items-center justify-start pt-4 pb-3 bg-[#f8f8f8] border-r border-[#f0f0f0]">
        <span className="text-xs font-black tracking-wider text-[#aaa] uppercase">
          {format(event.startDate, 'MMM', { locale: ko })}
        </span>
        <span className="text-2xl font-black text-[#111] leading-none mt-0.5">
          {format(event.startDate, 'd')}
        </span>
        <span className="text-xs font-bold text-[#bbb] mt-1">
          {format(event.startDate, 'EEE', { locale: ko })}
        </span>

        {/* D-day badge */}
        {!past && (
          <div className={cn(
            'mt-2 px-1.5 py-0.5 text-xs font-black',
            daysLeft === 0
              ? 'bg-[#D81919] text-white'
              : 'bg-[#111] text-white',
          )}>
            {daysLeft === 0 ? 'D-DAY' : `D-${daysLeft}`}
          </div>
        )}
        {past && (
          <div className="mt-2 px-1.5 py-0.5 text-xs font-black text-[#bbb] border border-[#e8e8e8]">
            종료
          </div>
        )}
      </div>

      {/* Right content */}
      <div className="flex-1 px-3.5 py-3.5 flex flex-col gap-1.5">
        {/* Category + featured */}
        <div className="flex items-center gap-2">
          <span className={cn('text-xs font-black px-2 py-0.5', catStyle.bg, catStyle.text)}>
            {catStyle.label}
          </span>
          {event.featured && (
            <span className="text-xs font-black text-[#D81919]">★ 주목</span>
          )}
        </div>

        <h3 className="font-black text-sm leading-snug text-[#111] tracking-tight">
          {event.title}
        </h3>

        <p className="text-xs text-[#888] font-medium leading-relaxed line-clamp-2">
          {event.description}
        </p>

        {/* Meta */}
        <div className="flex flex-col gap-1 mt-1">
          <div className="flex items-center gap-1.5 text-xs text-[#777] font-medium">
            <MapPin className="w-3 h-3 shrink-0 text-[#bbb]" strokeWidth={1.5} />
            {event.location}
          </div>
          {event.endDate && (
            <div className="flex items-center gap-1.5 text-xs text-[#777] font-medium">
              <Clock className="w-3 h-3 shrink-0 text-[#bbb]" strokeWidth={1.5} />
              {format(event.startDate, 'M.d', { locale: ko })} – {format(event.endDate, 'M.d', { locale: ko })} ({differenceInDays(event.endDate, event.startDate) + 1}일간)
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-[#bbb] font-medium">
            <Users className="w-3 h-3 shrink-0" strokeWidth={1.5} />
            {event.organizer}
          </div>
        </div>

        {event.url && (
          <button className="mt-1 self-start flex items-center gap-1 text-xs font-black text-[#D81919] hover:underline">
            자세히 보기 <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Schedule() {
  const [activeCategory, setActiveCategory] = useState<EventCategory>('all');

  const filtered = useMemo(() => {
    return EVENTS.filter((e) => activeCategory === 'all' || e.category === activeCategory);
  }, [activeCategory]);

  // Group by month
  const grouped = useMemo(() => {
    const groups: Record<string, BaristaEvent[]> = {};
    filtered.forEach((event) => {
      const key = format(event.startDate, 'yyyy년 M월', { locale: ko });
      if (!groups[key]) groups[key] = [];
      groups[key].push(event);
    });
    return groups;
  }, [filtered]);

  // Count upcoming
  const upcomingCount = EVENTS.filter((e) => !isPast(e.startDate)).length;

  return (
    <MobileLayout title="일정">
      {/* Category filter */}
      <div className="bg-white sticky top-0 z-20 border-b border-[#ebebeb]">
        <div className="flex overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  'relative flex items-center gap-1.5 px-4 py-3.5 text-sm font-black whitespace-nowrap shrink-0 transition-colors',
                  activeCategory === cat.id ? 'text-[#111]' : 'text-[#c0c0c0] hover:text-[#666]',
                )}
              >
                <Icon className="w-3.5 h-3.5" strokeWidth={activeCategory === cat.id ? 2 : 1.5} />
                {cat.label}
                {activeCategory === cat.id && (
                  <motion.div
                    layoutId="schedule-tab-underline"
                    className="absolute bottom-0 left-0 w-full h-[2px] bg-black"
                    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Banner */}
      <div className="bg-black px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-black tracking-widest text-[#888] uppercase">Coming Up</p>
          <p className="text-white font-black text-base tracking-tight mt-0.5">
            다가오는 일정{' '}
            <span className="text-[#D81919]">{upcomingCount}개</span>
          </p>
        </div>
        <CalendarDays className="w-8 h-8 text-[#333]" strokeWidth={1} />
      </div>

      {/* Event list grouped by month */}
      <div className="bg-[#f2f2f2] min-h-screen pb-6">
        <AnimatePresence mode="popLayout">
          {Object.keys(grouped).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-[#c0c0c0]">
              <CalendarDays className="w-10 h-10 mb-3" strokeWidth={1} />
              <p className="text-sm font-black text-[#aaa]">해당 카테고리의 일정이 없어요.</p>
            </div>
          ) : (
            Object.entries(grouped).map(([month, events]) => (
              <motion.div
                key={month}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Month divider */}
                <div className="px-4 py-3 flex items-center gap-3">
                  <span className="text-xs font-black tracking-wider text-[#888] uppercase">
                    {month}
                  </span>
                  <div className="flex-1 h-px bg-[#e0e0e0]" />
                  <span className="text-xs font-black text-[#bbb]">{events.length}개</span>
                </div>

                {/* Cards */}
                <div className="flex flex-col gap-2 px-0">
                  {events.map((event, idx) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18, delay: idx * 0.05 }}
                    >
                      <EventCard event={event} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </MobileLayout>
  );
}
