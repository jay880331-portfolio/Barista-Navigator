/// <reference types="@types/google.maps" />
import { useState, useEffect, useCallback, useRef } from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useGetBaristas } from '@workspace/api-client-react';
import {
  APIProvider,
  Map as GoogleMap,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { MarkerClusterer, SuperClusterAlgorithm } from '@googlemaps/markerclusterer';
import { X, ChevronRight, Navigation, Plus, Minus } from 'lucide-react';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ['활동중', '라떼아트', '로스팅', '핸드드립', '대회입상'];
const DEFAULT_RADIUS = 5;

/* ─────────────── Types ─────────────── */
type BaristaItem = {
  id: string;
  name: string;
  profileImage?: string | null;
  isActive?: boolean | null;
  lat?: number | null;
  lng?: number | null;
  location?: string | null;
  skills?: string[] | null;
  role?: string | null;
  bio?: string | null;
};

type SelectedState = { baristas: BaristaItem[] } | null;

/* ─────────────── Avatar ─────────────── */
function Avatar({
  src,
  name,
  size = 44,
  ring = false,
  active = false,
}: {
  src?: string | null;
  name: string;
  size?: number;
  ring?: boolean;
  active?: boolean;
}) {
  const [err, setErr] = useState(false);
  const bg = active ? '#D81919' : '#1a1a1a';
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: `2.5px solid ${ring && active ? '#D81919' : '#fff'}`,
        overflow: 'hidden',
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {src && !err ? (
        <img
          src={src}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={() => setErr(true)}
        />
      ) : (
        <span style={{ color: '#fff', fontWeight: 700, fontSize: size * 0.38 }}>
          {name[0]}
        </span>
      )}
    </div>
  );
}

/* ─────────────── Single Marker ─────────────── */
function SingleMarker({
  barista,
  onClick,
}: {
  barista: BaristaItem;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div
          style={{
            boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
            borderRadius: '50%',
          }}
        >
          <Avatar
            src={barista.profileImage}
            name={barista.name}
            size={46}
            ring
            active={barista.isActive ?? false}
          />
        </div>
        <div
          style={{
            background: 'rgba(0,0,0,0.72)',
            color: '#fff',
            fontSize: 10,
            fontWeight: 700,
            padding: '2px 7px',
            borderRadius: 20,
            whiteSpace: 'nowrap',
            letterSpacing: '0.01em',
          }}
        >
          {barista.name}
        </div>
      </div>
    </button>
  );
}

/* ─────────────── Cluster Marker ─────────────── */
function ClusterMarker({
  baristas,
  onClick,
}: {
  baristas: BaristaItem[];
  onClick: () => void;
}) {
  const preview = baristas.slice(0, 3);
  const count = baristas.length;
  return (
    <button
      onClick={onClick}
      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        {/* Stacked avatars */}
        <div style={{ position: 'relative', width: 46 + (preview.length - 1) * 14, height: 50 }}>
          {preview.map((b, i) => (
            <div
              key={b.id}
              style={{
                position: 'absolute',
                left: i * 14,
                top: 0,
                zIndex: preview.length - i,
                boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                borderRadius: '50%',
              }}
            >
              <Avatar src={b.profileImage} name={b.name} size={46} active={b.isActive ?? false} />
            </div>
          ))}
          {/* Count badge */}
          <div
            style={{
              position: 'absolute',
              right: -8,
              top: -6,
              background: '#1a1a1a',
              color: '#fff',
              fontSize: 10,
              fontWeight: 800,
              padding: '2px 6px',
              borderRadius: 20,
              whiteSpace: 'nowrap',
              border: '2px solid #fff',
              zIndex: 10,
            }}
          >
            {count}명
          </div>
        </div>
      </div>
    </button>
  );
}

/* ─────────────── Clusterer (inner map component) ─────────────── */
function ClusteredMarkers({
  baristas,
  onSelect,
}: {
  baristas: BaristaItem[];
  onSelect: (group: BaristaItem[]) => void;
}) {
  const map = useMap();
  const markerLib = useMapsLibrary('marker');
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const markerRefs = useRef<Map<string, google.maps.marker.AdvancedMarkerElement>>(new Map());

  // Build/rebuild clusterer when map or markerLib is ready
  useEffect(() => {
    if (!map || !markerLib) return;
    if (!clustererRef.current) {
      clustererRef.current = new MarkerClusterer({
        map,
        algorithm: new SuperClusterAlgorithm({ radius: 80 }),
        renderer: {
          render: ({ count, position, markers }) => {
            const baristaGroup = (markers ?? [])
              .map((m: any) => m._barista as BaristaItem)
              .filter(Boolean);

            const container = document.createElement('div');
            container.style.cssText =
              'background:none;border:none;padding:0;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px';

            const preview = baristaGroup.slice(0, 3);
            const width = 46 + (preview.length - 1) * 14;
            const stackWrap = document.createElement('div');
            stackWrap.style.cssText = `position:relative;width:${width}px;height:50px`;

            preview.forEach((b, i) => {
              const circle = document.createElement('div');
              circle.style.cssText = `position:absolute;left:${i * 14}px;top:0;z-index:${preview.length - i};border-radius:50%;border:2.5px solid #fff;width:46px;height:46px;overflow:hidden;background:${b.isActive ? '#D81919' : '#1a1a1a'};box-shadow:0 2px 8px rgba(0,0,0,0.25)`;
              if (b.profileImage) {
                const img = document.createElement('img');
                img.src = b.profileImage;
                img.style.cssText = 'width:100%;height:100%;object-fit:cover';
                img.onerror = () => { img.remove(); };
                circle.appendChild(img);
              }
              stackWrap.appendChild(circle);
            });

            const badge = document.createElement('div');
            badge.style.cssText =
              'position:absolute;right:-8px;top:-6px;background:#1a1a1a;color:#fff;font-size:10px;font-weight:800;padding:2px 6px;border-radius:20px;white-space:nowrap;border:2px solid #fff;z-index:10';
            badge.textContent = `${count}명`;
            stackWrap.appendChild(badge);
            container.appendChild(stackWrap);

            container.addEventListener('click', () => onSelect(baristaGroup));

            const el = new markerLib.AdvancedMarkerElement({
              position,
              content: container,
              zIndex: 999,
            });
            return el;
          },
        },
      });
    }
    return () => {
      clustererRef.current?.clearMarkers();
      clustererRef.current = null;
    };
  }, [map, markerLib]);

  // Sync markers when baristas change
  useEffect(() => {
    if (!map || !markerLib || !clustererRef.current) return;

    // Remove old
    markerRefs.current.forEach((m) => { m.map = null; });
    markerRefs.current.clear();
    clustererRef.current.clearMarkers();

    const newMarkers: google.maps.marker.AdvancedMarkerElement[] = [];

    baristas.forEach((barista) => {
      const lat = barista.lat ?? 37.5665;
      const lng = barista.lng ?? 126.978;

      const container = document.createElement('div');
      container.style.cssText =
        'background:none;border:none;padding:0;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px';

      const circle = document.createElement('div');
      circle.style.cssText = `border-radius:50%;border:2.5px solid ${barista.isActive ? '#D81919' : '#fff'};width:46px;height:46px;overflow:hidden;background:${barista.isActive ? '#D81919' : '#1a1a1a'};box-shadow:0 2px 8px rgba(0,0,0,0.25)`;
      if (barista.profileImage) {
        const img = document.createElement('img');
        img.src = barista.profileImage;
        img.style.cssText = 'width:100%;height:100%;object-fit:cover';
        img.onerror = () => { img.remove(); };
        circle.appendChild(img);
      } else {
        circle.style.display = 'flex';
        circle.style.alignItems = 'center';
        circle.style.justifyContent = 'center';
        circle.style.color = '#fff';
        circle.style.fontWeight = '700';
        circle.style.fontSize = '18px';
        circle.textContent = barista.name[0];
      }

      const label = document.createElement('div');
      label.style.cssText =
        'background:rgba(0,0,0,0.72);color:#fff;font-size:10px;font-weight:700;padding:2px 7px;border-radius:20px;white-space:nowrap';
      label.textContent = barista.name;

      container.appendChild(circle);
      container.appendChild(label);
      container.addEventListener('click', () => onSelect([barista]));

      const marker = new markerLib.AdvancedMarkerElement({
        position: { lat, lng },
        content: container,
      });
      (marker as any)._barista = barista;

      markerRefs.current.set(barista.id, marker);
      newMarkers.push(marker);
    });

    clustererRef.current.addMarkers(newMarkers);
  }, [baristas, map, markerLib]);

  return null;
}

/* ─────────────── Bottom Sheet ─────────────── */
function BaristaSheet({
  baristas,
  onClose,
}: {
  baristas: BaristaItem[];
  onClose: () => void;
}) {
  const [, setLocation] = useLocation();

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'tween', duration: 0.28, ease: 'easeOut' }}
      className="absolute bottom-0 left-0 right-0 z-[2000] bg-white rounded-t-2xl shadow-[0_-8px_32px_rgba(0,0,0,0.15)] max-h-[65vh] flex flex-col"
    >
      {/* Handle + close */}
      <div className="flex items-center justify-between px-5 pt-3 pb-2">
        <div className="flex-1" />
        <div className="w-10 h-1 bg-[#d0d0d0] rounded-full" />
        <div className="flex-1 flex justify-end">
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-[#f0f0f0] text-[#6a6a6a]"
          >
            <X className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Count label */}
      <div className="px-5 pb-2">
        <p className="text-xs font-bold text-[#9a9a9a] uppercase tracking-widest">
          {baristas.length === 1 ? '바리스타' : `바리스타 ${baristas.length}명`}
        </p>
      </div>

      {/* List */}
      <div className="overflow-y-auto flex-1 divide-y divide-[#f0f0f0]">
        {baristas.map((barista) => (
          <button
            key={barista.id}
            onClick={() => { onClose(); setLocation(`/barista/${barista.id}`); }}
            className="flex items-center gap-3 px-5 py-4 w-full text-left hover:bg-[#f9f9f9] transition-colors"
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div
                className="w-11 h-11 rounded-full overflow-hidden shadow-sm"
                style={{ background: barista.isActive ? '#D81919' : '#1a1a1a' }}
              >
                {barista.profileImage ? (
                  <img src={barista.profileImage} alt={barista.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold text-base">
                    {barista.name[0]}
                  </div>
                )}
              </div>
              {barista.isActive && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#D81919] border-2 border-white" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-[#1a1a1a] leading-tight">{barista.name}</p>
              <p className="text-xs text-[#9a9a9a] mt-0.5 truncate">
                {barista.skills?.length
                  ? barista.skills.slice(0, 2).join(' · ')
                  : barista.location || '바리스타'}
              </p>
            </div>

            <ChevronRight className="w-4 h-4 text-[#c0c0c0] flex-shrink-0" strokeWidth={1.5} />
          </button>
        ))}
      </div>
    </motion.div>
  );
}

/* ─────────────── Map Instance Capture ─────────────── */
function MapCapture({ onMap }: { onMap: (m: google.maps.Map) => void }) {
  const map = useMap();
  useEffect(() => { if (map) onMap(map); }, [map, onMap]);
  return null;
}

/* ─────────────── Main Page ─────────────── */
export default function MapPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selected, setSelected] = useState<SelectedState>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);

  const handleZoomIn = useCallback(() => {
    if (!mapInstance) return;
    mapInstance.setZoom((mapInstance.getZoom() ?? 14) + 1);
  }, [mapInstance]);

  const handleZoomOut = useCallback(() => {
    if (!mapInstance) return;
    mapInstance.setZoom((mapInstance.getZoom() ?? 14) - 1);
  }, [mapInstance]);

  const handleMyLocation = useCallback(() => {
    if (!navigator.geolocation || !mapInstance) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        mapInstance.panTo({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        mapInstance.setZoom(16);
      },
      () => {}
    );
  }, [mapInstance]);

  const center = { lat: 37.5665, lng: 126.978 };

  const { data: baristas } = useGetBaristas({
    lat: center.lat,
    lng: center.lng,
    radius: DEFAULT_RADIUS,
    skill: activeCategory === '활동중' ? undefined : (activeCategory || undefined),
  });

  const filteredBaristas = (baristas ?? []).filter((b: any) => {
    if (activeCategory === '활동중') return b.isActive;
    return true;
  }) as BaristaItem[];

  const handleSelect = useCallback((group: BaristaItem[]) => {
    setSelected({ baristas: group });
  }, []);

  return (
    <MobileLayout>
      <div className="relative w-full h-[calc(100vh-128px)]">
        {/* Map */}
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}>
          <GoogleMap
            defaultCenter={center}
            defaultZoom={14}
            disableDefaultUI={true}
            clickableIcons={false}
            mapId={import.meta.env.VITE_GOOGLE_MAP_ID || 'DEMO_MAP_ID'}
            style={{ width: '100%', height: '100%' }}
          >
            <ClusteredMarkers baristas={filteredBaristas} onSelect={handleSelect} />
            <MapCapture onMap={setMapInstance} />
          </GoogleMap>
        </APIProvider>

        {/* Map Controls — bottom-right */}
        {(() => {
          const btnCls =
            'w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.18)] text-[#3a3a3a] hover:bg-[#f5f5f5] active:scale-95 transition-all';
          return (
            <div className="absolute bottom-6 right-4 z-10 flex flex-col gap-2">
              <button onClick={handleMyLocation} className={btnCls} aria-label="내 위치">
                <Navigation className="w-4 h-4" strokeWidth={1.8} />
              </button>
              <button onClick={handleZoomIn} className={btnCls} aria-label="확대">
                <Plus className="w-4 h-4" strokeWidth={2} />
              </button>
              <button onClick={handleZoomOut} className={btnCls} aria-label="축소">
                <Minus className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          );
        })()}

        {/* Category Filter Chips */}
        <div className="absolute top-4 left-0 w-full z-10 px-4 overflow-x-auto no-scrollbar flex gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={cn(
                'whitespace-nowrap px-4 py-1.5 text-xs font-bold rounded-full shadow-sm transition-all',
                activeCategory === cat
                  ? 'bg-[#1a1a1a] text-white'
                  : 'bg-white text-[#1a1a1a] border border-[#e0e0e0]'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Bottom Sheet */}
        <AnimatePresence>
          {selected && (
            <>
              {/* Backdrop */}
              <motion.div
                className="absolute inset-0 z-[1999]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelected(null)}
              />
              <BaristaSheet
                baristas={selected.baristas}
                onClose={() => setSelected(null)}
              />
            </>
          )}
        </AnimatePresence>
      </div>
    </MobileLayout>
  );
}
