export type CategoryId = "food" | "stay" | "transport" | "etc";

export type Category = {
  id: CategoryId;
  label: string;
  emoji: string;
};

export const CATEGORIES: Category[] = [
  { id: "food", label: "식비", emoji: "🍜" },
  { id: "stay", label: "숙소", emoji: "🛏️" },
  { id: "transport", label: "교통", emoji: "🚄" },
  { id: "etc", label: "기타", emoji: "🎟️" },
];

export function categoryOf(id: CategoryId): Category {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[3];
}

export type Member = {
  id: string;
  name: string;
  tone: 0 | 1 | 2 | 3 | 4;
};

export type Split = {
  memberId: string;
  amount: number;
};

export type Expense = {
  id: string;
  date: string;
  merchant: string;
  category: CategoryId;
  /** 여행 기본 통화 기준 금액 */
  amount: number;
  originalAmount?: number;
  originalCurrency?: string;
  payerId: string;
  splits: Split[];
  source: "receipt" | "manual";
};

export type Trip = {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  currency: string;
  inviteCode: string;
  status: "upcoming" | "ongoing" | "closed";
  members: Member[];
  expenses: Expense[];
};

export const ME = "u1";

const 지현: Member = { id: "u1", name: "지현", tone: 0 };
const 민준: Member = { id: "u2", name: "민준", tone: 1 };
const 서연: Member = { id: "u3", name: "서연", tone: 2 };
const 하윤: Member = { id: "u4", name: "하윤", tone: 3 };
const 도윤: Member = { id: "u5", name: "도윤", tone: 4 };

function even(memberIds: string[], amount: number): Split[] {
  const base = Math.floor(amount / memberIds.length);
  const rest = amount - base * memberIds.length;
  return memberIds.map((memberId, i) => ({
    memberId,
    amount: base + (i < rest ? 1 : 0),
  }));
}

const osakaMembers = [지현, 민준, 서연, 하윤];
const osakaIds = osakaMembers.map((m) => m.id);

export const TRIPS: Trip[] = [
  {
    id: "osaka",
    name: "오사카 겨울 여행",
    destination: "일본 · 오사카",
    startDate: "2026-01-08",
    endDate: "2026-01-12",
    currency: "KRW",
    inviteCode: "OSAKA26",
    status: "ongoing",
    members: osakaMembers,
    expenses: [
      {
        id: "e1",
        date: "2026-01-08",
        merchant: "간사이공항 하루카 특급",
        category: "transport",
        amount: 62000,
        originalAmount: 6800,
        originalCurrency: "JPY",
        payerId: "u2",
        splits: even(osakaIds, 62000),
        source: "receipt",
      },
      {
        id: "e2",
        date: "2026-01-08",
        merchant: "이치란 라멘 도톤보리",
        category: "food",
        amount: 48600,
        originalAmount: 5320,
        originalCurrency: "JPY",
        payerId: "u1",
        splits: even(osakaIds, 48600),
        source: "receipt",
      },
      {
        id: "e3",
        date: "2026-01-08",
        merchant: "난바 오리엔탈 호텔 (2박)",
        category: "stay",
        amount: 320000,
        payerId: "u3",
        splits: even(osakaIds, 320000),
        source: "manual",
      },
      {
        id: "e4",
        date: "2026-01-09",
        merchant: "구로몬 시장",
        category: "food",
        amount: 27400,
        originalAmount: 3000,
        originalCurrency: "JPY",
        payerId: "u4",
        splits: even(osakaIds, 27400),
        source: "receipt",
      },
      {
        id: "e5",
        date: "2026-01-09",
        merchant: "유니버설 스튜디오 재팬",
        category: "etc",
        amount: 396000,
        originalAmount: 43400,
        originalCurrency: "JPY",
        payerId: "u1",
        splits: even(osakaIds, 396000),
        source: "receipt",
      },
      {
        id: "e6",
        date: "2026-01-10",
        merchant: "교토 당일치기 기차",
        category: "transport",
        amount: 74800,
        payerId: "u2",
        splits: even(osakaIds, 74800),
        source: "manual",
      },
      {
        id: "e7",
        date: "2026-01-10",
        merchant: "니시키 커피 스탠드",
        category: "food",
        amount: 18200,
        originalAmount: 2000,
        originalCurrency: "JPY",
        payerId: "u3",
        splits: [
          { memberId: "u1", amount: 6100 },
          { memberId: "u3", amount: 6100 },
          { memberId: "u4", amount: 6000 },
        ],
        source: "receipt",
      },
      {
        id: "e8",
        date: "2026-01-11",
        merchant: "돈키호테 기념품",
        category: "etc",
        amount: 132500,
        originalAmount: 14520,
        originalCurrency: "JPY",
        payerId: "u4",
        splits: even(osakaIds, 132500),
        source: "receipt",
      },
    ],
  },
  {
    id: "jeju",
    name: "제주 워케이션",
    destination: "대한민국 · 제주",
    startDate: "2026-02-20",
    endDate: "2026-02-25",
    currency: "KRW",
    inviteCode: "JEJU-WK",
    status: "upcoming",
    members: [지현, 민준, 도윤],
    expenses: [
      {
        id: "j1",
        date: "2026-02-20",
        merchant: "제주항공 왕복 항공권",
        category: "transport",
        amount: 246000,
        payerId: "u1",
        splits: even(["u1", "u2", "u5"], 246000),
        source: "manual",
      },
      {
        id: "j2",
        date: "2026-02-20",
        merchant: "애월 스테이 (5박)",
        category: "stay",
        amount: 540000,
        payerId: "u5",
        splits: even(["u1", "u2", "u5"], 540000),
        source: "receipt",
      },
    ],
  },
  {
    id: "danang",
    name: "다낭 리조트",
    destination: "베트남 · 다낭",
    startDate: "2025-11-03",
    endDate: "2025-11-08",
    currency: "KRW",
    inviteCode: "DANANG5",
    status: "closed",
    members: [지현, 서연, 하윤],
    expenses: [
      {
        id: "d1",
        date: "2025-11-03",
        merchant: "미케비치 리조트",
        category: "stay",
        amount: 612000,
        payerId: "u3",
        splits: even(["u1", "u3", "u4"], 612000),
        source: "receipt",
      },
      {
        id: "d2",
        date: "2025-11-05",
        merchant: "바나힐 투어",
        category: "etc",
        amount: 189000,
        payerId: "u1",
        splits: even(["u1", "u3", "u4"], 189000),
        source: "manual",
      },
    ],
  },
];

export function getTrip(id: string): Trip | undefined {
  return TRIPS.find((t) => t.id === id);
}

export type PersonalDebt = {
  id: string;
  counterpart: string;
  tone: 0 | 1 | 2 | 3 | 4;
  /** receive: 내가 받을 돈, pay: 내가 줄 돈 */
  direction: "receive" | "pay";
  amount: number;
  memo: string;
  date: string;
  settled: boolean;
};

export const PERSONAL_DEBTS: PersonalDebt[] = [
  {
    id: "p1",
    counterpart: "민준",
    tone: 1,
    direction: "receive",
    amount: 5000,
    memo: "볼링 내기 대금",
    date: "2026-01-19",
    settled: false,
  },
  {
    id: "p2",
    counterpart: "서연",
    tone: 2,
    direction: "pay",
    amount: 23000,
    memo: "콘서트 티켓 예매 대신 결제",
    date: "2026-01-15",
    settled: false,
  },
  {
    id: "p3",
    counterpart: "하윤",
    tone: 3,
    direction: "receive",
    amount: 12800,
    memo: "택시비 선결제",
    date: "2026-01-11",
    settled: false,
  },
  {
    id: "p4",
    counterpart: "도윤",
    tone: 4,
    direction: "pay",
    amount: 8000,
    memo: "편의점 야식",
    date: "2025-12-28",
    settled: true,
  },
];
