# 筛选栏问题多 Agent 工作分配方案

## 1. Agent 1：筛选事件与安全翻译

### 负责范围

- `src/features/filterTranslation.ts`
- 必要时检查 `src/features/searchTranslation.ts`
- 筛选菜单项的事件属性和显示文本处理

### 工作内容

1. 定位玩家职业和对战职业的实际 DOM 结构。
2. 修复外层元素 `textContent` 覆盖问题。
3. 只修改文本节点，保留内部 LiveView/Alpine 节点。
4. 保存原始英文筛选 key。
5. 确保翻译操作幂等。

### 交付物

- 修改后的源文件。
- 职业筛选事件保留证明。
- 普通筛选项回归步骤。

## 2. Agent 2：筛选栏结构与 CSS

### 负责范围

- `src/features/filterStyleHandler.ts`
- `src/features/styles.ts`

### 工作内容

1. 检查筛选容器是否重复创建。
2. 确保节点已经在目标容器时不再移动。
3. 处理嵌套 `.filters-container`。
4. 修复 `min-height`、`height`、padding、gap 和换行行为。
5. 覆盖详情页、主播页和移动端的特殊规则。

### 交付物

- 修改后的结构和样式文件。
- `1440px`、`900px`、`768px`、`480px` 下的布局验证结果。
- `.filters-container` 数量和高度检查结果。

## 3. Agent 3：MutationObserver 和重复渲染

### 负责范围

- `src/main.ts`
- 与下拉点击后延迟处理相关的调用

### 工作内容

1. 分析筛选点击产生的 mutation 记录。
2. 区分站点 mutation 和脚本派生 mutation。
3. 减少不必要的全量 feature 执行。
4. 评估下拉点击后的延迟 `handleDeck()`、`handleCard()` 调用。
5. 保证不会拦截 HSGuru LiveView 的有效更新。

### 交付物

- 修改后的 observer 调度逻辑。
- 一次筛选点击的 mutation 和 handler 执行次数。
- 对事件、卡组翻译、卡牌翻译的影响说明。

## 4. Agent 4：Chrome MCP 回归验证

### 负责范围

Agent 4 不修改业务代码，只负责验证。

### 测试页面

- `/decks`
- `/meta`
- `/card-stats`
- `/matchups`
- `/deck/:id`
- `/leaderboard`

### 测试内容

- 玩家职业筛选。
- 对战职业筛选。
- 格式、排名和其他筛选。
- 首次加载闪烁。
- 筛选后重复渲染。
- 第二行背景高度。
- 桌面、窄屏和移动端 viewport。

### 交付物

- 修复前后问题矩阵。
- URL、选中状态、筛选结果和 DOM 状态记录。
- 未解决问题及复现条件。

## 5. 协作顺序

1. Agent 1 与 Agent 2 可以并行执行。
2. Agent 3 需要参考 Agent 1 和 Agent 2 的最终 DOM 结构。
3. Agent 4 在所有修改合并后执行完整回归。
4. 主 Agent 负责冲突处理、构建验证和最终回收。

## 6. 文件边界

| Agent   | 允许修改                                              |
| ------- | ----------------------------------------------------- |
| Agent 1 | `filterTranslation.ts`、必要时 `searchTranslation.ts` |
| Agent 2 | `filterStyleHandler.ts`、`styles.ts`                  |
| Agent 3 | `main.ts`                                             |
| Agent 4 | 不修改业务代码                                        |

各 Agent 不应覆盖其他 Agent 的未提交修改，也不应修改与任务无关的文件。
