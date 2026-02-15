# SBM - Project Documentation

## Overview
A pnpm monorepo with a React + Vite frontend and an Express backend that proxies OpenAI ChatKit API calls.

## Project Architecture
- **Monorepo**: pnpm workspaces
- **Frontend** (`apps/web`): React 18, Vite, Tailwind CSS v4, TypeScript
- **Backend** (`apps/server`): Express, TypeScript, proxies OpenAI ChatKit API

## Development
- `pnpm dev` runs both frontend (port 5000) and backend (port 3001) in parallel
- Vite proxies `/api` requests to the Express backend on port 3001

## Environment Variables
- `OPENAI_API_KEY` - OpenAI API key (required for backend)
- `CHATKIT_WORKFLOW_ID` - ChatKit workflow ID (required for backend)
- `DEMO_USER_ID` - Demo user ID (optional, defaults to 'demo-user')

## Key Dependencies
- React, React Router, TanStack Query/Table
- Radix UI components, Lucide icons
- Zustand for state management
- LiveKit for voice features
- Hamsa AI Voice Agents SDK

## Recent Changes
- 2026-02-15: Initial Replit setup - configured Vite to port 5000, set up development workflow
