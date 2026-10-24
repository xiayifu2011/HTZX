/* ==================================================================
 * 工具层 · 数值与日志
 * ==================================================================
 * 随机数、数值夹取、属性增减、日志输出、飘字。
 * 所有"改数字"的操作最终都会走到这里的 modProp()，
 * NaN 防护也在这里统一处理。
 *
 * 维护等级：引擎层（一般不动）
 * ============================================================ */

    let S = null, slotCur = 0;

    const rnd = n => Math.floor(Math.random() * n);

    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    /* ==================================================================
     * 好运判定：事件里所有「看运气」的分支都走这里
     * ------------------------------------------------------------------
     * 这样【锦鲤附体】【乌鸦嘴】两个天赋和【幸运硬币】道具才真的有用
     * —— 以前它们只在天赋表里写着，代码里没人认。
     * 用法：if (luckyRoll(0.5)) { …好运分支… }
     * ================================================================== */
    function luckyRoll(p) {
      let v = clampNum(p, 0, 1, 0.5);
      if (typeof Talent !== "undefined") {
        if (Talent.have("锦鲤附体")) v += 0.15;
        if (Talent.have("乌鸦嘴")) v -= 0.12;
      }
      if (S && S.luckyCharm) v += 0.10;      // 小卖铺的幸运硬币
      return Math.random() < clampNum(v, 0.02, 0.98);
    }

    /* ==================================================================
     * 数值边界：任何进入状态的数字都必须先过这一关，杜绝 NaN / Infinity
     * ================================================================== */

    const num = (v, d = 0) => (typeof v === "number" && isFinite(v)) ? v : d;

    const clampNum = (v, a, b, d = a) => clamp(num(v, d), a, b);

    // 属性的合法区间与兜底值：[下限, 上限, 出问题时兜底成多少]
    // 主界面显示前七项；「亲情」是第八项，只在家庭事件中生效，
    // 不显示在 HUD 属性栏（避免界面变长），在天赋图鉴里能看到。

    const PROP_RANGE = {
      心态: [0, 150, 100], 经济: [0, 1e9, 100], 健康: [0, 150, 100], 效率: [10, 150, 100],
      悟性: [10, 150, 10], 社交: [10, 150, 100], 压力: [0, 150, 10],
      亲情: [10, 150, 80]
    };

    /* ==================================================================
     * 属性可见性（v1.1 起）
     * ------------------------------------------------------------------
     * PROP_HUD     面板上真正看得见的四项：心态 / 经济 / 健康 / 压力
     * PROP_HIDDEN  后台实时计算、面板上一律不出现：效率 / 悟性 / 社交 / 亲情
     * PROP_BLUR    HUD 里除「经济」之外都要模糊化：只给档位文字，不给数字
     *
     * 学科属性（语文 / 数学 ……）不再常驻面板，只在考试事件里显示。
     * 想恢复完整数值面板：把 PROP_HUD 改成 Object.keys(PROP_RANGE)，
     * 并把 PROP_BLUR 改成空数组即可。
     * ================================================================== */
    const PROP_HUD = ["心态", "经济", "健康", "压力"];

    const PROP_HIDDEN = ["效率", "悟性", "社交", "亲情"];

    const PROP_BLUR = ["心态", "健康", "压力"];

    /* ==================================================================
     * 档位：把 0~150 的数值翻译成「极低 / 较低 / 中 / 较高 / 极高」
     * ------------------------------------------------------------------
     * 五档均分，档位宽度 30。面板上只显示档位文字 + 五格刻度条，
     * 玩家看到的是"状态好不好"，不是精确的 87 还是 88。
     * 想改档位文案改 js/01b-i18n.js 的 level.* ；想改宽度改这里的 STEP。
     * ================================================================== */
    const PROP_LEVEL_STEP = 30;

    const PROP_LEVELS = [
      {lv: 0, key: "level.vlow"},
      {lv: 1, key: "level.low"},
      {lv: 2, key: "level.mid"},
      {lv: 3, key: "level.high"},
      {lv: 4, key: "level.vhigh"}
    ];

    /* 数值落在第几档（0~4） */
    function propLevel(v) {
      const x = clamp(num(v, 0), 0, 150);
      return clamp(Math.floor(x / PROP_LEVEL_STEP), 0, 4);
    }

    /* 属性的语义方向：+"越高越好" / -"越高越糟"
     * 压力是唯一反向的 —— 档位文字照写「极高」，但颜色要反过来。 */
    function propPolarity(k) {return k === "压力" ? -1 : 1;}

    /* 档位文字（已过双语层） */
    function propLevelText(k, v) {
      const lv = propLevel(v);
      const key = (PROP_LEVELS[lv] || PROP_LEVELS[2]).key;
      return L(key);
    }

    const SUBJ_CAP = 1500;   // 单科学力上限，防止长期累积后失控

    function fixProp(k, v) {
      const r = PROP_RANGE[k] || [0, 150, 100];
      return clamp(num(v, r[2]), r[0], r[1]);
    }

    function sanitizeProp(p) {
      const out = {};
      for (const k in PROP_RANGE) out[k] = fixProp(k, p ? p[k] : undefined);
      return out;
    }

    function sanitizeSubj(s) {
      const out = {};
      for (const g in SUBJECTS_BY_GRADE)
        SUBJECTS_BY_GRADE[g].forEach(k => {out[k] = clamp(num(s ? s[k] : undefined, 30), 0, SUBJ_CAP);});
      if (s) for (const k in s) if (out[k] === undefined) out[k] = clamp(num(s[k], 30), 0, SUBJ_CAP);
      return out;
    }
    /* 把当前学年的科目补齐/修好，任何 NaN 都会被拉回 30 左右 */

    function ensureSubj() {
      if (!S) return;
      const subs = subjectsOf(S.term) || [];
      for (const k of subs) {
        if (S.subj[k] === undefined || !isFinite(S.subj[k])) S.subj[k] = 25 + rnd(15);
        S.subj[k] = clamp(S.subj[k], 0, SUBJ_CAP);
      }
    }

    function recalcScore() {
      const subs = subjectsOf(S.term) || [];
      S.score = subs.length ? clampNum(subs.reduce((a, x) => a + num(S.subj[x], 0), 0), 0, SUBJ_CAP * 20) : 0;
    }

    /* ==================================================================
     * 真实学习难度曲线
     * ================================================================== */

    /* 剧情模式下的属性保底线。
     * 亲情单独设一条更高的底线（storyFloorFamily），
     * 避免展示时玩家因为几次手机违规就"众叛亲离"，那不是我们想传达的。 */
    function propFloor(k) {
      if (GAME_CONFIG.difficulty !== "story") return 0;
      if (k === "健康" || k === "心态") return GAME_CONFIG.storyFloor;
      if (k === "亲情") return GAME_CONFIG.storyFloorFamily;
      /* 经济也留一条底线：剧情模式承诺「不会中途暴毙」，
       * 而经济归零满 12 周会触发「辍学打工」提前结束 —— 展示时不想看到这个。
       * 想要经济压力，请切到 standard / hard 难度。 */
      if (k === "经济") return GAME_CONFIG.storyFloorMoney;
      return 0;
    }

    function modProp(k, v) {
      if (S.prop[k] === undefined || !isFinite(S.prop[k])) S.prop[k] = fixProp(k, undefined);
      v = num(v, 0);
      if (!v) return;
      const before = S.prop[k];
      S.prop[k] = clamp(S.prop[k] + v, propFloor(k), PROP_RANGE[k] ? PROP_RANGE[k][1] : 150);
      if (S.prop[k] < (PROP_RANGE[k] ? PROP_RANGE[k][0] : 0)) S.prop[k] = PROP_RANGE[k] ? PROP_RANGE[k][0] : 0;
      if (Math.abs(v) >= 1) {
        const good = (k === "压力") ? (v < 0) : (v > 0);
        // 隐藏属性（效率 / 悟性 / 社交 / 亲情）：面板上看不到，
        // 飘一个带数字的字只会暴露它们，改成不带数字的方向提示。
        if (isHiddenProp(k)) {
          if (floatHiddenWanted()) floatGain(`${propName(k)} ${v > 0 ? "▲" : "▼"}`, good);
        } else if (isBlurProp(k) && !floatNumbersWanted()) {
          // 模糊属性且关掉了数字飘字：只说升了还是降了
          floatGain(`${propName(k)} ${v > 0 ? "▲" : "▼"}`, good);
        } else {
          floatGain(`${propName(k)} ${v > 0 ? "+" : ""}${Math.round(v)}`, good);
        }
      }
    }

    /* 该属性是否在面板上隐藏 */
    function isHiddenProp(k) {
      return (typeof PROP_HIDDEN !== "undefined") && PROP_HIDDEN.indexOf(k) >= 0;
    }

    /* 该属性是否要模糊化（只给档位，不给数字） */
    function isBlurProp(k) {
      return (typeof PROP_BLUR !== "undefined") && PROP_BLUR.indexOf(k) >= 0;
    }

    /* 飘字开关，见 GAME_CONFIG.ui */
    function floatNumbersWanted() {
      const u = (typeof GAME_CONFIG !== "undefined" && GAME_CONFIG.ui) || {};
      return u.floatNumbers !== false;
    }

    function floatHiddenWanted() {
      const u = (typeof GAME_CONFIG !== "undefined" && GAME_CONFIG.ui) || {};
      return u.hiddenFloats === true;
    }

    function say(txt, cls = "") {
      /* 单亲 / 留守家庭：日志里爸爸妈妈的称呼也要统一（双亲家庭原样） */
      if (typeof famText === "function" && typeof txt === "string") txt = famText(txt);
      S.logs.push({txt, cls}); const el = document.getElementById("log");
      const d = document.createElement("div"); if (cls) d.className = cls; d.textContent = txt; el.appendChild(d); el.scrollTop = el.scrollHeight;
    }

    function count(k) {
      S.cnt[k] = (S.cnt[k] || 0) + 1;
      bumpCure(k);   // 行动 / 运动 / 高分等计数同步推进「破茧」进度
    }
    /* story 模式下给 健康 / 心态 留一条保底线，避免展示时突然暴毙 */

    let floatIdx = 0;

    function floatGain(txt, good) {
      const d = document.createElement("div");
      d.className = "floatgain";
      d.style.color = good === false ? "var(--red)" : (good === true ? "var(--green)" : "var(--gold)");
      d.style.left = `calc(50% + ${(floatIdx++ % 5 - 2) * 60}px)`;
      d.textContent = txt;
      document.body.appendChild(d);
      setTimeout(() => d.remove(), 1600);
    }
