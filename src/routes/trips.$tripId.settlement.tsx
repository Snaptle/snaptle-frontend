import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Landmark,
  Share2,
  TicketCheck,
  Wallet,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { MemberAvatar } from "@/components/member-avatar";
import { Button } from "@/components/ui/button";
import { BANKS, buildTossSendLink, getAccount, saveAccount, type Account } from "@/lib/accounts";
import { trackEvent } from "@/lib/clarity";
import { getTrip, ME, type Member } from "@/lib/mock-data";
import {
  computeBalances,
  computeTransfers,
  formatCurrency,
  formatDateRange,
  totalSpend,
  type Balance,
  type Transfer,
} from "@/lib/settlement";

/** 잔액을 1인칭(본인)/3인칭(다른 멤버) 관점의 단일 행동 문장으로 풀어준다. */
function describeBalance(member: Member, transfers: Transfer[], isMe: boolean, currency: string): string {
  const outgoing = transfers.filter((t) => t.from.id === member.id);
  const incoming = transfers.filter((t) => t.to.id === member.id);
  const who = isMe ? "당신이" : `${member.name}님이`;

  if (outgoing.length > 0) {
    const parts = outgoing.map((t) => `${t.to.name}님에게 ${formatCurrency(t.amount, currency)}`);
    return `${who} ${parts.join(", ")} 보내면 끝이에요.`;
  }
  if (incoming.length > 0) {
    const parts = incoming.map((t) => `${t.from.name}님에게서 ${formatCurrency(t.amount, currency)}`);
    return `${who} ${parts.join(", ")} 받으면 끝이에요.`;
  }
  return `${who} 이미 정확히 정산됐어요. 더 보내거나 받을 돈이 없어요.`;
}

export const Route = createFileRoute("/trips/$tripId/settlement")({
  head: () => ({
    meta: [
      { title: "정산 결과 · Snaptle" },
      {
        name: "description",
        content: "여행이 끝나면 각자 낸 금액과 최종 송금 목록을 한눈에 확인하세요.",
      },
      { property: "og:title", content: "정산 결과 · Snaptle" },
      { property: "og:description", content: "누가 누구에게 얼마를 보내면 되는지 자동 계산." },
    ],
  }),
  component: SettlementPage,
});

function SettlementPage() {
  const { tripId } = Route.useParams();
  const trip = getTrip(tripId);
  const [accountVersion, setAccountVersion] = useState(0);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  useEffect(() => {
    if (trip) trackEvent("settlement_view");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  if (!trip) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Link to="/" className="text-sm font-semibold text-primary underline">
          여행 목록으로
        </Link>
      </div>
    );
  }

  const balances = computeBalances(trip);
  const transfers = computeTransfers(balances);

  function payWithToss(t: Transfer) {
    const account = getAccount(t.to.id);
    if (!account) {
      setEditingMemberId(t.to.id);
      toast.info(`${t.to.name}님의 계좌를 먼저 등록해주세요`);
      return;
    }
    trackEvent("toss_pay_click");
    const link = buildTossSendLink(account, t.amount, `${trip!.name} 정산`);
    window.location.href = link;
  }

  function handleSave(memberId: string, account: Account) {
    saveAccount(memberId, account);
    setAccountVersion((v) => v + 1);
    setEditingMemberId(null);
    toast.success("계좌가 등록됐어요");
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <header className="bg-trust-gradient px-4 pb-8 pt-4 text-trust-foreground">
        <div className="mx-auto max-w-xl">
          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2">
            <Link
              to="/trips/$tripId"
              params={{ tripId }}
              aria-label="뒤로"
              className="rounded-full p-1.5 hover:bg-card/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <span className="truncate text-sm font-semibold opacity-80">{trip.name}</span>
          </div>

          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-card/15 px-3 py-1 text-xs font-bold">
            <CheckCircle2 className="h-3.5 w-3.5" />
            여행 종료 · 정산 완료
          </span>
          <h1 className="mt-3 text-3xl font-extrabold text-trust-foreground">정산 결과</h1>
          <p className="mt-1 text-sm opacity-80">
            {formatDateRange(trip.startDate, trip.endDate)} · {trip.members.length}명
          </p>

          <div className="mt-5 rounded-2xl bg-card/12 p-4">
            <p className="text-[11px] font-semibold opacity-75">여행 총 지출</p>
            <p className="amount mt-0.5 text-4xl">{formatCurrency(totalSpend(trip), trip.currency)}</p>
            <p className="mt-1 text-xs opacity-75">
              1인 평균 {formatCurrency(Math.round(totalSpend(trip) / trip.members.length), trip.currency)}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 pt-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          멤버별 정산 내역
        </h2>
        <div className="mt-3 space-y-2">
          {balances.map((b) => (
            <BalanceCard
              key={b.member.id}
              balance={b}
              transfers={transfers}
              currency={trip.currency}
              isMe={b.member.id === ME}
            >
              {b.member.id === ME ? (
                <MyAccountRow
                  key={accountVersion}
                  member={b.member}
                  editing={editingMemberId === b.member.id}
                  onEditToggle={() =>
                    setEditingMemberId((cur) => (cur === b.member.id ? null : b.member.id))
                  }
                  onSave={(account) => handleSave(b.member.id, account)}
                />
              ) : null}
            </BalanceCard>
          ))}
        </div>

        <h2 className="mt-8 text-sm font-bold uppercase tracking-wider text-muted-foreground">
          최종 송금 목록 · {transfers.length}건
        </h2>
        <div className="mt-3 space-y-3">
          {transfers.map((t, i) => (
            <div
              key={i}
              className="ticket-notch overflow-hidden rounded-3xl border border-trust/15 bg-card shadow-card"
            >
              <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 p-4">
                <div className="flex min-w-0 flex-col items-center gap-1.5">
                  <MemberAvatar name={t.from.name} tone={t.from.tone} size="lg" />
                  <span className="truncate text-sm font-bold text-trust">{t.from.name}</span>
                </div>
                <ArrowRight className="h-6 w-6 shrink-0 text-primary" strokeWidth={2.6} />
                <div className="flex min-w-0 flex-col items-center gap-1.5">
                  <MemberAvatar name={t.to.name} tone={t.to.tone} size="lg" />
                  <span className="truncate text-sm font-bold text-trust">{t.to.name}</span>
                </div>
              </div>
              <div className="border-t border-dashed border-border bg-trust-soft/60 px-4 py-3 text-center">
                <p className="amount text-3xl text-trust">
                  {formatCurrency(t.amount, trip.currency)}
                </p>
                <p className="mt-0.5 text-xs font-semibold text-muted-foreground">
                  {t.from.name} → {t.to.name} 보내기
                </p>
              </div>

              {editingMemberId === t.to.id ? (
                <div className="border-t border-dashed border-border p-4">
                  <AccountForm
                    key={accountVersion}
                    memberName={t.to.name}
                    isSelf={t.to.id === ME}
                    initial={getAccount(t.to.id)}
                    onCancel={() => setEditingMemberId(null)}
                    onSave={(account) => {
                      saveAccount(t.to.id, account);
                      setAccountVersion((v) => v + 1);
                      setEditingMemberId(null);
                      trackEvent("toss_pay_click");
                      window.location.href = buildTossSendLink(account, t.amount, `${trip.name} 정산`);
                    }}
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => payWithToss(t)}
                  className="flex w-full items-center justify-center gap-2 border-t border-border/70 bg-card px-4 py-3.5 text-sm font-bold text-trust transition-colors hover:bg-trust-soft"
                >
                  <Wallet className="h-4 w-4" />
                  각자 결제하기 · 토스로 보내기
                </button>
              )}
            </div>
          ))}

          {transfers.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
              주고받을 금액이 없어요. 이미 딱 맞게 정산되었습니다.
            </p>
          ) : null}
        </div>

        <div className="mt-8 grid gap-2">
          <Button
            className="h-13 rounded-full bg-sunset text-base font-bold shadow-float hover:opacity-95"
            onClick={() => {
              trackEvent("share_click");
              toast.success("정산 결과를 공유했어요");
            }}
          >
            <Share2 className="h-5 w-5" />
            정산 결과 공유하기
          </Button>
          <Button
            variant="outline"
            className="h-13 rounded-full border-trust/25 bg-card text-base font-bold text-trust hover:bg-trust-soft"
            onClick={() => toast.success("모든 송금을 완료 처리했어요")}
          >
            <TicketCheck className="h-5 w-5" />
            송금 완료로 표시
          </Button>
        </div>
      </main>
    </div>
  );
}

function BalanceCard({
  balance,
  transfers,
  currency,
  isMe,
  children,
}: {
  balance: Balance;
  transfers: Transfer[];
  currency: string;
  isMe: boolean;
  children?: ReactNode;
}) {
  const [detailOpen, setDetailOpen] = useState(false);
  const b = balance;

  return (
    <div className="rounded-[1.5rem] border border-border/70 bg-card p-4 shadow-card">
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
        <MemberAvatar name={b.member.name} tone={b.member.tone} size="lg" />
        <div className="min-w-0">
          <p className="truncate font-bold text-trust">
            {b.member.name}
            {isMe ? " (나)" : ""}
          </p>
          <p className="mt-0.5 line-clamp-2 text-xs font-semibold text-trust">
            {describeBalance(b.member, transfers, isMe, currency)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-semibold text-muted-foreground">
            {b.net >= 0 ? "받을 돈" : "보낼 돈"}
          </p>
          <p className={`amount text-xl ${b.net >= 0 ? "text-teal" : "text-primary-deep"}`}>
            {formatCurrency(Math.abs(b.net), currency)}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setDetailOpen((v) => !v)}
        className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-muted-foreground"
      >
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${detailOpen ? "rotate-180" : ""}`} />
        자세히 보기
      </button>

      {detailOpen ? (
        <p className="mt-1 text-xs text-muted-foreground">
          낸 돈 {formatCurrency(b.paid, currency)} · 쓴 돈 {formatCurrency(b.owed, currency)}
        </p>
      ) : null}

      {children}
    </div>
  );
}

function MyAccountRow({
  member,
  editing,
  onEditToggle,
  onSave,
}: {
  member: Member;
  editing: boolean;
  onEditToggle: () => void;
  onSave: (account: Account) => void;
}) {
  const account = getAccount(member.id);

  return (
    <div className="mt-3 border-t border-dashed border-border/70 pt-3">
      {editing ? (
        <AccountForm memberName="내" isSelf initial={account} onCancel={onEditToggle} onSave={onSave} />
      ) : (
        <button
          type="button"
          onClick={onEditToggle}
          className="flex w-full items-center gap-2 rounded-xl bg-trust-soft/60 px-3 py-2.5 text-left text-xs font-semibold text-trust"
        >
          <Landmark className="h-3.5 w-3.5 shrink-0" />
          {account ? (
            <span className="truncate">
              내 계좌 {account.bankName} {maskAccountNo(account.accountNo)} · 수정하기
            </span>
          ) : (
            <span>다른 사람이 나에게 보낼 수 있도록 내 계좌를 등록해주세요</span>
          )}
        </button>
      )}
    </div>
  );
}

function AccountForm({
  memberName,
  isSelf = false,
  initial,
  onCancel,
  onSave,
}: {
  memberName: string;
  isSelf?: boolean;
  initial: Account | null;
  onCancel: () => void;
  onSave: (account: Account) => void;
}) {
  const [bankCode, setBankCode] = useState(initial?.bankCode ?? BANKS[0].code);
  const [accountNo, setAccountNo] = useState(initial?.accountNo ?? "");

  function submit() {
    const digitsOnly = accountNo.replace(/[^0-9]/g, "");
    if (digitsOnly.length < 4) {
      toast.error("계좌번호를 확인해주세요");
      return;
    }
    const bank = BANKS.find((b) => b.code === bankCode) ?? BANKS[0];
    onSave({ bankCode: bank.code, bankName: bank.name, accountNo: digitsOnly });
  }

  return (
    <div className="space-y-2 rounded-xl bg-trust-soft/60 p-3">
      <p className="text-[11px] font-bold text-trust">{memberName} 계좌 등록</p>
      {!isSelf ? (
        <p className="text-[11px] text-muted-foreground">
          {memberName}에게 물어보고 계좌를 입력해주세요. 송금 링크를 만드는 데만 쓰이고, 이
          기기에만 저장돼요.
        </p>
      ) : null}
      <div className="flex gap-2">
        <select
          value={bankCode}
          onChange={(e) => setBankCode(e.target.value)}
          className="h-10 rounded-xl border border-input bg-card px-2 text-xs font-semibold text-trust outline-none focus:ring-2 focus:ring-ring"
        >
          {BANKS.map((bank) => (
            <option key={bank.code} value={bank.code}>
              {bank.name}
            </option>
          ))}
        </select>
        <input
          value={accountNo}
          onChange={(e) => setAccountNo(e.target.value)}
          inputMode="numeric"
          placeholder="계좌번호"
          className="h-10 min-w-0 flex-1 rounded-xl border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={submit}
          className="h-9 flex-1 rounded-full bg-sunset text-xs font-bold text-primary-foreground active:scale-95"
        >
          저장
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="h-9 flex-1 rounded-full border border-border bg-card text-xs font-bold text-muted-foreground active:scale-95"
        >
          취소
        </button>
      </div>
    </div>
  );
}

function maskAccountNo(accountNo: string): string {
  if (accountNo.length <= 4) return accountNo;
  return `${"*".repeat(accountNo.length - 4)}${accountNo.slice(-4)}`;
}
