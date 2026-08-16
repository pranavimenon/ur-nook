# ur nook — Getting This Live

Built by iceeyou. This app is done and tested — it just needs to move from
"on Claude's computer" to "on the internet." Two stages: **GitHub** (where
the code lives) and **Vercel** (the company that actually runs it and gives
you a live web address). Both are free for this.

> **Had a version of this live before, but it's acting up?** Do a clean
> reset instead of patching individual files — see **"Doing a clean
> reset"** below, right after the two stages. It's the fastest way out of
> a confused state.

---

## Stage 1: Put the code on GitHub

Think of GitHub as a shelf where your app's code sits, so other services
(like Vercel) can come pick it up and run it.

1. Go to **github.com** and sign up if you don't have an account.
2. Click the **+** in the top right → **New repository**.
3. Name it `roomcraft-app`. Leave everything else as default. Click **Create repository**.
4. On the next page, ignore all the terminal-command instructions — instead
   look for a link that says **"uploading an existing file"**. Click it.
5. Drag this entire `roomcraft-app` folder's contents into that upload box
   (everything *except* the `node_modules` folder if it's there — that one's
   huge and gets rebuilt automatically, no need to upload it).
6. Scroll down, click **Commit changes**. Done — your code is on GitHub.

> **Important:** you'll notice `.env.local` (the file with your real secret
> keys) does **not** get uploaded — that's intentional, it's set up to be
> automatically skipped so your secrets never end up somewhere public. You'll
> paste those same values into Vercel directly in Stage 2 instead.

---

## Stage 2: Make it live with Vercel

Vercel is the company that takes your code from GitHub and actually runs it
so anyone can visit it in a browser.

1. Go to **vercel.com** and sign up using your GitHub account (there's a
   "Continue with GitHub" button — use that, it links the two automatically).
2. Click **Add New → Project**.
3. Find `roomcraft-app` in the list (it's there because you just signed in
   with GitHub) and click **Import**.
4. Before clicking deploy, look for a section called **Environment
   Variables**. Add these three, one at a time (name on the left, value on
   the right) — copy them straight from your `.env.local` file:

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | (from your `.env.local`) |
   | `CLERK_SECRET_KEY` | (from your `.env.local`) |
   | `DATABASE_URL` | (from your `.env.local`) |

5. Click **Deploy**. Vercel will now: download your code, build it, and
   automatically create the "projects" shelf inside your Neon database (you
   don't need to do that step by hand — it happens automatically the first
   time, via the `prisma db push` step wired into the build).
6. Wait 1–2 minutes. When it's done, Vercel gives you a live web address
   like `roomcraft-app.vercel.app` — that's your actual live website.

Open it, click Sign Up, create your first account, and you should land on
your dashboard where you can create a project. That's the whole pipeline —
account creation → your own private database rows — working for real.

---

## Doing a clean reset

If your site's gotten into a confused state after a few rounds of manual
file edits, don't keep patching — start the repo over. It's faster and
less error-prone than hunting for which one file is out of sync.

1. On GitHub, open your repository → **Settings** (repo settings, near the
   top) → scroll to the very bottom → **Delete this repository**. Confirm.
2. Go back through **Stage 1** above with a fresh repo, uploading
   **everything** in this zip in one go (drag the whole extracted
   `roomcraft-app` folder's contents into GitHub's upload box at once —
   not one file at a time).
3. In Vercel: your existing project can usually be re-pointed at the new
   repo (**Settings → Git → Connect a different repository**). If that
   option gives you trouble, just delete the old Vercel project too and
   **Add New → Project** fresh, importing your new repo.
4. Re-enter the same 3 Environment Variables as Stage 2 (copy them from
   `.env.local` in this zip — they haven't changed).
5. Deploy, wait a minute or two, done.

This guarantees every file matches exactly what's in this zip — no
leftover half-edited files from previous attempts.

---

## What changed in this version

The real room designer is now wired into "Open" — click a project on your
dashboard and it opens the actual 3D room builder, loading and auto-saving
straight to your account. The app is renamed to **ur nook**, built by
**iceeyou**, and the sign-in screens, dashboard, and landing page all now
match the designer's dark theme instead of Clerk's plain default styling.

## What you'll see right now

The dashboard lets you **create, list, and delete named projects**, and
clicking **Open** on any of them takes you into the real 3D room designer
— sketch your walls, place furniture, everything auto-saves back to that
project under your account. Refresh, log out, log back in on another
device — it'll all still be there.

## Making changes later

Every time you want something changed: come back and ask, I update the
code, and you re-upload the changed files to GitHub the same way as Stage 1
(or I'll walk you through Vercel's "redeploy" button, which is even faster
once it's connected). Vercel automatically rebuilds and updates your live
site within a minute or two — no downtime, nothing your users notice.

## If something goes wrong

The most common hiccup is a typo in one of the three Environment Variables
in Vercel. If your live site shows an error, that's the first thing to
double check — go to your Vercel project → **Settings → Environment
Variables** and make sure all three match your `.env.local` exactly (no
extra spaces, no missing quotes around the database one).
