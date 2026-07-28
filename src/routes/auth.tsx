import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, MessageCircle, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PlaneDoodle, SnaptleLogo } from "@/components/brand";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "로그인 · Snaptle" },
      {
        name: "description",
        content: "이메일 또는 카카오 계정으로 Snaptle에 로그인하고 여행 정산을 시작하세요.",
      },
      { property: "og:title", content: "로그인 · Snaptle" },
      { property: "og:description", content: "이메일 또는 카카오로 3초 만에 시작하기." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden border-b border-border/70 px-6 pb-10 pt-10 text-foreground">
        <PlaneDoodle className="absolute -right-4 top-4 h-24 w-40 text-primary/15" />
        <SnaptleLogo />
        <h1 className="mt-6 text-2xl font-semibold leading-tight text-trust">
          같이 떠나고,
          <br />
          정산은 알아서.
        </h1>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">
          영수증을 올리면 AI가 금액·가맹점·통화를 읽고, 여행이 끝나면 송금 목록까지 만들어드려요.
        </p>
      </div>

      <div className="mx-auto max-w-md px-4 pb-12 pt-8">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="grid grid-cols-2 rounded-xl bg-muted p-1">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`h-10 rounded-lg text-sm font-bold transition-colors ${
                  mode === m ? "bg-card text-trust shadow-sm" : "text-muted-foreground"
                }`}
              >
                {m === "login" ? "로그인" : "회원가입"}
              </button>
            ))}
          </div>

          <form
            className="mt-5 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              toast.success(mode === "login" ? "로그인되었어요" : "가입이 완료되었어요");
            }}
          >
            {mode === "signup" ? (
              <Field id="name" label="이름" type="text" placeholder="지현" />
            ) : null}
            <Field id="email" label="이메일" type="email" placeholder="you@snaptle.app" />
            <Field id="password" label="비밀번호" type="password" placeholder="••••••••" />
            <Button type="submit" className="h-12 w-full rounded-lg text-base font-medium">
              <Mail className="h-5 w-5" />
              {mode === "login" ? "이메일로 로그인" : "이메일로 가입하기"}
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs font-semibold text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            또는
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button
            className="h-12 w-full rounded-lg bg-kakao text-base font-medium text-kakao-foreground hover:bg-kakao/90"
            onClick={() => toast.success("카카오로 로그인했어요")}
          >
            <MessageCircle className="h-5 w-5 fill-current" />
            카카오로 시작하기
          </Button>

          <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-teal" />
            금액 정보는 여행 멤버에게만 공개돼요.
          </p>
        </div>

        <Link
          to="/"
          className="mt-4 block text-center text-sm font-semibold text-muted-foreground underline-offset-4 hover:underline"
        >
          둘러보기로 계속하기
        </Link>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  type,
  placeholder,
}: {
  id: string;
  label: string;
  type: string;
  placeholder: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-xs font-bold text-trust">
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        className="mt-1 h-12 w-full rounded-lg border border-input bg-background px-4 text-base outline-none placeholder:text-muted-foreground focus:border-trust focus:ring-0"
      />
    </div>
  );
}
