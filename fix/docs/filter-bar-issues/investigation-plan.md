# 筛选栏问题排查方案

## 1. 问题范围

当前需要排查以下问题：

1. 筛选栏美化完成后短暂恢复原样式，随后再次渲染。
2. 玩家职业和对战职业下拉选项选中后不生效。
3. 其他筛选下拉选项选择后出现筛选栏样式闪烁和二次渲染。
4. 筛选按钮换行后，第二行超出筛选栏背景高度。

## 2. 初步根因假设

### 2.1 闪烁和二次渲染

重点检查以下调用链：

```text
HSGuru 首次渲染
 -> filterStyleHandler 移动或包装筛选节点
 -> filterTranslation 替换筛选文字
 -> MutationObserver 监听到 childList/characterData
 -> 下一帧重新执行全部 feature
 -> HSGuru LiveView/Alpine 更新或恢复节点
```

相关位置：

- `src/features/filterStyleHandler.ts:98-210`
- `src/features/filterTranslation.ts:4-13`
- `src/main.ts:84-110`
- `src/main.ts:122-137`

筛选栏节点的 `appendChild`、`insertBefore` 和菜单项的 `textContent` 替换都会制造 DOM mutation。当前 observer 对整个 `document.body` 的任意文本或子节点变化都重新运行所有功能，因此可能产生重复布局和视觉闪烁。

### 2.2 职业筛选无法生效

职业菜单项可能具有以下结构：

```html
<a href="#">
  <div>
    <span phx-click="add_selected" phx-value-value="DEATHKNIGHT"> Death Knight </span>
  </div>
</a>
```

`src/features/filterTranslation.ts` 当前对外层 `a` 使用：

```ts
element.textContent = translation;
```

这会删除内部带有 `phx-click`、`phx-value-value` 和 `phx-target` 的节点，导致下拉可以关闭但实际筛选事件丢失。玩家职业和对战职业使用相同风险结构，应优先验证。

### 2.3 第二行溢出背景

重点检查：

- `.filters-container` 是否有固定或过大的 `min-height`。
- 父级是否设置了固定 `height`、`max-height` 或 `overflow`。
- 是否生成嵌套 `.filters-container`。
- 详情页和主播页是否被 `min-height: 119px !important` 覆盖。
- `outline` 是否造成视觉上的边界溢出。

相关位置：

- `src/features/styles.ts:82-114`
- `src/features/styles.ts:360-378`
- `src/features/styles.ts:398-429`
- `src/features/filterStyleHandler.ts:79-95`

## 3. 浏览器验证步骤

### 3.1 验证职业事件是否被删除

在脚本运行前后分别执行：

```js
document
  .querySelector('#player_class_dropdown_class_multi a[href="#"]')
  ?.querySelector('[phx-click="add_selected"]');
```

对战职业将选择器中的 `player_class` 替换为对应容器名称。若脚本运行后结果为 `null`，即可确认事件节点被翻译逻辑删除。

### 3.2 记录 mutation 和执行时序

```js
new MutationObserver((mutations) => {
  console.log(performance.now(), mutations);
}).observe(document.body, {
  childList: true,
  characterData: true,
  subtree: true,
});
```

分别记录首次加载和点击筛选项时的 mutation 数量、目标节点、addedNodes 和 removedNodes。

### 3.3 检查筛选容器数量和布局

```js
const containers = [...document.querySelectorAll('.filters-container')];
containers.map((el) => ({
  rect: el.getBoundingClientRect().toJSON(),
  scrollHeight: el.scrollHeight,
  clientHeight: el.clientHeight,
  height: getComputedStyle(el).height,
  minHeight: getComputedStyle(el).minHeight,
  padding: getComputedStyle(el).padding,
  overflow: getComputedStyle(el).overflow,
  nested: el.querySelectorAll('.filters-container').length,
}));
```

若 `scrollHeight > clientHeight`，说明内容实际超出容器；若两者相等但视觉仍溢出，则继续检查 `outline`、定位属性和实际绘制背景的元素。

### 3.4 功能开关对比

分别测试以下组合：

1. 筛选器翻译关闭，筛选栏美化关闭。
2. 仅开启筛选器翻译。
3. 仅开启筛选栏美化。
4. 两项同时开启。

通过对比确定问题属于事件破坏、DOM 重组、文字替换还是 observer 调度。

### 3.5 页面和 viewport 矩阵

页面：`/decks`、`/meta`、`/card-stats`、`/matchups`、`/deck/:id`、`/leaderboard`。

宽度：`1440px`、`1280px`、`900px`、`769px`、`768px`、`480px`。

每次记录：筛选结果、URL、选中状态、`.filters-container` 数量、容器高度和是否闪烁。
