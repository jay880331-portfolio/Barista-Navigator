import { useState } from 'react';
import { useLocation } from 'wouter';
import { MobileLayout } from '@/components/layout/MobileLayout';
import {
  useSendPhoneVerification,
  useConfirmPhoneVerification,
  useRegisterUser,
} from '@workspace/api-client-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/useAuthStore';
import { ChevronLeft, Loader2, CheckCircle2, Phone, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

// ─── 개발용 페이크 번호 ──────────────────────────────────────────────────────
const FAKE_PHONE = '00000000000'; // 000-0000-0000 (3+4+4=11자리) 입력 시 API 없이 인증 통과
const FAKE_CODE = '000000';
const FAKE_TOKEN = 'fake-verification-token-dev';

// ─── 상수 데이터 ─────────────────────────────────────────────────────────────

const WORK_TYPE_OPTIONS = [
  { value: '풀타임', label: '풀타임' },
  { value: '파트타임', label: '파트타임' },
  { value: '프리랜서', label: '프리랜서' },
  { value: '오너바리스타', label: '오너바리스타' },
];

const CAREER_YEARS_OPTIONS = [
  { value: '1년 미만', label: '1년 미만' },
  { value: '1~3년', label: '1~3년' },
  { value: '3~5년', label: '3~5년' },
  { value: '5년 이상', label: '5년 이상' },
];

const MAIN_SKILL_OPTIONS = [
  '에스프레소 추출',
  '브루잉',
  '로스팅',
  '라떼아트',
  '메뉴 개발',
];

const CERTIFICATION_OPTIONS = ['SCA', 'Q-Grader', 'GCS', 'IBS', 'EUCA'];

const MACHINE_OPTIONS = [
  { value: '', label: '선택 안함' },
  { value: '라마르조꼬(La Marzocco)', label: '라마르조꼬 (La Marzocco)' },
  { value: '시네소(Synesso)', label: '시네소 (Synesso)' },
  { value: '빅토리아 아르두이노(Victoria Arduino)', label: '빅토리아 아르두이노 (Victoria Arduino)' },
  { value: '슬레이어(Slayer)', label: '슬레이어 (Slayer)' },
  { value: '훼마(Faema)', label: '훼마 (Faema)' },
  { value: '시모넬리(Nuova Simonelli)', label: '시모넬리 (Nuova Simonelli)' },
];

const GRINDER_OPTIONS = [
  { value: '', label: '선택 안함' },
  { value: '말코닉(Mahlkonig)', label: '말코닉 (Mahlkonig)' },
  { value: '메져(Mazzer)', label: '메져 (Mazzer)' },
  { value: '안핌(Anfim)', label: '안핌 (Anfim)' },
  { value: '미토스(Mythos)', label: '미토스 (Mythos)' },
  { value: '컴팍(Compak)', label: '컴팍 (Compak)' },
  { value: '유레카(Eureka)', label: '유레카 (Eureka)' },
];

const ROASTING_OPTIONS = [
  { value: '', label: '선택 안함' },
  { value: '프로밧(Probat)', label: '프로밧 (Probat)' },
  { value: '기센(Giesen)', label: '기센 (Giesen)' },
  { value: '로링(Loring)', label: '로링 (Loring)' },
  { value: '스트롱홀드(Stronghold)', label: '스트롱홀드 (Stronghold)' },
  { value: '이지스터(Easyster)', label: '이지스터 (Easyster)' },
  { value: '태환(Proaster)', label: '태환 (Proaster)' },
];

const BEAN_TASTE_OPTIONS = ['산미', '고소함', '단맛', '밸런스', '디카페인'];

const TOTAL_STEPS = 6;

// ─── 유틸 컴포넌트 ───────────────────────────────────────────────────────────

function FieldInput({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-black tracking-wider uppercase text-[#888] flex items-center gap-1">
        {label}
        {required && <span className="text-[#D81919]">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-[#b0b0b0] font-medium">{hint}</p>}
    </div>
  );
}

function TextInput({
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled,
  className,
}: {
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={cn(
        'w-full px-4 py-4 bg-white border border-[#e8e8e8] text-sm font-medium text-foreground outline-none placeholder:text-[#c0c0c0] disabled:opacity-50 transition-colors focus:border-black',
        className,
      )}
    />
  );
}

function NativeSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-4 bg-white border border-[#e8e8e8] text-sm font-medium text-foreground outline-none appearance-none focus:border-black transition-colors cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
          <path d="M1 1L5 5L9 1" stroke="#888" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

function ChipSelect({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            className={cn(
              'px-3 py-2 text-xs font-black border transition-all',
              active
                ? 'bg-black text-white border-black'
                : 'bg-white text-[#888] border-[#e8e8e8] hover:border-black hover:text-black',
            )}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function PrimaryButton({
  onClick,
  disabled,
  loading,
  children,
  className,
}: {
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'w-full py-4 bg-black text-white font-black text-sm tracking-widest hover:bg-[#D81919] transition-colors disabled:opacity-40 flex items-center justify-center gap-2',
        className,
      )}
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : children}
    </button>
  );
}

// ─── 메인 컴포넌트 ───────────────────────────────────────────────────────────

export default function Register() {
  const [, setLocation] = useLocation();
  const { setAuth } = useAuthStore();
  const { toast } = useToast();

  // 상단에서 동기적으로 URL 파라미터를 읽어와 초기값을 설정
  // social_profile (기존), provider+providerId (네이버 새 사용자) 모두 지원
  const [initialProfile] = useState(() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);

    // 소셜 프로필 JSON 문자열 (카카오 등 기존 방식)
    const socialProfileStr = params.get('social_profile');
    if (socialProfileStr) {
      try {
        const profile = JSON.parse(decodeURIComponent(socialProfileStr));
        if (profile.provider && profile.providerId) return profile;
      } catch (err) {
        console.error('Failed to parse social profile:', err);
      }
    }

    // 개별 파라미터 (네이버 새 사용자: /register/social?provider=naver&...)
    const provider = params.get('provider');
    const providerId = params.get('providerId');
    if (provider && providerId) {
      return {
        provider,
        providerId,
        name: params.get('name') || '',
        email: params.get('email') || '',
        profileImage: params.get('profileImage') || '',
      };
    }

    return null;
  });

  const [step, setStep] = useState(initialProfile ? 3 : 1);

  // Step 1-2: 전화번호 인증
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [devCode, setDevCode] = useState('');

  // Step 3: 기본 정보
  const [name, setName] = useState(initialProfile?.name || '');
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState(initialProfile?.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // 소셜 로그인 정보
  const [provider] = useState(initialProfile?.provider || '');
  const [providerId] = useState(initialProfile?.providerId || '');

  // Step 4: 소속 정보
  const [storeName, setStoreName] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [workType, setWorkType] = useState('');
  const [careerYears, setCareerYears] = useState('');

  // Step 5: 전문 정보
  const [mainSkill, setMainSkill] = useState<string[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [awardRecords, setAwardRecords] = useState('');

  // Step 6: 선택 정보
  const [eqMachine, setEqMachine] = useState('');
  const [eqGrinder, setEqGrinder] = useState('');
  const [eqRoasting, setEqRoasting] = useState('');
  const [bean, setBean] = useState('');
  const [beanTaste, setBeanTaste] = useState<string[]>([]);
  const [snsUrl1, setSnsUrl1] = useState('');
  const [snsUrl2, setSnsUrl2] = useState('');
  const [snsUrl3, setSnsUrl3] = useState('');

  const sendCodeMutation = useSendPhoneVerification();
  const confirmCodeMutation = useConfirmPhoneVerification();
  const registerMutation = useRegisterUser();

  const toggleChip = (
    value: string,
    current: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    setter(current.includes(value) ? current.filter((v) => v !== value) : [...current, value]);
  };

  const handleBack = () => {
    if (step === 1 || (providerId && step === 3)) {
      setLocation('/login');
    } else {
      setStep((s) => s - 1);
    }
  };

  const isFakePhone = phone.replace(/-/g, '') === FAKE_PHONE;

  // ── Step 1: 인증번호 발송 ──────────────────────────────────────
  const handleSendCode = async () => {
    if (!phone || phone.replace(/-/g, '').length < 10) {
      toast({ title: '입력 오류', description: '올바른 휴대폰 번호를 입력해주세요.', variant: 'destructive' });
      return;
    }
    // 개발용 페이크 번호: API 호출 없이 바로 다음 단계
    if (isFakePhone) {
      setDevCode(FAKE_CODE);
      toast({ title: '개발용 번호', description: `인증코드: ${FAKE_CODE} (페이크)` });
      setStep(2);
      return;
    }
    try {
      const res = await sendCodeMutation.mutateAsync({ data: { phone } });
      // 개발 모드: 응답 메시지에서 코드 추출
      const match = res.message?.match(/개발모드:\s*(\d{6})/);
      if (match) setDevCode(match[1]);
      toast({ title: '인증번호 발송', description: '휴대폰으로 인증번호가 발송됐습니다.' });
      setStep(2);
    } catch (e: unknown) {
      const err = e as { message?: string };
      toast({ title: '발송 실패', description: err?.message || '잠시 후 다시 시도해주세요.', variant: 'destructive' });
    }
  };

  // ── Step 2: 인증번호 확인 ─────────────────────────────────────
  const handleConfirmCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({ title: '입력 오류', description: '6자리 인증번호를 입력해주세요.', variant: 'destructive' });
      return;
    }
    // 개발용 페이크 번호: 코드 일치 시 즉시 인증 완료
    if (isFakePhone && verificationCode === FAKE_CODE) {
      setVerificationToken(FAKE_TOKEN);
      toast({ title: '인증 완료 (개발)', description: '페이크 번호로 인증됐습니다.' });
      setStep(3);
      return;
    }
    try {
      const res = await confirmCodeMutation.mutateAsync({ data: { phone, code: verificationCode } });
      if (res.success) {
        setVerificationToken(res.verificationToken);
        toast({ title: '인증 완료', description: '전화번호가 인증됐습니다.' });
        setStep(3);
      }
    } catch {
      toast({ title: '인증 실패', description: '인증번호가 일치하지 않습니다.', variant: 'destructive' });
    }
  };

  // ── Step 3 유효성 검사 ────────────────────────────────────────
  const validateStep3 = () => {
    const isSocial = !!providerId;
    if (!name.trim()) return '성명을 입력해주세요.';
    if (!userId.trim()) return '닉네임을 입력해주세요.';
    if (!email.trim() && !isSocial) return '이메일을 입력해주세요.';
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return '올바른 이메일 형식을 입력해주세요.';
    if (!isSocial && (!password || password.length < 8)) return '비밀번호는 8자 이상이어야 합니다.';
    return null;
  };

  // ── Step 4 유효성 검사 ────────────────────────────────────────
  const validateStep4 = () => {
    if (!storeName.trim()) return '매장명을 입력해주세요.';
    if (!storeAddress.trim()) return '매장 상세 주소를 입력해주세요.';
    return null;
  };

  // ── Step 5 유효성 검사 ────────────────────────────────────────
  const validateStep5 = () => {
    if (mainSkill.length === 0) return '주력 전문 분야를 1개 이상 선택해주세요.';
    if (certifications.length === 0) return '보유 자격을 1개 이상 선택해주세요.';
    if (!awardRecords.trim()) return '수상 내역을 입력해주세요. (없으면 "해당없음" 입력)';
    return null;
  };

  const handleNextStep = () => {
    if (step === 3) {
      const err = validateStep3();
      if (err) {
        toast({ title: '입력 오류', description: err, variant: 'destructive' });
        return;
      }
    }
    if (step === 4) {
      const err = validateStep4();
      if (err) {
        toast({ title: '입력 오류', description: err, variant: 'destructive' });
        return;
      }
    }
    if (step === 5) {
      const err = validateStep5();
      if (err) {
        toast({ title: '입력 오류', description: err, variant: 'destructive' });
        return;
      }
    }
    setStep((s) => s + 1);
  };

  // ── 최종 가입 ─────────────────────────────────────────────────
  const handleRegister = async () => {
    try {
      // API 서버는 확장된 필드를 지원하지만, orval이 생성한 타입은 기본 RegisterRequest만 포함
      // 소셜 로그인 시나리오를 위해 타입 단언 사용
      const registerData = {
        email: email || undefined,
        password: password || undefined,
        name,
        phone: phone || undefined,
        phoneVerificationToken: verificationToken || undefined,
        role: 'barista' as const,
        userId,
        provider: provider || undefined,
        providerId: providerId || undefined,
        snsUrl1: snsUrl1 || undefined,
        snsUrl2: snsUrl2 || undefined,
        snsUrl3: snsUrl3 || undefined,
        storeName,
        storeAddress,
        workType: workType || undefined,
        careerYears: careerYears || undefined,
        mainSkill,
        certifications,
        awardRecords,
        eqMachine: eqMachine || undefined,
        eqGrinder: eqGrinder || undefined,
        eqRoasting: eqRoasting || undefined,
        bean: bean || undefined,
        beanTaste,
      } as unknown as Parameters<typeof registerMutation.mutateAsync>[0]['data'];

      const res = await registerMutation.mutateAsync({ data: registerData });
      setAuth(res.token, res.user);
      toast({ title: '가입 완료!', description: '블렌딩에 오신 것을 환영합니다. ☕' });
      setLocation('/home');
    } catch (e: unknown) {
      const err = e as { message?: string };
      toast({ title: '가입 실패', description: err?.message || '잠시 후 다시 시도해주세요.', variant: 'destructive' });
    }
  };

  // ── 스텝 레이블 ──────────────────────────────────────────────
  const STEP_LABELS = ['전화번호', '인증', '기본정보', '소속정보', '전문정보', '상세정보'];

  // 소셜 로그인 시 UI 처리를 위한 계산
  const isSocial = !!providerId;
  const displayTotalSteps = isSocial ? 4 : TOTAL_STEPS;
  const displayStep = isSocial ? step - 2 : step;

  return (
    <MobileLayout hideHeader hideNav>
      <div className="flex flex-col h-full bg-[#f7f7f7]">
        {/* ── 상단 헤더 ── */}
        <div className="bg-white border-b border-[#e8e8e8] h-14 flex items-center justify-between px-4 shrink-0">
          <button
            onClick={handleBack}
            className="p-1 -ml-1 text-foreground hover:opacity-60 transition-opacity"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <span
            className="font-brand text-base tracking-tight text-foreground absolute left-1/2 -translate-x-1/2"
          >
            회원가입
          </span>
          <div className="w-7" />
        </div>

        {/* ── 진행 바 ── */}
        <div className="bg-white px-6 pt-3 pb-4 shrink-0 border-b border-[#f0f0f0]">
          <div className="flex gap-1 mb-2">
            {Array.from({ length: displayTotalSteps }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-1 flex-1 transition-all duration-300',
                  displayStep > i ? 'bg-black' : 'bg-[#e8e8e8]',
                )}
              />
            ))}
          </div>
          <p className="text-xs text-[#b0b0b0] font-bold tracking-wider uppercase">
            {STEP_LABELS[step - 1]} · {displayStep} / {displayTotalSteps}
          </p>
        </div>

        {/* ── 스텝 콘텐츠 ── */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="px-6 py-8 flex flex-col gap-6"
            >
              {/* ──────── STEP 1: 전화번호 입력 ──────── */}
              {step === 1 && (
                <>
                  <div>
                    <h2 className="text-2xl font-black text-foreground mb-1">전화번호 인증</h2>
                    <p className="text-sm text-[#9a9a9a] font-medium leading-relaxed">
                      안전한 서비스 이용을 위해
                      <br />
                      본인 인증을 진행합니다.
                    </p>
                  </div>
                  <FieldInput label="휴대폰 번호" required>
                    <div className="bg-white border border-[#e8e8e8] flex items-center gap-3 px-4 focus-within:border-black transition-colors">
                      <Phone className="w-4 h-4 text-[#b0b0b0] shrink-0" strokeWidth={1.5} />
                      <input
                        type="tel"
                        placeholder="010-0000-0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="flex-1 py-4 bg-transparent text-sm font-medium outline-none placeholder:text-[#c0c0c0]"
                      />
                    </div>
                  </FieldInput>
                  <PrimaryButton
                    onClick={handleSendCode}
                    loading={sendCodeMutation.isPending}
                    disabled={phone.replace(/-/g, '').length < 10}
                  >
                    인증번호 받기
                  </PrimaryButton>
                  <p className="text-center text-xs text-[#b0b0b0] font-medium leading-relaxed">
                    솔라피 SMS 서비스를 통해 인증번호가 발송됩니다.
                  </p>
                  {/* 개발용 힌트 */}
                  <div className="border border-dashed border-[#e0e0e0] p-3 text-center">
                    <p className="text-xs text-[#c0c0c0] font-bold tracking-widest uppercase mb-1">
                      개발용 테스트
                    </p>
                    <p className="text-xs text-[#9a9a9a] font-medium">
                      번호{' '}
                      <span className="font-black text-foreground">000-0000-0000</span>
                      {' '}입력 시 API 없이 즉시 인증
                      <br />
                      인증코드:{' '}
                      <span className="font-black text-foreground">000000</span>
                    </p>
                  </div>
                </>
              )}

              {/* ──────── STEP 2: 인증번호 확인 ──────── */}
              {step === 2 && (
                <>
                  <div>
                    <h2 className="text-2xl font-black text-foreground mb-1">인증번호 입력</h2>
                    <p className="text-sm text-[#9a9a9a] font-medium leading-relaxed">
                      <span className="font-black text-foreground">{phone}</span>으로 발송된
                      <br />
                      6자리 인증번호를 입력해주세요.
                    </p>
                  </div>
                  <FieldInput label="인증번호" required>
                    <input
                      type="text"
                      placeholder="6자리 입력"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                      className="w-full px-4 py-4 bg-white border border-[#e8e8e8] text-lg font-black text-center tracking-[0.5em] outline-none focus:border-black transition-colors placeholder:text-[#e0e0e0] placeholder:tracking-normal"
                    />
                    {devCode && (
                      <p className="text-xs text-[#b0b0b0] text-center font-medium">
                        개발 모드 코드:{' '}
                        <span className="font-black text-[#D81919]">{devCode}</span>
                      </p>
                    )}
                  </FieldInput>
                  <PrimaryButton
                    onClick={handleConfirmCode}
                    loading={confirmCodeMutation.isPending}
                    disabled={verificationCode.length !== 6}
                  >
                    인증 확인
                  </PrimaryButton>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-center text-xs font-bold text-[#9a9a9a] hover:text-[#D81919] transition-colors"
                  >
                    번호 재입력 / 재발송
                  </button>
                </>
              )}

              {/* ──────── STEP 3: 기본 정보 ──────── */}
              {step === 3 && (
                <>
                  <div>
                    <h2 className="text-2xl font-black text-foreground mb-1">기본 정보</h2>
                    <p className="text-sm text-[#9a9a9a] font-medium">
                      프로필에 사용될 기본 정보를 입력해주세요.
                    </p>
                  </div>
                  <FieldInput label="성명" required>
                    <TextInput placeholder="실명을 입력해주세요" value={name} onChange={setName} />
                  </FieldInput>
                  <FieldInput label="닉네임" required hint="다른 회원에게 보여지는 이름입니다.">
                    <TextInput placeholder="닉네임 (영문, 한글, 숫자)" value={userId} onChange={setUserId} />
                  </FieldInput>
                  <FieldInput label="이메일" required={!providerId}>
                    <TextInput type="email" placeholder="example@email.com" value={email} onChange={setEmail} />
                  </FieldInput>
                  {!providerId && (
                    <FieldInput label="비밀번호" required hint="8자 이상, 영문 + 숫자 조합 권장">
                      <div className="bg-white border border-[#e8e8e8] flex items-center px-4 focus-within:border-black transition-colors">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="8자 이상 입력"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="flex-1 py-4 bg-transparent text-sm font-medium outline-none placeholder:text-[#c0c0c0]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="text-[#b0b0b0] hover:text-foreground transition-colors p-1"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" strokeWidth={1.5} />
                          ) : (
                            <Eye className="w-4 h-4" strokeWidth={1.5} />
                          )}
                        </button>
                      </div>
                    </FieldInput>
                  )}
                </>
              )}

              {/* ──────── STEP 4: 소속 정보 ──────── */}
              {step === 4 && (
                <>
                  <div>
                    <h2 className="text-2xl font-black text-foreground mb-1">소속 정보</h2>
                    <p className="text-sm text-[#9a9a9a] font-medium">
                      현재 근무하시는 매장 정보를 입력해주세요.
                    </p>
                  </div>
                  <FieldInput label="현재 소속 매장명" required>
                    <TextInput placeholder="예: 블렌딩 카페 홍대점" value={storeName} onChange={setStoreName} />
                  </FieldInput>
                  <FieldInput label="매장 상세 주소" required>
                    <TextInput
                      placeholder="예: 서울 마포구 홍익로 12, 2층"
                      value={storeAddress}
                      onChange={setStoreAddress}
                    />
                  </FieldInput>
                  <FieldInput label="근무 형태" hint="선택 항목입니다.">
                    <NativeSelect
                      value={workType}
                      onChange={setWorkType}
                      options={[{ value: '', label: '선택 안함' }, ...WORK_TYPE_OPTIONS]}
                    />
                  </FieldInput>
                  <FieldInput label="총 경력 기간" hint="선택 항목입니다.">
                    <NativeSelect
                      value={careerYears}
                      onChange={setCareerYears}
                      options={[{ value: '', label: '선택 안함' }, ...CAREER_YEARS_OPTIONS]}
                    />
                  </FieldInput>
                </>
              )}

              {/* ──────── STEP 5: 전문 정보 ──────── */}
              {step === 5 && (
                <>
                  <div>
                    <h2 className="text-2xl font-black text-foreground mb-1">전문 정보</h2>
                    <p className="text-sm text-[#9a9a9a] font-medium">
                      바리스타로서의 전문성을 알려주세요.
                    </p>
                  </div>
                  <FieldInput label="주력 전문 분야" required hint="1개 이상 선택해주세요.">
                    <ChipSelect
                      options={MAIN_SKILL_OPTIONS}
                      selected={mainSkill}
                      onToggle={(v) => toggleChip(v, mainSkill, setMainSkill)}
                    />
                  </FieldInput>
                  <FieldInput label="보유 자격" required hint="해당하는 자격을 모두 선택해주세요.">
                    <ChipSelect
                      options={CERTIFICATION_OPTIONS}
                      selected={certifications}
                      onToggle={(v) => toggleChip(v, certifications, setCertifications)}
                    />
                  </FieldInput>
                  <FieldInput
                    label="수상 내역"
                    required
                    hint="수상 내역이 없으면 '해당없음'을 입력해주세요."
                  >
                    <textarea
                      placeholder="예: 2023 코리아 바리스타 챔피언십 1위&#10;수상 내역이 없으면 '해당없음' 입력"
                      value={awardRecords}
                      onChange={(e) => setAwardRecords(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-4 bg-white border border-[#e8e8e8] text-sm font-medium text-foreground outline-none placeholder:text-[#c0c0c0] resize-none focus:border-black transition-colors"
                    />
                  </FieldInput>
                </>
              )}

              {/* ──────── STEP 6: 선택 정보 (장비, 원두, SNS) ──────── */}
              {step === 6 && (
                <>
                  <div>
                    <h2 className="text-2xl font-black text-foreground mb-1">상세 정보</h2>
                    <p className="text-sm text-[#9a9a9a] font-medium">
                      모두 선택 항목입니다. 건너뛰어도 됩니다.
                    </p>
                  </div>

                  {/* 장비 섹션 */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-[#e8e8e8]" />
                      <span className="text-xs font-black tracking-widest uppercase text-[#b0b0b0]">
                        사용 장비
                      </span>
                      <div className="h-px flex-1 bg-[#e8e8e8]" />
                    </div>
                    <FieldInput label="에스프레소 머신">
                      <NativeSelect value={eqMachine} onChange={setEqMachine} options={MACHINE_OPTIONS} />
                    </FieldInput>
                    <FieldInput label="그라인더">
                      <NativeSelect value={eqGrinder} onChange={setEqGrinder} options={GRINDER_OPTIONS} />
                    </FieldInput>
                    <FieldInput label="로스팅 장비">
                      <NativeSelect value={eqRoasting} onChange={setEqRoasting} options={ROASTING_OPTIONS} />
                    </FieldInput>
                  </div>

                  {/* 원두 섹션 */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-[#e8e8e8]" />
                      <span className="text-xs font-black tracking-widest uppercase text-[#b0b0b0]">
                        선호 원두
                      </span>
                      <div className="h-px flex-1 bg-[#e8e8e8]" />
                    </div>
                    <FieldInput label="선호하는 원두" hint="브랜드, 원산지 등 자유롭게 입력">
                      <TextInput
                        placeholder="예: 에티오피아 예가체프, 콜롬비아 수프리모"
                        value={bean}
                        onChange={setBean}
                      />
                    </FieldInput>
                    <FieldInput label="선호하는 원두 뉘앙스">
                      <ChipSelect
                        options={BEAN_TASTE_OPTIONS}
                        selected={beanTaste}
                        onToggle={(v) => toggleChip(v, beanTaste, setBeanTaste)}
                      />
                    </FieldInput>
                  </div>

                  {/* SNS 섹션 */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-[#e8e8e8]" />
                      <span className="text-xs font-black tracking-widest uppercase text-[#b0b0b0]">
                        SNS
                      </span>
                      <div className="h-px flex-1 bg-[#e8e8e8]" />
                    </div>
                    <FieldInput label="인스타그램">
                      <TextInput
                        placeholder="https://instagram.com/username"
                        value={snsUrl1}
                        onChange={setSnsUrl1}
                      />
                    </FieldInput>
                    <FieldInput label="스레드 (Threads)">
                      <TextInput
                        placeholder="https://threads.net/@username"
                        value={snsUrl2}
                        onChange={setSnsUrl2}
                      />
                    </FieldInput>
                    <FieldInput label="유튜브">
                      <TextInput
                        placeholder="https://youtube.com/@channel"
                        value={snsUrl3}
                        onChange={setSnsUrl3}
                      />
                    </FieldInput>
                  </div>

                  {/* 가입 완료 */}
                  <PrimaryButton
                    onClick={handleRegister}
                    loading={registerMutation.isPending}
                    className="mt-2"
                  >
                    가입 완료하기&nbsp;&nbsp;
                    <CheckCircle2 className="w-5 h-5" />
                  </PrimaryButton>

                  <p className="text-center text-xs text-[#b0b0b0] font-medium -mt-2">
                    가입 후 마이페이지에서 언제든 수정할 수 있습니다.
                  </p>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── 하단 다음 버튼 (step 1, 2는 자체 버튼 사용 / step 6은 내부에 버튼) ── */}
        {step >= 3 && step < 6 && (
          <div className="px-6 py-4 bg-white border-t border-[#e8e8e8] shrink-0">
            <PrimaryButton onClick={handleNextStep}>다음</PrimaryButton>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
