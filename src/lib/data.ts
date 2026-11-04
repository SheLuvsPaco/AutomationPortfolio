import indexJson from '../data/generated/index.json';

export interface GNode {
  id: string;
  name: string;
  type: string;
  kind: string;
  code: string;
  role: string;
  x: number;
  y: number;
  w: number;
  h: number;
  shape: 'box' | 'wide' | 'circle' | 'trigger';
  lines: string[];
  sub: string;
  outs: string[];
}
export interface GEdge { from: string; to: string; port: number; ai: boolean; d: string }
export interface Graph { width: number; height: number; nodes: GNode[]; edges: GEdge[] }
export type Block =
  | { type: 'kv'; rows: [string, string][] }
  | { type: 'code'; title: string; lang: 'js' | 'json' | 'md'; text: string }
  | { type: 'note'; text: string };

export interface WorkflowEntry {
  folder: string;
  group?: string;
  slug: string;
  title: string;
  story?: boolean;
  stats: {
    nodes: number;
    connections: number;
    agents: number;
    codeNodes: number;
    branches: number;
    models: string[];
    integrations: string[];
  };
  thumb: { w: number; h: number; boxes: string; lines: string };
}

export const index = indexJson as WorkflowEntry[];

const graphs = import.meta.glob<Graph>('../data/generated/*.graph.json', { eager: true, import: 'default' });
const details = import.meta.glob<Record<string, Block[]>>('../data/generated/*.details.json', { eager: true, import: 'default' });

export const getGraph = (slug: string) => graphs[`../data/generated/${slug}.graph.json`];
export const getDetails = (slug: string) => details[`../data/generated/${slug}.details.json`];
export const getEntry = (slug: string) => index.find((w) => w.slug === slug)!;

export function nodeByName(graph: Graph, name: string) {
  const n = graph.nodes.find((x) => x.name === name);
  if (!n) throw new Error(`Story references unknown node "${name}"`);
  return n;
}

/** Bounding box of a set of nodes, including the labels printed under them. */
export function boxOf(nodes: GNode[], pad = 50) {
  const x0 = Math.min(...nodes.map((n) => n.x)) - pad;
  const y0 = Math.min(...nodes.map((n) => n.y)) - pad;
  const x1 = Math.max(...nodes.map((n) => n.x + n.w)) + pad;
  const y1 = Math.max(...nodes.map((n) => n.y + n.h + (n.shape === 'wide' ? 0 : 50))) + pad;
  return [x0, y0, x1 - x0, y1 - y0].map(Math.round);
}

export const allIntegrations = () => [...new Set(index.flatMap((w) => w.stats.integrations))];
