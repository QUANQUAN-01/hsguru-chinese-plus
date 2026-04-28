import { SELECTORS } from '../utils/constants';
import { queryCache } from '../utils/dom';
import { uiTranslations } from '../utils/translationsMap';

export function handleBasic(): void {
  const selectors = [
    `${SELECTORS.NAV_BASE} > div:nth-child(2) > a`,
    `${SELECTORS.NAV_BASE} > div:nth-child(3) > a`,
    `${SELECTORS.NAV_BASE} > div:nth-child(4) > a`,
    `${SELECTORS.NAV_BASE} > a:nth-child(5)`,
    `${SELECTORS.NAV_BASE} > a:nth-child(6)`,
    `${SELECTORS.NAV_BASE} > div:nth-child(7) > a`,
    `${SELECTORS.NAV_BASE} > div:nth-child(8) > a`,
    'a.navbar-item',
    'a.button',
    'a.tag.column.is-link',
    'a.link',
    'a.twitter-follow-button',
    'button.button',
    'div.subtitle.is-4',
    'div.subtitle.is-5',
    'div.notification',
  ];

  selectors.forEach((selector) => {
    const elements = queryCache.getOrCreate(selector);
    elements.forEach((element) => {
      if (element.matches('a.button') && element.closest('.has-dropdown')) return;
      const text = element.textContent?.trim() || '';
      const chartText = translateChartToggleText(text);
      if (chartText) {
        element.textContent = chartText;
        return;
      }
      const translation = uiTranslations.get(text);
      if (translation) element.textContent = translation;
    });
  });
}

function translateChartToggleText(text: string): string | null {
  const match = text.match(/^Chart\s*([↑↓])?$/);
  if (!match) return null;
  return `图表${match[1] ? ` ${match[1]}` : ''}`;
}
