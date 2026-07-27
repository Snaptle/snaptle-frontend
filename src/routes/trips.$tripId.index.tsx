import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, Copy, Plus, Sparkles, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AvatarStack, MemberAvatar } from "@/components/member-avatar";
import { Button } from "@/components/ui/button";
import { CATEGORIES, categoryOf, getTrip, ME, type CategoryId } from "@/lib/mock-data";
import { computeBalances, formatCurrency, formatDateRange, formatDay, totalSpend } from "@/lib/settlement";

export const Route = createFileRoute("/trips/$tripId/")({
  head: () => ({
    meta: [
      { title: "여행 지출 내역 · Snaptle" },
      {
        name: "description",
        content: "날짜순 지출 목록과 카테고리별 사용액을 확인하고 새 지출을 추가하세요.",
      },
      { property: "og:title", content: "여행 지출 내역 · Snaptle" },
      { property: "og:description", content: "여행 멤버가 함께 보는 실시간 지출 기록." },
    ],
  }),
  component: TripDetailPage,
});

function TripDetailPage() {
  const { tripId } = Route.useParams();
  const navigate = useNavigate();
  const trip = getTrip(tripId);
  const [filter, setFilter] = useState<CategoryId | "all">("all");

  const grouped = useMemo(() => {
    if (!trip) return [];
    const list = trip.expenses.filter((e) => filter === "all" || e.category === filter);
    const map = new Map<string, typeof list>();
    for (const e of [...list].sort((a, b) => (a.date < b.date ? 1 : -1))) {
      map.set(e.date, [...(map.get(e.date) ?? []), e]);
    }
    return [...map.entries()];
  }, [trip, filter]);

  if (!trip) {
    return (
      <div className="grid min-h-screen place-items-center px-6 text-center">
        <div>
          <p className="text-lg font-bold text-trust">여행을 찾을 수 없어요</p>
          <Link to="/" className="mt-3 inline-block text-sm font-semibold text-primary underline">
            여행 목록으로
          </Link>
        </div>
      </div>
    );
  }

  const myBalance = computeBalances(trip).find((b) => b.member.id === ME);

  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="bg-trust-gradient px-4 pb-6 pt-4 text-trust-foreground">
        <div className="mx-auto max-w-xl">
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
            <Link to="/" aria-label="뒤로" className="rounded-full p-1.5 hover:bg-card/10">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <span className="truncate text-sm font-semibold opacity-80">{trip.destination}</span>
            <AvatarStack members={trip.members} />
          </div>

          <h1 className="mt-3 text-2xl font-extrabold text-trust-foreground">{trip.name}</h1>
          <p className="mt-1 text-sm opacity-80">
            {formatDateRange(trip.startDate, trip.endDate)} · 기본통화 {trip.currency}
          </p>

          <button
            onClick={() => toast.success("초대코드를 복사했어요", { description: trip.inviteCode })}
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-card/15 px-3 py-1.5 text-xs font-bold tracking-widest"
          >
            <Copy className="h-3.5 w-3.5" />
            {trip.inviteCode}
          </button>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-card/12 p-3">
              <p className="text-[11px] font-semibold opacity-75">여행 총 지출</p>
              <p className="amount mt-0.5 text-2xl">{formatCurrency(totalSpend(trip), trip.currency)}</p>
            </div>
            <div className="rounded-2xl bg-card/12 p-3">
              <p className="text-[11px] font-semibold opacity-75">내 잔액</p>
              <p className="amount mt-0.5 text-2xl">
                {myBalance && myBalance.net >= 0 ? "+" : "−"}
                {formatCurrency(Math.abs(myBalance?.net ?? 0), trip.currency)}
              </p>
            </div>
          </div>

          <Button
            className="mt-4 h-12 w-full rounded-2xl bg-card text-base font-bold text-trust hover:bg-card/90"
            onClick={() => navigate({ to: "/trips/$tripId/settlement", params: { tripId } })}
          >
            <Wallet className="h-5 w-5" />
            여행 종료하고 정산하기
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 pt-5">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
            전체
          </FilterChip>
          {CATEGORIES.map((c) => (
            <FilterChip key={c.id} active={filter === c.id} onClick={() => setFilter(c.id)}>
              {c.emoji} {c.label}
            </FilterChip>
          ))}
        </div>

        <div className="mt-5 space-y-6">
          {grouped.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
              이 카테고리에는 아직 지출이 없어요.
            </p>
          ) : null}

          {grouped.map(([date, items]) => (
            <section key={date}>
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {formatDay(date)}
              </h2>
              <div className="mt-2 space-y-2">
                {items.map((e) => {
                  const payer = trip.members.find((m) => m.id === e.payerId)!;
                  const cat = categoryOf(e.category);
                  return (
                    <article
                      key={e.id}
                      className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-card"
                    >
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-muted text-lg">
                        {cat.emoji}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-bold text-trust">{e.merchant}</p>
                        <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                          <MemberAvatar name={payer.name} tone={payer.tone} size="sm" />
                          {payer.name} 결제 · {e.splits.length}명 분할
                          {e.source === "receipt" ? (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-primary-soft px-1.5 py-0.5 font-bold text-primary-deep">
                              <Sparkles className="h-3 w-3" />
                              AI
                            </span>
                          ) : null}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="amount text-lg text-trust">
                          {formatCurrency(e.amount, trip.currency)}
                        </p>
                        {e.originalAmount ? (
                          <p className="text-[11px] text-muted-foreground">
                            {formatCurrency(e.originalAmount, e.originalCurrency)}
                          </p>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-4 shadow-card">
          <h2 className="text-sm font-bold text-trust">카테고리별 사용액</h2>
          <div className="mt-3 space-y-2">
            {CATEGORIES.map((c) => {
              const sum = trip.expenses
                .filter((e) => e.category === c.id)
                .reduce((n, e) => n + e.amount, 0);
              const pct = Math.round((sum / Math.max(1, totalSpend(trip))) * 100);
              return (
                <div key={c.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
                  <span className="w-14 text-xs font-semibold text-muted-foreground">
                    {c.emoji} {c.label}
                  </span>
                  <span className="h-2 rounded-full bg-muted">
                    <span
                      className="block h-2 rounded-full bg-sunset"
                      style={{ width: `${pct}%` }}
                    />
                  </span>
                  <span className="amount w-24 text-right text-sm text-trust">
                    {formatCurrency(sum, trip.currency)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Link
        to="/trips/$tripId/new-expense"
        params={{ tripId }}
        className="fixed bottom-6 right-1/2 z-40 flex translate-x-[min(50vw-1.5rem,17.5rem)] items-center gap-2 rounded-full bg-sunset px-5 py-4 font-bold text-primary-foreground shadow-float active:scale-95"
      >
        <Plus className="h-5 w-5" strokeWidth={3} />
        지출 추가
      </Link>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-3.5 py-2 text-sm font-bold transition-colors ${
        active
          ? "border-transparent bg-trust text-trust-foreground"
          : "border-border bg-card text-muted-foreground"
      }`}
    >
      {active ? <Check className="h-3.5 w-3.5" /> : null}
      {children}
    </button>
  );
}
