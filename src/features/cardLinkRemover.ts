export function handleCardLinks(): void {
  document
    .querySelectorAll("div.decklist_card_container > div > a")
    .forEach((link) => link.removeAttribute("href"));
}
