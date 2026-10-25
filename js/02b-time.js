/* ==================================================================
 * 引擎层 · 时间系统（月份 / 季节 / 周中周末 / 时段）
 * ==================================================================
 * 把「第几周」翻译成真实的校历时间，让事件能按季节、按周中/周末出现。
 *
 * 校历规则：
 *   上学期（term 0/2/4）= 9月 → 次年1月，共 25 周，每月 5 周
 *   下学期（term 1/3/5）= 2月 → 6月，   共 25 周，每月 5 周
 *
 * 维护等级：引擎层（一般不动；要改月份分配改 TERM_MONTHS）
 * ============================================================ */

    /* 每学期覆盖的月份。想改校历改这里。 */
    const TERM_MONTHS = {
      even: [9, 10, 11, 12, 1],   // 上学期
      odd: [2, 3, 4, 5, 6]        // 下学期
    };

    const MONTH_SEASON = {
      1: "冬", 2: "冬", 3: "春", 4: "春", 5: "春",
      6: "夏", 7: "夏", 8: "夏", 9: "秋", 10: "秋", 11: "秋", 12: "冬"
    };

    const SEASON_ICON = {春: "🌸", 夏: "🌞", 秋: "🍂", 冬: "❄️"};

    /* ==================================================================
     * v1.3 节假日
     * ------------------------------------------------------------------
     * 全校放假的日子。按「长假日 / 短假日」区分：
     *   长假日（long: true）  —— 占掉一整周，那一周的行动换成节假日专属内容
     *                            国庆七天、五一、元旦、清明、端午、中秋连休等
     *   短假日（long: false） —— 不占周，只是在那一周里插一条事件
     *                            中秋一天、五四青年节、教师节等
     *
     * 判定方式：看这一周的校历月份 + 本学期第几周（wit），
     * 与 TERM_MONTHS 联动 —— 改校历的话这里也要跟着看一眼。
     * ================================================================== */
    const HOLIDAYS = [
      {id: "national", name: "国庆节", icon: "🇨🇳", long: true, months: [10], wit: [6],
       desc: "十月的第一周，红旗挂满了整条街。"},
      {id: "midautumn", name: "中秋节", icon: "🥮", long: false, months: [9, 10], wit: [2],
       desc: "月亮圆的那天，食堂发了月饼。"},
      {id: "newyear", name: "元旦", icon: "🎆", long: true, months: [1], wit: [17],
       desc: "新年的第一天，校门口换了新横幅。"},
      {id: "qingming", name: "清明节", icon: "🌿", long: true, months: [4], wit: [9],
       desc: "三天假，有人回老家，有人留在学校。"},
      {id: "labour", name: "劳动节", icon: "🛠️", long: true, months: [5], wit: [13],
       desc: "五月的第一周，红旗和劳动节一起到了。"},
      {id: "dragonboat", name: "端午节", icon: "🛶", long: false, months: [5, 6], wit: [16],
       desc: "食堂窗口摆出了粽子，甜的咸的各一堆。"},
      {id: "youth", name: "五四青年节", icon: "🎓", long: false, months: [5], wit: [14],
       desc: "下午放假半天，初二的入团仪式在礼堂举行。"},
      {id: "teacher", name: "教师节", icon: "🍎", long: false, months: [9], wit: [3],
       desc: "讲台上堆了一排花和卡片。"},
    ];

    /* 这一周撞上哪个节假日（没有就返回 null）
     * 长假日优先 —— 同一周既有国庆又有中秋时，按长假日整周处理。 */
    function holidayOf(week, term) {
      const w = clampNum(week, 0, 9999, 0);
      const wit = (w % WEEKS_PER_TERM) + 1;
      const months = (clampNum(term, 0, 9, 0) % 2 === 0) ? TERM_MONTHS.even : TERM_MONTHS.odd;
      const per = Math.max(1, Math.ceil(WEEKS_PER_TERM / months.length));
      const mi = clamp(Math.floor((wit - 1) / per), 0, months.length - 1);
      const month = months[mi];
      const longs = HOLIDAYS.filter(h => h.long && h.months.indexOf(month) >= 0 && h.wit.indexOf(wit) >= 0);
      if (longs.length) return longs[0];
      const shorts = HOLIDAYS.filter(h => !h.long && h.months.indexOf(month) >= 0 && h.wit.indexOf(wit) >= 0);
      if (shorts.length) {
        /* 短假日：同一周可能有多个（比如中秋 + 教师节），按周号轮换着出 */
        return shorts[(w + clampNum(term, 0, 9, 0)) % shorts.length];
      }
      return null;
    }
    const SEASON_DESC = {
      春: "玉溪的春天来得早，操场边的树先绿了。",
      夏: "教室里吊扇转着，蝉鸣从早响到晚。",
      秋: "风里带着桂花香，落叶铺满了林荫道。",
      冬: "早读时天还没亮，哈出的气是白的。"
    };

    /* 时段：一周之内有先后次序，事件必须按次序发生
     * ------------------------------------------------------------------
     * 顺序固定为：周中 → 周三社团课 → 周末
     * 社团活动只在周三发生（花灯社的外出研学除外），其他时候不会有。
     * ================================================================== */
    const SLOTS = [
      {id: "weekday", name: "周中", icon: "🏫", desc: "住校的日子，从早读到熄灯"},
      {id: "clubday", name: "周三社团课", icon: "🎪", desc: "周三下午的社团活动时间"},
      {id: "weekend", name: "周末", icon: "🏠", desc: "回家或者自由安排的两天"}
    ];

    const SLOT_MAP = {};
    SLOTS.forEach(s => {SLOT_MAP[s.id] = s;});

    /* 时段先后次序（数字小的先发生） */
    const SLOT_ORDER = {weekday: 0, clubday: 1, weekend: 2};

    /* 把「第几周」翻译成校历时间
     * 返回 {wit, month, season, monthIdx, weekOfMonth, dateText} */
    function weekInfo(week, term) {
      const w = clampNum(week, 0, 9999, 0);
      /* 本学期第几周：1~20（v1.2 起每学期 20 周）。
       * 以前是 w % 25，0 号位是"开学周"、24 号位是"假期周"，
       * 导致一学期名义 24 周、实际只有 23 周能玩。现在 20 周全是正经周。 */
      const wit = (w % WEEKS_PER_TERM) + 1;
      const months = (clampNum(term, 0, 9, 0) % 2 === 0) ? TERM_MONTHS.even : TERM_MONTHS.odd;
      // 5 个月平分 20 周 → 每月 4 周
      const per = Math.max(1, Math.ceil(WEEKS_PER_TERM / months.length));
      const mi = clamp(Math.floor((wit - 1) / per), 0, months.length - 1);
      const month = months[mi];
      const season = MONTH_SEASON[month] || "秋";
      const wom = ((wit - 1) % per) + 1;
      return {
        wit: wit,
        month: month,
        monthIdx: mi,
        weekOfMonth: wom,
        season: season,
        seasonIcon: SEASON_ICON[season] || "🍂",
        dateText: `${month}月 · ${season}`,
        fullText: `${month}月第${wom}周 · ${SEASON_ICON[season] || ""}${season}`
      };
    }

    /* 当前时间的简短文本，用于 HUD */
    function nowTimeText() {
      if (!S) return "";
      const w = weekInfo(S.week, S.term);
      const slot = SLOT_MAP[S.slot] || SLOTS[0];
      return `${w.month}月 · ${w.seasonIcon}${w.season} · ${slot.icon}${slot.name}`;
    }

    /* 生成这一周的时段序列 —— 数量是动态的
     * ------------------------------------------------------------------
     * 不是固定的"周中1次+周末1次"，而是：
     *   1. 按配置给出基础时段（默认 周中1 + 周末1）
     *   2. 若上一周攒下了「待触发的后续事件」，且它指定发生在某个时段，
     *      就给那个时段额外加一次机会（有上限）
     * 这样：前面触发了连锁，后面对应的时段就会自然变多。
     * ================================================================== */
    /* 本周有没有社团课
     * ------------------------------------------------------------------
     * 用周号做确定性哈希 —— 同一周无论调用多少次、读档多少次，结论都一样。
     * rate = 开课比例（默认 0.5，约一半的周有社团活动）。 */
    function clubWeekOn(week, rate) {
      const r = clampNum(rate, 0, 1, 0.5);
      if (r >= 1) return true;
      if (r <= 0) return false;
      const w = Math.max(0, Math.round(num(week, 0)));
      /* 简单的整数哈希：把周号打散成 [0,1) 上的稳定值 */
      let h = (w * 2654435761) % 4294967296;
      h = (h ^ (h >>> 13)) * 1274126177 % 4294967296;
      const x = ((h >>> 0) % 100000) / 100000;
      return x < r;
    }

    function buildWeekSlots() {
      const cfg = GAME_CONFIG.week || {};
      const base = cfg.slots || {weekday: 1, weekend: 1};
      const plan = [];
      const push = (slot, n) => {for (let i = 0; i < n; i++) plan.push(slot);};

      push("weekday", Math.max(0, Math.round(num(base.weekday, 1))));
      /* 周三社团课：
       * ① 没加入社团就不排这个时段（省掉一次空点击）
       * ② v1.3：社团不是每周都有 —— 每周约一半的概率开课。
       *    用「周号」做确定性哈希，而不是 Math.random()：
       *    这样存档读回来、或者同一周里重开界面，结果都不会变。 */
      const cd = Math.max(0, Math.round(num(base.clubday, 0)));
      if (cd > 0) {
        const onlyJoined = cfg.clubOnlyWhenJoined !== false;
        if (!onlyJoined || (S && S.club)) {
          const rate = clampNum(cfg.clubRate, 0, 1, 0.5);   // 默认一周约一半有社团课
          if (clubWeekOn(num(S && S.week, 0), rate)) push("clubday", cd);
        }
      }
      push("weekend", Math.max(0, Math.round(num(base.weekend, 1))));

      // 动态补时：上周挂起的后续事件指定在某个时段 → 那个时段 +1
      if (cfg.dynamic !== false && S && S.pending) {
        const now = num(S.week, 0);
        const extraCap = Math.max(0, Math.round(num(cfg.maxExtra, 1)));
        const bucket = {};
        S.pending.forEach(p => {
          if (now > num(p.until, 0)) return;                 // 已过期
          const s = p.slot || "weekend";
          bucket[s] = (bucket[s] || 0) + 1;
        });
        Object.keys(bucket).forEach(s => {
          const add = Math.min(extraCap, bucket[s] > 0 ? 1 : 0);
          for (let i = 0; i < add; i++) plan.push(s);
        });
      }

      // 按 周中 → 周三社团课 → 周末 排序，保证时间先后顺序
      const order = SLOT_ORDER;
      plan.sort((a, b) => (order[a] == null ? 9 : order[a]) - (order[b] == null ? 9 : order[b]));
      return plan.length ? plan : ["weekday"];
    }

    /* 清理过期的待触发事件 */
    function flushPending() {
      if (!S || !S.pending) return;
      const now = num(S.week, 0);
      S.pending = S.pending.filter(p => num(p.until, 0) >= now);
    }

    /* 挂起一个后续事件：在 weeks 周内提高它的出现概率 */
    function raiseEvent(id, weeks, mult, slot) {
      if (!S) return;
      if (!Array.isArray(S.pending)) S.pending = [];
      S.pending = S.pending.filter(p => p.id !== id);
      S.pending.push({
        id: id,
        until: num(S.week, 0) + Math.max(1, Math.round(num(weeks, 2))),
        mult: Math.max(1, num(mult, 3)),
        slot: slot || ""
      });
    }

    /* 某个事件当前是否处于「被挂起」状态，返回倍率（1 = 没挂起） */
    function pendingMult(id) {
      if (!S || !Array.isArray(S.pending)) return 1;
      let m = 1;
      S.pending.forEach(p => {if (p.id === id) m = Math.max(m, num(p.mult, 1));});
      return m;
    }

    /* 季节文案（用于 HUD 与事件开头） */
    function seasonLine() {
      if (!S) return "";
      const w = weekInfo(S.week, S.term);
      return SEASON_DESC[w.season] || "";
    }
