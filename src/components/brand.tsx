import { cn } from "@/lib/utils";

/**
 * Snaptle 심볼: 영수증 / 보딩패스 티켓 모티프.
 * "사진으로 찍든 자동으로 들어오든, 결국 하나의 기록된 거래"
 */
export function TicketMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={cn("h-9 w-9", className)} aria-hidden="true">
      <path
        d="M5 11a3 3 0 0 1 3-3h24a3 3 0 0 1 3 3v4.2a3.6 3.6 0 0 0 0 7.2V29a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-6.6a3.6 3.6 0 0 0 0-7.2V11Z"
        fill="currentColor"
      />
      <path
        d="M24.5 9.5v21"
        stroke="var(--card)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeDasharray="2.4 3"
      />
      <path
        d="M10 16.5h10M10 21h7.5"
        stroke="var(--card)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="29.6" cy="20" r="2.6" stroke="var(--card)" strokeWidth="1.8" />
    </svg>
  );
}

export function SnaptleLogo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sunset text-primary-foreground shadow-float">
        <TicketMark className="h-7 w-7 text-primary-foreground" />
      </span>
      <span className="font-display text-xl font-extrabold tracking-tight text-trust">Snaptle</span>
    </span>
  );
}

/** 빈 상태 / 로딩용 비행기 모티프 (가볍게만 사용) */
export function PlaneDoodle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 80" fill="none" className={cn("h-20 w-32", className)} aria-hidden="true">
      <path
        d="M6 62c18-6 34-16 48-28"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="4 6"
        opacity="0.45"
      />
      <path
        d="M104 14 62 36l-14-5-8 5 11 8-2 12 8-4 4-11 21 14 5-31c1-6-2-9-7-6Z"
        fill="currentColor"
      />
    </svg>
  );
}
