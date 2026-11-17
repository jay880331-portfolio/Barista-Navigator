import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { useAuthStore } from '@/store/useAuthStore';
import { useLoginUser } from '@workspace/api-client-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, Loader2 } from 'lucide-react';

export default function Login() {
  const [, setLocation] = useLocation();
  const { setAuth } = useAuthStore();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loginMutation = useLoginUser();

  // OAuth 콜백 처리 — 기존 사용자 直接 로그인
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isNaverCallback = params.get('naver_callback') === '1';
    const isKakaoCallback = params.get('kakao_callback') === '1';
    const error = params.get('error');
    const token = params.get('token');
    const userJson = params.get('user');

    if (error) {
      window.history.replaceState({}, '', '/login');
      const provider = isKakaoCallback ? '카카오' : '네이버';
      toast({
        title: `${provider} 로그인 실패`,
        description: error === 'naver_oauth_failed' || error === 'kakao_oauth_failed'
          ? `${provider} 인증 중 오류가 발생했습니다.`
          : error,
        variant: 'destructive',
      });
      return;
    }

    if ((isNaverCallback || isKakaoCallback) && token && userJson) {
      try {
        const user = JSON.parse(decodeURIComponent(userJson));
        setAuth(token, user);
        window.history.replaceState({}, '', '/login');
        setLocation('/home');
      } catch {
        window.history.replaceState({}, '', '/login');
      }
    }
  }, []);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: '입력 오류', description: '이메일과 비밀번호를 입력해주세요.', variant: 'destructive' });
      return;
    }
    try {
      const res = await loginMutation.mutateAsync({ data: { email, password } });
      setAuth(res.token, res.user);
      setLocation('/home');
    } catch (err: any) {
      toast({ title: '로그인 실패', description: err?.message || '이메일 또는 비밀번호를 확인해주세요.', variant: 'destructive' });
    }
  };

  const handleSocialLogin = async (provider: 'kakao' | 'naver') => {
    // Redirect to backend OAuth endpoint — it will redirect to provider
    window.location.href = `/api/auth/${provider}`;
  };

  return (
    <MobileLayout hideHeader hideNav>
      <div className="flex flex-col h-full min-h-screen bg-[#f7f7f7] px-6 py-12">
        {/* Logo / Brand */}
        <div className="flex flex-col items-center mb-10">
          <img src="/images/logo.svg" alt="Blending 로고" className="w-20 h-20 object-contain mb-4" />
          <h1 className="font-black text-3xl tracking-[0.08em] text-black">BLENDING</h1>
          <p className="text-[#9a9a9a] text-sm font-medium mt-2">커피를 사랑하는 사람들의 공간</p>
        </div>

        {/* Email / Password Form */}
        <form onSubmit={handleEmailLogin} className="flex flex-col gap-4 mb-6">
          <div className="bg-white border border-[#e8e8e8] flex items-center gap-3 px-4">
            <Mail className="w-4 h-4 text-[#b0b0b0] flex-shrink-0" strokeWidth={1.5} />
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 py-4 bg-transparent text-sm font-medium outline-none placeholder:text-[#c0c0c0]"
            />
          </div>
          <div className="bg-white border border-[#e8e8e8] flex items-center gap-3 px-4">
            <Lock className="w-4 h-4 text-[#b0b0b0] flex-shrink-0" strokeWidth={1.5} />
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 py-4 bg-transparent text-sm font-medium outline-none placeholder:text-[#c0c0c0]"
            />
          </div>
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full py-4 bg-black text-white font-black text-sm tracking-widest hover:bg-[#D81919] transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {loginMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : '로그인'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-5">
          <div className="flex-1 h-px bg-[#e8e8e8]" />
          <span className="text-xs text-[#b0b0b0] font-bold tracking-widest">1초만에 시작하기</span>
          <div className="flex-1 h-px bg-[#e8e8e8]" />
        </div>

        {/* Social Login */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => handleSocialLogin('kakao')}
            className="w-full py-4 bg-[#FEE500] text-[#000000] font-black text-sm tracking-wide flex items-center justify-center gap-2 hover:brightness-95 transition-all"
          >
            <div className="w-5 h-5 rounded-full bg-black/80 flex items-center justify-center text-[#FEE500] text-xs font-black">K</div>
            카카오로 로그인
          </button>
          <button
            onClick={() => handleSocialLogin('naver')}
            className="w-full py-4 bg-[#03C75A] text-white font-black text-sm tracking-wide flex items-center justify-center gap-2 hover:brightness-95 transition-all"
          >
            <span className="font-black text-base leading-none">N</span>
            네이버로 로그인
          </button>
        </div>

        <p className="mt-8 text-center text-sm font-medium text-[#9a9a9a]">
          아직 계정이 없으신가요?{' '}
          <Link href="/register" className="text-black font-black hover:text-[#D81919] transition-colors">
            회원가입
          </Link>
        </p>

        {/* 테스트 로그인 (개발용) */}
        <div className="mt-6 border-t border-dashed border-[#e0e0e0] pt-5">
          <p className="text-center text-xs text-[#c0c0c0] font-bold tracking-widest uppercase mb-3">
            개발용 테스트 계정
          </p>
          <div className="flex flex-col gap-2">
            {[
              { label: '☕ 바리스타 (정하은)', email: 'jhe@barista.com', password: 'password123' },
              { label: '👤 커피러버', email: 'user@test.com', password: 'password123' },
            ].map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={async () => {
                  try {
                    const res = await loginMutation.mutateAsync({
                      data: { email: account.email, password: account.password },
                    });
                    setAuth(res.token, res.user);
                    setLocation('/home');
                  } catch {
                    toast({ title: '테스트 로그인 실패', variant: 'destructive' });
                  }
                }}
                disabled={loginMutation.isPending}
                className="w-full py-2.5 border border-dashed border-[#d0d0d0] text-[#9a9a9a] text-xs font-bold hover:border-[#D81919] hover:text-[#D81919] transition-colors disabled:opacity-40"
              >
                {account.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
