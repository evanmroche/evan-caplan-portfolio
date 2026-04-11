---
description: Start the Next.js dev server in the background and report the URL
---

Start the local dev server so the user can view changes in a browser.

1. Check whether a dev server is already running on port 3000 (or the next free port). If yes, report the existing URL and stop — don't start a duplicate.
2. Run `pnpm dev` (or `npm run dev`) in the background.
3. Wait for the "Ready" line in the output, then print the local URL.
4. If the server errors out during startup, show the error and stop — don't retry in a loop.

Remind the user they can stop the server at any time, and that this command does **not** open the browser automatically.
