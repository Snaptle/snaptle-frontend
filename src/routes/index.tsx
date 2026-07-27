import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Ticket, TicketCheck, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell, PageTitle } from "@/components/app-shell";
import { PlaneDoodle } from "@/components/brand";
import { AvatarStack } from "@/components/member-avatar";
import { Button } from "@/components/ui/button";
import { TRIPS } from "@/lib/mock-data";
import { formatCurrency, formatDateRange, totalSpend } from "@/lib/settlement";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "내 여행 목록 · Snaptle 여행 정산" },
      {
        name: "description",
        content:
          "영수증 사진 한 장으로 여행 지출을 기록하고, 여행이 끝나면 누가 누구에게 얼마를 보낼지 자동으로 정산합니다.",
      },
      { property: "og:title", content: "내 여행 목록 · Snaptle" },
      {
        property: "og:description",
        content: "친구·가족과 떠난 여행의 지출을 함께 기록하고 자동으로 정산하세요.",
      },
    ],
  }),
  component: TripsPage,
});

const STATUS_STYLE = {
  ongoing: "bg-primary-soft text-primary-deep",
  upcoming: "bg-teal-soft text-teal",
  closed: "bg-trust-soft text-trust",
} as const;

const STATUS_LABEL = {
  ongoing: "여행 중",
  upcoming: "예정",
  closed: "정산 완료",
} as const;

function TripsPage() {
  const [joinOpen, setJoinOpen] = useState(false);
  const [code, setCode] = useState("");

  return (
    <AppShell>
      <PageTitle title="내 여행" subtitle="함께 쓴 돈, 한 장의 티켓처럼 정리해요" />

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button
          className="h-12 rounded-2xl bg-sunset text-base font-bold shadow-float hover:opacity-95"
          onClick={() => toast.success("새 여행 만들기", { description: "데모 화면입니다." })}
        >
          <Plus className="h-5 w-5" strokeWidth={2.6} />
          새 여행 만들기
        </Button>
        <Button
          variant="outline"
          className="h-12 rounded-2xl border-trust/25 bg-card text-base font-bold text-trust hover:bg-trust-soft"
          onClick={() => setJoinOpen((v) => !v)}
        >
          <Ticket className="h-5 w-5" strokeWidth={2.4} />
          초대코드 참여
        </Button>
      </div>

      {joinOpen ? (
        <div className="mt-3 rounded-2xl border border-dashed border-trust/30 bg-trust-soft/60 p-4">
          <label htmlFor="invite" className="text-xs font-bold uppercase tracking-wider text-trust">
            초대코드 입력
          </label>
          <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
            <input
              id="invite"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="예: OSAKA26"
              className="h-11 min-w-0 rounded-xl border border-input bg-card px-3 font-display font-bold tracking-widest text-trust outline-none placeholder:font-sans placeholder:font-normal placeholder:tracking-normal placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            />
            <Button
              className="h-11 rounded-xl bg-primary font-bold"
              onClick={() => toast.success(`${code || "코드"} 여행에 참여했어요`)}
            >
              참여하기
            </Button>
          </div>
        </div>
      ) : null}

      <div className="mt-6 space-y-3">
        {TRIPS.map((trip) => (
          <Link
            key={trip.id}
            to="/trips/$tripId"
            params={{ tripId: trip.id }}
            className="block rounded-3xl border border-border bg-card p-4 shadow-card transition-transform active:scale-[0.99]"
          >
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div className="min-w-0">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_STYLE[trip.status]}`}
                >
                  {STATUS_LABEL[trip.status]}
                </span>
                <h2 className="mt-2 truncate text-lg font-bold text-trust">{trip.name}</h2>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">
                  {trip.destination} · {formatDateRange(trip.startDate, trip.endDate)}
                </p>
              </div>
              <AvatarStack members={trip.members} />
            </div>

            <div className="mt-4 flex items-end justify-between border-t border-dashed border-border pt-3">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Users className="h-4 w-4" />
                {trip.members.length}명 · 지출 {trip.expenses.length}건
              </span>
              <span className="text-right">
                <span className="block text-[11px] font-semibold text-muted-foreground">총 지출</span>
                <span className="amount text-xl text-trust">
                  {formatCurrency(totalSpend(trip), trip.currency)}
                </span>
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-center rounded-3xl border border-dashed border-border bg-card/60 px-6 py-8 text-center">
        <PlaneDoodle className="text-primary/40" />
        <p className="mt-2 text-sm font-semibold text-trust">다음 여행은 어디로 떠나시나요?</p>
        <p className="mt-1 text-xs text-muted-foreground">
          영수증을 올리면 금액·가맹점·통화를 AI가 알아서 읽어드려요.
        </p>
        <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-primary">
          <TicketCheck className="h-4 w-4" />
          기록된 거래 {TRIPS.reduce((n, t) => n + t.expenses.length, 0)}건
        </span>
      </div>
    </AppShell>
  );
}
