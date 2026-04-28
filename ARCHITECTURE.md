HSGuru-Chinese-Plus — 功能架构说明

本文档用于帮助开发者和贡献者快速了解脚本的模块划分与函数职责。

---

## 入口

| 函数 | 说明 |
|------|------|
| `initializePlugin()` | 脚本总入口：读取并应用配置 → 注入导航栏按钮 → 运行所有已启用的功能 → 注入样式表 → 启动 DOM 变化观察者和事件监听 |

---

## 全局配置与功能开关

| 变量 / 函数 | 说明 |
|-------------|------|
| `CATEGORIES` | 功能分类标签对象 `{STYLE / TRANSLATION / ENHANCEMENT}` |
| `FEATURES` | 功能注册表，每项包含 `enabled` / `name` / `category` / `description` / `handler`。可在配置弹窗中逐项开关，设置持久化至 `localStorage "hsguru_config"` |
| `getConfig()` | 从 localStorage 读取用户配置，不存在时回退到 FEATURES 默认值 |
| `applyConfig(config)` | 将配置写回 `FEATURES[x].enabled`，影响后续 `initializeFeatures()` 的执行 |

---

## 常量 / 选择器 / 缓存

| 变量 | 说明 |
|------|------|
| `BASE_URL` | `"https://www.hsguru.com/"`，用于 URL 匹配 |
| `SELECTORS` | 常用 CSS 选择器字典（卡组标题、卡牌名、法力水晶等） |
| `queryCache` | DOM 查询结果的内存缓存 `{getOrCreate(selector)}`，避免相同选择器在同一生命周期内重复查询 |
| `translationCache` | 翻译结果的内存缓存 `{getOrCreate(text, fn)}` |
| `cardCache` | `Map<英文卡名, 中文卡名>`，卡牌翻译的内存层缓存。命中链路：内存 → localStorage → API 三级命中 |

---

## 翻译数据表

| 变量 | 说明 |
|------|------|
| `uiTranslations` | `Map<英文, 中文>`，覆盖页面中几乎所有通用 UI 文本：布尔值 / 显示条数 / 最小局数 / 排名档次 / 游戏模式 / 大区 / 胜负平 / 月份季节 / 时间描述 / 职业名称 / 功能按钮 / 表头标签等（共约 200+ 条目） |
| `staticPrefix` | `Object<英文前缀词, 中文>`，卡组名翻译的词头规则表。键支持单词或多词短语（如 `"No Minion"` → `"无随从"`） |
| `classSuffix` | `Object<英文职业词, 中文缩写>`，卡组名末尾职业词对应表。如 `"Rogue"` → `"贼"`、`"DH"` → `"瞎"` |
| `cardTranslations` | `Map`，`handleTable()` 在卡牌详情页使用的局部翻译缓存 |

---

## 自定义翻译持久化

所有自定义翻译存储于 localStorage。

| 存储键 | 说明 |
|--------|------|
| `hsguru_custom_deck_names` | 自定义卡组翻译 |
| `hsguru_custom_card_names` | 自定义卡牌翻译 |

| 函数 | 说明 |
|------|------|
| `loadCustomTranslations()` | 惰性从 localStorage 读取卡组自定义翻译 |
| `loadCustomCardTranslations()` | 惰性从 localStorage 读取卡牌自定义翻译 |
| `getCustomTranslations()` | 返回卡组自定义翻译对象 |
| `getCustomCardTranslations()` | 返回卡牌自定义翻译对象 |
| `getEffectiveCustomTranslations()` | 过滤掉空值条目，只返回实际有效的自定义翻译 |
| `saveCustomTranslation(k, v)` | 保存单条卡组自定义翻译 |
| `saveCustomTranslations(obj)` | 批量合并保存卡组自定义翻译 |
| `saveCustomCardTranslation(k, v)` | 保存单条卡牌自定义翻译 |
| `saveCustomCardTranslations(obj)` | 批量合并保存卡牌自定义翻译 |
| `deleteCustomTranslation(k)` | 删除单条卡组自定义翻译 |
| `deleteCustomCardTranslation(k)` | 删除单条卡牌自定义翻译 |
| `addUnmatchedWord(word)` | 将未匹配的卡组词写入自定义表（值为空，等待用户填写） |
| `addUnmatchedCardName(name)` | 将未匹配的卡牌名写入自定义表（值为空，等待用户填写） |

---

## 卡组名翻译引擎

| 函数 | 说明 |
|------|------|
| `generateAllRuneCombinations()` | 动态生成死骑符文组合（B/F/U 1~3位）→ HTML span 标签。结果合并进前缀规则，仅在 `FEATURES.RUNE.enabled` 时生效 |
| `getFullPrefixRules()` | 合并 `staticPrefix` + 符文组合 + 有效自定义翻译，作为 `generateDeckTranslation()` 的完整前缀规则集 |
| `generateDeckTranslation(name)` | 主翻译函数，处理英文卡组名 → 中文卡组名，流程如下： |

`generateDeckTranslation` 翻译流程：

1. 优先查自定义翻译
2. 末尾识别职业词（含双词 `"Demon Hunter"` / `"Death Knight"`）
3. 多词前缀短语匹配（从长到短，避免拆词）
4. 单词前缀匹配（含符文标记）
5. 未匹配词写入待翻译列表
6. 智能拼接：中英文混排时自动补空格

---

## 卡牌名翻译（异步 API）

| 变量 | 说明 |
|------|------|
| `pendingFetches` | `Map<卡名, DOM元素[]>`，正在等待 API 响应的元素队列 |
| `requestQueue` | 待处理的卡名请求队列（按顺序出队） |
| `activeRequests` | 当前并发请求数 |
| `MAX_CONCURRENT` | 最大并发请求数（2） |
| `REQUEST_DELAY` | 两次请求之间的间隔（500ms），避免触发限流 |

| 函数 | 说明 |
|------|------|
| `processQueue()` | 出队一个卡名 → 调用旅法师营地卡牌 API（`api2.iyingdi.com`）→ 成功时更新内存缓存 + localStorage + DOM；失败时将卡名写入未匹配列表 |
| `enqueueCardFetch(name)` | 将卡名加入请求队列（去重），并触发 `processQueue()` |
| `updateCardElement(el, text)` | 将翻译结果写入 DOM 元素，标记 `dataset.cardTranslated` |
| `handleCard()` | 遍历页面所有 `.card-name.deck-text` 元素，按优先级查翻译：内存缓存 → 自定义翻译 → localStorage → API 请求 |

---

## 功能处理函数（Feature Handlers）

| 函数 | 说明 |
|------|------|
| `handleAd()` | 移除广告元素（NitroPay 系列 id）及导航栏尾部广告区域；在 `/deck/` 详情页修正侧栏宽度；在首页移除推广卡片 |
| `handleBasic()` | 翻译导航栏、通知提示、按钮等通用 UI 文本（`uiTranslations`） |
| `handleCard()` | 翻译卡组中英文卡牌名称（见上方"卡牌名翻译"节） |
| `handleCardLinks()` | 移除卡组列表中卡牌名的 `<a>` 超链接（避免误点跳转） |
| `handleClipboard()` | 增强复制按钮：在卡组代码前后添加 `###` 标记，方便粘贴识别 |
| `handleDeck()` | 翻译卡组名称（调用 `generateDeckTranslation`），同时为卡组卡片注入自定义 CSS 类（`hsguru-deck-summary` 等），用于 `/decks` 及 `/streamer-decks` 路由的卡片美化 |
| `handleFilter()` | 翻译筛选下拉菜单和搜索框 placeholder（`uiTranslations`） |
| `handleFilterStyle()` | 为筛选器按钮按职业/格式/排名添加 `class-icon` 等样式类，并按路由注入筛选器容器（`/decks`、`/meta`、`/matchups` 等） |
| `handleMana()` | 将法力水晶数字替换为自定义 SVG 图标（data-URI） |
| `handleSearch()` | 翻译卡牌数据库（`/cards`）页面的搜索框占位符 |
| `handleSub()` | 替换副标题区域为中文版本，保留时间戳和功能链接，按路由分别处理 decks / meta / matchups / deck / card-stats / streamer-decks 等 |
| `handleTable()` | 按路由对数据表格进行翻译和美化（详见下方子表） |
| `handleTag()` | 翻译卡组列表上的统计标签（Games / Peaked By / First Streamed 等） |
| `handleTitle()` | 翻译各路由页面主标题 `<div.title.is-2>`，包含卡组名称、赛季格式、标准页面名等 |
| `handleScrollTop()` | 在页面右下角注入"返回顶部"悬浮按钮，滚动超过 300px 时显示 |

### handleTable() 按路由处理详情

| 路由 | 处理内容 |
|------|----------|
| `/card/N` | 翻译卡牌详情属性表 |
| `/deck/N` | 翻译卡组对局统计表头和职业名 |
| `/meta` | 注入 `hsguru-meta-table` 类，翻译表头和卡组名，为卡组职业列注入斑马纹底色 |
| `/card-stats` | 翻译影响力（Impact）类表头及 tooltip |
| `/matchups` | 注入 `hsguru-matchups-*` 类，翻译卡组名和 tooltip，通过 inline style 直接写入职业底色和左边框（绕开原站 `app.css !important` 覆盖问题） |
| `/archetype` | 翻译卡组类型统计表 |
| `/deck/N` 对局记录 | 翻译游戏模式/胜负/时间 |
| `/streamer-decks` | 翻译 abbr 表头 |
| `/esports` | 翻译赛事状态 |

---

## 样式注入

| 变量 | 说明 |
|------|------|
| `uiStyles` | 基础样式：背景色、字体、导航栏、卡片边框、卡牌数量颜色等 |
| `filterStyles` | 筛选器容器、下拉菜单、职业图标按钮、法力水晶 badge 等 |
| `manaStyles` | 法力水晶 SVG 图标样式（data-URI 背景） |
| `adStyles` | 广告位隐藏规则 |
| `titleStyles` | 主标题 (`.title.is-2`) 字号/颜色/样式 |
| `subStyles` | 副标题及自定义 `.new_subtitle` 样式 |
| `runeStyles` | 死骑符文 span 颜色（blood/frost/unholy） |
| `tableStyles` | 所有路由的表格美化规则（斑马纹、卡组列职业色块、`/meta` 表、`/matchups` 表、`/streamer-decks` 表等） |
| `injectStyles()` | 将上述所有样式按功能开关条件合并注入 `<style>` 标签 |

---

## DOM 观察与动态响应

| 函数 | 说明 |
|------|------|
| `setupDOMTranslationObserver()` | 创建 MutationObserver 监听全局 DOM 变化，每次变化后延迟重新执行所有已启用功能（节流处理）。保证单页应用路由切换后翻译仍然生效。⚠️ 所有功能函数必须做幂等保护（ID/dataset 检查），因为 DOM 每次变化都可能触发重新执行 |
| `setupEventListeners()` | 监听筛选器下拉菜单点击，延迟重新触发 `handleDeck()` 和 `handleCard()`（卡组内容懒加载场景） |

---

## 配置弹窗 UI

| 函数 | 说明 |
|------|------|
| `createConfigModal()` | 生成配置弹窗 DOM（功能开关列表 + 自定义翻译管理面板） |
| `bindConfigModalEvents()` | 绑定弹窗内所有交互事件（关闭/保存/导入/导出/增删翻译条目） |
| `showConfigModal()` | 打开弹窗并将当前配置同步至 UI |
| `addConfigButton()` | 在导航栏末尾插入 ⚙️ 配置按钮（防重复注入） |
| `createTranslationItemElement()` | 渲染单条自定义翻译条目（显示模式） |
| `updateMergeBtnVisibility()` | 根据待翻译列表数量动态显隐"合并已有翻译"按钮 |
| `saveCustomTranslationsFromUI()` | 从弹窗中的 input 元素收集翻译并批量写入 localStorage |
| `saveCurrentConfig()` | 将弹窗中功能开关的勾选状态写入 localStorage |
| `loadConfigToUI(config)` | 将配置对象同步到弹窗中各 checkbox 的 checked 状态 |
| `initializeFeatures()` | 遍历 FEATURES，执行所有 `enabled && handler` 的功能 |
