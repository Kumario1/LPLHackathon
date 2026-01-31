# Transition OS Frontend

This directory contains the frontend for the Transition OS application.

## 🌐 Service Configuration

Configure URLs via `frontend/.env` (see `.env.example`):

- `VITE_OPENCLAW_URL` (WebSocket for OpenClaw chat)
- `VITE_CLAWDBOT_URL` (HTTP API for Clawdbot endpoints)
- `VITE_BACKEND_URL` (direct backend API)

## Prerequisites

- Node.js (v18 or higher)
- npm

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` → `.env` and update the service URLs.

3. Run the development server:
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run test`: Run tests with Vitest
- `npm run lint`: Lint code with ESLint
- `npm run format`: Format code with Prettier
- `npm run preview`: Preview production build

## Project Structure

(Structure will be initialized as development proceeds)
