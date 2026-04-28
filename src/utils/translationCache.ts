import { storageKey } from './storage';

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
}
