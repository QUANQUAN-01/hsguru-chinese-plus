import { BASE_URL, API, ROUTES } from '../utils/constants';
import { uiTranslations } from '../utils/translationsMap';
import { generateDeckTranslation } from './deckTranslation';
import { replaceSubtitle, extractRelativeTimeText, extractGamesText } from '../utils/helpers';

const cardTranslations = new Map<string, string>();

export function handleTitle(): void {
  const titleElement = document.querySelector('div.title.is-2');
  if (!titleElement) return;

  const currentPath = window.location.href
    .replace(BASE_URL, '')
    .split('?')[0];
  const text = titleElement.textContent?.trim() || '';

  function handleDeckNameTranslation(match: RegExpMatchArray | null): boolean {
    if (!match || !titleElement) return false;
    const deckName = match[1];
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = generateDeckTranslation(deckName);
    const translated = tempDiv.textContent?.trim() || '';
    titleElement.textContent = translated;
    document.title = translated;
    return true;
  }

  if (currentPath.match(/^card\/\d+$/)) {
    const translation = cardTranslations.get(text) || text;
    if (translation !== text) {
      titleElement.textContent = translation;
      document.title = translation;
    }
    return;
  }

  if (currentPath.match(/^deck\/(\d+|[A-Za-z0-9+/=%]+)$/)) {
    if (handleDeckNameTranslation(text.match(/(.*?) (Standard|Wild)$/))) return;
  }

  if (currentPath.match(/^leaderboard\/player-history\//)) {
    const translated = text
      .replace(/\bRank\b/g, uiTranslations.get('Rank') || 'Rank')
      .replace(/\bHistory\b/g, uiTranslations.get('History') || 'History');
    if (translated !== text) {
      titleElement.textContent = translated;
      document.title = translated;
    }
    return;
  }

  if (currentPath.match(/^leaderboard\/rank-history\//)) {
    const translated = text
      .replace(/\bRank\b/g, uiTranslations.get('Rank') || 'Rank')
      .replace(/\bHistory\b/g, uiTranslations.get('History') || 'History');
    if (translated !== text) {
      titleElement.textContent = translated;
      document.title = translated;
    }
    return;
  }

  if (currentPath === 'card-stats') {
    if (text.includes('Archetype Card Stats')) {
      if (handleDeckNameTranslation(text.match(/(.*?) Archetype Card Stats/))) return;
    }
    const translation = uiTranslations.get(text);
    if (translation) {
      titleElement.textContent = translation;
      document.title = translation;
    }
    return;
  }

  const translation = uiTranslations.get(text);
  if (translation) {
    titleElement.textContent = translation;
    document.title = translation;
  }
}

export function handleSub(): void {
  const subtitleElement = document.querySelector(
    'div.subtitle.is-6, div.subtitle.is-5',
  );
  if (!subtitleElement) return;

  const currentUrl = window.location.href;

  const pageHandlers: Record<string, { pattern: RegExp; handler: (element: Element) => void }> = {
    decks: {
      pattern: new RegExp(`^${BASE_URL}decks(\\?|$)`),
      handler: (element) => {
        const timeSpan = Array.from(element.querySelectorAll('span')).find(
          (span) => span.textContent?.includes('ago'),
        ) || null;
        const timeText = extractRelativeTimeText(timeSpan, uiTranslations);
        const subtitleHTML = `<a href="/stats/explanation">数据说明</a>${timeText}|要做出贡献，请使用 <a href="${API.FIRESTONE}" target="_blank">火石</a> 或 <a target="_blank" href="/hdt-plugin">HDT 插件</a>`;
        replaceSubtitle(element, subtitleHTML);
      },
    },
    meta: {
      pattern: new RegExp(`^${BASE_URL}meta(\\?|$)`),
      handler: (element) => {
        const timeSpan = Array.from(element.querySelectorAll('span')).find(
          (span) => span.textContent?.includes('ago'),
        ) || null;
        const timeText = extractRelativeTimeText(timeSpan, uiTranslations);
        const subtitleHTML = `要做出贡献，请使用 <a href="${API.FIRESTONE}" target="_blank">火石</a> 或 <a target="_blank" href="/hdt-plugin">HDT 插件</a>${timeText}`;
        replaceSubtitle(element, subtitleHTML);
      },
    },
    matchups: {
      pattern: new RegExp(`^${BASE_URL}matchups(\\?|$)`),
      handler: (element) => {
        const subtitleHTML = `要做出贡献，请使用 <a href="${API.FIRESTONE}" target="_blank">火石</a> 或 <a target="_blank" href="/hdt-plugin">HDT 插件</a>`;
        replaceSubtitle(element, subtitleHTML);
      },
    },
    deck: {
      pattern: new RegExp(`^${BASE_URL}deck/(\\d+|[A-Za-z0-9+/=%]+)(?:\\?.*)?$`),
      handler: (element) => {
        const timeSpan = element.querySelector('span[phx-update="ignore"]');
        const timeText = extractRelativeTimeText(timeSpan, uiTranslations);
        const editLink = element.querySelector(`a[href*="${ROUTES.DECK_BUILDER}"]`) as HTMLAnchorElement | null;
        const cardStatsLink = element.querySelector(`a[href*="${ROUTES.CARD_STATS}"]`) as HTMLAnchorElement | null;
        const archetypeLink = element.querySelector(`a[href*="${ROUTES.ARCHETYPE}"]`) as HTMLAnchorElement | null;
        const replaysLink = element.querySelector(`a[href*="${ROUTES.REPLAYS_WITH_URL}"]`) as HTMLAnchorElement | null;
        const replaysByArchLink = element.querySelector(`a[href*="${ROUTES.REPLAYS_BY_ARCHETYPE}"]`) as HTMLAnchorElement | null;
        const subtitleHTML = `
          <a href="${editLink?.href || '#'}">编辑</a> |
          <a href="${cardStatsLink?.href || '#'}">卡牌统计(调度)</a> |
          <a href="${archetypeLink?.href || '#'}">卡组类型统计</a> |
          <a href="${replaysLink?.href || '#'}">回放</a> |
          <a href="${replaysByArchLink?.href || '#'}">卡组类型回放</a>
          ${timeText}
        `;
        replaceSubtitle(element, subtitleHTML);
      },
    },
    cardStatsDeck: {
      pattern: new RegExp(`^${BASE_URL}card-stats\\?deck_id=\\d+`),
      handler: (element) => {
        const timeSpan = element.querySelector('span[phx-update="ignore"]');
        const timeText = extractRelativeTimeText(timeSpan, uiTranslations);
        const gamesText = extractGamesText(element);
        const deckDetailLink = element.querySelector(`a[href*="${ROUTES.DECK_DETAIL}"]`) as HTMLAnchorElement | null;
        const cardStatsByArchLink = element.querySelector(`a[href*="${ROUTES.CARD_STATS_BY_ARCHETYPE}"]`) as HTMLAnchorElement | null;
        const subtitleHTML = `
          <a href="${deckDetailLink?.href || '#'}">卡组统计</a> |
          <a href="${cardStatsByArchLink?.href || '#'}">卡组类型卡牌统计</a> |
          <a href="/stats/explanation">数据说明</a> | 要做出贡献，请使用
          <a href="${API.FIRESTONE}" target="_blank">Firestone</a>
          ${timeText}${gamesText}
        `;
        replaceSubtitle(element, subtitleHTML);
      },
    },
    cardStatsArchetype: {
      pattern: new RegExp(`^${BASE_URL}card-stats\\?archetype=`),
      handler: (element) => {
        const timeSpan = element.querySelector('span[phx-update="ignore"]');
        const timeText = extractRelativeTimeText(timeSpan, uiTranslations);
        const gamesText = extractGamesText(element);
        const cardStatsQueryLink = element.querySelector(`a[href*="${ROUTES.CARD_STATS_QUERY}"]`) as HTMLAnchorElement | null;
        const archetypeLink = element.querySelector(`a[href*="${ROUTES.ARCHETYPE}"]`) as HTMLAnchorElement | null;
        const subtitleHTML = `
          <a href="${cardStatsQueryLink?.href || '#'}">卡组卡牌统计</a> |
          <a href="${archetypeLink?.href || '#'}">卡组类型统计</a> |
          <a href="/stats/explanation">数据说明</a> | 要做出贡献，请使用
          <a href="${API.FIRESTONE}" target="_blank">Firestone</a>
          ${timeText}${gamesText}
        `;
        replaceSubtitle(element, subtitleHTML);
      },
    },
    archetype: {
      pattern: new RegExp(`^${BASE_URL}archetype/[^/]+$`),
      handler: (element) => {
        const timeSpan = element.querySelector('span[phx-update="ignore"]');
        const timeText = extractRelativeTimeText(timeSpan, uiTranslations);
        const cardStatsByArchLink = element.querySelector(`a[href*="${ROUTES.CARD_STATS_BY_ARCHETYPE}"]`) as HTMLAnchorElement | null;
        const decksQueryLink = element.querySelector(`a[href*="${ROUTES.DECKS_QUERY}"]`) as HTMLAnchorElement | null;
        const replaysQueryLink = element.querySelector(`a[href*="${ROUTES.REPLAYS_QUERY}"]`) as HTMLAnchorElement | null;
        const subtitleHTML = `
          <a href="${cardStatsByArchLink?.href || '#'}">卡牌统计</a> |
          <a href="${decksQueryLink?.href || '#'}">卡组</a> |
          <a href="${replaysQueryLink?.href || '#'}">回放统计</a>
          ${timeText}
        `;
        replaceSubtitle(element, subtitleHTML);
      },
    },
    cardStats: {
      pattern: new RegExp(`^${BASE_URL}card-stats(\\?|$)`),
      handler: (element) => {
        const subtitleHTML = `
          <a target="_blank" href="/deckbuilder">卡组构建器</a> |
          <a target="_blank" href="/hdt-plugin">HDT 插件</a> |
          <a target="_blank" href="/discord">Discord</a>
        `;
        replaceSubtitle(element, subtitleHTML);
      },
    },
    replays: {
      pattern: new RegExp(`^${BASE_URL}replays(\\?|$)`),
      handler: (element) => {
        const subtitleHTML = `
          要做出贡献，<span class="is-hidden-mobile">请使用 <a href="${API.FIRESTONE}" target="_blank">Firestone</a> 或
          <a target="_blank" href="/hdt-plugin">HDT 插件</a>并</span>
          <a href="/profile/settings">公开你的回放</a>
        `;
        replaceSubtitle(element, subtitleHTML);
      },
    },
    leaderboardPoints: {
      pattern: new RegExp(`^${BASE_URL}leaderboard/points`),
      handler: (element) => {
        const announcementLink = element.querySelector(`a[href*="${API.BLIZZARD}"]`) as HTMLAnchorElement | null;
        const href = announcementLink ? announcementLink.href : '#';
        const subtitleHTML = `<a href="${href}" target="_blank">2026 公告<span class="icon is-small">
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon w-6 h-6">
    <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"></path>
  </svg>
</span></a>`;
        replaceSubtitle(element, subtitleHTML);
      },
    },
    leaderboard: {
      pattern: new RegExp(`^${BASE_URL}leaderboard(\\?|$)`),
      handler: (element) => {
        const timeElement = element.querySelector('time');
        const timeHTML = timeElement ? timeElement.outerHTML : '';
        const blizzardLink = element.querySelector(`a[href*="${API.BLIZZARD}"]`) as HTMLAnchorElement | null;
        const subtitleHTML = `
          <a target="_blank" href="${ROUTES.LEADERBOARD_PLAYER_STATS}">统计</a> |
          <a target="_blank" href="${blizzardLink?.href || '#'}">官方网站</a> |
          更新于 ${timeHTML}
        `;
        replaceSubtitle(element, subtitleHTML);
      },
    },
    streamerDecks: {
      pattern: new RegExp(`^${BASE_URL}streamer-decks$`),
      handler: (element) => {
        const subtitleHTML = `<a href="/streamer-instructions">主播说明</a>`;
        replaceSubtitle(element, subtitleHTML);
      },
    },
    esports: {
      pattern: new RegExp(`^${BASE_URL}esports$`),
      handler: (element) => {
        const subtitleHTML = `
          <a href="/mt/tour-stops">巡回赛站点</a> |
          <a href="/legacy-hsesports">传统电竞赛事</a>
          <span>| 此页面正在建设中，如果你有想法请 <a href="/discord">告诉我们</a></span>
        `;
        replaceSubtitle(element, subtitleHTML);
      },
    },
    streamingNow: {
      pattern: new RegExp(`^${BASE_URL}streaming-now$`),
      handler: (element) => {
        const subtitleHTML = `<a href="/streamer-instructions">主播说明</a>`;
        replaceSubtitle(element, subtitleHTML);
      },
    },
    hdtPlugin: {
      pattern: new RegExp(`^${BASE_URL}hdt-plugin$`),
      handler: (element) => {
        const subtitleHTML = `
          不仅仅用于<a target="_blank" href="/streamer-decks">主播卡组</a>。
          为<a target="_blank" href="${ROUTES.DECKS}">卡组</a>做贡献，
          分享并享受你的<a target="_blank" href="/my-decks">卡组</a>和
          <a target="_blank" href="/my-replays">回放</a>
          （<a href="${API.FIRESTONE}" target="_blank">Firestone</a>用户也可使用这些功能）
        `;
        replaceSubtitle(element, subtitleHTML);
      },
    },
  };

  for (const [, config] of Object.entries(pageHandlers)) {
    if (currentUrl.match(config.pattern)) {
      config.handler(subtitleElement);
      break;
    }
  }
}
