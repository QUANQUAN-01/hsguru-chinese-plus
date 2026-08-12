import { BASE_URL, CLASSES } from '../utils/constants';
import { uiTranslations } from '../utils/translationsMap';

const listConfigs = {
  format: ['Standard', 'Wild'],
  rank: [
    'Top 100',
    'Top 200',
    'Top 500',
    'Top 1000',
    'Top 5000',
    'Top 1k',
    'Top 5k',
    'Legend',
    'Diamond 4-1',
    'Diamond-Legend',
    'All',
  ],
  class: [
    'Player Class',
    'Any Class',
    'Opponent Class',
    'Death Knight',
    'Demon Hunter',
    'Druid',
    'Hunter',
    'Mage',
    'Paladin',
    'Priest',
    'Rogue',
    'Shaman',
    'Warlock',
    'Warrior',
  ],
  vsClass: [
    'Any Class',
    "Opponent's Class",
    'VS Death Knight',
    'VS Demon Hunter',
    'VS Druid',
    'VS Hunter',
    'VS Mage',
    'VS Paladin',
    'VS Priest',
    'VS Rogue',
    'VS Shaman',
    'VS Warlock',
    'VS Warrior',
  ],
};

const ALPINE_TRIGGER = '[x-data] a.button';
const ALPINE_MENU_ITEM = '[x-data] a[class*="tw-w-full"]';
const LEGACY_TRIGGER = '.has-dropdown > a.button';
const LEGACY_MENU_ITEM = 'a.dropdown-item';

function applyFilterIcons(root: Element, lists: string[][]): void {
  const textToList = new Map<string, string[]>();
  lists.forEach((list) => {
    list.forEach((text) => {
      textToList.set(text, list);
    });
  });
  const filterNodes = root.querySelectorAll(
    `${ALPINE_TRIGGER}, ${ALPINE_MENU_ITEM}, ${LEGACY_TRIGGER}, ${LEGACY_MENU_ITEM}`,
  );
  filterNodes.forEach((node) => {
    const text = node.textContent?.trim() || '';
    if (textToList.has(text)) {
      node.classList.add('class-icon');
      if (node.matches(`${ALPINE_TRIGGER}, ${LEGACY_TRIGGER}`)) {
        node.classList.add('button-with-icon');
      }
      node.classList.add(`class-${text.toLowerCase().replace(/\s+/g, '-')}`);
    }
  });
}

function decorateAlpineToolbar(root: ParentNode): void {
  root.querySelectorAll<HTMLElement>('div[class*="tw-flex-wrap"]').forEach((flex) => {
    if (!flex.classList.contains('filters-container') && flex.querySelector(ALPINE_TRIGGER)) {
      flex.classList.add('filters-container');
      flex.dataset.hsguruFilterContainer = 'true';
    }
  });
}

function collectAlpineToolbars(root: ParentNode): HTMLElement[] {
  const results: HTMLElement[] = [];
  root.querySelectorAll<HTMLElement>('div[class*="tw-flex-wrap"]').forEach((flex) => {
    if (flex.querySelector(ALPINE_TRIGGER) && !flex.classList.contains('filters-container')) {
      results.push(flex);
    }
  });
  return results;
}

function createDeckDetailFilterBar(): void {
  const columns = Array.from(document.querySelectorAll('div.columns.is-multiline .column'));
  for (const column of columns) {
    if (!(column instanceof HTMLElement) || !column.querySelector('table')) continue;
    const container = column.querySelector(':scope > div:not(.subtitle)') as HTMLElement | null;
    if (!container) continue;
    const filterSpans = Array.from(container.children).filter(
      (node) => node.tagName === 'SPAN' && node.querySelector(ALPINE_TRIGGER),
    );
    if (filterSpans.length === 0) continue;
    if (container.querySelector(':scope > .filters-container[data-hsguru-filter-container="true"]')) {
      continue;
    }
    const filterBar = document.createElement('div');
    filterBar.className = `filters-container ${CLASSES.DECK_DETAIL_FILTERS}`;
    filterBar.dataset.hsguruFilterContainer = 'true';
    filterSpans.forEach((span) => {
      span
        .querySelectorAll(ALPINE_TRIGGER)
        .forEach((button) => button.classList.add(CLASSES.DECK_DETAIL_FILTER_BUTTON));
      filterBar.appendChild(span);
    });
    container.insertBefore(filterBar, container.firstChild);
  }
}

function createFilterContainer({
  targetSelector,
  lists,
}: {
  targetSelector: string | Element;
  lists: string[][];
}): void {
  let targetElement: Element | null;
  if (typeof targetSelector === 'string') {
    targetElement = document.querySelector(targetSelector);
  } else {
    targetElement = targetSelector;
  }

  if (!targetElement) return;

  const siblings = Array.from((targetElement.parentNode as Element).children).filter(
    (node) => node !== targetElement,
  );

  // 新版 Alpine 工具栏：flex 容器自身即为筛选容器（decorateAlpineToolbar 已标记）
  const existingToolbar = siblings.find(
    (node) =>
      node instanceof HTMLElement &&
      node.querySelector(ALPINE_TRIGGER) &&
      (node.classList.contains('filters-container') ||
        node.querySelector('[class*="tw-flex-wrap"].filters-container')),
  );
  if (existingToolbar) return;

  const existingContainer = siblings.find(
    (node) =>
      node instanceof HTMLElement &&
      node.classList.contains('filters-container') &&
      node.dataset.hsguruFilterContainer === 'true',
  );

  if (existingContainer) return;

  const container = document.createElement('div');
  container.className = 'filters-container';
  container.dataset.hsguruFilterContainer = 'true';
  const controls = siblings.filter((node) => {
    if (!(node instanceof HTMLElement)) return false;
    if (node.querySelector(ALPINE_TRIGGER)) return true;
    return (
      node.tagName === 'SPAN' ||
      node.matches('.has-dropdown.dropdown, a.button, button.button, form, select')
    );
  });
  const textToList = new Map<string, string[]>();
  lists.forEach((list) => {
    list.forEach((text) => {
      textToList.set(text, list);
    });
  });
  if (controls.length === 0) return;
  controls.forEach((control) => {
    control
      .querySelectorAll(`${ALPINE_TRIGGER}, ${LEGACY_TRIGGER}`)
      .forEach((button) => {
        const text = button.textContent?.trim() || '';
        if (textToList.has(text)) {
          button.classList.add('class-icon', 'button-with-icon');
          button.classList.add(`class-${text.toLowerCase().replace(/\s+/g, '-')}`);
        }
      });
    const dropdownItems = Array.from(
      control.querySelectorAll(`${ALPINE_MENU_ITEM}, a.dropdown-item`),
    );
    dropdownItems.forEach((item) => {
      const text = item.textContent?.trim() || '';
      if (textToList.has(text)) {
        item.classList.add('class-icon');
        item.classList.add(`class-${text.toLowerCase().replace(/\s+/g, '-')}`);
      }
    });
    control.querySelectorAll('a.button, button.button, a.dropdown-item').forEach((button) => {
      button.classList.add('hsguru-filter-button');
    });
    if (control.matches('button.button')) {
      control.classList.add('hsguru-filter-button');
    }
  });
  controls.forEach((control) => container.appendChild(control));
  (targetElement.parentNode as Element).insertBefore(container, targetElement);
}

const pageHandlers: Array<{
  urlPattern: RegExp;
  handler: () => void;
}> = [
  {
    urlPattern: new RegExp(`^${BASE_URL}decks(\\?|$)`),
    handler: () => {
      decorateAlpineToolbar(document.body);
      createFilterContainer({
        targetSelector: '#deck_stats_viewport',
        lists: [listConfigs.format, listConfigs.rank, listConfigs.class],
      });
    },
  },
  {
    urlPattern: new RegExp(`^${BASE_URL}deck/(\\d+|[A-Za-z0-9+/=%]+)(?:\\?.*)?$`),
    handler: () => {
      decorateAlpineToolbar(document.body);
      createDeckDetailFilterBar();
      createFilterContainer({
        targetSelector: 'table',
        lists: [listConfigs.rank],
      });
    },
  },
  {
    urlPattern: new RegExp(`^${BASE_URL}meta(\\?|$)`),
    handler: () => {
      decorateAlpineToolbar(document.body);
      const table = document.querySelector('table');
      if (table) {
        const parentDiv = table.parentNode as Element;
        if (parentDiv) {
          createFilterContainer({
            targetSelector: parentDiv,
            lists: [listConfigs.format, listConfigs.rank, listConfigs.vsClass],
          });
        }
      }
    },
  },
  {
    urlPattern: new RegExp(`^${BASE_URL}matchups(\\?|$)`),
    handler: () => {
      decorateAlpineToolbar(document.body);
      createFilterContainer({
        targetSelector: '#matchups_table_wrapper, table',
        lists: [listConfigs.rank],
      });
    },
  },
  {
    urlPattern: new RegExp(`^${BASE_URL}archetype/[^/]+$`),
    handler: () => {
      decorateAlpineToolbar(document.body);
      createFilterContainer({
        targetSelector: 'table',
        lists: [listConfigs.format, listConfigs.rank],
      });
    },
  },
  {
    urlPattern: new RegExp(`^${BASE_URL}card-stats\\?archetype=`),
    handler: () => {
      decorateAlpineToolbar(document.body);
      createFilterContainer({
        targetSelector: 'table',
        lists: [listConfigs.format, listConfigs.rank, listConfigs.vsClass],
      });
    },
  },
  {
    urlPattern: new RegExp(`^${BASE_URL}card-stats\\?deck_id=\\d+`),
    handler: () => {
      decorateAlpineToolbar(document.body);
      createFilterContainer({
        targetSelector: 'table',
        lists: [listConfigs.rank],
      });
    },
  },
  {
    urlPattern: new RegExp(`^${BASE_URL}card-stats`),
    handler: () => {
      decorateAlpineToolbar(document.body);
      createFilterContainer({
        targetSelector: 'table',
        lists: [listConfigs.format, listConfigs.rank, listConfigs.class],
      });
    },
  },
  {
    urlPattern: new RegExp(`^${BASE_URL}streamer-decks(\\?|$)`),
    handler: () => {
      const toolbar = document.querySelector('.columns.is-pulled-left');
      if (toolbar) {
        toolbar.classList.add('filters-container', CLASSES.STREAMER_FILTERS);
        toolbar.classList.remove('is-pulled-left');
      }
      decorateAlpineToolbar(document.body);
      applyFilterIcons(document.body, [listConfigs.format, listConfigs.rank, listConfigs.class]);
    },
  },
  {
    urlPattern: new RegExp(`^${BASE_URL}leaderboard(?:[/?].*)?$`),
    handler: () => {
      const toolbars = new Set<Element>(collectAlpineToolbars(document.body));
      document.querySelectorAll(`form[action^='/leaderboard']`).forEach((form) => {
        const wrapper = form.closest('div[class*="tw-flex-wrap"]');
        if (wrapper) {
          toolbars.add(wrapper);
        } else {
          toolbars.add(form);
        }
      });
      toolbars.forEach((toolbar) => {
        if ((toolbar as HTMLElement).dataset.hsguruLeaderboardFiltersStyled === 'true') {
          return;
        }
        (toolbar as HTMLElement).dataset.hsguruLeaderboardFiltersStyled = 'true';
        toolbar.classList.add('filters-container', CLASSES.LEADERBOARD_FILTERS);
        if (toolbar.tagName === 'FORM') {
          const nestedToolbar = toolbar.querySelector('.filters-container');
          if (nestedToolbar) {
            toolbar.classList.remove('filters-container', CLASSES.LEADERBOARD_FILTERS);
            delete (toolbar as HTMLElement).dataset.hsguruLeaderboardFiltersStyled;
            return;
          }
          toolbar.querySelectorAll('span.button.is-link, a.button.is-link').forEach((button) => {
            button.classList.add(CLASSES.LEADERBOARD_NAV_BUTTON);
          });
        } else {
          toolbar.querySelectorAll(':scope > form.filters-container').forEach((form) => {
            form.classList.remove('filters-container', CLASSES.LEADERBOARD_FILTERS);
            delete (form as HTMLElement).dataset.hsguruLeaderboardFiltersStyled;
          });
          toolbar
            .querySelectorAll(':scope > span.button, :scope > a.button.is-link')
            .forEach((button) => {
              button.classList.add(CLASSES.LEADERBOARD_NAV_BUTTON);
            });
          toolbar.querySelectorAll(':scope > form[action^="/leaderboard"]').forEach((form) => {
            form.classList.add(CLASSES.LEADERBOARD_SEARCH_FORM);
            const input = form.querySelector("input.input, input[type='search']");
            if (input) {
              input.classList.add(CLASSES.LEADERBOARD_SEARCH_INPUT);
              if (!input.getAttribute('placeholder')) {
                input.setAttribute('placeholder', uiTranslations.get('Search') || '搜索');
              }
            }
            form.querySelectorAll('a.button.is-link, span.button.is-link').forEach((btn) => {
              btn.classList.add(CLASSES.LEADERBOARD_NAV_BUTTON);
            });
          });
        }
      });
      createLeaderboardFilterContainer();
    },
  },
];

export function handleFilterStyle(): void {
  for (const { urlPattern, handler } of pageHandlers) {
    if (urlPattern.test(window.location.href)) {
      handler();
      break;
    }
  }

  applyFilterIcons(document.body, [
    listConfigs.format,
    listConfigs.rank,
    listConfigs.class,
    listConfigs.vsClass,
  ]);
}

function createLeaderboardFilterContainer(): void {
  const anchor = document.querySelector(
    'table[class*="tw-w-full"], .svg-container, table.table.is-fullwidth, table.table.is-striped.is-fullwidth.is-narrow',
  );

  if (!anchor || !anchor.parentElement) {
    return;
  }

  const parent = anchor.parentElement;

  if (
    parent.querySelector(
      ":scope > .filters-container.hsguru-leaderboard-filters[data-hsguru-filter-container='true']",
    )
  ) {
    return;
  }

  const siblings = Array.from(parent.children);
  const anchorIndex = siblings.indexOf(anchor);
  if (anchorIndex <= 0) return;

  const controls: Element[] = [];
  for (let i = anchorIndex - 1; i >= 0; i -= 1) {
    const node = siblings[i];
    if (!(node instanceof HTMLElement)) continue;
    if (
      node.matches(
        `.has-dropdown.dropdown, form[action^='/leaderboard'], a.button.is-link, span.button.is-link, .button.is-link, input.input, input[type='number'], input[type='search'], select`,
      )
    ) {
      controls.unshift(node);
      continue;
    }
    if (
      controls.length === 0 &&
      (node.tagName === 'BR' ||
        (node as HTMLElement).id === 'nitropay-below-title-leaderboard' ||
        node.classList.contains('title') ||
        node.classList.contains('alert'))
    ) {
      continue;
    }
    break;
  }

  if (controls.length === 0) return;

  const container = document.createElement('div');
  container.className = `filters-container ${CLASSES.LEADERBOARD_FILTERS}`;
  container.dataset.hsguruFilterContainer = 'true';
  container.dataset.hsguruLeaderboardFiltersStyled = 'true';
  controls.forEach((node) => {
    if (node.matches('a.button.is-link, span.button.is-link, .button.is-link')) {
      node.classList.add(CLASSES.LEADERBOARD_NAV_BUTTON);
    }
    if (node.matches("input.input, input[type='number'], input[type='search'], select")) {
      node.classList.add(CLASSES.LEADERBOARD_INLINE_INPUT);
    }
    if (node.matches(`form[action^='/leaderboard']`)) {
      const visibleInputs = Array.from(
        node.querySelectorAll("input.input, input[type='number'], input[type='search'], select"),
      ).filter(
        (input) =>
          (input as HTMLInputElement).type !== 'hidden' && !input.classList.contains('is-hidden'),
      );
      const searchInput = visibleInputs.find(
        (input) =>
          input.matches("input[type='search']") || (input as HTMLInputElement).type === 'text',
      );
      if (searchInput) {
        node.classList.add(CLASSES.LEADERBOARD_SEARCH_FORM);
        searchInput.classList.add(CLASSES.LEADERBOARD_SEARCH_INPUT);
        if (!searchInput.getAttribute('placeholder')) {
          searchInput.setAttribute('placeholder', uiTranslations.get('Search') || '搜索');
        }
        node.querySelectorAll('a.button.is-link, span.button.is-link').forEach((btn) => {
          btn.classList.add(CLASSES.LEADERBOARD_NAV_BUTTON);
        });
      } else if (visibleInputs.length > 0) {
        node.classList.add(CLASSES.LEADERBOARD_INLINE_FORM);
        Array.from(node.children).forEach((child) => {
          if (!(child instanceof HTMLElement)) return;
          if (
            child.classList.contains('is-pulled-right') &&
            child.querySelector("input.input, input[type='number'], input[type='search'], select")
          ) {
            child.classList.add(CLASSES.LEADERBOARD_INLINE_FIELD);
          }
        });
        visibleInputs.forEach((input) => {
          input.classList.add(CLASSES.LEADERBOARD_INLINE_INPUT);
        });
      }
    }

    container.appendChild(node);
  });

  parent.insertBefore(container, anchor);
}
