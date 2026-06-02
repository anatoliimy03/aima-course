# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project overview

Landing page for the "Інтернет-магазин за 21 урок" course by Aima. Single-file static site — everything lives in `index.html` (HTML + CSS + vanilla JS, no build tools).

- **Live:** https://aima-course.netlify.app (Netlify auto-deploys on push to `main`)
- **Database:** Supabase at `https://binylmnmfpecucosgmtv.supabase.co`

## Deploy workflow

```bash
git add index.html && git commit -m "what changed" && git push
```

Netlify picks up the push and deploys within ~1 minute. No build step.

Before finishing future site/content/code changes, ask the user whether to deploy/push them to the live domain. Do not assume deploy is wanted unless the user explicitly asks for it.

## Design system (CSS variables in `:root`)

**Fonts** (Google Fonts):
- `--f-display`: Manrope 600/700/800 — headings, labels, buttons
- `--f-body`: Onest 400/500 — body text, descriptions

**Colors:**
- `--ink: #0F1922` — hero bg, dark blocks
- `--blue: #185FA5` — primary accent, buttons
- `--sky: #85B7EB` — highlights on dark backgrounds
- `--blue-light: #E6F1FB` — icon backgrounds, quotes
- `--danger: #E24B4A` — countdown dot
- `--bg: #F6F7F9` — page background
- `--surface: #FFFFFF` — cards
- `--surface-2: #EEEEF2` — secondary surfaces

**Radii:** `--radius-md: 10px`, `--radius-lg: 14px`

**Spacing scale:** 4 / 8 / 12 / 16 / 24 / 40px

Icons are from Tabler Icons (`ti ti-*` classes via CDN).

## Page sections (in order)

Hero → Для кого → Результати → Як проходить → Програма (4 modules accordion) → Спікер → Кейси → Відгуки → Бонуси → Гарантія → CTA з таймером → FAQ

## Supabase integration

Form submissions go to the `leads` table via REST API. The key in the HTML is a publishable (anon) key — intentionally public.

`leads` schema:
```
id uuid PK, created_at timestamp, name text, email text,
phone text, status text (default 'new'), paid bool, telegram_sent bool
```

## Pending items (not yet implemented)

- monobank acquiring — invoice creation through Netlify Function
- Telegram bot — sends channel link after payment
- Real images: `photo.jpg` (hero), `speaker.jpg`, `case1-4.jpg`
