import { Link } from "@tanstack/react-router";
import { Plane, Receipt, Wallet } from "lucide-react";
import type { ReactNode } from "react";

import { SnaptleLogo } from "@/components/brand";
import { MemberAvatar } from "@/components/member-avatar";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "내 여행", icon: Plane },
  { to: "/debts", label: "개인 채무", icon: Wallet },
] as const;

export function AppShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto grid max-w-xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
          <Link to="/" className="min-w-0">
            <SnaptleLogo />
          </Link>
          <Link to="/auth" aria-label="계정" className="shrink-0">
            <MemberAvatar name="지현" tone={0} />
          </Link>
        </div>
      </header>

      <main className={cn("mx-auto max-w-xl px-4 pt-5", className)}>{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-xl items-stretch">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="group flex flex-1 flex-col items-center gap-1 py-3 text-xs font-semibold text-muted-foreground transition-colors data-[status=active]:text-primary"
            >
              <item.icon className="h-5 w-5" strokeWidth={2.2} />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

export function PageTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-extrabold text-trust">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
      <Receipt className="h-3.5 w-3.5" />
      {children}
    </div>
  );
}
