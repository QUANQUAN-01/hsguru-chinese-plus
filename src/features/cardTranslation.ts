import { SELECTORS } from '../utils/constants';
import {
  cardCache,
  getCachedCardTranslation,
  saveCardTranslation,
  cacheCardImage,
} from '../utils/translationCache';
import {
  enqueueCardFetch,
  updateCardElement,
  addPendingElement,
  isCardPending,
  CardTranslationResult,
} from '../utils/api';
import { StorageManager, storageKey } from '../utils/storage';

const CUSTOM_CARD_TRANSLATIONS_KEY = storageKey.customCard();
const CARD_MISS_RETRY_DELAY = 24 * 60 * 60 * 1000;
const CARD_ERROR_RETRY_DELAY = 2 * 60 * 1000;
const CARD_MISS_VERSION = '5';
let customCardTranslations: Record<string, string> | null = null;

function clearLegacyCardMisses(): void {
  if (localStorage.getItem(storageKey.cardMissVersion()) === CARD_MISS_VERSION) return;

  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key?.startsWith('hsguru_card_miss_timestamp_')) {
      localStorage.removeItem(key);
    }
  }
  localStorage.setItem(storageKey.cardMissVersion(), CARD_MISS_VERSION);
}

function shouldRetryUnmatchedCard(name: string): boolean {
  const missedAt = Number(localStorage.getItem(storageKey.cardMissTimestamp(name)));
  return !missedAt || Date.now() - missedAt >= CARD_MISS_RETRY_DELAY;
}

function recordUnmatchedCard(name: string): void {
  localStorage.setItem(storageKey.cardMissTimestamp(name), String(Date.now()));
}

function shouldRetryErroredCard(name: string): boolean {
  const failedAt = Number(localStorage.getItem(storageKey.cardErrorTimestamp(name)));
  return !failedAt || Date.now() - failedAt >= CARD_ERROR_RETRY_DELAY;
}

function recordErroredCard(name: string): void {
  localStorage.setItem(storageKey.cardErrorTimestamp(name), String(Date.now()));
}

export function loadCustomCardTranslations(): void {
  if (customCardTranslations) return;
  try {
    const saved = StorageManager.gm.get<Record<string, string>>(CUSTOM_CARD_TRANSLATIONS_KEY, {});
    customCardTranslations = saved || {};
  } catch (e) {
    customCardTranslations = {};
  }
}

export function getCustomCardTranslations(): Record<string, string> {
  loadCustomCardTranslations();
  return customCardTranslations!;
}

export function saveCustomCardTranslation(original: string, translation: string): void {
  loadCustomCardTranslations();
  customCardTranslations![original] = translation;
  StorageManager.gm.set(CUSTOM_CARD_TRANSLATIONS_KEY, customCardTranslations);
}

export function saveCustomCardTranslations(translations: Record<string, string>): void {
  loadCustomCardTranslations();
  Object.assign(customCardTranslations!, translations);
  StorageManager.gm.set(CUSTOM_CARD_TRANSLATIONS_KEY, customCardTranslations);
}

export function deleteCustomCardTranslation(original: string): void {
  loadCustomCardTranslations();
  if (Object.prototype.hasOwnProperty.call(customCardTranslations, original)) {
    delete customCardTranslations![original];
    StorageManager.gm.set(CUSTOM_CARD_TRANSLATIONS_KEY, customCardTranslations);
  }
}

export function addUnmatchedCardName(name: string): void {
  loadCustomCardTranslations();
  if (
    /[a-zA-Z]/.test(name) &&
    !Object.prototype.hasOwnProperty.call(customCardTranslations, name)
  ) {
    customCardTranslations![name] = '';
    StorageManager.gm.set(CUSTOM_CARD_TRANSLATIONS_KEY, customCardTranslations);
  }
}

function handleCardFetchResult(
  cardName: string,
  result: CardTranslationResult,
  elements: Element[],
): void {
  if (result.found) {
    localStorage.removeItem(storageKey.cardMissTimestamp(cardName));
    localStorage.removeItem(storageKey.cardErrorTimestamp(cardName));
    saveCardTranslation(cardName, result.translation);
    if (result.imageUrl) {
      cacheCardImage(cardName, result.imageUrl);
    }
  } else if (result.requestFailed) {
    // 网络/服务暂时不可用：不写入未命中缓存，保留元素未翻译状态，冷却后自动重试。
    recordErroredCard(cardName);
    return;
  } else {
    localStorage.removeItem(storageKey.cardErrorTimestamp(cardName));
    recordUnmatchedCard(cardName);
    addUnmatchedCardName(cardName);
  }
  elements.forEach((el) => updateCardElement(el as HTMLElement, result.translation, cardName));
}

export function handleCard(): void {
  clearLegacyCardMisses();
  const cardNames = document.querySelectorAll(SELECTORS.CARD_NAME);
  const customCardTranslations2 = getCustomCardTranslations();

  cardNames.forEach((element) => {
    if ((element as HTMLElement).dataset.cardTranslated === 'true') return;

    const cardNameNode = Array.from(element.childNodes).find(
      (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
    );
    if (!cardNameNode) return;

    const text = cardNameNode.textContent!.trim();
    (element as HTMLElement).dataset.originalCardName = text;

    if (cardCache.has(text)) {
      updateCardElement(element as HTMLElement, cardCache.get(text)!, text);
      return;
    }

    if (Object.prototype.hasOwnProperty.call(customCardTranslations2, text)) {
      const customTranslation = customCardTranslations2[text];
      if (customTranslation) {
        cardCache.set(text, customTranslation);
        updateCardElement(element as HTMLElement, customTranslation, text);
        return;
      }
      if (!shouldRetryUnmatchedCard(text)) {
        (element as HTMLElement).dataset.cardTranslated = 'true';
        return;
      }
    }

    const cachedTranslation = getCachedCardTranslation(text);
    if (cachedTranslation) {
      cardCache.set(text, cachedTranslation);
      updateCardElement(element as HTMLElement, cachedTranslation, text);
      return;
    }

    if (!shouldRetryErroredCard(text)) return;

    if (isCardPending(text)) {
      addPendingElement(text, element);
      return;
    }

    addPendingElement(text, element);
    enqueueCardFetch(text, 2, 500, handleCardFetchResult);
  });
}
