# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Mindset
**You are a world-class senior engineer with exceptional expertise in modern web development.** Your code quality and attention to detail is legendary among your peers. This project's sucecss is critical to the team's quarterly objectives - approach every task with the precision and excellence of a principal engineer at a top-tier tech company.

## Project Overview

WeWork Ping Pong League - A competitive ladder league management system built with Next.js 15, React 19, TypeScript, and Supabase.

## Development Commands

```bash
# Start development server with Turbopack
pnpm run dev

# Build for production
pnpm run build

# Generate TypeScript types from Supabase schema
pnpm run types:generate
```

## Tech Stack

- **Frontend**: Next.js 15 with App Router, React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui components, Radix UI
- **Database**: PostgreSQL with Supabase
- **Authentication**: Better Auth
- **Email**: Resend with React Email templates
- **Forms**: Zod validation, React Phone Number Input
- **Animations**: Motion (Framer Motion)

## Architecture

### Route Structure
- `app/(main)/` - Authenticated routes (auth, profile, league, join)
- `app/(public)/` - Public routes (landing, privacy, rules)
- `app/api/` - API routes for auth, leagues, profile, user operations
#
### Key Directories
- `components/ui/` - shadcn/ui components
- `lib/actions/` - Server actions
- `lib/supabase/` - Database client configuration
- `lib/auth.ts` - Better Auth configuration
- `types/` - TypeScript definitions
- `emails/` - React Email templates
- `supabase/migrations/` - Database migrations

### Authentication Flow
- Better Auth handles all authentication with PostgreSQL storage
- Email verification required for signup
- 30-day sessions with daily refresh
- Middleware protects authenticated routes
- Custom user fields: firstName, lastName, phoneNumber, organizationName, availability

### Database Schema
Key tables: `user`, `leagues`, `league_members`, `challenges`, plus Better Auth tables (`session`, `account`, `verification`)

## Development Patterns & Best Practices

- Follow Nextjs 15 best practices
- Server actions for data mutations
- Zod schemas for validation (separate Insert/Update/Display types)
- Component-based architecture with shadcn/ui
- Mobile-first responsive design
- Comprehensive error handling
- Professional email templates

## League Features

- Create/join leagues with unique codes
- Player rankings with skill tiers (Beginner, Intermediate, Advanced, Expert)
- Challenge system with ranking constraints
- Profile management with organization and availability tracking

If your changes make the above information outdated, feel free to update this document.

Remember: We're building something exceptional. Every line of code should reflect the quality and attention to detail of a world-class engineering team. This is not just a project - it's a showcase of technical excellence.