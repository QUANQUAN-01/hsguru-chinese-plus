import { migrateLegacyData, migrateLegacyCardCache } from './utils/storage';
import { queryCache } from './utils/dom';
import { injectStyles } from './features/styles';
import { FEATURES } from './utils/constants';
import {
  handleAd,
  handleScrollTop,
  handleClipboard,
  handleCardLinks,
  handleBasic,
  handleFilter,
  handleSearch,
  handleTag,
  handleCard,
  handleDeck,
  handleTable,
  handleFilterStyle,
  handleTitle,
  handleSub,
  addConfigButton,
  getConfig,
  applyConfig,
  showChineseCardPreview,
  moveChineseCardPreview,
  hideChineseCardPreview,
  activeCardPreviewName,
} from './features';
import { SELECTORS } from './utils/constants';

// ============================================================
// Feature Handler Registration
// ============================================================

FEATURES.AD.handler = handleAd;
FEATURES.BASIC.handler = handleBasic;
FEATURES.CARD.handler = handleCard;
FEATURES.CARD_LINK.handler = handleCardLinks;
FEATURES.CLIPBOARD.handler = handleClipboard;
FEATURES.DECK.handler = handleDeck;
FEATURES.FILTER.handler = handleFilter;
FEATURES.FILTER_STYLE.handler = handleFilterStyle;
FEATURES.SEARCH.handler = handleSearch;
FEATURES.SUB.handler = handleSub;
FEATURES.TABLE.handler = handleTable;
FEATURES.TAG.handler = handleTag;
FEATURES.TITLE.handler = handleTitle;
FEATURES.SCROLL_TOP.handler = handleScrollTop;

// ============================================================
// Safe Execution Wrapper
// ============================================================

let hsguruIsApplying = false;
let hsguruDomObserver: MutationObserver | null = null;
let dropdownRefreshTimer: ReturnType<typeof setTimeout> | null = null;
let dropdownFallbackPending = false;

const FILTER_MUTATION_KEYS = new Set(['FILTER', 'FILTER_STYLE', 'SEARCH']);
const CARD_MUTATION_KEYS = new Set(['CARD', 'CARD_LINK', 'TABLE']);
const DECK_MUTATION_KEYS = new Set(['DECK', 'TAG']);
const TABLE_MUTATION_KEYS = new Set(['TABLE']);
const FILTER_SELECTOR =
  '.filters-container, .has-dropdown, a.dropdown-item, [x-data] a.button, [x-data] a[class*="tw-w-full"], input[placeholder="Search"]';
const CARD_SELECTOR = `${SELECTORS.CARD_NAME}, .card-image, .decklist-card-background`;
const DECK_SELECTOR = `${SELECTORS.DECK_TITLE}, ${SELECTORS.DECK_LINK}, ${SELECTORS.BASIC_DECK_TITLE}, .decklist-info, #deck_stats_viewport`;
const CONTENT_SELECTOR = 'table';

type FeatureKeys = ReadonlySet<string> | undefined;

function runHsguruFeaturesSafely(featureKeys?: FeatureKeys): void {
  if (hsguruIsApplying) return;

  hsguruIsApplying = true;
  try {
    queryCache.clear();
    initializeFeatures(featureKeys);
  } finally {
    hsguruIsApplying = false;
  }
}

function initializeFeatures(featureKeys?: FeatureKeys): void {
  Object.entries(FEATURES).forEach(([key, feature]) => {
    if (featureKeys && !featureKeys.has(key)) return;
    if (feature.enabled && feature.handler) {
      try {
        feature.handler();
      } catch (e) {
        console.error(`Error in feature ${feature.name}:`, e);
      }
    }
  });
}

// ============================================================
// DOM Translation Observer
// ============================================================

function mutationElement(mutation: MutationRecord): Element | null {
  if (mutation.target instanceof Element) return mutation.target;
  return mutation.target.parentElement;
}

function subtreeMatches(node: Node, selector: string): boolean {
  return (
    node instanceof Element && (node.matches(selector) || node.querySelector(selector) !== null)
  );
}

function mutationMatches(mutation: MutationRecord, selector: string): boolean {
  const target = mutationElement(mutation);
  if (target?.closest(selector)) return true;
  return Array.from(mutation.addedNodes).some((node) => subtreeMatches(node, selector));
}

function isPluginMutation(mutation: MutationRecord): boolean {
  const target = mutationElement(mutation);
  return Boolean(
    target?.closest(
      '#hsguru-config-modal, #config-menu-button, .hsguru-chinese-card-preview, [data-hsguru-plugin-ui]',
    ),
  );
}

function classifyMutation(mutation: MutationRecord): FeatureKeys {
  if (isPluginMutation(mutation)) return new Set();

  const keys = new Set<string>();

  if (mutationMatches(mutation, FILTER_SELECTOR)) {
    FILTER_MUTATION_KEYS.forEach((key) => keys.add(key));
  }
  if (mutationMatches(mutation, CARD_SELECTOR)) {
    CARD_MUTATION_KEYS.forEach((key) => keys.add(key));
  }
  if (mutationMatches(mutation, DECK_SELECTOR)) {
    DECK_MUTATION_KEYS.forEach((key) => keys.add(key));
  }
  if (mutationMatches(mutation, CONTENT_SELECTOR)) {
    TABLE_MUTATION_KEYS.forEach((key) => keys.add(key));
  }

  // An unrecognised LiveView/Alpine update may replace any page region. Keep
  // the full pass for those updates so site-owned state is never discarded.
  return keys.size > 0 ? keys : undefined;
}

function isEffectiveDropdownMutation(mutation: MutationRecord): boolean {
  if (mutationMatches(mutation, CARD_SELECTOR) || mutationMatches(mutation, DECK_SELECTOR)) {
    return true;
  }

  // Filter controls can be inserted into a table by the script itself. That
  // structural change must not suppress the fallback for the site's update.
  return mutationMatches(mutation, CONTENT_SELECTOR) && !mutationMatches(mutation, FILTER_SELECTOR);
}

function setupDOMTranslationObserver(): void {
  if (hsguruDomObserver) return;

  let rafId: number | null = null;
  let pendingFeatureKeys: Set<string> | undefined;
  let pendingFullUpdate = false;

  const scheduleUpdate = (featureKeys?: FeatureKeys) => {
    if (featureKeys) {
      if (!pendingFullUpdate) {
        if (!pendingFeatureKeys) pendingFeatureKeys = new Set();
        featureKeys.forEach((key) => pendingFeatureKeys!.add(key));
      }
    } else {
      pendingFullUpdate = true;
      pendingFeatureKeys = undefined;
    }
    if (rafId !== null) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      const keys = pendingFullUpdate ? undefined : pendingFeatureKeys;
      pendingFullUpdate = false;
      pendingFeatureKeys = undefined;
      runHsguruFeaturesSafely(keys);
    });
  };

  hsguruDomObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== 'childList' && mutation.type !== 'characterData') continue;
      const featureKeys = classifyMutation(mutation);
      if (!featureKeys) {
        scheduleUpdate();
        break;
      }
      if (featureKeys.size === 0) continue;
      if (dropdownFallbackPending && isEffectiveDropdownMutation(mutation)) {
        dropdownFallbackPending = false;
        if (dropdownRefreshTimer !== null) {
          clearTimeout(dropdownRefreshTimer);
          dropdownRefreshTimer = null;
        }
      }
      scheduleUpdate(featureKeys);
    }
  });

  hsguruDomObserver.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
}

// ============================================================
// Event Listeners
// ============================================================

let eventListenersBound = false;

function setupEventListeners(): void {
  if (eventListenersBound) return;

  // Dropdown click handler
  document.body.addEventListener('click', (event) => {
    if (
      (event.target as HTMLElement).matches('a.dropdown-item, [x-data] a[class*="tw-w-full"]') ||
      (event.target as HTMLElement).closest('a.dropdown-item, [x-data] a[class*="tw-w-full"]')
    ) {
      if (dropdownRefreshTimer !== null) clearTimeout(dropdownRefreshTimer);
      dropdownFallbackPending = true;
      dropdownRefreshTimer = setTimeout(() => {
        dropdownRefreshTimer = null;
        dropdownFallbackPending = false;
        // LiveView normally produces a classified observer update. This is a
        // delayed fallback for responses that only settle after the click.
        const keys = new Set(['DECK', 'CARD']);
        queryCache.clear();
        runHsguruFeaturesSafely(keys);
      }, 1000);
    }
  });

  // Card hover preview - mouseover
  document.body.addEventListener('mouseover', (event) => {
    const cardRow = (event.target as HTMLElement).closest('.tw-relative');
    const cardNameElement =
      (cardRow as Element | null)?.querySelector(SELECTORS.CARD_NAME) ||
      (event.target as HTMLElement).closest(SELECTORS.CARD_NAME);
    if (!cardNameElement) return;
    const originalName =
      (cardNameElement as HTMLElement).dataset.originalCardName ||
      cardNameElement.textContent?.trim() ||
      '';
    showChineseCardPreview(originalName, event.clientX, event.clientY);
  });

  // Card hover preview - mousemove (RAF throttled)
  let moveRafId: number | null = null;
  document.body.addEventListener('mousemove', (event) => {
    if (moveRafId !== null) return;
    moveRafId = requestAnimationFrame(() => {
      moveRafId = null;
      if (!activeCardPreviewName) return;
      moveChineseCardPreview(event.clientX, event.clientY);
    });
  });

  // Card hover preview - mouseout
  document.body.addEventListener('mouseout', (event) => {
    const cardRow = (event.target as HTMLElement).closest('.tw-relative');
    if (!cardRow || !(cardRow as Element).querySelector(SELECTORS.CARD_NAME)) return;
    const nextCardRow = (event.relatedTarget as HTMLElement | null)?.closest?.('.tw-relative');
    if (nextCardRow === cardRow) return;
    hideChineseCardPreview();
  });

  eventListenersBound = true;
}

// ============================================================
// Initialization
// ============================================================

// function schedulePluginInitialization(): void {
//   const runWhenStable = () => {
//     runHsguruFeaturesSafely();
//   };

//   if (document.readyState === 'complete') {
//     setTimeout(runWhenStable, 500);
//   } else {
//     const onLoad = () => {
//       window.removeEventListener('load', onLoad);
//       setTimeout(runWhenStable, 1000);
//     };
//     window.addEventListener('load', onLoad);
//   }
// }
function schedulePluginInitialization() {
  const runWhenStable = () => {
    runHsguruFeaturesSafely();
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runWhenStable, { once: true });
  } else {
    // 如果 DOM 已可用，立即执行（但仍用 microtask 或 requestAnimationFrame 避免阻塞）
    requestAnimationFrame(runWhenStable);
  }
}
function initializePlugin(): void {
  migrateLegacyData();
  migrateLegacyCardCache();

  const config = getConfig();
  applyConfig(config);
  addConfigButton();
  injectStyles(config);
  setupDOMTranslationObserver();
  setupEventListeners();
  schedulePluginInitialization();
  // 立即即尝试执行翻译（无延迟）
  // if (document.readyState === 'complete' || document.readyState === 'interactive') {
  //   runHsguruFeaturesSafely();
  // } else {
  //   document.addEventListener('DOMContentLoaded', () => runHsguruFeaturesSafely(), { once: true });
  // }
}

// ============================================================
// Entry Point
// ============================================================

(function () {
  'use strict';
  console.log('[HSGuru] 模块化脚本已启动');
  initializePlugin();
})();
