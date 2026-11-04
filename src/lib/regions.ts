import { nodeByName, type Graph } from './data';

export interface Region {
  /** Step name, as the rail and minimap know it. */
  step: string;
  ids: Set<string>;
  box: { x: number; y: number; w: number; h: number };
}

// Group a workflow's nodes into named stretches. AI sub-nodes (models, output
// parsers) follow the agent they plug into, so they never need listing.
export function regions(g: Graph, groups: [string, string[]][], pad = 22): Region[] {
  const owner = new Map<string, string>();
  for (const [step, names] of groups) for (const n of names) owner.set(nodeByName(g, n).id, step);
  for (const e of g.edges) if (e.ai && owner.has(e.to) && !owner.has(e.from)) owner.set(e.from, owner.get(e.to)!);
  return groups.map(([step]) => {
    const nodes = g.nodes.filter((n) => owner.get(n.id) === step);
    const x0 = Math.min(...nodes.map((n) => n.x)) - pad;
    const y0 = Math.min(...nodes.map((n) => n.y)) - pad;
    const x1 = Math.max(...nodes.map((n) => n.x + n.w)) + pad;
    const y1 = Math.max(...nodes.map((n) => n.y + n.h)) + pad;
    return { step, ids: new Set(nodes.map((n) => n.id)), box: { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } };
  });
}

export const stepOf = (rs: Region[], id: string) => rs.find((r) => r.ids.has(id))?.step;

/** A region's nodes as one small outline (node boxes only), at the origin. */
export function outline(g: Graph, ids: Set<string>, s = 0.1) {
  const nodes = g.nodes.filter((n) => ids.has(n.id));
  const x0 = Math.min(...nodes.map((n) => n.x));
  const y0 = Math.min(...nodes.map((n) => n.y));
  const r = (v: number) => Math.round(v * s);
  const boxes = nodes.map((n) => `M${r(n.x - x0)} ${r(n.y - y0)}h${Math.max(2, r(n.w))}v${Math.max(2, r(n.h))}h-${Math.max(2, r(n.w))}z`).join('');
  return { w: r(Math.max(...nodes.map((n) => n.x + n.w)) - x0), h: r(Math.max(...nodes.map((n) => n.y + n.h)) - y0), boxes };
}
