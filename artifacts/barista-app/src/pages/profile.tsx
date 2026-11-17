import { useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useAuthStore } from '@/store/useAuthStore';
import { useGetMe, useUpdateProfile, useGetUserScraps } from '@workspace/api-client-react';
import { Coffee, MapPin, Edit3, Bookmark, ChevronRight, LogOut, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

/** 사진 미선택 시 랜덤 기본 아바타 */
const DEFAULT_AVATARS = [
  'https://i.pravatar.cc/200?u=barista_a',
  'https://i.pravatar.cc/200?u=barista_b',
  'https://i.pravatar.cc/200?u=barista_c',
  'https://i.pravatar.cc/200?u=barista_d',
  'https://i.pravatar.cc/200?u=barista_e',
  'https://i.pravatar.cc/200?u=barista_f',
];
const getRandomAvatar = () =>
  DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)];

export default function Profile() {
  const [, setLocation] = useLocation();
  const { logout, updateUser } = useAuthStore();
  const { toast } = useToast();

  const { data: user, isLoading, refetch } = useGetMe();
  const updateMutation = useUpdateProfile();
  const { data: scraps } = useGetUserScraps();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editProfileImage, setEditProfileImage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setEditProfileImage(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = () => {
    logout();
    setLocation('/login');
  };

  const handleToggleActive = async () => {
    if (!user) return;
    try {
      const res = await updateMutation.mutateAsync({ data: { isActive: !user.isActive } });
      updateUser(res);
      refetch();
      toast({ title: '상태 변경', description: res.isActive ? '활동중으로 설정되었습니다.' : '비활동중으로 설정되었습니다.' });
    } catch {
      toast({ title: '오류', description: '상태 변경에 실패했습니다.', variant: 'destructive' });
    }
  };

  const handleSaveEdit = async () => {
    try {
      // 사진: 새로 선택한 이미지 > 기존 이미지 > 랜덤 기본 아바타
      const profileImage = editProfileImage || user?.profileImage || getRandomAvatar();
      const res = await updateMutation.mutateAsync({ data: { name: editName, bio: editBio, profileImage } });
      updateUser(res);
      refetch();
      setIsEditing(false);
      toast({ title: '저장 완료', description: '프로필이 수정되었습니다.' });
    } catch {
      toast({ title: '오류', description: '프로필 수정에 실패했습니다.', variant: 'destructive' });
    }
  };

  const openEdit = () => {
    if (user) {
      setEditName(user.name);
      setEditBio(user.bio || '');
      setEditProfileImage('');
      setIsEditing(true);
    }
  };

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
        </div>
      </MobileLayout>
    );
  }

  if (!user) {
    return (
      <MobileLayout hideHeader hideNav>
        <div className="flex flex-col items-center justify-center h-full gap-4 px-6">
          <p className="font-black text-xl tracking-tight">로그인이 필요합니다.</p>
          <button
            onClick={() => setLocation('/login')}
            className="w-full py-4 bg-black text-white font-black text-sm tracking-wide"
          >
            로그인 하러 가기
          </button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="마이페이지">
      <div className="bg-[#f7f7f7] min-h-screen pb-8">

        {/* Profile Header Card */}
        <div className="bg-white border-b border-[#ebebeb]">
          <div className="px-5 pt-5 pb-5 relative">
            {/* Edit / Logout buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={openEdit}
                className="p-2 text-[#6a6a6a] hover:text-black bg-[#f0f0f0] transition-colors"
              >
                <Edit3 className="w-4 h-4" strokeWidth={1.5} />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 text-[#6a6a6a] hover:text-[#D81919] bg-[#f0f0f0] transition-colors"
              >
                <LogOut className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            {isEditing ? (
              <div className="space-y-4 pt-2">
                {/* 프로필 사진 편집 */}
                <div className="flex flex-col items-center mb-2">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-[#e0e0e0]">
                      {(editProfileImage || user.profileImage) ? (
                        <img
                          src={editProfileImage || user.profileImage || ''}
                          alt="프로필 사진"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Coffee className="w-10 h-10 text-[#b0b0b0]" strokeWidth={1} />
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-8 h-8 bg-black rounded-full flex items-center justify-center shadow-md hover:bg-[#D81919] transition-colors"
                    >
                      <Camera className="w-4 h-4 text-white" strokeWidth={1.5} />
                    </button>
                  </div>
                  <p className="text-xs text-[#9a9a9a] mt-2">사진을 누르거나 카메라 버튼을 탭하세요</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                </div>
                <input
                  className="w-full px-0 py-3 border-0 border-b-2 border-[#ebebeb] bg-transparent font-black text-xl tracking-tight outline-none focus:border-black transition-colors"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="이름"
                />
                <textarea
                  className="w-full px-0 py-3 border-0 border-b-2 border-[#ebebeb] bg-transparent text-sm font-medium outline-none focus:border-black transition-colors resize-none"
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="자기소개를 입력해주세요"
                  rows={3}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-3 bg-[#f0f0f0] text-[#6a6a6a] font-bold text-sm"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 py-3 bg-black text-white font-black text-sm hover:bg-[#D81919] transition-colors"
                    disabled={updateMutation.isPending}
                  >
                    저장
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="w-24 h-24 bg-[#f0f0f0] overflow-hidden border-4 border-white shadow-md">
                    {user.profileImage ? (
                      <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#e0e0e0] flex items-center justify-center">
                        <Coffee className="w-10 h-10 text-[#b0b0b0]" strokeWidth={1} />
                      </div>
                    )}
                  </div>
                  <div className={cn(
                    'absolute bottom-0.5 right-0.5 w-5 h-5 rounded-full border-2 border-white shadow-sm',
                    user.isActive ? 'bg-[#D81919]' : 'bg-[#c0c0c0]'
                  )} />
                </div>

                <div className="inline-flex items-center gap-1.5 bg-[#f0f0f0] px-3 py-1 text-xs font-black text-[#6a6a6a] mb-2 tracking-wide">
                  {user.role === 'barista' ? '바리스타' : '커피 러버'}
                </div>
                <h2 className="font-black text-2xl tracking-tight">{user.name}</h2>
                {user.location && (
                  <p className="text-xs text-[#9a9a9a] flex items-center gap-1 mt-1 font-medium">
                    <MapPin className="w-3 h-3" strokeWidth={1.5} /> {user.location}
                  </p>
                )}
                <p className="text-sm text-[#4a4a4a] font-medium mt-3 px-4 leading-relaxed">
                  {user.bio || '등록된 자기소개가 없습니다.'}
                </p>
              </div>
            )}

            {/* Active Toggle (barista only) */}
            {user.role === 'barista' && !isEditing && (
              <div className="mt-5 bg-[#f7f7f7] border border-[#ebebeb] p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-black text-sm">지도 활동 표시</h4>
                  <p className="text-xs text-[#9a9a9a] font-medium mt-0.5">
                    내 위치를 지도에 표시하고 스카웃 제안을 받습니다.
                  </p>
                </div>
                <button
                  onClick={handleToggleActive}
                  className={cn(
                    'w-14 h-8 rounded-full transition-colors relative flex-shrink-0',
                    user.isActive ? 'bg-[#D81919]' : 'bg-[#d0d0d0]'
                  )}
                >
                  <div className={cn(
                    'absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm',
                    user.isActive ? 'left-7' : 'left-1'
                  )} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 스크랩한 레시피 */}
        <div className="mt-3 mx-4">
          <div className="bg-white border border-[#ebebeb] overflow-hidden">
            <div className="p-4 border-b border-[#ebebeb] flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-[#D81919]" strokeWidth={1.5} />
              <h3 className="font-black text-sm">스크랩한 레시피</h3>
            </div>
            <div className="p-4 flex gap-3 overflow-x-auto no-scrollbar">
              {scraps?.length ? (
                scraps.map((recipe) => (
                  <div key={recipe.id} className="min-w-[120px] shrink-0">
                    <div className="aspect-square bg-[#f0f0f0] mb-2 overflow-hidden">
                      {recipe.images?.[0] ? (
                        <img src={recipe.images[0]} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-[#e0e0e0]" />
                      )}
                    </div>
                    <h4 className="font-bold text-xs line-clamp-1">{recipe.title}</h4>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#9a9a9a] font-medium py-3">스크랩한 레시피가 없습니다.</p>
              )}
            </div>
          </div>
        </div>

        {/* 메뉴 */}
        <div className="mt-3 mx-4">
          <div className="bg-white border border-[#ebebeb] overflow-hidden divide-y divide-[#f0f0f0]">
            {['내 게시글 보기', '리뷰 관리', '고객센터', '설정'].map((menu) => (
              <button
                key={menu}
                className="w-full p-4 flex items-center justify-between hover:bg-[#fafafa] transition-colors"
              >
                <span className="font-bold text-sm">{menu}</span>
                <ChevronRight className="w-4 h-4 text-[#c0c0c0]" strokeWidth={1.5} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
