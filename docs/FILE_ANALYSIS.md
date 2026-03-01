# 📁 냥세 — 파일 별 용도 및 목적 분석

> 작성: Copilot  
> 프로젝트: 냥세(猫世) — MBTI × 사주 고양이 운세 서비스

---

## 목차

1. [루트 설정 파일](#1-루트-설정-파일)
2. [app/ — Next.js 앱 라우터](#2-app--nextjs-앱-라우터)
   - [레이아웃 및 홈](#21-레이아웃-및-홈)
   - [페이지 라우트](#22-페이지-라우트)
   - [API 라우트](#23-api-라우트)
   - [법적 페이지](#24-법적-페이지)
3. [components/ — UI 컴포넌트](#3-components--ui-컴포넌트)
4. [lib/ — 비즈니스 로직](#4-lib--비즈니스-로직)
5. [types/ — TypeScript 타입 정의](#5-types--typescript-타입-정의)
6. [data/ — 캐릭터 콘텐츠 데이터](#6-data--캐릭터-콘텐츠-데이터)
7. [scripts/ — 일회성 유틸리티 스크립트](#7-scripts--일회성-유틸리티-스크립트)
8. [docs/ — 프로젝트 문서](#8-docs--프로젝트-문서)
9. [전체 파일 요약 테이블](#9-전체-파일-요약-테이블)

---

## 1. 루트 설정 파일

| 파일 | 용도 |
|------|------|
| `package.json` | 프로젝트 메타데이터, npm 의존성(Next.js, Toss Payments SDK, lunisolar, OpenAI, html-to-image 등), 실행 스크립트(dev/build/start/lint) 정의 |
| `next.config.ts` | Next.js 빌드/런타임 설정. 현재는 기본값만 유지하며 향후 이미지 도메인, 리다이렉트 등 추가 가능 |
| `tsconfig.json` | TypeScript 컴파일러 옵션 및 경로 별칭(`@/`) 설정 |
| `jest.config.ts` | Jest 테스트 러너 설정. `ts-jest` 프리셋 사용, `@/` 경로 별칭 매핑, Node 테스트 환경 지정 |
| `eslint.config.mjs` | ESLint 코드 스타일·품질 규칙 설정 (Next.js ESLint 플러그인 포함) |
| `postcss.config.mjs` | PostCSS 설정. Tailwind CSS v4 플러그인을 활성화 |
| `.gitignore` | Git 버전 관리에서 제외할 파일/디렉터리 목록 (node_modules, .next, .env.local 등) |

---

## 2. app/ — Next.js 앱 라우터

### 2.1 레이아웃 및 홈

#### `app/layout.tsx` — 루트 레이아웃
- **역할**: 전체 앱에 공통으로 적용되는 HTML 셸 제공
- **주요 기능**:
  - `<html lang="ko">` 및 전역 CSS(`globals.css`) 적용
  - Open Graph 메타데이터 및 Google Adsense 계정 정보 설정
  - 환경 변수(`NEXT_PUBLIC_ENABLE_ADS`, `NEXT_PUBLIC_ADSENSE_CLIENT`)에 따라 Google Adsense 스크립트를 조건부 로드
  - 푸터(저작권, 개인정보처리방침/이용약관 링크, 문의 이메일) 렌더링

#### `app/globals.css` — 전역 스타일
- **역할**: Tailwind CSS 지시어 임포트 및 전역 기본 스타일 정의

#### `app/page.tsx` — 랜딩 페이지(홈)
- **역할**: 서비스 소개 및 시작 진입점 제공
- **주요 기능**:
  - 서비스 특징(오행 분석, MBTI 매핑, 20종 캐릭터) 요약 표시
  - "내 고양이 찾기" 버튼으로 `/test` 라우트로 이동

---

### 2.2 페이지 라우트

모든 페이지는 `app/(pages)/` 경로 그룹 아래에 위치하며, URL에는 `(pages)` 세그먼트가 노출되지 않는다.

#### `app/(pages)/test/page.tsx` — MBTI 입력/테스트 페이지
- **역할**: 사용자로부터 MBTI 유형을 수집하는 첫 번째 입력 단계
- **주요 기능**:
  - **직접 입력 모드**: 이미 MBTI를 아는 사용자가 4자 코드를 직접 입력
  - **테스트 모드**: `MbtiTest` 컴포넌트를 통해 12문항 간략 테스트 진행
  - 결과를 `sessionStorage('mbti')`에 저장 후 `/saju` 페이지로 이동

#### `app/(pages)/saju/page.tsx` — 생년월일 입력 페이지
- **역할**: 사주 계산에 필요한 출생 정보를 수집하는 두 번째 입력 단계
- **주요 기능**:
  - 연/월/일 텍스트 입력 필드(숫자만 허용)
  - 커스텀 시간 선택 드롭다운(0–23시 또는 "모름" 선택)
  - 입력값을 `sessionStorage('birthInfo')`에 JSON으로 저장 후 `/result` 페이지로 이동

#### `app/(pages)/result/page.tsx` — 무료 결과 페이지
- **역할**: 사주 계산 결과 및 무료 캐릭터 정보를 표시하는 핵심 결과 화면
- **주요 기능**:
  - `sessionStorage`에서 MBTI와 생년월일 정보를 읽어 `calculateSaju()` + `createCharacterId()`로 캐릭터 ID 도출
  - `/api/character-content` API로 캐릭터 콘텐츠 비동기 로드
  - 오행 에너지 바(`OhaengBar`) 및 5개 무료 섹션(진단, 오행 지도, 사주×MBTI, 패턴, 과부하 신호) 표시
  - 5개 유료 섹션을 `LockedSection`으로 잠금 처리
  - Google Adsense 광고 슬롯(`AdSlot`) 삽입
  - 공유 카드(`ShareCard`) 및 "풀리포트 보기" 결제 유도 버튼 표시
  - 결과를 `sessionStorage`에 캐시(`characterId`, `sajuData` 등)

#### `app/(pages)/report/page.tsx` — 유료 풀리포트 페이지
- **역할**: 결제 완료 후 AI가 생성한 5개 유료 운세 섹션을 포함한 전체 리포트 표시
- **주요 기능**:
  - URL 쿼리 파라미터(`?payment=success&paymentKey=...&orderId=...&amount=...`)로 결제 결과 수신
  - `/api/confirm-payment`를 통해 Toss Payments 결제 서버 측 검증
  - 검증 후 `/api/generate-fortune`으로 OpenAI GPT-4o-mini 기반 맞춤형 2026년 운세 5종(연애/재물/커리어/건강/인간관계) 생성
  - AI 생성 실패 시 캐릭터 콘텐츠의 기본값으로 폴백
  - `?debug=true` 쿼리 또는 환경 변수(`NEXT_PUBLIC_REPORT_DEBUG`)로 결제 없이 디버그 접근 가능
  - `Suspense`로 감싸 서버 컴포넌트 스트리밍 지원

#### `app/(pages)/payment/page.tsx` — 결제 페이지
- **역할**: Toss Payments 결제 위젯을 표시하고 결제를 처리하는 페이지
- **주요 기능**:
  - 상품 정보(냥세 풀리포트, 1,900원) 및 포함 콘텐츠 목록 표시
  - `TossPayment` 컴포넌트를 동적 임포트(`ssr: false`)로 로드하여 결제 위젯 렌더링

---

### 2.3 API 라우트

#### `app/api/character-content/route.ts` — 캐릭터 콘텐츠 API
- **메서드**: `GET /api/character-content?id={characterId}`
- **역할**: 주어진 캐릭터 ID에 해당하는 마크다운 파일을 읽어 `Character` 객체로 응답
- **주요 기능**:
  - `id` 쿼리 파라미터 유효성 검사 및 정규화(`normalizeCharacterId`)
  - `getCharacterContentById()`를 통해 `data/characters/` 폴더의 마크다운 파싱 후 반환
  - 잘못된 ID(400) 또는 파일 없음(404) 오류 처리

#### `app/api/confirm-payment/route.ts` — 결제 검증 API
- **메서드**: `POST /api/confirm-payment`
- **역할**: Toss Payments 서버 측 결제 승인 요청을 중계하는 보안 엔드포인트
- **주요 기능**:
  - 요청 본문(`paymentKey`, `orderId`, `amount`) 유효성 검사
  - `TOSS_SECRET_KEY` 환경 변수로 Basic Auth 헤더 생성
  - Toss Payments `/v1/payments/confirm` API에 POST 요청 전달
  - 성공/실패 여부를 `{ success: boolean }` 형태로 응답

#### `app/api/generate-fortune/route.ts` — AI 운세 생성 API
- **메서드**: `POST /api/generate-fortune`
- **역할**: 사주 데이터와 MBTI를 기반으로 OpenAI GPT-4o-mini 모델을 사용하여 개인화된 2026년 운세 5종을 생성
- **주요 기능**:
  - 요청 본문(`saju`, `payload`, `mbti`, `ohaeng`, `catName`, `catTagline`) 수신
  - `buildFortunePrompt()` 함수로 사주 팔자, 일간, 오행 균형, 2026년 병오년 맥락을 포함한 상세 프롬프트 구성
  - `getAnnualInteraction()` 함수로 주요 오행과 2026년 火기운 간의 상호작용 분석 텍스트 생성
  - JSON 응답 형식(`love`, `money`, `career`, `health`, `relationship`) 강제 및 검증
  - `OPENAI_API_KEY` 환경 변수 사용

---

### 2.4 법적 페이지

#### `app/legal/privacy/page.tsx` — 개인정보처리방침
- **역할**: 서비스의 개인정보 수집·이용·보관·파기 방침을 법적 요구사항에 맞게 안내

#### `app/legal/terms/page.tsx` — 이용약관
- **역할**: 서비스 이용에 관한 약관 및 사용자 권리·의무를 안내

---

## 3. components/ — UI 컴포넌트

#### `components/MbtiTest.tsx` — MBTI 간략 테스트 컴포넌트
- **역할**: E/I, S/N, T/F, J/P 각 차원별 3문항(총 12문항)으로 구성된 간략 MBTI 테스트 UI
- **주요 기능**:
  - 프로그레스 바로 진행 상황 표시
  - 각 문항에 대해 두 선택지 버튼 렌더링
  - 12문항 완료 시 `getMbtiFromAnswers()`로 MBTI 도출 후 `onComplete` 콜백 호출

#### `components/OhaengBar.tsx` — 오행 에너지 시각화 바
- **역할**: 사주 계산 결과로 도출된 오행(木火土金水)별 비율을 가로 막대 그래프로 시각화
- **주요 기능**:
  - 각 오행에 고유 색상 적용(木=녹색, 火=빨강, 土=노랑, 金=회색, 水=파랑)
  - 지배 오행(`dominant`)을 주황색으로 강조 표시
  - 퍼센트 값 텍스트 표시

#### `components/ShareCard.tsx` — 공유 카드 컴포넌트
- **역할**: 결과 페이지에서 캐릭터 정보를 담은 공유용 카드를 생성하고 공유/이미지 저장 기능 제공
- **주요 기능**:
  - 캐릭터 이모지, 이름, MBTI, 오행, 태그라인을 포함한 카드 UI 렌더링
  - `html-to-image` 라이브러리로 카드를 PNG 이미지로 변환(2배 해상도)
  - Web Share API 또는 클립보드 복사 폴백으로 공유
  - 생성된 이미지 URL의 메모리 누수 방지(`URL.revokeObjectURL`)

#### `components/TossPayment.tsx` — Toss Payments 결제 위젯
- **역할**: Toss Payments SDK를 로드하고 결제 수단 선택 및 약관 동의 위젯을 렌더링
- **주요 기능**:
  - `NEXT_PUBLIC_TOSS_CLIENT_KEY` 환경 변수로 SDK 초기화
  - `renderPaymentMethods()` 및 `renderAgreement()`로 위젯 마운트
  - 고유 `orderId` 생성(`nyangsae-{timestamp}-{random}`) 후 `requestPayment()` 호출
  - 성공/실패 URL을 각각 `/report?payment=success`, `/payment?payment=fail`로 설정

#### `components/AdSlot.tsx` — Google Adsense 광고 슬롯
- **역할**: 페이지 내 특정 위치에 Google Adsense 광고를 표시하거나, 광고 비활성화 시 플레이스홀더를 표시
- **주요 기능**:
  - `NEXT_PUBLIC_ENABLE_ADS` 환경 변수로 광고 활성화 여부 제어
  - `IntersectionObserver`를 활용한 지연 로딩(뷰포트 200px 전에 미리 로드)
  - 광고 비활성화/미설정 시 "광고 준비 중" 플레이스홀더 표시
  - 중복 푸시 방지(`isPushed` 상태)

#### `components/LockedSection.tsx` — 잠긴 유료 섹션 컴포넌트
- **역할**: 유료 콘텐츠 섹션을 블러 처리하여 미리보기 형태로 표시하고 잠금 해제 버튼 제공
- **주요 기능**:
  - 블러+반투명 오버레이로 콘텐츠 숨김 처리
  - 이모지, 티저 텍스트, "잠금 해제" 버튼 표시
  - `onUnlock` 콜백으로 결제 페이지 이동 트리거

---

## 4. lib/ — 비즈니스 로직

#### `lib/saju.ts` — 사주 계산 모듈
- **역할**: 생년월일시를 입력받아 사주팔자와 오행 분석 결과를 계산하는 핵심 로직
- **주요 기능**:
  - `lunisolar` 라이브러리로 음력 변환 및 사주팔자(연주·월주·일주·시주) 도출
  - 천간(甲乙丙丁戊己庚辛壬癸)과 지지(子丑寅卯辰巳午未申酉戌亥)의 오행 매핑
  - 오행별 개수 집계 후 퍼센트 비율 계산 및 합산 보정(100% 유지)
  - 지배 오행(`dominantOhaeng`) 결정
  - AI 운세 생성에 사용할 상세 `SajuPayload` 구성(사주팔자, 일간, 오행 개수, 계절 요소, 균형 분석, 2026년 병오년 맥락)

#### `lib/saju.test.ts` — saju.ts 단위 테스트
- **역할**: `calculateSaju()` 함수의 정확성 검증
- **테스트 범위**: 오행 퍼센트 합산 100% 여부, 반환 타입 구조, 경계값 처리 등

#### `lib/mbti.ts` — MBTI 유틸리티 모듈
- **역할**: MBTI 관련 타입, 상수, 유틸리티 함수 모음
- **주요 기능**:
  - 16개 MBTI 유형 상수 및 동물 이름/이모지/설명 매핑(`MBTI_TRAITS`)
  - `isValidMbti()`: MBTI 문자열 유효성 검사
  - `getMbtiFromAnswers()`: 12문항 응답 배열을 MBTI 유형으로 변환 (각 차원별 다수결)
  - `getMbtiGroup()`: MBTI 유형에서 4그룹(NT/NF/ST/SF) 추출

#### `lib/mbti.test.ts` — mbti.ts 단위 테스트
- **역할**: MBTI 유틸리티 함수들의 정확성 검증
- **테스트 범위**: `getMbtiFromAnswers()` 경계값, `isValidMbti()` 유효/무효 입력 처리

#### `lib/catMapper.ts` — 캐릭터 ID 매핑 모듈
- **역할**: MBTI 유형과 오행을 조합하여 캐릭터 ID를 생성·파싱·정규화하는 유틸리티
- **주요 기능**:
  - `createCharacterId(mbti, ohaeng)`: `"INFP_水"` 형태의 캐릭터 ID 생성
  - `parseCharacterId(value)`: 캐릭터 ID 문자열을 파싱하여 MBTI와 오행 추출
  - `normalizeCharacterId(value)`: 캐릭터 ID 정규화(유효성 검사 + 재구성)
  - `normalizeOhaeng(value)`: 오행 문자열 정규화
  - `getCharacterMarkdownCandidates()`: 캐릭터 마크다운 파일 후보 경로 목록 반환 (金 호환 경로 처리 포함)

#### `lib/catMapper.test.ts` — catMapper.ts 단위 테스트
- **역할**: 캐릭터 ID 생성·파싱·정규화 함수의 정확성 검증
- **테스트 범위**: 유효/무효 ID, 오행 정규화, 경계값 처리

#### `lib/characterContent.server.ts` — 서버 전용 캐릭터 콘텐츠 로더
- **역할**: `data/characters/` 디렉터리의 마크다운 파일을 읽어 `Character` 객체로 변환하는 서버 전용 모듈
- **주요 기능**:
  - `parseFrontmatter()`: YAML 프론트매터(`---`)에서 `name`, `emoji` 등 메타데이터 추출
  - `parseSectionBlocks()`: `##` 헤더로 구분된 섹션 블록 파싱
  - `normalizeSectionContent()`: 마크다운 인라인 문법(볼드, 코드, 링크) 제거 및 목록 기호 정규화
  - `buildTaglineFromDiagnosis()`: 진단 섹션 첫 문장에서 태그라인 자동 생성 (56자 초과 시 말줄임)
  - `getCharacterContentById()`: 캐릭터 ID로 마크다운 파일을 로드하여 `Character` 객체 반환 (메모리 캐시 적용)
  - `clearCharacterContentCache()`: 테스트 격리를 위한 캐시 초기화

#### `lib/characterContent.server.test.ts` — characterContent.server.ts 단위 테스트
- **역할**: 마크다운 파싱·캐릭터 콘텐츠 로딩 함수의 정확성 검증

---

## 5. types/ — TypeScript 타입 정의

#### `types/index.ts` — 전역 타입 정의
- **역할**: 프로젝트 전반에서 사용되는 TypeScript 타입 및 인터페이스를 한 곳에 정의

| 타입/인터페이스 | 설명 |
|----------------|------|
| `MbtiType` | 16개 MBTI 유형 리터럴 유니온 타입 |
| `Ohaeng` | 오행(木/火/土/金/水) 리터럴 유니온 타입 |
| `CharacterId` | `${MbtiType}_${Ohaeng}` 형태의 80개 캐릭터 ID 타입 |
| `Character` | 캐릭터 전체 정보(id, name, emoji, tagline, subtitles, sections 10개) |
| `SajuResult` | 사주 계산 결과(오행 비율, 지배 오행, 사주팔자 문자열, payload) |
| `SajuPayload` | AI 운세 생성용 상세 사주 데이터(사주팔자, 일간, 오행 개수, 계절, 균형, 연간 맥락) |
| `Pillar` | 사주 기둥(천간 + 지지) 구조체 |
| `UserInput` | 사용자 입력 데이터(MBTI + 생년월일시) |
| `ResultData` | 결과 페이지에서 사용하는 통합 데이터(캐릭터 + 사주 + MBTI + 유료 여부) |
| `MbtiGroup`, `CatId`, `CatCharacter`, `LegacyResultData` | 구(舊) 20개 그룹 시스템 하위 호환용 Deprecated 타입 |

---

## 6. data/ — 캐릭터 콘텐츠 데이터

#### `data/characters/{mbti}/` — MBTI별 캐릭터 마크다운 디렉터리
- **역할**: 16개 MBTI 유형 × 5개 오행 = 최대 80개의 캐릭터 콘텐츠를 개별 마크다운 파일로 저장
- **파일명 형식**: `{MBTI}_{오행}.md` (예: `INFP_水.md`)
- **디렉터리 구조**: `data/characters/infp/INFP_水.md`와 같이 MBTI 소문자 디렉터리 아래 위치
- **마크다운 구조**:
  ```markdown
  ---
  name: 캐릭터 이름
  emoji: 🐱
  ---

  ## 섹션 제목 1 (diagnosis)
  본문 내용...

  ## 섹션 제목 2 (ohaengMap)
  ...
  ```
- **파싱 규칙**: `##` 헤더 순서가 섹션 매핑 기준(1번째=diagnosis, 2번째=ohaengMap, 3번째=combination, 4번째=pattern, 5번째=timingSense)

#### `data/characters/engine/` — 캐릭터 콘텐츠 엔진 관련 파일
- **역할**: 캐릭터 콘텐츠 생성/관리에 사용되는 보조 데이터 파일

---

## 7. scripts/ — 일회성 유틸리티 스크립트

> ⚠️ 이 스크립트들은 초기 데이터 마이그레이션 목적으로 작성된 일회성 도구로, 현재는 사용되지 않습니다.

#### `scripts/parse-content.js` — 마크다운 파싱 스크립트
- **역할**: 특정 마크다운 파일을 읽어 캐릭터 콘텐츠를 파싱하여 TypeScript 파일로 출력
- **작성 배경**: 초기 20개 그룹 기반 캐릭터 시스템(`CAT_CONTENTS`)의 `data/catContents.ts` 생성용

#### `scripts/convert-content.js` — 콘텐츠 변환 스크립트
- **역할**: 구(舊) 형식의 마크다운 콘텐츠(diagnosis/ohaengMap/mbtiEngine/combination 섹션)를 파싱하여 서브타이틀, 패턴 분석, 개운법 미션 등을 포함한 `catContents.ts`로 변환
- **작성 배경**: 20개 그룹 시스템에서 80개 개별 캐릭터 시스템으로 마이그레이션 과정에서 사용

---

## 8. docs/ — 프로젝트 문서

| 파일 | 용도 |
|------|------|
| `docs/DESIGN_GUIDE.md` | 디자인 시스템 가이드. 색상 팔레트, 타이포그래피, 컴포넌트 스타일 규칙 정의 |
| `docs/DEV_GUIDE.md` | 개발자 가이드. 기술 스택, 프로젝트 구조, TDD 워크플로우, 환경 변수, 배포 체크리스트 |
| `docs/PLANNING.md` | 서비스 기획 문서. 핵심 가치 제안, 사용자 플로우, 기능 우선순위 등 |
| `docs/SAMPLE_REPORT.md` | 결과 리포트 샘플. UI 및 콘텐츠 작성 기준 참고용 |
| `docs/UX_WRITING.md` | UX 라이팅 가이드. 버튼 문구, 오류 메시지, 마이크로카피 등 텍스트 톤앤매너 정의 |
| `docs/todo-free-paid.md` | 무료/유료 기능 분리에 관한 TODO 목록 |
| `docs/plans/2025-02-25-free-paid-split.md` | 무료/유료 기능 분리 설계 계획 문서 |
| `docs/FILE_ANALYSIS.md` | 이 파일. 프로젝트 파일 별 용도 및 목적 분석 문서 |

---

## 9. 전체 파일 요약 테이블

| 파일 경로 | 분류 | 역할 요약 |
|-----------|------|-----------|
| `package.json` | 설정 | 의존성 및 스크립트 관리 |
| `next.config.ts` | 설정 | Next.js 빌드 설정 |
| `tsconfig.json` | 설정 | TypeScript 컴파일러 옵션 |
| `jest.config.ts` | 설정 | Jest 테스트 환경 설정 |
| `eslint.config.mjs` | 설정 | ESLint 코드 품질 규칙 |
| `postcss.config.mjs` | 설정 | Tailwind CSS 활성화 |
| `app/layout.tsx` | 앱 | 루트 레이아웃, Adsense, 푸터 |
| `app/globals.css` | 앱 | 전역 CSS 스타일 |
| `app/page.tsx` | 앱 | 랜딩 페이지(홈) |
| `app/(pages)/test/page.tsx` | 앱/페이지 | MBTI 입력 및 테스트 |
| `app/(pages)/saju/page.tsx` | 앱/페이지 | 생년월일 입력 |
| `app/(pages)/result/page.tsx` | 앱/페이지 | 무료 사주 결과 표시 |
| `app/(pages)/report/page.tsx` | 앱/페이지 | 유료 AI 풀리포트 |
| `app/(pages)/payment/page.tsx` | 앱/페이지 | Toss 결제 처리 |
| `app/legal/privacy/page.tsx` | 앱/법적 | 개인정보처리방침 |
| `app/legal/terms/page.tsx` | 앱/법적 | 이용약관 |
| `app/api/character-content/route.ts` | API | 캐릭터 콘텐츠 조회 |
| `app/api/confirm-payment/route.ts` | API | Toss 결제 검증 |
| `app/api/generate-fortune/route.ts` | API | OpenAI 운세 생성 |
| `components/MbtiTest.tsx` | 컴포넌트 | 12문항 MBTI 테스트 UI |
| `components/OhaengBar.tsx` | 컴포넌트 | 오행 비율 시각화 |
| `components/ShareCard.tsx` | 컴포넌트 | 결과 공유 카드 생성 |
| `components/TossPayment.tsx` | 컴포넌트 | Toss 결제 위젯 |
| `components/AdSlot.tsx` | 컴포넌트 | Google Adsense 슬롯 |
| `components/LockedSection.tsx` | 컴포넌트 | 유료 섹션 잠금 UI |
| `lib/saju.ts` | 라이브러리 | 사주/오행 계산 엔진 |
| `lib/saju.test.ts` | 테스트 | saju.ts 단위 테스트 |
| `lib/mbti.ts` | 라이브러리 | MBTI 유틸리티 및 테스트 로직 |
| `lib/mbti.test.ts` | 테스트 | mbti.ts 단위 테스트 |
| `lib/catMapper.ts` | 라이브러리 | 캐릭터 ID 생성/파싱 |
| `lib/catMapper.test.ts` | 테스트 | catMapper.ts 단위 테스트 |
| `lib/characterContent.server.ts` | 라이브러리 | 마크다운 캐릭터 콘텐츠 로더 |
| `lib/characterContent.server.test.ts` | 테스트 | characterContent.server.ts 테스트 |
| `types/index.ts` | 타입 | 전역 TypeScript 타입 정의 |
| `data/characters/{mbti}/*.md` | 데이터 | 80개 캐릭터 콘텐츠 마크다운 |
| `scripts/parse-content.js` | 스크립트 | 마크다운→TS 변환 (일회성) |
| `scripts/convert-content.js` | 스크립트 | 콘텐츠 마이그레이션 (일회성) |
| `docs/DESIGN_GUIDE.md` | 문서 | 디자인 시스템 가이드 |
| `docs/DEV_GUIDE.md` | 문서 | 개발자 가이드 |
| `docs/PLANNING.md` | 문서 | 서비스 기획 문서 |
| `docs/SAMPLE_REPORT.md` | 문서 | 리포트 샘플 |
| `docs/UX_WRITING.md` | 문서 | UX 라이팅 가이드 |
| `docs/todo-free-paid.md` | 문서 | 무료/유료 기능 TODO |
| `docs/plans/2025-02-25-free-paid-split.md` | 문서 | 무료/유료 분리 계획 |
| `docs/FILE_ANALYSIS.md` | 문서 | 파일 별 용도 및 목적 분석 (이 파일) |

---

*작성일: 2026-02-26*
