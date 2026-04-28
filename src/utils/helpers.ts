import type { TranslationMap } from './translationsMap';
import {
  CLASS_ACCENT_COLORS,
  CLASS_BG_COLORS,
  DEFAULT_CLASS_ACCENT,
  DEFAULT_CLASS_BG,
} from './constants';

// ============================================================
// Time & Text Extraction
// ============================================================

export function extractGamesText(element: Element): string {
  const gamesSpan = element.querySelector('span span');
  if (!gamesSpan) return '';
  const gamesMatch = gamesSpan.textContent.trim().match(/Games: (\d+)/);
  return gamesMatch ? `| 对局：${gamesMatch[1]} ` : '';
}

// ============================================================
// Translation Helpers
// ============================================================

export function translateNodeText(node: Node, translations: TranslationMap): boolean {
  const text = (node.textContent || '').trim();
  const translation = translations.get(text);
  if (translation) {
    node.textContent = translation;
    return true;
  }
  return false;
}

export function translateSelectorText(
  root: ParentNode,
  selector: string,
  translations: TranslationMap,
): void {
  root.querySelectorAll(selector).forEach((node) => {
    translateNodeText(node, translations);
  });
}

export function translateTableHeaders(
  table: HTMLTableElement,
  selector = 'thead th',
  translations: TranslationMap,
): void {
  translateSelectorText(table, selector, translations);
}

export function translateClassNameCells(
  table: HTMLTableElement,
  translations: TranslationMap,
): void {
  translateSelectorText(table, 'td .tag.player-name .basic-black-text', translations);
}

export function translateSortedTextNode(node: Element, translations: TranslationMap): boolean {
  const text = node.textContent!.trim();
  const arrow = text.match(/[↑↓]$/)?.[0] || '';
  const cleanText = text.replace(/[↑↓]$/, '').trim();
  const translation = translations.get(cleanText);
  if (!translation) return false;
  node.textContent = `${translation}${arrow}`;
  return true;
}

export function translateTrailingTotalRow(
  table: HTMLTableElement,
  translations: TranslationMap,
): void {
  const totalRow = table.querySelector('tbody tr:last-child td:first-child');
  if (totalRow?.textContent.trim() === 'Total') {
    totalRow.textContent = translations.get('Total') || '总计';
  }
}

export function translateRelativeTimeText(text: string, translations: TranslationMap): string {
  const timeMatch = text.trim().match(/(\d+)\s*(hours?|minutes?|days?)\s*ago/);
  if (!timeMatch) return text;
  const [, number, unit] = timeMatch;
  const translatedUnit = translations.get(unit + ' ago') || unit;
  return `| ${number} ${translatedUnit} `;
}

export function translateLeaderboardPoints(
  table: HTMLTableElement,
  translations: TranslationMap,
): void {
  table.querySelectorAll('tbody td .tag').forEach((tag) => {
    const text = tag.textContent!.trim();
    const ptsMatch = text.match(/^(\d+)\s*pts$/i);
    if (ptsMatch) {
      tag.textContent = `${ptsMatch[1]}积分`;
    } else {
      const translation = translations.get(text);
      if (translation) {
        tag.textContent = translation;
      }
    }
    const label = tag.getAttribute('aria-label');
    if (label) {
      const translation = translations.get(label.trim());
      if (translation) {
        tag.setAttribute('aria-label', translation);
      }
    }
  });
}

export function translateTextWithFallback(text: string, translations: TranslationMap): string {
  return translations.get(text) || text;
}

// ============================================================
// Clipboard Feedback
// ============================================================

let clipboardToastTimer: ReturnType<typeof setTimeout> | undefined;

export function showClipboardFeedback(
  button: HTMLElement,
  successLabel: string,
  copyLabel: string,
): void {
  let toast = document.getElementById('hsguru-copy-toast') as HTMLElement | null;
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'hsguru-copy-toast';
    toast.className = 'hsguru-copy-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = successLabel;
  toast.classList.add('is-visible');
  clearTimeout(clipboardToastTimer);
  clipboardToastTimer = setTimeout(() => {
    toast!.classList.remove('is-visible');
  }, 1400);

  button.classList.add('hsguru-copy-success');
  button.setAttribute('aria-label', successLabel);
  clearTimeout((button as any)._hsguruCopyTimer);
  (button as any)._hsguruCopyTimer = setTimeout(() => {
    button.classList.remove('hsguru-copy-success');
    button.setAttribute('aria-label', copyLabel);
  }, 1400);
}

// ============================================================
// Subtitle Replacement
// ============================================================

export function replaceSubtitle(element: Element, subtitleHTML: string): void {
  const titleElement = document.querySelector('.title.is-2');
  if (!titleElement) return;
  const newSubtitleElement = document.createElement('div');
  newSubtitleElement.className = 'new_subtitle';
  newSubtitleElement.innerHTML = subtitleHTML;
  titleElement.insertAdjacentElement('afterend', newSubtitleElement);
  element.remove();
}

// ============================================================
// Generic DOM Translation Helpers
// ============================================================

export function translateExactTextNodes(root: Element, translations: TranslationMap): void {
  if (!root) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.parentElement) return NodeFilter.FILTER_REJECT;
      if (['SCRIPT', 'STYLE'].includes(node.parentElement.tagName)) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let node;
  while ((node = walker.nextNode())) {
    const rawText = node.nodeValue || '';
    const trimmedText = rawText.trim();
    if (!trimmedText) continue;
    const translation = translations.get(trimmedText);
    if (!translation || translation === trimmedText) continue;
    const leading = rawText.match(/^\s*/)?.[0] || '';
    const trailing = rawText.match(/\s*$/)?.[0] || '';
    node.nodeValue = `${leading}${translation}${trailing}`;
  }
}

export function translateTranslatableAttributes(root: Element, translations: TranslationMap): void {
  if (!root) return;
  const attributeSelectors: [string, string][] = [
    ['[placeholder]', 'placeholder'],
    ['[title]', 'title'],
    ['[aria-label]', 'aria-label'],
  ];
  attributeSelectors.forEach(([selector, attribute]) => {
    root.querySelectorAll(selector).forEach((element) => {
      const value = element.getAttribute(attribute);
      if (!value) return;
      const translation = translations.get(value.trim());
      if (translation) {
        element.setAttribute(attribute, translation);
      }
    });
  });
}

// ============================================================
// Deck Name Translation (wrappers)
// ============================================================

export function translateDeckNameCell(cell: Element, translateFn: (name: string) => string): void {
  const link = cell.querySelector('a');
  if (link) {
    translateDeckNameInNode(link, translateFn);
    return;
  }
  translateDeckNameInNode(cell, translateFn);
}

function translateDeckNameInNode(node: Element, translateFn: (name: string) => string): boolean {
  const originalText = node.textContent!.trim();
  const translatedText = translateFn(originalText);
  if (translatedText && translatedText !== originalText) {
    node.textContent = translatedText;
    return true;
  }
  return false;
}

export function getMappedClassValue(
  element: Element,
  mapping: Record<string, string>,
  fallback: string,
): string {
  const className = Object.keys(mapping).find((name) => element.classList.contains(name));
  return mapping[className!] || fallback;
}

export function applyClassAccentStyles(element: Element): void {
  const htmlEl = element as HTMLElement;
  const accent = getMappedClassValue(element, CLASS_ACCENT_COLORS, DEFAULT_CLASS_ACCENT);
  const bg = getMappedClassValue(element, CLASS_BG_COLORS, DEFAULT_CLASS_BG);
  htmlEl.style.setProperty('--hsguru-class-accent', accent);
  htmlEl.style.setProperty('--hsguru-class-bg', bg);
  htmlEl.style.setProperty(
    'background',
    `linear-gradient(0deg, ${bg}, ${bg}), #f7edcf`,
    'important',
  );
  htmlEl.style.setProperty('border-left', `5px solid ${accent}`, 'important');
}

export function replaceDeckNameTextNode(
  cell: Element,
  translateFn: (name: string) => string,
): void {
  const originalText =
    Array.from(cell.childNodes)
      .filter((node) => node.nodeType === Node.TEXT_NODE)
      .map((node) => node.textContent)
      .join(' ')
      .trim() || cell.textContent!.trim();
  const translatedText = translateFn(originalText);
  if (!translatedText || translatedText === originalText) return;
  const textNode = Array.from(cell.childNodes).find(
    (node) => node.nodeType === Node.TEXT_NODE && node.textContent!.trim(),
  );
  if (textNode) {
    textNode.textContent = ` ${translatedText}`;
  } else {
    cell.appendChild(document.createTextNode(` ${translatedText}`));
  }
}

export function extractRelativeTimeText(
  sourceElement: Element | null,
  translations: TranslationMap,
): string {
  if (!sourceElement) return '';
  const timeMatch = sourceElement
    .textContent!.trim()
    .match(/(\d+)\s*(hours?|minutes?|days?)\s*ago/);
  if (!timeMatch) return '';
  const [, number, unit] = timeMatch;
  return `| ${number} ${translations.get(unit + ' ago')} `;
}
