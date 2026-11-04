// Everything in this file is invented for the film. It is shaped exactly like
// the data each real node reads in production, so the real code can run on it.

export const LEAD = {
  rawName: 'dr. SARAH miller 🚀',
  company: 'CoolAir Heating & Air',
  website: 'coolair-hvac.example',
};

export const CALLER = 'Marcus Chen';

// A small company homepage written to exercise the HTML TO MD parser.
export const WEBSITE_HTML = `<title>CoolAir Heating &amp; Air | Austin HVAC</title>
<meta name="description" content="Family-owned heating and cooling serving Central Texas since 2009.">
<div hidden data-org='{"name": "CoolAir Heating & Air", "streetAddress": "1200 Example Rd", "addressLocality": "Austin", "addressRegion": "TX", "postalCode": "78701"}'></div>
<a href="tel:+15125550142">(512) 555-0142</a>
<ul class="dropdown-menu"><li><a class="dropdown-item" href="#">AC Repair</a></li><li><a class="dropdown-item" href="#">Heat Pumps</a></li><li><a class="dropdown-item" href="#">Duct Cleaning</a></li><li><a class="dropdown-item" href="#">Maintenance Plans</a></li></ul>
<h2>Same-day repairs, every day of the summer</h2>
<p><span>Integrity:</span> We quote before we touch anything.</p>
<p>$50 off any repair this month</p>
<p>Comfort Club from $14.99 per month</p>
<div><div><div>GET TO KNOW THE TEAM <h5>Sarah Miller</h5><h6>Owner</h6> <h5>Luis Ortega</h5><h6>Lead Technician</h6></div></div></div>
<h5>Round Rock</h5> AC Repair <h5>Pflugerville</h5> AC Repair
<a href="https://facebook.com/coolairhvac">Facebook</a> License TACLB00012345E`;

// What a deep-research answer might contain, including profile links.
export const RESEARCH = `CoolAir Heating & Air has served Central Texas since 2009 with a team of around 12.
Owner Sarah Miller was featured in a local business podcast about summer demand.
LinkedIn (personal): https://www.linkedin.com/in/sarah-miller-coolair
LinkedIn (company): https://www.linkedin.com/company/coolair-hvac`;

export const LINKEDIN_HEADLINE = 'Owner, CoolAir Heating & Air · Keeping Austin cool since 2009';

export const BRIEF =
  'Sarah owns CoolAir (est. 2009, ~12 staff, Austin). Runs same-day summer repairs; was on a local podcast about peak-season demand. Offers a $14.99/month Comfort Club.';

export const CALL_TIME = 'Monday, November 09, 2026 at 09:14 AM';

// The lead sheet, as people actually type names into it.
export const SHEET = [
  { raw: 'dr. SARAH miller 🚀', company: 'CoolAir Heating & Air' },
  { raw: "JOHN o'neil", company: "O'Neil Comfort Co." },
  { raw: 'Mrs. kate BRANDT', company: 'Brandt Mechanical' },
  { raw: '🔥 tony ruiz', company: 'Ruiz Air Pros' },
  { raw: 'jean-pierre DUVAL', company: 'Duval Climate' },
];

// One call, start to finish. Each of Brian's lines is tagged (on the page)
// with the line of his real script it follows.
export const TRANSCRIPT = [
  ['Sarah', 'Uh, yeah, I’ve got a minute. What’s this about?'],
  ['Brian', 'Mm, gotcha. Quick one: when your guys are up on a roof in July, how many calls slip through?'],
  ['Sarah', 'Honestly? A lot. Summer’s crazy.'],
  ['Brian', 'Yeah… that’s rough. We built a voice agent that picks up every call, books the job.'],
  ['Sarah', 'We tried an answering service. Didn’t love it.'],
  ['Brian', 'Totally fair. That’s exactly what the specialist walks you through, fifteen minutes.'],
  ['Brian', 'I got Thursday afternoon or Friday morning. What’s better?'],
  ['Sarah', 'Thursday afternoon. Two o’clock?'],
  ['Brian', 'Done. I’ll shoot you a calendar invite right now. Appreciate you, Sarah.'],
] as const;

// Shaped like the Booked/Not Booked agent's output format: "YYYY-MM-DD hh:mm".
export const VERDICT_RAW = '{\n  "STATUS": "BOOKED",\n  "startDate": "2026-11-12 14:00"\n}';
export const VERDICT = { STATUS: 'BOOKED', startDate: '2026-11-12 14:00' };
export const CALL_ID = 'c3f9…e21a';
export const CALL_SUMMARY = 'Owner open to a demo; summer call volume is the pain. Booked Thursday 2 pm.';
export const MEET = 'meet.google.com/xqk-trwa-pvn';
export const EMAIL = 'sarah@coolair-hvac.example';

export const RESCHEDULE_ARGS = { booked_date: '2026-11-12 14:00', new_booking: '2026-11-13 10:00', user_name: CALLER };

export const SLOTS: Record<string, { start: string }[]> = {
  '2026-11-13': [{ start: '2026-11-13T08:30:00' }, { start: '2026-11-13T11:00:00' }, { start: '2026-11-13T15:30:00' }],
  '2026-11-14': [{ start: '2026-11-14T09:00:00' }, { start: '2026-11-14T13:00:00' }],
  '2026-11-16': [{ start: '2026-11-16T10:00:00' }],
};

// The receptionist: Marcus's two calls. Slots are shaped like Cal.com's
// /v2/slots answer for the 72-hour window the workflow asks about.
export const BOOK_ARGS = { booking_time: '2026-11-12 14:00', user_name: CALLER };
export const SLOTS_BOOK: Record<string, { start: string }[]> = {
  '2026-11-12': [{ start: '2026-11-12T09:00:00' }, { start: '2026-11-12T10:30:00' }, { start: '2026-11-12T16:30:00' }],
  '2026-11-13': [{ start: '2026-11-13T08:30:00' }, { start: '2026-11-13T11:00:00' }, { start: '2026-11-13T15:30:00' }],
  '2026-11-14': [{ start: '2026-11-14T09:00:00' }, { start: '2026-11-14T13:00:00' }],
};
export const MOVE_ARGS = { booked_date: '2026-11-12 16:30', new_booking: '2026-11-13 11:00', user_name: CALLER };
export const TOOL_CALL_ID = 'call_7Hq2…xN4';

