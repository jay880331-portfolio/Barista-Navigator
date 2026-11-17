import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';

const SECTION_NAV = [
  { label: 'CALENDAR', href: '/brew-calendar' },
  { label: 'ON/OFF LOUNGE', href: '/community' },
  { label: 'RECIPE', href: '/recipe' },
];

export function SectionNav() {
  const [location, setLocation] = useLocation();

  return (
    <div className="sticky top-0 z-30 bg-white border-b border-[#e8e8e8]">
      <div className="flex overflow-x-auto no-scrollbar">
        {SECTION_NAV.map((item) => {
          const isActive = location === item.href;
          return (
            <button
              key={item.href}
              onClick={() => setLocation(item.href)}
              className={cn(
                'relative flex-1 px-3 py-3 text-xs font-black tracking-widest whitespace-nowrap transition-colors text-center',
                isActive ? 'text-[#1a1a1a]' : 'text-[#b0b0b0] hover:text-[#555]',
              )}
            >
              {item.label}
              {isActive && (
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#D81919]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
