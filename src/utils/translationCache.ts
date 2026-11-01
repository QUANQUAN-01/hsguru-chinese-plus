import { STORAGE_PREFIX } from './constants';
import { storageKey } from './storage';

const CARD_CACHE_TTL = 7 * 24 * 60 * 60 * 1000;
const CARD_CACHE_VERSION = '1';

function isCardCacheFresh(cardName: string): boolean {
  const cachedAt = Number(localStorage.getItem(storageKey.cardCacheTimestamp(cardName)));
  if (cachedAt && Date.now() - cachedAt < CARD_CACHE_TTL) return true;

  localStorage.removeItem(storageKey.cardTranslation(cardName));
  localStorage.removeItem(storageKey.cardImage(cardName));
  localStorage.removeItem(storageKey.cardCacheTimestamp(cardName));
  cardImageCache.delete(cardName);
  return false;
}

// ============================================================
// Translation Cache (Memory LRU)
// ============================================================

export const translationCache = {
  cache: new Map<string, string>(),
  maxSize: 2000,
  size: 0,

  getOrCreate(text: string, translationFn: (text: string) => string): string {
    if (!text) return text;
    if (!this.cache.has(text)) {
      if (this.size >= this.maxSize) {
        const entriesToDelete = Math.floor(this.maxSize * 0.2);
        const entries = Array.from(this.cache.entries());
        entries.slice(0, entriesToDelete).forEach(([key]) => {
          this.cache.delete(key);
          this.size--;
        });
      }
      const translation = translationFn(text);
      this.cache.set(text, translation);
      this.size++;
    }
    return this.cache.get(text)!;
  },

  clear(): void {
    this.cache.clear();
    this.size = 0;
  },
};

// ============================================================
// Card Cache (Memory)
// ============================================================

export const cardCache = new Map<string, string>();

export function getCachedCardTranslation(cardName: string): string {
  if (!cardName || !isCardCacheFresh(cardName)) return '';
  return localStorage.getItem(storageKey.cardTranslation(cardName)) || '';
}

// ============================================================
// Card Image Cache (Memory + localStorage persistence)
// ============================================================

const cardImageCache = new Map<string, string>();

let activeCardPreviewName = '';

export function getActiveCardPreviewName(): string {
  return activeCardPreviewName;
}

export function setActiveCardPreviewName(name: string): void {
  activeCardPreviewName = name;
}

export function getCachedCardImage(cardName: string): string {
  if (!cardName) return '';
  if (!isCardCacheFresh(cardName)) return '';
  if (cardImageCache.has(cardName)) return cardImageCache.get(cardName)!;
  const cachedImage = localStorage.getItem(storageKey.cardImage(cardName));
  if (cachedImage) {
    cardImageCache.set(cardName, cachedImage);
    return cachedImage;
  }
  return '';
}

export function cacheCardImage(
  cardName: string,
  imageUrl: string,
  onImageAvailable?: (cardName: string, imageUrl: string) => void,
): void {
  if (!cardName || !imageUrl) return;
  cardImageCache.set(cardName, imageUrl);
  localStorage.setItem(storageKey.cardImage(cardName), imageUrl);
  localStorage.setItem(storageKey.cardCacheTimestamp(cardName), String(Date.now()));
  if (activeCardPreviewName === cardName && onImageAvailable) {
    onImageAvailable(cardName, imageUrl);
  }
}

// ============================================================
// Save Translation to Storage
// ============================================================

export function saveCardTranslation(cardName: string, translation: string): void {
  cardCache.set(cardName, translation);
  localStorage.setItem(storageKey.cardTranslation(cardName), translation);
  localStorage.setItem(storageKey.cardCacheTimestamp(cardName), String(Date.now()));
}

// ============================================================
// Cache Version
// ============================================================

function isCardResourceKey(key: string): boolean {
  if (key === storageKey.cardCacheVersion() || key === storageKey.cardMissVersion()) return false;
  return (
    key.startsWith(STORAGE_PREFIX.CARD_TRANSLATION) ||
    key.startsWith(STORAGE_PREFIX.CARD_IMAGE) ||
    key.startsWith(STORAGE_PREFIX.CARD_CACHE_TIMESTAMP) ||
    key.startsWith(STORAGE_PREFIX.CARD_ERROR_TIMESTAMP) ||
    key.startsWith(STORAGE_PREFIX.CARD_MISS_TIMESTAMP)
  );
}

function isCardCacheEntryKey(key: string): boolean {
  return isCardResourceKey(key) && !key.startsWith(STORAGE_PREFIX.CARD_MISS_TIMESTAMP);
}

function clearCardCacheStorage(): void {
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key && isCardCacheEntryKey(key)) {
      localStorage.removeItem(key);
    }
  }
  cardCache.clear();
  cardImageCache.clear();
}

/**
 * 手动清空全部卡牌资源缓存（翻译、图片、时间戳、失败/未命中冷却）。
 * 不删除自定义翻译，也不改动缓存版本号。
 * @returns 删除的 localStorage 条目数
 */
export function clearAllCardResources(): number {
  let removed = 0;
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key && isCardResourceKey(key)) {
      localStorage.removeItem(key);
      removed++;
    }
  }
  cardCache.clear();
  cardImageCache.clear();
  translationCache.clear();
  return removed;
}

/**
 * 翻译缓存版本变更时清空旧翻译/图片/时间戳。
 * 首次运行（没有版本键）只登记版本，避免升级后全量重新请求。
 */
export function ensureCardCacheVersion(): void {
  let storedVersion: string | null;
  try {
    storedVersion = localStorage.getItem(storageKey.cardCacheVersion());
  } catch (e) {
    console.warn('[HSGuru] 读取卡牌缓存版本失败', e);
    return;
  }

  if (storedVersion === CARD_CACHE_VERSION) return;
  if (storedVersion) clearCardCacheStorage();

  try {
    localStorage.setItem(storageKey.cardCacheVersion(), CARD_CACHE_VERSION);
  } catch (e) {
    console.warn('[HSGuru] 写入卡牌缓存版本失败', e);
  }
}
