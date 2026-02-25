# 💻 냥세 개발 가이드

> 작성: 코디 (Cody)  
> 프로젝트: 냥세 - 고양이 운세 서비스

---

## 1. 기술 스택

| 영역 | 기술 | 버전 |
|------|------|------|
| 프레임워크 | Next.js | 16.1.6 |
| 언어 | TypeScript | 5.x |
| 스타일링 | Tailwind CSS | 4.x |
| 사주 계산 | lunisolar | latest |
| 결제 | Toss Payments | latest |
| 이미지 생성 | html-to-image | latest |

---

## 2. 프로젝트 구조

```
nyangsae/
├── app/
│   ├── (pages)/
│   │   ├── test/          # MBTI 입력/테스트
│   │   ├── saju/          # 생년월일 입력
│   │   ├── result/        # 결과 페이지
│   │   └── report/        # 상세 리포트 (유료)
│   ├── api/
│   │   └── confirm-payment/  # 결제 검증
│   ├── layout.tsx
│   └── page.tsx           # 홈
├── components/
│   ├── ui/                # 공용 UI 컴포넌트
│   ├── MbtiTest.tsx
│   ├── OhaengBar.tsx
│   └── ShareCard.tsx
├── lib/
│   ├── mbti.ts            # MBTI 로직
│   ├── saju.ts            # 사주/오행 계산
│   └── catMapper.ts       # 캐릭터 매핑
├── data/
│   └── cats.ts            # 20종 캐릭터 데이터
├── types/
│   └── index.ts           # 타입 정의
├── public/
│   └── cats/              # 고양이 이미지
└── docs/
    ├── PLANNING.md
    ├── UX_WRITING.md
    ├── DESIGN_GUIDE.md
    └── DEV_GUIDE.md       # 이 파일
```

---

## 3. 개발 워크플로우

### TDD 사이클
1. **Red**: 실패하는 테스트 작성
2. **Green**: 테스트 통과할 최소 코드 작성
3. **Refactor**: 리팩토링
4. **Commit**: 의미 있는 커밋

### 브랜치 전략
- `main`: 배포 브랜치
- `feature/*`: 기능 개발
- `fix/*`: 버그 수정

---

## 4. 핵심 기능 구현 체크리스트

### MBTI 시스템 ✅
- [x] 4그룹 분류 (NT/NF/ST/SF)
- [x] 12문항 간략 테스트
- [x] 직접 타입 입력

### 사주 계산 ✅
- [x] lunisolar 연동
- [x] 오행 비율 계산
- [x] 사주팔자 출력

### 캐릭터 시스템 ✅
- [x] 20종 캐릭터 데이터
- [x] MBTI×오행 매핑
- [x] 캐릭터 상세 정보

### 결제 시스템 ✅
- [x] Toss Payments 연동
- [x] 결제 검증 API
- [x] 디버그 모드

### 공유 기능 ✅
- [x] html-to-image 카드 생성
- [x] SNS 공유

---

## 5. 환경 변수

```env
# .env.local
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_...
TOSS_SECRET_KEY=test_sk_...
NEXT_PUBLIC_REPORT_DEBUG=false
```

---

## 6. 배포 체크리스트

- [ ] 환경 변수 설정
- [ ] Toss Payments 실제 키로 교체
- [ ] 도메인 연결
- [ ] OG 이미지 설정
- [ ] GA 연동

---

## 7. 확장 아이디어

- [ ] 카카오톡 공유
- [ ] 커플 궁합 기능
- [ ] 운세 구독 (푸시 알림)
- [ ] 앱 버전 (React Native)

---

*작성일: 2026-02-25*
