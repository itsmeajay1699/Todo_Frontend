# Todo Frontend

React app for a weekly todo list. You can see your tasks by day, week or month, track how much of the week is done, search, and add, edit, skip or delete tasks. It works without an account: tasks made as a guest stay with you when you sign up or log in.

- Live: https://todo.innerbhakti.in. The demo account is filled in on the Log in form.
- Backend: https://github.com/itsmeajay1699/Todo_Backend

## Stack

Vite, React 19, TypeScript, TanStack Query, React Router, Tailwind CSS 4, Radix UI primitives, React Hook Form with Zod, date-fns, react-day-picker, Sonner, motion. Node 24.

## Running locally

```bash
npm ci
npm run dev                 # http://localhost:5173
```

By default the dev server runs on an in-memory mock of the API (`VITE_API_MOCK=true` in `.env.development`) with a few weeks of sample tasks, so no backend is needed. To use a real backend on `localhost:3000`, create `.env.development.local` with `VITE_API_MOCK=false`. Vite proxies `/api` to it, so the session cookie stays same-origin. Mock code is never included in a production build.

```bash
npm run lint
npm run build               # type-check and build to dist/
```

## Screens

- **Week** (`/week/:date?`): the current week as seven date cards. Each card shows that day's tasks, open ones first. Tap a card to open the day. A summary above shows open, completed and skipped counts with progress.
- **Day** (`/day/:date?`): one day in full, with a week strip to switch days. Today's open tasks come first, then overdue tasks from earlier days, and completed and skipped tasks are folded away at the bottom.
- **Month** (`/month/:month?`): a Monday-to-Sunday calendar with up to three tasks per date. Tap a date to open the day.
- **Search** (Ctrl/Cmd + K): matches title and description, with view, edit and delete on each result.

Check the box to mark a task completed. Skipping a task takes an optional reason. On mobile, swipe a task left to delete it.

## How it fits together

```
src/
  app/             router, layout, header, providers
  features/auth/   session bootstrap (start a guest if not signed in), login/signup, account menu
  features/tasks/
    api/           TanStack Query hooks and query keys
    components/    task row, task panel, form, skip dialog, search, date strip
    views/         Day, Week, Month
  components/ui/   small Radix-based building blocks styled with the app's tokens
  lib/             fetch wrapper, date helpers (weeks start on Monday)
  mocks/           in-memory API for development
```

All task queries share the `['tasks']` key prefix, so any create, edit or delete refreshes every view at once. Ticking a checkbox is optimistic: the list and progress update immediately, and roll back if the server refuses.

## Deployment

```bash
sudo docker compose -f docker-compose.prod.yml up -d --build
```

This builds the app and serves it with nginx on `127.0.0.1:3011`. The host nginx sends `/api/` to the backend and everything else here, on the same domain. `nginx.conf` falls back to `index.html` for client-side routes, caches hashed assets for a year, and never caches the page itself.
