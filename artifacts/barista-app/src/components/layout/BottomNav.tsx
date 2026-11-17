import { Link, useLocation } from "wouter";
import { MapPin, Users, Home, CalendarDays, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/nearby", icon: MapPin, label: "내주변" },
  { href: "/community", icon: Users, label: "커뮤니티" },
  { href: "/home", icon: Home, label: "홈" },
  { href: "/calendar", icon: CalendarDays, label: "일정" },
  { href: "/profile", icon: User, label: "마이페이지" },
];

export function BottomNav() {
  const [location] = useLocation();

  return (
    <nav className="w-full h-[62px] bg-white border-t border-[#e8e8e8] flex items-stretch flex-shrink-0">
      {navItems.map((item) => {
        const isActive =
          location === item.href ||
          (item.href === "/nearby" && location === "/map");
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center justify-center outline-none flex-1"
          >
            {isActive ? (
              /* 활성 탭 — 전체 높이/너비 채움 */
              <div className="flex flex-col items-center justify-center gap-1 bg-[#D81919] w-full h-full">
                <Icon
                  className="w-[18px] h-[18px] text-white"
                  strokeWidth={2}
                />
                <span className="text-xs font-bold text-white leading-none">
                  {item.label}
                </span>
              </div>
            ) : (
              /* 비활성 탭 */
              <div className="flex flex-col items-center justify-center gap-1 w-full h-full">
                <Icon
                  className="w-[18px] h-[18px] text-[#b0b0b0]"
                  strokeWidth={1.5}
                />
                <span className="text-xs font-bold text-[#b0b0b0] leading-none">
                  {item.label}
                </span>
              </div>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
