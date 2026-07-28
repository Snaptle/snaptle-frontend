import { BatteryMedium, Signal, Wifi } from "lucide-react";
import type { ReactNode } from "react";

/**
 * 데스크톱/태블릿(≥768px)에서만 스마트폰 목업 프레임을 씌워 보여주는 프레젠테이션 레이어.
 * 모바일에서는 프레임 없이 그대로 전체 화면으로 렌더링됩니다.
 * 순수 시각 레이어이며 라우팅/로직에는 관여하지 않습니다.
 */
export function DeviceFrame({ children }: { children: ReactNode }) {
  return (
    <div className="device-stage">
      <div className="device-shell">
        <div className="device-bezel">
          <div className="device-screen">
            <div className="device-statusbar" aria-hidden="true">
              <span className="amount text-[13px]">9:41</span>
              <div className="device-notch" />
              <div className="flex items-center gap-1.5">
                <Signal className="h-3.5 w-3.5" strokeWidth={2.4} />
                <Wifi className="h-3.5 w-3.5" strokeWidth={2.4} />
                <BatteryMedium className="h-4 w-4" strokeWidth={2.2} />
              </div>
            </div>
            <div className="device-viewport">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
