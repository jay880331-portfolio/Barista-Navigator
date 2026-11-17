import { useRoute, useLocation } from 'wouter';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useGetBaristaById } from '@workspace/api-client-react';
import { MapPin, Coffee, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BaristaDetail() {
  const [, params] = useRoute('/barista/:id');
  const [, setLocation] = useLocation();
  const id = params?.id ?? '';

  const { data: barista, isLoading, isError } = useGetBaristaById(id);

  if (isLoading) {
    return (
      <MobileLayout backTo="/nearby">
        <div className="flex flex-col gap-4 p-6 animate-pulse">
          <div className="w-24 h-24 rounded-full bg-[#f0f0f0] mx-auto" />
          <div className="h-5 bg-[#f0f0f0] rounded w-1/2 mx-auto" />
          <div className="h-3 bg-[#f0f0f0] rounded w-3/4 mx-auto" />
        </div>
      </MobileLayout>
    );
  }

  if (isError || !barista) {
    return (
      <MobileLayout backTo="/nearby">
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <Coffee className="w-10 h-10 text-[#d0d0d0]" strokeWidth={1} />
          <p className="text-[#9a9a9a] text-sm">바리스타 정보를 불러올 수 없습니다.</p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout backTo="/nearby" title={barista.name}>
      <div className="flex flex-col">

        {/* Hero — profile image + status */}
        <div className="relative bg-[#1a1a1a] h-52 flex items-end justify-center pb-0">
          {barista.profileImage ? (
            <img
              src={barista.profileImage}
              alt={barista.name}
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-7xl font-black opacity-20">{barista.name[0]}</span>
            </div>
          )}
          {/* Active badge */}
          {barista.isActive && (
            <div className="absolute top-4 right-4 bg-[#D81919] text-white text-xs font-bold px-3 py-1 rounded-full">
              활동중
            </div>
          )}
          {/* Avatar circle */}
          <div className="relative z-10 translate-y-1/2">
            <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden shadow-lg bg-[#1a1a1a]">
              {barista.profileImage ? (
                <img src={barista.profileImage} alt={barista.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-3xl font-black">
                  {barista.name[0]}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info section */}
        <div className="mt-14 px-6 text-center">
          <h1 className="text-xl font-black text-[#1a1a1a]">{barista.name}</h1>

          {barista.location && (
            <p className="flex items-center justify-center gap-1 text-xs text-[#9a9a9a] mt-1">
              <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
              {barista.location}
            </p>
          )}

          {typeof barista.rating === 'number' && (
            <div className="flex items-center justify-center gap-1 mt-2">
              <Star className="w-4 h-4 text-[#F5A623] fill-[#F5A623]" />
              <span className="text-sm font-bold text-[#1a1a1a]">{barista.rating.toFixed(1)}</span>
              {typeof barista.reviewCount === 'number' && (
                <span className="text-xs text-[#9a9a9a]">({barista.reviewCount})</span>
              )}
            </div>
          )}
        </div>

        {/* Bio */}
        {barista.bio && (
          <div className="mx-6 mt-5 p-4 bg-[#f7f7f5] rounded-lg">
            <p className="text-sm text-[#4a4a4a] leading-relaxed">{barista.bio}</p>
          </div>
        )}

        {/* Skills */}
        {barista.skills && barista.skills.length > 0 && (
          <div className="px-6 mt-5">
            <p className="text-xs font-bold text-[#9a9a9a] uppercase tracking-widest mb-3">전문 분야</p>
            <div className="flex flex-wrap gap-2">
              {barista.skills.map((skill: string) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 bg-[#1a1a1a] text-white text-xs font-bold rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Contact button */}
        <div className="px-6 mt-8 pb-8">
          <button
            onClick={() => {}}
            className={cn(
              'w-full py-4 font-black text-sm tracking-wide transition-colors',
              barista.isActive
                ? 'bg-[#D81919] text-white hover:bg-[#b81515]'
                : 'bg-[#f0f0f0] text-[#9a9a9a] cursor-not-allowed'
            )}
            disabled={!barista.isActive}
          >
            {barista.isActive ? '커피 상담 요청' : '현재 비활동 상태'}
          </button>
        </div>
      </div>
    </MobileLayout>
  );
}
