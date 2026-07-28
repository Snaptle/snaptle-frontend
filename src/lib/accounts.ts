/**
 * 프로토타입 데모용 계좌 정보 저장소. 실제 서비스에서는 계좌번호를 서버에 수집/저장하지 않으며,
 * 이 값은 브라우저 로컬(localStorage)에만 남아 토스 송금 딥링크 프리필 용도로만 쓰인다.
 */

export type BankOption = { code: string; name: string };

export const BANKS: BankOption[] = [
  { code: "092", name: "토스뱅크" },
  { code: "090", name: "카카오뱅크" },
  { code: "088", name: "신한은행" },
  { code: "004", name: "국민은행" },
  { code: "020", name: "우리은행" },
  { code: "081", name: "하나은행" },
  { code: "011", name: "농협은행" },
  { code: "003", name: "기업은행" },
  { code: "045", name: "새마을금고" },
];

export type Account = {
  bankCode: string;
  bankName: string;
  accountNo: string;
};

function storageKey(memberId: string) {
  return `snaptle:account:${memberId}`;
}

export function getAccount(memberId: string): Account | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey(memberId));
    return raw ? (JSON.parse(raw) as Account) : null;
  } catch {
    return null;
  }
}

export function saveAccount(memberId: string, account: Account) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey(memberId), JSON.stringify(account));
}

/** 토스 송금 딥링크. 토스 앱이 설치되어 있으면 은행/계좌/금액이 프리필된 송금 화면이 열린다. */
export function buildTossSendLink(account: Account, amount: number, message?: string): string {
  const params = new URLSearchParams({
    bank: account.bankCode,
    accountNo: account.accountNo,
    amount: String(Math.round(amount)),
    origin: "Snaptle",
  });
  if (message) params.set("msg", message);
  return `supertoss://send?${params.toString()}`;
}
