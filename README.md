# Job Application Tracker + Resume Match

React + TypeScript Single Page Application

## Problem It Solves
Managing applications often means jumping between a spreadsheet, notes app, and resume edits. This project brings those steps into one focused workflow.

It helps users:
- track applications by stage
- prioritize opportunities
- measure resume-to-job keyword relevance
- spot missing keywords quickly for better ATS alignment

## Tech Stack
- React 18
- TypeScript
- Vite
- Vitest
- CSS (custom, responsive)
- LocalStorage for persistence

## Implemented Features
- Kanban-style application pipeline:
  `Saved`, `Applied`, `Interview`, `Offer`, `Rejected`
- Drag-and-drop between stage columns
- Full CRUD for application entries
- Stage movement controls (`Back`, `Forward`) for non-drag workflows
- Resume match scoring per application
- Missing keyword hints for resume tailoring
- CSV export and CSV import for applications
- Demo mode with preloaded walkthrough datasets and restore button
- Dashboard metrics:
  total apps, applied, interviewing, offers, average match score
- Search, stage filtering, and sort controls
- Persistent state with localStorage

## Architecture
- `src/App.tsx`: main page layout, app state, filters, board, and form
- `src/utils/keywordMatch.ts`: keyword extraction and match scoring logic
- `src/utils/stage.ts`: stage transition helpers
- `src/utils/storage.ts`: persistence helpers
- `src/data/seed.ts`: starter data for demo
- `tests/*.test.ts`: utility-level tests

## Optimization Notes
- `useMemo` for derived stats, filtered views, and grouped stage columns
- Utility functions isolated from UI for testability and easier refactoring
- Lightweight scoring logic to keep UI responsive
- Small dependency surface for faster build and deploy

## Local Development
1. `npm install`
2. `npm run dev`

Production check:
1. `npm run build`
2. `npm test`
3. `npm run preview`

