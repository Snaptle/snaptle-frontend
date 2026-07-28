import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Plus, Ticket, TicketCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { AppShell, PageTitle } from "@/components/app-shell";
import { PlaneDoodle } from "@/components/brand";
import { AvatarStack } from "@/components/member-avatar";
import { Button } from "@/components/ui/button";
import { TRIPS } from "@/lib/mock-data";
import { formatCurrency, formatDateRange, totalSpend } from "@/lib/settlement";

const searchSchema = z.object({
  code: z.string().optional(),
});

export const Route = createFileRoute("/")({
  validateSearch: searchSchema,
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
  const { code: incomingCode } = Route.useSearch();
  const navigate = useNavigate();
  const [joinOpen, setJoinOpen] = useState(false);
  const [code, setCode] = useState("");

  const incomingTrip = incomingCode
    ? TRIPS.find((t) => t.inviteCode.toUpperCase() === incomingCode.toUpperCase())
    : undefined;

  useEffect(() => {
    if (incomingCode) setJoinOpen(true);
  }, [incomingCode]);

  function joinByCode(rawCode: string) {
    const trip = TRIPS.find((t) => t.inviteCode.toUpperCase() === rawCode.toUpperCase());
    if (!trip) {
      toast.error("초대코드를 찾을 수 없어요. 코드를 다시 확인해주세요.");
      return;
    }
    toast.success(`${trip.name}에 참여했어요`);
    navigate({ to: "/trips/$tripId", params: { tripId: trip.id }, search: {} });
  }

  return (
    <AppShell>
      <PageTitle title="내 여행" subtitle="함께 쓴 돈, 한 장의 티켓처럼 정리해요" />

      <div className="mt-5 grid grid-cols-2 gap-2.5">
        <Button
          className="h-12 rounded-lg text-base font-medium"
          onClick={() => toast.success("새 여행 만들기", { description: "데모 화면입니다." })}
        >
          <Plus className="h-5 w-5" strokeWidth={2.6} />
          새 여행 만들기
        </Button>
        <Button
          variant="outline"
          className="h-12 rounded-lg border-border bg-card text-base font-medium text-trust hover:bg-muted"
          onClick={() => setJoinOpen((v) => !v)}
        >
          <Ticket className="h-5 w-5" strokeWidth={2.4} />
          초대코드 참여
        </Button>
      </div>

      {joinOpen && incomingCode ? (
        <div className="mt-3 rounded-3xl border border-dashed border-primary/40 bg-primary-soft/50 p-5 shadow-card">
          {incomingTrip ? (
            <>
              <p className="text-sm font-bold text-trust">
                <span className="text-primary-deep">{incomingTrip.name}</span> 여행에
                참여하시겠어요?
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {incomingTrip.destination} · {incomingTrip.members.length}명이 함께하고 있어요
              </p>
              <Button
                className="mt-3 h-11 w-full rounded-xl bg-primary font-bold"
                onClick={() => joinByCode(incomingCode)}
              >
                참여하기
              </Button>
            </>
          ) : (
            <p className="text-sm font-semibold text-trust">
              유효하지 않은 초대코드예요: {incomingCode}
            </p>
          )}
        </div>
      ) : joinOpen ? (
        <div className="mt-3 rounded-3xl border border-dashed border-trust/30 bg-trust-soft/60 p-5 shadow-card">
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
            <Button className="h-11 rounded-xl bg-primary font-bold" onClick={() => joinByCode(code)}>
              참여하기
            </Button>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            초대 링크를 받았다면 코드를 직접 입력할 필요 없이 링크만 눌러도 바로 참여돼요.
          </p>
        </div>
      ) : null}

      <div className="mt-7 space-y-4">
        {TRIPS.map((trip, i) => (
          <Link
            key={trip.id}
            to={trip.status === "closed" ? "/trips/$tripId/settlement" : "/trips/$tripId"}
            params={{ tripId: trip.id }}
            className={`block rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-card transition-transform hover:shadow-lift active:scale-[0.99] ${i % 2 === 0 ? "tilt-a" : "tilt-b"}`}
          >
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div className="min-w-0">
                <span
                  className={`pill ${STATUS_STYLE[trip.status]}`}
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

      <div className="mt-9 flex flex-col items-center rounded-[2rem] border border-dashed border-border bg-card/60 px-6 py-10 text-center shadow-card">
        <PlaneDoodle className="text-primary/40" />
        <p className="mt-2 text-sm font-semibold text-trust">다음 여행은 어디로 떠나시나요?</p>
        <p className="mt-1 text-xs text-muted-foreground">
          영수증을 올리면 금액·가맹점·통화를 AI가 알아서 읽어드려요.
        </p>
        <span className="pill mt-4 bg-primary-soft text-primary-deep">
          <TicketCheck className="h-4 w-4" />
          기록된 거래 {TRIPS.reduce((n, t) => n + t.expenses.length, 0)}건
        </span>
      </div>
    </AppShell>
  );
}
