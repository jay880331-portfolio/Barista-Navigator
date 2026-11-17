import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Users, Home, ShoppingBag, User, Coffee, BookOpen, Heart, LogOut } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { href: '/home', icon: Home, label: '홈' },
  { href: '/nearby', icon: MapPin, label: '내주변 바리스타' },
  { href: '/community', icon: Users, label: '커뮤니티' },
  { href: '/market', icon: ShoppingBag, label: '스폰&마켓' },
  { href: '/profile', icon: User, label: '마이페이지' },
];

const subItems = [
  { href: '/community', icon: Coffee, label: '레시피&노하우' },
  { href: '/profile', icon: Heart, label: '스크랩 레시피' },
  { href: '/community', icon: BookOpen, label: '매거진' },
];

export function SideDrawer({ isOpen, onClose }: SideDrawerProps) {
  const { user, logout } = useAuthStore();
  const [location] = useLocation();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="absolute inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="absolute top-0 left-0 h-full w-[290px] bg-white z-10 flex flex-col"
            initial={{ x: -290 }}
            animate={{ x: 0 }}
            exit={{ x: -290 }}
            transition={{ type: 'tween', duration: 0.22, ease: 'easeOut' }}
          >
            {/* Header */}
            <div className="bg-black pt-12 pb-6 px-6">
              <div className="flex items-center justify-between mb-5">
                <img src="/images/logo.svg" alt="Blending 로고" className="h-8 w-auto object-contain" />
                <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
                  <X className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </div>

              {user ? (
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-white/20 overflow-hidden flex-shrink-0">
                    {user.profileImage ? (
                      <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-lg font-black">
                        {user.name?.[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-white font-bold text-base leading-tight">{user.name}</p>
                    <p className="text-white/50 text-xs mt-0.5 font-medium">
                      {user.role === 'barista' ? '바리스타' : '커피러버'}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-white/50 text-sm">로그인이 필요합니다</p>
              )}
            </div>

            {/* Menu */}
            <div className="flex-1 overflow-y-auto py-5">
              <div className="px-4 mb-1">
                <p className="text-xs text-[#9a9a9a] font-bold tracking-widest uppercase px-2 mb-2">메뉴</p>
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-3 px-2 py-3 mb-0.5 transition-colors',
                        isActive ? 'text-[#D81919]' : 'text-[#1a1a1a] hover:text-[#D81919]'
                      )}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={isActive ? 2 : 1.5} />
                      <span className={cn('text-sm font-bold', isActive && 'text-[#D81919]')}>{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="h-px bg-[#ebebeb] mx-6 my-4" />

              <div className="px-4">
                <p className="text-xs text-[#9a9a9a] font-bold tracking-widest uppercase px-2 mb-2">바로가기</p>
                {subItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={onClose}
                      className="flex items-center gap-3 px-2 py-2.5 text-[#6a6a6a] hover:text-foreground transition-colors"
                    >
                      <Icon className="w-4 h-4" strokeWidth={1.5} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-[#ebebeb] p-4">
              <button
                onClick={() => { logout(); onClose(); }}
                className="flex items-center gap-3 w-full px-2 py-2.5 text-[#D81919] hover:opacity-70 transition-opacity"
              >
                <LogOut className="w-4 h-4" strokeWidth={1.5} />
                <span className="text-sm font-bold">로그아웃</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
