import React from "react";


export default function RulesPage() {
  return (
    <main className="min-h-svh p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mt-8 mb-8 animate-fade-in-slide-up">
          <h1 className="text-2xl font-bold text-neutral-800 mb-1">League Rules</h1>
          <p className=" text-neutral-600">
            23 June 2025
          </p>
        </div>

        <div className="prose prose-neutral max-w-none space-y-8">
          <section className="animate-fade-in-slide-up">
            <h2 className="text-xl font-semibold text-neutral-800 mb-4">How Challenges Work</h2>

            <div className="space-y-3">
              <div className="space-y-0.5">
                <p><strong>Who can you challenge?</strong></p>
                <p>Anyone up to 3 spots above you, or anyone below you</p>
              </div>
              <div className="space-y-0.5">
                <p><strong>How many challenges?</strong></p>
                <p>You can have 3 active challenges at once</p>
              </div>
              <div className="space-y-0.5">
                <p><strong>Response time:</strong></p>
                <p>5 days to accept or decline a challenge</p>
              </div>
              <div className="space-y-0.5">
                <p><strong>Match deadline:</strong></p>
                <p>Play within 5 days of accepting</p>
              </div>
            </div>
          </section>

          <section className="animate-fade-in-slide-up">
            <h2 className="text-xl font-semibold text-neutral-800 mb-4">Ranking Changes</h2>

            <div className="space-y-2">
              <p><strong>Beat someone above you →</strong> you swap places</p>
              <p><strong>Beat someone below you →</strong> rankings stay the same</p>
            </div>
          </section>

          <section className="animate-fade-in-slide-up">
            <h2 className="text-xl font-semibold text-neutral-800 mb-4">Challenge Limits</h2>

            <div className="space-y-2">
              <p>• Can&apos;t challenge the same person again for 1 week</p>
              <p>• Can&apos;t challenge someone who already has 3 pending challenges</p>
            </div>
          </section>

          <section className="animate-fade-in-slide-up">
            <h2 className="text-xl font-semibold text-neutral-800 mb-4">Rejecting Challenges</h2>

            <div className="space-y-2">
              <p>You can decline challenges, but if you reject 3 in a month without accepting any, you&apos;ll drop one rank.</p>
              <p><strong>Exception:</strong> Rankings change frequently, so if the challenger is now 6+ ranks below you, you won&apos;t be penalized</p>
            </div>
          </section>

          <section className="animate-fade-in-slide-up">
            <h2 className="text-xl font-semibold text-neutral-800 mb-4">Out of Town</h2>

            <div className="space-y-2 mb-4">
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