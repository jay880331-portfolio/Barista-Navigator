import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { useAuthStore } from "@/store/useAuthStore";
import type { UserProfile } from "@workspace/api-client-react";
import { useGetPosts, useUpdateProfile } from "@workspace/api-client-react";
import {
  Star,
  Coffee,
  Instagram,
  AtSign,
  Edit2,
  Award,
  Plus,
  Trash2,
  Image,
} from "lucide-react";
import { motion, useMotionValue, animate } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

/** 커피 프로필 공개/비공개 토글 버튼 */
function PublicPrivateToggle({
  isPublic,
  onToggle,
  isPending,
}: {
  isPublic: boolean;
  onToggle: () => void;
  isPending: boolean;
}) {
  return (
    <button
      onClick={onToggle}
      disabled={isPending}
      aria-label={
        isPublic ? "공개 상태 — 비공개로 전환" : "비공개 상태 — 공개로 전환"
      }
      className={cn(
        "w-11 h-6 rounded-full transition-colors relative flex-shrink-0",
        isPublic ? "bg-[#22c55e]" : "bg-[#d0d0d0]",
        isPending && "opacity-60 cursor-not-allowed",
      )}
    >
      <div
        className={cn(
          "absolute top-[3px] w-[18px] h-[18px] bg-white rounded-full shadow transition-all",
          isPublic ? "left-[22px]" : "left-[3px]",
        )}
      />
    </button>
  );
}

/** 프로필 카드 슬라이더 (슬라이드 1: 전문정보 / 슬라이드 2: 소셜정보) */
function ProfileCardSlider({
  user,
  skills,
}: {
  user: UserProfile | null;
  skills: string[];
}) {
  const SLIDE_COUNT = 2;
  const [currentSlide, setCurrentSlide] = useState(0);
  const x = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    const threshold = 50;
    if (info.offset.x < -threshold && currentSlide < SLIDE_COUNT - 1) {
      setCurrentSlide(1);
      animate(x, 0, { type: "spring", stiffness: 400, damping: 40 });
    } else if (info.offset.x > threshold && currentSlide > 0) {
      setCurrentSlide(0);
      animate(x, 0, { type: "spring", stiffness: 400, damping: 40 });
    } else {
      animate(x, 0, { type: "spring", stiffness: 400, damping: 40 });
    }
  };

  return (
    <div className="overflow-hidden rounded-lg" ref={containerRef}>
      {/* 슬라이드 트랙 */}
      <motion.div
        className="flex"
        animate={{ x: currentSlide === 0 ? "0%" : "-100%" }}
        transition={{ type: "spring", stiffness: 380, damping: 38 }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
        style={{ x, cursor: "grab", userSelect: "none" }}
        whileTap={{ cursor: "grabbing" }}
      >
        {/* ── 슬라이드 1: 전문 정보 ── */}
        <div className="w-full flex-shrink-0 flex flex-col gap-3 px-4 py-4">
          <div className="flex gap-4">
            {/* 원형 아바타 */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#e8e8e8] bg-[#f0f0f0] shadow-sm">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user?.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#e0e0e0]">
                    <Coffee
                      className="w-8 h-8 text-[#c0c0c0]"
                      strokeWidth={1}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 우측 전문 정보 */}
            <div className="flex-1 min-w-0 flex flex-col gap-2">
              <div className="flex gap-1.5 items-start">
                <span className="text-xs font-black text-[#9a9a9a] w-12 flex-shrink-0 pt-px">
                  소속
                </span>
                <span className="text-xs font-medium text-[#4a4a4a] leading-snug line-clamp-1">
                  {user?.location || "—"}
                </span>
              </div>
              <div className="flex gap-1.5 items-start">
                <span className="text-xs font-black text-[#9a9a9a] w-12 flex-shrink-0 pt-px">
                  경력
                </span>
                <span className="text-xs font-medium text-[#4a4a4a] leading-snug line-clamp-2">
                  {user?.bio ? user.bio.substring(0, 40) : "—"}
                </span>
              </div>
              <div className="flex gap-1.5 items-start">
                <span className="text-xs font-black text-[#9a9a9a] w-12 flex-shrink-0 pt-px">
                  주특기
                </span>
                <div className="flex flex-wrap gap-x-2 gap-y-1">
                  {skills.slice(0, 3).map((s) => (
                    <span key={s} className="text-xs font-bold text-[#4a4a4a]">
                      #{s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 즐겨하기 카운트 */}
          <div className="flex items-center gap-1.5 pt-2 border-t border-[#f0f0f0]">
            <Star className="w-4 h-4 text-[#F5A623] fill-[#F5A623]" />
            <span className="text-sm font-black text-[#1a1a1a]">3.2K</span>
            <span className="text-xs text-[#9a9a9a] font-medium">
              명이 즐겨하기 중
            </span>
          </div>
        </div>

        {/* ── 슬라이드 2: 소셜 정보 ── */}
        <div className="w-full flex-shrink-0 px-4 py-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Instagram className="w-4 h-4 text-[#9a9a9a]" strokeWidth={1.5} />
            <span className="text-xs font-medium text-[#4a4a4a]">
              인스타 아이디
            </span>
          </div>
          <div className="flex items-center gap-2">
            <AtSign className="w-4 h-4 text-[#9a9a9a]" strokeWidth={1.5} />
            <span className="text-xs font-medium text-[#4a4a4a]">
              스레드 아이디
            </span>
          </div>
          <div className="flex gap-2 items-start pt-1 border-t border-[#f0f0f0]">
            <span className="text-xs font-black text-[#9a9a9a] w-10 flex-shrink-0 pt-px">
              성격
            </span>
            <span className="text-xs font-medium text-[#4a4a4a]">
              {user?.bio ? user.bio.substring(0, 20) : "—"}
            </span>
          </div>
          <p className="text-xs font-bold text-[#4a4a4a] italic leading-snug">
            "{user?.bio ?? "바리스타는 언제나 즐겁다"}"
          </p>
        </div>
      </motion.div>

      {/* 슬라이드 인디케이터 */}
      <div className="flex justify-center gap-1.5 pb-3">
        {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            aria-label={`슬라이드 ${i + 1}`}
            className={cn(
              "rounded-full transition-all",
              i === currentSlide
                ? "w-4 h-1.5 bg-[#D81919]"
                : "w-1.5 h-1.5 bg-[#d0d0d0]",
            )}
          />
        ))}
      </div>
    </div>
  );
}

/** Work/History 단일 카드 */
function WorkHistoryCard({
  imageUrl,
  tags,
}: {
  imageUrl?: string;
  tags: string[];
}) {
  return (
    <div className="w-full flex items-stretch bg-white border border-[#ebebeb] overflow-hidden text-left rounded-lg">
      {/* 이미지 */}
      <div className="w-[110px] flex-shrink-0 bg-[#f0f0f0] aspect-[4/3] relative overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="작업 이미지"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Coffee className="w-8 h-8 text-[#c0c0c0]" strokeWidth={1} />
          </div>
        )}
      </div>
      {/* 태그 */}
      <div className="flex-1 px-4 py-3 flex flex-col justify-center gap-1.5">
        {tags.slice(0, 4).map((tag) => (
          <span
            key={tag}
            className="text-xs font-bold text-[#4a4a4a] leading-snug"
          >
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function SwipeableWorkItem({
  item,
  onEdit,
  onDelete,
}: {
  item: { id: string; imageUrl?: string; tags: string[] };
  onEdit: () => void;
  onDelete: () => void;
}) {
  const x = useMotionValue(0);

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x < -40) {
      animate(x, -100, { type: "spring", stiffness: 400, damping: 40 });
    } else {
      animate(x, 0, { type: "spring", stiffness: 400, damping: 40 });
    }
  };

  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-[#ebebeb] bg-[#f7f7f7]">
      <div className="absolute top-0 bottom-0 right-0 w-[100px] flex">
        <button
          onClick={() => {
            animate(x, 0);
            onEdit();
          }}
          className="flex-1 bg-[#4a4a4a] text-white flex items-center justify-center transition-colors hover:bg-black"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            animate(x, 0);
            onDelete();
          }}
          className="flex-1 bg-[#D81919] text-white flex items-center justify-center transition-colors hover:bg-red-700"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className="w-full h-full relative z-10 bg-white"
      >
        <WorkHistoryCard imageUrl={item.imageUrl} tags={item.tags} />
      </motion.div>
    </div>
  );
}

export default function HomePage() {
  const { user, updateUser } = useAuthStore();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [editSection, setEditSection] = useState<
    "profile" | "bio" | "work" | null
  >(null);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [localWorkItems, setLocalWorkItems] = useState<
    {
      id: string;
      imageUrl?: string;
      tags: string[];
      imageFile?: File | string;
    }[]
  >([]);
  const [editingItem, setEditingItem] = useState<{
    id: string;
    imageUrl?: string;
    tags: string[];
    imageFile?: File | string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { data: postsData } = useGetPosts({ limit: 5 });
  const updateMutation = useUpdateProfile();

  const recentPosts = postsData?.posts ?? [];
  const skills = user?.skills?.length
    ? user.skills
    : ["라떼아트", "핸드드립", "에스프레소"];
  const mockCertifications = [
    "바리스타 2급",
    "심화 라떼아트",
    "스페셜티 커피 마스터",
  ];
  const hasCertifications = mockCertifications.length > 0;

  const handleToggleActive = async () => {
    if (!user) return;
    try {
      const res = await updateMutation.mutateAsync({
        data: { isActive: !user.isActive },
      });
      updateUser(res);
      toast({
        title: "상태 변경",
        description: res.isActive
          ? "활동중으로 설정되었습니다."
          : "비활동중으로 설정되었습니다.",
      });
    } catch {
      toast({
        title: "오류",
        description: "상태 변경에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  // Work/History용: 이미지 있는 포스트만 우선, 없으면 스킬로 mock
  const workItems: { imageUrl?: string; tags: string[]; id: string }[] =
    recentPosts.length > 0
      ? recentPosts.map((p) => ({
          id: p.id,
          imageUrl: p.images?.[0],
          tags: p.title
            ? [p.title, ...(user?.skills?.slice(0, 2) ?? [])]
            : (user?.skills ?? ["커피"]),
        }))
      : [
          {
            id: "mock-1",
            imageUrl: undefined,
            tags: ["라떼아트", "싱글머신", "핸드드립"],
          },
          {
            id: "mock-2",
            imageUrl: undefined,
            tags: ["운영커피샵", "인테리어"],
          },
        ];

  // 초기 데이터 연동
  useEffect(() => {
    if (localWorkItems.length === 0 && workItems.length > 0) {
      setLocalWorkItems(workItems);
    }
  }, [workItems]);

  if (editSection) {
    return (
      <MobileLayout
        hideNav
        onBack={() => setEditSection(null)}
        title={
          editSection === "profile"
            ? "프로필 편집"
            : editSection === "bio"
              ? "자기소개 편집"
              : "Work/History 편집"
        }
      >
        <div className="bg-white min-h-full p-5 space-y-6 pb-24">
          {/* ─── 프로필 섹션 ─── */}
          {editSection === "profile" && (
            <div>
              <h3 className="font-bold text-xl mb-4">프로필 정보</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-bold">이름</label>
                  <input
                    type="text"
                    defaultValue={user?.name}
                    className="w-full px-4 py-3 border border-[#ebebeb] rounded-lg focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold">소속</label>
                  <input
                    type="text"
                    defaultValue={user?.location}
                    className="w-full px-4 py-3 border border-[#ebebeb] rounded-lg focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold">경력</label>
                  <textarea
                    rows={2}
                    placeholder="지금까지의 커피 관련된 주요 경력을 적어주세요"
                    className="w-full px-4 py-3 border border-[#ebebeb] rounded-lg focus:outline-none focus:border-black resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold">주특기</label>
                  <input
                    type="text"
                    placeholder="예: 라떼아트, 핸드드립, 에스프레소"
                    defaultValue={skills.join(", ")}
                    className="w-full px-4 py-3 border border-[#ebebeb] rounded-lg focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold">
                    인스타 아이디
                  </label>
                  <input
                    type="text"
                    placeholder="@your_instagram"
                    className="w-full px-4 py-3 border border-[#ebebeb] rounded-lg focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold">
                    스레드 아이디
                  </label>
                  <input
                    type="text"
                    placeholder="@your_threads"
                    className="w-full px-4 py-3 border border-[#ebebeb] rounded-lg focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold">
                    성격 (한 줄 요약)
                  </label>
                  <input
                    type="text"
                    placeholder="예: 꼼꼼하고 완벽을 추구합니다"
                    className="w-full px-4 py-3 border border-[#ebebeb] rounded-lg focus:outline-none focus:border-black"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ─── 자기소개 섹션 ─── */}
          {editSection === "bio" && (
            <div>
              <h3 className="font-bold text-xl mb-4">자기소개</h3>
              <textarea
                defaultValue={user?.bio}
                rows={4}
                className="w-full px-4 py-3 border border-[#ebebeb] rounded-lg focus:outline-none focus:border-black resize-none"
              />
            </div>
          )}

          {/* ─── Work/History 섹션 ─── */}
          {editSection === "work" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-xl">
                  {editingItem?.id
                    ? "Work / History 수정"
                    : "Work / History 추가"}
                </h3>
              </div>
              <div className="border border-[#ebebeb] rounded-lg p-4 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#9a9a9a] mb-2">
                    이미지
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-[#ebebeb] rounded-lg hover:bg-[#f7f7f7] transition-colors text-sm"
                    >
                      <Image className="w-4 h-4" strokeWidth={1.5} />
                      <span>사진 첨부</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setEditingItem({
                            ...editingItem!,
                            imageFile: e.target.files[0],
                          });
                        }
                      }}
                      className="hidden"
                    />
                  </div>
                  {(editingItem?.imageFile || editingItem?.imageUrl) && (
                    <p className="text-xs text-[#9a9a9a] mt-2">
                      ✓ 이미지가 첨부되어 있습니다
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#9a9a9a] mb-2">
                    태그
                  </label>
                  <input
                    type="text"
                    value={editingItem?.tags?.join(", ") || ""}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem!,
                        tags: e.target.value
                          .split(",")
                          .map((t) => t.trim())
                          .filter((t) => t),
                      })
                    }
                    className="w-full px-4 py-3 border border-[#ebebeb] rounded-lg focus:outline-none focus:border-black text-xs"
                    placeholder="쉼표로 구분하여 입력"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ─── 버튼 ─── */}
          <div className="flex gap-3">
            <button
              onClick={() => setEditSection(null)}
              className="flex-1 py-4 bg-[#f0f0f0] text-[#6a6a6a] font-bold rounded-lg"
            >
              취소
            </button>
            <button
              onClick={() => {
                if (editSection === "work" && editingItem) {
                  if (
                    localWorkItems.find((item) => item.id === editingItem.id)
                  ) {
                    setLocalWorkItems(
                      localWorkItems.map((item) =>
                        item.id === editingItem.id ? editingItem : item,
                      ),
                    );
                  } else {
                    setLocalWorkItems([...localWorkItems, editingItem]);
                  }
                  toast({
                    title: "저장완료",
                    description: "항목이 저장되었습니다.",
                  });
                } else {
                  toast({
                    title: "저장완료",
                    description: "프로필이 수정되었습니다.",
                  });
                }
                setEditSection(null);
              }}
              className="flex-1 py-4 bg-black text-white font-bold rounded-lg hover:bg-[#D81919]"
            >
              저장
            </button>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="flex flex-col bg-white min-h-full pb-24">
        {/* ─── (Coffee) Profile 섹션 ─── */}
        <div className="bg-white rounded-b-2xl">
          {/* 섹션 헤더 */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h3 className="font-black text-xl tracking-tight">
              <span>Profile</span>
            </h3>
            <button
              onClick={() => setEditSection("profile")}
              aria-label="프로필 편집"
              className="p-1 text-[#6a6a6a] hover:text-black transition-colors"
            >
              <Edit2 className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>

          {/* 프로필 카드 */}
          <div className="mx-5 mb-3 border border-[#e0e0e0] bg-white rounded-2xl overflow-hidden">
            {/* 카드 상단: 토글 + 이름 + 소속 */}
            <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-[#f0f0f0]">
              <PublicPrivateToggle
                isPublic={!!user?.isActive}
                onToggle={handleToggleActive}
                isPending={updateMutation.isPending}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-black text-sm tracking-tight">
                    Barista {user?.name ?? "이름 없음"}
                  </span>
                  {user?.role === "barista" && (
                    <span className="label-caps text-xs bg-black text-white px-1.5 py-0.5 leading-none">
                      BARISTA
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#9a9a9a] font-medium mt-0.5">
                  {!!user?.isActive ? "공개" : "비공개"}
                </p>
              </div>
              {hasCertifications && (
                <button
                  onClick={() => setCertModalOpen(true)}
                  className="p-1 bg-[#D81919] text-white rounded-full hover:bg-[#b81515] transition-colors flex-shrink-0"
                  aria-label="자격증 보기"
                >
                  <Award className="w-4 h-4" strokeWidth={1.5} />
                </button>
              )}
            </div>

            {/* 카드 본문: 스와이프 가능한 슬라이드 */}
            <ProfileCardSlider user={user} skills={skills} />
          </div>
        </div>

        {/* ─── 자기소개 섹션 ─── */}
        <div className="mx-5 mt-3 bg-white border border-[#ebebeb] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-4 pb-1">
            <p className="label-caps text-[#9a9a9a] mb-3">자기소개</p>
            <button
              onClick={() => setEditSection("bio")}
              aria-label="자기소개 편집"
              className="p-1 mb-3 text-[#6a6a6a] hover:text-black transition-colors"
            >
              <Edit2 className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
          <div className="px-4 pb-4">
            {user?.bio ? (
              <p className="text-sm text-[#4a4a4a] font-medium leading-relaxed">
                {user.bio}
              </p>
            ) : (
              <p className="text-sm text-[#c0c0c0] font-medium italic leading-relaxed">
                "바리스타는 언제나 즐겁다"
              </p>
            )}
          </div>
          {/* 밑줄 장식 */}
          <div className="px-4 pb-4 flex flex-col gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-px bg-[#f0f0f0]" />
            ))}
          </div>
        </div>

        {/* ─── Work / History 섹션 ─── */}
        <div className="mx-5 mt-3 bg-white border border-[#ebebeb] rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-black text-xl tracking-tight">
              Work / History
            </h3>
            <button
              onClick={() => {
                setEditingItem({ id: `work-${Date.now()}`, tags: [] });
                setEditSection("work");
              }}
              aria-label="작업 이력 추가"
              className="p-1 text-black hover:text-[#D81919] transition-colors"
            >
              <Plus className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {localWorkItems.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: idx * 0.06,
                  duration: 0.22,
                  ease: "easeOut",
                }}
              >
                <SwipeableWorkItem
                  item={item}
                  onEdit={() => {
                    setEditingItem(item);
                    setEditSection("work");
                  }}
                  onDelete={() => {
                    setLocalWorkItems(
                      localWorkItems.filter((w) => w.id !== item.id),
                    );
                    toast({
                      title: "삭제됨",
                      description: "항목이 삭제되었습니다.",
                    });
                  }}
                />
              </motion.div>
            ))}
            {localWorkItems.length === 0 && (
              <div className="bg-white border border-[#ebebeb] px-4 py-8 text-center rounded-lg">
                <p className="text-sm text-[#9a9a9a] font-medium">
                  아직 작업 이력이 없어요
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── 자격증 바텀시트 ─── */}
      {certModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50"
          onClick={() => setCertModalOpen(false)}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 max-w-[430px] mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-4">
              <div className="w-12 h-1 bg-[#d0d0d0] rounded-full" />
            </div>
            <h3 className="font-black text-lg tracking-tight mb-4">자격증</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {mockCertifications.map((cert) => (
                <div
                  key={cert}
                  className="flex items-center gap-3 p-4 bg-[#f7f7f7] rounded-lg"
                >
                  <Award
                    className="w-5 h-5 text-[#D81919] flex-shrink-0"
                    strokeWidth={1.5}
                  />
                  <span className="font-medium text-sm">{cert}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setCertModalOpen(false)}
              className="w-full mt-4 py-3 bg-black text-white font-bold rounded-lg hover:bg-[#D81919] transition-colors"
            >
              닫기
            </button>
          </motion.div>
        </motion.div>
      )}
    </MobileLayout>
  );
}
