import { uiTranslations } from '../utils/translationsMap';
import { translateExactTextNodes, translateTranslatableAttributes } from '../utils/helpers';
import { translateFilterItem } from './filterTranslation';

export function handleSearch(): void {
  const searchBoxes = Array.from(
    document.querySelectorAll('input[name="search"][placeholder="Type or paste"]'),
  );
  searchBoxes.forEach((element) => {
    if ((element as HTMLInputElement).placeholder === 'Type or paste') {
      (element as HTMLInputElement).placeholder =
        uiTranslations.get('Type or paste') || '输入或粘贴';
    }
  });

  const genericSearchBoxes = Array.from(document.querySelectorAll('input[placeholder="Search"]'));
  genericSearchBoxes.forEach((element) => {
    (element as HTMLInputElement).placeholder = uiTranslations.get('Search') || '搜索';
  });

  const searchHelpButtons = Array.from(
    document.querySelectorAll('button[phx-click*="show_modal"], button[title], button[aria-label]'),
  );
  searchHelpButtons.forEach((button) => {
    const searchWrapper = button.closest('.level.is-mobile');
    if (!searchWrapper || !searchWrapper.querySelector('input[name="search"]')) {
      return;
    }
    ['title', 'aria-label'].forEach((attribute) => {
      const value = button.getAttribute(attribute);
      if (!value) return;
      const translation = uiTranslations.get(value.trim());
      if (translation) {
        button.setAttribute(attribute, translation);
      }
    });
  });

  document.querySelectorAll('[role="dialog"], .modal, .ReactModal__Content').forEach((dialog) => {
    translateExactTextNodes(dialog as Element, uiTranslations);
    translateTranslatableAttributes(dialog as Element, uiTranslations);
  });

  document.querySelectorAll('input[name="search"]').forEach((searchInput) => {
    const scope =
      searchInput.closest('#feed_container') ||
      searchInput.closest('[id]') ||
      searchInput.closest('div');
    if (!scope) return;
    scope.querySelectorAll('.dropdown .dropdown-item a').forEach((link) => {
      translateFilterItem(link);
    });
    scope.querySelectorAll('[x-data] a[class*="tw-w-full"]').forEach((link) => {
      translateFilterItem(link);
    });
    translateExactTextNodes(scope as Element, uiTranslations);
  });
}
