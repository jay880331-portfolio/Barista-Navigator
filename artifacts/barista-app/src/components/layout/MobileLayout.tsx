import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { BottomNav } from './BottomNav';
import { Header } from './Header';
import { SideDrawer } from './SideDrawer';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileLayoutProps {
  children: React.ReactNode;
  title?: string;
  hideHeader?: boolean;
  hideNav?: boolean;
  backTo?: string;
  onBack?: () => void;
  className?: string;
  bgCream?: boolean;
  fab?: React.ReactNode;
}

export function MobileLayout({
  children,
  title,
  hideHeader = false,
  hideNav = false,
  backTo,
  onBack,
  className,
  bgCream = false,
  fab,
}: MobileLayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex justify-center w-full h-full bg-stone-100">
      <div className={cn(
        "relative w-full max-w-[430px] h-full shadow-2xl flex flex-col overflow-hidden",
        bgCream ? "bg-[#FAF7F2]" : "bg-white"
      )}>
        {!hideHeader && (
          <Header
            title={title}
            backTo={backTo}
            onBack={onBack}
            onMenuOpen={() => setDrawerOpen(true)}
          />
        )}

        <main className={cn(
          "flex-1 w-full overflow-y-auto overflow-x-hidden z-10",
          !hideHeader && "pt-14",
          className
        )}>
          <AnimatePresence mode="wait">
            <motion.div
              key={title || 'page'}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="w-full h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Floating Action Button slot — above bottom nav */}
        {fab && (
          <div className="absolute bottom-[68px] right-5 z-40 pointer-events-auto">
            {fab}
          </div>
        )}

        {!hideNav && <BottomNav />}

        {/* Side Drawer */}
        <div className="absolute inset-0 z-[100] pointer-events-none">
          <div className="pointer-events-auto">
            <SideDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
          </div>
        </div>
      </div>
    </div>
  );
}
