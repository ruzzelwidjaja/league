"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import * as motion from "motion/react-client";
import Image from "next/image";

export default function HomePage() {
  // This page now only shows the landing page for unauthenticated users
  // Authenticated users are redirected to /join by middleware

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        ease: "easeOut"
      }
    }
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: -20,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const buttonVariants = {
    hidden: {
      opacity: 0,
      y: -20,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: 0.1
      }
    }
  };

  return (
    <motion.main
      className="relative overflow-hidden px-6 py-8 min-h-svh flex items-center"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="mx-auto max-w-4xl w-full">
        {/* Logo */}
        <motion.div className="mb-6" variants={itemVariants}>
          <Image
            src="/PingPongIcon.png"
            alt="Ping Pong Icon"
            width={56}
            height={56}
          />
        </motion.div>

        {/* Main heading */}
        <motion.h1
          className="mb-6 text-4xl font-medium tracking-tight text-neutral-800 sm:text-5xl"
          variants={itemVariants}
        >
          Ping Pong League
          <span className="text-neutral-500 text-2xl sm:text-3xl font-normal ml-1"> @WeWork</span>
        </motion.h1>

        {/* Description */}
        <motion.p
          className="mb-10 max-w-lg text-lg text-neutral-600 leading-relaxed"
          variants={itemVariants}
        >
          A simple ladder system for ping pong enthusiasts.
          Challenge colleagues and track your progress.
        </motion.p>

        {/* Action buttons */}
        <motion.div
          className="flex flex-col gap-4 sm:flex-row"
          variants={containerVariants}
        >
          <motion.div variants={buttonVariants}>
            <Button
              asChild
              size="lg"
              className="group px-8 py-4 text-base font-medium transition-all duration-300 w-full sm:w-auto"
            >
              <Link href="/auth/signup">
                Join the League
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>

          <motion.div variants={buttonVariants}>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="px-8 py-4 text-base font-medium border border-neutral-300 text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50 transition-all duration-300 w-full sm:w-auto"
            >
              <Link href="/auth/signin">
                Already a Player?
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Subtle background decoration */}
      <motion.div
        className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-neutral-100/40 to-stone-100/40 blur-3xl"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
      />
      <motion.div
        className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-stone-100/40 to-neutral-100/40 blur-3xl"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, delay: 1.0, ease: "easeOut" }}
      />
    </motion.main>
  );
}