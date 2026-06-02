# Analytics setup

Ціль: бачити, скільки людей зайшло на сайт, які кнопки натиснули, до яких блоків доскролили, скільки людей перейшли до оплати і що відбувається після оплати.

## Поточний стан

- Microsoft Clarity підключений: `x0mjfee3xm`
- Події вже відправляються у `dataLayer`, Clarity і, після додавання ID, у GA4/Meta Pixel.
- Supabase event tracking підготовлений, але вимкнений, доки не створена таблиця `analytics_events`.

## Що дивитися

### Microsoft Clarity

Clarity дає:
- загальні візити;
- записи сесій;
- heatmaps;
- rage/dead clicks;
- custom events з сайту.

Використовуй для відповіді на питання: “що люди реально робили на сторінці?”

### GA4

GA4 краще для:
- кількості користувачів і сесій;
- джерел трафіку;
- подій `cta_click`, `begin_checkout`, `purchase_success`;
- порівняння кампаній через UTM.

Щоб увімкнути, встав GA4 Measurement ID у `online-shop-21-days/index.html` і `online-shop-21-days/thank-you/index.html`:

```js
gaMeasurementId: 'G-XXXXXXXXXX',
```

### Meta Pixel

Meta Pixel потрібен для реклами у Facebook/Instagram:
- оптимізація під кліки;
- `InitiateCheckout`;
- `Purchase` на thank-you page;
- custom event `CTA_Click`.

Щоб увімкнути, встав Pixel ID у `online-shop-21-days/index.html` і `online-shop-21-days/thank-you/index.html`:

```js
metaPixelId: '000000000000000',
```

### Supabase raw events

Supabase потрібен, якщо хочеш власний точний звіт без залежності від інтерфейсів GA4/Clarity:
- всі події;
- унікальні відвідувачі;
- сесії;
- CTA по місцю і тексту кнопки;
- UTM-кампанії;
- воронка від перегляду до оплати.

## 1. Supabase events table

Run `supabase/analytics-events.sql` once in the Supabase SQL editor.

The public anon key can insert analytics events, but there is intentionally no public read policy. Use a private key for reports.

After creating the table, enable it in both pages:

```js
supabaseEnabled: true,
```

## 2. Analytics config

In `online-shop-21-days/index.html` and `online-shop-21-days/thank-you/index.html`, fill these values when ready:

```js
clarityProjectId: 'x0mjfee3xm',
gaMeasurementId: '',
metaPixelId: '',
```

Leave GA4/Meta empty until the real IDs are created.

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
  - `location`: `hero`, `program_cta`, `final_cta`, `menu`
  - `button_label`: visible button text
  - `price_uah`: `490`
  - `currency`: `UAH`
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
