# Awesome Sudoku

> 해당 프로젝트는 https://github.com/KimDanwoo/labs로 이관되었습니다.

> 9x9 칸 안에서 벌어지는 두뇌 싸움.

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)

클래식 스도쿠와 킬러 스도쿠를 지원하는 웹 기반 퍼즐 게임입니다.
퍼즐 생성·유일해 검증·난이도 조절 알고리즘부터 UI까지 직접 구현했습니다.

## Features

**Game**

- 4단계 난이도 (Easy / Medium / Hard / Expert)
- 클래식 모드 & 킬러 모드 (케이지 합산 규칙)
- 메모 모드, 힌트 시스템, 충돌 감지
- Undo / Redo
- 실수 5회 초과 시 게임 오버
- 게임 결과 바텀시트 (성공/실패 분기)

**Record & Stats**

- 난이도 기반 포인트 시스템 (4~10점)
- 게임별 기록 저장 (시간, 힌트, 실수, 포인트)
- 난이도별 통계, 완료율, 최고 포인트

**Social**

- Google 로그인
- 최고 기록 리더보드 (난이도/모드 필터)
- 누적 포인트 리더보드 (1~3위 메달)
- 프로필 페이지 (게임 상세 바텀시트)

**UI/UX**

- 다크 / 라이트 테마
- 반응형 레이아웃 (모바일 395px ~ 데스크탑)
- 드래그로 닫는 바텀시트, 토스트 알림
- 미니멀 디자인 시스템 (CSS 변수 기반 테마 토큰)

## Tech Stack

| Layer     | Choice                             |
| --------- | ---------------------------------- |
| Framework | Next.js 16 (App Router)            |
| UI        | React 19 · Tailwind CSS v4         |
| State     | Jotai v2                           |
| Auth / DB | Firebase Auth (Google) · Firestore |
| Language  | TypeScript (strict)                |
| Test      | Vitest · Testing Library           |

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm

### Install

```bash
pnpm install
```

### Environment

Firebase 웹 앱 설정이 필요합니다. `.env.example`를 복사해 값을 채웁니다.

```bash
cp .env.example .env.local
```

값은 Firebase Console → 프로젝트 설정 → 내 앱에서 확인할 수 있습니다.
모든 키는 `NEXT_PUBLIC_` 접두사를 가지는 클라이언트 설정값이며, 접근 제어는
Firestore 보안 규칙으로 처리합니다.

### Run

```bash
pnpm dev            # 개발 서버 (http://localhost:3005)
pnpm build          # 프로덕션 빌드
pnpm start          # 프로덕션 서버
```

## Architecture

[Feature-Sliced Design](https://feature-sliced.design/) 기반 구조. 위에서
아래로만 의존하며, 재사용 압력이 생길 때에만 하위 레이어로 분리합니다.

```
src/
├── views/        # 페이지 (Home, Profile, Leaderboard)
├── widgets/      # 조합 UI (GameBoard, GameHeader, Overlays)
├── features/     # 기능 단위 (sudoku-game, auth, leaderboard...)
├── entities/     # 도메인 모델 (board, game, game-record)
├── shared/       # 공통 유틸 & UI (cn, BottomSheet, Snackbar...)
└── apps/         # 외부 서비스 초기화 (Firebase)
```

## Algorithm Design

퍼즐은 서버 없이 클라이언트에서 실시간 생성됩니다. 핵심은 **"항상 유일한
정답을 가지는 퍼즐을, 원하는 난이도로, 충분히 빠르게"** 만드는 것입니다.
구현은 [`src/features/sudoku-game/model/utils`](src/features/sudoku-game/model/utils)에
있습니다 (`generator.ts` · `remove.ts` · `validator.ts`).

### 1. 완성 솔루션 생성

빈 그리드에서 재귀 백트래킹으로 완성판을 채웁니다. 각 셀에 1–9를
**Fisher-Yates로 셔플한 순서**로 시도해 매번 다른 정답판이 나오도록 하고,
행·열·3x3 블록 제약을 만족하지 못하면 백트래킹합니다. 완성된 판은 행/열 교환,
블록 교환, 회전, 숫자 매핑 등 **정답을 보존하는 변환**을 거쳐 다양성을 확보합니다.

### 2. 전략적 셀 제거

완성판에서 셀을 지워 퍼즐을 만듭니다. 난이도별 전략으로 **제거 우선순위를
계산**한 뒤, 우선순위 순서대로 셀을 하나씩 비워 나갑니다. 매 제거마다 유일해가
유지되는지 검증하고, 깨지면 그 셀을 **되돌립니다(rollback)**. 덕분에 어떤 난이도든
정답이 하나로 보장됩니다.

난이도는 유지 힌트 수와 제거 위치 전략으로 조절합니다.

| 난이도 | 유지 힌트 | 제거 전략               |
| ------ | --------- | ----------------------- |
| Easy   | 30–40     | 모서리 우선 · 높은 대칭 |
| Medium | 22–30     | 변 우선 · 블록 균등     |
| Hard   | 20–26     | 중앙 우선               |
| Expert | 15–19     | 중앙·모서리 공격적 제거 |

### 3. 유일해 검증

퍼즐이 정답을 하나만 가지는지 확인합니다. 빈 셀을 **MRV 휴리스틱**(후보가 가장
적은 셀 먼저)으로 정렬한 뒤 백트래킹으로 탐색하고, **두 번째 해를 찾는 즉시
중단**해 불필요한 탐색을 막습니다. 최대 반복 횟수 상한으로 최악의 경우에도
멈추도록 안전장치를 둡니다.

### 4. 킬러 케이지 생성

각 3x3 영역에 시드 포인트를 뿌린 뒤 **BFS로 인접 셀을 병합**해 케이지를
확장합니다. 케이지 내 숫자 중복을 막고 `maxCageSize`를 지키며, 남은 셀은 인접
케이지에 병합하거나 새 케이지로 묶습니다. 마지막에 81개 셀이 모두 케이지에
속하는지 검증하고 각 케이지의 합계를 계산합니다.

## Testing

순수 함수와 커스텀 훅에 대해 단위 테스트를 작성합니다 (퍼즐 생성기, 셀 제거,
검증기 등).

```bash
pnpm test           # watch 모드
pnpm test:coverage  # 커버리지 리포트
```

## License

MIT — [LICENSE](LICENSE)
