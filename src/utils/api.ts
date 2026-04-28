import { API, MAX_CONCURRENT_REQUESTS, REQUEST_DELAY } from './constants';

export const endpoints = {
  cardTranslation: () => API.CARD_TRANSLATION,
  firestone: () => API.FIRESTONE,
  blizzard: () => API.BLIZZARD,
};

export interface CardTranslationResult {
  translation: string;
  imageUrl: string;
  found: boolean;
}

export function fetchCardTranslation(
  cardName: string,
  callback: (result: CardTranslationResult) => void,
): void {
  const encodedName = encodeURIComponent(cardName);
  const url = API.CARD_TRANSLATION;
  const body = `ignoreHero=1&name=${encodedName}&statistic=total&order=-series%2C%2Bmana&token=&page=0&size=30`;

  GM_xmlhttpRequest({
    method: 'POST',
    url,
    headers: {
      accept: '*/*',
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      Referer: 'https://www.iyingdi.com/',
    },
    data: body,
    onload: (response) => {
      let translation = cardName;
      let imageUrl = '';
      let found = false;
      if (response.status === 200) {
        try {
          const data = JSON.parse(response.responseText);
          if (data.success && data.data.total > 0) {
            const matchedCard = data.data.cards.find(
              (card: { ename: string; cname: string; img?: string; thumbnail?: string }) =>
                card.ename === cardName,
            );
            if (matchedCard) {
              translation = matchedCard.cname;
              imageUrl = matchedCard.img || matchedCard.thumbnail || '';
              found = true;
            }
          }
        } catch (e) {
          console.error('[HSGuru] 解析卡牌翻译失败', e);
        }
      }
      callback({ translation, imageUrl, found });
    },
    onerror: () => {
      console.error('[HSGuru] 卡牌翻译请求失败', cardName);
      callback({ translation: cardName, imageUrl: '', found: false });
    },
  });
}

const pendingFetches = new Map<string, Element[]>();
const requestQueue: string[] = [];
const pendingRequestSet = new Set<string>();
const callbackMap = new Map<
  string,
  Set<(cardName: string, result: CardTranslationResult, elements: Element[]) => void>
>();
let activeRequests = 0;

export function isCardPending(cardName: string): boolean {
  return pendingRequestSet.has(cardName);
}

export function addPendingElement(cardName: string, element: Element): void {
  if (!pendingFetches.has(cardName)) {
    pendingFetches.set(cardName, []);
  }
  pendingFetches.get(cardName)!.push(element);
}

export function updateCardElement(
  element: Element,
  translation: string,
  originalName?: string,
): void {
  if (originalName) {
    (element as HTMLElement).dataset.originalCardName = originalName;
  }
  const cardNameNode = Array.from(element.childNodes).find(
    (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
  );
  if (cardNameNode) {
    const fragment = document.createDocumentFragment();
    const textNode = document.createTextNode(`\n          ${translation}\n        `);
    fragment.appendChild(textNode);
    cardNameNode.parentNode?.replaceChild(fragment, cardNameNode);
  }
  (element as HTMLElement).dataset.cardTranslated = 'true';
}

export function processQueue(
  maxConcurrent: number = MAX_CONCURRENT_REQUESTS,
  delay: number = REQUEST_DELAY,
): void {
  if (requestQueue.length === 0 || activeRequests >= maxConcurrent) return;

  const cardName = requestQueue.shift()!;
  activeRequests++;

  fetchCardTranslation(cardName, (result) => {
    const elements = pendingFetches.get(cardName) || [];
    const callbacks = callbackMap.get(cardName);
    if (callbacks) {
      callbacks.forEach((cb) => cb(cardName, result, elements));
    }
    pendingFetches.delete(cardName);
    callbackMap.delete(cardName);

    setTimeout(() => {
      activeRequests--;
      pendingRequestSet.delete(cardName);
      processQueue(maxConcurrent, delay);
    }, delay);
  });
}

export function enqueueCardFetch(
  cardName: string,
  maxConcurrent: number = MAX_CONCURRENT_REQUESTS,
  delay: number = REQUEST_DELAY,
  onUpdateCard?: (cardName: string, result: CardTranslationResult, elements: Element[]) => void,
): void {
  const alreadyPending = pendingRequestSet.has(cardName);
  if (!alreadyPending) {
    requestQueue.push(cardName);
    pendingRequestSet.add(cardName);
  }
  if (onUpdateCard) {
    if (!callbackMap.has(cardName)) {
      callbackMap.set(cardName, new Set());
    }
    callbackMap.get(cardName)!.add(onUpdateCard);
  }
  processQueue(maxConcurrent, delay);
}

export function getPendingElements(cardName: string): Element[] {
  return pendingFetches.get(cardName) || [];
}

export function clearPendingFetches(): void {
  pendingFetches.clear();
}

export function getQueueLength(): number {
  return requestQueue.length;
}

export function getActiveRequests(): number {
  return activeRequests;
}
