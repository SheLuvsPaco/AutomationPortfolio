import { index } from '../lib/data';

export interface Feature {
  slug: string;
  title: string;
  tagline: string;
  /** Workflow slugs from the archive that this film is about. */
  workflows: string[];
  status: 'showing' | 'soon';
  accent: string;
  /** The small print at the bottom of a cinema poster. */
  billing: string[];
}

// Every tagline is checked against the workflow exports.
export const FEATURES: Feature[] = [
  {
    slug: 'ai-cold-caller',
    title: 'AI Cold Caller',
    tagline: 'It researches you before it dials.',
    workflows: ['vapi-outbound'],
    status: 'showing',
    accent: '#ff6b3d',
    billing: ['VAPI', 'xAI Grok', 'Perplexity', 'Deepgram', 'Apify', 'Twilio', 'Airtable', 'n8n'],
  },
  {
    slug: 'ai-receptionist',
    title: 'AI Receptionist',
    tagline: 'Booked, moved or cancelled. Mid-call.',
    workflows: ['vapi-inbound'],
    status: 'showing',
    accent: '#f4c35a',
    billing: ['VAPI', 'Cal.com', 'Google Calendar', 'n8n'],
  },
  {
    slug: 'ai-amazon-store-manager',
    title: 'Online Store That Runs Itself',
    tagline: 'Thirteen workflows. One Amazon store.',
    workflows: index.filter((w) => w.folder === 'amazon-fba').map((w) => w.slug),
    status: 'showing',
    accent: '#7fd6a4',
    billing: ['Amazon Ads API', 'SP-API', 'OpenAI', 'Perplexity', 'Decodo', 'Supabase', 'Telegram', 'n8n'],
  },
  {
    slug: 'no-lead-left-behind',
    title: 'No Lead Left Behind',
    tagline: 'Reminders at 19 hours. 12. 5. And 10 minutes.',
    workflows: ['sales-pipeline'],
    status: 'showing',
    accent: '#ff8fa3',
    billing: ['GoHighLevel', 'Supabase', 'OpenAI', 'n8n'],
  },
  {
    slug: 'from-map-to-meeting',
    title: 'From Map to Meeting',
    tagline: 'Finds the owner. Audits their site. Books the call.',
    workflows: index.filter((w) => w.folder === 'lead-machine').map((w) => w.slug),
    status: 'showing',
    accent: '#8fb8ff',
    billing: ['Foursquare', 'Hunter', 'Gemini', 'Perplexity', 'EmailGuard', 'VAPI', 'Gmail', 'n8n'],
  },
];

export const statsOf = (f: Feature) => {
  const ws = index.filter((w) => f.workflows.includes(w.slug));
  return { workflows: ws.length, nodes: ws.reduce((s, w) => s + w.stats.nodes, 0), thumbs: ws.map((w) => w.thumb) };
};
