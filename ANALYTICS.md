# Analytics setup

## 1. Supabase events table

Run `supabase/analytics-events.sql` once in the Supabase SQL editor.

The public anon key can insert analytics events, but there is intentionally no public read policy. Use a private key for reports.

## 2. Optional external analytics

In `online-shop-21-days/index.html` and `online-shop-21-days/thank-you/index.html`, fill these values when ready:

```js
clarityProjectId: '',
gaMeasurementId: '',
```

Leave them empty if you only want Supabase event tracking.

## 3. Report

Set a private Supabase key in the shell:

```bash
export SUPABASE_SERVICE_ROLE_KEY="..."
```

Then run:

```bash
node scripts/analytics-report.mjs --days 7
```

For a custom period:

```bash
node scripts/analytics-report.mjs --from 2026-06-01 --to 2026-06-08
```

For JSON output:

```bash
node scripts/analytics-report.mjs --days 30 --json
```

## Tracked events

- `page_view`
- `section_view`
- `scroll_depth`
- `timer_started`
- `timer_expired`
- `menu_open`
- `menu_close`
- `nav_click`
- `cta_click`
- `begin_checkout`
- `payment_link_missing`
- `program_module_toggle`
- `faq_toggle`
- `instagram_click`
- `case_click`
- `review_open`
- `page_leave`
- `purchase_success`
- `telegram_access_click`
- `telegram_access_redirect`
- `telegram_access_link_missing`
