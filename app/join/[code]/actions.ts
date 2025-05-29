"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function setLeagueCodeAndRedirect(formData: FormData) {
  const code = formData.get("code") as string;
  const redirectUrl = formData.get("redirectUrl") as string;

  // Set the cookie
  const cookieStore = await cookies();
  cookieStore.set("pending_league_code", code, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60, // 1 hour
  });
  console.log("setLeagueCodeAndRedirect cookieStore-->", cookieStore);

  // Redirect to the auth page
  redirect(redirectUrl);
}
