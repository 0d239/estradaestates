# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Estrada Estates Realty Group website — a React SPA for a real estate brokerage based in Hollister, CA (San Benito County). Deployed to GitHub Pages via CI on push to `main`.

## Commands

- `npm run dev` — start Vite dev server with HMR
- `npm run build` — TypeScript check + Vite production build (outputs to `dist/`)
- `npm run lint` — ESLint across the project
- `npm run preview` — serve the production build locally

## Architecture

- **React 19 + TypeScript + Vite** SPA with **react-router-dom v7** for client-side routing
- **Tailwind CSS v4** (configured via `@theme` in `src/index.css`, not via `tailwind.config.js` which exists for legacy/reference). PostCSS integration via `@tailwindcss/postcss`.
- Utility function `cn()` in `src/lib/utils.ts` merges Tailwind classes using `clsx` + `tailwind-merge`

### Routing (src/App.tsx)

Three routes: `/` (Realtors), `/resources` (Resources), `/client-portal` (ClientPortal). All wrapped in a shared `Layout` component (Header + Footer).

### Key directories

- `src/pages/` — route-level page components
- `src/components/ui/` — reusable UI primitives (Button, Card, Badge, Accordion)
- `src/components/layout/` — Header, Footer, Layout wrapper
- `src/components/` — feature components (MortgageCalculator)
- `src/data/` — static data (agent profiles in `agents.ts`, FAQs/resources in `resources.ts`)

### Styling

Dark theme with black background (`bg-black`) and light text (`text-neutral-200`). Primary brand color is a yellow/gold palette (`primary-50` through `primary-950`). Font: Inter. Custom container utilities: `.container-narrow` (max-w-5xl) and `.container-wide` (max-w-7xl).

## Deployment

GitHub Actions workflow (`.github/workflows/deploy.yml`) builds and deploys to GitHub Pages on push to `main`. Uses `npm ci` + `npm run build`, Node 20.
