import { CATEGORIES, FEATURES } from '../utils/constants';
import { StorageManager, storageKey } from '../utils/storage';
import { getCustomTranslations, saveCustomTranslation, deleteCustomTranslation, saveCustomTranslations } from './deckTranslation';
import { getCustomCardTranslations, saveCustomCardTranslation, deleteCustomCardTranslation, saveCustomCardTranslations } from './cardTranslation';

// ============================================================
// Helper Functions
// ============================================================

function createTranslationItemElement(original: string, translation: string, type: 'DECK' | 'CARD' = 'DECK'): HTMLElement {
  const item = document.createElement('div');
  item.className = `hsguru-feature-card custom-translation-item ${type === 'CARD' ? 'card-item' : 'deck-item'}`;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'hsguru-checkbox custom-item-checkbox';
  checkbox.dataset.original = original;
  (checkbox as HTMLElement).dataset.type = type;

  const infoDiv = document.createElement('div');
  infoDiv.className = 'hsguru-feature-info';
  const nameDiv = document.createElement('div');
  nameDiv.className = 'hsguru-feature-name';
  nameDiv.textContent = original;
  infoDiv.appendChild(nameDiv);

  const actionDiv = document.createElement('div');
  actionDiv.style.display = 'flex';
  actionDiv.style.alignItems = 'center';

  const translationInput = document.createElement('input');
  translationInput.type = 'text';
  translationInput.className = 'hsguru-input custom-translation-input';
  translationInput.value = translation;
  translationInput.placeholder = '请输入翻译...';
  translationInput.dataset.original = original;
  (translationInput as HTMLElement).dataset.type = type;

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'hsguru-delete-btn';
  deleteBtn.textContent = '✕';
  deleteBtn.onclick = () => {
    if (type === 'CARD') {
      deleteCustomCardTranslation(original);
    } else {
      deleteCustomTranslation(original);
    }
    item.remove();
    updateMergeBtnVisibility(type);
  };

  actionDiv.appendChild(translationInput);
  actionDiv.appendChild(deleteBtn);

  item.appendChild(checkbox);
  item.appendChild(infoDiv);
  item.appendChild(actionDiv);

  return item;
}

function updateMergeBtnVisibility(type: 'DECK' | 'CARD' = 'DECK'): void {
  const modal = document.getElementById('hsguru-config-modal');
  if (!modal) return;
  const mergeBtn = document.getElementById(
    type === 'CARD' ? 'hsguru-merge-card' : 'hsguru-merge-custom',
  );
  if (!mergeBtn) return;
  const checkedCount = modal.querySelectorAll(
    `.custom-item-checkbox[data-type="${type}"]:checked`,
  ).length;
  (mergeBtn as HTMLElement).style.display = checkedCount >= 2 ? 'block' : 'none';
}

// ============================================================
// Modal Creation
// ============================================================

export function createConfigModal(): void {
  if (document.getElementById('hsguru-config-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'hsguru-config-modal';
  modal.className = 'hsguru-modal';

  const style = document.createElement('style');
  style.textContent = `
    .hsguru-modal,
    .hsguru-modal * {
      box-sizing: border-box;
    }
    .hsguru-modal {
      display: none;
      position: fixed;
      z-index: 10000;
      inset: 0;
      padding: 24px;
      background: rgba(20, 20, 19, 0.5);
      backdrop-filter: blur(8px);
      font-family: var(--hsguru-font-sans, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
      color: #141413;
    }
    .hsguru-modal-dialog {
      position: relative;
      width: min(1080px, 100%);
      height: min(760px, calc(100vh - 48px));
      margin: 0 auto;
      top: 50%;
      transform: translateY(-50%);
      background: #faf9f5;
      border: 1px solid #e8e6dc;
      border-radius: 28px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: rgba(20, 20, 19, 0.16) 0 24px 80px;
    }
    .hsguru-modal-header {
      padding: 24px 28px 20px;
      background: linear-gradient(180deg, #faf9f5 0%, #f5f4ed 100%);
      border-bottom: 1px solid #e8e6dc;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 20px;
    }
    .hsguru-modal-header-copy {
      min-width: 0;
    }
    .hsguru-modal-eyebrow {
      margin: 0 0 10px;
      font-size: 11px;
      line-height: 1.5;
      font-family: var(--hsguru-font-sans, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
      font-weight: 500;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #87867f;
    }
    .hsguru-modal-title {
      margin: 0;
      font-family: var(--hsguru-font-serif, Georgia, "Times New Roman", serif);
      font-size: 31px;
      line-height: 1.15;
      font-weight: 500;
      color: #141413;
    }
    .hsguru-modal-subtitle {
      margin: 10px 0 0;
      max-width: 640px;
      font-size: 14px;
      line-height: 1.6;
      font-family: var(--hsguru-font-sans, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
      font-weight: 400;
      color: #5e5d59;
    }
    .hsguru-close-btn {
      width: 40px;
      height: 40px;
      flex: 0 0 40px;
      border: 1px solid #e8e6dc;
      border-radius: 999px;
      background: #ffffff;
      color: #5e5d59;
      font-size: 24px;
      line-height: 1;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 0 0 1px rgba(209, 207, 197, 0);
    }
    .hsguru-close-btn:hover {
      color: #141413;
      border-color: #d1cfc5;
      box-shadow: 0 0 0 1px #d1cfc5;
      transform: translateY(-1px);
    }

    .hsguru-modal-body {
      flex: 1;
      display: flex;
      min-height: 0;
      overflow: hidden;
      background: #f5f4ed;
    }

    .hsguru-sidebar {
      width: 260px;
      flex: 0 0 260px;
      background: linear-gradient(180deg, #f8f7f1 0%, #f1efe6 100%);
      color: #141413;
      border-right: 1px solid #e8e6dc;
      padding: 20px 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      overflow-y: auto;
    }
    .hsguru-sidebar-intro {
      padding: 16px;
      margin-bottom: 8px;
      border: 1px solid #e8e6dc;
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.7);
      box-shadow: rgba(20, 20, 19, 0.03) 0 4px 18px;
    }
    .hsguru-sidebar-title {
      margin: 0 0 6px;
      font-family: var(--hsguru-font-serif, Georgia, "Times New Roman", serif);
      font-size: 19px;
      line-height: 1.2;
      font-weight: 500;
      color: #141413;
    }
    .hsguru-sidebar-note {
      margin: 0;
      font-size: 13px;
      line-height: 1.6;
      font-family: var(--hsguru-font-sans, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
      color: #5e5d59;
    }
    .hsguru-tab-item {
      position: relative;
      padding: 13px 16px;
      border: 1px solid transparent;
      border-radius: 16px;
      cursor: pointer;
      font-size: 14px;
      line-height: 1.4;
      font-family: var(--hsguru-font-sans, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
      font-weight: 500;
      color: #5e5d59;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .hsguru-tab-item:hover {
      color: #141413;
      background: rgba(255, 255, 255, 0.72);
      border-color: #e8e6dc;
    }
    .hsguru-tab-item.active {
      color: #141413;
      background: #fff7f2;
      border-color: #c96442;
      box-shadow: inset 0 0 0 1px rgba(201, 100, 66, 0.18), rgba(20, 20, 19, 0.04) 0 4px 14px;
    }

    .hsguru-content {
      flex: 1;
      min-width: 0;
      padding: 26px;
      overflow-y: auto;
      background: linear-gradient(180deg, #f5f4ed 0%, #f0eee6 100%);
    }
    .hsguru-tab-content {
      display: none;
    }
    .hsguru-tab-content.active {
      display: block;
    }

    .hsguru-feature-card {
      background: rgba(255, 255, 255, 0.72);
      backdrop-filter: blur(6px);
      border: 1px solid #e8e6dc;
      border-radius: 18px;
      padding: 18px 20px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      box-shadow: rgba(20, 20, 19, 0.04) 0 6px 24px;
    }
    .hsguru-feature-info {
      flex: 1;
      min-width: 0;
      padding-right: 8px;
    }
    .hsguru-feature-name {
      margin-bottom: 6px;
      font-family: var(--hsguru-font-serif, Georgia, "Times New Roman", serif);
      font-size: 20px;
      line-height: 1.25;
      font-weight: 500;
      color: #141413;
    }
    .hsguru-feature-desc {
      font-size: 14px;
      line-height: 1.6;
      font-family: var(--hsguru-font-sans, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
      color: #5e5d59;
    }

    .hsguru-switch {
      position: relative;
      display: inline-block;
      width: 52px;
      height: 30px;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .hsguru-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    .hsguru-slider {
      position: absolute;
      cursor: pointer;
      inset: 0;
      background: #d1cfc5;
      transition: 0.25s ease;
      border-radius: 999px;
      box-shadow: inset 0 0 0 1px rgba(20, 20, 19, 0.06);
    }
    .hsguru-slider:before {
      position: absolute;
      content: "";
      height: 24px;
      width: 24px;
      left: 3px;
      bottom: 3px;
      background: #ffffff;
      transition: 0.25s ease;
      border-radius: 50%;
      box-shadow: rgba(20, 20, 19, 0.18) 0 2px 8px;
    }
    input:checked + .hsguru-slider {
      background: #c96442;
    }
    input:checked + .hsguru-slider:before {
      transform: translateX(22px);
    }

    .hsguru-modal-footer {
      padding: 18px 28px;
      background: #faf9f5;
      border-top: 1px solid #e8e6dc;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
    .hsguru-btn {
      min-height: 42px;
      padding: 10px 18px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 500;
      font-family: var(--hsguru-font-sans, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1px solid transparent;
      box-shadow: 0 0 0 1px rgba(209, 207, 197, 0);
    }
    .hsguru-btn:hover {
      transform: translateY(-1px);
    }
    .hsguru-btn-secondary {
      background: #e8e6dc;
      color: #4d4c48;
      border-color: #e8e6dc;
    }
    .hsguru-btn-secondary:hover {
      background: #dedbd0;
      box-shadow: 0 0 0 1px #c2c0b6;
    }
    .hsguru-btn-primary {
      background: #c96442;
      color: #faf9f5;
      border-color: #c96442;
    }
    .hsguru-btn-primary:hover {
      background: #b85a39;
      box-shadow: 0 0 0 1px rgba(201, 100, 66, 0.25);
    }
    .hsguru-btn-success {
      background: #30302e;
      color: #faf9f5;
      border-color: #30302e;
    }
    .hsguru-btn-success:hover {
      background: #1f1f1d;
      box-shadow: 0 0 0 1px rgba(48, 48, 46, 0.24);
    }

    .hsguru-input {
      width: 200px;
      min-height: 42px;
      padding: 10px 14px;
      border: 1px solid #d1cfc5;
      border-radius: 12px;
      font-size: 14px;
      font-family: var(--hsguru-font-sans, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
      color: #141413;
      background: #ffffff;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }
    .hsguru-input::placeholder {
      color: #87867f;
    }
    .hsguru-input:focus {
      border-color: #c96442;
      box-shadow: 0 0 0 3px rgba(201, 100, 66, 0.16);
      outline: none;
    }

    .custom-translation-item {
      align-items: center;
    }
    .hsguru-custom-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .hsguru-delete-btn {
      background: none;
      border: none;
      color: #b53333;
      cursor: pointer;
      font-size: 18px;
      padding: 6px 10px;
      margin-left: 8px;
      border-radius: 10px;
      transition: all 0.2s ease;
    }
    .hsguru-delete-btn:hover {
      background: rgba(181, 51, 51, 0.08);
    }
    .hsguru-custom-actions {
      position: sticky;
      top: -26px;
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 16px;
      background: linear-gradient(180deg, #f5f4ed 0%, rgba(245, 244, 237, 0.92) 100%);
      padding: 0 0 12px;
      z-index: 10;
    }
    .hsguru-checkbox {
      margin-right: 12px;
      width: 18px;
      height: 18px;
      cursor: pointer;
      accent-color: #c96442;
    }
    .custom-translation-item.edit-mode {
      background: #fff7f2;
      border: 1px solid rgba(201, 100, 66, 0.4);
      box-shadow: 0 0 0 1px rgba(201, 100, 66, 0.16);
    }
    .hsguru-save-edit-btn {
      background: #c96442;
      color: #faf9f5;
      border-color: #c96442;
    }
    .hsguru-save-edit-btn:hover {
      background: #b85a39;
    }
    .hsguru-edit-field-wrap {
      flex: 0 0 auto;
      margin-right: 10px;
    }
    .hsguru-edit-actions {
      display: flex;
      align-items: center;
      flex: 1;
    }
    .hsguru-edit-original-input {
      width: 150px;
    }
    .hsguru-edit-translation-input {
      flex: 1;
      margin-right: 8px;
    }
    .hsguru-edit-save-btn {
      padding: 4px 8px;
      font-size: 12px;
      margin-right: 4px;
    }
    .hsguru-edit-cancel-btn {
      padding: 4px 8px;
      font-size: 12px;
    }
    .hsguru-cancel-edit-btn {
      background: #ffffff;
      border: 1px solid #d1cfc5;
      color: #5e5d59;
    }
    .hsguru-cancel-edit-btn:hover {
      background: #f5f4ed;
    }
    .empty-message {
      padding: 28px 20px;
      text-align: center;
      font-family: var(--hsguru-font-sans, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
      font-size: 14px;
      line-height: 1.6;
      color: #87867f;
      background: rgba(255, 255, 255, 0.48);
      border: 1px dashed #d1cfc5;
      border-radius: 18px;
    }

    @media (max-width: 900px) {
      .hsguru-modal {
        padding: 12px;
      }
      .hsguru-modal-dialog {
        height: calc(100vh - 24px);
        border-radius: 22px;
      }
      .hsguru-modal-body {
        flex-direction: column;
      }
      .hsguru-sidebar {
        width: auto;
        flex: 0 0 auto;
        border-right: none;
        border-bottom: 1px solid #e8e6dc;
        padding-bottom: 14px;
      }
      .hsguru-content {
        padding: 18px;
      }
      .hsguru-custom-actions {
        top: -18px;
      }
    }

    @media (max-width: 640px) {
      .hsguru-modal-header,
      .hsguru-modal-footer {
        padding-left: 18px;
        padding-right: 18px;
      }
      .hsguru-modal-title {
        font-size: 26px;
      }
      .hsguru-feature-card,
      .custom-translation-item {
        flex-direction: column;
        align-items: stretch;
      }
      .hsguru-edit-field-wrap {
        margin-right: 0;
      }
      .hsguru-edit-actions {
        width: 100%;
      }
      .hsguru-feature-info {
        padding-right: 0;
      }
      .hsguru-input {
        width: 100%;
      }
    }
  `;
  document.head.appendChild(style);

  const fragment = document.createDocumentFragment();

  const dialog = document.createElement('div');
  dialog.className = 'hsguru-modal-dialog';

  const header = document.createElement('div');
  header.className = 'hsguru-modal-header';

  const headerCopy = document.createElement('div');
  headerCopy.className = 'hsguru-modal-header-copy';

  const eyebrow = document.createElement('p');
  eyebrow.className = 'hsguru-modal-eyebrow';
  eyebrow.textContent = 'HSGuru Chinese Plus Companion';

  const title = document.createElement('h5');
  title.className = 'hsguru-modal-title';
  title.textContent = '插件配置';

  const subtitle = document.createElement('p');
  subtitle.className = 'hsguru-modal-subtitle';
  subtitle.textContent = '按分类管理美化、翻译和增强功能，并在右侧维护自定义词库，让站点界面更接近中文使用习惯。';

  headerCopy.appendChild(eyebrow);
  headerCopy.appendChild(title);
  headerCopy.appendChild(subtitle);

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.id = 'hsguru-close-config';
  closeBtn.className = 'hsguru-close-btn';
  closeBtn.textContent = '×';

  header.appendChild(headerCopy);
  header.appendChild(closeBtn);

  const body = document.createElement('div');
  body.className = 'hsguru-modal-body';

  const sidebar = document.createElement('div');
  sidebar.className = 'hsguru-sidebar';

  const sidebarIntro = document.createElement('div');
  sidebarIntro.className = 'hsguru-sidebar-intro';

  const sidebarTitle = document.createElement('div');
  sidebarTitle.className = 'hsguru-sidebar-title';
  sidebarTitle.textContent = '功能分组';

  const sidebarNote = document.createElement('p');
  sidebarNote.className = 'hsguru-sidebar-note';
  sidebarNote.textContent = '左侧切换模块，右侧即时调整。自定义翻译词库会持久化到本地浏览器存储。';

  sidebarIntro.appendChild(sidebarTitle);
  sidebarIntro.appendChild(sidebarNote);
  sidebar.appendChild(sidebarIntro);

  (Object.keys(CATEGORIES) as Array<keyof typeof CATEGORIES>).forEach((catId, index) => {
    const catName = CATEGORIES[catId];
    const tabItem = document.createElement('div');
    tabItem.className = `hsguru-tab-item ${index === 0 ? 'active' : ''}`;
    (tabItem as HTMLElement).dataset.tab = catId;
    tabItem.textContent = catName;
    sidebar.appendChild(tabItem);
  });

  const deckTab = document.createElement('div');
  deckTab.className = 'hsguru-tab-item';
  (deckTab as HTMLElement).dataset.tab = 'CUSTOM_DECK';
  deckTab.textContent = '自定义卡组翻译';
  sidebar.appendChild(deckTab);

  const cardTab = document.createElement('div');
  cardTab.className = 'hsguru-tab-item';
  (cardTab as HTMLElement).dataset.tab = 'CUSTOM_CARD';
  cardTab.textContent = '自定义卡牌翻译';
  sidebar.appendChild(cardTab);

  const content = document.createElement('div');
  content.className = 'hsguru-content';

  (Object.keys(CATEGORIES) as Array<keyof typeof CATEGORIES>).forEach((catId, index) => {
    const tabContent = document.createElement('div');
    tabContent.className = `hsguru-tab-content ${index === 0 ? 'active' : ''}`;
    tabContent.id = `tab-content-${catId}`;

    Object.keys(FEATURES).forEach((featId) => {
      const feat = FEATURES[featId];
      if (feat.category === catId) {
        const card = document.createElement('div');
        card.className = 'hsguru-feature-card';

        const info = document.createElement('div');
        info.className = 'hsguru-feature-info';

        const name = document.createElement('div');
        name.className = 'hsguru-feature-name';
        name.textContent = feat.name;

        const desc = document.createElement('div');
        desc.className = 'hsguru-feature-desc';
        desc.textContent = feat.description || '';

        info.appendChild(name);
        info.appendChild(desc);

        const label = document.createElement('label');
        label.className = 'hsguru-switch';

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = `enable_${featId}`;
        if (feat.enabled) input.checked = true;

        const slider = document.createElement('span');
        slider.className = 'hsguru-slider';

        label.appendChild(input);
        label.appendChild(slider);

        card.appendChild(info);
        card.appendChild(label);
        tabContent.appendChild(card);
      }
    });

    content.appendChild(tabContent);
  });

  const deckTabContent = document.createElement('div');
  deckTabContent.className = 'hsguru-tab-content';
  deckTabContent.id = 'tab-content-CUSTOM_DECK';

  const deckActions = document.createElement('div');
  deckActions.className = 'hsguru-custom-actions';

  const addDeckBtn = document.createElement('button');
  addDeckBtn.type = 'button';
  addDeckBtn.className = 'hsguru-btn hsguru-btn-success';
  addDeckBtn.id = 'hsguru-add-deck';
  addDeckBtn.textContent = '新增组合词';

  const mergeDeckBtn = document.createElement('button');
  mergeDeckBtn.type = 'button';
  mergeDeckBtn.className = 'hsguru-btn hsguru-btn-primary';
  mergeDeckBtn.id = 'hsguru-merge-custom';
  (mergeDeckBtn as HTMLElement).style.display = 'none';
  mergeDeckBtn.textContent = '合并所选单词';

  deckActions.appendChild(addDeckBtn);
  deckActions.appendChild(mergeDeckBtn);

  const deckList = document.createElement('div');
  deckList.className = 'hsguru-custom-list';
  deckList.id = 'hsguru-deck-list';

  deckTabContent.appendChild(deckActions);
  deckTabContent.appendChild(deckList);
  content.appendChild(deckTabContent);

  const cardTabContent = document.createElement('div');
  cardTabContent.className = 'hsguru-tab-content';
  cardTabContent.id = 'tab-content-CUSTOM_CARD';

  const cardActions = document.createElement('div');
  cardActions.className = 'hsguru-custom-actions';

  const addCardBtn = document.createElement('button');
  addCardBtn.type = 'button';
  addCardBtn.className = 'hsguru-btn hsguru-btn-success';
  addCardBtn.id = 'hsguru-add-card';
  addCardBtn.textContent = '新增卡牌翻译';

  const mergeCardBtn = document.createElement('button');
  mergeCardBtn.type = 'button';
  mergeCardBtn.className = 'hsguru-btn hsguru-btn-primary';
  mergeCardBtn.id = 'hsguru-merge-card';
  (mergeCardBtn as HTMLElement).style.display = 'none';
  mergeCardBtn.textContent = '合并所选单词';

  cardActions.appendChild(addCardBtn);
  cardActions.appendChild(mergeCardBtn);

  const cardList = document.createElement('div');
  cardList.className = 'hsguru-custom-list';
  cardList.id = 'hsguru-card-list';

  cardTabContent.appendChild(cardActions);
  cardTabContent.appendChild(cardList);
  content.appendChild(cardTabContent);

  body.appendChild(sidebar);
  body.appendChild(content);

  const footer = document.createElement('div');
  footer.className = 'hsguru-modal-footer';

  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'hsguru-btn hsguru-btn-secondary';
  cancelBtn.id = 'hsguru-cancel-config';
  cancelBtn.textContent = '取消';

  const saveBtn = document.createElement('button');
  saveBtn.type = 'button';
  saveBtn.className = 'hsguru-btn hsguru-btn-primary';
  saveBtn.id = 'hsguru-save-config';
  saveBtn.textContent = '保存并刷新';

  footer.appendChild(cancelBtn);
  footer.appendChild(saveBtn);

  dialog.appendChild(header);
  dialog.appendChild(body);
  dialog.appendChild(footer);
  fragment.appendChild(dialog);
  modal.appendChild(fragment);
  document.body.appendChild(modal);

  // Populate deck translations
  const deckListContainer = modal.querySelector('#hsguru-deck-list') as HTMLElement;
  const customDeckTranslations = getCustomTranslations();
  if (customDeckTranslations && Object.keys(customDeckTranslations).length > 0) {
    Object.keys(customDeckTranslations).forEach((original) => {
      const translation = customDeckTranslations[original];
      const item = createTranslationItemElement(original, translation, 'DECK');
      deckListContainer.appendChild(item);
    });
  } else {
    const emptyMsg = document.createElement('div');
    emptyMsg.className = 'empty-message';
    emptyMsg.textContent = '暂无待翻译的卡组名称';
    deckListContainer.appendChild(emptyMsg);
  }

  // Populate card translations
  const cardListContainer = modal.querySelector('#hsguru-card-list') as HTMLElement;
  const customCardTranslations2 = getCustomCardTranslations();
  if (customCardTranslations2 && Object.keys(customCardTranslations2).length > 0) {
    Object.keys(customCardTranslations2).forEach((original) => {
      const translation = customCardTranslations2[original];
      const item = createTranslationItemElement(original, translation, 'CARD');
      cardListContainer.appendChild(item);
    });
  } else {
    const emptyMsg = document.createElement('div');
    emptyMsg.className = 'empty-message';
    emptyMsg.textContent = '暂无待翻译的卡牌名称';
    cardListContainer.appendChild(emptyMsg);
  }

  bindConfigModalEvents();
}

// ============================================================
// Event Binding
// ============================================================

function bindConfigModalEvents(): void {
  const modal = document.getElementById('hsguru-config-modal') as HTMLElement;
  const closeBtn = document.getElementById('hsguru-close-config');
  const cancelBtn = document.getElementById('hsguru-cancel-config');
  const saveBtn = document.getElementById('hsguru-save-config');
  const tabs = modal.querySelectorAll('.hsguru-tab-item');
  const contents = modal.querySelectorAll('.hsguru-tab-content');

  tabs.forEach((tab) => {
    (tab as HTMLElement).onclick = () => {
      const tabId = (tab as HTMLElement).dataset.tab;
      tabs.forEach((t) => t.classList.remove('active'));
      contents.forEach((c) => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`tab-content-${tabId}`)?.classList.add('active');
    };
  });

  const closeModal = () => ((modal as HTMLElement).style.display = 'none');
  (closeBtn as HTMLElement).onclick = closeModal;
  (cancelBtn as HTMLElement).onclick = closeModal;
  window.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });

  const setupMergeLogic = (type: 'DECK' | 'CARD') => {
    const btnId = type === 'CARD' ? 'hsguru-merge-card' : 'hsguru-merge-custom';
    const mergeBtn = document.getElementById(btnId);
    if (!mergeBtn) return;

    (mergeBtn as HTMLElement).onclick = () => {
      const checked = Array.from(
        modal.querySelectorAll(
          `.custom-item-checkbox[data-type="${type}"]:checked`,
        ),
      );
      if (checked.length < 2) return;

      const words = checked.map((cb) => (cb as HTMLElement).dataset.original || '');
      const combined = words.join(' ');
      const itemsToHide = checked.map((cb) =>
        (cb as HTMLElement).closest('.custom-translation-item'),
      );
      itemsToHide.forEach((item) => {
        if (item) (item as HTMLElement).style.display = 'none';
      });

      const editRow = document.createElement('div');
      editRow.className = `hsguru-feature-card custom-translation-item edit-mode ${type === 'CARD' ? 'card-item' : 'deck-item'}`;

      const infoDiv = document.createElement('div');
      infoDiv.className = 'hsguru-feature-info hsguru-edit-field-wrap';

      const originalInput = document.createElement('input');
      originalInput.type = 'text';
      originalInput.className = 'hsguru-input edit-original-input hsguru-edit-original-input';
      originalInput.value = combined;
      originalInput.placeholder = '请输入组合词...';

      infoDiv.appendChild(originalInput);

      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'hsguru-edit-actions';

      const translationInput = document.createElement('input');
      translationInput.type = 'text';
      translationInput.className = 'hsguru-input edit-translation-input hsguru-edit-translation-input';
      translationInput.placeholder = '请输入翻译...';

      const saveEditBtn = document.createElement('button');
      saveEditBtn.type = 'button';
      saveEditBtn.className = 'hsguru-btn hsguru-btn-primary hsguru-save-edit-btn hsguru-edit-save-btn';
      saveEditBtn.textContent = '保存';

      const cancelEditBtn = document.createElement('button');
      cancelEditBtn.type = 'button';
      cancelEditBtn.className = 'hsguru-btn hsguru-btn-secondary hsguru-cancel-edit-btn hsguru-edit-cancel-btn';
      cancelEditBtn.textContent = '取消';

      actionsDiv.appendChild(translationInput);
      actionsDiv.appendChild(saveEditBtn);
      actionsDiv.appendChild(cancelEditBtn);

      editRow.appendChild(infoDiv);
      editRow.appendChild(actionsDiv);

      if (itemsToHide[0]?.parentNode) {
        itemsToHide[0].parentNode.insertBefore(editRow, itemsToHide[0]);
      }
      (translationInput as HTMLInputElement).focus();

      (saveEditBtn as HTMLElement).onclick = () => {
        const newOriginal = (originalInput as HTMLInputElement).value.trim();
        const newTranslation = (translationInput as HTMLInputElement).value.trim();
        if (newOriginal && newTranslation) {
          if (type === 'CARD') {
            saveCustomCardTranslation(newOriginal, newTranslation);
            const current = getCustomCardTranslations();
            words.forEach((word) => {
              if (current[word] === '' && word !== newOriginal)
                deleteCustomCardTranslation(word);
            });
          } else {
            saveCustomTranslation(newOriginal, newTranslation);
            const current = getCustomTranslations();
            words.forEach((word) => {
              if (current[word] === '' && word !== newOriginal)
                deleteCustomTranslation(word);
            });
          }
          itemsToHide.forEach((item) => {
            if (item) item.remove();
          });
          const newItem = createTranslationItemElement(
            newOriginal,
            newTranslation,
            type,
          );
          if (editRow.parentNode) {
            editRow.parentNode.insertBefore(newItem, editRow);
          }
          editRow.remove();
          updateMergeBtnVisibility(type);
        } else {
          alert('请输入完整的翻译');
        }
      };

      (cancelEditBtn as HTMLElement).onclick = () => {
        editRow.remove();
        itemsToHide.forEach((item) => {
          if (item) (item as HTMLElement).style.display = '';
        });
      };
    };
  };

  const setupAddLogic = (type: 'DECK' | 'CARD') => {
    const btnId = type === 'CARD' ? 'hsguru-add-card' : 'hsguru-add-deck';
    const listId = type === 'CARD' ? '#hsguru-card-list' : '#hsguru-deck-list';
    const addBtn = document.getElementById(btnId);
    if (!addBtn) return;

    (addBtn as HTMLElement).onclick = () => {
      const listContainer = modal.querySelector(listId) as HTMLElement;
      const emptyMessage = listContainer?.querySelector('.empty-message');
      if (emptyMessage) emptyMessage.remove();

      const editRow = document.createElement('div');
      editRow.className = `hsguru-feature-card custom-translation-item edit-mode ${type === 'CARD' ? 'card-item' : 'deck-item'}`;

      const infoDiv = document.createElement('div');
      infoDiv.className = 'hsguru-feature-info hsguru-edit-field-wrap';

      const originalInput = document.createElement('input');
      originalInput.type = 'text';
      originalInput.className = 'hsguru-input edit-original-input hsguru-edit-original-input';
      originalInput.placeholder = type === 'CARD' ? '卡牌英文名' : '组合词';

      infoDiv.appendChild(originalInput);

      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'hsguru-edit-actions';

      const translationInput = document.createElement('input');
      translationInput.type = 'text';
      translationInput.className = 'hsguru-input edit-translation-input hsguru-edit-translation-input';
      translationInput.placeholder = '请输入翻译...';

      const saveEditBtn = document.createElement('button');
      saveEditBtn.type = 'button';
      saveEditBtn.className = 'hsguru-btn hsguru-btn-primary hsguru-save-edit-btn hsguru-edit-save-btn';
      saveEditBtn.textContent = '保存';

      const cancelEditBtn = document.createElement('button');
      cancelEditBtn.type = 'button';
      cancelEditBtn.className = 'hsguru-btn hsguru-btn-secondary hsguru-cancel-edit-btn hsguru-edit-cancel-btn';
      cancelEditBtn.textContent = '取消';

      actionsDiv.appendChild(translationInput);
      actionsDiv.appendChild(saveEditBtn);
      actionsDiv.appendChild(cancelEditBtn);

      editRow.appendChild(infoDiv);
      editRow.appendChild(actionsDiv);

      if (listContainer) {
        listContainer.insertBefore(editRow, listContainer.firstChild);
      }
      (originalInput as HTMLInputElement).focus();

      (saveEditBtn as HTMLElement).onclick = () => {
        const newOriginal = (originalInput as HTMLInputElement).value.trim();
        const newTranslation = (translationInput as HTMLInputElement).value.trim();
        if (newOriginal && newTranslation) {
          if (type === 'CARD') {
            saveCustomCardTranslation(newOriginal, newTranslation);
          } else {
            saveCustomTranslation(newOriginal, newTranslation);
          }
          const newItem = createTranslationItemElement(
            newOriginal,
            newTranslation,
            type,
          );
          if (editRow.parentNode) {
            editRow.parentNode.insertBefore(newItem, editRow);
          }
          editRow.remove();
          updateMergeBtnVisibility(type);
        } else {
          alert('请输入完整的英文原名和中文翻译');
        }
      };

      (cancelEditBtn as HTMLElement).onclick = () => {
        editRow.remove();
        if (listContainer && listContainer.children.length === 0) {
          const emptyMsg = document.createElement('div');
          emptyMsg.className = 'empty-message';
          emptyMsg.textContent = type === 'CARD' ? '暂无待翻译的卡牌名称' : '暂无待翻译的卡组名称';
          listContainer.appendChild(emptyMsg);
        }
      };
    };
  };

  setupMergeLogic('DECK');
  setupMergeLogic('CARD');
  setupAddLogic('DECK');
  setupAddLogic('CARD');

  if (saveBtn) {
    (saveBtn as HTMLElement).onclick = () => {
      saveCurrentConfig();
      saveCustomTranslationsFromUI();
      location.reload();
    };
  }
}

// ============================================================
// Save/Load Config
// ============================================================

function saveCustomTranslationsFromUI(): void {
  const inputs = document.querySelectorAll('.custom-translation-input') as NodeListOf<HTMLInputElement>;
  const deckTranslations: Record<string, string> = {};
  const cardTranslations2: Record<string, string> = {};

  inputs.forEach((input) => {
    const original = (input as HTMLElement).dataset.original || '';
    const translation = input.value.trim();
    const type = (input as HTMLElement).dataset.type;
    if (type === 'CARD') {
      cardTranslations2[original] = translation;
    } else {
      deckTranslations[original] = translation;
    }
  });

  saveCustomTranslations(deckTranslations);
  saveCustomCardTranslations(cardTranslations2);
}

function saveCurrentConfig(): void {
  const config: Record<string, boolean> = {};
  Object.keys(FEATURES).forEach((key) => {
    const checkbox = document.getElementById(`enable_${key}`) as HTMLInputElement;
    if (checkbox) {
      config[`enable_${key}`] = checkbox.checked;
    }
  });
  StorageManager.gm.set(storageKey.config(), config);
}

export function loadConfigToUI(config: Record<string, boolean>): void {
  Object.keys(FEATURES).forEach((key) => {
    const checkbox = document.getElementById(`enable_${key}`) as HTMLInputElement;
    if (checkbox) {
      checkbox.checked =
        config[`enable_${key}`] !== undefined
          ? config[`enable_${key}`]
          : FEATURES[key].enabled;
    }
  });
}

export function showConfigModal(): void {
  createConfigModal();
  const modal = document.getElementById('hsguru-config-modal');
  const config = getConfig();
  loadConfigToUI(config);
  if (modal) (modal as HTMLElement).style.display = 'block';
}

export function addConfigButton(): void {
  const navbarStart = document.querySelector('.navbar-start');
  if (!navbarStart) return;
  if (document.getElementById('config-menu-button')) return;

  const configButton = document.createElement('a');
  configButton.id = 'config-menu-button';
  configButton.className = 'navbar-item';
  configButton.href = '#';
  configButton.title = '插件配置';
  configButton.innerHTML = '⚙️';
  configButton.addEventListener('click', (e) => {
    e.preventDefault();
    showConfigModal();
  });
  navbarStart.appendChild(configButton);
}

export function getConfig(): Record<string, boolean> {
  const savedConfig = StorageManager.gm.get<Record<string, boolean>>(storageKey.config(), {});
  const defaultConfig: Record<string, boolean> = {};
  Object.keys(FEATURES).forEach((key) => {
    defaultConfig[`enable_${key}`] = FEATURES[key].enabled;
  });
  return { ...defaultConfig, ...savedConfig };
}

export function applyConfig(config: Record<string, boolean>): void {
  Object.keys(FEATURES).forEach((key) => {
    if (config.hasOwnProperty(`enable_${key}`)) {
      FEATURES[key].enabled = config[`enable_${key}`];
    }
  });
}

export function initializeFeatures(): void {
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
