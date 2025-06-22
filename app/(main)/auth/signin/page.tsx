import React from "react";
import { Suspense } from "react";
import Link from "next/link";
import SignInForm from "./SignInForm";
import * as motion from "motion/react-client";
import Image from "next/image";
import PingPongIcon from "@/public/PingPongIcon.png";

export default function SignInPage() {
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
        {/* Logo */}
        <div className="mb-8 text-center">
          <Image
            src={PingPongIcon}
            alt="Ping Pong Icon"
            width={56}
            height={56}
            className="mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold mb-2 text-neutral-800">
            Welcome Back
          </h1>
          <p className="text-neutral-600">
            Sign in to your account
          </p>
        </div>

        <Suspense fallback={<div>Loading...</div>}>
          <SignInForm />
        </Suspense>

        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="text-primary hover:underline font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
} 