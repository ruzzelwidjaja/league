import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IoIosArrowBack } from "react-icons/io";


export default function RulesPage() {
  return (
    <main className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 animate-fade-in-slide-up">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/join">
              <IoIosArrowBack className="w-4 h-4" /> Back to League
            </Link>
          </Button>

          <h1 className="text-3xl font-bold text-neutral-800 mb-2">League Rules</h1>
          <p className="text-neutral-600">
            Everything you need to know to play in the ping pong league
          </p>
        </div>

        <div className="prose prose-neutral max-w-none space-y-8">
          <section className="animate-fade-in-slide-up">
            <h2 className="text-xl font-semibold text-neutral-800 mb-4">How Challenges Work</h2>

            <div className="space-y-3">
              <p><strong>Who can you challenge?</strong> Anyone up to 3 spots above you, or anyone below you</p>
              <p><strong>How many challenges?</strong> You can have 3 active challenges at once</p>
              <p><strong>Response time:</strong> 5 days to accept or decline a challenge</p>
              <p><strong>Match deadline:</strong> Play within 5 days of accepting</p>
            </div>
          </section>

          <section className="animate-fade-in-slide-up">
            <h2 className="text-xl font-semibold text-neutral-800 mb-4">Ranking Changes</h2>

            <div className="space-y-3">
              <p><strong>Beat someone above you →</strong> you swap places</p>
              <p><strong>Beat someone below you →</strong> rankings stay the same</p>
            </div>
          </section>

          <section className="animate-fade-in-slide-up">
            <h2 className="text-xl font-semibold text-neutral-800 mb-4">Challenge Limits</h2>

            <div className="space-y-3">
              <p>• Can&apos;t challenge the same person again for 1 week</p>
              <p>• Can&apos;t challenge someone who already has 3 pending challenges</p>
            </div>
          </section>

          <section className="animate-fade-in-slide-up">
            <h2 className="text-xl font-semibold text-neutral-800 mb-4">Rejecting Challenges</h2>

            <div className="space-y-3">
              <p>You can decline challenges, but if you reject 3 in a month without accepting any, you&apos;ll drop one rank.</p>
              <p><strong>Exception:</strong> Rankings change frequently, so if the challenger is now 6+ ranks below you, you won&apos;t be penalized</p>
            </div>
          </section>

          <section className="animate-fade-in-slide-up">
            <h2 className="text-xl font-semibold text-neutral-800 mb-4">Out of Town</h2>

            <div className="space-y-3">
              <p>Going away? Set yourself &quot;Out of Town&quot; for up to 14 days per season.</p>
              <p>This will automatically decline any pending challenges without penalty.</p>
            </div>
          </section>

          {/* <section className="animate-fade-in-slide-up">
            <h2 className="text-xl font-semibold text-neutral-800 mb-4">Season Format</h2>

            <p><strong>6 months → Top 8 players make playoffs</strong></p>
          </section> */}
        </div>
      </div>
    </main>
  );
} 