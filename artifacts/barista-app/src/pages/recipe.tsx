import { useState } from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { SectionNav } from '@/components/layout/SectionNav';
import { Heart, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────────────────

type BrewDataField = { label: string; value: string };

interface RecipeData {
  id: string;
  image: string;
  author: { name: string; avatarSeed: string };
  likeCount: number;
  title: string;
  beanInfo: { origin: string; process: string; roast: string };
  brewSectionLabel: 'BREW DATA' | 'ESPRESSO DATA';
  brewFields: BrewDataField[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_RECIPES: RecipeData[] = [
  {
    id: 'r-1',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=70',
    author: { name: 'Barista_Min', avatarSeed: 'barista-min-chef' },
    likeCount: 124,
    title: '에티오피아 에가체프 브루잉 레시피',
    beanInfo: { origin: 'Ethiopia', process: 'Washed', roast: 'Light' },
    brewSectionLabel: 'BREW DATA',
    brewFields: [
      { label: 'DOSING', value: '20g' },
      { label: 'YIELD', value: '300ml' },
      { label: 'TIME', value: '2:30' },
      { label: 'TEMP', value: '92°C' },
    ],
  },
  {
    id: 'r-2',
    image: 'https://images.unsplash.com/photo-1534040385115-33dcb3acba5b?w=800&q=70',
    author: { name: 'Espresso_Master', avatarSeed: 'espresso-master-pro' },
    likeCount: 382,
    title: '다크 초콜릿 노트를 강조한 라떼 아트 레시피',
    beanInfo: { origin: 'Colombia Blend', process: 'Natural', roast: 'Medium-Dark' },
    brewSectionLabel: 'ESPRESSO DATA',
    brewFields: [
      { label: 'IN', value: '18.5g' },
      { label: 'OUT', value: '36g' },
      { label: 'TIME', value: '28s' },
      { label: 'TEMP', value: '93°C' },
    ],
  },
];

// ─── Recipe Card ──────────────────────────────────────────────────────────────

function RecipeCard({ recipe, index }: { recipe: RecipeData; index: number }) {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.08 }}
      className="bg-white mb-2.5"
    >
      {/* Hero image with author/actions overlay */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#1a1a1a]">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-full object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />

        {/* Author — bottom left */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <img
            src={`https://i.pravatar.cc/36?u=${recipe.author.avatarSeed}`}
            alt={recipe.author.name}
            className="w-7 h-7 rounded-full border-2 border-white"
          />
          <span className="text-white text-xs font-black">{recipe.author.name}</span>
        </div>

        {/* Like + bookmark — bottom right */}
        <div className="absolute bottom-3 right-3 flex items-center gap-3">
          <button
            onClick={() => setLiked((v) => !v)}
            className="flex items-center gap-1 text-white"
            aria-label="좋아요"
          >
            <Heart
              className={cn('w-4 h-4 transition-all', liked && 'fill-[#D81919] text-[#D81919]')}
              strokeWidth={1.5}
            />
            <span className="text-xs font-bold">{recipe.likeCount + (liked ? 1 : 0)}</span>
          </button>
          <button
            onClick={() => setBookmarked((v) => !v)}
            className="text-white"
            aria-label="북마크"
          >
            <Bookmark
              className={cn('w-4 h-4 transition-all', bookmarked && 'fill-white')}
              strokeWidth={1.5}
            />
          </button>
        </div>
      </div>

      {/* Recipe body */}
      <div className="px-5 pt-4 pb-5">
        {/* Title */}
        <h2 className="font-black text-lg leading-snug tracking-tight text-[#1a1a1a] mb-4">
          {recipe.title}
        </h2>

        {/* Bean Information */}
        <p className="label-caps text-[#D81919] mb-3">BEAN INFORMATION</p>
        <div className="mb-4">
          {[
            { label: 'Origin', value: recipe.beanInfo.origin },
            { label: 'Process', value: recipe.beanInfo.process },
            { label: 'Roast', value: recipe.beanInfo.roast },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex items-center justify-between py-2.5 border-b border-[#f0f0f0] last:border-b-0"
            >
              <span className="text-xs text-[#9a9a9a] font-medium">{label}</span>
              <span className="text-xs font-bold text-[#1a1a1a]">{value}</span>
            </div>
          ))}
        </div>

        {/* Brew / Espresso Data */}
        <p className="label-caps text-[#D81919] mb-3">{recipe.brewSectionLabel}</p>
        <div className="grid grid-cols-2 gap-2">
          {recipe.brewFields.map(({ label, value }) => (
            <div key={label} className="bg-[#f7f7f7] p-3">
              <p className="text-xs font-black tracking-widest text-[#b0b0b0] mb-1.5">{label}</p>
              <p className="text-lg font-black text-[#1a1a1a] leading-none">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.article>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RecipePage() {
  return (
    <MobileLayout>
      {/* Section nav */}
      <SectionNav />

      {/* Editorial Header */}
      <div className="bg-white px-5 pt-5 pb-5 border-b border-[#f0f0f0]">
        <h1 className="font-black text-3xl leading-none tracking-tight text-[#1a1a1a] mb-0.5">
          THE RECIPE
        </h1>
        <h2 className="font-black text-3xl leading-none tracking-tight text-[#D81919] mb-3">
          ARCHIVE
        </h2>
        <p className="text-xs text-[#9a9a9a] font-medium leading-relaxed">
          Professional brewing profiles from the world's finest baristas.
        </p>
      </div>

      {/* Recipe list */}
      <div className="bg-[#f2f2f2] pt-2.5 pb-24">
        {MOCK_RECIPES.map((recipe, idx) => (
          <RecipeCard key={recipe.id} recipe={recipe} index={idx} />
        ))}
      </div>
    </MobileLayout>
  );
}
