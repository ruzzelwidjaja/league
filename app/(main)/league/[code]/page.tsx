/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { InfoBox } from "@/components/ui/info-box";
import UserDropdown from "./UserDropdown";
import * as motion from "motion/react-client";
import { headers } from "next/headers";

export default async function LeaguePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Check if email is verified
  if (!session.user.emailVerified) {
    redirect("/auth/signin?message=Please verify your email first");
  }

  // Get league and check membership using direct database queries
  const { Pool } = await import("pg");
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Get league by code
    const leagueResult = await pool.query(`
      SELECT id, name, description, "joinCode", "seasonStart", "seasonEnd", "createdBy", "createdAt"
      FROM leagues 
      WHERE "joinCode" = $1
    `, [code]);

    if (leagueResult.rows.length === 0) {
      await pool.end();
      return <div>League not found</div>;
    }

    const league = leagueResult.rows[0];

    // Check if user is member
    const membershipResult = await pool.query(`
      SELECT id 
      FROM league_members 
      WHERE "userId" = $1 AND "leagueId" = $2
    `, [session.user.id, league.id]);

    const isUserMember = membershipResult.rows.length > 0;

    if (!isUserMember) {
      await pool.end();
      redirect(`/join/${code}`);
    }

    // Get all members with user details - sorted by newest players first (most recent join date)
    const membersResult = await pool.query(`
      SELECT 
        lm.id,
        lm.rank,
        lm."skillTier",
        lm.status,
        lm."joinedAt",
        lm."userId",
        u.id as user_id,
        u."firstName",
        u."lastName",
        u."organizationName",
        u."profilePictureUrl"
      FROM league_members lm
      JOIN "user" u ON lm."userId" = u.id
      WHERE lm."leagueId" = $1
      ORDER BY lm."joinedAt" DESC, lm.rank ASC
    `, [league.id]);

    await pool.end();

    const members = membersResult.rows;

    const formatJoinDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    };

    const getInitials = (firstName?: string | null, lastName?: string | null) => {
      if (firstName && lastName) {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
      }
      if (firstName) {
        return firstName.charAt(0).toUpperCase();
      }
      return "U";
    };

    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.25,
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
        transition: {
          duration: 0.4,
          ease: [0.25, 0.46, 0.45, 0.94]
        }
      }
    };

    return (
      <motion.main
        className="min-h-screen p-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <motion.div
            className="flex justify-between items-start mb-6 gap-4"
            variants={itemVariants}
          >
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{league.name}</h1>
              <p className="text-sm text-gray-500 mt-1">Code: {league.joinCode} • {members?.length || 0} players</p>
            </div>
            <div className="mt-2">
              <UserDropdown user={session.user} />
            </div>
          </motion.div>

          {/* Info Box */}
          <motion.div variants={itemVariants}>
            <InfoBox className="mb-8 text-sm text-muted-foreground p-4">
              We are currently registering players. You will receive an email once the league is ready to start.
            </InfoBox>
          </motion.div>

          {/* Players List */}
          <motion.div variants={itemVariants}>
            <div className="mb-3">
              <h2 className="font-medium text-gray-900">Players</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {members?.map((member: any) => (
                <div
                  key={member.id}
                  className="py-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10">
                      <AvatarImage
                        src={member.profilePictureUrl}
                        alt={`${member.firstName} ${member.lastName}`}
                      />
                      <AvatarFallback className="text-xs font-medium bg-primary text-primary-foreground">
                        {getInitials(member.firstName, member.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {member.firstName} {member.lastName}
                        </p>
                        {member.user_id === session.user.id && (
                          <div className="bg-primary text-primary-foreground px-2 py-0.5 rounded text-xs font-medium">
                            You
                          </div>
                        )}
                      </div>
                      {member.organizationName && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                          {member.organizationName}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      Joined {member.joinedAt ? formatJoinDate(member.joinedAt) : 'Recently'}
                    </p>
                  </div>
                </div>
              ))}

              {(!members || members.length === 0) && (
                <div className="py-8 text-center text-gray-500">
                  <p>No players have joined yet.</p>
                  <p className="text-sm mt-1">Share the league code to get started!</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.main>
    );

  } catch (error) {
    console.error("Error loading league:", error);
    await pool.end();
    return <div>Error loading league</div>;
  }
}
