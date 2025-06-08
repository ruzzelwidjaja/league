import React from "react";
import { Suspense } from "react";
import Link from "next/link";
import SignUpForm from "./SignUpForm";
import * as motion from "motion/react-client";

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <motion.div
        className="max-w-md w-full"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.6,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
      >
        <Suspense fallback={<div>Loading...</div>}>
          <SignUpForm />
        </Suspense>

        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-600">
            Already have an account?{" "}
            <Link
              href="/auth/signin"
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
} 