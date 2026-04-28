import { getCachedCardImage, cacheCardImage } from '../utils/translationCache';
import { enqueueCardFetch, isCardPending, CardTranslationResult } from '../utils/api';

let cardPreviewOverlay: HTMLDivElement | null = null;
export let activeCardPreviewName = '';
let lastCardPreviewPosition = { x: 0, y: 0 };
let nativePreviewsHidden = false;

function getCardPreviewOverlay(): HTMLDivElement {
  if (cardPreviewOverlay) return cardPreviewOverlay;

  if (!document.getElementById('hsguru-card-preview-hide-style')) {
    const style = document.createElement('style');
    style.id = 'hsguru-card-preview-hide-style';
    style.textContent = `
      body.hsguru-hide-native-card-preview .decklist-card-image {
        display: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  cardPreviewOverlay = document.createElement('div');
  cardPreviewOverlay.id = 'hsguru-chinese-card-preview';
  Object.assign(cardPreviewOverlay.style, {
    position: 'fixed',
    display: 'none',
    pointerEvents: 'none',
    zIndex: '2147483647',
    width: '260px',
    filter: 'drop-shadow(0 16px 28px rgba(0, 0, 0, 0.35))',
    transition: 'opacity 0.12s ease',
  });

  const image = document.createElement('img');
  image.alt = '';
  Object.assign(image.style, {
    display: 'block',
    width: '100%',
    height: 'auto',
    borderRadius: '14px',
  });
  cardPreviewOverlay.appendChild(image);
  document.body.appendChild(cardPreviewOverlay);

  return cardPreviewOverlay;
}

function positionCardPreview(x: number, y: number): void {
  const overlay = getCardPreviewOverlay();
  const previewWidth = 260;
  const previewHeight = 360;
  const gap = 18;
  const verticalLift = 120;

  let left = x + gap;
  let top = y - verticalLift;

  if (left + previewWidth > window.innerWidth - 8) {
    left = x - previewWidth - gap;
  }
  if (top + previewHeight > window.innerHeight - 8) {
    top = window.innerHeight - previewHeight - 8;
  }

  overlay.style.left = `${Math.max(8, left)}px`;
  overlay.style.top = `${Math.max(8, top)}px`;
}

function hideNativeHoverCardPreviews(): void {
  if (nativePreviewsHidden) return;
  nativePreviewsHidden = true;
  document.body.classList.add('hsguru-hide-native-card-preview');
}

function restoreNativeHoverCardPreviews(): void {
  if (!nativePreviewsHidden) return;
  nativePreviewsHidden = false;
  document.body.classList.remove('hsguru-hide-native-card-preview');
}

export function renderChineseCardPreview(imageUrl: string): void {
  if (!imageUrl || !activeCardPreviewName) return;
  const overlay = getCardPreviewOverlay();
  const image = overlay.querySelector('img') as HTMLImageElement;
  if (image.src !== imageUrl) image.src = imageUrl;
  positionCardPreview(lastCardPreviewPosition.x, lastCardPreviewPosition.y);
  hideNativeHoverCardPreviews();
  overlay.style.display = 'block';
  overlay.style.opacity = '1';
}

function ensureCardImageFetch(cardName: string): void {
  if (!cardName || getCachedCardImage(cardName) || isCardPending(cardName)) return;
  enqueueCardFetch(cardName, 2, 500, (_name: string, result: CardTranslationResult) => {
    if (result.imageUrl) {
      cacheCardImage(cardName, result.imageUrl);
      if (activeCardPreviewName === cardName) {
        renderChineseCardPreview(result.imageUrl);
      }
    }
  });
}

export function showChineseCardPreview(cardName: string, x: number, y: number): void {
  if (!cardName) return;
  activeCardPreviewName = cardName;
  lastCardPreviewPosition = { x, y };

  const imageUrl = getCachedCardImage(cardName);
  if (imageUrl) {
    renderChineseCardPreview(imageUrl);
    return;
  }

  hideNativeHoverCardPreviews();
  const overlay = getCardPreviewOverlay();
  overlay.style.display = 'none';
  ensureCardImageFetch(cardName);
}

export function moveChineseCardPreview(x: number, y: number): void {
  if (!activeCardPreviewName) return;
  lastCardPreviewPosition = { x, y };
  positionCardPreview(x, y);
}

export function hideChineseCardPreview(): void {
  activeCardPreviewName = '';
  restoreNativeHoverCardPreviews();
  if (!cardPreviewOverlay) return;
  cardPreviewOverlay.style.opacity = '0';
  cardPreviewOverlay.style.display = 'none';
}
