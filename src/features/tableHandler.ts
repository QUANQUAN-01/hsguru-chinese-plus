import {
  BASE_URL,
  DATASET,
  CLASSES,
  BUTTON_TITLES,
  UI_TEXT,
  CLASS_ACCENT_COLORS,
  DEFAULT_CLASS_ACCENT,
} from '../utils/constants';
import { uiTranslations } from '../utils/translationsMap';
import {
  translateTableHeaders,
  translateClassNameCells,
  translateTrailingTotalRow,
  translateNodeText,
  translateSortedTextNode,
  translateDeckNameCell,
  translateLeaderboardPoints,
  applyClassAccentStyles,
  replaceDeckNameTextNode,
  getMappedClassValue,
} from '../utils/helpers';
import { translationCache, cardCache } from '../utils/translationCache';
import { generateDeckTranslation } from './deckTranslation';

export function handleTable(): void {
  const tableConfigs: Record<
    string,
    { pattern: RegExp; handler: (table: HTMLTableElement) => void }
  > = {
    card: {
      pattern: /^card\/\d+$/,
      handler: (table) => {
        const firstColumnCells = table.querySelectorAll('tbody tr td:first-child');
        firstColumnCells.forEach((cell) => {
          const text = cell.textContent?.trim() || '';
          const translation = uiTranslations.get(text);
          if (translation) cell.textContent = translation;
        });

        const rows = table.querySelectorAll('tbody tr');
        rows.forEach((row, index) => {
          const secondCell = row.querySelector('td:nth-child(2)');
          if (!secondCell) return;
          const text = secondCell.textContent?.trim() || '';
          if (index === 0) {
            const translation = translationCache.getOrCreate(text, (t) => cardCache.get(t) || t);
            if (translation !== text) {
              secondCell.textContent = translation;
            }
          } else if ([2, 8, 10, 12, 18].includes(index)) {
            const translation = uiTranslations.get(text);
            if (translation) secondCell.textContent = translation;
          }
        });
      },
    },
    deck: {
      pattern: /^deck\/(\d+|[A-Za-z0-9+/=%]+)$/,
      handler: (table) => {
        translateTableHeaders(table, 'thead th', uiTranslations);
        translateClassNameCells(table, uiTranslations);
        translateTrailingTotalRow(table, uiTranslations);
      },
    },
    meta: {
      pattern: /^meta$/,
      handler: (table) => {
        translateMetaChart();

        table.dataset.hsguruStyled = 'true';
        table.classList.add(CLASSES.META_TABLE);

        const headers = table.querySelectorAll('thead th');
        headers.forEach((header) => {
          const link = header.querySelector('a');
          if (link) {
            translateSortedTextNode(link, uiTranslations);
          } else {
            translateNodeText(header, uiTranslations);
          }
        });

        const rows = table.querySelectorAll('tbody tr');
        rows.forEach((row) => {
          const archetypeCell = row.querySelector('td:first-child.decklist-info');
          if (archetypeCell) {
            archetypeCell.classList.add(CLASSES.META_ARCHETYPE_CELL);
            applyClassAccentStyles(archetypeCell);
            translateDeckNameCell(archetypeCell, generateDeckTranslation);
          }
          const climbingSpeedCell = row.querySelector('td:last-child');
          if (climbingSpeedCell) {
            const text = climbingSpeedCell.textContent?.trim() || '';
            if (text.includes('⭐/h')) {
              climbingSpeedCell.textContent = text.replace('/h', '/小时');
            }
          }
        });
      },
    },
    'card-stats': {
      pattern: /^card-stats/,
      handler: (table) => {
        const headers = table.querySelectorAll('thead th a');
        headers.forEach((header) => {
          const tooltipSpan = header.querySelector(`span[${DATASET.BALLOON_POS}]`);
          if (tooltipSpan) {
            const text = tooltipSpan.textContent?.trim() || '';
            const impacts = ['Mulligan Impact', 'Drawn Impact', 'Not Drawn Impact', 'Kept Impact'];
            for (const impact of impacts) {
              if (text.startsWith(impact)) {
                const arrow = text.match(/[↑↓]$/)?.[0] || '';
                tooltipSpan.textContent = `${uiTranslations.get(impact)}${arrow}`;
                tooltipSpan.setAttribute(
                  'aria-label',
                  uiTranslations.get(`${impact} Tooltip`) || '',
                );
                break;
              }
            }
          } else {
            const text = header.textContent?.trim() || '';
            const counts = [
              'Card',
              'Mulligan Count',
              'Drawn Count',
              'Not Drawn Count',
              'Kept Count',
            ];
            for (const count of counts) {
              if (text.startsWith(count)) {
                const arrow = text.match(/[↑↓]$/)?.[0] || '';
                header.textContent = `${uiTranslations.get(count)}${arrow}`;
                break;
              }
            }
          }
        });

        const classCells = table.querySelectorAll('th .class-header .class-name');
        classCells.forEach((cell) => {
          const text = cell.textContent?.trim() || '';
          const translation = uiTranslations.get(text);
          if (translation) {
            cell.textContent = translation;
          }
        });
      },
    },
    archetype: {
      pattern: /^archetype\/[^/]+$/,
      handler: (table) => {
        translateTableHeaders(table, 'thead th', uiTranslations);
        translateClassNameCells(table, uiTranslations);
        translateTrailingTotalRow(table, uiTranslations);
      },
    },
    replays: {
      pattern: /^replays/,
      handler: (table) => {
        translateTableHeaders(table, 'thead th', uiTranslations);
        const gameModes = table.querySelectorAll('td p.tag');
        gameModes.forEach((mode) => {
          translateNodeText(mode, uiTranslations);
        });
        const replayLinks = table.querySelectorAll('td a');
        replayLinks.forEach((link) => {
          const text = link.textContent?.trim() || '';
          if (text === 'View Replay') {
            link.textContent = uiTranslations.get(text) || null;
          }
        });
        const timeCells = table.querySelectorAll('td:last-child');
        timeCells.forEach((cell) => {
          const text = cell.textContent?.trim() || '';
          const timeMatch = text.match(/(\d+) (hour|hours|minute|minutes) ago/);
          if (timeMatch) {
            const [, number, unit] = timeMatch;
            cell.textContent = `${number} ${uiTranslations.get(unit + ' ago')}`;
          }
        });
      },
    },
    'leaderboard-player-stats': {
      pattern: /^leaderboard\/player-stats/,
      handler: (table) => {
        const headers = table.querySelectorAll('thead th a.is-text');
        headers.forEach((header) => {
          translateSortedTextNode(header, uiTranslations);
        });
      },
    },
    'leaderboard-points': {
      pattern: /^leaderboard\/points/,
      handler: (table) => {
        translateTableHeaders(table, 'thead th', uiTranslations);
        translateLeaderboardPoints(table, uiTranslations);
      },
    },
    leaderboard: {
      pattern: /^leaderboard(?:\/|$)/,
      handler: (table) => {
        translateTableHeaders(table, 'thead th', uiTranslations);
        translateLeaderboardPoints(table, uiTranslations);
      },
    },
    'streamer-decks': {
      pattern: /^streamer-decks/,
      handler: (table) => {
        table.dataset.hsguruStyled = 'true';
        table.classList.add(CLASSES.STREAMER_DECKS_TABLE);

        const headers = table.querySelectorAll('thead th');
        headers.forEach((header) => {
          const abbr = header.querySelector('abbr');
          if (abbr) {
            const text = abbr.textContent?.trim() || '';
            const title = abbr.getAttribute('title');
            if (uiTranslations.get(text)) {
              abbr.textContent = uiTranslations.get(text)!;
            }
            if (title && uiTranslations.get(title)) {
              abbr.setAttribute('title', uiTranslations.get(title)!);
            }
          } else {
            translateNodeText(header, uiTranslations);
          }
        });

        const formatCells = table.querySelectorAll('tbody tr td:nth-child(3)');
        formatCells.forEach((cell) => {
          const formatTag = cell.querySelector('.tag');
          if (formatTag) translateNodeText(formatTag, uiTranslations);
        });

        const deckCards = table.querySelectorAll('tbody tr td:first-child .decklist-info');
        deckCards.forEach((deckCard) => {
          const accentColor = getMappedClassValue(
            deckCard,
            CLASS_ACCENT_COLORS,
            DEFAULT_CLASS_ACCENT,
          );
          const deckCell = deckCard.closest('td');
          if (deckCell) {
            deckCell.classList.add(CLASSES.STREAMER_DECK_CELL);
            deckCell.style.setProperty('--hsguru-streamer-accent', accentColor);
          }
        });

        const rankCells = table.querySelectorAll(
          'tbody tr td:nth-child(4), tbody tr td:nth-child(5), tbody tr td:nth-child(6)',
        );
        rankCells.forEach((cell) => {
          if (!cell.textContent?.trim()) {
            cell.classList.add(CLASSES.STREAMER_EMPTY_RANK);
            cell.textContent = UI_TEXT.NO_RANK;
          }
        });
      },
    },
    esports: {
      pattern: /^esports/,
      handler: (table) => {
        translateTableHeaders(table, 'thead th', uiTranslations);
        const statusCells = table.querySelectorAll('tbody tr td:nth-child(3)');
        statusCells.forEach((cell) => {
          const statusSpans = cell.querySelectorAll('span');
          statusSpans.forEach((span) => {
            translateNodeText(span, uiTranslations);
          });
        });
      },
    },
    matchups: {
      pattern: /^matchups/,
      handler: (table) => {
        table.dataset.hsguruStyled = 'true';

        const wrapper = table.closest('#matchups_table_wrapper');
        if (wrapper) {
          wrapper.classList.add(CLASSES.MATCHUPS_WRAPPER);
        }
        table.classList.add(CLASSES.MATCHUPS_TABLE);

        const headerButtons = table.querySelectorAll('th button');
        headerButtons.forEach((button) => {
          const originalText = button.textContent?.trim() || '';
          const cleanText = originalText.replace(/:$/, '').trim();
          const translatedText = uiTranslations.get(cleanText);
          if (translatedText) {
            button.textContent = translatedText;
          }
          button.classList.add(CLASSES.MATCHUPS_ACTION);
          if (cleanText === 'Winrate') button.classList.add(CLASSES.MATCHUPS_ACTION_WINRATE);
          if (cleanText === 'Seed Weights') button.classList.add(CLASSES.MATCHUPS_ACTION_FILL);
          if (cleanText === 'Reset Weights') button.classList.add(CLASSES.MATCHUPS_ACTION_RESET);
          if (cleanText === 'Popularity') button.classList.add(CLASSES.MATCHUPS_ACTION_USAGE);
          if (cleanText === 'Archetype') button.classList.add(CLASSES.MATCHUPS_ACTION_ARCHETYPE);
          if (BUTTON_TITLES[cleanText as keyof typeof BUTTON_TITLES]) {
            const btnEl = button as HTMLButtonElement;
            btnEl.title = BUTTON_TITLES[cleanText as keyof typeof BUTTON_TITLES];
            btnEl.setAttribute(
              'aria-label',
              BUTTON_TITLES[cleanText as keyof typeof BUTTON_TITLES],
            );
          }
        });

        const metaHeader = table.querySelector(
          `th.${CLASSES.MATCHUPS_META_HEADER}, thead th:nth-child(2)`,
        );
        if (metaHeader && !metaHeader.querySelector(`.${CLASSES.MATCHUPS_META_SEPARATOR}`)) {
          const sep = document.createElement('span');
          sep.className = CLASSES.MATCHUPS_META_SEPARATOR;
          sep.textContent = UI_TEXT.SEPARATOR;
          metaHeader.appendChild(sep);
        }

        const allHeaders = table.querySelectorAll('thead th');
        allHeaders.forEach((header, index) => {
          if (index === 0) header.classList.add(CLASSES.MATCHUPS_CORNER_CELL);
          if (index === 1) header.classList.add(CLASSES.MATCHUPS_META_HEADER);
        });

        const classHeaders = table.querySelectorAll('th.class-background');
        classHeaders.forEach((header) => {
          header.classList.add(CLASSES.MATCHUPS_DECK_HEADER);
          applyClassAccentStyles(header);
          const labelButton = header.querySelector('button');
          translateDeckNameCell(labelButton || header, generateDeckTranslation);
        });

        const firstColHeaders = table.querySelectorAll('tbody td:nth-child(1)');
        firstColHeaders.forEach((cell) => {
          cell.classList.add(CLASSES.MATCHUPS_STICKY_COL, CLASSES.MATCHUPS_WINRATE_CELL);
        });

        const secondColHeaders = table.querySelectorAll('tbody td:nth-child(2)');
        secondColHeaders.forEach((cell) => {
          cell.classList.add(CLASSES.MATCHUPS_STICKY_COL_2, CLASSES.MATCHUPS_ARCHETYPE_CELL);
          applyClassAccentStyles(cell);
        });

        const classCells = table.querySelectorAll('td.class-background');
        classCells.forEach((cell) => {
          cell.classList.add(CLASSES.MATCHUPS_DECK_CELL);
          applyClassAccentStyles(cell);
          replaceDeckNameTextNode(cell, generateDeckTranslation);
        });

        const dataCells = table.querySelectorAll('tbody td');
        dataCells.forEach((cell) => {
          if (
            cell.classList.contains('class-background') ||
            cell.classList.contains(CLASSES.MATCHUPS_WINRATE_CELL) ||
            cell.classList.contains(CLASSES.MATCHUPS_ARCHETYPE_CELL)
          )
            return;
          const text = cell.textContent?.trim() || '';
          const numeric = Number.parseFloat(text.replace(/[^\d.-]/g, ''));
          if (Number.isNaN(numeric)) return;
          cell.classList.add(CLASSES.MATCHUPS_HEAT_CELL);
        });

        const tooltipCells = table.querySelectorAll('tbody td[aria-label]');
        tooltipCells.forEach((cell) => {
          const label = cell.getAttribute('aria-label');
          if (!label) return;
          const matchupMatch = label.match(/^(.*?) versus (.*?) - ([\d,]+) games?$/);
          const totalMatch = label.match(/^(.*?) - ([\d,]+) games?$/);
          if (matchupMatch) {
            const playerDeck = generateDeckTranslation(matchupMatch[1].trim());
            const opponentDeck = generateDeckTranslation(matchupMatch[2].trim());
            const games = matchupMatch[3];
            const isLowSample = !cell.textContent?.trim();
            const lowSampleNote = isLowSample ? '，少于100局，未显示胜率' : '';
            cell.setAttribute(
              'aria-label',
              `${playerDeck} 对阵 ${opponentDeck} - ${games} 局${lowSampleNote}`,
            );
            if (isLowSample) {
              cell.classList.add(CLASSES.MATCHUPS_LOW_SAMPLE);
              cell.textContent = UI_TEXT.LOW_SAMPLE;
            }
          } else if (totalMatch) {
            const deckName = generateDeckTranslation(totalMatch[1].trim());
            const games = totalMatch[2];
            cell.setAttribute('aria-label', `${deckName} - 总局数 ${games} 局`);
          }
        });
      },
    },
  };

  const currentPath = window.location.href.replace(BASE_URL, '').split('?')[0];

  for (const [, config] of Object.entries(tableConfigs)) {
    if (currentPath.match(config.pattern)) {
      const tables = document.querySelectorAll('table');
      tables.forEach((t) => config.handler(t as HTMLTableElement));
      break;
    }
  }
}

function translateMetaChart(): void {
  const chartRoots = document.querySelectorAll<HTMLElement>(
    '.chart-container [phx-hook="ChartJs"][data-config][data-data]',
  );

  chartRoots.forEach((root) => {
    const config = parseChartJson(root.dataset.config);
    const data = parseChartJson(root.dataset.data);
    if (!config || !data) return;

    translateChartConfig(config);
    translateChartData(data);

    const nextConfig = JSON.stringify(config);
    const nextData = JSON.stringify(data);
    if (root.dataset.config !== nextConfig) {
      root.dataset.config = nextConfig;
    }
    if (root.dataset.data !== nextData) {
      root.dataset.data = nextData;
    }

    updateRenderedChart(root, config, data);
  });
}

function parseChartJson(value: string | undefined): any | null {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function translateChartConfig(config: any): void {
  const scales = config?.options?.scales;
  if (!scales) return;

  Object.values(scales).forEach((scale: any) => {
    const titleText = scale?.title?.text;
    if (typeof titleText === 'string') {
      scale.title.text = uiTranslations.get(titleText) || titleText;
    }
  });
}

function translateChartData(data: any): void {
  if (!Array.isArray(data?.datasets)) return;

  data.datasets.forEach((dataset: any) => {
    if (typeof dataset.label === 'string') {
      dataset.label = uiTranslations.get(dataset.label) || dataset.label;
    }
    if (!Array.isArray(dataset.data)) return;
    dataset.data.forEach((point: any) => {
      if (typeof point?.label === 'string') {
        point.label = toPlainText(generateDeckTranslation(point.label));
      }
    });
  });
}

function toPlainText(value: string): string {
  const temp = document.createElement('div');
  temp.innerHTML = value;
  return temp.textContent?.trim() || value;
}

function updateRenderedChart(root: HTMLElement, config: any, data: any): void {
  const canvas = root.querySelector('canvas');
  const chartGlobal = (window as any).Chart;
  const chart = canvas && chartGlobal?.getChart?.(canvas);
  if (!chart) return;

  if (config?.options) {
    chart.options = {
      ...chart.options,
      ...config.options,
    };
  }
  if (Array.isArray(data?.datasets)) {
    chart.data.datasets = data.datasets;
  }
  chart.update();
}
