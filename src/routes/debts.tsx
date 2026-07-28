import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownLeft, ArrowUpRight, Check, Plus, Wallet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell, PageTitle } from "@/components/app-shell";
import { PlaneDoodle } from "@/components/brand";
import { MemberAvatar } from "@/components/member-avatar";
import { Button } from "@/components/ui/button";
import { PERSONAL_DEBTS, type PersonalDebt } from "@/lib/mock-data";
import { formatCurrency, formatDay } from "@/lib/settlement";

export const Route = createFileRoute("/debts")({
  head: () => ({
    meta: [
      { title: "밀린 정산 · Snaptle" },
      {
        name: "description",
        content: "여행 정산과는 별개로, 내기나 소소한 대여처럼 둘 사이에 남은 돈을 가볍게 기록해두세요.",
      },
      { property: "og:title", content: "밀린 정산 · Snaptle" },
      { property: "og:description", content: "술내기, 대신 낸 택시비까지 잊지 않고 가볍게 기록." },
    ],
  }),
  component: DebtsPage,
});

type Tab = "all" | "receive" | "pay";

function DebtsPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [debts, setDebts] = useState<PersonalDebt[]>(PERSONAL_DEBTS);
  const [formOpen, setFormOpen] = useState(false);

  const open = debts.filter((d) => !d.settled);
  const receiveTotal = open.filter((d) => d.direction === "receive").reduce((n, d) => n + d.amount, 0);
  const payTotal = open.filter((d) => d.direction === "pay").reduce((n, d) => n + d.amount, 0);
  const visible = debts.filter((d) => tab === "all" || d.direction === tab);

  return (
    <AppShell>
      <PageTitle title="밀린 정산" subtitle="내기·대신 낸 돈처럼 둘 사이에 남은 금액만 가볍게" />

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-trust-gradient p-4 text-trust-foreground">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold opacity-80">
            <ArrowDownLeft className="h-3.5 w-3.5" />
            받을 돈
          </p>
          <p className="amount mt-1 text-2xl">{formatCurrency(receiveTotal)}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
            <ArrowUpRight className="h-3.5 w-3.5" />
            줄 돈
          </p>
          <p className="amount mt-1 text-2xl text-primary-deep">{formatCurrency(payTotal)}</p>
        </div>
      </div>

      <Button
        className="mt-3 h-12 w-full rounded-2xl bg-sunset text-base font-bold shadow-float hover:opacity-95"
        onClick={() => setFormOpen((v) => !v)}
      >
        <Plus className="h-5 w-5" strokeWidth={2.6} />
        정산 남기기
      </Button>

      {formOpen ? (
        <form
          className="mt-3 space-y-2 rounded-2xl border border-dashed border-primary/40 bg-primary-soft/50 p-4"
          onSubmit={(e) => {
            e.preventDefault();
            setFormOpen(false);
            toast.success("밀린 정산을 남겨뒀어요");
          }}
        >
          <div className="grid grid-cols-2 gap-2">
            <input
              placeholder="상대 이름"
              className="h-11 rounded-xl border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              inputMode="numeric"
              placeholder="금액"
              className="amount h-11 rounded-xl border border-input bg-card px-3 text-right outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <input
            placeholder="메모 (예: 볼링 내기, 택시비 대신 결제)"
            className="h-11 w-full rounded-xl border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button type="submit" className="h-11 rounded-xl bg-trust font-bold text-trust-foreground">
              받을 돈으로 남기기
            </Button>
            <Button type="submit" variant="outline" className="h-11 rounded-xl bg-card font-bold text-trust">
              줄 돈으로 남기기
            </Button>
          </div>
        </form>
      ) : null}

      <div className="mt-6 grid grid-cols-3 rounded-2xl bg-muted p-1 text-sm font-bold">
        {(
          [
            ["all", "전체"],
            ["receive", "받을 돈"],
            ["pay", "줄 돈"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`h-10 rounded-xl transition-colors ${
              tab === id ? "bg-card text-trust shadow-sm" : "text-muted-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        {visible.map((d) => (
          <article
            key={d.id}
            className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-card ${
              d.settled ? "opacity-55" : ""
            }`}
          >
            <MemberAvatar name={d.counterpart} tone={d.tone} size="lg" />
            <div className="min-w-0">
              <p className="truncate font-bold text-trust">
                {d.counterpart}
                <span className="ml-1.5 text-xs font-semibold text-muted-foreground">
                  {d.direction === "receive" ? "에게 받을 돈" : "에게 줄 돈"}
                </span>
              </p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {d.memo} · {formatDay(d.date)}
              </p>
              <p
                className={`amount mt-1 text-xl ${
                  d.direction === "receive" ? "text-teal" : "text-primary-deep"
                }`}
              >
                {d.direction === "receive" ? "+" : "−"}
                {formatCurrency(d.amount)}
              </p>
            </div>
            <button
              aria-label="정산 완료 처리"
              onClick={() => {
                setDebts((prev) =>
                  prev.map((x) => (x.id === d.id ? { ...x, settled: !x.settled } : x)),
                );
                toast.success(d.settled ? "다시 미정산으로 되돌렸어요" : "정산 완료로 표시했어요");
              }}
              className={`grid h-10 w-10 place-items-center rounded-full border-2 transition-colors ${
                d.settled
                  ? "border-transparent bg-success text-primary-foreground"
                  : "border-border text-muted-foreground"
              }`}
            >
              <Check className="h-5 w-5" strokeWidth={3} />
            </button>
          </article>
        ))}

        {visible.length === 0 ? (
          <div className="flex flex-col items-center rounded-3xl border border-dashed border-border py-12 text-center">
            <PlaneDoodle className="text-primary/40" />
            <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-trust">
              <Wallet className="h-4 w-4" />
              아직 밀린 정산이 없어요
            </p>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
