import React from "react";
import { withAuth, signOut } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function DashboardPage() {
  const { user } = await withAuth({ ensureSignedIn: true });

  if (!user) {
    redirect("/");
  }

  const supabase = createClient();

  // Get user's data from Supabase
  const { data: dbUser } = await (await supabase)
    .from("users")
    .select("id")
    .eq("workos_user_id", user.id)
    .single();

  // Get user's leagues
  const { data: leagues } = await (
    await supabase
  )
    .from("league_members")
    .select(
      `
      league_id,
      rank,
      leagues (
        id,
        name,
        join_code
      )
    `,
    )
    .eq("user_id", dbUser?.id);

  return (
    <main className="min-h-screen p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p>Welcome, {user.email}!</p>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut();
          }}
        >
          <button
            type="submit"
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Sign Out
          </button>
        </form>
      </div>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Your Leagues</h2>
        {leagues && leagues.length > 0 ? (
          <div className="space-y-4">
            {leagues.map((membership) => (
              <Link
                key={membership.league_id}
                href={`/league/${membership.league_id}`}
                className="block border p-4 rounded hover:bg-gray-50"
              >
                <h3 className="font-semibold">{membership.leagues[0]?.name}</h3>
                <p>Your rank: #{membership.rank}</p>
                <p className="text-sm text-gray-500">
                  Code: {membership.leagues[0]?.join_code}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <p>You haven&apos;t joined any leagues yet.</p>
        )}
      </section>
    </main>
  );
}
