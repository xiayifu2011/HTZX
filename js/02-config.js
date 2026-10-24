/* ==================================================================
 * 配置层 · 学校特色与玩法参数
 * ==================================================================
 * 校名、校训、每周节奏、难度、主题皮肤（背景图/校徽/主题色）。
 * ★ 全项目唯一需要为学校定制的文件，老师要改就看这一个。
 *
 * 维护等级：配置层（随便改）
 * ============================================================ */

    const GAME_CONFIG = {
      // —— 学校特色 ——
      school: {
        name: "玉溪市红塔中学",
        subName: "玉溪一中附属中学",
        motto: "人生在立，行达天下",
        // 学生称谓：游戏文案里用「红塔少年」称呼玩家
        studentName: "红塔少年",
        // 学校文化关键词，出现在开学典礼等固定事件里
        culture: ["立德", "立志", "立学", "立身"],
        // 迎新口号：登上立行号，向未来出发
        slogan: "每一步 都算数",
        train: "立行号",       // 学校把入学比作登上一趟列车
      },

      // —— 每周节奏 ——
      // 每周可以选几次「本周行动」，按学期 0~5 排列（初一上→初三下）
      // 想让一局短一点，就把数字调小，例如全部改成 1
      actionsPerWeek: [2, 2, 2, 2, 1, 1],

      // —— 一周的时间结构（周中 / 周末）——
      // 一周之内分为「周中」（住校）和「周末」（回家/自由），
      // 事件必须按 周中 → 周末 的先后顺序发生，不会先回家再住校。
      week: {
        // 一周的时间顺序固定为：周中 → 周三社团课 → 周末
        // 数字 = 该时段给几次行动机会；填 0 就是不出现
        slots: {weekday: 1, clubday: 1, weekend: 1},
        dynamic: true,                     // 上周攒了后续事件 → 对应时段自动 +1
        maxExtra: 1,                       // 每个时段最多额外加几次
        clubOnlyWhenJoined: true           // 没社团就不排「周三社团课」，省一次点击
      },

      // —— 事件分布方式的全局默认 ——
      // 单个事件可以用自己的 dist 覆盖，见 docs/CONTENT_GUIDE.md
      eventDist: {
        mode: "decay",     // "uniform" 均匀 | "decay" 出现后衰减 | "front" 前期多 | "back" 后期多
        decay: 0.5,        // decay 模式：每出现一次权重 ×0.5
        decayFloor: 0.15,  // 最低不低于原权重的 15%
        minGap: 0          // uniform 模式：两次出现至少间隔几周（0=不限制）
      },

      // 每次「本周行动」之后，必定跟随几个随机事件
      eventsPerAction: 1,

      // 随机事件后面还能再连锁几个（0 = 不连锁，2 = 最多再跟 2 个）
      maxChainEvents: 2,

      // 连锁触发概率，按顺序递减：[第 1 次连锁, 第 2 次连锁]
      chainChance: [0.40, 0.20],

      // 每周事件总数硬上限（防止一局被拉得太长）
      maxEventsPerWeek: 4,

      // 事件结果的展示方式
      //   "popup" = 弹窗完整展示（推荐，看得清）
      //   "log"   = 直接写进右侧日志，不弹窗（一局能快一倍）
      eventResultMode: "popup",

      // 难度：
      //   "story"  展示/剧情模式 —— 健康与心态有保底，几乎不会中途暴毙（全校展示推荐）
      //   "normal" 标准模式 —— 原版判定，玩脱了真的会「积劳成疾」「心理崩溃」
      //   "hard"   硬核模式 —— 更容易被压力和经济拖垮
      // —— 界面 ——
      ui: {
        hideScrollbar: true,   // 隐藏滚动条（仍能滚动，只是看不见那条杠）
        scrollHint: true,      // 内容没看完时，底部显示一道渐隐，暗示"下面还有"
        floatNumbers: true,    // 可见属性飘字是否带数字（关掉就只显示 ▲/▼）
        hiddenFloats: false,   // 隐藏属性（效率/悟性/社交/亲情）是否也飘提示
      },

      // —— 氛围特效 ——
      // 屏幕会随玩家状态变化：压力红雾、心态灰暗、健康发虚、经济见底发冷。
      // 不想要就把它整个删掉或写 enabled: false。
      mood: {
        enabled: true,
        stressAt: 100,   // 压力 ≥ 此值：红雾拉满
        warnAt: 78,      // 压力 ≥ 此值：红雾轻微出现（预警）
        darkAt: 35,      // 心态 ≤ 此值：画面灰暗拉满
        weakAt: 30,      // 健康 ≤ 此值：画面失血发虚拉满
        brokeAt: 20      // 经济 ≤ 此值：边缘发冷
      },

      difficulty: "story",
      storyFloor: 15,        // story 模式下 健康 / 心态 的最低保底线
      /* story 模式下 亲情 的最低保底线。
       * 原来是 35，高于「家庭矛盾」的触发线 30 —— 等于剧情模式永远吵不起来。
       * 改成 22：仍能触发矛盾与"要不到钱"，但不至于真的众叛亲离。 */
      storyFloorFamily: 22,
      storyFloorMoney: 10,   // story 模式下 经济 的最低保底线（不想让玩家因贫辍学）

      /* ==============================================================
       * 学习难度（v1.1 起：比 1.0 明显更难）
       * --------------------------------------------------------------
       * 四个旋钮同时收紧，想调回原版把四个数都改成 1 即可。
       *   gainMul    收益：学力涨幅的倍率（0.80 = 少两成）
       *   decayMul   遗忘：每周全科遗忘的倍率（1.30 = 忘快三成）
       *   examMul    考试：卷面分的倍率（0.94 = 同样学力少拿 6%）
       *   stressMul  压力：学习带来的压力倍率（1.4 = 学一次更累）
       *
       * 实测（无天赋、每周 2 次学习、压力与心态维持得较好）：
       *   旧版 1.0  初三 86 分  →  现在 75 分
       *   旧版 1.0  每周只学 1 次也有 70 分  →  现在 60 分
       * 加上天赋 / 图书角 / 社团加成后，认真玩仍有 82~88 分的空间。
       * 另：learnBleed = 长期不学习时，学力额外流失的比例（破茧的负面来源）
       * ============================================================== */
      study: {
        gainMul: 0.80,
        decayMul: 1.30,
        examMul: 0.94,
        stressMul: 1.4,
        stressPenalty: 0.40,   // 压力对学习效率的惩罚上限（原为 0.30）
        learnBleed: 0.03       // 一周没学习 → 全科额外 -3%
      },

      /* ==============================================================
       * 「遗憾离场」判定：压力连续爆表几周才提前结束
       * --------------------------------------------------------------
       * 中途会给预警，给玩家自救的机会。设 0 就退回"压力 ≥100 立刻扣心态"的旧行为。
       * ============================================================== */
      burnout: {
        stressAt: 100,     // 压力到多少算「爆表」
        weeks: 3           // 连续爆表几周 → 遗憾离场
      },

      /* ==============================================================
       * 亲情（第八属性，只在家庭事件与要零花钱时生效）
       * --------------------------------------------------------------
       * 要钱会掉亲情；亲情太低会触发家庭矛盾，也要不到钱。
       * ============================================================== */
      family: {
        askCost: 6,        // 每开口要一次钱，亲情掉多少
        askCostRich: 2,    // 亲情很好时只掉一点点
        lowAt: 40,         // 亲情低于此值 → 可能被拒绝
        conflictAt: 30,    // 亲情低于此值 → 有几率触发家庭矛盾事件
        conflictChance: 0.35,
        weeklyDrop: 0.35,  // 每周自然回落的概率
        weeklyDropVal: 2   // 每次掉多少（合起来约 -0.7/周，靠家庭事件维护）
      },

      /* ==============================================================
       * 运动锻炼：触发连锁运动事件的概率
       * --------------------------------------------------------------
       * [第 1 条, 第 2 条] —— 第 2 条只在第 1 条抽到之后才判定。
       * 全部改成 0 就是"纯粹锻炼身体，不出事件"。
       * ============================================================== */
      sport: {
        chainChance: [0.70, 0.35]
      },

      // —— 中考 / 考试怎么算分 ——
      // 分数 = √(学力项 + 悟性项 + 心态项 + 效率项) × 10
      // 想让「努力学习」更值钱就把 subjWeight 调大；想让天赋值钱就调小。
      // ★ 默认值 1.6 的含义：三年认真学 ≈ 85~90 分，天天摸鱼 ≈ 70 分上下。
      exam: {
        subjWeight: 1.3,   // 学力项系数（1.0 版之前是 0.7，学力几乎不影响分数）
        wuWeight: 0.15,    // 悟性项系数
        mindWeight: 0.06,  // 心态项系数
        effWeight: 0.04,   // 效率项系数
      },

      // —— 主题皮肤 ——
      // 默认主题（清华紫）与另外六套主题都定义在 js/02c-themes.js。
      // 这里只保留"默认用哪一套"和"背景不透明度"两个开关。
      // 说明：学校目前没有官方校徽，因此不使用校徽图标，只用校名与校训。
      themeId: "hongta",      // 默认主题 id，见 js/02c-themes.js 的 THEME_SKINS
      theme: {
        // 主背景：白天上课期间用这张（留空则只用主题的 CSS 渐变背景）
        bgImage: "assets/bg.jpg",
        // 备用背景：清晨 / 假期 / 特殊阶段（设为空字符串则不启用）
        bgImageAlt: "assets/bg2.jpg",
        // 结局画面专用背景（「立行号」列车）
        bgImageEnd: "assets/bg_end.jpg",
        bgOpacity: 0.26,      // 背景图不透明度 0~1，太高会盖住文字

        accent: "#660874",    // 主色：清华紫（切换主题时会被覆盖）
        accent2: "#9c4dcc",   // 辅助亮紫（高亮、按钮边框）
        accentGold: "#c9a227" // 点缀金（徽章、进度条）
      }
    };

    function applyTheme() {
      const t = GAME_CONFIG.theme || {}, root = document.documentElement;

      // 配色与背景全部交给主题层（js/02c-themes.js）
      // 不传 id：沿用 loadSettings() 已经读出来的那套，避免覆盖玩家的选择
      if (typeof applyThemeSkin === "function") {
        applyThemeSkin();
      } else {
        root.style.setProperty("--bg-image", t.bgImage ? `url("${t.bgImage}")` : "none");
        root.style.setProperty("--bg-opacity", String(t.bgOpacity == null ? .26 : t.bgOpacity));
      }

      // 滚动条：按配置给 body 挂上开关 class
      const ui = GAME_CONFIG.ui || {};
      // html 也要挂，页面级滚动条归它管
      [document.body, document.documentElement].forEach(el => {
        if (!el || !el.classList || typeof el.classList.toggle !== "function") return;
        el.classList.toggle("no-scrollbar", ui.hideScrollbar !== false);
        el.classList.toggle("scroll-hint", ui.scrollHint !== false);
      });

      // 顶部校名 + 校训（无校徽，纯文字）
      const brand = document.getElementById("schoolBrand");
      if (brand) brand.innerHTML =
        `<span class="school-name">${GAME_CONFIG.school.name}</span>` +
        `<span class="school-motto">${GAME_CONFIG.school.motto}</span>`;
      const sub = document.getElementById("subMotto");
      if (sub) sub.textContent =
        `${GAME_CONFIG.school.motto} —— 登上「${GAME_CONFIG.school.train}」，${GAME_CONFIG.school.slogan}`;
    }

    /* 切换背景图：season 取 "main" | "alt" | "end" */
    function setBackground(season) {
      const root = document.documentElement;
      // 优先用当前主题自己的背景图；主题没配图就回落到 GAME_CONFIG
      let v = (typeof themeBg === "function") ? themeBg(season) : "";
      const t = GAME_CONFIG.theme || {};
      if (!v) v = {main: t.bgImage, alt: t.bgImageAlt, end: t.bgImageEnd}[season] || t.bgImage;
      const base = (typeof currentTheme === "function")
        ? currentTheme().bgOpacity : (t.bgOpacity == null ? .26 : t.bgOpacity);
      root.style.setProperty("--bg-image", v ? `url("${v}")` : "none");
      root.style.setProperty("--bg-opacity", String(
        season === "end" ? Math.min(0.45, (base || .26) + 0.14) : (base == null ? .26 : base)
      ));
    }

    /* ==================================================================
     * 天赋表
     * ================================================================== */
