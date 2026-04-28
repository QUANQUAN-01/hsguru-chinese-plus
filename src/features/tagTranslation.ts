import { queryCache } from '../utils/dom';

export function handleTag(): void {
  const tags = Array.from(
    queryCache.getOrCreate('div.column.tag, a.tag.column.is-link'),
  );
  tags.forEach((tag) => {
    const text = tag.textContent?.trim() || '';

    const gamesMatch = text.match(/Games: (\d+)/);
    if (gamesMatch) {
      tag.textContent = `对局：${gamesMatch[1]}`;
      return;
    }

    const peakedMatch = text.match(/Peaked By: (.+)/);
    if (peakedMatch) {
      tag.textContent = `最高：${peakedMatch[1]}`;
      return;
    }

    const streamedMatch = text.match(/First Streamed: (.+)/);
    if (streamedMatch) {
      tag.textContent = `首次直播：${streamedMatch[1]}`;
      return;
    }

    const streamCountMatch = text.match(/^\s*#\s*Streamed:\s*(\d+)\s*$/);
    if (streamCountMatch) {
      tag.textContent = `直播次数：${streamCountMatch[1]}`;
      return;
    }
  });
}
