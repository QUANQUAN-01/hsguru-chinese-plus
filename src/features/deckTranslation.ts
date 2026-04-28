import { staticPrefix, classSuffix, FEATURES } from '../utils/constants';
import { StorageManager, storageKey } from '../utils/storage';

const CUSTOM_TRANSLATIONS_KEY = storageKey.customDeck();
let customTranslations: Record<string, string> | null = null;

export function loadCustomTranslations(): void {
  if (customTranslations) return;
  try {
    const saved = StorageManager.gm.get<Record<string, string>>(CUSTOM_TRANSLATIONS_KEY, {});
    customTranslations = saved || {};
  } catch (e) {
    customTranslations = {};
  }
}

export function getCustomTranslations(): Record<string, string> {
  loadCustomTranslations();
  return customTranslations!;
}

export function saveCustomTranslation(original: string, translation: string): void {
  loadCustomTranslations();
  customTranslations![original] = translation;
  StorageManager.gm.set(CUSTOM_TRANSLATIONS_KEY, customTranslations);
}

export function saveCustomTranslations(translations: Record<string, string>): void {
  loadCustomTranslations();
  Object.assign(customTranslations!, translations);
  StorageManager.gm.set(CUSTOM_TRANSLATIONS_KEY, customTranslations);
}

export function getEffectiveCustomTranslations(): Record<string, string> {
  loadCustomTranslations();
  return Object.fromEntries(
    Object.entries(customTranslations!).filter(
      ([, value]) => typeof value === 'string' && value.trim(),
    ),
  );
}

export function deleteCustomTranslation(original: string): void {
  loadCustomTranslations();
  if (Object.prototype.hasOwnProperty.call(customTranslations, original)) {
    delete customTranslations![original];
    StorageManager.gm.set(CUSTOM_TRANSLATIONS_KEY, customTranslations);
  }
}

export function addUnmatchedWord(word: string): void {
  loadCustomTranslations();
  if (
    /[a-zA-Z]/.test(word) &&
    !/[^\x00-\xff]/.test(word) &&
    !Object.prototype.hasOwnProperty.call(customTranslations, word)
  ) {
    customTranslations![word] = '';
    StorageManager.gm.set(CUSTOM_TRANSLATIONS_KEY, customTranslations);
  }
}

export function generateAllRuneCombinations(): Record<string, string> {
  if (!FEATURES.RUNE.enabled) return {};
  const RUNE_TYPES: Record<string, string> = { B: 'blood', F: 'frost', U: 'unholy' };
  const runeTypes = Object.keys(RUNE_TYPES);
  const combinations: Record<string, string> = {};

  for (let length = 1; length <= 3; length++) {
    (function generateCombinations(prefix: string, remainingLength: number) {
      if (remainingLength === 0) {
        combinations[prefix] = `<span class="rune-container">${prefix
          .split('')
          .map((type) => `<span class="rune-${RUNE_TYPES[type]}"></span>`)
          .join('')}</span>`;
        return;
      }
      for (const runeType of runeTypes) {
        generateCombinations(prefix + runeType, remainingLength - 1);
      }
    })('', length);
  }
  return combinations;
}

export function getFullPrefixRules(): Record<string, string> {
  return {
    ...staticPrefix,
    ...generateAllRuneCombinations(),
    ...getEffectiveCustomTranslations(),
  };
}

export function generateDeckTranslation(englishName: string): string {
  loadCustomTranslations();
  const customTranslation = customTranslations![englishName];
  if (typeof customTranslation === 'string' && customTranslation.trim()) {
    return customTranslation.trim();
  }

  const words = englishName.split(' ');
  const result = [...words];
  const processedIndices = new Set<number>();
  let classFound: string | null = null;

  const lastWord = words[words.length - 1];
  const secondLastWord = words[words.length - 2];

  if (/Demon\s+(Hunter|hunter)/.test(`${secondLastWord} ${lastWord}`)) {
    classFound = 'DH';
    result[words.length - 2] = '';
    result[words.length - 1] = classSuffix['DH'];
    processedIndices.add(words.length - 2);
    processedIndices.add(words.length - 1);
  } else if (/Death\s+(Knight|knight)/.test(`${secondLastWord} ${lastWord}`)) {
    classFound = 'DK';
    result[words.length - 2] = '';
    result[words.length - 1] = classSuffix['DK'];
    processedIndices.add(words.length - 2);
    processedIndices.add(words.length - 1);
  } else if (classSuffix[lastWord]) {
    classFound = lastWord;
    result[words.length - 1] = classSuffix[lastWord];
    processedIndices.add(words.length - 1);
  }

  const prefixRules = getFullPrefixRules();
  const multiByteKeys = Object.keys(prefixRules).filter((key) => key.includes(' '));

  for (const key of multiByteKeys) {
    const keyWords = key.split(' ');
    const matchStart = words.findIndex(
      (_word, index) =>
        !processedIndices.has(index) &&
        keyWords.every(
          (keyWord, keyIndex) =>
            !processedIndices.has(index + keyIndex) && words[index + keyIndex] === keyWord,
        ),
    );
    if (matchStart !== -1) {
      result[matchStart] = prefixRules[key];
      for (let i = 0; i < keyWords.length; i++) {
        if (i > 0) result[matchStart + i] = '';
        processedIndices.add(matchStart + i);
      }
    }
  }

  for (let i = 0; i < words.length - (classFound ? 1 : 0); i++) {
    if (!processedIndices.has(i)) {
      const word = words[i];
      const isRune = /^[BFU]{1,3}$/.test(word);
      const ruleValue = prefixRules[word];
      if (ruleValue && (!isRune || FEATURES.RUNE.enabled)) {
        result[i] = ruleValue;
        processedIndices.add(i);
      }
    }
  }

  words.forEach((_word, i) => {
    if (!processedIndices.has(i)) {
      const cleanWord = _word.replace(/<[^>]+>/g, '').trim();
      if (cleanWord) {
        addUnmatchedWord(cleanWord);
      }
    }
  });

  const filtered = result.filter((word) => word);
  return filtered.reduce((acc, curr, i) => {
    if (i === 0) return curr;
    const prev = filtered[i - 1];
    const needsSpace = /[a-zA-Z0-9]$/.test(prev) && /^[a-zA-Z0-9]/.test(curr);
    return acc + (needsSpace ? ' ' : '') + curr;
  }, '');
}

// ============================================================
// Deck UI Handler
// ============================================================

import { SELECTORS, CLASSES } from '../utils/constants';
import { queryCache } from '../utils/dom';
import { translationCache } from '../utils/translationCache';

export function handleDeck(): void {
  const deckTitleSelector = `${SELECTORS.DECK_TITLE}, ${SELECTORS.DECK_LINK}, ${SELECTORS.BASIC_DECK_TITLE}`;
  const deckTitles = queryCache.getOrCreate(deckTitleSelector);
  deckTitles.forEach((element) => {
    const text = element.textContent?.trim() || '';
    const translation = translationCache.getOrCreate(text, generateDeckTranslation);
    if (translation !== text) {
      const fragment = document.createDocumentFragment();
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = translation;
      while (tempDiv.firstChild) {
        fragment.appendChild(tempDiv.firstChild);
      }
      element.innerHTML = '';
      element.appendChild(fragment);
    }
  });

  const deckCards = new Set([
    ...Array.from(document.querySelectorAll('#deck_stats_viewport .card')),
    ...(Array.from(document.querySelectorAll('.card-image .decklist-info'))
      .map((deckInfo) => deckInfo.closest('.card'))
      .filter(Boolean) as Element[]),
  ]);

  deckCards.forEach((card) => {
    if (!card.classList.contains(CLASSES.DECK_CARD_SHELL)) {
      card.classList.add(CLASSES.DECK_CARD_SHELL);
    }

    card
      .querySelectorAll('.card-image .decklist-info:not(.dust-bar), .decklist-info:not(.dust-bar)')
      .forEach((deckInfo) => {
        if (!deckInfo.querySelector('.deck-title')) return;
        deckInfo.classList.add(CLASSES.DECK_SUMMARY);
        const row = deckInfo.querySelector('.level.is-mobile');
        if (row) row.classList.add(CLASSES.DECK_SUMMARY_ROW);
        const title = deckInfo.querySelector('.deck-title');
        if (title) {
          title.classList.add(CLASSES.DECK_SUMMARY_TITLE);
          title
            .querySelectorAll('span[style*="display: block"], span[style*="line-size"]')
            .forEach((span) => {
              span.classList.add(CLASSES.HIDDEN_DECK_CODE);
            });
          title.querySelectorAll('span[style*="font-size: 0"]').forEach((span) => {
            span.classList.add(CLASSES.HIDDEN_DECK_CODE);
          });
        }
        const copyButton = deckInfo.querySelector('.clip-btn-value');
        if (copyButton) copyButton.classList.add(CLASSES.DECK_ICON_BUTTON);
        const viewButton = deckInfo.querySelector('.level-right .is-clickable');
        if (viewButton) viewButton.classList.add(CLASSES.DECK_ICON_BUTTON);
      });

    card.querySelectorAll('.dust-bar.decklist-info').forEach((dustBar) => {
      dustBar.classList.add(CLASSES.DECK_DUST_BAR);
    });
  });
}
