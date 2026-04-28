// ==UserScript==
// @name         HSGuru-Chinese-Plus
// @namespace    https://www.hsguru.com/
// @author       QuanQuan
// @version      v1.1
// @description  一款 ScriptCat / Tampermonkey 用户脚本，适用于 [HSGuru](https://www.hsguru.com/)（炉石传说数据统计网站）
// @icon         https://www.hsguru.com/favicon.ico
// @match        https://www.hsguru.com/*
// @connect      api2.iyingdi.com
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
  "use strict";
  const CATEGORIES = {
    STYLE: "界面美化",
    TRANSLATION: "翻译功能",
    ENHANCEMENT: "增强功能",
  };
  const FEATURES = {
    UI: {
      enabled: true,
      name: "基础样式美化",
      category: "STYLE",
      description: "优化网站的基础背景、导航栏及卡牌样式。",
    },
    FILTER_STYLE: {
      enabled: true,
      handler: null,
      name: "筛选器美化",
      category: "STYLE",
      description: "美化筛选器外观，使其更加现代且易于使用。",
    },
    RUNE: {
      enabled: true,
      name: "死亡骑士符文美化",
      category: "STYLE",
      description: "为死亡骑士职业的卡牌添加精美的符文颜色标识。",
    },
    MANA: {
      enabled: true,
      handler: null,
      name: "法力水晶美化",
      category: "STYLE",
      description: "将法力水晶数值替换为更具质感的图形化图标。",
    },
    TITLE_STYLE: {
      enabled: true,
      handler: null,
      name: "页面主标题样式美化",
      category: "STYLE",
      description: "优化主标题的字体大小、颜色及排版样式。",
    },
    SUB_STYLE: {
      enabled: true,
      handler: null,
      name: "页面副标题样式美化",
      category: "STYLE",
      description: "为副标题添加更美观的样式修饰。",
    },
    TABLE_STYLE: {
      enabled: true,
      handler: null,
      name: "表格样式美化",
      category: "STYLE",
      description: "优化表格的行高、背景色及边框，提升阅读体验。",
    },
    BASIC: {
      enabled: true,
      handler: null,
      name: "基础UI翻译",
      category: "TRANSLATION",
      description: "翻译页面中基础的导航项、按钮及通知文字。",
    },
    FILTER: {
      enabled: true,
      handler: null,
      name: "筛选器翻译",
      category: "TRANSLATION",
      description: "对卡组列表中的格式、排名、职业等筛选条件进行中文翻译。",
    },
    SEARCH: {
      enabled: true,
      handler: null,
      name: "搜索框翻译",
      category: "TRANSLATION",
      description: "为卡牌数据库的搜索框提供中文翻译支持。",
    },
    DECK: {
      enabled: true,
      handler: null,
      name: "卡组名称翻译",
      category: "TRANSLATION",
      description: "对卡组详情页的卡组名称进行规则化翻译。",
    },
    CARD: {
      enabled: true,
      handler: null,
      name: "卡牌名称翻译",
      category: "TRANSLATION",
      description: "将卡牌数据库及卡组中的英文卡名替换为官方中文名称。",
    },
    TAG: {
      enabled: true,
      handler: null,
      name: "卡组局数标签翻译",
      category: "TRANSLATION",
      description: "在卡组列表上翻译局数、胜率等标签文字。",
    },
    TITLE: {
      enabled: true,
      handler: null,
      name: "页面主标题翻译",
      category: "TRANSLATION",
      description: "翻译各个页面的主标题，如“Decks”、“Meta”等。",
    },
    SUB: {
      enabled: true,
      handler: null,
      name: "页面副标题翻译",
      category: "TRANSLATION",
      description: "翻译页面中的副标题及相关辅助说明文字。",
    },
    TABLE: {
      enabled: true,
      handler: null,
      name: "表格翻译",
      category: "TRANSLATION",
      description: "翻译数据表格中的表头、统计项及内容文字。",
    },
    AD: {
      enabled: true,
      handler: null,
      name: "广告移除",
      category: "ENHANCEMENT",
      description: "自动隐藏页面中影响阅读的各种广告位。",
    },
    CARD_LINK: {
      enabled: true,
      handler: null,
      name: "移除卡牌超链接",
      category: "ENHANCEMENT",
      description: "移除卡组列表中可能干扰操作的卡牌名称超链接。",
    },
    CLIPBOARD: {
      enabled: true,
      handler: null,
      name: "卡组复制按钮增强",
      category: "ENHANCEMENT",
      description: "增强卡组代码复制功能，提供更友好的交互提示。",
    },
    SCROLL_TOP: {
      enabled: true,
      handler: null,
      name: "返回顶部按钮",
      category: "ENHANCEMENT",
      description: "在页面右下角添加一个悬浮按钮，点击可快速返回页面顶部。",
    },
  };
  function handleAd() {
    [
      "nitropay-sticky-side-rail-container",
      "below-title-ads",
      "nitropay-below-title-leaderboard",
      "nitropay-floating-video-all",
      "nitro-float-close",
      "nitropay-sticky-side-rail",
      "nitropay-sticky-side-rail-close",
      "nitropay-desktop-anchor",
      "nitropay-desktop-anchor-close",
    ].forEach((id) => {
      const element = document.getElementById(id);
      if (element) element.remove();
    });
    const navbarEnd = document.querySelector("div.navbar-end");
    if (navbarEnd) navbarEnd.remove();
    if (
      window.location.href.match(
        /^https:\/\/www\.hsguru\.com\/deck\/(\d+|[A-Za-z0-9+/=%]+)(?:\?.*)?$/,
      )
    ) {
      const columnElement = document.querySelector(
        "div.column.is-narrow-mobile",
      );
      if (columnElement) {
        columnElement.style.flex = "none";
        columnElement.style.minWidth = "400px";
        columnElement.style.marginTop = "3.5rem";
      }
    }
    if (window.location.href.match(/^https:\/\/www\.hsguru\.com\/?$/)) {
      const cardContents = document.querySelectorAll("div.card-content");
      cardContents.forEach((cardContent) => {
        var _a, _b;
        const greatGrandParent =
          (_b =
            (_a = cardContent.parentNode) == null ? void 0 : _a.parentNode) ==
          null
            ? void 0
            : _b.parentNode;
        if (greatGrandParent) greatGrandParent.remove();
      });
    }
  }
  const SELECTORS = {
    DECK_TITLE: "h2.deck-title > span > a",
    DECK_LINK: "a.deck-title",
    BASIC_DECK_TITLE: "a.basic-black-text.deck-title",
    CARD_NAME: "div.card-name.deck-text",
    NAV_BASE: "#burger-toggle > div.navbar-start",
    MANA_CRYSTAL:
      '.card-number.deck-text.decklist-card-background.is-unselectable.has-text-left[style="width: 3ch"]',
  };
  const DEFAULT_CLASS_ACCENT = "#9a8768";
  const DEFAULT_CLASS_BG = "rgba(154, 135, 104, 0.10)";
  const CLASS_ACCENT_COLORS = {
    deathknight: "#c51e35",
    demonhunter: "#5aa832",
    druid: "#c67a2d",
    hunter: "#5a9f44",
    mage: "#36b9d4",
    paladin: "#d8c936",
    priest: "#b8ad98",
    rogue: "#d3b63b",
    shaman: "#1581cf",
    warlock: "#a931c7",
    warrior: "#bf8a55",
  };
  const CLASS_BG_COLORS = {
    deathknight: "rgba(197, 30, 53, 0.13)",
    demonhunter: "rgba(90, 168, 50, 0.13)",
    druid: "rgba(198, 122, 45, 0.13)",
    hunter: "rgba(90, 159, 68, 0.13)",
    mage: "rgba(54, 185, 212, 0.13)",
    paladin: "rgba(216, 201, 54, 0.13)",
    priest: "rgba(184, 173, 152, 0.13)",
    rogue: "rgba(211, 182, 59, 0.13)",
    shaman: "rgba(21, 129, 207, 0.13)",
    warlock: "rgba(169, 49, 199, 0.13)",
    warrior: "rgba(191, 138, 85, 0.13)",
  };
  function getMappedClassValue(element, mapping, fallback) {
    const className = Object.keys(mapping).find((name) =>
      element.classList.contains(name),
    );
    return mapping[className] || fallback;
  }
  const uiTranslations = /* @__PURE__ */ new Map([
    ["Yes", "是"],
    ["No", "否"],
    ["True", "是"],
    ["False", "否"],
    ["Show 5", "显示5条"],
    ["Show 10", "显示10条"],
    ["Show 20", "显示20条"],
    ["Show 30", "显示30条"],
    ["Show 40", "显示40条"],
    ["Show 50", "显示50条"],
    ["Show 75", "显示75条"],
    ["Show 100", "显示100条"],
    ["Show 150", "显示150条"],
    ["Show 200", "显示200条"],
    ["Show 250", "显示250条"],
    ["Show 300", "显示300条"],
    ["Show 350", "显示350条"],
    ["Show 500", "显示500条"],
    ["Show 750", "显示750条"],
    ["Show 1000", "显示1000条"],
    ["Show 3000", "显示3000条"],
    ["Show 2000", "显示2000条"],
    ["Show 4000", "显示4000条"],
    ["Show 5000", "显示5000条"],
    ["Min 1", "最少1局"],
    ["Min 2", "最少2局"],
    ["Min 3", "最少3局"],
    ["Min 5", "最少5局"],
    ["Min 7", "最少7局"],
    ["Min 10", "最少10局"],
    ["Min 15", "最少15局"],
    ["Min 20", "最少20局"],
    ["Min 50", "至少50局"],
    ["Min 100", "至少100局"],
    ["Min 200", "至少200局"],
    ["Min 800", "至少800局"],
    ["Min 400", "至少400局"],
    ["Min 1600", "至少1600局"],
    ["Min 3200", "至少3200局"],
    ["Min 6400", "至少6400局"],
    ["Min 12800", "至少 12800局"],
    ["Min 1 Finishes", "最少1局"],
    ["Min 2 Finishes", "最少2局"],
    ["Min 3 Finishes", "最少3局"],
    ["Min 5 Finishes", "最少5局"],
    ["Min 7 Finishes", "最少7局"],
    ["Min 10 Finishes", "最少10局"],
    ["Min 15 Finishes", "最少15局"],
    ["Min 20 Finishes", "最少20局"],
    ["Min 0%", "最低0%"],
    ["Min 20%", "最低20%"],
    ["Min 30%", "最低30%"],
    ["Min 40%", "最低40%"],
    ["Min 45%", "最低45%"],
    ["Min 50%", "最低50%"],
    ["Min 55%", "最低55%"],
    ["Min 60%", "最低60%"],
    ["Min 70%", "最低70%"],
    ["Min 80%", "最低80%"],
    //排名
    ["Top 500", "前100名"],
    ["Top 1000", "前1000名"],
    ["Top 5000", "前5000名"],
    ["Top 1k", "前1000名"],
    ["Top 5k", "前5000名"],
    ["Legend", "传说"],
    ["Diamond 4-1", "钻石4-1"],
    ["Diamond-Legend", "钻石-传说"],
    ["Top 1", "第1名"],
    ["Top 5", "前5名"],
    ["Top 10", "前10名"],
    ["Top 25", "前25名"],
    ["Top 50", "前50名"],
    ["Top 100", "前100名"],
    ["Top 200", "前200名"],
    //模式
    ["Arena", "竞技场"],
    ["Mercenaries", "佣兵战记"],
    ["Brawl", "乱斗"],
    ["Battlegrounds Duos", "酒馆战旗双人"],
    ["Battlegrounds", "酒馆战旗"],
    ["Standard", "标准"],
    ["Twist", "幻变"],
    ["Wild", "狂野"],
    //
    ["Americas", "美服"],
    ["Asia-Pacific", "亚服"],
    ["China", "国服"],
    ["Europe", "欧服"],
    //
    ["Win", "胜利"],
    ["Loss", "失败"],
    ["Draw", "平局"],
    //
    ["January", "1月"],
    ["February", "2月"],
    ["March", "3月"],
    ["April", "4月"],
    ["May", "5月"],
    ["June", "6月"],
    ["July", "7月"],
    ["August", "8月"],
    ["September", "9月"],
    ["October", "10月"],
    ["November", "11月"],
    ["December", "12月"],
    ["Spring", "春季"],
    ["Summer", "夏季"],
    ["Fall", "秋季"],
    ["Winter", "冬季"],
    ["10 minutes ago", "10分钟前"],
    ["15 minutes ago", "15分钟前"],
    ["20 minutes ago", "20分钟前"],
    ["30 minutes ago", "30分钟前"],
    ["1 hour ago", "1小时前"],
    ["6 hours ago", "6小时前"],
    ["1 day ago", "1天前"],
    ["1 week ago", "1周前"],
    ["2023 Fall", "2023年秋季"],
    ["2023 Spring", "2023年春季"],
    ["2023 Summer", "2023年夏季"],
    ["2023", "2023年"],
    ["2024 Spring", "2024年春季"],
    ["2024 Summer", "2024年夏季"],
    ["2024", "2024年"],
    ["2025 Last Chance", "2025年最后机会"],
    ["2025 Spring", "2025年春季"],
    ["2025 Summer", "2025年夏季"],
    ["2025", "2025年"],
    ["Past Day", "过去1天"],
    ["Past 3 Hours", "过去3小时"],
    ["Past 6 Hours", "过去6小时"],
    ["Past 3 Days", "过去3天"],
    ["Past Week", "过去1周"],
    ["Past 2 Weeks", "过去2周"],
    ["Past 30 days", "过去30天"],
    ["hour ago", "小时前"],
    ["hours ago", "小时前"],
    ["minute ago", "分钟前"],
    ["minutes ago", "分钟前"],
    //职业
    ["Demonhunter", "恶魔猎手"],
    ["Deathknight", "死亡骑士"],
    ["Death Knight", "死亡骑士"],
    ["Druid", "德鲁伊"],
    ["Demon Hunter", "恶魔猎手"],
    ["Hunter", "猎人"],
    ["Mage", "法师"],
    ["Paladin", "圣骑士"],
    ["Priest", "牧师"],
    ["Rogue", "盗贼"],
    ["Shaman", "萨满祭司"],
    ["Warlock", "术士"],
    ["Warrior", "战士"],
    ["VS Death Knight", "VS 死亡骑士"],
    ["VS Demon Hunter", "VS 恶魔猎手"],
    ["VS Druid", "VS 德鲁伊"],
    ["VS Hunter", "VS 猎人"],
    ["VS Mage", "VS 法师"],
    ["VS Paladin", "VS 圣骑士"],
    ["VS Priest", "VS 牧师"],
    ["VS Rogue", "VS 盗贼"],
    ["VS Shaman", "VS 萨满祭祀"],
    ["VS Warlock", "VS 术士"],
    ["VS Warrior", "VS 战士"],
    //
    ["Follow", "关注"],
    ["Matchups (WIP)", "对阵数据（开发中）"],
    ["Privacy Policy", "隐私政策"],
    ["Battlefy Multi Tournament Stats", "多赛事统计"],
    ["Batch Lineup Importer", "批量阵容导入器"],
    ["Chat Bot Hooks", "聊天机器人钩子"],
    ["Any Decks", "任意卡组"],
    ["Includes Latest Set", "包含最新扩展包"],
    ["Includes Cataclysm Cards", "包含大灾变卡牌"],
    ["3rd Party Tournaments", "第三方赛事"],
    ["About", "关于"],
    ["All", "全部"],
    ["Any Class", "任意职业"],
    ["Player Class", "玩家职业"],
    ["Any Opponent", "任意对手"],
    ["Any Player", "任意"],
    ["Any", "任意"],
    ["Archetype Card Stats", "卡组类型卡牌统计"],
    ["Archetype Stats", "卡组类型统计"],
    ["Archetypes", "卡组类型"],
    ["Archive of old hsesports pages", "历史电竞数据"],
    ["Battlefy Tournament Stats", "赛事统计"],
    ["Bonobo 2025", "2025年Bonobo"],
    ["Card Stats", "卡牌统计"],
    ["Card", "卡牌"],
    ["Cancel", "取消"],
    ["Cataclysm Cards", "大灾变卡牌"],
    ["Cards", "卡牌"],
    ["Cheapest Deck", "最便宜的卡组"],
    ["Choose organization", "选择赛事组织"],
    ["Class", "职业"],
    ["Classic", "经典"],
    ["Clear", "清除"],
    ["Coin?", "先后手？"],
    ["Compare to", "对比"],
    ["Counts Alongside Impact", "在影响值旁显示次数"],
    ["Deck Stats", "卡组统计"],
    ["Deck", "卡组"],
    ["Deckbuilder", "卡组构建器"],
    ["Decks", "卡组"],
    ["Deckviewer", "卡组查看器"],
    ["View deck and stats", "查看卡组和统计"],
    ["View in Deckviewer", "在卡组查看器中查看"],
    ["Find streamer decks for this deck", "查找此卡组的主播卡组"],
    ["Discord Bot", "Discord机器人"],
    ["Don't Show Counts", "不显示计数"],
    ["Drawn Count", "抽到次数"],
    ["Drawn Impact Tooltip", "抽到时胜率 - 卡组胜率"],
    ["Drawn Impact", "抽到影响"],
    ["Not Drawn Count", "未抽到次数"],
    ["Not Drawn Impact Tooltip", "未抽到时胜率 - 卡组胜率（越低越好）"],
    ["Not Drawn Impact", "未抽到影响"],
    ["Drawn", "抽到"],
    ["Esports", "电子竞技"],
    ["Exclude cards", "排除卡牌"],
    ["Fantasy", "梦幻联赛"],
    ["Filter Countries", "过滤国家"],
    ["Filters & co", "筛选器"],
    ["Game Mode", "对战模式"],
    ["Going First", "先手"],
    ["HDT Plugin", "HDT 插件"],
    ["Hearthstone Cards", "卡牌"],
    ["Hearthstone DeckBuilder", "卡组构建器"],
    ["Hide country flags", "隐藏国家旗帜"],
    ["HSEsports Points", "电竞积分"],
    ["In Mulligan", "换牌"],
    ["Include cards", "包含卡牌"],
    ["Kept Count", "保留次数"],
    ["Kept Impact Tooltip", "保留时胜率 - 卡组胜率"],
    ["Kept Impact", "保留影响"],
    ["Kept", "保留"],
    ["Known Issues", "已知问题"],
    ["Leaderboard Stats", "排行榜统计"],
    ["Leaderboard", "排行榜"],
    ["Leaderboards", "排行榜"],
    ["Legacy HSEsports", "历史电竞数据"],
    ["Meta", "环境"],
    ["Matchups", "对阵数据"],
    ["Min Drawn Count", "最小抽牌数"],
    ["Min Games", "最少对局数"],
    ["Min Mull Count", "最小换牌数"],
    ["Min Winrate", "最低胜率"],
    ["Min Matchup Games", "最少对局数"],
    ["Min Archetype Games", "最少卡组类型对局数"],
    ["Misc", "杂项"],
    ["Most Expensive Deck", "最贵的卡组"],
    ["Mulligan Count", "调度次数"],
    ["Mulligan Impact Tooltip", "换牌（保留+换来）胜率 - 卡组胜率"],
    ["Mulligan Impact", "换牌（换牌阶段）影响"],
    ["Newest Deck", "最新的卡组"],
    ["None", "无"],
    ["Not Drawn", "未抽到"],
    ["Not In Mulligan", "未换牌"],
    ["Not Kept", "未保留"],
    ["Oldest Deck", "最旧的卡组"],
    ["On Coin", "后手"],
    ["Opponent Class", "对战职业"],
    ["Opponent", "对手"],
    ["Opponent's Class", "对战职业"],
    ["Omni Bar", "全能搜索"],
    ["Page Size", "每页大小"],
    ["Period", "时段"],
    ["Played", "对战时间"],
    ["Player Stats", "玩家数据"],
    ["Player", "玩家"],
    ["Position", "当前排名"],
    ["Points Season", "积分赛季"],
    ["Rank", "排名"],
    ["Ranked Standard", "标准天梯"],
    ["Region", "地区"],
    ["Regions", "地区"],
    ["Replay Link", "回放链接"],
    ["Replays", "回放"],
    ["Reset Weights", "重置权重"],
    ["Result", "结果"],
    ["Search", "搜索"],
    ["Search help", "搜索帮助"],
    ["Show Country Flags", "显示国家旗帜"],
    ["Show country flags", "显示国家旗帜"],
    ["Show Counts", "显示计数"],
    ["Sign in (Battlenet)", "登录（战网）"],
    ["Stats Explanation", "统计说明"],
    ["Stats", "统计"],
    ["Seed Weights", "填充权重"],
    ["Streamer Decks", "直播卡组"],
    ["Streaming Now", "正在直播"],
    ["Submit", "提交"],
    ["Text Instructions", "文本说明"],
    ["Time", "时间"],
    ["Total Games", "总对局数"],
    ["Total", "总计"],
    ["Tournaments Stats", "赛事统计"],
    ["Troubleshooting", "故障排除"],
    ["Type or paste", "输入或粘贴"],
    [
      "Type or paste something to get relevant links. Currently supported:",
      "输入或粘贴内容以获取相关链接。目前支持：",
    ],
    ["Unknown", "未知"],
    ["Use Current Season", "使用当前赛季"],
    ["Utilities", "工具库"],
    ["Video Guide", "视频教程"],
    ["View Replay", "查看回放"],
    ["Winrate %", "胜率 %"],
    ["Winrate", "胜率"],
    ["Wonderful Un’Goro", "美好的安戈洛"],
    ["History", "历史"],
    ["Battletag", "昵称"],
    ["Masters Tour", "大师巡回赛"],
    ["Wrong Region", "赛区错误"],
    ["Best", "最佳"],
    ["Worst", "最差"],
    ["Average Finish", "平均排名"],
    ["Total Finishes", "总上榜次数"],
    ["Archetype", "卡组职业"],
    ["Popularity", "使用率"],
    ["Turns", "回合数"],
    ["Duration", "对局时长"],
    ["Climbing Speed", "上分速度"],
    ["Legend Peak", "最高传说排名"],
    ["Latest Legend Rank", "当前传说排名"],
    ["Worst Legend Rank", "最低传说排名"],
    ["Peak", "最高"],
    ["Latest", "当前"],
    ["Worst", "最低"],
    ["Deck", "卡组"],
    ["Streamer", "主播"],
    ["Format", "模式"],
    ["Peak", "最高"],
    ["Latest", "当前"],
    ["Worst", "最低"],
    ["Win - Loss", "胜负比"],
    ["Links", "链接"],
    ["Last Played", "最后对局"],
    ["Last hour", "最近1小时"],
    ["Last day", "最近1天"],
    ["Last 3 days", "最近3天"],
    ["Last 7 days", "最近7天"],
    ["Last 15 days", "最近15天"],
    ["Last 30 days", "最近30天"],
    ["Last 120 days", "最近120天"],
    ["Include Cards", "包含卡牌"],
    ["Exclude Cards", "排除卡牌"],
    ["Any decks", "任意卡组"],
    ["Search Streamer", "搜索主播"],
    ["Name", "名称"],
    ["Start Time", "开始时间"],
    ["Tags", "标签"],
    ["Open", "公开"],
    ["Card Set", "扩展包"],
    ["Any Cost", "任意法力"],
    ["Any Attack", "任意攻击力"],
    ["Any Health", "任意生命值"],
    ["Any Type", "任意类型"],
    ["Any Minion Type", "任意随从类型"],
    ["Any Spell School", "任意法术类型"],
    ["Any Rarity", "任意稀有度"],
    ["Any Faction", "任意阵营"],
    // 卡牌类型
    ["Neutral", "中立"],
    ["Minion", "随从"],
    ["Spell", "法术"],
    ["Weapon", "武器"],
    ["Hero", "英雄"],
    ["Location", "地标"],
    // 随从种族
    ["Beast", "野兽"],
    ["Demon", "恶魔"],
    ["Draenei", "德莱尼"],
    ["Dragon", "龙"],
    ["Elemental", "元素"],
    ["Mech", "机械"],
    ["Murloc", "鱼人"],
    ["Naga", "娜迦"],
    ["Pirate", "海盗"],
    ["Quilboar", "野猪人"],
    ["Totem", "图腾"],
    ["Undead", "亡灵"],
    // 法术类型
    ["Arcane", "奥术"],
    ["Fel", "邪能"],
    ["Fire", "火焰"],
    ["Frost", "冰霜"],
    ["Holy", "神圣"],
    ["Nature", "自然"],
    ["Shadow", "暗影"],
    // 卡牌稀有度
    ["Common", "普通"],
    ["Rare", "稀有"],
    ["Epic", "史诗"],
    ["Legendary", "传说"],
    ["Free", "免费"],
    // 卡牌阵营
    ["Grimy Goons", "污手党"],
    ["Jade Lotus", "玉莲帮"],
    ["Kabal", "暗金教"],
    ["Protoss", "星灵"],
    ["Terran", "人族"],
    ["Zerg", "异虫"],
    //
    ["Mana", "法力"],
    ["Mana in Class", "职业法力"],
    ["Sort", "排序"],
    ["Mode", "模式"],
    ["Language", "语言"],
    ["Newest", "最新"],
    ["Oldest", "最旧"],
    ["Most Viewers", "最多观众"],
    ["Fewest Viewers", "最少观众"],
    ["Well met!", "您好！"],
    ["Contact", "联系"],
    ["Donate/Follow", "捐赠/关注"],
    ["Streamer Instructions", "主播说明"],
    ["2025 Announcement", "2025 公告"],
    ["2026 Announcement", "2026 公告"],
    ["You need to login to use these filters", "您需要登录才能使用这些过滤器"],
    [
      "No decks available for these filters. Maybe try changing one of the highlighted ones?",
      "没有可用的卡组。也许尝试更改高亮的筛选器？",
    ],
    [
      "Sample sizes matter! Even though I'll let you see low sample size stats, don't put too much stock into them",
      "样本数量很重要！虽然我将允许您看到低样本数量的统计信息，但请不要把这些统计信息看的太重要。",
    ],
    [
      "tl;dr: Use mulligan impact for what to keep in the mull, and drawn impact for what to include in your list",
      "总结：使用换牌影响来决定要保留的卡牌，使用抽到影响来决定要包含的卡牌",
    ],
    ["Archetype Card Stats", "卡组类型卡牌统计"],
    ["Nicknames", "昵称"],
    ["Id", "编号"],
    ["Mana Cost", "法力值消耗"],
    ["Attack", "攻击力"],
    ["Health", "生命值"],
    ["Durability", "耐久度"],
    ["Classes", "职业"],
    ["Minion Type", "随从类型"],
    ["Dust Cost", "合成花费"],
    ["Dust Free", "分解获得"],
    ["Spell School", "法术类型"],
    ["Flavor Text", "趣味描述"],
    ["Text", "卡牌描述"],
    ["Help", "帮助"],
    ["Keywords", "关键词"],
    ["Factions", "阵营"],
    ["Collectible", "可收藏"],
    ["Artist Name", "画师"],
    ["Crop Image", "裁剪图片"],
    ["Image", "卡牌图片"],
    ["Image Gold", "金色卡牌图片"],
    ["Battlefy link", "Battlefy 链接"],
    ["Deckcode", "卡组代码"],
    ["Battletags", "战网昵称"],
    [
      "The top players earn points based on how high they finish",
      "顶尖玩家会根据最终排名获得对应积分",
    ],
    ["Wrong region to earn an invite", "赛区错误，无法凭此赛区获得邀请资格"],
    [
      "More is planned! If you have an idea join my discord to share it after checking the pinned post",
      "后续还会继续支持更多内容。如果你有想法，欢迎先查看置顶帖，再加入我的 Discord 进行分享。",
    ],
    [
      "This data uses old archetyping. Archetyping will be updated after there is more data with the latest patch",
      "这些数据使用了旧的卡组类型。卡组类型将在有更多最新补丁数据后更新",
    ],
    // 关键词
    ["Battlecry", "战吼"],
    ["Imbue", "灌注"],
    //版本名
    ["Emerald Dream", "翡翠梦境"],
    ["Showdown in the Badlands", "决战荒芜之地"],
    ["Caverns of Time", "时光之穴"],
    ["TITANS", "泰坦诸神"],
    ["Festival of Legends", "传奇音乐节"],
    ["March of the Lich King", "巫妖王的进军"],
    ["Path of Arthas", "阿尔萨斯之路"],
    ["Murder at Castle Nathria", "纳斯利亚堡的悬案"],
    ["Voyage to the Sunken City", "探寻沉没之城"],
    ["Fractured in Alterac Valley", "奥特兰克的决裂"],
    ["United in Stormwind", "暴风城下的集结"],
    ["Legacy", "怀旧"],
    ["Forged in the Barrens", "贫瘠之地的锤炼"],
    ["Madness at the Darkmoon Faire", "疯狂的暗月马戏团"],
    ["Scholomance Academy", "通灵学园"],
    ["Ashes of Outland", "外域的灰烬"],
    ["Demon Hunter Initiate", "恶魔猎手新兵"],
    ["Galakrond’s Awakening", "迦拉克隆的觉醒"],
    ["Descent of Dragons", "巨龙降临"],
    ["Saviors of Uldum", "奥丹姆奇兵"],
    ["Rise of Shadows", "暗影崛起"],
    ["Rastakhan’s Rumble", "拉斯塔哈的大乱斗"],
    ["The Boomsday Project", "砰砰计划"],
    ["The Witchwood", "女巫森林"],
    ["Kobolds and Catacombs", "狗头人与地下城"],
    ["Knights of the Frozen Throne", "冰封王座的骑士"],
    ["Journey to Un’Goro", "勇闯安戈洛"],
    ["Mean Streets of Gadgetzan", "龙争虎斗加基森"],
    ["One Night in Karazhan", "卡拉赞之夜"],
    ["Whispers of the Old Gods", "上古之神的低语"],
    ["League of Explorers", "探险者协会"],
    ["The Grand Tournament", "冠军的试炼"],
    ["Blackrock Mountain", "黑石山的火焰"],
    ["Goblins vs Gnomes", "地精大战侏儒"],
    ["Curse of Naxxramas", "纳克萨玛斯的诅咒"],
    ["Embers", "余烬"],
    ["The Great Dark Beyond", "深暗领域"],
    ["GDB (Expansion only)", "深暗领域（仅限扩展包）"],
    ["Perils in Paradise", "胜地历险记"],
    ["Whizbang's Workshop", "威兹班的工坊"],
    ["The Lost City of Un'Goro", "安戈洛龟途"],
    ["Into the Emerald Dream", "漫游翡翠梦境"],
    ["Core 2025", "核心 2025"],
    ["Core", "核心"],
    ["Event 2025", "活动 2025"],
    ["Event", "活动"],
    ["Lost City", "失落之城"],
    ["Day of Rebirth", "重生之日"],
  ]);
  const queryCache = {
    cache: /* @__PURE__ */ new WeakMap(),
    maxSize: 1e3,
    rootCacheSizes: /* @__PURE__ */ new Map(),
    lastAccessTime: /* @__PURE__ */ new Map(),
    getOrCreate(selector, root = document) {
      if (!this.cache.has(root)) {
        this.cache.set(root, /* @__PURE__ */ new Map());
        this.rootCacheSizes.set(root, 0);
      }
      const rootCache = this.cache.get(root);
      const size = this.rootCacheSizes.get(root);
      if (!rootCache.has(selector)) {
        if (size >= this.maxSize) {
          let oldestTime = Date.now();
          let oldestSelector = null;
          for (const [key, time] of this.lastAccessTime.entries()) {
            if (time < oldestTime) {
              oldestTime = time;
              oldestSelector = key;
            }
          }
          if (oldestSelector) {
            rootCache.delete(oldestSelector);
            this.lastAccessTime.delete(oldestSelector);
            this.rootCacheSizes.set(root, size - 1);
          }
        }
        rootCache.set(selector, Array.from(root.querySelectorAll(selector)));
        this.rootCacheSizes.set(root, size + 1);
      }
      this.lastAccessTime.set(selector, Date.now());
      return rootCache.get(selector);
    },
    clear() {
      this.cache = /* @__PURE__ */ new WeakMap();
    },
    remove(selector, root = document) {
      if (this.cache.has(root)) {
        const rootCache = this.cache.get(root);
        rootCache.delete(selector);
      }
    },
  };
  const translationCache = {
    cache: /* @__PURE__ */ new Map(),
    maxSize: 2e3,
    size: 0,
    getOrCreate(text, translationFn) {
      if (!text) return text;
      if (!this.cache.has(text)) {
        if (this.size >= this.maxSize) {
          const entriesToDelete = Math.floor(this.maxSize * 0.2);
          const entries = Array.from(this.cache.entries());
          entries.slice(0, entriesToDelete).forEach(([key]) => {
            this.cache.delete(key);
            this.size--;
          });
        }
        const translation = translationFn(text);
        this.cache.set(text, translation);
        this.size++;
      }
      return this.cache.get(text);
    },
    clear() {
      this.cache.clear();
      this.size = 0;
    },
  };
  const cardCache = /* @__PURE__ */ new Map();
  const cardImageCache = /* @__PURE__ */ new Map();
  const CARD_IMAGE_CACHE_PREFIX = "hsguru_card_image_";
  function handleBasic() {
    const selectors = [
      `${SELECTORS.NAV_BASE} > div:nth-child(2) > a`,
      `${SELECTORS.NAV_BASE} > div:nth-child(3) > a`,
      `${SELECTORS.NAV_BASE} > div:nth-child(4) > a`,
      `${SELECTORS.NAV_BASE} > a:nth-child(5)`,
      `${SELECTORS.NAV_BASE} > a:nth-child(6)`,
      `${SELECTORS.NAV_BASE} > div:nth-child(7) > a`,
      `${SELECTORS.NAV_BASE} > div:nth-child(8) > a`,
      "a.navbar-item",
      "a.button",
      "a.tag.column.is-link",
      "a.link",
      "a.twitter-follow-button",
      "button.button",
      "div.subtitle.is-4",
      "div.subtitle.is-5",
      "div.notification",
    ];
    selectors.forEach((selector) => {
      const elements = queryCache.getOrCreate(selector);
      elements.forEach((element) => {
        if (element.matches("a.button") && element.closest(".has-dropdown"))
          return;
        const text = element.textContent.trim();
        const translation = uiTranslations.get(text);
        if (translation) element.textContent = translation;
      });
    });
  }
  const staticPrefix = {
    "Splendiferous Whizbang": "酷炫的威兹班",
    "No Minion": "无随从",
    "End of Turnadin": "回合结束骑",
    "Tick Tock": "提克和托克",
    Harold: "兆示",
    Control: "控制",
    Egglock: "蛋术",
    Merithra: "麦琳瑟拉",
    Egg: "蛋",
    Broxigar: "布洛克加斯",
    Kingslayer: "弑君者",
    Discolock: "弃牌术",
    CtA: "战斗号角",
    Seedlock: "任务术",
    Lynessa: "莱妮莎",
    Boar: "猪猪",
    Plague: "瘟疫",
    Gladiator: "角斗",
    Rafaamlock: "拉法姆术",
    "No Hand": "无牌",
    Burn: "火焰",
    // 种族
    Beast: "野兽",
    Mech: "机械",
    Dragon: "龙",
    Elemental: "元素",
    Demon: "恶魔",
    Draenei: "德莱尼",
    Pirate: "海盗",
    Murloc: "鱼人",
    Undead: "亡灵",
    // 阵营
    Protoss: "星灵",
    Terran: "人族",
    Zerg: "异虫",
    // 机制
    Unholy: "邪恶",
    Blood: "鲜血",
    Frost: "冰",
    Arcane: "奥术",
    Shadow: "暗影",
    Fel: "邪能",
    Taunt: "嘲讽",
    Deathrattle: "亡语",
    Weapon: "武器",
    Secret: "奥秘",
    Location: "地标",
    Spell: "法术",
    Starship: "星舰",
    Enrage: "激怒",
    Copy: "复制",
    Odd: "奇数",
    Even: "偶数",
    Questline: "任务",
    Quest: "任务",
    Discover: "发现",
    Outcast: "流放",
    Aura: "光环",
    Combo: "连击",
    Imbue: "灌注",
    Libram: "圣契",
    Corpse: "残骸",
    Handbuff: "污手",
    HL: "宇宙",
    Highlander: "宇宙",
    XL: "40",
    STD: "标准",
    Other: "其他",
    Aggro: "快攻",
    Armor: "叠甲",
    Bounce: "减费",
    Defense: "防御",
    Damage: "伤害",
    Pain: "自伤",
    Cycle: "过牌",
    Fatigue: "疲劳",
    Mill: "洗牌",
    Thief: "偷窃",
    Miracle: "奇迹",
    Deckless: "无牌",
    Token: "衍生物",
    Topdeck: "顶牌",
    Endseer: "爆牌",
  };
  const classSuffix = {
    Warlock: "术",
    Druid: "德",
    Priest: "牧",
    Rogue: "贼",
    Mage: "法",
    Hunter: "猎",
    Paladin: "骑",
    Shaman: "萨",
    Warrior: "战",
    DH: "瞎",
    DK: "死骑",
  };
  const CUSTOM_TRANSLATIONS_KEY = "hsguru_custom_deck_names";
  const CUSTOM_CARD_TRANSLATIONS_KEY = "hsguru_custom_card_names";
  let customTranslations = null;
  let customCardTranslations = null;
  function loadCustomTranslations() {
    if (customTranslations) return;
    try {
      const saved = localStorage.getItem(CUSTOM_TRANSLATIONS_KEY);
      customTranslations = saved ? JSON.parse(saved) : {};
    } catch (e) {
      customTranslations = {};
    }
  }
  function loadCustomCardTranslations() {
    if (customCardTranslations) return;
    try {
      const saved = localStorage.getItem(CUSTOM_CARD_TRANSLATIONS_KEY);
      customCardTranslations = saved ? JSON.parse(saved) : {};
    } catch (e) {
      customCardTranslations = {};
    }
  }
  function getCustomTranslations() {
    loadCustomTranslations();
    return customTranslations;
  }
  function saveCustomTranslation(original, translation) {
    loadCustomTranslations();
    customTranslations[original] = translation;
    localStorage.setItem(
      CUSTOM_TRANSLATIONS_KEY,
      JSON.stringify(customTranslations),
    );
  }
  function saveCustomTranslations(translations) {
    loadCustomTranslations();
    Object.assign(customTranslations, translations);
    localStorage.setItem(
      CUSTOM_TRANSLATIONS_KEY,
      JSON.stringify(customTranslations),
    );
  }
  function getEffectiveCustomTranslations() {
    loadCustomTranslations();
    return Object.fromEntries(
      Object.entries(customTranslations).filter(
        ([, value]) => typeof value === "string" && value.trim(),
      ),
    );
  }
  function deleteCustomTranslation(original) {
    loadCustomTranslations();
    if (customTranslations.hasOwnProperty(original)) {
      delete customTranslations[original];
      localStorage.setItem(
        CUSTOM_TRANSLATIONS_KEY,
        JSON.stringify(customTranslations),
      );
    }
  }
  function getCustomCardTranslations() {
    loadCustomCardTranslations();
    return customCardTranslations;
  }
  function saveCustomCardTranslation(original, translation) {
    loadCustomCardTranslations();
    customCardTranslations[original] = translation;
    localStorage.setItem(
      CUSTOM_CARD_TRANSLATIONS_KEY,
      JSON.stringify(customCardTranslations),
    );
  }
  function saveCustomCardTranslations(translations) {
    loadCustomCardTranslations();
    Object.assign(customCardTranslations, translations);
    localStorage.setItem(
      CUSTOM_CARD_TRANSLATIONS_KEY,
      JSON.stringify(customCardTranslations),
    );
  }
  function deleteCustomCardTranslation(original) {
    loadCustomCardTranslations();
    if (customCardTranslations.hasOwnProperty(original)) {
      delete customCardTranslations[original];
      localStorage.setItem(
        CUSTOM_CARD_TRANSLATIONS_KEY,
        JSON.stringify(customCardTranslations),
      );
    }
  }
  function addUnmatchedCardName(name) {
    loadCustomCardTranslations();
    if (/[a-zA-Z]/.test(name) && !customCardTranslations.hasOwnProperty(name)) {
      customCardTranslations[name] = "";
      localStorage.setItem(
        CUSTOM_CARD_TRANSLATIONS_KEY,
        JSON.stringify(customCardTranslations),
      );
    }
  }
  function addUnmatchedWord(word) {
    loadCustomTranslations();
    if (
      /[a-zA-Z]/.test(word) &&
      !/[^\x00-\xff]/.test(word) &&
      !customTranslations.hasOwnProperty(word)
    ) {
      customTranslations[word] = "";
      localStorage.setItem(
        CUSTOM_TRANSLATIONS_KEY,
        JSON.stringify(customTranslations),
      );
    }
  }
  function generateAllRuneCombinations() {
    if (!FEATURES.RUNE.enabled) return {};
    const RUNE_TYPES = { B: "blood", F: "frost", U: "unholy" };
    const runeTypes = Object.keys(RUNE_TYPES);
    const combinations = {};
    for (let length = 1; length <= 3; length++) {
      (function generateCombinations(prefix, remainingLength) {
        if (remainingLength === 0) {
          combinations[prefix] = `<span class="rune-container">${prefix
            .split("")
            .map((type) => `<span class="rune-${RUNE_TYPES[type]}"></span>`)
            .join("")}</span>`;
          return;
        }
        for (const runeType of runeTypes) {
          generateCombinations(prefix + runeType, remainingLength - 1);
        }
      })("", length);
    }
    return combinations;
  }
  function getFullPrefixRules() {
    return {
      ...staticPrefix,
      ...generateAllRuneCombinations(),
      ...getEffectiveCustomTranslations(),
    };
  }
  function generateDeckTranslation(englishName) {
    loadCustomTranslations();
    const customTranslation = customTranslations[englishName];
    if (typeof customTranslation === "string" && customTranslation.trim()) {
      return customTranslation.trim();
    }
    const words = englishName.split(" ");
    const result = [...words];
    const processedIndices = /* @__PURE__ */ new Set();
    let classFound = null;
    const lastWord = words[words.length - 1];
    const secondLastWord = words[words.length - 2];
    if (/Demon\s+(Hunter|hunter)/.test(`${secondLastWord} ${lastWord}`)) {
      classFound = "DH";
      result[words.length - 2] = "";
      result[words.length - 1] = classSuffix["DH"];
      processedIndices.add(words.length - 2);
      processedIndices.add(words.length - 1);
    } else if (
      /Death\s+(Knight|knight)/.test(`${secondLastWord} ${lastWord}`)
    ) {
      classFound = "DK";
      result[words.length - 2] = "";
      result[words.length - 1] = classSuffix["DK"];
      processedIndices.add(words.length - 2);
      processedIndices.add(words.length - 1);
    } else if (classSuffix[lastWord]) {
      classFound = lastWord;
      result[words.length - 1] = classSuffix[lastWord];
      processedIndices.add(words.length - 1);
    }
    const prefixRules = getFullPrefixRules();
    const multiByteKeys = Object.keys(prefixRules).filter((key) =>
      key.includes(" "),
    );
    for (const key of multiByteKeys) {
      const keyWords = key.split(" ");
      const matchStart = words.findIndex(
        (word, index) =>
          !processedIndices.has(index) &&
          keyWords.every(
            (keyWord, keyIndex) =>
              !processedIndices.has(index + keyIndex) &&
              words[index + keyIndex] === keyWord,
          ),
      );
      if (matchStart !== -1) {
        result[matchStart] = prefixRules[key];
        for (let i = 0; i < keyWords.length; i++) {
          if (i > 0) result[matchStart + i] = "";
          processedIndices.add(matchStart + i);
        }
      }
    }
    for (let i = 0; i < words.length - (classFound ? 1 : 0); i++) {
      if (!processedIndices.has(i)) {
        const word = words[i];
        const isRune = /^[BFU]{1,3}$/.test(word);
        const ruleValue = prefixRules[word];
        if (ruleValue && (!isRune || FEATURES.RUNE.enabled)) {
          result[i] = ruleValue;
          processedIndices.add(i);
        }
      }
    }
    words.forEach((word, i) => {
      if (!processedIndices.has(i)) {
        const cleanWord = word.replace(/<[^>]+>/g, "").trim();
        if (cleanWord) {
          addUnmatchedWord(cleanWord);
        }
      }
    });
    const filtered = result.filter((word) => word);
    return filtered.reduce((acc, curr, i) => {
      if (i === 0) return curr;
      const prev = filtered[i - 1];
      const needsSpace = /[a-zA-Z0-9]$/.test(prev) && /^[a-zA-Z0-9]/.test(curr);
      return acc + (needsSpace ? " " : "") + curr;
    }, "");
  }
  const pendingFetches = /* @__PURE__ */ new Map();
  const requestQueue = [];
  let activeRequests = 0;
  const MAX_CONCURRENT = 2;
  const REQUEST_DELAY = 500;
  function getCachedCardImage(cardName) {
    if (!cardName) return "";
    if (cardImageCache.has(cardName)) return cardImageCache.get(cardName);
    const cachedImage = localStorage.getItem(`${CARD_IMAGE_CACHE_PREFIX}${cardName}`);
    if (cachedImage) {
      cardImageCache.set(cardName, cachedImage);
      return cachedImage;
    }
    return "";
  }
  function cacheCardImage(cardName, imageUrl) {
    if (!cardName || !imageUrl) return;
    cardImageCache.set(cardName, imageUrl);
    localStorage.setItem(`${CARD_IMAGE_CACHE_PREFIX}${cardName}`, imageUrl);
    if (activeCardPreviewName === cardName) {
      renderChineseCardPreview(imageUrl);
    }
  }
  function processQueue() {
    if (requestQueue.length === 0 || activeRequests >= MAX_CONCURRENT) return;
    const cardName = requestQueue.shift();
    activeRequests++;
    const encodedName = encodeURIComponent(cardName);
    const url = "https://api2.iyingdi.com/hearthstone/card/search/vertical";
    const body = `ignoreHero=1&name=${encodedName}&statistic=total&order=-series%2C%2Bmana&token=&page=0&size=30`;
    GM_xmlhttpRequest({
      method: "POST",
      url,
      headers: {
        accept: "*/*",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        Referer: "https://www.iyingdi.com/",
      },
      data: body,
      onload: function (response) {
        let translation = cardName;
        let imageUrl = "";
        let foundValidTranslation = false;
        if (response.status === 200) {
          try {
            const data = JSON.parse(response.responseText);
            if (data.success && data.data.total > 0) {
              const matchedCard = data.data.cards.find(
                (card) => card.ename === cardName,
              );
              if (matchedCard) {
                translation = matchedCard.cname;
                imageUrl = matchedCard.img || matchedCard.thumbnail || "";
                foundValidTranslation = true;
              }
            }
          } catch (e) {
            console.error("解析卡牌翻译失败", e);
          }
        }
        if (foundValidTranslation) {
          cardCache.set(cardName, translation);
          localStorage.setItem(cardName, translation);
          cacheCardImage(cardName, imageUrl);
        } else {
          addUnmatchedCardName(cardName);
        }
        const elements = pendingFetches.get(cardName) || [];
        elements.forEach((element) =>
          updateCardElement(element, translation, cardName),
        );
        pendingFetches.delete(cardName);
        setTimeout(() => {
          activeRequests--;
          processQueue();
        }, REQUEST_DELAY);
      },
      onerror: function (err) {
        console.error("卡牌翻译请求失败", cardName, err);
        const elements = pendingFetches.get(cardName) || [];
        elements.forEach(
          (element) => (element.dataset.cardTranslated = "true"),
        );
        pendingFetches.delete(cardName);
        setTimeout(() => {
          activeRequests--;
          processQueue();
        }, REQUEST_DELAY);
      },
    });
  }
  function enqueueCardFetch(cardName) {
    if (!requestQueue.includes(cardName)) {
      requestQueue.push(cardName);
    }
    processQueue();
  }
  function updateCardElement(element, translation, originalName) {
    if (originalName) {
      element.dataset.originalCardName = originalName;
    }
    const cardNameNode = Array.from(element.childNodes).find(
      (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim(),
    );
    if (cardNameNode) {
      const fragment = document.createDocumentFragment();
      const textNode = document.createTextNode(`
          ${translation}
        `);
      fragment.appendChild(textNode);
      cardNameNode.parentNode.replaceChild(fragment, cardNameNode);
    }
    element.dataset.cardTranslated = "true";
  }
  function handleCard() {
    const cardNames = document.querySelectorAll(SELECTORS.CARD_NAME);
    const customCardTranslations2 = getCustomCardTranslations();
    cardNames.forEach((element) => {
      if (element.dataset.cardTranslated === "true") return;
      const cardNameNode = Array.from(element.childNodes).find(
        (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim(),
      );
      if (!cardNameNode) return;
      const text = cardNameNode.textContent.trim();
      element.dataset.originalCardName = text;
      if (cardCache.has(text)) {
        updateCardElement(element, cardCache.get(text), text);
        return;
      }
      if (customCardTranslations2[text]) {
        cardCache.set(text, customCardTranslations2[text]);
        updateCardElement(element, customCardTranslations2[text], text);
        return;
      }
      const cachedTranslation = localStorage.getItem(text);
      if (cachedTranslation) {
        cardCache.set(text, cachedTranslation);
        updateCardElement(element, cachedTranslation, text);
        return;
      }
      if (pendingFetches.has(text)) {
        pendingFetches.get(text).push(element);
      } else {
        pendingFetches.set(text, [element]);
        enqueueCardFetch(text);
      }
    });
  }
  function handleCardLinks() {
    document
      .querySelectorAll("div.decklist_card_container > div > a")
      .forEach((link) => link.removeAttribute("href"));
  }
  function handleClipboard() {
    const clipboardButtons = document.querySelectorAll("button.clip-btn-value");
    clipboardButtons.forEach((element) => {
      const originalText = element.getAttribute("data-clipboard-text");
      if (
        originalText &&
        !originalText.startsWith("#") &&
        !originalText.endsWith("#")
      ) {
        const deckTitleElement = element
          .closest(".decklist-info")
          .querySelector("a.basic-black-text");
        const deckTitle = deckTitleElement
          ? deckTitleElement.textContent.trim()
          : "";
        const modifiedText = `###${deckTitle}
#
${originalText}
#`;
        element.setAttribute("data-clipboard-text", modifiedText);
      }
      const iconSpan = element.querySelector("svg.icon");
      if (iconSpan) {
        iconSpan.classList.remove("icon");
        iconSpan.classList.add("clipboard-icon");
      }
      if (element.dataset.hsguruClipboardBound === "true") return;
      element.dataset.hsguruClipboardBound = "true";
      element.setAttribute("aria-label", uiTranslations.get("Copy") || "复制");
      element.addEventListener("click", () => {
        setTimeout(() => {
          showClipboardFeedback(element);
        }, 0);
      });
    });
  }
  function handleDeck() {
    const deckTitleSelector = `${SELECTORS.DECK_TITLE}, ${SELECTORS.DECK_LINK}, ${SELECTORS.BASIC_DECK_TITLE}`;
    const deckTitles = queryCache.getOrCreate(deckTitleSelector);
    deckTitles.forEach((element) => {
      const text = element.textContent.trim();
      const translation = translationCache.getOrCreate(
        text,
        generateDeckTranslation,
      );
      if (translation !== text) {
        const fragment = document.createDocumentFragment();
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = translation;
        while (tempDiv.firstChild) {
          fragment.appendChild(tempDiv.firstChild);
        }
        element.innerHTML = "";
        element.appendChild(fragment);
      }
    });
    const deckCards = new Set([
      ...Array.from(document.querySelectorAll("#deck_stats_viewport .card")),
      ...Array.from(document.querySelectorAll(".card-image .decklist-info"))
        .map((deckInfo) => deckInfo.closest(".card"))
        .filter(Boolean),
    ]);
    deckCards.forEach((card) => {
      card.classList.add("hsguru-deck-card-shell");
      card
        .querySelectorAll(
          ".card-image .decklist-info:not(.dust-bar), .decklist-info:not(.dust-bar)",
        )
        .forEach((deckInfo) => {
          if (!deckInfo.querySelector(".deck-title")) return;
          deckInfo.classList.add("hsguru-deck-summary");
          const row = deckInfo.querySelector(".level.is-mobile");
          if (row) row.classList.add("hsguru-deck-summary-row");
          const title = deckInfo.querySelector(".deck-title");
          if (title) {
            title.classList.add("hsguru-deck-summary-title");
            title
              .querySelectorAll(
                'span[style*="display: block"], span[style*="line-size"]',
              )
              .forEach((span) => {
                span.classList.add("hsguru-hidden-deck-code");
              });
            title
              .querySelectorAll('span[style*="font-size: 0"]')
              .forEach((span) => {
                span.classList.add("hsguru-hidden-deck-code");
              });
          }
          const copyButton = deckInfo.querySelector(".clip-btn-value");
          if (copyButton) copyButton.classList.add("hsguru-deck-icon-button");
          const viewButton = deckInfo.querySelector(
            ".level-right .is-clickable",
          );
          if (viewButton) viewButton.classList.add("hsguru-deck-icon-button");
        });
      card.querySelectorAll(".dust-bar.decklist-info").forEach((dustBar) => {
        dustBar.classList.add("hsguru-deck-dust-bar");
      });
    });
  }
  const BASE_URL = "https://www.hsguru.com/";
  function handleFilter() {
    const selectors = ["a.dropdown-item", ".has-dropdown > a.button"];
    selectors.forEach((selector) => {
      const elements = queryCache.getOrCreate(selector);
      elements.forEach((element) => {
        const text = element.textContent.trim();
        const translation = uiTranslations.get(text);
        if (translation) element.textContent = translation;
      });
    });
    const inputs = queryCache.getOrCreate('input[placeholder="Search"]');
    inputs.forEach((input) => {
      input.setAttribute("placeholder", uiTranslations.get("Search"));
    });
  }
  function handleFilterStyle() {
    const listConfigs = {
      format: ["Standard", "Wild"],
      rank: [
        "Top 100",
        "Top 200",
        "Top 500",
        "Top 1000",
        "Top 5000",
        "Top 1k",
        "Top 5k",
        "Legend",
        "Diamond 4-1",
        "Diamond-Legend",
        "All",
      ],
      class: [
        "Player Class",
        "Any Class",
        "Opponent Class",
        "Death Knight",
        "Demon Hunter",
        "Druid",
        "Hunter",
        "Mage",
        "Paladin",
        "Priest",
        "Rogue",
        "Shaman",
        "Warlock",
        "Warrior",
      ],
      vsClass: [
        "Any Class",
        "Opponent's Class",
        "VS Death Knight",
        "VS Demon Hunter",
        "VS Druid",
        "VS Hunter",
        "VS Mage",
        "VS Paladin",
        "VS Priest",
        "VS Rogue",
        "VS Shaman",
        "VS Warlock",
        "VS Warrior",
      ],
    };
    const applyFilterIcons = (root, lists) => {
      const textToList = /* @__PURE__ */ new Map();
      lists.forEach((list) => {
        list.forEach((text) => {
          textToList.set(text, list);
        });
      });
      const filterNodes = root.querySelectorAll(
        ".has-dropdown > a.button, a.dropdown-item",
      );
      filterNodes.forEach((node) => {
        const text = node.textContent.trim();
        if (textToList.has(text)) {
          node.classList.add("class-icon");
          if (node.matches(".has-dropdown > a.button")) {
            node.classList.add("button-with-icon");
          }
          node.classList.add(
            `class-${text.toLowerCase().replace(/\s+/g, "-")}`,
          );
        }
      });
    };
    const pageHandlers = [
      {
        urlPattern: new RegExp(`^${BASE_URL}decks(\\?|$)`),
        handler: () => {
          const config = {
            targetSelector: "#deck_stats_viewport",
            lists: [listConfigs.format, listConfigs.rank, listConfigs.class],
          };
          createFilterContainer(config);
        },
      },
      {
        urlPattern: new RegExp(`^${BASE_URL}deck/(\\d+|[A-Za-z0-9+/=%]+)(?:\\?.*)?$`),
        handler: () => {
          const config = {
            targetSelector: ".table.is-fullwidth.is-striped",
            lists: [listConfigs.rank],
          };
          createFilterContainer(config);
        },
      },
      {
        urlPattern: new RegExp(`^${BASE_URL}meta(\\?|$)`),
        handler: () => {
          const table = document.querySelector(
            "table.table.is-fullwidth.is-striped.is-narrow",
          );
          if (table) {
            const parentDiv = table.parentNode;
            if (parentDiv) {
              const config = {
                targetSelector: parentDiv,
                lists: [
                  listConfigs.format,
                  listConfigs.rank,
                  listConfigs.vsClass,
                ],
              };
              createFilterContainer(config);
            }
          }
        },
      },
      {
        urlPattern: new RegExp(`^${BASE_URL}matchups(\\?|$)`),
        handler: () => {
          const config = {
            targetSelector: "#matchups_table_wrapper",
            lists: [listConfigs.rank],
          };
          createFilterContainer(config);
        },
      },
      {
        urlPattern: new RegExp(`^${BASE_URL}archetype/[^/]+$`),
        handler: () => {
          const config = {
            targetSelector: ".table.is-fullwidth.is-striped",
            lists: [listConfigs.format, listConfigs.rank],
          };
          createFilterContainer(config);
        },
      },
      {
        urlPattern: new RegExp(`^${BASE_URL}card-stats\\?archetype=`),
        handler: () => {
          const config = {
            targetSelector: ".table.is-fullwidth.is-striped.is-gapless",
            lists: [listConfigs.format, listConfigs.rank, listConfigs.vsClass],
          };
          createFilterContainer(config);
        },
      },
      {
        urlPattern: new RegExp(`^${BASE_URL}card-stats\\?deck_id=\\d+`),
        handler: () => {
          const config = {
            targetSelector: ".table.is-fullwidth.is-striped.is-gapless",
            lists: [listConfigs.format, listConfigs.rank, listConfigs.vsClass],
          };
          createFilterContainer(config);
        },
      },
      {
        urlPattern: new RegExp(`^${BASE_URL}streamer-decks(\\?|$)`),
        handler: () => {
          const toolbar = document.querySelector(".columns.is-pulled-left");
          if (!toolbar) return;
          toolbar.classList.add("filters-container", "hsguru-streamer-filters");
          toolbar.classList.remove("is-pulled-left");
          applyFilterIcons(toolbar, [
            listConfigs.format,
            listConfigs.rank,
            listConfigs.class,
          ]);
        },
      },
      {
        urlPattern: new RegExp(`^${BASE_URL}leaderboard(?:[/?].*)?$`),
        handler: () => {
          const toolbars = new Set();
          document
            .querySelectorAll(".level.level-left")
            .forEach((toolbar) => {
              if (
                toolbar.querySelector(".dropdown") &&
                toolbar.querySelector('a.button, span.button, button.button')
              ) {
                toolbars.add(toolbar);
              }
            });
          document
            .querySelectorAll("form[action^='/leaderboard']")
            .forEach((form) => {
              if (form.querySelector(".dropdown")) {
                toolbars.add(form);
              }
            });
          toolbars.forEach((toolbar) => {
            if (toolbar.dataset.hsguruLeaderboardFiltersStyled === "true") {
              return;
            }
            toolbar.dataset.hsguruLeaderboardFiltersStyled = "true";
            toolbar.classList.add("filters-container", "hsguru-leaderboard-filters");
            if (toolbar.tagName === "FORM") {
              toolbar
                .querySelectorAll("span.button.is-link, a.button.is-link")
                .forEach((button) => {
                  button.classList.add("hsguru-leaderboard-nav-button");
                });
            } else {
              toolbar
                .querySelectorAll(":scope > form.filters-container")
                .forEach((form) => {
                  form.classList.remove(
                    "filters-container",
                    "hsguru-leaderboard-filters",
                  );
                  delete form.dataset.hsguruLeaderboardFiltersStyled;
                });
              toolbar
                .querySelectorAll(":scope > span.button, :scope > a.button.is-link")
                .forEach((button) => {
                  button.classList.add("hsguru-leaderboard-nav-button");
                });
              toolbar.querySelectorAll(':scope > form[action^="/leaderboard"]').forEach(
                (form) => {
                  form.classList.add("hsguru-leaderboard-search-form");
                  const input = form.querySelector("input.input, input[type='search']");
                  if (input) {
                    input.classList.add("hsguru-leaderboard-search-input");
                    if (!input.getAttribute("placeholder")) {
                      input.setAttribute("placeholder", uiTranslations.get("Search"));
                    }
                  }
                  form.querySelectorAll("a.button.is-link, span.button.is-link").forEach((btn) => {
                    btn.classList.add("hsguru-leaderboard-nav-button");
                  });
                },
              );
            }
          });
          createLeaderboardFilterContainer();
        },
      },
    ];
    for (const pageHandler of pageHandlers) {
      if (window.location.href.match(pageHandler.urlPattern)) {
        pageHandler.handler();
      }
    }
    function createFilterContainer({ targetSelector, lists }) {
      let targetElement;
      if (typeof targetSelector === "string") {
        targetElement = document.querySelector(targetSelector);
      } else {
        targetElement = targetSelector;
      }
      if (!targetElement) return;
      const siblings = Array.from(targetElement.parentNode.children).filter(
        (node) => node !== targetElement,
      );
      const existingContainer = siblings.find(
        (node) => node.className === "filters-container",
      );
      if (existingContainer) return;
      const container = document.createElement("div");
      container.className = "filters-container";
      const spans = siblings.filter((node) => node.tagName === "SPAN");
      const textToList = /* @__PURE__ */ new Map();
      lists.forEach((list) => {
        list.forEach((text) => {
          textToList.set(text, list);
        });
      });
      spans.forEach((span) => {
        const button = span.querySelector("a.button");
        if (button) {
          const text = button.textContent.trim();
          if (textToList.has(text)) {
            button.classList.add("class-icon", "button-with-icon");
            button.classList.add(
              `class-${text.toLowerCase().replace(/\s+/g, "-")}`,
            );
          }
        }
        const dropdownItems = Array.from(
          span.querySelectorAll("a.dropdown-item"),
        );
        dropdownItems.forEach((item) => {
          const text = item.textContent.trim();
          if (textToList.has(text)) {
            item.classList.add("class-icon");
            item.classList.add(
              `class-${text.toLowerCase().replace(/\s+/g, "-")}`,
            );
          }
        });
        span.remove();
        container.appendChild(span);
      });
      siblings.forEach((node) => {
        if (node.tagName !== "SPAN" || !spans.includes(node)) {
          node.remove();
        }
      });
      targetElement.parentNode.insertBefore(container, targetElement);
    }
    function createLeaderboardFilterContainer() {
      const anchor = document.querySelector(
        ".svg-container, table.table.is-fullwidth, table.table.is-striped.is-fullwidth.is-narrow",
      );
      if (!anchor || !anchor.parentElement) return;
      const parent = anchor.parentElement;
      if (parent.querySelector(":scope > .filters-container.hsguru-leaderboard-filters")) {
        return;
      }
      const siblings = Array.from(parent.children);
      const anchorIndex = siblings.indexOf(anchor);
      if (anchorIndex <= 0) return;
      const controls = [];
      for (let i = anchorIndex - 1; i >= 0; i -= 1) {
        const node = siblings[i];
        if (!(node instanceof HTMLElement)) continue;
        if (
          node.matches(
            ".has-dropdown.dropdown, form[action^='/leaderboard'], a.button.is-link, span.button.is-link, .button.is-link, input.input, input[type='number'], input[type='search'], select",
          )
        ) {
          controls.unshift(node);
          continue;
        }
        if (
          controls.length === 0 &&
          (node.tagName === "BR" ||
            node.id === "nitropay-below-title-leaderboard" ||
            node.classList.contains("title") ||
            node.classList.contains("alert"))
        ) {
          continue;
        }
        break;
      }
      if (controls.length === 0) return;
      const container = document.createElement("div");
      container.className = "filters-container hsguru-leaderboard-filters";
      container.dataset.hsguruLeaderboardFiltersStyled = "true";
      controls.forEach((node) => {
        if (
          node.matches("a.button.is-link, span.button.is-link, .button.is-link")
        ) {
          node.classList.add("hsguru-leaderboard-nav-button");
        }
        if (
          node.matches(
            "input.input, input[type='number'], input[type='search'], select",
          )
        ) {
          node.classList.add("hsguru-leaderboard-inline-input");
        }
        if (node.matches("form[action^='/leaderboard']")) {
          const visibleInputs = Array.from(
            node.querySelectorAll("input.input, input[type='number'], input[type='search'], select"),
          ).filter((input) => input.type !== "hidden" && !input.classList.contains("is-hidden"));
          const searchInput = visibleInputs.find(
            (input) => input.matches("input[type='search']") || input.type === "text",
          );
          if (searchInput) {
            node.classList.add("hsguru-leaderboard-search-form");
            searchInput.classList.add("hsguru-leaderboard-search-input");
            if (!searchInput.getAttribute("placeholder")) {
              searchInput.setAttribute("placeholder", uiTranslations.get("Search"));
            }
            // 为 form 内部的前进/后退导航按钮添加美化类
            node.querySelectorAll("a.button.is-link, span.button.is-link").forEach((btn) => {
              btn.classList.add("hsguru-leaderboard-nav-button");
            });
          } else if (visibleInputs.length > 0) {
            node.classList.add("hsguru-leaderboard-inline-form");
            Array.from(node.children).forEach((child) => {
              if (!(child instanceof HTMLElement)) return;
              if (
                child.classList.contains("is-pulled-right") &&
                child.querySelector("input.input, input[type='number'], input[type='search'], select")
              ) {
                child.classList.add("hsguru-leaderboard-inline-field");
              }
            });
            visibleInputs.forEach((input) => {
              input.classList.add("hsguru-leaderboard-inline-input");
            });
          }
        }
        container.appendChild(node);
      });
      parent.insertBefore(container, anchor);
    }
  }
  function handleMana() {
    const manaElements = Array.from(
      document.querySelectorAll(SELECTORS.MANA_CRYSTAL),
    );
    manaElements.forEach((element) => {
      if (element.classList.contains("converted-crystal")) return;
      const manaValue = element.textContent.trim();
      const crystalDiv = document.createElement("div");
      crystalDiv.className = "icon-crystal";
      const textP = document.createElement("p");
      textP.textContent = manaValue;
      crystalDiv.appendChild(textP);
      element.textContent = "";
      element.appendChild(crystalDiv);
      element.classList.add("converted-crystal");
      element.style.paddingRight = "0.5ch";
    });
  }
  function handleSearch() {
    const searchBoxes = Array.from(
      document.querySelectorAll(
        'input[name="search"][placeholder="Type or paste"]',
      ),
    );
    searchBoxes.forEach((element) => {
      if (
        (element == null ? void 0 : element.placeholder) === "Type or paste"
      ) {
        element.placeholder = uiTranslations.get("Type or paste");
      }
    });
    const genericSearchBoxes = Array.from(
      document.querySelectorAll('input[placeholder="Search"]'),
    );
    genericSearchBoxes.forEach((element) => {
      element.placeholder = uiTranslations.get("Search");
    });
    const searchHelpButtons = Array.from(
      document.querySelectorAll(
        'button[phx-click*="show_modal"], button[title], button[aria-label]',
      ),
    );
    searchHelpButtons.forEach((button) => {
      const searchWrapper = button.closest(".level.is-mobile");
      if (!searchWrapper || !searchWrapper.querySelector('input[name="search"]')) {
        return;
      }
      ["title", "aria-label"].forEach((attribute) => {
        const value = button.getAttribute(attribute);
        if (!value) return;
        const translation = uiTranslations.get(value.trim());
        if (translation) {
          button.setAttribute(attribute, translation);
        }
      });
    });
    document
      .querySelectorAll('[role="dialog"], .modal, .ReactModal__Content')
      .forEach((dialog) => {
        translateExactTextNodes(dialog);
        translateTranslatableAttributes(dialog);
      });
    document
      .querySelectorAll(
        'input[name="search"]',
      )
      .forEach((searchInput) => {
        const scope = searchInput.closest("#feed_container") || searchInput.closest("[id]") || searchInput.closest("div");
        if (!scope) return;
        translateExactTextNodes(scope);
        scope.querySelectorAll(".dropdown .dropdown-item a").forEach((link) => {
          const text = link.textContent.trim();
          const translation = uiTranslations.get(text);
          if (translation) link.textContent = translation;
        });
      });
  }
  function translateExactTextNodes(root) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.parentElement) return NodeFilter.FILTER_REJECT;
        if (["SCRIPT", "STYLE"].includes(node.parentElement.tagName)) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    let node;
    while ((node = walker.nextNode())) {
      const rawText = node.nodeValue;
      const trimmedText = rawText.trim();
      if (!trimmedText) continue;
      const translation = uiTranslations.get(trimmedText);
      if (!translation || translation === trimmedText) continue;
      const leading = rawText.match(/^\s*/)?.[0] || "";
      const trailing = rawText.match(/\s*$/)?.[0] || "";
      node.nodeValue = `${leading}${translation}${trailing}`;
    }
  }
  function translateTranslatableAttributes(root) {
    if (!root) return;
    const attributeSelectors = [
      ["[placeholder]", "placeholder"],
      ["[title]", "title"],
      ["[aria-label]", "aria-label"],
      ["[data-aria-on-copy]", "data-aria-on-copy"],
    ];
    attributeSelectors.forEach(([selector, attribute]) => {
      root.querySelectorAll(selector).forEach((element) => {
        const value = element.getAttribute(attribute);
        if (!value) return;
        const translation = uiTranslations.get(value.trim());
        if (translation) {
          element.setAttribute(attribute, translation);
        }
      });
    });
  }
  function replaceSubtitle(element, subtitleHTML) {
    const titleElement = document.querySelector("div.title.is-2");
    if (!titleElement) return;
    const newSubtitleElement = document.createElement("div");
    newSubtitleElement.className = "new_subtitle";
    newSubtitleElement.innerHTML = subtitleHTML;
    titleElement.insertAdjacentElement("afterend", newSubtitleElement);
    element.remove();
  }
  function extractRelativeTimeText(sourceElement) {
    if (!sourceElement) return "";
    const timeMatch = sourceElement.textContent
      .trim()
      .match(/(\d+)\s*(hours?|minutes?|days?)\s*ago/);
    if (!timeMatch) return "";
    const [, number, unit] = timeMatch;
    return `| ${number} ${uiTranslations.get(unit + " ago")} `;
  }
  function extractGamesText(element) {
    const gamesSpan = element.querySelector("span span");
    if (!gamesSpan) return "";
    const gamesMatch = gamesSpan.textContent.trim().match(/Games: (\d+)/);
    return gamesMatch ? `| 对局：${gamesMatch[1]} ` : "";
  }
  function translateNodeText(node) {
    const text = node.textContent.trim();
    const translation = uiTranslations.get(text);
    if (translation) {
      node.textContent = translation;
      return true;
    }
    return false;
  }
  function translateSelectorText(root, selector) {
    root.querySelectorAll(selector).forEach((node) => {
      translateNodeText(node);
    });
  }
  function translateTableHeaders(table, selector = "thead th") {
    translateSelectorText(table, selector);
  }
  function translateLeaderboardPoints(table) {
    table.querySelectorAll("tbody td .tag").forEach((tag) => {
      const text = tag.textContent.trim();
      const ptsMatch = text.match(/^(\d+)\s*pts$/i);
      if (ptsMatch) {
        tag.textContent = `${ptsMatch[1]}积分`;
      } else {
        const translation = uiTranslations.get(text);
        if (translation) {
          tag.textContent = translation;
        }
      }
      const label = tag.getAttribute("aria-label");
      if (label) {
        const translation = uiTranslations.get(label.trim());
        if (translation) {
          tag.setAttribute("aria-label", translation);
        }
      }
    });
  }
  function translateClassNameCells(table) {
    translateSelectorText(table, "td .tag.player-name .basic-black-text");
  }
  function translateTrailingTotalRow(table) {
    const totalRow = table.querySelector("tbody tr:last-child td:first-child");
    if ((totalRow == null ? void 0 : totalRow.textContent.trim()) === "Total") {
      totalRow.textContent = uiTranslations.get("Total");
    }
  }
  function showClipboardFeedback(button) {
    let toast = document.getElementById("hsguru-copy-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "hsguru-copy-toast";
      toast.className = "hsguru-copy-toast";
      document.body.appendChild(toast);
    }
    toast.textContent = "卡组代码已复制";
    toast.classList.add("is-visible");
    clearTimeout(showClipboardFeedback.toastTimer);
    showClipboardFeedback.toastTimer = setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 1400);
    button.classList.add("hsguru-copy-success");
    button.setAttribute("aria-label", "卡组代码已复制");
    clearTimeout(button._hsguruCopyTimer);
    button._hsguruCopyTimer = setTimeout(() => {
      button.classList.remove("hsguru-copy-success");
      button.setAttribute("aria-label", uiTranslations.get("Copy") || "复制");
    }, 1400);
  }
  function translateSortedTextNode(node) {
    const text = node.textContent.trim();
    const arrow = text.match(/[↑↓]$/)?.[0] || "";
    const cleanText = text.replace(/[↑↓]$/, "").trim();
    const translation = uiTranslations.get(cleanText);
    if (!translation) return false;
    node.textContent = `${translation}${arrow}`;
    return true;
  }
  function translateDeckNameInNode(node) {
    const originalText = node.textContent.trim();
    const translatedText = generateDeckTranslation(originalText);
    if (translatedText && translatedText !== originalText) {
      node.textContent = translatedText;
      return true;
    }
    return false;
  }
  function translateDeckNameCell(cell) {
    const link = cell.querySelector("a");
    if (link) {
      translateDeckNameInNode(link);
      return;
    }
    translateDeckNameInNode(cell);
  }
  function applyClassAccentStyles(element) {
    const accent = getMappedClassValue(
      element,
      CLASS_ACCENT_COLORS,
      DEFAULT_CLASS_ACCENT,
    );
    const bg = getMappedClassValue(element, CLASS_BG_COLORS, DEFAULT_CLASS_BG);
    element.style.setProperty("--hsguru-class-accent", accent);
    element.style.setProperty("background", bg, "important");
    element.style.setProperty("border-left", `5px solid ${accent}`, "important");
  }
  function replaceDeckNameTextNode(cell) {
    const originalText =
      Array.from(cell.childNodes)
        .filter((node) => node.nodeType === Node.TEXT_NODE)
        .map((node) => node.textContent)
        .join(" ")
        .trim() || cell.textContent.trim();
    const translatedText = generateDeckTranslation(originalText);
    if (!translatedText || translatedText === originalText) return;
    const textNode = Array.from(cell.childNodes).find(
      (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim(),
    );
    if (textNode) {
      textNode.textContent = ` ${translatedText}`;
    } else {
      cell.appendChild(document.createTextNode(` ${translatedText}`));
    }
  }
  function handleSub() {
    const subtitleElement = document.querySelector(
      "div.subtitle.is-6, div.subtitle.is-5",
    );
    if (!subtitleElement) return;
    let timeText = "";
    const pageHandlers = {
      decks: {
        pattern: new RegExp(`^${BASE_URL}decks(\\?|$)`),
        handler: (element) => {
          const timeSpan = Array.from(element.querySelectorAll("span")).find(
            (span) => span.textContent.includes("ago"),
          );
          timeText = extractRelativeTimeText(timeSpan);
          const subtitleHTML = `<a href="/stats/explanation">数据说明</a>${timeText}|要做出贡献，请使用 <a href="https://www.firestoneapp.com/" target="_blank">火石</a> 或 <a target="_blank" href="/hdt-plugin">HDT 插件</a>`;
          replaceSubtitle(element, subtitleHTML);
        },
      },
      meta: {
        pattern: new RegExp(`^${BASE_URL}meta(\\?|$)`),
        handler: (element) => {
          const timeSpan = Array.from(element.querySelectorAll("span")).find(
            (span) => span.textContent.includes("ago"),
          );
          timeText = extractRelativeTimeText(timeSpan);
          const subtitleHTML = `要做出贡献，请使用 <a href="https://www.firestoneapp.com/" target="_blank">火石</a> 或 <a target="_blank" href="/hdt-plugin">HDT 插件</a>${timeText}`;
          replaceSubtitle(element, subtitleHTML);
        },
      },
      matchups: {
        pattern: new RegExp(`^${BASE_URL}matchups(\\?|$)`),
        handler: (element) => {
          const subtitleHTML = `要做出贡献，请使用 <a href="https://www.firestoneapp.com/" target="_blank">火石</a> 或 <a target="_blank" href="/hdt-plugin">HDT 插件</a>`;
          replaceSubtitle(element, subtitleHTML);
        },
      },
      deck: {
        pattern: new RegExp(`^${BASE_URL}deck/(\\d+|[A-Za-z0-9+/=%]+)(?:\\?.*)?$`),
        handler: (element) => {
          var _a, _b, _c, _d, _e;
          const timeSpan = element.querySelector('span[phx-update="ignore"]');
          timeText = extractRelativeTimeText(timeSpan);
          const subtitleHTML = `
          <a href="${((_a = element.querySelector('a[href*="/deckbuilder"]')) == null ? void 0 : _a.href) || "#"}">编辑</a> |
          <a href="${((_b = element.querySelector('a[href*="/card-stats"]')) == null ? void 0 : _b.href) || "#"}">卡牌统计(调度)</a> |
          <a href="${((_c = element.querySelector('a[href*="/archetype/"]')) == null ? void 0 : _c.href) || "#"}">卡组类型统计</a> |
          <a href="${((_d = element.querySelector('a[href*="/replays?has_replay_url=true"]')) == null ? void 0 : _d.href) || "#"}">回放</a> |
          <a href="${((_e = element.querySelector('a[href*="/replays?archetype="]')) == null ? void 0 : _e.href) || "#"}">卡组类型回放</a>
          ${timeText}
        `;
          replaceSubtitle(element, subtitleHTML);
        },
      },
      cardStatsDeck: {
        pattern: new RegExp(`^${BASE_URL}card-stats\\?deck_id=\\d+`),
        handler: (element) => {
          var _a, _b;
          const timeSpan = element.querySelector('span[phx-update="ignore"]');
          timeText = extractRelativeTimeText(timeSpan);
          const gamesText = extractGamesText(element);
          const subtitleHTML = `
          <a href="${((_a = element.querySelector('a[href*="/deck/"]')) == null ? void 0 : _a.href) || "#"}">卡组统计</a> |
          <a href="${((_b = element.querySelector('a[href*="/card-stats?archetype="]')) == null ? void 0 : _b.href) || "#"}">卡组类型卡牌统计</a> |
          <a href="/stats/explanation">数据说明</a> | 要做出贡献，请使用
          <a href="https://www.firestoneapp.com/" target="_blank">Firestone</a>
          ${timeText}${gamesText}
        `;
          replaceSubtitle(element, subtitleHTML);
        },
      },
      cardStatsArchetype: {
        pattern: new RegExp(`^${BASE_URL}card-stats\\?archetype=`),
        handler: (element) => {
          var _a, _b;
          const timeSpan = element.querySelector('span[phx-update="ignore"]');
          timeText = extractRelativeTimeText(timeSpan);
          const gamesText = extractGamesText(element);
          const subtitleHTML = `
          <a href="${((_a = element.querySelector('a[href*="/card-stats?"]')) == null ? void 0 : _a.href) || "#"}">卡组卡牌统计</a> |
          <a href="${((_b = element.querySelector('a[href*="/archetype/"]')) == null ? void 0 : _b.href) || "#"}">卡组类型统计</a> |
          <a href="/stats/explanation">数据说明</a> | 要做出贡献，请使用
          <a href="https://www.firestoneapp.com/" target="_blank">Firestone</a>
          ${timeText}${gamesText}
        `;
          replaceSubtitle(element, subtitleHTML);
        },
      },
      archetype: {
        pattern: new RegExp(`^${BASE_URL}archetype/[^/]+$`),
        handler: (element) => {
          var _a, _b, _c;
          const timeSpan = element.querySelector('span[phx-update="ignore"]');
          timeText = extractRelativeTimeText(timeSpan);
          const subtitleHTML = `
          <a href="${((_a = element.querySelector('a[href*="/card-stats?archetype="]')) == null ? void 0 : _a.href) || "#"}">卡牌统计</a> |
          <a href="${((_b = element.querySelector('a[href*="/decks?"]')) == null ? void 0 : _b.href) || "#"}">卡组</a> |
          <a href="${((_c = element.querySelector('a[href*="/replays?"]')) == null ? void 0 : _c.href) || "#"}">回放统计</a>
          ${timeText}
        `;
          replaceSubtitle(element, subtitleHTML);
        },
      },
      replays: {
        pattern: new RegExp(`^${BASE_URL}replays(\\?|$)`),
        handler: (element) => {
          const subtitleHTML = `
          要做出贡献，<span class="is-hidden-mobile">请使用 <a href="https://www.firestoneapp.com/" target="_blank">Firestone</a> 或
          <a target="_blank" href="/hdt-plugin">HDT 插件</a>并</span>
          <a href="/profile/settings">公开你的回放</a>
        `;
          replaceSubtitle(element, subtitleHTML);
        },
      },
      leaderboardPoints: {
        pattern: new RegExp(`^${BASE_URL}leaderboard/points`),
        handler: (element) => {
          const announcementLink = element.querySelector('a[href*="hearthstone.blizzard.com"]');
          const href = announcementLink ? announcementLink.href : "#";
          const subtitleHTML = `<a href="${href}" target="_blank">2026 公告<span class="icon is-small">
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon w-6 h-6">
    <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"></path>
  </svg>
</span></a>`;
          replaceSubtitle(element, subtitleHTML);
        },
      },
      leaderboard: {
        pattern: new RegExp(`^${BASE_URL}leaderboard(\\?|$)`),
        handler: (element) => {
          var _a, _b, _c, _d, _e;
          const subtitleHTML = `
          <a target="_blank" href="/leaderboard/player-stats">统计</a> |
          <a target="_blank" href="${((_a = element.querySelector('a[href*="hearthstone.blizzard.com"]')) == null ? void 0 : _a.href) || "#"}">官方网站</a> |
          更新于 <time class="datetime-human" phx-hook="LocalDateTime"
              datetime="${((_b = element.querySelector("time")) == null ? void 0 : _b.getAttribute("datetime")) || ""}"
              id="${((_c = element.querySelector("time")) == null ? void 0 : _c.id) || ""}"
               aria-label="${((_d = element.querySelector("time")) == null ? void 0 : _d.getAttribute("aria-label")) || ""}">
               ${((_e = element.querySelector("time")) == null ? void 0 : _e.textContent) || ""}
           </time>
        `;
          replaceSubtitle(element, subtitleHTML);
        },
      },
      streamerDecks: {
        pattern: new RegExp(`^${BASE_URL}streamer-decks$`),
        handler: (element) => {
          const subtitleHTML = `
          <p>
            <a href="/streamer-instructions">主播说明</a>
          </p>
        `;
          replaceSubtitle(element, subtitleHTML);
        },
      },
      esports: {
        pattern: new RegExp(`^${BASE_URL}esports$`),
        handler: (element) => {
          const subtitleHTML = `
          <a href="/mt/tour-stops">巡回赛站点</a> |
          <a href="/legacy-hsesports">传统电竞赛事</a>
          <span>| 此页面正在建设中，如果你有想法请 <a href="/discord">告诉我们</a></span>
        `;
          replaceSubtitle(element, subtitleHTML);
        },
      },
      streamingNow: {
        pattern: new RegExp(`^${BASE_URL}streaming-now$`),
        handler: (element) => {
          const subtitleHTML = `<a href="/streamer-instructions">主播说明</a>`;
          replaceSubtitle(element, subtitleHTML);
        },
      },
      hdtPlugin: {
        pattern: new RegExp(`^${BASE_URL}hdt-plugin$`),
        handler: (element) => {
          const subtitleHTML = `
          不仅仅用于<a target="_blank" href="/streamer-decks">主播卡组</a>。
          为<a target="_blank" href="/decks">卡组</a>做贡献，
          分享并享受你的<a target="_blank" href="/my-decks">卡组</a>和
          <a target="_blank" href="/my-replays">回放</a>
          （<a href="https://www.firestoneapp.com/" target="_blank">Firestone</a>用户也可使用这些功能）
        `;
          replaceSubtitle(element, subtitleHTML);
        },
      },
    };
    const currentUrl = window.location.href;
    for (const [_, config] of Object.entries(pageHandlers)) {
      if (currentUrl.match(config.pattern)) {
        config.handler(subtitleElement);
        break;
      }
    }
  }
  const cardTranslations = /* @__PURE__ */ new Map();
  function handleTable() {
    const tableConfigs = {
      card: {
        pattern: /^card\/\d+$/,
        handler: (table) => {
          const firstColumnCells = table.querySelectorAll(
            "tbody tr td:first-child",
          );
          firstColumnCells.forEach((cell) => {
            const text = cell.textContent.trim();
            if (uiTranslations.get(text)) {
              cell.textContent = uiTranslations.get(text);
            }
          });
          const rows = table.querySelectorAll("tbody tr");
          rows.forEach((row, index) => {
            const secondCell = row.querySelector("td:nth-child(2)");
            if (!secondCell) return;
            const text = secondCell.textContent.trim();
            if (index === 0) {
              const translation = translationCache.getOrCreate(
                text,
                (t) => cardTranslations.get(t) || t,
              );
              if (translation !== text) {
                secondCell.textContent = translation;
              }
            } else if ([2, 8, 10, 12, 18].includes(index)) {
              if (uiTranslations.get(text)) {
                secondCell.textContent = uiTranslations.get(text);
              }
            }
          });
        },
      },
      deck: {
        pattern: /^deck\/(\d+|[A-Za-z0-9+/=%]+)$/,
        handler: (table) => {
          translateTableHeaders(table);
          translateClassNameCells(table);
          translateTrailingTotalRow(table);
        },
      },
      meta: {
        pattern: /^meta$/,
        handler: (table) => {
          table.classList.add("hsguru-meta-table");
          const headers = table.querySelectorAll("thead th");
          headers.forEach((header) => {
            const link = header.querySelector("a");
            if (link) {
              translateSortedTextNode(link);
            } else {
              translateNodeText(header);
            }
          });
          const rows = table.querySelectorAll("tbody tr");
          rows.forEach((row) => {
            const archetypeCell = row.querySelector(
              "td:first-child.decklist-info",
            );
            if (archetypeCell) {
              archetypeCell.classList.add("hsguru-meta-archetype-cell");
              translateDeckNameCell(archetypeCell);
            }
            const climbingSpeedCell = row.querySelector("td:last-child");
            if (climbingSpeedCell) {
              const text = climbingSpeedCell.textContent.trim();
              if (text.includes("⭐/h")) {
                climbingSpeedCell.textContent = text.replace("/h", "/小时");
              }
            }
          });
        },
      },
      "card-stats": {
        pattern: /^card-stats/,
        handler: (table) => {
          const headers = table.querySelectorAll("thead th a");
          headers.forEach((header) => {
            var _a, _b;
            const tooltipSpan = header.querySelector("span[data-balloon-pos]");
            if (tooltipSpan) {
              const text = tooltipSpan.textContent.trim();
              const impacts = [
                "Mulligan Impact",
                "Drawn Impact",
                "Not Drawn Impact",
                "Kept Impact",
              ];
              for (const impact of impacts) {
                if (text.startsWith(impact)) {
                  const arrow =
                    ((_a = text.match(/[↑↓]$/)) == null ? void 0 : _a[0]) || "";
                  tooltipSpan.textContent = `${uiTranslations.get(impact)}${arrow}`;
                  tooltipSpan.setAttribute(
                    "aria-label",
                    uiTranslations.get(`${impact} Tooltip`),
                  );
                  break;
                }
              }
            } else {
              const text = header.textContent.trim();
              const counts = [
                "Card",
                "Mulligan Count",
                "Drawn Count",
                "Not Drawn Count",
                "Kept Count",
              ];
              for (const count of counts) {
                if (text.startsWith(count)) {
                  const arrow =
                    ((_b = text.match(/[↑↓]$/)) == null ? void 0 : _b[0]) || "";
                  header.textContent = `${uiTranslations.get(count)}${arrow}`;
                  break;
                }
              }
            }
          });
        },
      },
      archetype: {
        pattern: /^archetype\/[^/]+$/,
        handler: (table) => {
          translateTableHeaders(table);
          translateClassNameCells(table);
          translateTrailingTotalRow(table);
        },
      },
      replays: {
        pattern: /^replays/,
        handler: (table) => {
          translateTableHeaders(table);
          const gameModes = table.querySelectorAll("td p.tag");
          gameModes.forEach((mode) => {
            translateNodeText(mode);
          });
          const replayLinks = table.querySelectorAll("td a");
          replayLinks.forEach((link) => {
            const text = link.textContent.trim();
            if (text === "View Replay") {
              link.textContent = uiTranslations.get(text);
            }
          });
          const timeCells = table.querySelectorAll("td:last-child");
          timeCells.forEach((cell) => {
            const text = cell.textContent.trim();
            const timeMatch = text.match(
              /(\d+) (hour|hours|minute|minutes) ago/,
            );
            if (timeMatch) {
              const [_, number, unit] = timeMatch;
              cell.textContent = `${number} ${uiTranslations.get(unit + " ago")}`;
            }
          });
        },
      },
      "leaderboard-player-stats": {
        pattern: /^leaderboard\/player-stats/,
        handler: (table) => {
          const headers = table.querySelectorAll("thead th a.is-text");
          headers.forEach((header) => {
            translateSortedTextNode(header);
          });
        },
      },
      "leaderboard-points": {
        pattern: /^leaderboard\/points/,
        handler: (table) => {
          translateTableHeaders(table);
          translateLeaderboardPoints(table);
        },
      },
      leaderboard: {
        pattern: /^leaderboard(?:\/|$)/,
        handler: (table) => {
          translateTableHeaders(table);
          translateLeaderboardPoints(table);
        },
      },
      "streamer-decks": {
        pattern: /^streamer-decks/,
        handler: (table) => {
          table.classList.add("hsguru-streamer-decks-table");
          const headers = table.querySelectorAll("thead th");
          headers.forEach((header) => {
            const abbr = header.querySelector("abbr");
            if (abbr) {
              const text = abbr.textContent.trim();
              const title = abbr.getAttribute("title");
              if (uiTranslations.get(text)) {
                abbr.textContent = uiTranslations.get(text);
              }
              if (uiTranslations.get(title)) {
                abbr.setAttribute("title", uiTranslations.get(title));
              }
            } else {
              translateNodeText(header);
            }
          });
          const formatCells = table.querySelectorAll(
            "tbody tr td:nth-child(3)",
          );
          formatCells.forEach((cell) => {
            const formatTag = cell.querySelector(".tag");
            if (formatTag) translateNodeText(formatTag);
          });
          const deckCards = table.querySelectorAll(
            "tbody tr td:first-child .decklist-info",
          );
          deckCards.forEach((deckCard) => {
            const accentColor = getMappedClassValue(
              deckCard,
              CLASS_ACCENT_COLORS,
              DEFAULT_CLASS_ACCENT,
            );
            const deckCell = deckCard.closest("td");
            if (deckCell) {
              deckCell.classList.add("hsguru-streamer-deck-cell");
              deckCell.style.setProperty(
                "--hsguru-streamer-accent",
                accentColor,
              );
            }
          });
          const rankCells = table.querySelectorAll(
            "tbody tr td:nth-child(4), tbody tr td:nth-child(5), tbody tr td:nth-child(6)",
          );
          rankCells.forEach((cell) => {
            if (!cell.textContent.trim()) {
              cell.classList.add("hsguru-streamer-empty-rank");
              cell.textContent = "暂无排名";
            }
          });
        },
      },
      esports: {
        pattern: /^esports/,
        handler: (table) => {
          translateTableHeaders(table);
          const statusCells = table.querySelectorAll(
            "tbody tr td:nth-child(3)",
          );
          statusCells.forEach((cell) => {
            const statusSpans = cell.querySelectorAll("span");
            statusSpans.forEach((span) => {
              translateNodeText(span);
            });
          });
        },
      },
      matchups: {
        pattern: /^matchups/,
        handler: (table) => {
          if (table.dataset.translated === "true") return;
          const wrapper = table.closest("#matchups_table_wrapper");
          if (wrapper) {
            wrapper.classList.add("hsguru-matchups-wrapper");
          }
          table.classList.add("hsguru-matchups-table");
          const headerButtons = table.querySelectorAll("th button");
          headerButtons.forEach((button) => {
            const originalText = button.textContent.trim();
            const cleanText = originalText.replace(/:$/, "").trim();
            const translatedText = uiTranslations.get(cleanText);
            if (translatedText) {
              // "Popularity:" 末尾冒号去掉，与"卡组职业"并排时更简洁
              button.textContent = translatedText;
            }
            button.classList.add("hsguru-matchups-action");
            if (cleanText === "Winrate")
              button.classList.add("hsguru-matchups-action-winrate");
            if (cleanText === "Seed Weights")
              button.classList.add("hsguru-matchups-action-fill");
            if (cleanText === "Reset Weights")
              button.classList.add("hsguru-matchups-action-reset");
            if (cleanText === "Popularity")
              button.classList.add("hsguru-matchups-action-usage");
            if (cleanText === "Archetype")
              button.classList.add("hsguru-matchups-action-archetype");
            const buttonTitles = {
              Winrate: "按胜率排序",
              "Seed Weights": "按当前使用率填充权重",
              "Reset Weights": "重置自定义权重",
              Popularity: "按使用率排序",
              Archetype: "按卡组职业排序",
            };
            if (buttonTitles[cleanText]) {
              button.title = buttonTitles[cleanText];
              button.setAttribute("aria-label", buttonTitles[cleanText]);
            }
          });
          // 在"使用率"和"卡组职业"两个并排按钮之间插入 "/" 分隔符
          const metaHeader = table.querySelector(
            "th.hsguru-matchups-meta-header, thead th:nth-child(2)",
          );
          if (
            metaHeader &&
            !metaHeader.querySelector(".hsguru-matchups-meta-separator")
          ) {
            const sep = document.createElement("span");
            sep.className = "hsguru-matchups-meta-separator";
            sep.textContent = "/";
            metaHeader.appendChild(sep);
          }
          const allHeaders = table.querySelectorAll("thead th");
          allHeaders.forEach((header, index) => {
            if (index === 0)
              header.classList.add("hsguru-matchups-corner-cell");
            if (index === 1)
              header.classList.add("hsguru-matchups-meta-header");
          });
          const classHeaders = table.querySelectorAll("th.class-background");
          classHeaders.forEach((header) => {
            header.classList.add("hsguru-matchups-deck-header");
            applyClassAccentStyles(header);
            const labelButton = header.querySelector("button");
            translateDeckNameCell(labelButton || header);
          });
          const firstColHeaders = table.querySelectorAll(
            "tbody td:nth-child(1)",
          );
          firstColHeaders.forEach((cell) => {
            cell.classList.add(
              "hsguru-matchups-sticky-col",
              "hsguru-matchups-winrate-cell",
            );
          });
          const secondColHeaders = table.querySelectorAll(
            "tbody td:nth-child(2)",
          );
          secondColHeaders.forEach((cell) => {
            cell.classList.add(
              "hsguru-matchups-sticky-col-2",
              "hsguru-matchups-archetype-cell",
            );
            applyClassAccentStyles(cell);
          });
          const classCells = table.querySelectorAll("td.class-background");
          classCells.forEach((cell) => {
            cell.classList.add("hsguru-matchups-deck-cell");
            applyClassAccentStyles(cell);
            replaceDeckNameTextNode(cell);
          });
          const dataCells = table.querySelectorAll("tbody td");
          dataCells.forEach((cell) => {
            if (
              cell.classList.contains("class-background") ||
              cell.classList.contains("hsguru-matchups-winrate-cell") ||
              cell.classList.contains("hsguru-matchups-archetype-cell")
            )
              return;
            const text = cell.textContent.trim();
            const numeric = Number.parseFloat(text.replace(/[^\d.\-]/g, ""));
            if (Number.isNaN(numeric)) return;
            cell.classList.add("hsguru-matchups-heat-cell");
          });
          const tooltipCells = table.querySelectorAll("tbody td[aria-label]");
          tooltipCells.forEach((cell) => {
            const label = cell.getAttribute("aria-label");
            if (!label) return;
            const matchupMatch = label.match(
              /^(.*?) versus (.*?) - ([\d,]+) games?$/,
            );
            const totalMatch = label.match(/^(.*?) - ([\d,]+) games?$/);
            if (matchupMatch) {
              const playerDeck = generateDeckTranslation(
                matchupMatch[1].trim(),
              );
              const opponentDeck = generateDeckTranslation(
                matchupMatch[2].trim(),
              );
              const games = matchupMatch[3];
              const isLowSample = !cell.textContent.trim();
              const lowSampleNote = isLowSample
                ? "，少于100局，未显示胜率"
                : "";
              cell.setAttribute(
                "aria-label",
                `${playerDeck} 对阵 ${opponentDeck} - ${games} 局${lowSampleNote}`,
              );
              if (isLowSample) {
                cell.classList.add("hsguru-matchups-low-sample");
                cell.textContent = "样本不足";
              }
            } else if (totalMatch) {
              const deckName = generateDeckTranslation(totalMatch[1].trim());
              const games = totalMatch[2];
              cell.setAttribute(
                "aria-label",
                `${deckName} - 总局数 ${games} 局`,
              );
            }
          });
          table.dataset.translated = "true";
        },
      },
    };
    const currentPath = window.location.href
      .replace(BASE_URL, "")
      .split("?")[0];
    for (const [_, config] of Object.entries(tableConfigs)) {
      if (currentPath.match(config.pattern)) {
        const tables = document.querySelectorAll("table");
        tables.forEach(config.handler);
        break;
      }
    }
  }
  function handleTag() {
    const tags = Array.from(
      queryCache.getOrCreate("div.column.tag, a.tag.column.is-link"),
    );
    tags.forEach((tag) => {
      const text = tag.textContent.trim();
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
  function handleTitle() {
    const titleElement = document.querySelector("div.title.is-2");
    if (!titleElement) return;
    const currentPath = window.location.href
      .replace(BASE_URL, "")
      .split("?")[0];
    const text = titleElement.textContent.trim();
    function handleDeckNameTranslation(match) {
      if (!match) return false;
      const [_, deckName] = match;
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = generateDeckTranslation(deckName);
      titleElement.textContent = tempDiv.textContent.trim();
      document.title = tempDiv.textContent.trim();
      return true;
    }
    if (currentPath.match(/^card\/\d+$/)) {
      const translation = translationCache.getOrCreate(
        text,
        (t) => cardTranslations.get(t) || t,
      );
      if (translation !== text) {
        titleElement.textContent = translation;
        document.title = translation;
      }
      return;
    }
    if (currentPath.match(/^deck\/(\d+|[A-Za-z0-9+/=%]+)$/)) {
      if (handleDeckNameTranslation(text.match(/(.*?) (Standard|Wild)$/)))
        return;
    }
    if (currentPath.match(/^leaderboard\/player-history\//)) {
      const translated = text
        .replace(/\bRank\b/g, uiTranslations.get("Rank"))
        .replace(/\bHistory\b/g, uiTranslations.get("History"));
      if (translated !== text) {
        titleElement.textContent = translated;
        document.title = translated;
      }
      return;
    }
    if (currentPath.match(/^leaderboard\/rank-history\//)) {
      const translated = text
        .replace(/\bRank\b/g, uiTranslations.get("Rank"))
        .replace(/\bHistory\b/g, uiTranslations.get("History"));
      if (translated !== text) {
        titleElement.textContent = translated;
        document.title = translated;
      }
      return;
    }
    if (currentPath === "card-stats") {
      if (text.includes("Archetype Card Stats")) {
        if (
          handleDeckNameTranslation(
            text.match(/(.*?) Archetype Card Stats \((Standard|Wild)\)/),
          )
        )
          return;
      }
      if (text.includes("Deck Card Stats")) {
        if (
          handleDeckNameTranslation(
            text.match(/(.*?) Deck Card Stats \((Standard|Wild)\)/),
          )
        )
          return;
      }
    }
    if (currentPath.match(/^archetype\/[^/]+$/)) {
      if (handleDeckNameTranslation(text.match(/(.*?) (Standard|Wild) stats$/)))
        return;
    }
    if (currentPath === "leaderboard/points") {
      const match = text.match(
        /(\d{4}) (Spring|Summer|Fall|Winter) (Standard|Wild)/,
      );
      if (match) {
        const [_, year, season, format] = match;
        titleElement.textContent = `${year} ${uiTranslations.get(season)}${uiTranslations.get(format)}`;
        document.title = `${year} ${uiTranslations.get(season)}${uiTranslations.get(format)}`;
      }
      return;
    }
    const simpleUrlMap = {
      "leaderboard/player-stats": "Leaderboard Stats",
      leaderboard: "Leaderboard",
      decks: "Decks",
      meta: "Meta",
      matchups: "Matchups",
      "streamer-decks": "Streamer Decks",
      esports: "Esports",
      deckbuilder: "Hearthstone DeckBuilder",
      cards: "Hearthstone Cards",
      "legacy-hsesports": "Archive of old hsesports pages",
      replays: "Replays",
      "battlefy/third-party-tournaments": "Choose organization",
      "battlefy/tournaments-stats": "Tournaments Stats",
      "streaming-now": "Streaming Now",
      "streamer-instructions": "Streamer Instructions",
      "hdt-plugin": "HDT Plugin",
      "stats/explanation": "Stats Explanation",
    };
    const originalTitle = simpleUrlMap[currentPath];
    if (originalTitle && text === originalTitle) {
      titleElement.textContent = uiTranslations.get(originalTitle);
      document.title = uiTranslations.get(originalTitle);
    }
  }
  function handleScrollTop() {
    if (document.getElementById("hsguru-scroll-top")) return;
    const btn = document.createElement("button");
    btn.id = "hsguru-scroll-top";
    btn.title = "返回顶部";
    btn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18 15l-6-6-6 6"/>
    </svg>
  `;
    Object.assign(btn.style, {
      position: "fixed",
      bottom: "30px",
      right: "30px",
      width: "48px",
      height: "48px",
      borderRadius: "50%",
      backgroundColor: "#4f46e5",
      color: "#fff",
      border: "none",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      zIndex: "9999",
      opacity: "0",
      visibility: "hidden",
      transition: "all 0.3s ease",
      transform: "translateY(20px)",
    });
    btn.onmouseenter = () => {
      btn.style.backgroundColor = "#4338ca";
      btn.style.transform = "translateY(-2px)";
    };
    btn.onmouseleave = () => {
      btn.style.backgroundColor = "#4f46e5";
      btn.style.transform = "translateY(0)";
    };
    btn.onclick = () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };
    document.body.appendChild(btn);
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        btn.style.opacity = "1";
        btn.style.visibility = "visible";
        btn.style.transform = "translateY(0)";
      } else {
        btn.style.opacity = "0";
        btn.style.visibility = "hidden";
        btn.style.transform = "translateY(20px)";
      }
    };
    window.addEventListener("scroll", toggleVisibility);
    toggleVisibility();
  }
  let cardPreviewOverlay = null;
  let activeCardPreviewName = "";
  let lastCardPreviewPosition = { x: 0, y: 0 };
  const hiddenNativeCardPreviews = /* @__PURE__ */ new Map();
  function getCardPreviewOverlay() {
    if (cardPreviewOverlay) return cardPreviewOverlay;
    if (!document.getElementById("hsguru-card-preview-hide-style")) {
      const style = document.createElement("style");
      style.id = "hsguru-card-preview-hide-style";
      style.textContent = `
        body.hsguru-hide-native-card-preview .decklist-card-image {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }
      `;
      document.head.appendChild(style);
    }
    cardPreviewOverlay = document.createElement("div");
    cardPreviewOverlay.id = "hsguru-chinese-card-preview";
    Object.assign(cardPreviewOverlay.style, {
      position: "fixed",
      display: "none",
      pointerEvents: "none",
      zIndex: "2147483647",
      width: "260px",
      filter: "drop-shadow(0 16px 28px rgba(0, 0, 0, 0.35))",
      transition: "opacity 0.12s ease",
    });
    const image = document.createElement("img");
    image.alt = "";
    Object.assign(image.style, {
      display: "block",
      width: "100%",
      height: "auto",
      borderRadius: "14px",
    });
    cardPreviewOverlay.appendChild(image);
    document.body.appendChild(cardPreviewOverlay);
    return cardPreviewOverlay;
  }
  function positionCardPreview(x, y) {
    const overlay = getCardPreviewOverlay();
    const previewWidth = 260;
    const previewHeight = 360;
    const gap = 18;
    const verticalLift = 120;
    let left = x + gap;
    let top = y - verticalLift;
    if (left + previewWidth > window.innerWidth - 8) {
      left = x - previewWidth - gap;
    }
    if (top + previewHeight > window.innerHeight - 8) {
      top = window.innerHeight - previewHeight - 8;
    }
    overlay.style.left = `${Math.max(8, left)}px`;
    overlay.style.top = `${Math.max(8, top)}px`;
  }
  function replaceNativeHoverCardImages(imageUrl) {
    if (!imageUrl) return;
    const selectors = [
      ".tippy-box img",
      '[role="tooltip"] img',
      ".tooltip img",
    ];
    document.querySelectorAll(selectors.join(",")).forEach((image) => {
      if (image.closest("#hsguru-chinese-card-preview")) return;
      if (image.dataset.hsguruChineseImage === imageUrl) return;
      image.src = imageUrl;
      image.dataset.hsguruChineseImage = imageUrl;
    });
  }
  function hideNativeHoverCardPreviews() {
    document.body.classList.add("hsguru-hide-native-card-preview");
    const selectors = [
      ".decklist-card-image",
      ".tippy-box img",
      '[role="tooltip"] img',
      ".tooltip img",
    ];
    document.querySelectorAll(selectors.join(",")).forEach((element) => {
      if (element.closest("#hsguru-chinese-card-preview")) return;
      const preview =
        element.classList.contains("decklist-card-image")
          ? element
          : element.closest(".tippy-box") ||
            element.closest('[role="tooltip"]') ||
            element.closest(".tooltip") ||
            element.parentElement;
      if (!preview || hiddenNativeCardPreviews.has(preview)) return;
      hiddenNativeCardPreviews.set(preview, {
        display: preview.style.display,
        opacity: preview.style.opacity,
        visibility: preview.style.visibility,
        pointerEvents: preview.style.pointerEvents,
      });
      preview.style.display = "none";
      preview.style.opacity = "0";
      preview.style.visibility = "hidden";
      preview.style.pointerEvents = "none";
    });
  }
  function restoreNativeHoverCardPreviews() {
    document.body.classList.remove("hsguru-hide-native-card-preview");
    hiddenNativeCardPreviews.forEach((style, preview) => {
      preview.style.display = preview.classList.contains("decklist-card-image")
        ? "none"
        : style.display;
      preview.style.opacity = style.opacity;
      preview.style.visibility = style.visibility;
      preview.style.pointerEvents = style.pointerEvents;
    });
    hiddenNativeCardPreviews.clear();
  }
  function renderChineseCardPreview(imageUrl) {
    if (!imageUrl || !activeCardPreviewName) return;
    const overlay = getCardPreviewOverlay();
    const image = overlay.querySelector("img");
    if (image.src !== imageUrl) image.src = imageUrl;
    positionCardPreview(lastCardPreviewPosition.x, lastCardPreviewPosition.y);
    replaceNativeHoverCardImages(imageUrl);
    hideNativeHoverCardPreviews();
    setTimeout(() => {
      replaceNativeHoverCardImages(imageUrl);
      hideNativeHoverCardPreviews();
    }, 80);
    overlay.style.display = "block";
    overlay.style.opacity = "1";
  }
  function ensureCardImageFetch(cardName) {
    if (!cardName || getCachedCardImage(cardName)) return;
    if (pendingFetches.has(cardName) || requestQueue.includes(cardName)) return;
    pendingFetches.set(cardName, []);
    enqueueCardFetch(cardName);
  }
  function showChineseCardPreview(cardName, x, y) {
    if (!cardName) return;
    activeCardPreviewName = cardName;
    lastCardPreviewPosition = { x, y };
    hideNativeHoverCardPreviews();
    setTimeout(hideNativeHoverCardPreviews, 0);
    const imageUrl = getCachedCardImage(cardName);
    if (imageUrl) {
      renderChineseCardPreview(imageUrl);
      return;
    }
    const overlay = getCardPreviewOverlay();
    overlay.style.display = "none";
    ensureCardImageFetch(cardName);
  }
  function moveChineseCardPreview(x, y) {
    if (!activeCardPreviewName) return;
    lastCardPreviewPosition = { x, y };
    if (getCachedCardImage(activeCardPreviewName)) {
      positionCardPreview(x, y);
    }
  }
  function hideChineseCardPreview() {
    activeCardPreviewName = "";
    restoreNativeHoverCardPreviews();
    if (!cardPreviewOverlay) return;
    cardPreviewOverlay.style.opacity = "0";
    cardPreviewOverlay.style.display = "none";
  }
  FEATURES.AD.handler = handleAd;
  FEATURES.BASIC.handler = handleBasic;
  FEATURES.CARD.handler = handleCard;
  FEATURES.CARD_LINK.handler = handleCardLinks;
  FEATURES.CLIPBOARD.handler = handleClipboard;
  FEATURES.DECK.handler = handleDeck;
  FEATURES.FILTER.handler = handleFilter;
  FEATURES.FILTER_STYLE.handler = handleFilterStyle;
  FEATURES.MANA.handler = handleMana;
  FEATURES.SEARCH.handler = handleSearch;
  FEATURES.SUB.handler = handleSub;
  FEATURES.TABLE.handler = handleTable;
  FEATURES.TAG.handler = handleTag;
  FEATURES.TITLE.handler = handleTitle;
  FEATURES.SCROLL_TOP.handler = handleScrollTop;
  function getConfig() {
    const saved = localStorage.getItem("hsguru_config");
    const savedConfig = saved ? JSON.parse(saved) : {};
    const defaultConfig = {};
    Object.keys(FEATURES).forEach((key) => {
      defaultConfig[`enable_${key}`] = FEATURES[key].enabled;
    });
    return { ...defaultConfig, ...savedConfig };
  }
  function applyConfig(config) {
    Object.keys(FEATURES).forEach((key) => {
      if (config.hasOwnProperty(`enable_${key}`)) {
        FEATURES[key].enabled = config[`enable_${key}`];
      }
    });
  }
  const uiStyles = `
            :root {
                --hsguru-font-sans: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
                --hsguru-font-serif: Georgia, "Times New Roman", serif;
            }
body {
                background-color: #e8d3a6;
                font-family: var(--hsguru-font-sans);
                line-height: 1.6;
            }
            body, button, input, select, textarea {
                font-family: var(--hsguru-font-sans);
            }
            h1, h2, h3, h4, h5, h6,
            .title,
            .subtitle.is-1,
            .subtitle.is-2,
            .subtitle.is-3,
            .deck-title,
            .basic-black-text.deck-title,
            .hsguru-feature-name,
            .hsguru-modal-title,
            .hsguru-sidebar-title {
                font-family: var(--hsguru-font-serif);
                font-weight: 500;
            }
            #main-navbar {
                backdrop-filter: blur(20px);
                background-color: rgba(60, 42, 41, .8);
            }
            .card {
                border: 2px solid #585049;
                outline: 3px solid #342e2a;
                background-color: #3e3630;
                margin: 0 auto;
            }
            .card:hover {
                border: 2px solid #70aff7;
                outline: 3px solid #c7ffff;  /* 蓝色边框 */
                box-shadow: inset 0 0 20px rgba(78, 185, 230, 0.8),  /* 内部蓝光 */
                           inset 0 0 35px rgba(0, 149, 255, 0.6);    /* 内部深蓝光 */
            }
            .clip-btn-value.hsguru-copy-success,
            .hsguru-deck-icon-button.hsguru-copy-success {
                color: #1d8f55 !important;
                transform: scale(1.08);
                transition: transform 0.18s ease, color 0.18s ease;
            }
            .hsguru-copy-toast {
                position: fixed;
                top: 78px;
                right: 24px;
                z-index: 10001;
                padding: 10px 14px;
                border: 1px solid rgba(57, 44, 30, 0.55);
                border-radius: 10px;
                background: rgba(34, 25, 17, 0.92);
                box-shadow: rgba(0, 0, 0, 0.24) 0 8px 24px;
                color: #f5ead0;
                font-size: 13px;
                font-weight: 700;
                opacity: 0;
                pointer-events: none;
                transform: translateY(-8px);
                transition: opacity 0.18s ease, transform 0.18s ease;
            }
            .hsguru-copy-toast.is-visible {
                opacity: 1;
                transform: translateY(0);
            }
            .has-text-right.card-number.deck-text.decklist-card-background.is-unselectable {
                color:#f4d442;
                font-weight: bold;
            }
            .footer {
                background-color: #170e09;
            }
`;
  const filterStyles = `
.filters-container {
                position: sticky;
                top: 0;
                z-index: 20;
                display: flex;
                align-items: flex-start;
                gap: 10px;
                flex-wrap: wrap;
                width: 100%;
                max-width: 100%;
                box-sizing: border-box;
                background: url(data:image/webp;base64,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) center top / 100% 100% no-repeat;
                min-height: 119px;
                padding: 35px 24px 18px clamp(24px, 7vw, 100px);
                overflow: visible;
            }
            .filters-container > span,
            .filters-container > .dropdown,
            .filters-container > .button,
            .filters-container > a.button,
            .filters-container > form {
                flex: 0 0 auto;
                max-width: 100%;
            }
            .filters-container.hsguru-streamer-filters {
                float: none;
                clear: both;
                height: auto;
                min-height: 119px;
                padding-left: 24px;
            }
            .filters-container.hsguru-streamer-filters > .button,
            .filters-container.hsguru-streamer-filters > a.button {
                height: 40px;
                min-width: 40px;
                border-radius: 20px;
                background-color: #c4b18a;
                border: 1px solid #6d5d40;
                outline: 3px solid #c5a058;
                color: #614326;
                margin-right: 0;
            }
            .filters-container.hsguru-streamer-filters .dropdown {
                margin-right: 0;
            }
            .filters-container.hsguru-streamer-filters .input {
                background: #f4ead1;
                border: 1px solid #6d5d40;
                color: #2f2416;
                border-radius: 6px;
                margin: 6px;
                width: calc(100% - 12px);
            }
            .filters-container.hsguru-leaderboard-filters > .hsguru-leaderboard-nav-button {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                height: 40px;
                min-width: 40px;
                border-radius: 20px;
                background-color: #c4b18a;
                border: 1px solid #6d5d40;
                outline: 3px solid #c5a058;
                color: #614326;
                margin-right: 0;
            }
            .filters-container.hsguru-leaderboard-filters > .hsguru-leaderboard-nav-button .icon {
                margin: 0;
            }
            .filters-container.hsguru-leaderboard-filters {
                align-items: center;
                flex-wrap: wrap;
                justify-content: flex-start;
                gap: 12px;
            }
            form.filters-container.hsguru-leaderboard-filters {
                margin: 0;
                border: 0;
                box-shadow: none;
                outline: none;
            }
            .filters-container.hsguru-leaderboard-filters > .hsguru-leaderboard-search-form {
                display: inline-flex;
                align-items: center;
                align-self: center;
                margin: 0;
                min-width: 220px;
                max-width: 320px;
                width: auto;
                padding: 0;
                background: none;
                min-height: 0;
                box-shadow: none;
                outline: none;
                border: 0;
            }
            .filters-container.hsguru-leaderboard-filters > .hsguru-leaderboard-inline-form {
                display: inline-flex;
                align-items: center;
                flex-wrap: wrap;
                justify-content: flex-start;
                gap: 12px;
                margin: 0;
                padding: 0;
                background: none;
                min-height: 0;
                box-shadow: none;
                outline: none;
                border: 0;
            }
            .filters-container.hsguru-leaderboard-filters > .hsguru-leaderboard-inline-form > .hsguru-leaderboard-inline-field {
                float: none !important;
                display: flex;
                align-items: center;
                margin: 0 !important;
            }
            .filters-container.hsguru-leaderboard-filters > .hsguru-leaderboard-inline-form > .hsguru-leaderboard-inline-field > .hsguru-leaderboard-inline-input,
            .filters-container.hsguru-leaderboard-filters > .hsguru-leaderboard-inline-form > .hsguru-leaderboard-inline-field > input.input,
            .filters-container.hsguru-leaderboard-filters > .hsguru-leaderboard-inline-form > .hsguru-leaderboard-inline-field > input[type='number'],
            .filters-container.hsguru-leaderboard-filters > .hsguru-leaderboard-inline-form > .hsguru-leaderboard-inline-field > input[type='search'],
            .filters-container.hsguru-leaderboard-filters > .hsguru-leaderboard-inline-form > .hsguru-leaderboard-inline-field > select {
                width: 140px !important;
                min-width: 140px;
                margin: 0;
            }
            .filters-container.hsguru-leaderboard-filters > .hsguru-leaderboard-search-form .hsguru-leaderboard-search-input {
                width: 100%;
                min-width: 220px;
                height: 40px;
                background: #f4ead1;
                border: 1px solid #6d5d40;
                border-radius: 8px;
                color: #2f2416;
                box-shadow: inset 0 1px 2px rgba(34, 23, 13, 0.18);
                padding: 0 14px;
            }
            .filters-container.hsguru-leaderboard-filters > .hsguru-leaderboard-search-form .hsguru-leaderboard-search-input:focus {
                outline: none;
                border-color: #8d7658;
                box-shadow: inset 0 1px 2px rgba(34, 23, 13, 0.18), 0 0 0 2px rgba(141, 118, 88, 0.18);
            }
            .filters-container.hsguru-leaderboard-filters > .hsguru-leaderboard-search-form .hsguru-leaderboard-search-input::placeholder {
                color: rgba(97, 67, 38, 0.72);
            }
            .filters-container.hsguru-leaderboard-filters > .hsguru-leaderboard-inline-input,
            .filters-container.hsguru-leaderboard-filters > select.hsguru-leaderboard-inline-input {
                height: 40px;
                min-width: 140px;
                padding: 0 14px;
                background: #f4ead1;
                border: 1px solid #6d5d40;
                border-radius: 8px;
                color: #2f2416;
                box-shadow: inset 0 1px 2px rgba(34, 23, 13, 0.18);
            }
            .filters-container.hsguru-leaderboard-filters > .hsguru-leaderboard-inline-input::placeholder {
                color: rgba(97, 67, 38, 0.72);
            }
            .filters-container.hsguru-leaderboard-filters > .hsguru-leaderboard-inline-input:focus,
            .filters-container.hsguru-leaderboard-filters > select.hsguru-leaderboard-inline-input:focus {
                outline: none;
                border-color: #8d7658;
                box-shadow: inset 0 1px 2px rgba(34, 23, 13, 0.18), 0 0 0 2px rgba(141, 118, 88, 0.18);
            }
            .svg-container {
                margin: 0 74px 10px 74px;
                padding: 24px 24px 14px;
                border: 2px solid #6b5634;
                outline: 3px solid #c5a058;
                border-radius: 16px;
                background: linear-gradient(180deg, rgba(252, 244, 220, 0.96), rgba(234, 219, 182, 0.94));
                box-shadow: 0 14px 30px rgba(56, 31, 14, 0.18);
                overflow: hidden;
            }
            .svg-container svg {
                display: block;
                width: 100%;
                height: auto;
                background: transparent !important;
            }
            .svg-container svg text {
                fill: #4a3217 !important;
                font-family: var(--hsguru-font-sans);
                font-size: 12px;
            }
            .svg-container svg path,
            .svg-container svg line {
                stroke: rgba(86, 59, 28, 0.7) !important;
            }
            .svg-container svg circle {
                fill: #ba3c26 !important;
                stroke: #f6d78e !important;
                stroke-width: 1.4px !important;
                filter: drop-shadow(0 2px 4px rgba(73, 27, 15, 0.18));
            }
            .filters-container .dropdown {
                    border: 1px solid #711513;
                    outline: 3px solid #a92d25;
                    border-radius: 21px;
                    margin-right: 0;
                    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
                }
            .filters-container .dropdown.is-active,
            .filters-container .dropdown.is-hoverable:hover {
                    position: relative;
                    z-index: 200;
                }
            .filters-container .dropdown .button{
                height: 40px;
                border-radius: 20px;
                background-color: #c4b18a;
                border: 1px solid #6d5d40;
                outline: 3px solid #c5a058;
                color: #614326;
            }
            .filters-container .dropdown .button:hover {
                background-color: #ffff95
            }
            .filters-container .dropdown .button-with-icon{
                justify-content: left;
                min-width: 100px;
                padding-left: 40px;
            }
            @media (max-width: 1280px) {
                .filters-container {
                    padding-left: 24px;
                }
            }
            @media (max-width: 768px) {
                .filters-container {
                    gap: 8px;
                    min-height: 0;
                    padding: 18px 12px 14px;
                }
                .filters-container .dropdown,
                .filters-container .dropdown .button {
                    max-width: 100%;
                }
                .filters-container .dropdown .button-with-icon {
                    min-width: 0;
                }
                .filters-container.hsguru-streamer-filters {
                    padding-left: 12px;
                }
                .filters-container.hsguru-leaderboard-filters > .hsguru-leaderboard-search-form {
                    min-width: 100%;
                    max-width: 100%;
                    margin-left: 0;
                }
                .filters-container.hsguru-leaderboard-filters > .hsguru-leaderboard-inline-form {
                    width: 100%;
                    justify-content: stretch;
                }
                .filters-container.hsguru-leaderboard-filters > .hsguru-leaderboard-inline-form > .hsguru-leaderboard-inline-field {
                    flex: 1 1 120px;
                }
                .filters-container.hsguru-leaderboard-filters > .hsguru-leaderboard-inline-form > .hsguru-leaderboard-inline-field > .hsguru-leaderboard-inline-input,
                .filters-container.hsguru-leaderboard-filters > .hsguru-leaderboard-inline-form > .hsguru-leaderboard-inline-field > input.input,
                .filters-container.hsguru-leaderboard-filters > .hsguru-leaderboard-inline-form > .hsguru-leaderboard-inline-field > input[type='number'],
                .filters-container.hsguru-leaderboard-filters > .hsguru-leaderboard-inline-form > .hsguru-leaderboard-inline-field > input[type='search'],
                .filters-container.hsguru-leaderboard-filters > .hsguru-leaderboard-inline-form > .hsguru-leaderboard-inline-field > select {
                    width: 100% !important;
                    min-width: 0;
                }
                .filters-container.hsguru-leaderboard-filters > .hsguru-leaderboard-search-form .hsguru-leaderboard-search-input {
                    min-width: 0;
                }
                .filters-container.hsguru-leaderboard-filters > .hsguru-leaderboard-inline-input,
                .filters-container.hsguru-leaderboard-filters > select.hsguru-leaderboard-inline-input {
                    min-width: 120px;
                }
                .svg-container {
                    margin: 0 14px;
                    padding: 16px 14px 8px;
                }
            }
            .filters-container .dropdown .dropdown-menu {
                top: calc(100% + 8px);
                border: 1px solid #2f2922;
                outline: 3px solid #5d5850;
                padding-top: 0px;
                border-radius: .4em;
                z-index: 210;
            }
            .filters-container .dropdown .dropdown-menu::before {
                content: '';
                position: absolute;
                top: -8px;
                left: 0;
                right: 0;
                height: 8px;
            }
            .filters-container .dropdown .dropdown-menu .dropdown-content {
                background-color: #3e3630;
                border: 2px solid #2c2720;
                outline: 1px solid #1e1912;
            }
            .filters-container .dropdown .dropdown-menu .dropdown-content .dropdown-item  {
                height: 45px;
                line-height: 45px;
                padding: 0px;
                padding-left: 40px;
            }
            .filters-container .dropdown .dropdown-menu .dropdown-content a:hover {
                background-color: #12100e;
                color: #fff
            }
            .filters-container .dropdown .dropdown-menu .dropdown-content a.is-active {
               background-color:unset;
               color: #fcd144;
            }.filters-container .dropdown .dropdown-menu .dropdown-content a.is-active:hover {
               background-color:#12100e;
            }
            [data-balloon-pos]::before,
            [data-balloon-pos]::after {
                z-index: 1000 !important;
            }
            .class-icon {
                background-repeat: no-repeat;
                background-size: 28px;
                background-position: 5px center;
            }
            .class-standard{
                background-image: url(data:image/webp;base64,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Ozgw8XND2xQitlsEAcVdGqm3hPVlwsDJMr3eOPOosS25sjBgn4kB6LQNREADKhAckkxew//efslNchMlSlMQFxSU5t5gQZyjSsEiazqMfcvOMqoZzORy+dpMEz91a2bgfX+Ai+YoQeX+a3bxxs4sAJ+a3wOH4hYMw23lRH4U8mMfbjInlPO7g+P7vLNdIMdcHYRtd3uTuDpjh3GwrR4te2s35QbJy1Z+TyOjQwjXwBghL77YBDx9ndlnlrp5ypXus0R/Bft1/43vOGaAy98Xz7DixpjBZzHhg3AH/JuRjAb9DMMgltvAlzcl9wSuVNx1OJB/+fDhWjFkuZjbuVYDwPphE63XO8oh3qkuqAFAfZsv7SnEFwc1v2bu0MIdKXv8JYbpjZ5Z9RJHFCEUuvFTYBUj//+sNjlGH//CukZLVSOQBZ7iqikb4C2Tb5WtZNy7ou8Dx5VyCga0V7Dm+udAc6rRIf7BD6kj0kK7qIu3sHA4IS2SyX58ERdGrbBaQWFoq41Cs04Qfg8puSdz55O26JFoEu+8viFpHojdM/KeVTuZYyrFKfy4Qsz0crQndJq3/qPUv1fTwIHvjvq8R8NX3D4A1fbnPKbdyIesbQY1M5DoqmR3wxCY14z4vOWWSmuBxJr3VpaxAAAAAFhNUCAQAwAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6N0E1MTBFMEQ5QTdEMTFFRkFDMTdEMjEwQTY1NjZDNTgiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6N0E1MTBFMEU5QTdEMTFFRkFDMTdEMjEwQTY1NjZDNTgiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo3QTUxMEUwQjlBN0QxMUVGQUMxN0QyMTBBNjU2NkM1OCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo3QTUxMEUwQzlBN0QxMUVGQUMxN0QyMTBBNjU2NkM1OCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pg==);
            }
            .class-wild{
                background-image: url(data:image/webp;base64,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2lGfvWAAAAAAAJ76zdR0tizZIIA7Cg5kRD1KCFSJ6T37PbrYVI5lMxlTJp9MULoDHEy4AAAAWE1QIBADAAA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjYtYzE0NSA3OS4xNjM0OTksIDIwMTgvMDgvMTMtMTY6NDA6MjIgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE5IChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo3RTJBQjgwOTlBN0QxMUVGOTEyMkYwMDFDQTExRDY1RSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo3RTJBQjgwQTlBN0QxMUVGOTEyMkYwMDFDQTExRDY1RSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjdFMkFCODA3OUE3RDExRUY5MTIyRjAwMUNBMTFENjVFIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjdFMkFCODA4OUE3RDExRUY5MTIyRjAwMUNBMTFENjVFIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+);
            }
            .class-top-1k, .class-top-5k, .class-legend{
                background-image: url(data:image/png;base64,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);
            }
            .class-diamond-4-1{
                background-image: url(data:image/png;base64,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);
            }
            .class-diamond-legend{
                background-image: url(data:image/png;base64,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);
            }
            .class-all{
                background-image: url(data:image/svg+xml;charset=utf-8;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgZmlsbD0ibm9uZSIgdmlld0JveD0iMCAxIDQ4IDQ4Ij48cGF0aCBmaWxsPSIjNTkzODEwIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0yNCAxMi4xN2M3IDAgMTIuOCA1LjggMTIuOCAxMi44UzMxIDM3Ljc3IDI0IDM3Ljc3cy0xMi44LTUuOC0xMi44LTEyLjhTMTcgMTIuMTcgMjQgMTIuMTciIGNsaXAtcnVsZT0iZXZlbm9kZCIvPjxwYXRoIGZpbGw9IiNGRjlDMDAiIGZpbGwtcnVsZT0iZXZlbm9kZCIgZD0ibTM3LjQgMzAuMTcgOC42LTUuMi04LjYtNS4yYy0uNC0xLjItMS0yLTEuNi0zbDItNS40LTUuNCAyYy0xLS42LTItMS4yLTMtMS42TDI0IDIuOTdsLTUuMiA4LjZjLTEuMi40LTIgMS0zIDEuNmwtNS40LTIgMiA1LjRjLS42IDEtMS4yIDItMS42IDNMMiAyNC45N2w4LjYgNS4yYy40IDEuMiAxIDIgMS42IDNsLTIgNS4zOTkgNS40LTJjMSAuNiAyIDEuMiAzIDEuNmw1LjQgOC44IDUuMi04LjZjMS4yLS40IDItMSAzLTEuNmw1LjQgMi0yLTUuNGMuOC0xIDEuNC0yLjIgMS44LTMuMk0yNCAzNi43N2MtNi42IDAtMTEuOC01LjItMTEuOC0xMS44czUuNC0xMS44IDExLjgtMTEuOGM2LjYgMCAxMS44IDUuNCAxMS44IDExLjggMCA2LjYtNS4yIDExLjgtMTEuOCAxMS44IiBjbGlwLXJ1bGU9ImV2ZW5vZGQiLz48cGF0aCBmaWxsPSIjMzlDQ0ZGIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0zMiAyNC41NjljMCAuMi0uMi40LS40LjYtLjIuNC4yLjQuMi42IDAgLjQgMCAxLS4yIDEuNCAwIC40LS4yLjgtLjQgMS4ycy0uNC42LS42IDFjMCAuNC0uMi44LS40IDEuMi0uNC40LS42LjYtMSAuOHMtLjQuNi0uOCAxbC0xLjIuNmMtLjQuMi0uOC4yLTEuMi40cy0xIC4yLTEuNC40Yy0uNCAwLTEgMC0xLjQuMi0uNCAwLS44LjQtMS4yLjRzLS44LS40LTEuMi0uNC0uOC0uMi0xLjItLjQtLjgtLjItMS4yLS40Yy0uNCAwLS44LS40LTEtLjggMC0uNCAxLjItLjQgMS42LS42LjYtLjQgMS40LS4yIDItLjYuMi0uMi40LS40LjYtLjQuMi0uMi40LS4yLjgtLjIuNC0uMiAxLS4yIDEuNi0uNGwxLjItLjZjLjQtLjIuNi0uNCAxLS44LjQtLjIuNi0uNiAxLTFsLjYtMS4yYy40LS40LjgtLjQuNi0uOHMtLjItMS0uMi0xLjRjMC0xIC4yLTItLjQtMi44LS40LS40LS42LS44LS44LTEuMi0uMi0uMi0uMi0uNC0uMi0uNiAwLS40LjItLjQtLjItLjQtLjIgMC0uNC4yLS42LjJoLS44Yy0uNiAwLTEuMiAwLTEuNi4ycy0xIC40LTEuMi42Yy0uNC4yLS42LjYtMSAuOC0uMiAwLS40LjItLjYuNCAwIC4yLS4yLjQtLjIuNi0uMi40LS4yIDEgMCAxLjYuMi44LjggMiAxLjggMS42cy0uOC0xLjggMC0yLjJjLjQtLjIgMS0uMiAxLjQgMCAuNiAwIDEgLjIgMS40LjRzLjIuOC40IDEuMmMuNC40LjQuOC40IDEuNCAwIDEtLjYgMS44LTEuNCAyLjItLjQuMi0xIDAtMS40LjJzLS44LjQtMS4yLjRjLS4yIDAtLjQtLjItLjYtLjJoLS42Yy0uNCAwLS42LS42LTEtLjYgMC0uNC0uNi0uOC0uOC0xLS40LS40LS42LS44LTEtMS4ycy0uNi0uOC0uOC0xLjIgMC0uOC0uMi0xLjJjMC0uMi0uMi0uNC0uMi0uNnYtLjhjMC0uNC0uMi0uOC0uMi0xLjJzMC0uNC40LS40Yy4yLS4yLjQtLjQuNi0uNC0uMi0uOCAwLTEgLjQtMS40IDAtLjIuMi0uNC40LS42cy4yLS40LjQtLjRjLjQtLjQuOC0uNiAxLjItMSAuOC0uNiAxLjYtMS4yIDIuOC0uOC42LjIuOC0uMiAxLjItLjJzLjguNCAxLjIuNGMuNC4yLjguMiAxLjIuNHMxIC40IDEuNC42YzEgLjQgMS4yIDEuMiAxLjggMS44LjQuNiAxLjYgMS40IDEuMiAyLjIgMCAuMiAwIC42LjIuOC4yLjQuMi42LjIgMSAuMi42LjggMS4yLjggMS42IiBjbGlwLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4=);
            }
            .class-emerald-dream{
                background-image: url(data:image/webp;base64,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);
            }
            .class-any-class,.class-player-class{
                background-image: url(data:image/webp;base64,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tx255597eNnAGvqjA1Nczdtk071O84At6Zd4sPH9l34POTWwszBFGmTLQsuNeYMIU9G9VKQAxvhm6lfbg4Yw4Q0zHqO8qPZBVt7kluHea6EHhZYN2RmatarDCbNzGc2dfq+gyYHHZz3KQZwV97+aWMuWZVOzp3hxM9N07bFwAC1oMgAAWE1QIGsDAAA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjYtYzE0NSA3OS4xNjM0OTksIDIwMTgvMDgvMTMtMTY6NDA6MjIgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6YmNkOGVlZDQtMTY0Ni0xOTRjLWJlMzMtMDQzN2UwZDJjMjAzIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkQyODJCMUY2MjRDODExRTlBQUYwQTg2NzJCQjc0QTQ5IiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkQyODJCMUY1MjRDODExRTlBQUYwQTg2NzJCQjc0QTQ5IiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDQyAoTWFjaW50b3NoKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOmQ2MmQzYmRiLTllMDktZWQ0YS1hMzk5LTBhMzBhOTM4ZTUzNCIgc3RSZWY6ZG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjljZjljMGE1LWE5NTItYjk0Ni04YjFjLTNhNmU5MDFkZGU4YyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PgA=);
            }
            .class-opponent-class, .class-opponent\\'s-class {
                background-image: url(data:image/webp;base64,UklGRuwHAABXRUJQVlA4WAoAAAAUAAAAQwAAQwAAQUxQSKoBAAABgCMAkGlnvnUL/59SnZMjsNIRUtp2aye9Ual2DmDb1sRv38wcICIcuI2kSM4x883ME0A9QyizYXht/xbxdn9tuCEzZADqnGmDJ6jZyWCak1JE9y0qdtsdRSVhBnU1n0AhbAp1NxWml63iGQl6qbTp4l5AohbcOqRcI1nXKcryP5Cwj3zFz3IzEtdkUEG+RaxRkIsM5WhK/uDwkaJ1r1fI0pX7X9ZFZGrJ+p9SZKv0H95HPo/evyaRsak/opG1aAH7iJO/fy2RufAfXdxav7nuuF3YANKQvRSAIX69YDjhtwNBFJA3Q4LsRgmahiUYXZZgeVOCzTMJzp4leJZBxpFNCbZk3JCMz7aM71imiO+6jN8cw6mE3z4Y4tcn479Ayn8SdEv4b4RIbhHw0zSvaRFjlhj43ZSAfQAf5xjOJ2EsWfbvmHaJbUxrkzC29mhNmZjG+BLmGrmgXQu9FlBgaCHfGkCpAto5YIHkuSiAl25O7NM3N696ofBaZROxRkBQ4rzOtYokICpK35oJYa70wRNtJ4PpLqDOEMpqGF1bv3h5uVhfG23MChlAOQBWUDggqAIAAPARAJ0BKkQARAA+fTSRR6SjIaE61twAkA+JZQDBEGT3052aFKsdITQ9soeB1MltmCazqanlLI9Yi6DopXB0YtHCDJfMgtXiMjjK5zq+fxJPdJUyLYcqWvtse7+iESPokWxbFCfex9IKrjLN0fTe4yJTpetxtsOr2NWy+Acg18znSTaBlMK8+3pbzZRjuwEQB8G/4d1y39ZAAP7+FHEVY1SOdyTPUojZeq4Qszh7zWOIxpZru7xWHdfE3XAHytHiESR2a3eIVRkgLlsCQ2CtejSs4MwFpN570+1V8bhatC8phinZwSUhN4R1+PUIt1d8cDXbYbzzrFe/wbRS3gd9vk7yz6y6EFx5awO/n8r/bQPZExHtcC8z2mXRdAA9E6SpcGcU1X/USW5jhjq8vLQDFwLwpvqQMNImMM+ZEViPLOcEz88GjHkxN8RKdNcF1u8PuOCs97U4yVY7+eIWOn5HgJWFKCloJPIkVWnpUcuopHOlllFf6wQwtlQl/is83aW0JoSrJWXEiRjHIuyjP1aVeCw/HcLe4IpbnS/N4w+4vIwZchNa1y1kS5MMrCTDJhcp53DKadlDVx9FpZn2e7rrwH3U2mpUqYzqx+MNDM6RRDB46sgB8v0FJuUTp8Cy/6IQC7cAL1peC5VFQMHBqAM2vXMe8uNSrQD6oTY4gA0Ur9spFI29RGvm9bqKl4LGgThdxlhlBQITsLz2QzLx6JyvPFT5w7UwqyUPNVHEpw4kIs0gBdjQPRypEZwVbb+zcIMtNN5ZBWR+qvjQR9T1VoJ1TMn1TOdVBZDcb5VjYO8e1YEF35CBmHhtKNXMYtYkd5dUnvJnzvK4QXJVej1cGj5rT25FkxywCCOoQ1xKR/Kgm6TkM50cP4S9shcRUTkRJEH6SIF6hJzLgAAAWE1QIGsDAAA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjYtYzE0NSA3OS4xNjM0OTksIDIwMTgvMDgvMTMtMTY6NDA6MjIgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6YmNkOGVlZDQtMTY0Ni0xOTRjLWJlMzMtMDQzN2UwZDJjMjAzIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkQ3MjI0RTAzMjRDODExRTlCQTlCQzMzODRGQ0EzRDlBIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkQ3MjI0RTAyMjRDODExRTlCQTlCQzMzODRGQ0EzRDlBIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDQyAoTWFjaW50b3NoKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOmQ2MmQzYmRiLTllMDktZWQ0YS1hMzk5LTBhMzBhOTM4ZTUzNCIgc3RSZWY6ZG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjljZjljMGE1LWE5NTItYjk0Ni04YjFjLTNhNmU5MDFkZGU4YyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PgA=);
            }
            .class-death-knight,.class-vs-death-knight {
                background-image: url(data:image/webp;base64,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);
            }
            .class-demon-hunter,.class-vs-demon-hunter {
                background-image: url(data:image/webp;base64,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);
            }
            .class-druid,.class-vs-druid {
                background-image: url(data:image/webp;base64,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a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjYtYzE0NSA3OS4xNjM0OTksIDIwMTgvMDgvMTMtMTY6NDA6MjIgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6YmNkOGVlZDQtMTY0Ni0xOTRjLWJlMzMtMDQzN2UwZDJjMjAzIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkUwQ0Q0RTMxMjRDODExRTlCMkNBOUQ2REM4QzM5MDFDIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkUwQ0Q0RTMwMjRDODExRTlCMkNBOUQ2REM4QzM5MDFDIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDQyAoTWFjaW50b3NoKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOmQ2MmQzYmRiLTllMDktZWQ0YS1hMzk5LTBhMzBhOTM4ZTUzNCIgc3RSZWY6ZG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjljZjljMGE1LWE5NTItYjk0Ni04YjFjLTNhNmU5MDFkZGU4YyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PgA=);
            }
            .class-hunter,.class-vs-hunter  {
                background-image: url(data:image/webp;base64,UklGRqQIAABXRUJQVlA4WAoAAAAUAAAAQwAAQwAAQUxQSKoBAAABgCMAkGlnvnUL/59SnZMjsNIRUtp2aye9Ual2DmDb1sRv38wcICIcuI2kSM4x883ME0A9QyizYXht/xbxdn9tuCEzZADqnGmDJ6jZyWCak1JE9y0qdtsdRSVhBnU1n0AhbAp1NxWml63iGQl6qbTp4l5AohbcOqRcI1nXKcryP5Cwj3zFz3IzEtdkUEG+RaxRkIsM5WhK/uDwkaJ1r1fI0pX7X9ZFZGrJ+p9SZKv0H95HPo/evyaRsak/opG1aAH7iJO/fy2RufAfXdxav7nuuF3YANKQvRSAIX69YDjhtwNBFJA3Q4LsRgmahiUYXZZgeVOCzTMJzp4leJZBxpFNCbZk3JCMz7aM71imiO+6jN8cw6mE3z4Y4tcn479Ayn8SdEv4b4RIbhHw0zSvaRFjlhj43ZSAfQAf5xjOJ2EsWfbvmHaJbUxrkzC29mhNmZjG+BLmGrmgXQu9FlBgaCHfGkCpAto5YIHkuSiAl25O7NM3N696ofBaZROxRkBQ4rzOtYokICpK35oJYa70wRNtJ4PpLqDOEMpqGF1bv3h5uVhfG23MChlAOQBWUDggYAMAABASAJ0BKkQARAA+kT6aSaWjIiEmdm0wsBIJQBihisJeIpfLlm5Y/u0WYMwb07rSZaEHOxVJ4iG0O4HX+PycONvZGh6ycCnwzX8OnO66Aja0byVSvtoFsFK8Njn9f+UD0gle7PR9iRvOHvtAON/tY7hIshArhXjNk63OMeuOQsdFCYU5ATCSAOEpwXMHhX9yRLupjh2SEGtHAAD+/hTMEc2R0+dPguQo/ADtuf8LXHHJ7DjSF05A4aAl4WOcGOPrZv8buDFZD4AdZ57h6WCSvjhM/w3YWMQXTZ5upJ00fk950b0U15sh9dfff6hM3AlybpT4/+03hFdE7B0RG2ypoe9PleyDmrv+dwkHhQ5Et6OyoTk8iHYc6w6YELC0MFjNA3bVnX92GEaVPcxQyoaeTnFZVaew3OezREL15s6uDH6vItBKsz8nUCNFKgDDSOGn2MglWlvkK9FZSUaM1WTkT3GeXWL3O/Zs4r55ugarn1gnhYDXtkNe/kdJni2oiKmcXPJ4tWT9HNl+nD2o6PEoiJ7I6SGZ1GsVPcN4nYKSZssyvnP4pNiemoSni6LJgULTAxnROFH8cd4++cltw9UFTdwWOMnGQQ5PoMvz7qwYNyjzs/qskOWpaYbyJozeVw3/VxTic1lpjLGAwnOJeBb+tYm3JiOGdGePh6ZFzeUgzAvQgrdQsfGiIRjUezwl2gRSrPQoETWRst4djfnCmQnc2oEwkNpqWfySigtm+DH9HO6MSZRWpa2WVgof6xoVyJfSc31kzxaWUhBuqYxLlNPrpDaVGfPCuyx03fz5bW6/MtK5TgBA7EHq2zXqQSnwUi7bwV7qwAzChB86uBE5Gc0MVwVch536WmUMDkfkR7KIXJzC6J9ihZykL6UasN9738jACckmemVOORMzfJYJmfERPs6c3+8acPtxUTfq2tWxCGzlm+PQdJeQNVKqHMDmqzSsuiE0PM2nHpnC6VmbM/Y1EFG7WZfM2RtTB1wi6keTbY/e45nJvbTK0Y6kz9KLMCHppCt7iI63VBf6pwpwZl7EE2wgP9tThgYtx6lP/s8fXJ5nayfwCBEcQQ21woi4DuiZwrjPqFHGQvTArHGbjrxv3lwtzdor/kr49UOC88Ru4Cd8cB/vbO0VIrDCDWKv8coAAFhNUCBrAwAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmJjZDhlZWQ0LTE2NDYtMTk0Yy1iZTMzLTA0MzdlMGQyYzIwMyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpEQzMzQzQ3NzI0QzgxMUU5OUJFQTgxMTNGMDZBRTk0MCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpEQzMzQzQ3NjI0QzgxMUU5OUJFQTgxMTNGMDZBRTk0MCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgKE1hY2ludG9zaCkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpkNjJkM2JkYi05ZTA5LWVkNGEtYTM5OS0wYTMwYTkzOGU1MzQiIHN0UmVmOmRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDo5Y2Y5YzBhNS1hOTUyLWI5NDYtOGIxYy0zYTZlOTAxZGRlOGMiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4A);
            }
            .class-mage,.class-vs-mage   {
                background-image: url(data:image/webp;base64,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67ONaSjuJJyALOzCvVtvr3TEDcgt3t2z0qEEb8x4NzBG4gCcmsAcnTpb/Hj9uj236kNTTWGPweWC0pSl2ClcL4AAAABYTVAgawMAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQ1IDc5LjE2MzQ5OSwgMjAxOC8wOC8xMy0xNjo0MDoyMiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpiY2Q4ZWVkNC0xNjQ2LTE5NGMtYmUzMy0wNDM3ZTBkMmMyMDMiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RkNERUMxMEQyNEM4MTFFOUIzQTc4MUQ4NDZDMzNGNTgiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RkNERUMxMEMyNEM4MTFFOUIzQTc4MUQ4NDZDMzNGNTgiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6ZDYyZDNiZGItOWUwOS1lZDRhLWEzOTktMGEzMGE5MzhlNTM0IiBzdFJlZjpkb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6OWNmOWMwYTUtYTk1Mi1iOTQ2LThiMWMtM2E2ZTkwMWRkZThjIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+AA==);
            }
            .class-paladin,.class-vs-paladin    {
                background-image: url(data:image/webp;base64,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xgSI2OuCmyGgoAAAAABYTVAgawMAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQ1IDc5LjE2MzQ5OSwgMjAxOC8wOC8xMy0xNjo0MDoyMiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpiY2Q4ZWVkNC0xNjQ2LTE5NGMtYmUzMy0wNDM3ZTBkMmMyMDMiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MDE2RjhEODIyNEM5MTFFOUFEMkNCNjBGN0E5OUY0NTQiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MDE2RjhEODEyNEM5MTFFOUFEMkNCNjBGN0E5OUY0NTQiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6ZDYyZDNiZGItOWUwOS1lZDRhLWEzOTktMGEzMGE5MzhlNTM0IiBzdFJlZjpkb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6OWNmOWMwYTUtYTk1Mi1iOTQ2LThiMWMtM2E2ZTkwMWRkZThjIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+AA==);
            }
            .class-priest,.class-vs-priest     {
                background-image: url(data:image/webp;base64,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gDPp4k2KsrbGjO/Kv9jEDIoBkzZXsZ+qrNLZQIKTJqWsMO409AAAAFhNUCBrAwAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmJjZDhlZWQ0LTE2NDYtMTk0Yy1iZTMzLTA0MzdlMGQyYzIwMyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpGN0QyMTQ0NzI0QzgxMUU5QUUwQUM5N0UxQTdDNEE2OCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpGN0QyMTQ0NjI0QzgxMUU5QUUwQUM5N0UxQTdDNEE2OCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgKE1hY2ludG9zaCkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpkNjJkM2JkYi05ZTA5LWVkNGEtYTM5OS0wYTMwYTkzOGU1MzQiIHN0UmVmOmRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDo5Y2Y5YzBhNS1hOTUyLWI5NDYtOGIxYy0zYTZlOTAxZGRlOGMiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4A);
            }
            .class-rogue,.class-vs-rogue     {
                background-image: url(data:image/webp;base64,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IHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjYtYzE0NSA3OS4xNjM0OTksIDIwMTgvMDgvMTMtMTY6NDA6MjIgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6YmNkOGVlZDQtMTY0Ni0xOTRjLWJlMzMtMDQzN2UwZDJjMjAzIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkYzMTBBOUM5MjRDODExRTlCMEQ5QkYwNzBEMzFCNzQ2IiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkYzMTBBOUM4MjRDODExRTlCMEQ5QkYwNzBEMzFCNzQ2IiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDQyAoTWFjaW50b3NoKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOmQ2MmQzYmRiLTllMDktZWQ0YS1hMzk5LTBhMzBhOTM4ZTUzNCIgc3RSZWY6ZG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjljZjljMGE1LWE5NTItYjk0Ni04YjFjLTNhNmU5MDFkZGU4YyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PgA=);
            }
            .class-shaman,.class-vs-shaman      {
                background-image: url(data:image/webp;base64,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Jp/qTUy9xoWU1Qy4D3Cm+tmmmdCgQA/OKux/sqRtgPv80qOO1RItJWETlHLxNZAL807Rb8GzQNaru/lJIQgL7krfvJAEe0w7y9z7c8V3Kkwv35bTZUnOky9n08/1UPyxrpiclVJ3ANkubGifKyPMlrthjTWRBK+YcDajOu/hlKZhuozeVAXOYcfQBhWN4oXSYbc5JoeOGALck4D/WBERWAAAWE1QIGsDAAA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjYtYzE0NSA3OS4xNjM0OTksIDIwMTgvMDgvMTMtMTY6NDA6MjIgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6YmNkOGVlZDQtMTY0Ni0xOTRjLWJlMzMtMDQzN2UwZDJjMjAzIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkVFODRDMUJEMjRDODExRTk4RTdFRUZDOTYyRUZFRjVGIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkVFODRDMUJDMjRDODExRTk4RTdFRUZDOTYyRUZFRjVGIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDQyAoTWFjaW50b3NoKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOmQ2MmQzYmRiLTllMDktZWQ0YS1hMzk5LTBhMzBhOTM4ZTUzNCIgc3RSZWY6ZG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjljZjljMGE1LWE5NTItYjk0Ni04YjFjLTNhNmU5MDFkZGU4YyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PgA=);
            }
            .class-warlock,.class-vs-warlock  {
                background-image: url(data:image/webp;base64,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czp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmJjZDhlZWQ0LTE2NDYtMTk0Yy1iZTMzLTA0MzdlMGQyYzIwMyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpFOUVBMjM3MzI0QzgxMUU5OUFDM0YxMkFFQzYwQzQ1RiIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpFOUVBMjM3MjI0QzgxMUU5OUFDM0YxMkFFQzYwQzQ1RiIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgKE1hY2ludG9zaCkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpkNjJkM2JkYi05ZTA5LWVkNGEtYTM5OS0wYTMwYTkzOGU1MzQiIHN0UmVmOmRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDo5Y2Y5YzBhNS1hOTUyLWI5NDYtOGIxYy0zYTZlOTAxZGRlOGMiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4A);
            }
            .class-warrior,.class-vs-warrior   {
                background-image: url(data:image/webp;base64,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eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpiY2Q4ZWVkNC0xNjQ2LTE5NGMtYmUzMy0wNDM3ZTBkMmMyMDMiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RTU0OTBEMDAyNEM4MTFFOUEzRTM5QzU0MDgzRjQzRjQiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RTU0OTBDRkYyNEM4MTFFOUEzRTM5QzU0MDgzRjQzRjQiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6ZDYyZDNiZGItOWUwOS1lZDRhLWEzOTktMGEzMGE5MzhlNTM0IiBzdFJlZjpkb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6OWNmOWMwYTUtYTk1Mi1iOTQ2LThiMWMtM2E2ZTkwMWRkZThjIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+AA==);
            }
`;
  const manaStyles = `
.icon-crystal {
                background: url(data:image/webp;base64,UklGRsACAABXRUJQVlA4WAoAAAAQAAAAIwAAIQAAQUxQSNEAAAABgGLb1vLmhiPRoWaScZkAJwMoqcqu6nYMdZGVVaQYHHl2JJn5+/n73/tGEBETAMeORlmH2zuSLTdzGul7Ti78RfOzLLekEX8lZbL/VN8jmWON/Cvq1BR0Yt7pVmN8C9lNa6wzNt43nnuPZaTx/kwBiP0xaTcAdjXunxbKgk07KV5q/P/7moq/Sih6p0RPKPCGMwVmURRsL15gk0s0AER+mdZgXeD5CNl4Xzn+OrCf4liH8xXdZ1SiIciGkD2g2oV04p/mOyGHRZoxuPSeUOzAEQBWUDggyAEAALAJAJ0BKiQAIgA+kTiZSKWjIiEuO/gAsBIJYwDJYQlSfcwDs2TNVb00Hx3tOaG7yySA9JAFJV8PSaFGjRYkTFODVD5WMCirbR/HFjkwQcuYzWec2/gAAP7739pzrCX4lbQ17C3TWGITMrcCfAoZpiEFUKaxy06jWHzahsnUlFZiRH42/Yi+CEBGmoHGfymxG048OQEnxWQUOthIavlu4a9h7wGUbN/ul+ALgA3G/72nldHJ41XtGUmb6Q9ehRSYTh3djQUBJRkqpujLFj/pqendwz/6VVIpYpIR7LjoTQJbdLAIx+91w/iYpOOjFNR9s/0zDLq5dp252qwmEW/IcKJFFCLXzrj6G69lFDbyAIMpu733rDVeOLoEkpk4m09aVJbluo1YTnVSc5aAl+Z6PDRmAzUY2vG4VcNEHMDiC9jx2hHVWYvzIvez+e9t7li3dLFBHMAObl8oNBs5beaySbPXVlnTURihUtBci8rJaQXcjwI48+ABjJA8NrDXtwcL97kPwCJalSUopoMM6wOjYdeuos4skzu2z3jzHA2IM7ne+b9xXuU1ekH9CrVfGAMqkHkZQFcpi9rkpEEgINXnLolYgGONbIAAAA==) center center / contain no-repeat;
                display: flex;
                justify-content: center;
                align-items: center;
                position: relative;
                z-index: 101;
                width: 3ch;
                height: 24px;
                left: -10px;
            }
            .icon-crystal p {
                position: relative;
                height: 100%;
                text-align: center;
                margin: 0;
                color: white;
                font-weight: bold;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: "Belwe_Bold", serif;
                text-shadow: #000000 1px 0 0, #000000 0.87759px 0.47943px 0, #000000 0.5403px 0.84147px 0, #000000 0.07074px 0.9975px 0, #000000 -0.41615px 0.9093px 0, #000000 -0.80115px 0.59847px 0, #000000 -0.98999px 0.14112px 0, #000000 -0.93646px -0.35079px 0, #000000 -0.65365px -0.7568px 0, #000000 -0.2108px -0.97753px 0, #000000 0.28366px -0.95893px 0, #000000 0.70867px -0.70554px 0, #000000 0.96017px -0.27942px 0;
            }
`;
  const adStyles = `
.container.is-fluid { padding: 0; }
/* ... */.container.is-fluid {
                padding: 0;
            }
            @media only screen and (min-width: 1025px) {
                .container.space-for-ads {
                    padding-right: 0 !important;
                }
            }
            #items_viewport, #deck_stats_viewport{
                width: 90%;
                margin: 0 auto;
            }
`;
  const titleStyles = `
            div.title.is-2 {
                font-size: 19px;
                color: #614326;
                white-space: nowrap;
                width: 300px;
                height: 50px;
                line-height: 50px;
                text-align: center;
                margin: 30px auto;
                position: relative;
                background: url(data:image/webp;base64,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) center center no-repeat;
            }
`;
  const subStyles = `
 div.new_subtitle {
            text-align: center;
            color: #614326;
            font-size: 14px;
        }

        div.new_subtitle a{
            text-decoration: underline;
            color: #725a37;
            font-weight: bold;
        }
        div.new_subtitle a:hover {
            color: #e22c14;
        }
`;
  const runeStyles = `
 /* 死骑符文容器 */
            .rune-container {
                float: right;
            }
            /* 死骑符文颜色 */
            .rune-blood {
                display: inline-block;
                background: rgb(239, 102, 102);
                height: 8px;width: 8px;
                transform: translateY(-1px) rotate(45deg);
                margin: 0px 2px;
                box-shadow: rgb(30, 30, 30) 0px 0px 2px inset;
            }
            .rune-frost {
                display: inline-block;
                width: 10px;
                height: 10px;
                margin: 0px 2px;
                box-shadow: rgb(30, 30, 30) 0px 0px 2px inset;
                background: rgb(78, 188, 230);border-radius: 50%;
            }
            .rune-unholy {
                display: inline-block;
                background: rgb(111, 218, 88);
                width: 10px;
                height: 10px;
                margin: 0px 2px;
                box-shadow: rgb(30, 30, 30) 0px 0px 2px inset;
            }
`;
  const tableStyles = `
.table {
            background-color: #e9d8ac;
            color: #614326;
        }
        .content table thead td, .content table thead th, .table thead td, .table thead th {

            font-size: 16px;
            color: #614326;
            background-color:#e8d3a6;
            border-bottom: 2px solid #caae85;
        }
            .content table td, .content table th, .table td, .table th {
            border-bottom: 1px solid #caae85;

        }
            .table.is-striped tbody tr:not(.is-selected):nth-child(even) {
            background-color: #dbc99e
        }
            table.table.is-fullwidth {
            width:90%;
            margin:0 auto 0 0;
            }
            table a {
            color: #614326;
            }
            table a:hover {
            color: #e22c14;
            }
            table.hsguru-streamer-decks-table,
            table.table.is-fullwidth.hsguru-streamer-decks-table {
            width: calc(100% - 32px);
            margin: 16px auto 0;
            border-collapse: separate;
            border-spacing: 0;
            table-layout: fixed;
            border: 1px solid #b9aa8b;
            background: #efe1bc;
            box-shadow: rgba(40, 30, 18, 0.08) 0 8px 18px;
            }
            table.hsguru-streamer-decks-table thead th {
            position: sticky;
            top: 0;
            z-index: 3;
            background: #d8c394;
            color: #3d2b16;
            font-size: 13px;
            font-weight: 700;
            padding: 8px 10px;
            border-right: 1px solid #b9aa8b;
            border-bottom: 2px solid #9e7d55;
            white-space: nowrap;
            vertical-align: middle;
            }
            table.hsguru-streamer-decks-table tbody td {
            padding: 8px 10px;
            border-right: 1px solid #caae85;
            border-bottom: 1px solid #caae85;
            color: #3a2a18;
            vertical-align: middle;
            }
            table.hsguru-streamer-decks-table tbody tr:nth-child(even) {
            background: #e2d0a6;
            }
            table.hsguru-streamer-decks-table tbody tr:hover {
            background: #f0dfb9;
            }
            table.hsguru-streamer-decks-table td:first-child,
            table.hsguru-streamer-decks-table td.hsguru-streamer-deck-cell {
            width: 16%;
            min-width: 240px;
            max-width: 280px;
            }
            table.hsguru-streamer-decks-table tbody tr:nth-child(odd) td.hsguru-streamer-deck-cell {
            background: linear-gradient(90deg, rgba(255, 248, 225, 0.98), rgba(245, 232, 198, 0.92)) !important;
            }
            table.hsguru-streamer-decks-table tbody tr:nth-child(even) td.hsguru-streamer-deck-cell {
            background: linear-gradient(90deg, rgba(246, 232, 194, 0.98), rgba(226, 205, 156, 0.94)) !important;
            }
            table.hsguru-streamer-decks-table td.hsguru-streamer-deck-cell {
            --hsguru-streamer-accent: #9a8768;
            padding: 7px 10px;
            border-right: 1px solid #caae85;
            border-bottom: 1px solid #caae85;
            border-left: 5px solid var(--hsguru-streamer-accent) !important;
            color: #1f1409;
            }
            table.hsguru-streamer-decks-table td:first-child .decklist-card-container {
            width: 100%;
            max-width: none;
            min-height: 28px;
            border: 0;
            box-shadow: none;
            filter: saturate(0.82) brightness(1.08);
            }
            table.hsguru-streamer-decks-table td:first-child .decklist-info {
            position: relative;
            width: 100%;
            max-width: 100%;
            min-height: 34px;
            margin: 0 !important;
            padding: 0;
            box-sizing: border-box;
            overflow: hidden;
            border: 0;
            border-radius: 0;
            background: transparent !important;
            box-shadow: none;
            color: #241609;
            }
            table.hsguru-streamer-decks-table td:first-child .decklist-info::before {
            content: none;
            }
            table.hsguru-streamer-decks-table td:first-child .decklist-info.death-knight,
            table.hsguru-streamer-decks-table td:first-child .decklist-info.deathknight {
            --hsguru-streamer-accent: #c51e35;
            }
            table.hsguru-streamer-decks-table td:first-child .decklist-info.demon-hunter,
            table.hsguru-streamer-decks-table td:first-child .decklist-info.demonhunter {
            --hsguru-streamer-accent: #5aa832;
            }
            table.hsguru-streamer-decks-table td:first-child .decklist-info.druid {
            --hsguru-streamer-accent: #c67a2d;
            }
            table.hsguru-streamer-decks-table td:first-child .decklist-info.hunter {
            --hsguru-streamer-accent: #5a9f44;
            }
            table.hsguru-streamer-decks-table td:first-child .decklist-info.mage {
            --hsguru-streamer-accent: #36b9d4;
            }
            table.hsguru-streamer-decks-table td:first-child .decklist-info.paladin {
            --hsguru-streamer-accent: #d8c936;
            }
            table.hsguru-streamer-decks-table td:first-child .decklist-info.priest {
            --hsguru-streamer-accent: #b8ad98;
            }
            table.hsguru-streamer-decks-table td:first-child .decklist-info.rogue {
            --hsguru-streamer-accent: #d3b63b;
            }
            table.hsguru-streamer-decks-table td:first-child .decklist-info.shaman {
            --hsguru-streamer-accent: #1581cf;
            }
            table.hsguru-streamer-decks-table td:first-child .decklist-info.warlock {
            --hsguru-streamer-accent: #a931c7;
            }
            table.hsguru-streamer-decks-table td:first-child .decklist-info.warrior {
            --hsguru-streamer-accent: #bf8a55;
            }
            table.hsguru-streamer-decks-table td:first-child .decklist-info .level.is-mobile {
            position: relative;
            z-index: 2;
            display: grid;
            grid-template-columns: 26px minmax(0, 1fr) 26px;
            align-items: center;
            gap: 4px;
            min-height: 32px;
            margin: 0;
            padding: 3px 6px 3px 10px;
            }
            table.hsguru-streamer-decks-table td:first-child .decklist-info .level-left,
            table.hsguru-streamer-decks-table td:first-child .decklist-info .level-right {
            min-width: 0;
            margin: 0;
            justify-content: center;
            }
            table.hsguru-streamer-decks-table td:first-child .decklist-info .deck-title {
            margin: 0;
            max-width: 100%;
            font-size: 15px;
            line-height: 1.15;
            font-weight: 700;
            text-align: left;
            }
            table.hsguru-streamer-decks-table td:first-child .decklist-info .deck-title a {
            display: inline-block;
            max-width: 100%;
            overflow: hidden;
            color: #1f1409 !important;
            text-overflow: ellipsis;
            text-shadow: none;
            vertical-align: bottom;
            white-space: nowrap;
            }
            table.hsguru-streamer-decks-table td:first-child .decklist-info .clip-btn-value,
            table.hsguru-streamer-decks-table td:first-child .decklist-info .level-right .is-clickable {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            padding: 0;
            border: 0;
            background: transparent;
            color: rgba(48, 34, 20, 0.88);
            }
            table.hsguru-streamer-decks-table td:first-child .decklist-info .icon.is-small,
            table.hsguru-streamer-decks-table td:first-child .decklist-info svg.icon {
            width: 18px;
            height: 18px;
            }
            table.hsguru-streamer-decks-table td:first-child .decklist-info:hover {
            background: transparent !important;
            }
            table.hsguru-streamer-decks-table th:nth-child(2),
            table.hsguru-streamer-decks-table td:nth-child(2) {
            width: 16%;
            }
            table.hsguru-streamer-decks-table th:nth-child(3),
            table.hsguru-streamer-decks-table td:nth-child(3) {
            width: 6%;
            }
            table.hsguru-streamer-decks-table th:nth-child(4),
            table.hsguru-streamer-decks-table td:nth-child(4),
            table.hsguru-streamer-decks-table th:nth-child(5),
            table.hsguru-streamer-decks-table td:nth-child(5),
            table.hsguru-streamer-decks-table th:nth-child(6),
            table.hsguru-streamer-decks-table td:nth-child(6) {
            width: 8%;
            }
            table.hsguru-streamer-decks-table th:nth-child(7),
            table.hsguru-streamer-decks-table td:nth-child(7) {
            width: 9%;
            }
            table.hsguru-streamer-decks-table th:nth-child(8),
            table.hsguru-streamer-decks-table td:nth-child(8) {
            width: 10%;
            }
            table.hsguru-streamer-decks-table th:nth-child(9),
            table.hsguru-streamer-decks-table td:nth-child(9) {
            width: 19%;
            }
            table.hsguru-streamer-decks-table td:first-child .decklist-card-gradient,
            table.hsguru-streamer-decks-table td:first-child .decklist-card-background {
            background: rgba(255, 246, 216, 0.72) !important;
            color: #17110a !important;
            text-shadow: 0 1px 0 rgba(255, 255, 255, 0.55);
            }
            table.hsguru-streamer-decks-table td:first-child .card-name {
            font-weight: 700;
            text-align: center;
            }
            table.hsguru-streamer-decks-table td:first-child .decklist-card-tile {
            opacity: 0.28;
            }
            table.hsguru-streamer-decks-table td:first-child .rune-container {
            position: relative;
            z-index: 2;
            }
            table.hsguru-streamer-decks-table td:nth-child(2) a {
            font-weight: 700;
            color: #553719;
            }
            table.hsguru-streamer-decks-table .tag {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 5px;
            color: #111;
            font-weight: 700;
            }
            table.hsguru-streamer-decks-table .legend-rank {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 58px;
            height: 24px;
            padding: 0 6px;
            box-sizing: border-box;
            background: #f4ead1;
            border: 1px solid #b9aa8b;
            color: #3d2b16;
            }
            table.hsguru-streamer-decks-table .hsguru-streamer-empty-rank {
            color: #796a54;
            font-size: 12px;
            font-weight: 600;
            }
            table.hsguru-streamer-decks-table td:nth-child(7) .tag {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 70px;
            height: 24px;
            padding: 0 6px;
            box-sizing: border-box;
            }
            table.hsguru-streamer-decks-table .icon.tag.is-link {
            width: 24px;
            height: 24px;
            min-width: 24px;
            padding: 0;
            background: #5b4124;
            color: #f8edcf;
            border: 1px solid #2d2115;
            vertical-align: middle;
            }
            table.hsguru-streamer-decks-table td:nth-child(8) {
            white-space: nowrap;
            }
            table.hsguru-streamer-decks-table td:nth-child(8) a {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            height: 24px;
            vertical-align: middle;
            }
            table.hsguru-streamer-decks-table td:nth-child(8) a .tag:not(.icon) {
            min-height: 24px;
            height: 24px;
            padding: 0 8px;
            }
            table.hsguru-streamer-decks-table time.datetime-human {
            color: #4b3a25;
            font-size: 12px;
            white-space: nowrap;
            }
            #deck_stats_viewport .decklist-info,
            .card > .card-image .decklist-info,
            table.hsguru-meta-table .decklist-info {
            --hsguru-class-accent: #9a8768;
            }
            #deck_stats_viewport .decklist-info.deathknight,
            .card > .card-image .decklist-info.deathknight,
            table.hsguru-meta-table .decklist-info.deathknight {
            --hsguru-class-accent: #c51e35;
            }
            #deck_stats_viewport .decklist-info.demonhunter,
            .card > .card-image .decklist-info.demonhunter,
            table.hsguru-meta-table .decklist-info.demonhunter {
            --hsguru-class-accent: #5aa832;
            }
            #deck_stats_viewport .decklist-info.druid,
            .card > .card-image .decklist-info.druid,
            table.hsguru-meta-table .decklist-info.druid {
            --hsguru-class-accent: #c67a2d;
            }
            #deck_stats_viewport .decklist-info.hunter,
            .card > .card-image .decklist-info.hunter,
            table.hsguru-meta-table .decklist-info.hunter {
            --hsguru-class-accent: #5a9f44;
            }
            #deck_stats_viewport .decklist-info.mage,
            .card > .card-image .decklist-info.mage,
            table.hsguru-meta-table .decklist-info.mage {
            --hsguru-class-accent: #36b9d4;
            }
            #deck_stats_viewport .decklist-info.paladin,
            .card > .card-image .decklist-info.paladin,
            table.hsguru-meta-table .decklist-info.paladin {
            --hsguru-class-accent: #d8c936;
            }
            #deck_stats_viewport .decklist-info.priest,
            .card > .card-image .decklist-info.priest,
            table.hsguru-meta-table .decklist-info.priest {
            --hsguru-class-accent: #b8ad98;
            }
            #deck_stats_viewport .decklist-info.rogue,
            .card > .card-image .decklist-info.rogue,
            table.hsguru-meta-table .decklist-info.rogue {
            --hsguru-class-accent: #d3b63b;
            }
            #deck_stats_viewport .decklist-info.shaman,
            .card > .card-image .decklist-info.shaman,
            table.hsguru-meta-table .decklist-info.shaman {
            --hsguru-class-accent: #1581cf;
            }
            #deck_stats_viewport .decklist-info.warlock,
            .card > .card-image .decklist-info.warlock,
            table.hsguru-meta-table .decklist-info.warlock {
            --hsguru-class-accent: #a931c7;
            }
            #deck_stats_viewport .decklist-info.warrior,
            .card > .card-image .decklist-info.warrior,
            table.hsguru-meta-table .decklist-info.warrior {
            --hsguru-class-accent: #bf8a55;
            }
            #deck_stats_viewport .card,
            .card:has(> .card-image .decklist-info),
            .hsguru-deck-card-shell {
            border: 2px solid #433829;
            border-radius: 10px;
            background: #3b3329;
            box-shadow: rgba(38, 28, 17, 0.18) 0 8px 18px;
            }
            #deck_stats_viewport .card .decklist-info:not(.dust-bar),
            .card > .card-image .decklist-info:not(.dust-bar),
            .hsguru-deck-summary {
            width: var(--decklist-width);
            height: 30px !important;
            min-height: 30px !important;
            margin: 0 !important;
            overflow: hidden;
            border: 1px solid rgba(80, 61, 38, 0.42);
            border-left: 5px solid var(--hsguru-class-accent) !important;
            border-radius: 6px 6px 0 0;
            background: linear-gradient(90deg, rgba(255, 248, 225, 0.98), rgba(237, 224, 193, 0.94)) !important;
            color: #1f1409;
            }
            #deck_stats_viewport .card .decklist-info:not(.dust-bar) .level.is-mobile,
            .card > .card-image .decklist-info:not(.dust-bar) .level.is-mobile,
            .hsguru-deck-summary-row {
            display: grid !important;
            grid-template-columns: 22px minmax(0, 1fr) 22px;
            align-items: center !important;
            gap: 4px;
            height: 28px !important;
            min-height: 28px !important;
            margin: 0 !important;
            padding: 2px 6px !important;
            }
            #deck_stats_viewport .card .decklist-info:not(.dust-bar) .level-left,
            #deck_stats_viewport .card .decklist-info:not(.dust-bar) .level-right,
            .card > .card-image .decklist-info:not(.dust-bar) .level-left,
            .card > .card-image .decklist-info:not(.dust-bar) .level-right,
            .hsguru-deck-summary-row > div {
            min-width: 0;
            height: 22px !important;
            min-height: 22px !important;
            margin: 0 !important;
            align-items: center !important;
            justify-content: center !important;
            }
            #deck_stats_viewport .card .decklist-info:not(.dust-bar) .level-left,
            .card > .card-image .decklist-info:not(.dust-bar) .level-left,
            .hsguru-deck-summary-row .level-left {
            width: 100% !important;
            justify-content: flex-start !important;
            }
            #deck_stats_viewport .card .decklist-info:not(.dust-bar) .deck-title,
            .card > .card-image .decklist-info:not(.dust-bar) .deck-title,
            .hsguru-deck-summary-title {
            display: flex !important;
            align-items: center !important;
            width: 100% !important;
            height: 22px !important;
            min-height: 22px !important;
            margin: 0 !important;
            overflow: hidden;
            text-align: left;
            }
            #deck_stats_viewport .card .decklist-info:not(.dust-bar) .deck-title a,
            .card > .card-image .decklist-info:not(.dust-bar) .deck-title a,
            .hsguru-deck-summary-title a {
            display: block !important;
            overflow: hidden;
            color: #1f1409 !important;
            font-family: var(--hsguru-font-serif);
            font-size: 13px;
            font-weight: 700;
            line-height: 22px !important;
            text-overflow: ellipsis;
            text-shadow: none;
            white-space: nowrap;
            }
            .hsguru-deck-summary-title > span {
            display: flex !important;
            align-items: center !important;
            min-width: 0;
            width: 100%;
            height: 22px !important;
            line-height: 22px !important;
            }
            .hsguru-hidden-deck-code {
            display: none !important;
            height: 0 !important;
            line-height: 0 !important;
            }
            #deck_stats_viewport .card .decklist-info:not(.dust-bar) .clip-btn-value,
            #deck_stats_viewport .card .decklist-info:not(.dust-bar) .level-right .is-clickable,
            .card > .card-image .decklist-info:not(.dust-bar) .clip-btn-value,
            .card > .card-image .decklist-info:not(.dust-bar) .level-right .is-clickable,
            .hsguru-deck-icon-button {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 22px;
            height: 22px;
            padding: 0;
            border: 0;
            background: transparent;
            color: rgba(48, 34, 20, 0.88);
            }
            #deck_stats_viewport .card .decklist-info:not(.dust-bar) .icon.is-small,
            #deck_stats_viewport .card .decklist-info:not(.dust-bar) svg.icon,
            .card > .card-image .decklist-info:not(.dust-bar) .icon.is-small,
            .card > .card-image .decklist-info:not(.dust-bar) svg.icon,
            .hsguru-deck-icon-button .icon.is-small,
            .hsguru-deck-icon-button svg {
            width: 16px;
            height: 16px;
            }
            #deck_stats_viewport .card .dust-bar.decklist-info,
            .card > .card-image .dust-bar.decklist-info,
            .hsguru-deck-dust-bar {
            width: var(--decklist-width);
            min-height: 24px;
            margin: 4px 0 0;
            border: 1px solid rgba(80, 61, 38, 0.34);
            border-left: 5px solid var(--hsguru-class-accent) !important;
            border-radius: 0 0 6px 6px;
            background: linear-gradient(90deg, rgba(255, 248, 225, 0.98), rgba(237, 224, 193, 0.94)) !important;
            color: #1f1409;
            }
            #deck_stats_viewport .card .dust-bar-inner,
            .card > .card-image .dust-bar-inner {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            width: 100%;
            min-height: 22px;
            font-size: 13px;
            font-weight: 700;
            line-height: 22px;
            }
            #deck_stats_viewport .card .dust-bar .icon,
            .card > .card-image .dust-bar .icon {
            width: 16px;
            height: 16px;
            }
            #deck_stats_viewport .card .dust-bar img,
            .card > .card-image .dust-bar img {
            width: 16px;
            height: 16px;
            object-fit: contain;
            }
            table.hsguru-meta-table {
            border-collapse: separate;
            border-spacing: 0;
            border: 1px solid #c4aa71;
            background: #efe1bc;
            }
            table.hsguru-meta-table thead th {
            background: #d8c394;
            color: #3d2b16;
            border-bottom: 2px solid #9e7d55;
            }
            table.hsguru-meta-table tbody tr:nth-child(odd) td:not(.hsguru-meta-archetype-cell) {
            background: #efe1bc;
            }
            table.hsguru-meta-table tbody tr:nth-child(even) td:not(.hsguru-meta-archetype-cell) {
            background: #dbc99e;
            }
            table.hsguru-meta-table tbody tr:nth-child(odd) td.hsguru-meta-archetype-cell {
            background: linear-gradient(90deg, rgba(255, 248, 225, 0.98), rgba(245, 232, 198, 0.92)) !important;
            }
            table.hsguru-meta-table tbody tr:nth-child(even) td.hsguru-meta-archetype-cell {
            background: linear-gradient(90deg, rgba(246, 232, 194, 0.98), rgba(226, 205, 156, 0.94)) !important;
            }
            table.hsguru-meta-table td.hsguru-meta-archetype-cell {
            width: 220px;
            min-width: 220px;
            padding: 7px 10px;
            border-right: 1px solid #caae85;
            border-bottom: 1px solid #caae85;
            border-left: 5px solid var(--hsguru-class-accent) !important;
            color: #1f1409;
            }
            table.hsguru-meta-table td.hsguru-meta-archetype-cell .deck-title {
            display: block;
            width: auto;
            overflow: hidden;
            color: #1f1409 !important;
            font-family: var(--hsguru-font-serif);
            font-size: 15px;
            font-weight: 700;
            line-height: 1.2;
            text-overflow: ellipsis;
            text-shadow: none;
            white-space: nowrap;
            }
            #matchups_table_wrapper.hsguru-matchups-wrapper {
            width: 100%;
            margin: 8px auto 0;
            padding: 0;
            overflow: auto;
            border: 1px solid #b9aa8b;
            border-radius: 0;
            background: transparent;
            box-shadow: none;
            scrollbar-color: #9e9279 #e4d7b8;
            }
            table.hsguru-matchups-table {
            width: max-content;
            min-width: 100%;
            margin: 0;
            border-collapse: separate;
            border-spacing: 0;
            color: #141413;
            background: #efe1bc;
            }
            table.table.is-fullwidth.hsguru-matchups-table {
            width: max-content;
            min-width: 100%;
            margin: 0;
            }
            table.hsguru-matchups-table thead th,
            table.hsguru-matchups-table tbody td {
            box-sizing: border-box;
            min-width: 64px;
            padding: 4px 6px;
            border-right: 1px solid #7c7c74;
            border-bottom: 1px solid #7c7c74;
            text-align: center;
            vertical-align: middle;
            font-size: 12px;
            line-height: 1.15;
            color: #141413;
            }
            table.hsguru-matchups-table thead th {
            position: sticky;
            top: 0;
            z-index: 5;
            background: #e8dfc7;
            color: #141413;
            }
            table.hsguru-matchups-table thead th.hsguru-matchups-corner-cell,
            table.hsguru-matchups-table thead th.hsguru-matchups-meta-header {
            background: #ddd3bb;
            color: #141413;
            }
            table.hsguru-matchups-table thead th.hsguru-matchups-corner-cell {
            position: sticky;
            left: 0;
            z-index: 7;
            min-width: 60px;
            width: 60px;
            height: 124px;
            padding: 0;
            vertical-align: bottom;
            }
            table.hsguru-matchups-table thead th.hsguru-matchups-meta-header {
            position: sticky;
            left: 60px;
            z-index: 7;
            min-width: 148px;
            width: 148px;
            height: 124px;
            padding: 0;
            vertical-align: bottom;
            }
            table.hsguru-matchups-table th.hsguru-matchups-deck-header {
            box-shadow: inset 1px 0 0 #cfbd94, inset 0 -1px 0 #c6ad7b;
            background-clip: padding-box;
            border-color: #c6ad7b !important;
            color: #141413;
            font-family: var(--hsguru-font-serif);
            font-weight: 700;
            min-width: 86px;
            max-width: 118px;
            padding: 4px 6px;
            text-align: left;
            white-space: normal;
            word-break: keep-all;
            }
            table.hsguru-matchups-table th.hsguru-matchups-deck-header .hsguru-matchups-action {
            justify-content: flex-start;
            width: 100%;
            min-height: 23px;
            padding: 0 3px 0 6px;
            overflow: hidden;
            border: 0;
            background: transparent;
            box-shadow: none;
            color: #1f1409;
            font-family: var(--hsguru-font-serif);
            font-size: 13px;
            font-weight: 700;
            line-height: 1.1;
            text-align: left;
            text-overflow: ellipsis;
            white-space: normal;
            }
            table.hsguru-matchups-table th.hsguru-matchups-deck-header .hsguru-matchups-action:hover {
            background: rgba(255, 255, 255, 0.28);
            transform: none;
            }
            table.hsguru-matchups-table td.hsguru-matchups-winrate-cell,
            table.hsguru-matchups-table td.hsguru-matchups-archetype-cell {
            background: #f7edcf;
            color: #141413;
            }
            table.hsguru-matchups-table td.hsguru-matchups-winrate-cell {
            min-width: 60px;
            width: 60px;
            font-weight: 700;
            }
            table.hsguru-matchups-table td.hsguru-matchups-archetype-cell {
            box-shadow: inset 1px 0 0 #cfbd94, 4px 0 0 rgba(20, 20, 19, 0.08);
            background-clip: padding-box;
            border-color: #c6ad7b !important;
            font-family: var(--hsguru-font-serif);
            font-weight: 700;
            min-width: 148px;
            width: 148px;
            padding: 4px 8px 4px 10px;
            text-align: left;
            white-space: nowrap;
            }
            table.hsguru-matchups-table td.hsguru-matchups-deck-cell {
            box-shadow: inset 1px 0 0 #cfbd94;
            background-clip: padding-box;
            border-color: #c6ad7b !important;
            color: #141413;
            font-family: var(--hsguru-font-serif);
            font-weight: 700;
            min-width: 148px;
            width: 148px;
            padding: 4px 8px 4px 10px;
            text-align: left;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            }
            table.hsguru-matchups-table th.hsguru-matchups-deck-header.class-background,
            table.hsguru-matchups-table td.hsguru-matchups-deck-cell.class-background,
            table.hsguru-matchups-table td.hsguru-matchups-archetype-cell.class-background {
            border-top-color: #d8c89f !important;
            border-right-color: #bda474 !important;
            border-bottom-color: #bda474 !important;
            border-left-color: #d8c89f !important;
            }
            table.hsguru-matchups-table td.hsguru-matchups-deck-cell button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            margin: 0 5px 0 0;
            padding: 0;
            border: 0;
            background: transparent;
            color: rgba(48, 34, 20, 0.88);
            vertical-align: middle;
            }
            table.hsguru-matchups-table td.hsguru-matchups-deck-cell .icon,
            table.hsguru-matchups-table td.hsguru-matchups-deck-cell svg.icon {
            width: 18px;
            height: 18px;
            }
            table.hsguru-matchups-table .hsguru-matchups-sticky-col {
            position: sticky;
            left: 0;
            z-index: 4;
            box-shadow: 4px 0 0 rgba(20, 20, 19, 0.08);
            }
            table.hsguru-matchups-table .hsguru-matchups-sticky-col-2 {
            position: sticky;
            left: 60px;
            z-index: 4;
            box-shadow: 4px 0 0 rgba(20, 20, 19, 0.08);
            }
            table.hsguru-matchups-table td.hsguru-matchups-deck-cell.hsguru-matchups-sticky-col-2,
            table.hsguru-matchups-table td.hsguru-matchups-archetype-cell.hsguru-matchups-sticky-col-2 {
            box-shadow: inset 1px 0 0 #cfbd94, 4px 0 0 rgba(20, 20, 19, 0.08);
            }
            table.hsguru-matchups-table .hsguru-matchups-action {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 22px;
            border: 1px solid #b8aa8c;
            border-radius: 5px;
            background: #fbf8ef;
            color: #2f2d28;
            padding: 2px 6px;
            font-size: 11px;
            font-weight: 600;
            line-height: 1.1;
            box-shadow: none;
            transition: background-color 0.18s ease, border-color 0.18s ease;
            }
            table.hsguru-matchups-table .hsguru-matchups-action:hover {
            background: #f1e8d0;
            border-color: #92846b;
            transform: none;
            box-shadow: none;
            }
            table.hsguru-matchups-table .hsguru-matchups-action-winrate:hover {
            transform: translateX(-50%) translateY(-50%);
            }
            table.hsguru-matchups-table .hsguru-matchups-action-winrate {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translateX(-50%) translateY(-50%);
            white-space: nowrap;
            }
            table.hsguru-matchups-table .hsguru-matchups-action-fill,
            table.hsguru-matchups-table .hsguru-matchups-action-reset {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            }
            table.hsguru-matchups-table .hsguru-matchups-action-fill:hover,
            table.hsguru-matchups-table .hsguru-matchups-action-reset:hover {
            transform: translateY(-50%);
            }
            table.hsguru-matchups-table .hsguru-matchups-action-fill {
            left: 4px;
            right: auto;
            }
            table.hsguru-matchups-table .hsguru-matchups-action-reset {
            right: 4px;
            left: auto;
            }
            table.hsguru-matchups-table .hsguru-matchups-action-usage {
            position: absolute;
            left: 4px;
            top: calc(50% + 37.5px);
            }
            table.hsguru-matchups-table .hsguru-matchups-action-archetype {
            position: absolute;
            right: 4px;
            top: calc(50% + 37.5px);
            }
            table.hsguru-matchups-table .hsguru-matchups-meta-separator {
            position: absolute;
            left: 50%;
            top: calc(50% + 37.5px);
            transform: translateX(-50%);
            font-size: 11px;
            font-weight: 600;
            color: #7a6a52;
            pointer-events: none;
            line-height: 22px;
            }
            table.hsguru-matchups-table .hsguru-matchups-heat-cell {
            font-weight: 600;
            color: #141413;
            }
            table.hsguru-matchups-table .hsguru-matchups-low-sample {
            color: #6d675b;
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0;
            }
            table.hsguru-matchups-table tbody tr:hover td:not(.hsguru-matchups-winrate-cell):not(.hsguru-matchups-archetype-cell):not(.hsguru-matchups-deck-cell) {
            filter: brightness(0.96);
            }
            table.hsguru-matchups-table input[type="number"] {
            width: 46px;
            height: 22px;
            margin-top: 2px;
            border: 1px solid #b8aa8c;
            border-radius: 4px;
            background: #fbf8ef;
            color: #141413;
            font-size: 11px;
            }
            table.hsguru-matchups-table input[type="number"]:focus {
            outline: none;
            border-color: #8d7658;
            box-shadow: 0 0 0 2px rgba(141, 118, 88, 0.14);
            }
`;
  function injectStyles() {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const styleModules = {
      TABLE_STYLE: ((_a = FEATURES.TABLE_STYLE) == null ? void 0 : _a.enabled)
        ? tableStyles
        : "",
      UI: ((_b = FEATURES.UI) == null ? void 0 : _b.enabled) ? uiStyles : "",
      FILTER_STYLE: ((_c = FEATURES.FILTER_STYLE) == null ? void 0 : _c.enabled)
        ? filterStyles
        : "",
      MANA: ((_d = FEATURES.MANA) == null ? void 0 : _d.enabled)
        ? manaStyles
        : "",
      AD: ((_e = FEATURES.AD) == null ? void 0 : _e.enabled) ? adStyles : "",
      TITLE_STYLE: ((_f = FEATURES.TITLE_STYLE) == null ? void 0 : _f.enabled)
        ? titleStyles
        : "",
      SUB_STYLE: ((_g = FEATURES.SUB_STYLE) == null ? void 0 : _g.enabled)
        ? subStyles
        : "",
      RUNE: ((_h = FEATURES.RUNE) == null ? void 0 : _h.enabled)
        ? runeStyles
        : "",
    };
    const enabledStyles = Object.values(styleModules)
      .filter(Boolean)
      .join("\n");
    if (enabledStyles) {
      const style = document.createElement("style");
      style.textContent = enabledStyles;
      document.head.appendChild(style);
    }
  }
  function setupDOMTranslationObserver() {
    const observer = new MutationObserver(() => {
      queryCache.clear();
      initializeFeatures();
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["placeholder"],
    });
  }
  function setupEventListeners() {
    document.body.addEventListener("click", (event) => {
      if (
        event.target.matches("a.dropdown-item") ||
        event.target.closest("a.dropdown-item")
      ) {
        setTimeout(() => {
          queryCache.clear();
          handleDeck();
          handleCard();
        }, 1e3);
      }
    });
    document.body.addEventListener("mouseover", (event) => {
      const cardRow = event.target.closest(".tw-relative");
      const cardNameElement =
        cardRow?.querySelector(SELECTORS.CARD_NAME) ||
        event.target.closest(SELECTORS.CARD_NAME);
      if (!cardNameElement) return;
      const originalName =
        cardNameElement.dataset.originalCardName ||
        cardNameElement.textContent.trim();
      showChineseCardPreview(originalName, event.clientX, event.clientY);
    });
    document.body.addEventListener("mousemove", (event) => {
      const cardRow = event.target.closest(".tw-relative");
      const cardNameElement =
        cardRow?.querySelector(SELECTORS.CARD_NAME) ||
        event.target.closest(SELECTORS.CARD_NAME);
      if (!cardNameElement) return;
      moveChineseCardPreview(event.clientX, event.clientY);
    });
    document.body.addEventListener("mouseout", (event) => {
      const cardRow = event.target.closest(".tw-relative");
      if (!cardRow || !cardRow.querySelector(SELECTORS.CARD_NAME)) return;
      const nextCardRow = event.relatedTarget?.closest?.(".tw-relative");
      if (nextCardRow === cardRow) return;
      hideChineseCardPreview();
    });
  }
  function createTranslationItemElement(original, translation, type = "DECK") {
    const item = document.createElement("div");
    item.className = `hsguru-feature-card custom-translation-item ${type === "CARD" ? "card-item" : "deck-item"}`;
    item.innerHTML = `
    <input type="checkbox" class="hsguru-checkbox custom-item-checkbox" data-original="${original}" data-type="${type}">
    <div class="hsguru-feature-info">
      <div class="hsguru-feature-name">${original}</div>
    </div>
    <div style="display: flex; align-items: center;">
      <input type="text" class="hsguru-input custom-translation-input" data-original="${original}" data-type="${type}" value="${translation}" placeholder="输入中文翻译">
      <button type="button" class="hsguru-delete-btn" data-original="${original}" data-type="${type}" title="删除">&times;</button>
    </div>
  `;
    const deleteBtn = item.querySelector(".hsguru-delete-btn");
    deleteBtn.onclick = () => {
      if (confirm(`确定要删除 "${original}" 的翻译记录吗？`)) {
        if (type === "CARD") {
          deleteCustomCardTranslation(original);
        } else {
          deleteCustomTranslation(original);
        }
        item.remove();
        updateMergeBtnVisibility(type);
      }
    };
    const checkbox = item.querySelector(".custom-item-checkbox");
    checkbox.onchange = () => updateMergeBtnVisibility(type);
    return item;
  }
  function updateMergeBtnVisibility(type = "DECK") {
    const modal = document.getElementById("hsguru-config-modal");
    if (!modal) return;
    const mergeBtn = document.getElementById(
      type === "CARD" ? "hsguru-merge-card" : "hsguru-merge-custom",
    );
    if (!mergeBtn) return;
    const checkedCount = modal.querySelectorAll(
      `.custom-item-checkbox[data-type="${type}"]:checked`,
    ).length;
    mergeBtn.style.display = checkedCount >= 2 ? "block" : "none";
  }
  function createConfigModal() {
    if (document.getElementById("hsguru-config-modal")) return;
    const modal = document.createElement("div");
    modal.id = "hsguru-config-modal";
    modal.className = "hsguru-modal";
    const style = document.createElement("style");
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
    let tabsHtml = "";
    let contentsHtml = "";
    Object.keys(CATEGORIES).forEach((catId, index) => {
      const catName = CATEGORIES[catId];
      const isActive = index === 0 ? "active" : "";
      tabsHtml += `<div class="hsguru-tab-item ${isActive}" data-tab="${catId}">${catName}</div>`;
      let featuresHtml = "";
      Object.keys(FEATURES).forEach((featId) => {
        const feat = FEATURES[featId];
        if (feat.category === catId) {
          featuresHtml += `
          <div class="hsguru-feature-card">
            <div class="hsguru-feature-info">
              <div class="hsguru-feature-name">${feat.name}</div>
              <div class="hsguru-feature-desc">${feat.description || ""}</div>
            </div>
            <label class="hsguru-switch">
              <input type="checkbox" id="enable_${featId}" ${feat.enabled ? "checked" : ""}>
              <span class="hsguru-slider"></span>
            </label>
          </div>
        `;
        }
      });
      contentsHtml += `
      <div class="hsguru-tab-content ${isActive}" id="tab-content-${catId}">
        ${featuresHtml}
      </div>
    `;
    });
    tabsHtml += `<div class="hsguru-tab-item" data-tab="CUSTOM_DECK">自定义卡组翻译</div>`;
    tabsHtml += `<div class="hsguru-tab-item" data-tab="CUSTOM_CARD">自定义卡牌翻译</div>`;
    contentsHtml += `
    <div class="hsguru-tab-content" id="tab-content-CUSTOM_DECK">
      <div class="hsguru-custom-actions">
        <button type="button" class="hsguru-btn hsguru-btn-success" id="hsguru-add-deck">新增组合词</button>
        <button type="button" class="hsguru-btn hsguru-btn-primary" id="hsguru-merge-custom" style="display: none;">合并所选单词</button>
      </div>
      <div class="hsguru-custom-list" id="hsguru-deck-list"></div>
    </div>
    <div class="hsguru-tab-content" id="tab-content-CUSTOM_CARD">
      <div class="hsguru-custom-actions">
        <button type="button" class="hsguru-btn hsguru-btn-success" id="hsguru-add-card">新增卡牌翻译</button>
        <button type="button" class="hsguru-btn hsguru-btn-primary" id="hsguru-merge-card" style="display: none;">合并所选单词</button>
      </div>
      <div class="hsguru-custom-list" id="hsguru-card-list"></div>
    </div>
  `;
    modal.innerHTML = `
    <div class="hsguru-modal-dialog">
      <div class="hsguru-modal-header">
        <div class="hsguru-modal-header-copy">
          <p class="hsguru-modal-eyebrow">HSGuru Chinese Plus Companion</p>
          <h5 class="hsguru-modal-title">插件配置</h5>
          <p class="hsguru-modal-subtitle">按分类管理美化、翻译和增强功能，并在右侧维护自定义词库，让站点界面更接近中文使用习惯。</p>
        </div>
        <button type="button" id="hsguru-close-config" class="hsguru-close-btn">&times;</button>
      </div>
      <div class="hsguru-modal-body">
        <div class="hsguru-sidebar">
          <div class="hsguru-sidebar-intro">
            <div class="hsguru-sidebar-title">功能分组</div>
            <p class="hsguru-sidebar-note">左侧切换模块，右侧即时调整。自定义翻译词库会持久化到本地浏览器存储。</p>
          </div>
          ${tabsHtml}
        </div>
        <div class="hsguru-content">
          ${contentsHtml}
        </div>
      </div>
      <div class="hsguru-modal-footer">
        <button type="button" class="hsguru-btn hsguru-btn-secondary" id="hsguru-cancel-config">取消</button>
        <button type="button" class="hsguru-btn hsguru-btn-primary" id="hsguru-save-config">保存并刷新</button>
      </div>
    </div>
  `;
    document.body.appendChild(modal);
    const deckListContainer = modal.querySelector("#hsguru-deck-list");
    const customDeckTranslations = getCustomTranslations();
    if (
      customDeckTranslations &&
      Object.keys(customDeckTranslations).length > 0
    ) {
      Object.keys(customDeckTranslations).forEach((original) => {
        const translation = customDeckTranslations[original];
        const item = createTranslationItemElement(
          original,
          translation,
          "DECK",
        );
        deckListContainer.appendChild(item);
      });
    } else {
      deckListContainer.innerHTML =
        '<div class="empty-message">暂无待翻译的卡组名称</div>';
    }
    const cardListContainer = modal.querySelector("#hsguru-card-list");
    const customCardTranslations2 = getCustomCardTranslations();
    if (
      customCardTranslations2 &&
      Object.keys(customCardTranslations2).length > 0
    ) {
      Object.keys(customCardTranslations2).forEach((original) => {
        const translation = customCardTranslations2[original];
        const item = createTranslationItemElement(
          original,
          translation,
          "CARD",
        );
        cardListContainer.appendChild(item);
      });
    } else {
      cardListContainer.innerHTML =
        '<div class="empty-message">暂无待翻译的卡牌名称</div>';
    }
    bindConfigModalEvents();
  }
  function bindConfigModalEvents() {
    const modal = document.getElementById("hsguru-config-modal");
    const closeBtn = document.getElementById("hsguru-close-config");
    const cancelBtn = document.getElementById("hsguru-cancel-config");
    const saveBtn = document.getElementById("hsguru-save-config");
    const tabs = modal.querySelectorAll(".hsguru-tab-item");
    const contents = modal.querySelectorAll(".hsguru-tab-content");
    tabs.forEach((tab) => {
      tab.onclick = () => {
        const tabId = tab.getAttribute("data-tab");
        tabs.forEach((t) => t.classList.remove("active"));
        contents.forEach((c) => c.classList.remove("active"));
        tab.classList.add("active");
        document.getElementById(`tab-content-${tabId}`).classList.add("active");
      };
    });
    const closeModal = () => (modal.style.display = "none");
    closeBtn.onclick = closeModal;
    cancelBtn.onclick = closeModal;
    window.addEventListener("click", (event) => {
      if (event.target === modal) closeModal();
    });
    const setupMergeLogic = (type) => {
      const btnId =
        type === "CARD" ? "hsguru-merge-card" : "hsguru-merge-custom";
      const mergeBtn = document.getElementById(btnId);
      mergeBtn.onclick = () => {
        const checked = Array.from(
          modal.querySelectorAll(
            `.custom-item-checkbox[data-type="${type}"]:checked`,
          ),
        );
        if (checked.length < 2) return;
        const words = checked.map((cb) => cb.getAttribute("data-original"));
        const combined = words.join(" ");
        const itemsToHide = checked.map((cb) =>
          cb.closest(".custom-translation-item"),
        );
        itemsToHide.forEach((item) => (item.style.display = "none"));
        const editRow = document.createElement("div");
        editRow.className = `hsguru-feature-card custom-translation-item edit-mode ${type === "CARD" ? "card-item" : "deck-item"}`;
        editRow.innerHTML = `
        <div class="hsguru-feature-info hsguru-edit-field-wrap">
          <input type="text" class="hsguru-input edit-original-input hsguru-edit-original-input" value="${combined}" placeholder="英文原名">
        </div>
        <div class="hsguru-edit-actions">
          <input type="text" class="hsguru-input edit-translation-input hsguru-edit-translation-input" placeholder="输入中文翻译">
          <button type="button" class="hsguru-btn hsguru-btn-primary hsguru-save-edit-btn hsguru-edit-save-btn">保存</button>
          <button type="button" class="hsguru-btn hsguru-btn-secondary hsguru-cancel-edit-btn hsguru-edit-cancel-btn">取消</button>
        </div>
      `;
        itemsToHide[0].parentNode.insertBefore(editRow, itemsToHide[0]);
        editRow.querySelector(".edit-translation-input").focus();
        const saveEditBtn = editRow.querySelector(".hsguru-save-edit-btn");
        const cancelEditBtn = editRow.querySelector(".hsguru-cancel-edit-btn");
        const originalInput = editRow.querySelector(".edit-original-input");
        const translationInput = editRow.querySelector(
          ".edit-translation-input",
        );
        saveEditBtn.onclick = () => {
          const newOriginal = originalInput.value.trim();
          const newTranslation = translationInput.value.trim();
          if (newOriginal && newTranslation) {
            if (type === "CARD") {
              saveCustomCardTranslation(newOriginal, newTranslation);
              const current = getCustomCardTranslations();
              words.forEach((word) => {
                if (current[word] === "" && word !== newOriginal)
                  deleteCustomCardTranslation(word);
              });
            } else {
              saveCustomTranslation(newOriginal, newTranslation);
              const current = getCustomTranslations();
              words.forEach((word) => {
                if (current[word] === "" && word !== newOriginal)
                  deleteCustomTranslation(word);
              });
            }
            itemsToHide.forEach((item) => item.remove());
            const newItem = createTranslationItemElement(
              newOriginal,
              newTranslation,
              type,
            );
            editRow.parentNode.insertBefore(newItem, editRow);
            editRow.remove();
            updateMergeBtnVisibility(type);
          } else {
            alert("请输入完整的英文原名和中文翻译");
          }
        };
        cancelEditBtn.onclick = () => {
          editRow.remove();
          itemsToHide.forEach((item) => (item.style.display = ""));
        };
      };
    };
    const setupAddLogic = (type) => {
      const btnId = type === "CARD" ? "hsguru-add-card" : "hsguru-add-deck";
      const listId =
        type === "CARD" ? "#hsguru-card-list" : "#hsguru-deck-list";
      document.getElementById(btnId).onclick = () => {
        const listContainer = modal.querySelector(listId);
        const emptyMessage = listContainer.querySelector(".empty-message");
        if (emptyMessage) emptyMessage.remove();
        const editRow = document.createElement("div");
        editRow.className = `hsguru-feature-card custom-translation-item edit-mode ${type === "CARD" ? "card-item" : "deck-item"}`;
        editRow.innerHTML = `
        <div class="hsguru-feature-info hsguru-edit-field-wrap">
          <input type="text" class="hsguru-input edit-original-input hsguru-edit-original-input" placeholder="英文原名">
        </div>
        <div class="hsguru-edit-actions">
          <input type="text" class="hsguru-input edit-translation-input hsguru-edit-translation-input" placeholder="输入中文翻译">
          <button type="button" class="hsguru-btn hsguru-btn-primary hsguru-save-edit-btn hsguru-edit-save-btn">保存</button>
          <button type="button" class="hsguru-btn hsguru-btn-secondary hsguru-cancel-edit-btn hsguru-edit-cancel-btn">取消</button>
        </div>
      `;
        listContainer.insertBefore(editRow, listContainer.firstChild);
        editRow.querySelector(".edit-original-input").focus();
        const saveEditBtn = editRow.querySelector(".hsguru-save-edit-btn");
        const cancelEditBtn = editRow.querySelector(".hsguru-cancel-edit-btn");
        const originalInput = editRow.querySelector(".edit-original-input");
        const translationInput = editRow.querySelector(
          ".edit-translation-input",
        );
        saveEditBtn.onclick = () => {
          const newOriginal = originalInput.value.trim();
          const newTranslation = translationInput.value.trim();
          if (newOriginal && newTranslation) {
            if (type === "CARD") {
              saveCustomCardTranslation(newOriginal, newTranslation);
            } else {
              saveCustomTranslation(newOriginal, newTranslation);
            }
            const newItem = createTranslationItemElement(
              newOriginal,
              newTranslation,
              type,
            );
            editRow.parentNode.insertBefore(newItem, editRow);
            editRow.remove();
            updateMergeBtnVisibility(type);
          } else {
            alert("请输入完整的英文原名和中文翻译");
          }
        };
        cancelEditBtn.onclick = () => {
          editRow.remove();
          if (listContainer.children.length === 0) {
            listContainer.innerHTML = `<div class="empty-message">暂无待翻译的${type === "CARD" ? "卡牌" : "卡组"}名称</div>`;
          }
        };
      };
    };
    setupMergeLogic("DECK");
    setupMergeLogic("CARD");
    setupAddLogic("DECK");
    setupAddLogic("CARD");
    saveBtn.onclick = () => {
      saveCurrentConfig();
      saveCustomTranslationsFromUI();
      location.reload();
    };
  }
  function saveCustomTranslationsFromUI() {
    const inputs = document.querySelectorAll(".custom-translation-input");
    const deckTranslations = {};
    const cardTranslations2 = {};
    inputs.forEach((input) => {
      const original = input.getAttribute("data-original");
      const translation = input.value.trim();
      const type = input.getAttribute("data-type");
      if (type === "CARD") {
        cardTranslations2[original] = translation;
      } else {
        deckTranslations[original] = translation;
      }
    });
    saveCustomTranslations(deckTranslations);
    saveCustomCardTranslations(cardTranslations2);
  }
  function saveCurrentConfig() {
    const config = {};
    Object.keys(FEATURES).forEach((key) => {
      const checkbox = document.getElementById(`enable_${key}`);
      if (checkbox) {
        config[`enable_${key}`] = checkbox.checked;
      }
    });
    localStorage.setItem("hsguru_config", JSON.stringify(config));
  }
  function loadConfigToUI(config) {
    Object.keys(FEATURES).forEach((key) => {
      const checkbox = document.getElementById(`enable_${key}`);
      if (checkbox) {
        checkbox.checked =
          config[`enable_${key}`] !== void 0
            ? config[`enable_${key}`]
            : FEATURES[key].enabled;
      }
    });
  }
  function showConfigModal() {
    createConfigModal();
    const modal = document.getElementById("hsguru-config-modal");
    const config = getConfig();
    loadConfigToUI(config);
    modal.style.display = "block";
  }
  function addConfigButton() {
    const navbarStart = document.querySelector(".navbar-start");
    if (!navbarStart) return;
    if (document.getElementById("config-menu-button")) return;
    const configButton = document.createElement("a");
    configButton.id = "config-menu-button";
    configButton.className = "navbar-item";
    configButton.href = "#";
    configButton.title = "插件配置";
    configButton.innerHTML = "⚙️";
    configButton.addEventListener("click", (e) => {
      e.preventDefault();
      showConfigModal();
    });
    navbarStart.appendChild(configButton);
  }
  function initializeFeatures() {
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
  function initializePlugin() {
    const config = getConfig();
    applyConfig(config);
    if (typeof addConfigButton === "function") addConfigButton();
    initializeFeatures();
    injectStyles();
    setupDOMTranslationObserver();
    setupEventListeners();
  }
  initializePlugin();
})();
