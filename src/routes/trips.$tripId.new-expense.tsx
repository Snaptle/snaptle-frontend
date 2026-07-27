import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Camera,
  Check,
  ImagePlus,
  Loader2,
  Pencil,
  Sparkles,
  Wand2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { MemberAvatar } from "@/components/member-avatar";
import { Button } from "@/components/ui/button";
import { CATEGORIES, getTrip, ME, type CategoryId } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/settlement";

export const Route = createFileRoute("/trips/$tripId/new-expense")({
  head: () => ({
    meta: [
      { title: "지출 추가 · Snaptle" },
      {
        name: "description",
        content: "영수증 사진을 올리면 AI가 가맹점·금액·통화·날짜를 인식하고, 결제자와 분할을 정합니다.",
      },
      { property: "og:title", content: "지출 추가 · Snaptle" },
      { property: "og:description", content: "영수증 한 장이면 지출 기록 끝." },
    ],
  }),
  component: NewExpensePage,
});

/** AI 인식 결과 목업 */
const SCAN_RESULT = {
  merchant: "쿠시카츠 다루마 신세카이점",
  originalAmount: 7480,
  originalCurrency: "JPY",
  amount: 68100,
  date: "2026-01-11",
  category: "food" as CategoryId,
  confidence: 0.96,
};

type Step = "upload" | "scanning" | "review";

function NewExpensePage() {
  const { tripId } = Route.useParams();
  const navigate = useNavigate();
  const trip = getTrip(tripId);

  const [step, setStep] = useState<Step>("upload");
  const [merchant, setMerchant] = useState(SCAN_RESULT.merchant);
  const [amount, setAmount] = useState(String(SCAN_RESULT.amount));
  const [origAmount, setOrigAmount] = useState(String(SCAN_RESULT.originalAmount));
  const [currency, setCurrency] = useState(SCAN_RESULT.originalCurrency);
  const [date, setDate] = useState(SCAN_RESULT.date);
  const [category, setCategory] = useState<CategoryId>(SCAN_RESULT.category);
  const [payerId, setPayerId] = useState(ME);
  const [participants, setParticipants] = useState<string[]>(trip?.members.map((m) => m.id) ?? []);
  const [splitMode, setSplitMode] = useState<"even" | "custom">("even");
  const [custom, setCustom] = useState<Record<string, string>>({});

  if (!trip) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Link to="/" className="text-sm font-semibold text-primary underline">
          여행 목록으로
        </Link>
      </div>
    );
  }

  const total = Number(amount) || 0;
  const evenShare = participants.length ? Math.floor(total / participants.length) : 0;
  const customTotal = participants.reduce((n, id) => n + (Number(custom[id]) || 0), 0);
  const diff = total - customTotal;

  function startScan() {
    setStep("scanning");
    window.setTimeout(() => setStep("review"), 1600);
  }

  function toggleParticipant(id: string) {
    setParticipants((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 px-4 py-3 backdrop-blur">
        <div className="mx-auto grid max-w-xl grid-cols-[auto_minmax(0,1fr)] items-center gap-2">
          <Link
            to="/trips/$tripId"
            params={{ tripId }}
            aria-label="뒤로"
            className="rounded-full p-1.5 hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5 text-trust" />
          </Link>
          <h1 className="truncate text-lg font-extrabold text-trust">지출 추가</h1>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 pt-5">
        {step === "upload" ? (
          <section>
            <div className="ticket-notch rounded-3xl border-2 border-dashed border-primary/40 bg-primary-soft/60 px-6 py-12 text-center">
              <p className="text-lg font-extrabold text-trust">영수증을 올려주세요</p>
              <p className="mt-1 text-sm text-muted-foreground">
                가맹점 · 금액 · 통화 · 날짜를 AI가 자동으로 읽어드려요.
              </p>
              <div className="mt-6 grid gap-2">
                <Button
                  className="h-12 rounded-2xl bg-sunset text-base font-bold shadow-float hover:opacity-95"
                  onClick={startScan}
                >
                  <Camera className="h-5 w-5" />
                  영수증 촬영하기
                </Button>
                <Button
                  variant="outline"
                  className="h-12 rounded-2xl border-trust/25 bg-card text-base font-bold text-trust"
                  onClick={startScan}
                >
                  <ImagePlus className="h-5 w-5" />
                  갤러리에서 선택
                </Button>
              </div>
            </div>
            <button
              onClick={() => setStep("review")}
              className="mt-4 w-full text-center text-sm font-semibold text-muted-foreground underline underline-offset-4"
            >
              영수증 없이 직접 입력할래요
            </button>
          </section>
        ) : null}

        {step === "scanning" ? (
          <section className="rounded-3xl border border-border bg-card px-6 py-16 text-center shadow-card">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-lg font-extrabold text-trust">영수증을 읽는 중…</p>
            <p className="mt-1 text-sm text-muted-foreground">금액과 통화를 확인하고 있어요.</p>
          </section>
        ) : null}

        {step === "review" ? (
          <section className="space-y-5">
            <div className="rounded-3xl border border-border bg-card p-4 shadow-card">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-bold text-primary-deep">
                  <Sparkles className="h-3.5 w-3.5" />
                  AI 인식 완료 {Math.round(SCAN_RESULT.confidence * 100)}%
                </span>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                  <Pencil className="h-3 w-3" />
                  수정 가능
                </span>
              </div>

              <label htmlFor="merchant" className="mt-4 block text-xs font-bold text-trust">
                가맹점
              </label>
              <input
                id="merchant"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                className="mt-1 h-12 w-full rounded-2xl border border-input bg-background px-4 font-semibold outline-none focus:ring-2 focus:ring-ring"
              />

              <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                <div className="min-w-0">
                  <label htmlFor="orig" className="block text-xs font-bold text-trust">
                    영수증 금액
                  </label>
                  <input
                    id="orig"
                    inputMode="decimal"
                    value={origAmount}
                    onChange={(e) => setOrigAmount(e.target.value)}
                    className="amount mt-1 h-12 w-full rounded-2xl border border-input bg-background px-4 text-xl outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label htmlFor="cur" className="block text-xs font-bold text-trust">
                    통화
                  </label>
                  <select
                    id="cur"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="mt-1 h-12 rounded-2xl border border-input bg-background px-3 font-bold text-trust outline-none focus:ring-2 focus:ring-ring"
                  >
                    {["JPY", "KRW", "USD", "EUR", "VND"].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-3 rounded-2xl bg-trust-soft p-3">
                <label htmlFor="krw" className="block text-xs font-bold text-trust">
                  {trip.currency} 환산 금액
                </label>
                <input
                  id="krw"
                  inputMode="numeric"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
                  className="amount mt-1 h-14 w-full rounded-xl border border-trust/15 bg-card px-4 text-3xl text-trust outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <label htmlFor="date" className="mt-3 block text-xs font-bold text-trust">
                날짜
              </label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 h-12 w-full rounded-2xl border border-input bg-background px-4 font-semibold outline-none focus:ring-2 focus:ring-ring"
              />

              <p className="mt-3 text-xs font-bold text-trust">카테고리</p>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCategory(c.id)}
                    className={`rounded-2xl border px-2 py-3 text-xs font-bold transition-colors ${
                      category === c.id
                        ? "border-primary bg-primary-soft text-primary-deep"
                        : "border-border bg-card text-muted-foreground"
                    }`}
                  >
                    <span className="block text-lg">{c.emoji}</span>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-4 shadow-card">
              <h2 className="text-sm font-bold text-trust">누가 결제했나요?</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {trip.members.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setPayerId(m.id)}
                    className={`inline-flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3.5 text-sm font-bold transition-colors ${
                      payerId === m.id
                        ? "border-transparent bg-trust text-trust-foreground"
                        : "border-border bg-card text-muted-foreground"
                    }`}
                  >
                    <MemberAvatar name={m.name} tone={m.tone} size="sm" />
                    {m.name}
                    {m.id === ME ? " (나)" : ""}
                  </button>
                ))}
              </div>

              <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                <h2 className="text-sm font-bold text-trust">함께 쓴 사람</h2>
                <div className="grid grid-cols-2 rounded-xl bg-muted p-1 text-xs font-bold">
                  <button
                    onClick={() => setSplitMode("even")}
                    className={`rounded-lg px-3 py-1.5 ${splitMode === "even" ? "bg-card text-trust shadow-sm" : "text-muted-foreground"}`}
                  >
                    균등분할
                  </button>
                  <button
                    onClick={() => setSplitMode("custom")}
                    className={`rounded-lg px-3 py-1.5 ${splitMode === "custom" ? "bg-card text-trust shadow-sm" : "text-muted-foreground"}`}
                  >
                    직접 입력
                  </button>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                {trip.members.map((m) => {
                  const on = participants.includes(m.id);
                  return (
                    <div
                      key={m.id}
                      className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border p-2.5 transition-colors ${
                        on ? "border-primary/40 bg-primary-soft/50" : "border-border bg-card"
                      }`}
                    >
                      <button
                        onClick={() => toggleParticipant(m.id)}
                        aria-label={`${m.name} 선택`}
                        className={`grid h-6 w-6 place-items-center rounded-full border-2 ${
                          on ? "border-primary bg-primary text-primary-foreground" : "border-border"
                        }`}
                      >
                        {on ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}
                      </button>
                      <span className="flex min-w-0 items-center gap-2">
                        <MemberAvatar name={m.name} tone={m.tone} size="sm" />
                        <span className="truncate text-sm font-bold text-trust">{m.name}</span>
                      </span>
                      {splitMode === "even" || !on ? (
                        <span className="amount text-base text-trust">
                          {on ? formatCurrency(evenShare, trip.currency) : "—"}
                        </span>
                      ) : (
                        <input
                          inputMode="numeric"
                          value={custom[m.id] ?? ""}
                          placeholder={String(evenShare)}
                          onChange={(e) =>
                            setCustom((prev) => ({
                              ...prev,
                              [m.id]: e.target.value.replace(/[^\d]/g, ""),
                            }))
                          }
                          className="amount h-10 w-28 rounded-xl border border-input bg-background px-3 text-right text-base outline-none focus:ring-2 focus:ring-ring"
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {splitMode === "custom" ? (
                <p
                  className={`mt-3 rounded-xl px-3 py-2 text-xs font-bold ${
                    diff === 0 ? "bg-success-soft text-success" : "bg-primary-soft text-primary-deep"
                  }`}
                >
                  {diff === 0
                    ? "분할 금액이 정확히 맞아요."
                    : `${formatCurrency(Math.abs(diff), trip.currency)} ${diff > 0 ? "남았어요" : "초과했어요"}`}
                </p>
              ) : null}
            </div>
          </section>
        ) : null}
      </main>

      {step === "review" ? (
        <div className="fixed inset-x-0 bottom-0 border-t border-border bg-card/95 p-4 backdrop-blur">
          <div className="mx-auto flex max-w-xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-muted-foreground">저장할 금액</p>
              <p className="amount truncate text-2xl text-trust">
                {formatCurrency(total, trip.currency)}
              </p>
            </div>
            <Button
              className="h-12 rounded-2xl bg-sunset px-6 text-base font-bold shadow-float hover:opacity-95"
              onClick={() => {
                toast.success("지출이 등록되었어요", { description: merchant });
                navigate({ to: "/trips/$tripId", params: { tripId } });
              }}
            >
              <Wand2 className="h-5 w-5" />
              저장하기
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
