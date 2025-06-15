import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function setLeagueCodeCookie(code: string) {
  const cookieStore = await cookies();
  cookieStore.set("pending_league_code", code, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });
}

export async function getLeagueCodeCookie(): Promise<string | null> {
  console.log("Getting league code cookie....");
  const cookieStore = await cookies();
  const leagueCode = cookieStore.get("pending_league_code");
  return leagueCode?.value || null;
}

export async function clearLeagueCodeCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("pending_league_code");
}

export async function redirectToAuth(code: string, authType: 'signin' | 'signup') {
  await setLeagueCodeCookie(code);
  redirect(`/auth/${authType}?league=${code}&callbackUrl=${encodeURIComponent(`/auth/verify-callback`)}`);
} 