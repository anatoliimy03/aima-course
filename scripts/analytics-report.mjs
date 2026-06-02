#!/usr/bin/env node

const DEFAULT_SUPABASE_URL = 'https://binylmnmfpecucosgmtv.supabase.co';
const TABLE = 'analytics_events';

const args = new Map();
for (let i = 2; i < process.argv.length; i += 1) {
  const arg = process.argv[i];
  if (!arg.startsWith('--')) continue;
  const [key, inlineValue] = arg.slice(2).split('=');
  if (key === 'json') {
    args.set(key, true);
    continue;
  }
  if (inlineValue !== undefined) {
    args.set(key, inlineValue);
    continue;
  }
  args.set(key, process.argv[i + 1]);
  i += 1;
}

const days = Number(args.get('days') || 7);
const jsonMode = args.has('json');
const supabaseUrl = process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANALYTICS_KEY ||
  process.env.SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('Set SUPABASE_SERVICE_ROLE_KEY to read private analytics_events data.');
  process.exit(1);
}

const now = new Date();
const from = args.get('from') ? new Date(args.get('from')) : new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
const to = args.get('to') ? new Date(args.get('to')) : now;

if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
  console.error('Use valid ISO dates for --from and --to.');
  process.exit(1);
}

const select = [
  'created_at',
  'event_name',
  'visitor_id',
  'session_id',
  'page_path',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'scroll_depth',
  'payload'
].join(',');

async function fetchEvents() {
  const events = [];
  const pageSize = 1000;
  let offset = 0;

  while (true) {
    const url = new URL(`${supabaseUrl}/rest/v1/${TABLE}`);
    url.searchParams.set('select', select);
    url.searchParams.set('created_at', `gte.${from.toISOString()}`);
    url.searchParams.append('created_at', `lt.${to.toISOString()}`);
    url.searchParams.set('order', 'created_at.asc');

    const response = await fetch(url, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Range: `${offset}-${offset + pageSize - 1}`
      }
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Supabase read failed: ${response.status} ${body}`);
    }

    const chunk = await response.json();
    events.push(...chunk);
    if (chunk.length < pageSize) break;
    offset += pageSize;
  }

  return events;
}

function pct(part, total) {
  if (!total) return '0%';
  return `${Math.round((part / total) * 1000) / 10}%`;
}

function countBy(items, getKey) {
  const counts = new Map();
  for (const item of items) {
    const key = getKey(item) || 'unknown';
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

function uniqueCount(items, getKey) {
  return new Set(items.map(getKey).filter(Boolean)).size;
}

function maxScrollBySession(events) {
  const maxBySession = new Map();
  for (const event of events) {
    const session = event.session_id;
    if (!session) continue;
    const depth = Number(event.scroll_depth || event.payload?.depth || event.payload?.max_scroll_depth || 0);
    maxBySession.set(session, Math.max(maxBySession.get(session) || 0, depth));
  }
  return [...maxBySession.values()];
}

function summarize(events) {
  const pageViews = events.filter((event) => event.event_name === 'page_view');
  const ctaClicks = events.filter((event) => event.event_name === 'cta_click');
  const checkouts = events.filter((event) => event.event_name === 'begin_checkout');
  const purchases = events.filter((event) => event.event_name === 'purchase_success');
  const paymentMissing = events.filter((event) => event.event_name === 'payment_link_missing');
  const telegramClicks = events.filter((event) => event.event_name === 'telegram_access_click');
  const scrollDepths = maxScrollBySession(events);

  return {
    period: {
      from: from.toISOString(),
      to: to.toISOString()
    },
    totals: {
      events: events.length,
      visitors: uniqueCount(events, (event) => event.visitor_id),
      sessions: uniqueCount(events, (event) => event.session_id),
      page_views: pageViews.length
    },
    funnel: {
      page_views: pageViews.length,
      cta_clicks: ctaClicks.length,
      begin_checkout: checkouts.length,
      purchase_success: purchases.length,
      payment_link_missing: paymentMissing.length,
      cta_rate: pct(ctaClicks.length, pageViews.length),
      checkout_rate_from_cta: pct(checkouts.length, ctaClicks.length),
      purchase_rate_from_checkout: pct(purchases.length, checkouts.length)
    },
    cta_by_location: countBy(ctaClicks, (event) => event.payload?.location),
    cta_by_button: countBy(ctaClicks, (event) => event.payload?.button_label || event.payload?.location),
    section_views: countBy(events.filter((event) => event.event_name === 'section_view'), (event) => event.payload?.section_id),
    program_modules_opened: countBy(
      events.filter((event) => event.event_name === 'program_module_toggle' && event.payload?.is_open),
      (event) => `${event.payload?.module_number || ''} ${event.payload?.module_title || ''}`.trim()
    ),
    faq_opened: countBy(
      events.filter((event) => event.event_name === 'faq_toggle' && event.payload?.is_open),
      (event) => event.payload?.question
    ),
    cases_clicked: countBy(events.filter((event) => event.event_name === 'case_click'), (event) => event.payload?.case_name),
    reviews_opened: countBy(events.filter((event) => event.event_name === 'review_open'), (event) => event.payload?.review_name),
    campaigns: countBy(events.filter((event) => event.utm_campaign), (event) => `${event.utm_source || 'unknown'} / ${event.utm_medium || 'unknown'} / ${event.utm_campaign}`),
    post_purchase: {
      telegram_access_clicks: telegramClicks.length,
      instagram_support_clicks: events.filter((event) => event.event_name === 'instagram_click' && event.payload?.location === 'thank_you_support').length
    },
    scroll_depth_sessions: {
      reached_25: scrollDepths.filter((depth) => depth >= 25).length,
      reached_50: scrollDepths.filter((depth) => depth >= 50).length,
      reached_75: scrollDepths.filter((depth) => depth >= 75).length,
      reached_90: scrollDepths.filter((depth) => depth >= 90).length
    },
    event_names: countBy(events, (event) => event.event_name)
  };
}

function printList(title, items, empty = 'немає даних') {
  console.log(`\n${title}`);
  if (!items.length) {
    console.log(`- ${empty}`);
    return;
  }
  for (const [label, count] of items.slice(0, 12)) {
    console.log(`- ${label}: ${count}`);
  }
}

function printReport(summary) {
  const { totals, funnel } = summary;
  console.log('Аналітика Aima Course');
  console.log(`Період: ${summary.period.from} -> ${summary.period.to}`);
  console.log(`Подій: ${totals.events}`);
  console.log(`Відвідувачів: ${totals.visitors}`);
  console.log(`Сесій: ${totals.sessions}`);
  console.log(`Переглядів сторінок: ${totals.page_views}`);

  console.log('\nВоронка');
  console.log(`- Перегляди: ${funnel.page_views}`);
  console.log(`- CTA кліки: ${funnel.cta_clicks} (${funnel.cta_rate})`);
  console.log(`- Перехід до оплати: ${funnel.begin_checkout} (${funnel.checkout_rate_from_cta} від CTA)`);
  console.log(`- Успішні оплати: ${funnel.purchase_success} (${funnel.purchase_rate_from_checkout} від checkout)`);
  console.log(`- Плейсхолдер WayForPay спрацював: ${funnel.payment_link_missing}`);

  printList('CTA за місцем', summary.cta_by_location);
  printList('CTA за текстом кнопки', summary.cta_by_button);
  printList('Перегляди секцій', summary.section_views);
  printList('Відкриті модулі програми', summary.program_modules_opened);
  printList('Відкриті FAQ', summary.faq_opened);
  printList('Кліки по кейсах', summary.cases_clicked);
  printList('Відкриті відгуки', summary.reviews_opened);
  printList('Кампанії', summary.campaigns);

  console.log('\nПісля оплати');
  console.log(`- Кліки Telegram-доступу: ${summary.post_purchase.telegram_access_clicks}`);
  console.log(`- Кліки підтримки в Instagram: ${summary.post_purchase.instagram_support_clicks}`);

  console.log('\nГлибина скролу за сесіями');
  console.log(`- 25%+: ${summary.scroll_depth_sessions.reached_25}`);
  console.log(`- 50%+: ${summary.scroll_depth_sessions.reached_50}`);
  console.log(`- 75%+: ${summary.scroll_depth_sessions.reached_75}`);
  console.log(`- 90%+: ${summary.scroll_depth_sessions.reached_90}`);
}

try {
  const events = await fetchEvents();
  const summary = summarize(events);
  if (jsonMode) {
    console.log(JSON.stringify(summary, null, 2));
  } else {
    printReport(summary);
  }
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
