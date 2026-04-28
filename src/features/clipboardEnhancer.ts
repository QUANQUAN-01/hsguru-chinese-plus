import { DATASET, UI_TEXT } from '../utils/constants';
import { uiTranslations } from '../utils/translationsMap';
import { showClipboardFeedback } from '../utils/helpers';

export function handleClipboard(): void {
  const clipboardButtons = document.querySelectorAll('button.clip-btn-value');
  clipboardButtons.forEach((element) => {
    const originalText = element.getAttribute(DATASET.CLIPBOARD_TEXT);
    if (
      originalText &&
      !originalText.startsWith('#') &&
      !originalText.endsWith('#')
    ) {
      const deckTitleElement = element
        .closest('.decklist-info')
        ?.querySelector('a.basic-black-text');
      const deckTitle = deckTitleElement
        ? deckTitleElement.textContent?.trim() || ''
        : '';
      const modifiedText = `###${deckTitle}\n#\n${originalText}\n#`;
      element.setAttribute(DATASET.CLIPBOARD_TEXT, modifiedText);
    }

    const iconSpan = element.querySelector('svg.icon');
    if (iconSpan) {
      iconSpan.classList.remove('icon');
      iconSpan.classList.add('clipboard-icon');
    }

    if ((element as HTMLElement).dataset.hsguruClipboardBound === 'true') return;
    (element as HTMLElement).dataset.hsguruClipboardBound = 'true';
    element.setAttribute('aria-label', uiTranslations.get('Copy') || '复制');
    element.addEventListener('click', () => {
      setTimeout(() => {
        showClipboardFeedback(
          element as HTMLElement,
          UI_TEXT.COPY_SUCCESS_LABEL,
          uiTranslations.get('Copy') || '复制',
        );
      }, 0);
    });
  });
}
