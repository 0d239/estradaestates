---
name: Project Direction
description: Estrada Estates evolving from static React SPA to full-stack CRM with agent auth, client management, listings, and mass communication
type: project
---

As of 2026-04-07, the project is being planned to evolve from a purely static marketing site into a full-featured real estate platform.

**Planned features:**
- Agent authentication (login/dashboard)
- Client management (agents have lists of clients)
- Listings management (public-facing, browsable, not necessarily tied to an agent on creation)
- Leads system (details TBD)
- Mass communication — ability to phone/email clients via modal/dialog
- Eventually: client login portal

**Tech decisions:**
- Backend/DB: Supabase
- Hosting: Vercel (moving off GitHub Pages)
- Frontend: keeping React + TypeScript + Vite stack

**Why:** Transitioning from a marketing-only site to an operational tool for the brokerage.

**How to apply:** All future planning and implementation should orient toward this architecture. Agent-facing features are the priority; client-facing login is secondary.
