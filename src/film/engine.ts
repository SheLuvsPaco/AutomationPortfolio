// Scroll-driven playback. Each scene has a spacer in .track (its length) and a
// layer on the fixed .stage (its picture). Scroll position becomes a per-scene
// progress --p in [0, 1]; nearly all motion is CSS computed from --p.

interface Scene {
  id: string;
  spacer: HTMLElement;
  layer: HTMLElement;
  chapter: string;
  top: number;
  height: number;
  typed: { el: HTMLElement; full: string; a: number; b: number }[];
  counts: { el: HTMLElement; to: number; a: number; b: number; fmt: (n: number) => string }[];
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function startFilm() {
  const spacers = [...document.querySelectorAll<HTMLElement>('.track > [data-scene]')];
  const timecode = document.querySelector<HTMLElement>('[data-timecode]');
  const chapterEl = document.querySelector<HTMLElement>('[data-chapter-label]');
  const bar = document.querySelector<HTMLElement>('[data-progress]');
  const filmSeconds = Number(document.querySelector<HTMLElement>('[data-runtime]')?.dataset.runtime || 120);
  // The rail sets the order of the steps; anything else tagged with a step
  // (the minimap's nodes) follows it. Both only show while a step is on screen.
  const rail = document.querySelector<HTMLElement>('[data-rail]');
  const order = [...(rail?.querySelectorAll<HTMLElement>('[data-step]') ?? [])].map((el) => el.dataset.step!);
  const stepEls = [...document.querySelectorAll<HTMLElement | SVGElement>('[data-step]')];
  const showWithSteps = [...document.querySelectorAll<HTMLElement>('[data-rail], [data-map]')];
  const railNow = rail?.querySelector<HTMLElement>('[data-rail-now]');

  const scenes: Scene[] = spacers.map((spacer) => {
    const id = spacer.dataset.scene!;
    const layer = document.getElementById(id)!;
    const typed = [...layer.querySelectorAll<HTMLElement>('[data-type]')].map((el) => {
      const full = el.textContent ?? '';
      el.setAttribute('aria-label', full);
      const [a, b] = el.dataset.type!.split(' ').map(Number);
      return { el, full, a, b };
    });
    const counts = [...layer.querySelectorAll<HTMLElement>('[data-count]')].map((el) => {
      const [a, b] = el.dataset.count!.split(' ').map(Number);
      const to = Number(el.dataset.to ?? el.textContent!.replace(/[^\d.]/g, ''));
      const fmt = (n: number) => Math.round(n).toLocaleString('en-US');
      return { el, to, a, b, fmt };
    });
    return { id, spacer, layer, chapter: spacer.dataset.chapter ?? '', top: 0, height: 1, typed, counts };
  });

  let total = 1;
  function measure() {
    for (const s of scenes) {
      s.top = s.spacer.offsetTop;
      s.height = s.spacer.offsetHeight;
    }
    total = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  }

  let lastChapter = '';
  let ticking = false;
  function frame() {
    ticking = false;
    const y = scrollY;
    for (const s of scenes) {
      const raw = (y - s.top) / s.height;
      const live = raw > -0.02 && raw < 1.02;
      s.layer.classList.toggle('on', live);
      if (!live) continue;
      const p = clamp01(raw);
      s.layer.style.setProperty('--p', p.toFixed(4));
      for (const t of s.typed) {
        const n = Math.round(clamp01((p - t.a) / (t.b - t.a)) * t.full.length);
        if (t.el.dataset.n !== String(n)) {
          t.el.dataset.n = String(n);
          t.el.textContent = t.full.slice(0, n);
        }
      }
      for (const c of s.counts) c.el.textContent = c.fmt(clamp01((p - c.a) / (c.b - c.a)) * c.to);
    }
    // Current chapter: the one of the scene under the playhead (may be none).
    let chapter = scenes[0]?.chapter ?? '';
    for (const s of scenes) if (y >= s.top - 1) chapter = s.chapter;
    if (chapter !== lastChapter) {
      lastChapter = chapter;
      if (chapterEl) chapterEl.textContent = chapter;
      // The journey rail: steps before the current one are done, the rest wait.
      const at = order.indexOf(chapter);
      showWithSteps.forEach((el) => el.classList.toggle('shown', at >= 0));
      stepEls.forEach((el) => {
        const i = order.indexOf(el.dataset.step ?? '');
        el.classList.toggle('now', i >= 0 && i === at);
        el.classList.toggle('done', i >= 0 && at >= 0 && i < at);
      });
      if (railNow && at >= 0) railNow.textContent = `${at + 1} / ${order.length} · ${chapter}`;
    }
    const g = clamp01(y / total);
    if (bar) bar.style.setProperty('--g', g.toFixed(4));
    if (timecode) {
      const sec = Math.round(g * filmSeconds);
      timecode.textContent = `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
    }
  }
  const request = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(frame);
    }
  };

  measure();
  frame();
  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', () => { measure(); request(); });
  // Fonts can change spacer offsets slightly; re-measure once they settle.
  document.fonts?.ready.then(() => { measure(); request(); });

  // Chapter links jump to the start of a scene.
  document.addEventListener('click', (e) => {
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[data-jump]');
    if (!a) return;
    e.preventDefault();
    const s = scenes.find((x) => x.id === a.dataset.jump);
    const smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (s) scrollTo({ top: s.top + 2, behavior: smooth ? 'smooth' : 'auto' });
  });
}
