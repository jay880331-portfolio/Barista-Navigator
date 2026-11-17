import { useLocation } from 'wouter';
import { ChevronLeft, Search, Menu } from 'lucide-react';

interface HeaderProps {
  title?: string;
  backTo?: string;
  onBack?: () => void;
  onMenuOpen?: () => void;
}

export function Header({ title, backTo, onBack, onMenuOpen }: HeaderProps) {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backTo) {
      setLocation(backTo);
    }
  };

  return (
    <header className="absolute top-0 left-0 w-full h-14 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-between px-4 border-b border-[#ebebeb]">
      <div className="flex items-center flex-1">
        {(backTo || onBack) ? (
          <button
            onClick={handleBack}
            className="p-1 -ml-1 text-foreground hover:opacity-60 transition-opacity"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>
        ) : (
          <button
            onClick={onMenuOpen}
            className="p-1 -ml-1 text-foreground hover:opacity-60 transition-opacity"
          >
            <Menu className="w-5 h-5" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Brand Mark — KCC임권택체 */}
      <div className="absolute left-1/2 -translate-x-1/2">
      {title ? (
          <span className="font-brand text-base tracking-tight text-foreground">
            {title}
          </span>
        ) : (
          <img src="/images/logo.svg" alt="Blending 로고" className="h-8 w-auto object-contain" />
        )}
      </div>

      <div className="flex items-center gap-1 flex-1 justify-end">
        {!(backTo || onBack) && (
          <>
            <button className="p-1 text-foreground hover:opacity-60 transition-opacity">
              <Search className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </>
        )}
      </div>
    </header>
  );
}
