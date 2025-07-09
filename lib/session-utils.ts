import { auth } from "@/lib/auth";
import { headers, cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function validateSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    return session;
  } catch (error) {
    // Session validation failed - clear invalid cookies and redirect
    console.log("Session validation failed, clearing cookies:", error);
    const cookieStore = await cookies();
    cookieStore.delete('better-auth.session_token');
    cookieStore.delete('better-auth.session_data');
    redirect('/auth/signin');
  }
}

export async function requireAuth() {
  const session = await validateSession();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }
  
  return session;
}

export async function requireVerifiedAuth() {
  const session = await requireAuth();
  
  if (!session.user.emailVerified) {
    redirect('/auth/signin?message=Please verify your email first');
  }
  
  return session;
} 