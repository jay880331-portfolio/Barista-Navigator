# 바리스타 커뮤니티 앱

## 개요

바리스타들과 커피 애호가들을 위한 모바일 웹뷰 커뮤니티 앱.
지도 기반 바리스타 탐색 서비스를 참고한 클론 앱.

## 기술 스택

- **프론트엔드**: React + Vite + Tailwind CSS + Zustand
- **백엔드**: Express 5 (Node.js)
- **데이터베이스**: MongoDB Atlas Cloud (Mongoose)
- **인증**: JWT (이메일/카카오/네이버)
- **지도**: @vis.gl/react-google-maps (Google Maps API)
- **아키텍처**: 헥사고날 아키텍처 (모델/미들웨어/라우트 분리)
- **패키지 관리**: pnpm workspace 모노레포

## 구조

```text
artifacts/
├── api-server/           # Express API 서버
│   └── src/
│       ├── models/       # MongoDB 모델 (User, Post, Recipe, MarketItem, Sponsor, PhoneVerification)
│       ├── routes/       # API 라우트 핸들러
│       ├── middleware/   # JWT 인증 미들웨어
│       └── lib/          # MongoDB 연결, 시드, 로거
└── barista-app/          # React 프론트엔드
    └── src/
        ├── pages/        # 페이지 컴포넌트 (로그인/회원가입/지도/커뮤니티/마켓/프로필)
        ├── components/   # 공통 컴포넌트 (레이아웃, 하단탭바, 헤더)
        ├── store/        # Zustand 상태 관리 (useAuthStore)
        └── lib/          # 유틸리티

lib/
├── api-spec/             # OpenAPI 3.1 스펙
├── api-client-react/     # 생성된 React Query 훅 (Orval)
└── api-zod/              # 생성된 Zod 스키마 (Orval)
```

## 주요 기능

- **지도 화면**: Google Maps + 주변 바리스타 마커 표시, 반경 필터 (500m~5km)
- **커뮤니티**: 바리스타 일상/소통/인스타/레시피 게시글 피드
- **마켓**: 커피 관련 중고 물품 판매
- **뉴스**: 매거진, 스폰서 배너
- **마이페이지**: 프로필 수정, 스크랩 레시피

## 인증 플로우

- **이메일 회원가입**: 전화번호 인증 → 코드 확인 → 회원가입 (3단계)
- **이메일 로그인**: 이메일 + 비밀번호
- **카카오/네이버 소셜 로그인**: 버튼만 구현 (API 키 없이 mock 처리)

## 환경변수

| 변수명 | 용도 |
|--------|------|
| MONGODB_URI | MongoDB Atlas 연결 문자열 |
| JWT_SECRET | JWT 토큰 서명 키 |
| NEXTAUTH_SECRET | NextAuth 세션 암호화 키 |
| GOOGLE_MAPS_API_KEY | Google Maps API 키 |

## API 엔드포인트

- `POST /api/auth/verify-phone` - 전화번호 인증 코드 발송
- `POST /api/auth/verify-phone/confirm` - 인증 코드 확인
- `POST /api/auth/register` - 이메일 회원가입
- `POST /api/auth/login` - 이메일 로그인
- `POST /api/auth/social` - 소셜 로그인
- `GET /api/baristas` - 바리스타 목록 (위치 기반 필터링)
- `GET /api/posts` - 커뮤니티 게시글
- `POST /api/posts/:id/like` - 게시글 좋아요
- `GET /api/recipes` - 레시피 목록
- `POST /api/recipes/:id/scrap` - 레시피 스크랩
- `GET /api/market/items` - 마켓 아이템
- `GET /api/sponsors` - 스폰서 목록
- `PUT /api/users/profile` - 프로필 수정
- `GET /api/users/scraps` - 스크랩한 레시피

## 개발 명령어

```bash
# 프론트엔드
pnpm --filter @workspace/barista-app run dev

# API 서버
pnpm --filter @workspace/api-server run dev

# OpenAPI 코드젠
pnpm --filter @workspace/api-spec run codegen
```
