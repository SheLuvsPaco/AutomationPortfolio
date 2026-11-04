// Runs the workflows' own Code-node JavaScript in the browser, against the
// film's invented inputs. n8n globals ($input, $) are replaced by small stubs
// that hand each node exactly the data shape it reads in production.

type Item = { json: Record<string, unknown> };

interface LiveSource {
  html2md?: string;
  linkedinId?: string;
  parse?: string;
  linkedin?: string;
  escape?: string;
  window?: string;
  exact?: string;
  nearest?: string;
  tsv?: string;
  top3?: string;
  campaign?: string;
  sales?: string;
  schedule?: string;
  quiet?: string;
  postcode?: string;
  sitemap?: string;
  spacing?: string;
  replies?: string;
}
interface Fixtures {
  html: string;
  research: string;
  firstMessage: string;
  systemPrompt: string;
  newBooking: string;
  toolArgs?: Record<string, string>;
  slots: Record<string, { start: string }[]>;
  listingTsv: string;
  searchTerms: Record<string, unknown>[];
  salesAndTraffic: Record<string, unknown>;
  quietDays: number[];
  addresses: string[];
  sitemap: string;
  notSitemap: string;
  threads: { messages: unknown[] }[];
  sends: number;
  verdictRaw: string;
}

function run(code: string, input: Item[], nodes: Record<string, Item[]>) {
  const $input = { first: () => input[0], all: () => input, item: input[0] };
  const $ = (name: string) => {
    const items = nodes[name] ?? [];
    return { first: () => items[0], all: () => items, item: items[0] };
  };
  // Older nodes read the n8n globals `items` and `$json` instead of $input;
  // one sizes its input with Node's Buffer, stubbed here.
  const buffer = { byteLength: (v: string) => new TextEncoder().encode(v).length };
  // eslint-disable-next-line no-new-func
  const fn = new Function('$input', '$', 'items', '$json', 'Buffer', code) as (i: unknown, d: unknown, it: Item[], j: unknown, b: unknown) => Item | Item[];
  const t0 = performance.now();
  const out = fn($input, $, input, input[0]?.json, buffer);
  const ms = performance.now() - t0;
  // Some nodes return bare objects rather than { json }.
  const all = (Array.isArray(out) ? out : [out]).map((i) => ((i as Item).json ?? i) as Record<string, any>);
  return { json: all[0], all, ms };
}

const set = (sel: string, text: string) => document.querySelectorAll<HTMLElement>(sel).forEach((el) => (el.textContent = text));
const fmtMs = (ms: number) => (ms < 0.1 ? '< 0.1 ms' : `${ms.toFixed(1)} ms`);

export function runLive() {
  const srcEl = document.getElementById('live-source');
  const fixEl = document.getElementById('live-fixtures');
  if (!srcEl || !fixEl) return;
  const src: LiveSource = JSON.parse(srcEl.textContent!);
  const fx: Fixtures = JSON.parse(fixEl.textContent!);

  // HTML TO MD: website markup → company profile, surfaced as facts.
  if (src.html2md) {
    const md = run(src.html2md, [{ json: { data: fx.html } }], {});
    const j = md.json;
    const facts = [
      j.yearFounded && `Since ${j.yearFounded}`,
      ...(j.services ?? []).slice(0, 2),
      j.membershipPrice && `Club ${j.membershipPrice.replace(/\s*per\s*/, '/')}`,
      j.teamMembers?.[0] && `${j.teamMembers[0].role}: ${j.teamMembers[0].name}`,
    ].filter(Boolean) as string[];
    document.querySelectorAll<HTMLElement>('[data-live="facts"] li').forEach((li, i) => (li.textContent = facts[i] ?? ''));
    set('[data-live="md-ms"]', fmtMs(md.ms));
  }

  // LinkedIn?: recursive URL sweep over the research result.
  if (src.linkedin) {
    const li = run(src.linkedin, [], { 'Prospect Research': [{ json: { choices: [{ message: { content: fx.research } }] } }] });
    set('[data-live="li"]', (li.json.LinkedInUrls?.[0] ?? '').replace(/^https?:\/\/(www\.)?/, ''));
    let ms = li.ms;
    // Get LinkedIn ID: the profile id, from the URLs the sweep found.
    if (src.linkedinId) {
      const id = run(src.linkedinId, [], { 'LinkedIn?': [{ json: li.json }] });
      set('[data-live="li-id"]', String(id.json.primaryProfileId ?? ''));
      ms += id.ms;
    }
    set('[data-live="li-ms"]', fmtMs(ms));
  }

  // The verdict parser: the agent's raw text → fields the Switch reads.
  if (src.parse) {
    const r = run(src.parse, [{ json: { output: fx.verdictRaw } }], {});
    document.querySelectorAll<HTMLElement>('[data-parse]').forEach((el) => (el.textContent = String(r.json[el.dataset.parse!] ?? '')));
    set('[data-live="parse-ms"]', fmtMs(r.ms));
  }

  // FirstMessage and SystemPrompt formatting: JSON-safe escaping.
  if (src.escape) {
    const esc = run(src.escape, [{ json: { firstMessage: fx.firstMessage, systemPrompt: fx.systemPrompt } }], {});
    set('[data-live="esc"]', esc.json.systemPrompt);
    set('[data-live="esc-ms"]', fmtMs(esc.ms));
  }

  // Amazon store: the listing report parser, the top-3 picker and two report writers.
  if (src.tsv) {
    const t = run(src.tsv, [{ json: { data: fx.listingTsv } }], {});
    document.querySelectorAll<HTMLElement>('[data-tsv]').forEach((el) => (el.textContent = String(t.json[el.dataset.tsv!] ?? '')));
    set('[data-live="tsv-ms"]', fmtMs(t.ms));
  }
  if (src.top3) {
    const t = run(src.top3, [], { 'Extract from File': [{ json: { data: fx.searchTerms } }] });
    const top = (t.json.topKeywords as { keyword: string }[]).map((k) => k.keyword);
    document.querySelectorAll<HTMLElement>('[data-kw]').forEach((el) => el.classList.toggle('top', top.includes(el.dataset.kw!)));
    set('[data-live="top3-ms"]', fmtMs(t.ms));
  }
  if (src.campaign && src.sales) {
    const c = run(src.campaign, [{ json: { data: fx.searchTerms } }], {});
    const s = run(src.sales, [{ json: fx.salesAndTraffic }], {});
    const tidy = (v: string) => v.replace(/\*\*/g, '').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    set('[data-live="msg-campaign"]', tidy(c.all.find((r) => /Manual/.test(r.report))?.report ?? c.json.report));
    set('[data-live="msg-sales"]', tidy(s.json.telegram_text));
    set('[data-live="msgs-ms"]', fmtMs(c.ms + s.ms));
  }

  // Sales pipeline: the reminder scheduler, on the viewer's own clock, and the 3-week rule.
  if (src.schedule) {
    const now = new Date();
    const appt = new Date(now);
    appt.setMinutes(0, 0, 0);
    appt.setHours(appt.getHours() + 48);
    const r = run(src.schedule, [{ json: { output: { utc_dateTime_ISO: appt.toISOString() } } }], { 'Edit Fields': [{ json: { now: now.toISOString() } }] });
    const fmt = (d: Date) => d.toLocaleString(undefined, { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    const times = Object.entries(r.json).filter(([k]) => /_before$/.test(k)).map(([, v]) => fmt(new Date(v)));
    document.querySelectorAll<HTMLElement>('[data-sched]').forEach((el) => {
      const k = el.dataset.sched!;
      el.textContent = k === 'now' ? fmt(now) : k === 'appt' ? fmt(appt) : k === 'iso' ? appt.toISOString() : k === '24h' ? String(r.json.isAtLeast24Hours) : times[Number(k)] ?? '';
    });
    set('[data-live="sched-ms"]', fmtMs(r.ms));
  }
  if (src.quiet) {
    const now = Date.now();
    const r = run(src.quiet, fx.quietDays.map((d) => ({ json: { conversations: [{ lastMessageDate: now - d * 864e5 }] } })), {});
    document.querySelectorAll<HTMLElement>('[data-quiet]').forEach((el) => {
      const ok = r.all[Number(el.dataset.quiet)]?.result === true;
      el.textContent = ok ? '✓' : '✕';
      el.classList.toggle('no', !ok);
      el.closest('[data-pre]')?.classList.toggle('pass', ok && el.closest<HTMLElement>('[data-pre]')!.dataset.pre === '1');
    });
    set('[data-live="quiet-ms"]', fmtMs(r.ms));
  }

  // Lead machine: postcode regex, sitemap check, send spacing, reply checker.
  if (src.postcode) {
    const [, body, flags] = src.postcode.match(/^\/([\s\S]+)\/(\w*)$/)!;
    const re = new RegExp(body, flags);
    const t0 = performance.now();
    const found = fx.addresses.map((a) => a.match(re)?.[0].toUpperCase() ?? null);
    const ms = performance.now() - t0;
    document.querySelectorAll<HTMLElement>('[data-pc]').forEach((el) => (el.textContent = found[Number(el.dataset.pc)] ?? 'none found'));
    set('[data-live="pc-ms"]', fmtMs(ms));
  }
  if (src.sitemap) {
    const runs = [fx.sitemap, fx.notSitemap].map((data) => run(src.sitemap!, [{ json: { data } }], {}));
    document.querySelectorAll<HTMLElement>('[data-sm]').forEach((el) => {
      const ok = runs[Number(el.dataset.sm)].json.status === 1;
      el.textContent = ok ? '✓ a real sitemap' : '✕ not a sitemap';
      el.classList.toggle('no', !ok);
    });
    set('[data-live="sm-ms"]', fmtMs(runs[0].ms + runs[1].ms));
  }
  if (src.spacing) {
    let ms = 0;
    const gaps = Array.from({ length: fx.sends }, () => { const r = run(src.spacing!, [], {}); ms += r.ms; return r.json.number as number; });
    let clock = 9 * 60;
    document.querySelectorAll<HTMLElement>('[data-gap]').forEach((el) => {
      const i = Number(el.dataset.gap);
      el.textContent = i === 0 ? 'first' : `+${gaps[i]} min`;
    });
    document.querySelectorAll<HTMLElement>('[data-at]').forEach((el) => {
      const i = Number(el.dataset.at);
      if (i > 0) clock += gaps[i];
      el.textContent = `${String(Math.floor(clock / 60)).padStart(2, '0')}:${String(clock % 60).padStart(2, '0')}`;
    });
    set('[data-live="gap-ms"]', fmtMs(ms));
  }
  if (src.replies) {
    let ms = 0;
    const out = fx.threads.map((t) => { const r = run(src.replies!, [{ json: t as Record<string, unknown> }], {}); ms += r.ms; return r.json.result as number; });
    const label: Record<number, string> = { 1: '1 · real reply', 2: '2 · no reply', 3: '3 · auto-reply' };
    document.querySelectorAll<HTMLElement>('[data-reply]').forEach((el) => {
      const v = out[Number(el.dataset.reply)];
      el.textContent = label[v] ?? String(v);
      el.closest('[data-thread]')?.setAttribute('data-result', String(v));
    });
    set('[data-live="reply-ms"]', fmtMs(ms));
  }

  if (!src.nearest || !src.window || !src.exact) return;
  // Reschedule path: availability window, exact check, nearest slot.
  const webhook = [{ json: { body: { message: { toolCalls: [{ function: { arguments: fx.toolArgs ?? { new_booking: fx.newBooking } } }] } } } }];
  const win = run(src.window, webhook, { Webhook: webhook });
  set('[data-live="win"]', `${win.json.start_date} → ${win.json.end_date}`);
  const exact = run(src.exact, [{ json: { data: fx.slots } }], { Webhook: webhook });
  set('[data-live="exact"]', `available: ${exact.json.available}`);
  const near = run(src.nearest, [], { Webhook: webhook, 'HTTP Request': [{ json: { data: fx.slots } }], 'HTTP Request1': [{ json: { data: fx.slots } }] });
  set('[data-live="nearest"]', String(near.json.closest_available_slot));
  set('[data-live="slot-ms"]', fmtMs(win.ms + exact.ms + near.ms));
  document.querySelectorAll<HTMLElement>('[data-slot]').forEach((el) => {
    el.classList.toggle('nearest', el.dataset.slot === near.json.original_slot_iso);
  });
}
