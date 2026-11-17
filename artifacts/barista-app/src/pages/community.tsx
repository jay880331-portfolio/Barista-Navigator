import { useState, useRef } from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { SectionNav } from '@/components/layout/SectionNav';
import { useGetPosts, useCreatePost } from '@workspace/api-client-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { PencilLine, X, ImagePlus, Loader2, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

// ─── Types ────────────────────────────────────────────────────────────────────

type PostTypeId = 'daily' | 'recipe' | 'knowhow';
type AnchorTab = 'events' | 'reviews' | 'qa';

// ─── Constants ────────────────────────────────────────────────────────────────

const ANCHOR_TABS: { id: AnchorTab; label: string }[] = [
  { id: 'events', label: 'EVENTS' },
  { id: 'reviews', label: 'EVENT REVIEWS' },
  { id: 'qa', label: 'Q&A' },
];

const POST_TYPES: { id: PostTypeId; label: string; emoji: string }[] = [
  { id: 'daily', label: '일상', emoji: '☕' },
  { id: 'recipe', label: '레시피', emoji: '📖' },
  { id: 'knowhow', label: '노하우', emoji: '💡' },
];

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_EVENT = {
  badge: 'FEATURED EVENT',
  image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&q=70',
  title: '2024 서울 커피 엑스포',
  date: '2024.11.20 - 23',
  venue: '코엑스(COEX) 전관',
  info: '전 세계 커피 산업의 흐름을 한눈에 볼 수 있는 아시아 최대 규모의 전시회입니다. 스페셜티 커피부터 최첨단 로스팅 장비까지, 바리스타들을 위한 혁신의 현장에 초대합니다.',
  baristaCount: 12,
  avatarSeeds: ['barista-k01', 'barista-k02', 'barista-k03'],
};

const MOCK_REVIEWS = [
  {
    id: 'r-1',
    author: '@Barista_K',
    category: 'LATTE ART CLASS',
    title: '라떼아트 원데이 클래스 : 벨벳 밀크의 비밀',
    tags: ['배우면족', '유익함', '즐거움'],
    image: 'https://images.unsplash.com/photo-1534040385115-33dcb3acba5b?w=800&q=70',
  },
  {
    id: 'r-2',
    author: '@Coffee_Lover',
    category: 'SOCIAL MEETUP',
    title: '퇴근 후 번개모임 : 오늘의 원두 공유회',
    tags: ['재밌음', '친목도모'],
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=70',
  },
];

const MOCK_QA = [
  {
    id: 'q-1',
    question: '에스프레소 마신 세척 팁 있을까요?',
    isAnonymous: true,
    replyCount: 3,
    timeAgo: '2 hours ago',
  },
  {
    id: 'q-2',
    question: '가성비 좋은 그라인더 추천해주세요!',
    isAnonymous: true,
    replyCount: 5,
    timeAgo: '5 hours ago',
  },
];



// ─── Featured Event Card ──────────────────────────────────────────────────────

function FeaturedEventCard() {
  const [joined, setJoined] = useState(false);

  return (
    <section className="bg-white mb-2">
      {/* Hero image with overlay */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#1a1a1a]">
        <img
          src={MOCK_EVENT.image}
          alt={MOCK_EVENT.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

        {/* Badge */}
        <span className="absolute top-4 left-4 bg-[#D81919] text-white text-xs font-black tracking-widest px-2.5 py-1 uppercase">
          {MOCK_EVENT.badge}
        </span>

        {/* Title overlay */}
        <h2 className="absolute bottom-4 left-4 right-4 text-white font-black text-xl leading-tight tracking-tight">
          {MOCK_EVENT.title}
        </h2>
      </div>

      {/* Event details */}
      <div className="px-5 pt-5 space-y-3.5">
        <div className="flex gap-5 items-start">
          <span className="text-[#D81919] text-xs font-black tracking-widest w-12 shrink-0 pt-px">
            DATE
          </span>
          <span className="text-sm font-bold text-[#1a1a1a]">{MOCK_EVENT.date}</span>
        </div>
        <div className="flex gap-5 items-start">
          <span className="text-[#D81919] text-xs font-black tracking-widest w-12 shrink-0 pt-px">
            VENUE
          </span>
          <span className="text-sm font-bold text-[#1a1a1a]">{MOCK_EVENT.venue}</span>
        </div>
        <div className="flex gap-5 items-start">
          <span className="text-[#D81919] text-xs font-black tracking-widest w-12 shrink-0 pt-px">
            INFO
          </span>
          <p className="text-sm text-[#4a4a4a] font-medium leading-relaxed">{MOCK_EVENT.info}</p>
        </div>
      </div>

      {/* Baristas joined */}
      <div className="px-5 pt-4 pb-3 flex items-center gap-3">
        <div className="flex items-center -space-x-2">
          {MOCK_EVENT.avatarSeeds.map((seed) => (
            <img
              key={seed}
              src={`https://i.pravatar.cc/32?u=${seed}`}
              alt="barista"
              className="w-7 h-7 rounded-full border-2 border-white"
            />
          ))}
          <div className="w-7 h-7 rounded-full border-2 border-white bg-[#1a1a1a] flex items-center justify-center">
            <span className="text-white text-xs font-black leading-none">
              +{MOCK_EVENT.baristaCount}
            </span>
          </div>
        </div>
        <span className="text-xs font-black tracking-wider text-[#6a6a6a] uppercase">
          Baristas Joined
        </span>
      </div>

      {/* CTA */}
      <div className="px-5 pb-6">
        <motion.button
          onClick={() => setJoined(!joined)}
          whileTap={{ scale: 0.98 }}
          className={cn(
            'w-full py-4 font-black text-sm tracking-widest transition-colors',
            joined
              ? 'bg-[#1a1a1a] text-white'
              : 'bg-[#D81919] text-white hover:bg-[#b81515]',
          )}
        >
          {joined ? '신청완료 ✓' : '신청하기'}
        </motion.button>
      </div>
    </section>
  );
}

// ─── Review Card ──────────────────────────────────────────────────────────────

function ReviewCard({
  review,
}: {
  review: {
    id: string;
    author: string;
    category: string;
    title: string;
    tags: string[];
    image: string;
  };
}) {
  return (
    <article className="bg-white mb-2 pb-5">
      <div className="w-full aspect-[4/3] overflow-hidden">
        <img
          src={review.image}
          alt={review.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="px-5 pt-3">
        {/* Author + category */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[#D81919] text-xs font-black">{review.author}</span>
          <span className="text-[#d0d0d0] text-xs">—</span>
          <span className="text-[#9a9a9a] text-xs font-black uppercase tracking-widest">
            {review.category}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-black text-base leading-snug tracking-tight text-[#1a1a1a] mb-2.5">
          {review.title}
        </h3>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {review.tags.map((tag) => (
            <span key={tag} className="text-xs font-bold text-[#7a7a7a]">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

// ─── Q&A Card ─────────────────────────────────────────────────────────────────

function QACard({
  qa,
}: {
  qa: {
    id: string;
    question: string;
    isAnonymous: boolean;
    replyCount: number;
    timeAgo: string;
  };
}) {
  return (
    <div className="mx-5 mb-3 bg-white border border-[#e8e8e8] p-4">
      {/* Question text */}
      <div className="flex items-start gap-2 mb-3">
        <p className="text-sm font-bold text-[#1a1a1a] leading-snug flex-1">
          Q: {qa.question}{' '}
          {qa.isAnonymous && (
            <span className="text-[#9a9a9a] font-medium text-xs">(익명)</span>
          )}
        </p>
        <button
          className="text-[#c0c0c0] hover:text-[#555] transition-colors shrink-0"
          aria-label="더보기"
        >
          <MoreVertical className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>

      {/* Meta: replies + time */}
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-[#D81919] shrink-0" />
        <span className="text-xs font-black text-[#D81919]">{qa.replyCount} 답변</span>
        <span className="text-xs text-[#b0b0b0] font-medium">{qa.timeAgo}</span>
      </div>
    </div>
  );
}

// ─── Write Bottom Sheet ───────────────────────────────────────────────────────

function WriteBottomSheet({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const createMutation = useCreatePost();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [postType, setPostType] = useState<PostTypeId>('daily');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreviewImages((prev) => [...prev, ev.target?.result as string].slice(0, 4));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removeImage = (idx: number) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast({ title: '내용을 입력해주세요.', variant: 'destructive' });
      return;
    }
    try {
      await createMutation.mutateAsync({
        data: { type: postType, title: title.trim() || undefined, content },
      });
      toast({ title: '게시글이 등록됐습니다. ☕' });
      setTitle('');
      setContent('');
      setPreviewImages([]);
      setPostType('daily');
      onSuccess();
      onClose();
    } catch {
      toast({ title: '등록 실패', description: '다시 시도해주세요.', variant: 'destructive' });
    }
  };

  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()} direction="bottom">
      <DrawerContent className="max-w-[430px] mx-auto bg-white focus:outline-none rounded-t-2xl">
        <div className="mx-auto mt-2 w-10 h-1 rounded-full bg-[#e0e0e0]" />

        <DrawerHeader className="px-5 pt-4 pb-0">
          <DrawerTitle className="text-base font-black tracking-tight text-[#111]">글쓰기</DrawerTitle>
        </DrawerHeader>

        <div className="px-5 py-4 flex flex-col gap-5 pb-8">
          {/* Category chips */}
          <div>
            <p className="text-xs font-black tracking-widest uppercase text-[#aaa] mb-2.5">카테고리</p>
            <div className="flex gap-2">
              {POST_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setPostType(t.id)}
                  className={cn(
                    'flex-1 py-2.5 text-xs font-black transition-all border',
                    postType === t.id
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-[#888] border-[#e8e8e8] hover:border-black hover:text-black',
                  )}
                >
                  <span className="block text-base leading-none mb-0.5">{t.emoji}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <p className="text-xs font-black tracking-widest uppercase text-[#aaa] mb-2.5">
              제목{' '}
              <span className="text-[#d0d0d0] normal-case tracking-normal font-medium">
                — 입력하면 굵게 표시됩니다
              </span>
            </p>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="핸드드립 물 온도 조절 팁"
              className="w-full px-4 py-3 bg-[#f8f8f8] border border-[#ebebeb] text-sm font-black text-[#1a1a1a] outline-none placeholder:text-[#d0d0d0] placeholder:font-medium focus:border-black transition-colors"
            />
          </div>

          {/* Content */}
          <div>
            <p className="text-xs font-black tracking-widest uppercase text-[#aaa] mb-2.5">내용</p>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="바리스타들과 나누고 싶은 이야기를 적어주세요."
              rows={5}
              className="w-full px-4 py-3 bg-[#f8f8f8] border border-[#ebebeb] text-sm font-medium text-[#1a1a1a] outline-none placeholder:text-[#c0c0c0] resize-none focus:border-black transition-colors leading-relaxed"
            />
          </div>

          {/* Photo attachment */}
          <div>
            <p className="text-xs font-black tracking-widest uppercase text-[#aaa] mb-2.5">사진 첨부</p>
            <div className="flex gap-2 flex-wrap">
              {previewImages.length < 4 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-16 h-16 border-2 border-dashed border-[#d8d8d8] flex items-center justify-center text-[#b0b0b0] hover:border-black hover:text-black transition-colors"
                >
                  <ImagePlus className="w-5 h-5" strokeWidth={1.5} />
                </button>
              )}
              {previewImages.map((src, i) => (
                <div key={i} className="relative w-16 h-16">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-black text-white rounded-full flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageSelect}
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={createMutation.isPending || !content.trim()}
            className="w-full py-4 bg-black text-white font-black text-sm tracking-widest hover:bg-[#D81919] transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {createMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              '등록하기'
            )}
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Community() {
  const [activeTab, setActiveTab] = useState<AnchorTab>('events');
  const [writeOpen, setWriteOpen] = useState(false);
  const { refetch } = useGetPosts({});

  const { data, isLoading } = useGetPosts({});
  const posts = data?.posts ?? [];
  const reviewPosts = posts.filter((p) => p.type === 'daily' || p.type === 'recipe');
  const qaPosts = posts.filter((p) => p.type === 'knowhow');

  const eventsRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);
  const qaRef = useRef<HTMLDivElement>(null);

  const sectionRefs: Record<AnchorTab, React.RefObject<HTMLDivElement | null>> = {
    events: eventsRef,
    reviews: reviewsRef,
    qa: qaRef,
  };

  const scrollToSection = (tabId: AnchorTab) => {
    setActiveTab(tabId);
    sectionRefs[tabId].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const fab = (
    <motion.button
      onClick={() => setWriteOpen(true)}
      whileTap={{ scale: 0.92 }}
      className="w-14 h-14 bg-[#1a1a1a] text-white flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.35)] hover:bg-[#D81919] transition-colors"
      style={{ borderRadius: '50%' }}
      aria-label="글쓰기"
    >
      <PencilLine className="w-5 h-5" strokeWidth={2} />
    </motion.button>
  );

  return (
    <MobileLayout fab={fab}>
      {/* ── Section Nav (sticky top-0) */}
      <SectionNav />

      {/* ── Editorial Header (scrolls away) */}
      <div className="bg-white px-5 pt-5 pb-5 border-b border-[#f0f0f0]">
        <p className="label-caps text-[#D81919] mb-1.5">THE COMMUNITY</p>
        <h1 className="text-2xl font-black leading-none tracking-tight text-[#1a1a1a]">
          ON/OFF LOUNGE
        </h1>
      </div>

      {/* ── Anchor Tabs (sticky below section nav ~40px) */}
      <div className="sticky top-[40px] z-20 bg-white border-b border-[#e8e8e8]">
        <div className="flex overflow-x-auto no-scrollbar">
          {ANCHOR_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => scrollToSection(tab.id)}
              className={cn(
                'relative px-4 py-3 text-xs font-black whitespace-nowrap shrink-0 tracking-wider transition-colors',
                activeTab === tab.id ? 'text-[#D81919]' : 'text-[#b0b0b0] hover:text-[#555]',
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="anchor-underline"
                  className="absolute bottom-0 left-0 w-full h-[2px] bg-[#D81919]"
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────────── */}
      <div className="bg-[#f2f2f2] pb-24">

        {/* EVENTS section */}
        <div ref={eventsRef} style={{ scrollMarginTop: '88px' }}>
          <FeaturedEventCard />
        </div>

        {/* EVENT REVIEWS section */}
        <div ref={reviewsRef} style={{ scrollMarginTop: '88px' }}>
          {/* Section header */}
          <div className="px-5 pt-6 pb-4 flex items-center justify-between">
            <h2 className="text-sm font-black tracking-widest text-[#1a1a1a]">
              EVENT REVIEWS
            </h2>
            <button className="text-xs font-black text-[#9a9a9a] tracking-widest hover:text-[#555] transition-colors">
              VIEW ALL
            </button>
          </div>

          {/* Cards */}
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white h-72 animate-pulse" />
              ))}
            </div>
          ) : reviewPosts.length > 0 ? (
            reviewPosts.slice(0, 3).map((post) => (
              <ReviewCard
                key={post.id}
                review={{
                  id: post.id,
                  author: `@${post.author.name}`,
                  category: (post.type ?? 'post').toUpperCase(),
                  title: post.title || post.content.slice(0, 40),
                  tags: [],
                  image:
                    post.images?.[0] ??
                    `https://picsum.photos/seed/${post.id}/800/600`,
                }}
              />
            ))
          ) : (
            MOCK_REVIEWS.map((r) => <ReviewCard key={r.id} review={r} />)
          )}
        </div>

        {/* Q&A section */}
        <div ref={qaRef} style={{ scrollMarginTop: '88px' }}>
          {/* Section header */}
          <div className="px-5 pt-6 pb-4 flex items-center justify-between">
            <h2 className="text-sm font-black tracking-widest text-[#1a1a1a]">Q&A</h2>
            <button className="text-xs font-black text-[#9a9a9a] tracking-widest hover:text-[#555] transition-colors">
              ALL QUESTIONS
            </button>
          </div>

          {/* Cards */}
          {qaPosts.length > 0
            ? qaPosts.slice(0, 3).map((post) => (
                <QACard
                  key={post.id}
                  qa={{
                    id: post.id,
                    question: post.title || post.content.slice(0, 50),
                    isAnonymous: false,
                    replyCount: (post as any).commentCount ?? 0,
                    timeAgo: post.createdAt
                      ? formatDistanceToNow(new Date(post.createdAt), {
                          addSuffix: true,
                          locale: ko,
                        })
                      : '',
                  }}
                />
              ))
            : MOCK_QA.map((q) => <QACard key={q.id} qa={q} />)}
        </div>
      </div>

      {/* Write Bottom Sheet */}
      <WriteBottomSheet
        open={writeOpen}
        onClose={() => setWriteOpen(false)}
        onSuccess={() => refetch()}
      />
    </MobileLayout>
  );
}
