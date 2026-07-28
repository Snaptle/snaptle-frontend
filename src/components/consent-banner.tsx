import { ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

import { getConsentStatus, loadClarity, setConsentStatus } from "@/lib/clarity";

/**
 * 최초 방문 시 노출되는 데이터 수집 동의 팝업.
 * "동의"를 눌러야 Clarity(사용자 행동 분석) 스크립트가 로드되며,
 * "취소"를 누르면 로드되지 않고 다시 묻지 않는다(로컬 저장된 선택 존중).
 */
export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const status = getConsentStatus();
    if (status === "granted") {
      loadClarity();
    } else if (status === null) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40" />
      <div className="ticket-notch relative rounded-t-[1.75rem] border-t border-border bg-card p-5 shadow-float">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-trust-soft text-trust">
            <ShieldCheck className="h-5 w-5" strokeWidth={2.2} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-trust">더 나은 서비스를 위해 사용자 데이터를 수집하고 있습니다</p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              화면 이용 방식(클릭, 이동 경로 등)을 분석해 서비스를 개선하는 데만 사용해요. 결제·계좌 정보는
              수집하지 않습니다. 동의하시겠습니까?
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setConsentStatus("denied");
              setVisible(false);
            }}
            className="h-11 rounded-full border border-border bg-card text-sm font-bold text-muted-foreground active:scale-95"
          >
            취소
          </button>
          <button
            type="button"
            onClick={() => {
              setConsentStatus("granted");
              setVisible(false);
            }}
            className="h-11 rounded-full bg-sunset text-sm font-bold text-primary-foreground active:scale-95"
          >
            동의
          </button>
        </div>
      </div>
    </div>
  );
}
