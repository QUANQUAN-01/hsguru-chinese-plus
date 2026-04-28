import { queryCache } from '../utils/dom';
import { uiTranslations } from '../utils/translationsMap';

export function handleFilter(): void {
  const selectors = ['a.dropdown-item', '.has-dropdown > a.button'];
  selectors.forEach((selector) => {
    const elements = queryCache.getOrCreate(selector);
    elements.forEach((element) => {
      const text = element.textContent?.trim() || '';
      const translation = uiTranslations.get(text);
      if (translation) element.textContent = translation;
    });
  });

  const inputs = queryCache.getOrCreate('input[placeholder="Search"]');
  inputs.forEach((input) => {
    input.setAttribute('placeholder', uiTranslations.get('Search') || '搜索');
  });
}
