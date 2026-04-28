import { SELECTORS } from '../utils/constants';
import { cardCache, saveCardTranslation, cacheCardImage } from '../utils/translationCache';
import {
  enqueueCardFetch,
  updateCardElement,
  addPendingElement,
  isCardPending,
  CardTranslationResult,
} from '../utils/api';
import { StorageManager, storageKey } from '../utils/storage';

const CUSTOM_CARD_TRANSLATIONS_KEY = storageKey.customCard();
let customCardTranslations: Record<string, string> | null = null;

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
    saveCardTranslation(cardName, result.translation);
    if (result.imageUrl) {
      cacheCardImage(cardName, result.imageUrl);
    }
  } else {
    addUnmatchedCardName(cardName);
  }
  elements.forEach((el) => updateCardElement(el as HTMLElement, result.translation, cardName));
}

export function handleCard(): void {
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
      } else {
        (element as HTMLElement).dataset.cardTranslated = 'true';
      }
      return;
    }

    const cachedTranslation = localStorage.getItem(storageKey.cardTranslation(text));
    if (cachedTranslation) {
      cardCache.set(text, cachedTranslation);
      updateCardElement(element as HTMLElement, cachedTranslation, text);
      return;
    }

    if (isCardPending(text)) {
      addPendingElement(text, element);
      return;
    }

    addPendingElement(text, element);
    enqueueCardFetch(text, 2, 500, handleCardFetchResult);
  });
}
