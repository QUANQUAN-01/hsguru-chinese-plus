export function handleAd(): void {
  [
    'nitropay-sticky-side-rail-container',
    'below-title-ads',
    'nitropay-below-title-leaderboard',
    'nitropay-floating-video-all',
    'nitro-float-close',
    'nitropay-sticky-side-rail',
    'nitropay-sticky-side-rail-close',
    'nitropay-desktop-anchor',
    'nitropay-desktop-anchor-close',
  ].forEach((id) => {
    const element = document.getElementById(id);
    if (element) element.remove();
  });

  const navbarEnd = document.querySelector('div.navbar-end');
  if (navbarEnd) navbarEnd.remove();

  if (
    window.location.href.match(
      /^https:\/\/www\.hsguru\.com\/deck\/(\d+|[A-Za-z0-9+/=%]+)(?:\?.*)?$/,
    )
  ) {
    const columnElement = document.querySelector('div.column.is-narrow-mobile');
    if (columnElement) {
      (columnElement as HTMLElement).style.flex = 'none';
      (columnElement as HTMLElement).style.minWidth = '400px';
      (columnElement as HTMLElement).style.marginTop = '3.5rem';
    }
  }

  if (window.location.href.match(/^https:\/\/www\.hsguru\.com\/?$/)) {
    const cardContents = document.querySelectorAll('div.card-content');
    cardContents.forEach((cardContent) => {
      const greatGrandParent = cardContent.parentNode?.parentNode?.parentNode as HTMLElement | null;
      if (greatGrandParent) greatGrandParent.remove();
    });
  }
}
