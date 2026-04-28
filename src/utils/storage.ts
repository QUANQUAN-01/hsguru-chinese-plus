import { STORAGE_PREFIX } from './constants';
import type { CustomTranslations, Config } from '../types';

// ============================================================
// Storage Key Helpers
// ============================================================

export const storageKey = {
  config() {
    return STORAGE_PREFIX.CONFIG;
  },
  customDeck() {
    return STORAGE_PREFIX.CUSTOM_DECK;
  },
  customCard() {
    return STORAGE_PREFIX.CUSTOM_CARD;
  },
  cardTranslation(cardName: string) {
    return `${STORAGE_PREFIX.CARD_TRANSLATION}${cardName}`;
  },
  cardImage(cardName: string) {
    return `${STORAGE_PREFIX.CARD_IMAGE}${cardName}`;
  },
  cacheMigrated() {
    return STORAGE_PREFIX.CACHE_MIGRATED;
  },
  dataMigrated() {
    return STORAGE_PREFIX.DATA_MIGRATED;
  },
};

// ============================================================
// Storage Manager
// ============================================================

export const StorageManager = {
  gm: {
    get<T = any>(key: string, defaultValue: T | null = null): T | null {
      try {
        const value = GM_getValue<T>(key, defaultValue);
        return value;
      } catch (e) {
        console.warn(`[HSGuru] GM_getValue 失败: ${key}`, e);
        return defaultValue;
      }
    },
    set(key: string, value: any): void {
      try {
        GM_setValue(key, value);
      } catch (e) {
        console.error(`[HSGuru] GM_setValue 失败: ${key}`, e);
      }
    },
    remove(key: string): void {
      try {
        GM_setValue(key, undefined);
      } catch (e) {
        console.error(`[HSGuru] GM_setValue 删除失败: ${key}`, e);
      }
    },
  },
  local: {
    get<T = any>(key: string, defaultValue: T | null = null): T | null {
      try {
        const value = localStorage.getItem(key);
        return value !== null ? JSON.parse(value) : defaultValue;
      } catch (e) {
        console.warn(`[HSGuru] localStorage 读取失败: ${key}`, e);
        return defaultValue;
      }
    },
    set(key: string, value: any): void {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.error(`[HSGuru] localStorage 写入失败: ${key}`, e);
      }
    },
    remove(key: string): void {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.error(`[HSGuru] localStorage 删除失败: ${key}`, e);
      }
    },
  },
};

// ============================================================
// Migration Logic
// ============================================================

export function getCardCacheKey(cardName: string): string {
  return storageKey.cardTranslation(cardName);
}

export function migrateLegacyCardCache(): void {
  const migrated = localStorage.getItem(storageKey.cacheMigrated());
  if (migrated) return;
  console.log('[HSGuru] 开始迁移旧版卡牌缓存...');
  let migratedCount = 0;
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (!key) continue;
    if (key.startsWith('hsguru_')) continue;
    if (/^[a-zA-Z0-9\s'.,!?&-]+$/.test(key)) {
      const value = localStorage.getItem(key);
      if (value && typeof value === 'string' && value.length > 0) {
        localStorage.setItem(getCardCacheKey(key), value);
        localStorage.removeItem(key);
        migratedCount++;
      }
    }
  }
  localStorage.setItem(storageKey.cacheMigrated(), 'true');
  console.log(`[HSGuru] 卡牌缓存迁移完成，共迁移 ${migratedCount} 条`);
}

export function migrateLegacyData(): void {
  const migrated = StorageManager.gm.get(storageKey.dataMigrated());
  if (migrated) return;
  console.log('[HSGuru] 开始迁移旧版数据到 GM 存储...');
  let migratedCount = 0;
  const oldConfig = localStorage.getItem(storageKey.config());
  if (oldConfig) {
    try {
      StorageManager.gm.set(storageKey.config(), JSON.parse(oldConfig));
      localStorage.removeItem(storageKey.config());
      migratedCount++;
    } catch (e) {
      console.error('[HSGuru] 配置迁移失败', e);
    }
  }
  const oldDeckNames = localStorage.getItem(storageKey.customDeck());
  if (oldDeckNames) {
    try {
      StorageManager.gm.set(storageKey.customDeck(), JSON.parse(oldDeckNames));
      localStorage.removeItem(storageKey.customDeck());
      migratedCount++;
    } catch (e) {
      console.error('[HSGuru] 卡组翻译迁移失败', e);
    }
  }
  const oldCardNames = localStorage.getItem(storageKey.customCard());
  if (oldCardNames) {
    try {
      StorageManager.gm.set(storageKey.customCard(), JSON.parse(oldCardNames));
      localStorage.removeItem(storageKey.customCard());
      migratedCount++;
    } catch (e) {
      console.error('[HSGuru] 卡牌翻译迁移失败', e);
    }
  }
  StorageManager.gm.set(storageKey.dataMigrated(), true);
  console.log(`[HSGuru] GM 存储迁移完成，共迁移 ${migratedCount} 项数据`);
}

// ============================================================
// Custom Translations (Deck)
// ============================================================

const CUSTOM_TRANSLATIONS_KEY = storageKey.customDeck();
let customTranslations: CustomTranslations | null = null;

function loadCustomTranslations(): void {
  if (customTranslations) return;
  try {
    const saved = StorageManager.gm.get<CustomTranslations>(CUSTOM_TRANSLATIONS_KEY, {});
    customTranslations = saved || {};
  } catch (e) {
    customTranslations = {};
  }
}

export function getCustomTranslations(): CustomTranslations {
  loadCustomTranslations();
  return customTranslations!;
}

export function saveCustomTranslation(original: string, translation: string): void {
  loadCustomTranslations();
  customTranslations![original] = translation;
  StorageManager.gm.set(CUSTOM_TRANSLATIONS_KEY, customTranslations);
}

export function saveCustomTranslationsBatch(translations: CustomTranslations): void {
  loadCustomTranslations();
  Object.assign(customTranslations!, translations);
  StorageManager.gm.set(CUSTOM_TRANSLATIONS_KEY, customTranslations);
}

export function getEffectiveCustomTranslations(): CustomTranslations {
  loadCustomTranslations();
  return Object.fromEntries(
    Object.entries(customTranslations!).filter(
      ([, value]) => typeof value === 'string' && value.trim(),
    ),
  );
}

export function deleteCustomTranslation(original: string): void {
  loadCustomTranslations();
  if (Object.prototype.hasOwnProperty.call(customTranslations, original)) {
    delete customTranslations![original];
    StorageManager.gm.set(CUSTOM_TRANSLATIONS_KEY, customTranslations);
  }
}

// ============================================================
// Custom Card Translations
// ============================================================

const CUSTOM_CARD_TRANSLATIONS_KEY = storageKey.customCard();
let customCardTranslations: CustomTranslations | null = null;

function loadCustomCardTranslations(): void {
  if (customCardTranslations) return;
  try {
    const saved = StorageManager.gm.get<CustomTranslations>(CUSTOM_CARD_TRANSLATIONS_KEY, {});
    customCardTranslations = saved || {};
  } catch (e) {
    customCardTranslations = {};
  }
}

export function getCustomCardTranslations(): CustomTranslations {
  loadCustomCardTranslations();
  return customCardTranslations!;
}

export function saveCustomCardTranslation(original: string, translation: string): void {
  loadCustomCardTranslations();
  customCardTranslations![original] = translation;
  StorageManager.gm.set(CUSTOM_CARD_TRANSLATIONS_KEY, customCardTranslations);
}

export function saveCustomCardTranslationsBatch(translations: CustomTranslations): void {
  loadCustomCardTranslations();
  Object.assign(customCardTranslations!, translations);
  StorageManager.gm.set(CUSTOM_CARD_TRANSLATIONS_KEY, customCardTranslations);
}

export function deleteCustomCardTranslation(original: string): void {
  loadCustomCardTranslations();
  if (Object.prototype.hasOwnProperty.call(customCardTranslations, original)) {
    delete customCardTranslations![original];
    StorageManager.gm.set(CUSTOM_CARD_TRANSLATIONS_KEY, customCardTranslations);
  }
}

export function addUnmatchedCardName(name: string): void {
  loadCustomCardTranslations();
  if (
    /[a-zA-Z]/.test(name) &&
    !Object.prototype.hasOwnProperty.call(customCardTranslations, name)
  ) {
    customCardTranslations![name] = '';
    StorageManager.gm.set(CUSTOM_CARD_TRANSLATIONS_KEY, customCardTranslations);
  }
}

export function addUnmatchedWord(word: string): void {
  loadCustomTranslations();
  if (
    /[a-zA-Z]/.test(word) &&
    !/[^\x00-\xff]/.test(word) &&
    !Object.prototype.hasOwnProperty.call(customTranslations, word)
  ) {
    customTranslations![word] = '';
    StorageManager.gm.set(CUSTOM_TRANSLATIONS_KEY, customTranslations);
  }
}

// ============================================================
// Config
// ============================================================

export function getConfig(defaults: Config): Config {
  const savedConfig = StorageManager.gm.get<Config>(storageKey.config(), {});
  return { ...defaults, ...savedConfig };
}

export function applyConfig(config: Config): void {
  StorageManager.gm.set(storageKey.config(), config);
}
