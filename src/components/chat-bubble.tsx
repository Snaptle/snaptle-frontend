import { MessageCircle, Send, X } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

type ChatMessage = {
  id: string;
  from: "admin" | "me";
  text: string;
};

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: "m1", from: "admin", text: "안녕하세요! Snaptle 운영팀이에요 🙂 무엇을 도와드릴까요?" },
];

const AUTO_REPLY = "문의 감사해요! 확인하고 빠르게 답변드릴게요.";

/**
 * 여행 상세 페이지가 아닌 화면(내 여행 목록, 밀린 정산)에서 노출되는 문의 채팅 버튼.
 * 실제 상담원 연결은 없는 프로토타입 목업이며, 순수 프런트 상태로만 동작한다.
 */
export function ChatBubble() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [draft, setDraft] = useState("");

  function send() {
    const text = draft.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), from: "me", text }]);
    setDraft("");
    window.setTimeout(() => {
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), from: "admin", text: AUTO_REPLY }]);
    }, 900);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="관리자에게 문의하기"
        className={cn(
          "fixed bottom-24 right-6 z-40 h-14 w-14 items-center justify-center rounded-full bg-trust text-trust-foreground shadow-float active:scale-95",
          open ? "hidden" : "flex",
        )}
      >
        <MessageCircle className="h-6 w-6" strokeWidth={2.4} />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <button
            type="button"
            aria-label="닫기"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="ticket-notch relative flex max-h-[70%] flex-col overflow-hidden rounded-t-[1.75rem] border-t border-border bg-card shadow-float">
            <div className="flex items-center justify-between border-b border-border/70 bg-trust px-4 py-3.5 text-trust-foreground">
              <div>
                <p className="text-sm font-bold">Snaptle 문의하기</p>
                <p className="text-[11px] opacity-80">보통 몇 분 안에 답변드려요</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="채팅 닫기"
                className="rounded-full p-1.5 hover:bg-card/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn("flex", m.from === "me" ? "justify-end" : "justify-start")}
                >
                  <p
                    className={cn(
                      "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm font-medium",
                      m.from === "me"
                        ? "rounded-br-sm bg-primary text-primary-foreground"
                        : "rounded-bl-sm bg-trust-soft text-trust",
                    )}
                  >
                    {m.text}
                  </p>
                </div>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="flex items-center gap-2 border-t border-border/70 p-3"
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="메시지를 입력하세요"
                className="h-11 flex-1 rounded-full border border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="submit"
                aria-label="전송"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground hover:bg-primary-deep active:scale-95"
              >
                <Send className="h-4.5 w-4.5" strokeWidth={2.4} />
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
