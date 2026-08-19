# 筛选栏问题修复及可行性方案

## 1. 修复优先级

| 优先级 | 问题                 | 可行性 | 风险   |
| ------ | -------------------- | ------ | ------ |
| P0     | 职业筛选事件失效     | 高     | 低     |
| P1     | 筛选栏闪烁和重复渲染 | 中高   | 中     |
| P2     | 多行布局背景高度不足 | 高     | 低到中 |

## 2. P0：安全翻译筛选项

### 目标

只修改菜单项的显示文本，不删除内部事件节点和站点属性。

### 实施方案

修改 `src/features/filterTranslation.ts`：

1. 不再对整个菜单项执行 `element.textContent = translation`。
2. 使用 `TreeWalker` 找到可替换的文本节点。
3. 保留 `phx-click`、`phx-value-value`、`phx-target`、`x-on:click` 等属性和子节点。
4. 将原始英文保存到 `data-hsguru-filter-key`，避免后续逻辑只能读取中文显示文本。
5. 对已经翻译的元素跳过写入，保证幂等。

筛选美化逻辑应根据 `data-hsguru-filter-key` 识别图标和分类 class，而不是依赖当前 `textContent`。

### 验收

- 玩家职业选项点击后可以更新筛选状态。
- 对战职业选项点击后可以更新筛选状态。
- 菜单项内部的 LiveView/Alpine 节点仍然存在。
- 普通筛选项的显示文本仍能翻译。

## 3. P1：减少闪烁和二次渲染

### 3.1 强化 DOM 操作幂等性

修改 `src/features/filterStyleHandler.ts`：

- 创建容器前检查现有 marker。
- 节点已经在目标容器中时不再移动。
- 确保一个目标区域只生成一个主 `.filters-container`。
- 对嵌套 Alpine `tw-flex-wrap` 容器进行识别，避免重复添加完整背景和 padding。
- 添加 class 前检查当前 class 状态。

### 3.2 让筛选语义与显示文本解耦

筛选项应保存原始 key：

```html
<a data-hsguru-filter-key="Death Knight">死亡骑士</a>
```

图标、分类和后续逻辑读取该 key。这样即使显示文本被翻译，也不会因为英文匹配失败而出现样式前后不一致。

### 3.3 收敛 MutationObserver

修改 `src/main.ts`：

- 对 mutation target 和新增子树进行分类。
- 筛选相关 mutation 才触发筛选处理。
- 不因为卡牌翻译回包而重新移动筛选栏。
- 检查并收敛下拉点击后 1 秒执行 `handleDeck()`、`handleCard()` 的逻辑。
- 保留 rAF 批处理，但避免每次 mutation 都运行全部 feature。

不建议仅依赖 `disconnect()` 或无条件 `takeRecords()`，因为可能吞掉 HSGuru LiveView 的有效更新。应先完成幂等处理和 mutation 分类。

### 验收

- 首次加载不出现明显的原样式闪回。
- 单次筛选点击不触发无关功能的重复渲染。
- 同一筛选区域不会反复移动 DOM 节点。
- URL、选中状态和筛选结果均保持正确。
- Console 无新增异常。

## 4. P2：修复多行高度和背景

### 建议 CSS

```css
.filters-container {
  height: auto !important;
  min-height: 0 !important;
  align-content: flex-start !important;
  overflow: visible !important;
}
```

同时：

- 使用 `row-gap` 控制多行间距。
- 保留稳定的按钮 `min-height`。
- 清理详情页和主播页中过时的 `min-height: 119px !important`。
- 检查并覆盖父级固定高度和 `overflow: hidden`。
- 将 `outline` 造成的视觉边界与真实容器高度区分处理。

嵌套容器应取消内层背景和 padding：

```css
.filters-container .filters-container {
  min-height: 0 !important;
  padding: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}
```

该规则需要根据真实页面结构限制范围，避免影响合法的独立筛选区域。

### 验收

- 筛选按钮可以自然换行。
- 第二行仍处于筛选栏背景范围内。
- 详情页、主播页、排行榜和移动端均无高度异常。
- 下拉菜单不被容器裁剪。

## 5. 实施顺序

1. 先修复安全翻译，恢复职业筛选事件。
2. 再修复筛选容器幂等性和原始 key 保存。
3. 随后调整 MutationObserver 调度。
4. 最后调整多行 CSS，并使用真实 viewport 回归。
5. 运行 `pnpm run lint` 和 `pnpm run build`。
