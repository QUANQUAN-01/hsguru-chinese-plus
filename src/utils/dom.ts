import { CLASS_ACCENT_COLORS, DEFAULT_CLASS_ACCENT, DEFAULT_CLASS_BG, CLASS_BG_COLORS } from './constants';

// ============================================================
// Query Cache
// ============================================================

export const queryCache = {
  cache: new WeakMap<Element | Document, Map<string, Element[]>>(),
  maxSize: 1e3,
  rootCacheSizes: new Map<Element | Document, number>(),
  lastAccessTime: new Map<string, number>(),

  getOrCreate(selector: string, root: Element | Document = document): Element[] {
    if (!this.cache.has(root)) {
      this.cache.set(root, new Map());
      this.rootCacheSizes.set(root, 0);
    }
    const rootCache = this.cache.get(root)!;
    const size = this.rootCacheSizes.get(root)!;
    if (!rootCache.has(selector)) {
      if (size >= this.maxSize) {
        let oldestTime = Date.now();
        let oldestSelector: string | null = null;
        for (const [key, time] of this.lastAccessTime.entries()) {
          if (time < oldestTime) {
            oldestTime = time;
            oldestSelector = key;
          }
        }
        if (oldestSelector) {
          rootCache.delete(oldestSelector);
          this.lastAccessTime.delete(oldestSelector);
          this.rootCacheSizes.set(root, size - 1);
        }
      }
      rootCache.set(selector, Array.from(root.querySelectorAll(selector)));
      this.rootCacheSizes.set(root, size + 1);
    }
    this.lastAccessTime.set(selector, Date.now());
    return rootCache.get(selector)!;
  },

  clear(): void {
    this.cache = new WeakMap();
    this.rootCacheSizes = new Map();
    this.lastAccessTime = new Map();
  },

  remove(selector: string, root: Element | Document = document): void {
    if (this.cache.has(root)) {
      const rootCache = this.cache.get(root);
      rootCache?.delete(selector);
    }
  },
};

// ============================================================
// DOM Helper Functions
// ============================================================

export function getMappedClassValue(
  element: Element,
  mapping: Record<string, string>,
  fallback: string,
): string {
  const className = Object.keys(mapping).find((name) =>
    element.classList.contains(name),
  );
  return mapping[className!] || fallback;
}

export function applyClassAccentStyles(element: HTMLElement): void {
  const accent = getMappedClassValue(
    element,
    CLASS_ACCENT_COLORS,
    DEFAULT_CLASS_ACCENT,
  );
  const bg = getMappedClassValue(
    element,
    CLASS_BG_COLORS,
    DEFAULT_CLASS_BG,
  );
  element.style.setProperty('--hsguru-class-accent', accent);
  element.style.setProperty('background', `linear-gradient(0deg, ${bg}, ${bg}), #f7edcf`, 'important');
  element.style.setProperty('border-left', `5px solid ${accent}`, 'important');
}
