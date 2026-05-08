# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't delete the necessary comments
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.


This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the Cloudreve frontend: a React + TypeScript + Vite SPA for a cloud storage/file management platform. It is a feature-rich application with an admin dashboard, file manager, upload system, share management, and AI chat module.

## Common Commands

- `yarn dev` — Start the Vite dev server (proxies `/api`, `/s/`, `/f/` to `http://localhost:8080`).
- `yarn build` — Production build (output to `build/`).
- `yarn build-prod` — Type-check (`tsc`) then production build.
- `yarn lint` — Run ESLint.
- `yarn format` — Run Prettier write.
- `yarn format:check` — Run Prettier check.

There is no test suite in this repository; verify changes manually in the browser.

## High-Level Architecture

### Build & Routing
- **Vite** with `@vitejs/plugin-react-swc`. Config in `vite.config.ts`. Dev server runs on `0.0.0.0` and proxies API calls to a local backend.
- **React Router v6** using `createBrowserRouter` in `src/router/index.tsx`.
- Routes are organized under two frame layouts:
  - `HeadlessFrame` — auth pages (`/session/*`).
  - `AutoNavbarFrame` — main app (`/home`, `/admin/*`, `/settings`, `/tasks`, `/shares`, etc.).
- Lazy loading is used extensively via `lazy()` in routes. Admin and frame components are grouped into bundle entry points: `src/component/Admin/AdminBundle.tsx` and `src/component/Frame/FrameManagerBundle.tsx`.

### State Management (Redux Toolkit)
Store is in `src/redux/store.ts` with three slices:
- **`siteConfigSlice`** (`src/redux/siteConfigSlice.ts`) — Holds backend-driven configuration grouped by sections (`basic`, `explorer`, `login`, `app`, `thumb`, `emojis`). Loaded on boot via `updateSiteConfig()` thunk. Contains viewer definitions, file type icons, and theme options.
- **`globalStateSlice`** (`src/redux/globalStateSlice.ts`) — Global UI state: dialog open/close states, image viewer, music player, upload dialogs, etc.
- **`fileManagerSlice`** (`src/redux/fileManagerSlice.ts`) — File manager state per instance index (0 = main, 1 = selector). Tracks path, file list, selection, pagination, sorting, layout, tree cache, and context menu state.

Use typed hooks: `useAppDispatch()` and `useAppSelector()` from `src/redux/hooks.ts`.

### API Layer
- **`src/api/request.ts`** — Core HTTP logic. Creates an Axios instance with baseURL `/api/v1`. Exports `send()`, which returns a Redux thunk (`ThunkResponse<T>`). It automatically:
  - Attaches Bearer tokens via `SessionManager`.
  - Refreshes expired access tokens.
  - Maps backend error codes to i18n messages (`AppError`).
  - Shows `notistack` error snackbars by default.
  - Handles lock conflicts (`Code.LockConflict`) with an automatic retry dialog.
  - Handles batch operation partial failures (`Code.BatchOperationNotFullyCompleted`) via metadata parsing (`getAggregatedErrorsFromMetadata`).
- **`src/api/api.ts`** — All API endpoint functions (e.g., `getFileList`, `sendDeleteFiles`, `getUserList`). Every function returns a thunk to be dispatched.
- **Type files**: `dashboard.ts`, `explorer.ts`, `user.ts`, `site.ts`, `setting.ts`, `share.ts`, `workflow.ts`, `ai.ts`, `common.ts` define TypeScript interfaces for request/response payloads.

### Session & Auth
- **`src/session/index.ts`** — `SessionManager` handles multiple concurrent user sessions, access/refresh tokens, and localStorage persistence of user settings. Supports anonymous settings.
- On 401/ credential invalid responses, `send()` automatically signs out the current session and navigates to `/session`.

### File Manager
- **`src/component/FileManager/FileManager.tsx`** — Main component. Supports multiple instances via `FmIndexContext` (indices defined in `FileManagerIndex`).
- Uses `react-virtuoso` for virtualized lists, `react-dnd` for drag-and-drop, and `react-hotkeys-hook` for keyboard shortcuts (Ctrl+A select all, Delete, Esc).
- Navigation and path parsing use `CrUri` utility (`src/util/uri.ts`).
- File manager state is manipulated via thunks in `src/redux/thunks/filemanager.ts`.

### Dialogs
- Global dialogs (confirmation, batch download log, select option, pin to sidebar) are mounted once in `GlobalDialogs.tsx` and controlled by Redux state.
- Feature-specific dialogs are co-located with their components.

### Theming & i18n
- **MUI v6** theming with dynamic theme configs loaded from the backend (`siteConfigSlice`). Dark/light mode and custom themes are supported. Global style overrides in `src/App.tsx`.
- **i18next** with three namespaces: `common`, `application`, `dashboard`. Fallback language is `en-US`. Translations live in `public/locales/{lng}/{ns}.json`.

### Code Conventions
- Prettier `printWidth: 120`.
- ESLint: `no-explicit-any` is an error. Unused vars prefixed with `_` are allowed.
- Husky + lint-staged runs `prettier --write` on pre-commit.
- Strict TypeScript is enabled, but `noUnusedLocals` is `false`.
- Prefer `.tsx` for React components and `.ts` for utilities.

### Heavy Dependencies & Code Splitting
The Vite config manually chunks several large dependencies (`monaco-editor`, `@excalidraw`, `leaflet`, `mapbox-gl`, `mermaid`, `react`). The service worker caches assets but explicitly ignores Leaflet/Mapbox files. `pdfjs-dist` files are copied statically to `assets/pdfjs`.

