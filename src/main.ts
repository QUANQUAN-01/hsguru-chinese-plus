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

function runHsguruFeaturesSafely(): void {
  if (hsguruIsApplying) return;

  hsguruIsApplying = true;
  try {
    queryCache.clear();
    initializeFeatures();
  } finally {
    hsguruIsApplying = false;
  }
}

function initializeFeatures(): void {
  Object.values(FEATURES).forEach((feature) => {
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

function setupDOMTranslationObserver(): void {
  if (hsguruDomObserver) return;

  let rafId: number | null = null;

  const scheduleUpdate = () => {
    if (rafId !== null) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      runHsguruFeaturesSafely();
    });
  };

  hsguruDomObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList' || mutation.type === 'characterData') {
        scheduleUpdate();
        break;
      }
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
      (event.target as HTMLElement).matches('a.dropdown-item') ||
      (event.target as HTMLElement).closest('a.dropdown-item')
    ) {
      setTimeout(() => {
        queryCache.clear();
        handleDeck();
        handleCard();
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
