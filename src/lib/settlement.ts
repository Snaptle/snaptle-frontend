import type { Member, Trip } from "./mock-data";

export function formatCurrency(amount: number, currency = "KRW"): string {
  const fractionDigits = currency === "KRW" || currency === "JPY" || currency === "VND" ? 0 : 2;
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency,
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(amount);
}

export function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const fmt = (d: Date) => `${d.getMonth() + 1}.${d.getDate()}`;
  const nights = Math.max(0, Math.round((e.getTime() - s.getTime()) / 86400000));
  return `${s.getFullYear()}. ${fmt(s)} – ${fmt(e)} · ${nights}박 ${nights + 1}일`;
}

export function formatDay(date: string): string {
  const d = new Date(date);
  const weekday = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${weekday})`;
}

export type Balance = {
  member: Member;
  paid: number;
  owed: number;
  net: number;
};

export function computeBalances(trip: Trip): Balance[] {
  return trip.members.map((member) => {
    const paid = trip.expenses
      .filter((e) => e.payerId === member.id)
      .reduce((sum, e) => sum + e.amount, 0);
    const owed = trip.expenses.reduce(
      (sum, e) => sum + (e.splits.find((s) => s.memberId === member.id)?.amount ?? 0),
      0,
    );
    return { member, paid, owed, net: paid - owed };
  });
}

export type Transfer = {
  from: Member;
  to: Member;
  amount: number;
};

/** 송금 횟수를 최소화하는 그리디 정산 */
export function computeTransfers(balances: Balance[]): Transfer[] {
  const debtors = balances
    .filter((b) => b.net < -0.5)
    .map((b) => ({ member: b.member, amount: -b.net }))
    .sort((a, b) => b.amount - a.amount);
  const creditors = balances
    .filter((b) => b.net > 0.5)
    .map((b) => ({ member: b.member, amount: b.net }))
    .sort((a, b) => b.amount - a.amount);

  const transfers: Transfer[] = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const amount = Math.min(debtors[i].amount, creditors[j].amount);
    if (amount > 0.5) {
      transfers.push({ from: debtors[i].member, to: creditors[j].member, amount: Math.round(amount) });
    }
    debtors[i].amount -= amount;
    creditors[j].amount -= amount;
    if (debtors[i].amount <= 0.5) i += 1;
    if (creditors[j].amount <= 0.5) j += 1;
  }
  return transfers;
}

export function totalSpend(trip: Trip): number {
  return trip.expenses.reduce((sum, e) => sum + e.amount, 0);
}
