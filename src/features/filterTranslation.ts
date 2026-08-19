import { queryCache } from '../utils/dom';
import { uiTranslations } from '../utils/translationsMap';

function replaceTextNode(node: Text, translation: string): void {
  const rawText = node.nodeValue || '';
  const leading = rawText.match(/^\s*/)?.[0] || '';
  const trailing = rawText.match(/\s*$/)?.[0] || '';
  node.nodeValue = `${leading}${translation}${trailing}`;
}

export function translateFilterItem(element: Element): void {
  const currentText = element.textContent?.trim() || '';
  const storedKey = element.getAttribute('data-hsguru-filter-key');
  const storedTranslation = storedKey ? uiTranslations.get(storedKey) : undefined;
  const originalKey =
    storedKey && (currentText === storedKey || currentText === storedTranslation)
      ? storedKey
      : currentText;
  if (!originalKey) return;

  if (storedKey !== originalKey) {
    element.setAttribute('data-hsguru-filter-key', originalKey);
  }

  const translation = uiTranslations.get(originalKey);

  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.parentElement) return NodeFilter.FILTER_REJECT;
      if (['SCRIPT', 'STYLE'].includes(node.parentElement.tagName)) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const textNodes: Text[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (node.nodeValue?.trim()) textNodes.push(node as Text);
  }

  const matchingNodes = textNodes.filter((textNode) =>
    uiTranslations.has(textNode.nodeValue?.trim() || ''),
  );
  if (matchingNodes.length > 0) {
    matchingNodes.forEach((textNode) => {
      const nodeText = textNode.nodeValue?.trim() || '';
      const nodeTranslation = uiTranslations.get(nodeText);
      if (nodeTranslation && nodeTranslation !== nodeText) {
        replaceTextNode(textNode, nodeTranslation);
      }
    });
    return;
  }

  if (
    translation &&
    translation !== originalKey &&
    textNodes.length === 1 &&
    textNodes[0].nodeValue?.trim() === originalKey
  ) {
    replaceTextNode(textNodes[0], translation);
  }
}

export function handleFilter(): void {
  const selectors = ['a.dropdown-item', '[x-data] a[class*="tw-w-full"]'];
  selectors.forEach((selector) => {
    const elements = queryCache.getOrCreate(selector);
    elements.forEach((element) => {
      translateFilterItem(element);
    });
  });

  const inputs = queryCache.getOrCreate('input[placeholder="Search"]');
  inputs.forEach((input) => {
    input.setAttribute('placeholder', uiTranslations.get('Search') || '搜索');
  });
}
