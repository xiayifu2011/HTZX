/* ==================================================================
 * 引擎层 · 数值结算
 * ==================================================================
 * 难度曲线、周结算、学习结算、考试、中考、开局天赋抽取。
 * ★ 想调整游戏平衡（分数好不好看、学力学不学得动）就改这里。
 *
 * 维护等级：引擎层（调平衡时改）
 * ============================================================ */

    /* 考试分数的四项权重。写在配置里（GAME_CONFIG.exam），
     * 老师看完觉得分数偏高/偏低，改那一个数就行，不用动引擎。 */
    function examWeights() {
      const e = (GAME_CONFIG && GAME_CONFIG.exam) || {};
      return {
        subj: num(e.subjWeight, 1.6),
        wu: num(e.wuWeight, 0.15),
        mind: num(e.mindWeight, 0.06),
        eff: num(e.effWeight, 0.04),
      };
    }

    /* 单科卷面分 = √(学力项 + 悟性项 + 心态项 + 效率项) × 10 */
    function examScoreOf(sub, p, diff, W) {
      const rel = clampNum(num(S.subj[sub], 30) / (clampNum(S.term, 0, 10) + 1), 0, 9999);
      let v = rel * W.subj + num(p.悟性, 0) * W.wu + num(p.心态, 0) * W.mind + num(p.效率, 0) * W.eff;
      v = Math.sqrt(Math.max(0, num(v, 0))) * 10;
      if (S.examCharm) v += 5;
      if (S.penCharm) v += 5;
      v = v * num(diff.examHard, 1) * (typeof studyCfg === "function" ? studyCfg().examMul : 1)
        + (Math.random() * 2 - 1) * num(diff.noise, 0);
      return v;
    }

    /* ==================================================================
     * v1.1 学习难度旋钮
     * ------------------------------------------------------------------
     * 四个系数全部写在 GAME_CONFIG.study 里，老师觉得太难就往 1 调。
     *   gainMul   收益变少  0.65 → 同样的"努力学习"，学力少涨三成半
     *   decayMul  遗忘变快  1.60 → 一周不学，倒退得比以前明显
     *   examMul   考试变难  0.90 → 同样的学力，卷面分少一成
     *   stressMul 压力变大  1.50 → 学一次更累，高压对效率的惩罚也更重
     * ================================================================== */
    function studyCfg() {
      const c = (typeof GAME_CONFIG !== "undefined" && GAME_CONFIG.study) || {};
      return {
        gainMul: num(c.gainMul, 1),
        decayMul: num(c.decayMul, 1),
        examMul: num(c.examMul, 1),
        stressMul: num(c.stressMul, 1),
        stressPenalty: num(c.stressPenalty, 0.30),
        learnBleed: num(c.learnBleed, 0)
      };
    }

    /* ==================================================================
     * 「运动锻炼」结算
     * ------------------------------------------------------------------
     * 消耗一次行动，换身体的底子：健康、效率、抗压。
     * 学力几乎不涨（去操场了就没在书桌前），但有运动天赋的人收益更大。
     * 之后由 runSportChain() 决定要不要连锁出运动事件。
     * ================================================================== */

    function sportSettle(onDone) {
      const p = S.prop;
      for (const k in PROP_RANGE) p[k] = fixProp(k, p[k]);

      let hp = 6, eff = 4, stress = -8, mind = 4;
      if (Talent.have("运动健将")) {hp += 4; eff += 3; stress -= 4;}
      if (Talent.have("天行健")) {hp += 3; eff += 2;}
      if (Talent.have("钢筋铁骨")) hp += 3;
      if (Talent.have("体弱多病")) {hp = Math.round(hp * 0.5); stress += 3;}
      if (Talent.have("大胃袋")) hp = Math.round(hp * 0.8);
      if (p.健康 < 40) {hp = Math.round(hp * 0.6); stress += 4; mind -= 2;}   // 身体差，练不动

      modProp("健康", hp);
      modProp("效率", eff);
      modProp("压力", stress);
      modProp("心态", mind);

      S.actCount = (S.actCount || 0) + 1;
      S.evCntWeek = {};
      S.evCountWeek = 0;
      count("sport");                       // 推进「体弱多病」等破茧进度
      S.didSportWeek = num(S.week, 0);      // 记一下，用于天赋退化判定
      renderHUD();
      say(L("sport.log"), "sys");
      floatGain(L("sport.float"), true);
      if (typeof onDone === "function") onDone();
    }

    function difficultyCurve(week, term) {
      const t = clampNum(week, 0, 1000) / 144;
      const tt = Math.min(1, t);
      const termT = Math.min(1, clampNum(term, 0, 10) / 5);
      const gainMul = 1.18 - 0.42 * Math.pow(tt, 1.35);
      const decay = 0.03 + 0.09 * Math.pow(tt, 1.6);
      const noise = 10 + 8 * tt;
      const examHard = 0.92 + 0.20 * Math.pow(tt, 1.2);
      return {gainMul, decay, noise, examHard, termT};
    }

    /* ==================================================================
     * 每周固定悟性增长
     * ==================================================================
     * 不再依赖随机，改为：
     *  - 基础 +1
     *  - 随学期递增：term 0/1 +0，term 2/3 +1，term 4/5 +2
     *  - 再叠加天赋修正（书香门第、七窍玲珑、文曲星、大彻大悟、迟钝、佛系少年）
     */

    function weeklyWuGain() {
      let wu = 1;
      if (S.term >= 4) wu += 2;
      else if (S.term >= 2) wu += 1;
      if (Talent.have("书香门第")) wu += 2;
      if (Talent.have("七窍玲珑")) wu += 3;
      if (Talent.have("文曲星")) wu += 3;
      if (Talent.have("大彻大悟")) wu += 2;
      if (Talent.have("迟钝")) wu = 0;
      if (Talent.have("佛系少年")) wu = Math.max(0, wu - 1);
      if (Talent.have("灵感迸发") && Math.random() < 0.15) {wu += 15; say("✨ 灵感迸发!悟性暴涨 +15", "talent");}
      return wu;
    }

    function newGame(name, gender) {
      Talent.owned = [];
      S = {
        week: 0, term: 0, name: name || "无名氏", gender: gender || "男",
        evCnt: {},
        prop: {心态: 100 + rnd(31) - 15, 经济: 100 + rnd(31) - 15, 健康: 100 + rnd(31) - 15, 效率: 100 + rnd(31) - 15, 悟性: 10 + rnd(15), 社交: 100 + rnd(31) - 15, 压力: 10},
        score: 0, lastExamScore: 0, bestExam: 0, zhongkao: -1,
        studyBuff: 0, buffWeeks: 0, studyDebuff: 0, debuffWeeks: 0,
        cnt: {}, ach: [], over: false, dead: null, logs: [],
        subj: {}, items: {},
        evCntWeek: {},        // 本周已触发的事件 id
        evCountWeek: 0,       // 本次行动内已触发的事件数
        evWeekTotal: 0,       // 本周累计事件数
        actQuota: 0, actCount: 0,
        cure: {},             // 负面天赋的「破茧」进度

        // —— 时间系统 ——
        slot: "weekday",      // 当前时段：weekday 周中 / weekend 周末
        slotPlan: ["weekday", "weekend"],
        slotIdx: 0,

        // —— 社团 ——
        club: "",             // 已加入的社团 id
        clubCount: 0,
        clubTried: [],        // 抢过的社团（第二次抢会容易一点）
        clubSkip: false,      // 主动放弃社团
        clubTerm: -1,         // 哪一年已经抢过社团（term）
        clubSkipTerm: -1,     // 哪一年主动放弃了

        // —— 事件调度 ——
        flags: {},            // 标记，如 phone_at_school
        pending: [],          // 被挂起的后续事件（在几周内概率放大）
        evLastWeek: {},       // 每个事件上次出现在第几周（用于 minGap 均匀分布）
        chainQueue: [],       // 排队等着的后续事件
      };
      subjectsOf(0).forEach(s => S.subj[s] = 30 + rnd(20));
      S.prop = sanitizeProp(S.prop);
      S.subj = sanitizeSubj(S.subj);
      rollStartTalents();
      applyStartTalentBonuses();
      recalcScore();
    }

    function applyStartTalentBonuses() {
      const subjBonus = {};
      if (Talent.have("书香门第")) {subjBonus.语文 = 15; subjBonus.历史 = 12;}
      if (Talent.have("教师子女")) {Object.keys(S.subj).forEach(k => subjBonus[k] = (subjBonus[k] || 0) + 8);}
      if (Talent.have("艺术世家")) {subjBonus.语文 = (subjBonus.语文 || 0) + 12; subjBonus.英语 = 12;}
      if (Talent.have("数学脑")) subjBonus.数学 = 20;
      if (Talent.have("语感天成")) subjBonus.语文 = 20;
      if (Talent.have("单词机器")) subjBonus.英语 = 20;
      if (Talent.have("实验狂人")) {subjBonus.物理 = (subjBonus.物理 || 0) + 15; subjBonus.化学 = 15;}
      if (Talent.have("史海钩沉")) {subjBonus.历史 = (subjBonus.历史 || 0) + 15; subjBonus.生物 = 15;}
      for (const k in subjBonus) {if (S.subj[k] !== undefined) S.subj[k] += subjBonus[k];}
      if (Talent.have("家财万贯")) S.prop.经济 = 150 + rnd(60);   // v1.1 削弱：原为 300+rnd(100)
      else if (Talent.have("家徒四壁")) S.prop.经济 = 30 + rnd(30);
      else if (Talent.have("小康之家")) S.prop.经济 = 150 + rnd(50);
      if (Talent.have("书香门第")) S.prop.悟性 += 10;
      if (Talent.have("七窍玲珑")) S.prop.悟性 += 15;
      S.score = Object.values(S.subj).reduce((a, b) => a + b, 0);
    }

    function rollStartTalents() {
      const FAMILY_POOL = ["家财万贯", "家徒四壁", "小康之家", "书香门第", "官宦世家", "单亲家庭", "留守少年", "教师子女", "商人家庭", "艺术世家"];
      const START_POOL = ["热情", "豪", "高冷", "吃货", "游戏宅", "晨型人", "熬夜冠军", "运动健将", "大胃袋", "理财达人", "佛系少年", "玻璃心", "内耗者"];
      const NEGATIVE_POOL = ["厌学", "注意力涣散", "社恐", "网瘾", "拖延症", "考试焦虑", "偏食", "夜猫子", "暴躁"];
      const fam = FAMILY_POOL[rnd(FAMILY_POOL.length)];
      gainTalent(fam, "出身·免费");
      const n = rnd(3);
      const pool = [...START_POOL];
      for (let i = 0; i < n; i++) {
        const idx = rnd(pool.length);
        gainTalent(pool[idx], "与生俱来的特质·免费");
        pool.splice(idx, 1);
      }
      if (Math.random() < 0.35) {
        const neg = NEGATIVE_POOL[rnd(NEGATIVE_POOL.length)];
        gainTalent(neg, "天生的短板·免费");
      }
    }

    function weeklySettle() {
      const p = S.prop;

      // 心态
      if (Talent.have("道心如铁")) p.心态 = Math.max(130, p.心态 + rnd(21) - 10);
      else {p.心态 += rnd(31) - 15 - (Talent.have("内耗者") ? 10 : 0) + (Talent.have("佛系少年") ? 4 : 0) - (Talent.have("深度抑郁") ? 8 : 0);}
      p.心态 = clamp(p.心态, propFloor("心态"), 150);

      // 经济
      /* v1.1 削弱：家财万贯由每周 +150 降到 +45（和小康之家持平），
       * 但富家子弟依然有"不会为钱发愁"的底气（见下面的额外补贴）。 */
      if (Talent.have("家财万贯")) p.经济 += 45;
      if (Talent.have("家财万贯") && p.经济 < 80) p.经济 = 80;    // 兜底：不至于真的没钱
      else {
        let v = rnd(41) - 20 - (Talent.have("家徒四壁") ? 10 : 0) - (Talent.have("大胃袋") ? 10 : 0) - (Talent.have("吃货") ? 5 : 0) + (Talent.have("偏食") ? 10 : 0);
        if (Talent.have("理财达人") && v > 0) v = Math.floor(v * 1.5); p.经济 += v;
      }
      /* 注意：这里不能写 Math.max(0, …) —— 那样会把剧情模式的经济保底线
       * （storyFloorMoney，默认 10）抹掉，导致经济归零、触发「辍学打工」提前结束。
       * 统一走 propFloor 才和 modProp 的行为一致。 */
      p.经济 = Math.max(propFloor("经济"), num(p.经济, 0));

      // 健康
      if (Talent.have("钢筋铁骨") || Talent.have("天行健")) p.健康 = Math.max(130, p.健康 + rnd(21) - 10);
      else {p.健康 += rnd(31) - 15 - (Talent.have("体弱多病") ? rnd(5) : 0) + (Talent.have("大胃袋") ? 10 : 0) + (Talent.have("运动健将") ? 8 : 0) + (Talent.have("吃货") ? 3 : 0) - (Talent.have("熬夜冠军") ? 5 : 0) - (Talent.have("挑灯夜读") ? 3 : 0) - (Talent.have("偏食") ? 3 : 0) - (Talent.have("长期失眠") ? 8 : 0);}
      p.健康 = clamp(p.健康, propFloor("健康"), 150);

      // 效率
      if (Talent.have("天行健")) p.效率 = Math.max(130, p.效率 + rnd(21) - 10);
      else {p.效率 += rnd(31) - 15 + (Talent.have("知行合一") ? 0 : Math.floor((p.健康 - 100) / 8)) - (Talent.have("多动症") ? 20 : 0) + (Talent.have("自律机器") ? 5 : 0) + (Talent.have("晨型人") ? 6 : 0) + (Talent.have("熬夜冠军") ? 5 : 0) - (Talent.have("注意力涣散") ? 5 : 0) - (Talent.have("网瘾") ? 3 : 0) - (Talent.have("夜猫子") ? 5 : 0) - (Talent.have("严重网瘾") ? 10 : 0) - (Talent.have("长期失眠") ? 5 : 0);}
      p.效率 = clamp(p.效率, 10, 150);

      // 悟性：改为每周固定增长
      const wuGain = weeklyWuGain();
      if (wuGain > 0) {
        p.悟性 = clamp(p.悟性 + wuGain, 10, 150);
        if (wuGain >= 2) floatGain(`悟性 +${wuGain}`, true);
      }
      if (Talent.have("心如明镜")) p.心态 = clamp(p.心态 + 5, 0, 150);
      if (Talent.have("大彻大悟")) {p.心态 = clamp(p.心态 + 5, 0, 150); p.压力 = clamp(p.压力 - 5, 0, 150);}
      if (Talent.have("小康之家")) p.经济 += 40;
      if (Talent.have("官宦世家")) p.社交 = clamp(p.社交 + 10, 10, 150);
      if (Talent.have("单亲家庭")) {p.心态 = clamp(p.心态 - 3, 0, 150); p.效率 = clamp(p.效率 + 5, 10, 150);}
      if (Talent.have("留守少年")) {p.社交 = clamp(p.社交 - 5, 10, 150); p.效率 = clamp(p.效率 + 5, 10, 150);}
      if (Talent.have("商人家庭")) p.经济 = Math.floor(p.经济 * 1.03);
      if (Talent.have("艺术世家")) {p.心态 = clamp(p.心态 + 3, 0, 150);}
      if (Talent.have("静水流深")) {p.心态 = clamp(p.心态 + 3, 0, 150); p.压力 = clamp(p.压力 - 3, 0, 150);}
      if (Talent.have("心如止水")) {p.心态 = 140; p.压力 = 40;}
      if (Talent.have("天人合一")) {p.健康 = clamp(p.健康 + 5, 0, 150); p.效率 = clamp(p.效率 + 5, 10, 150); p.悟性 = clamp(p.悟性 + 5, 10, 150);}
      if (Talent.have("暴躁")) p.压力 = clamp(p.压力 + 5, 0, 150);
      if (Talent.have("深度抑郁")) {p.心态 = clamp(p.心态 - 8, 0, 150); p.压力 = clamp(p.压力 + 6, 0, 150);}
      if (Talent.have("考试焦虑")) p.心态 = clamp(p.心态 - 3, 0, 150);
      if (Talent.have("重度厌学")) p.压力 = clamp(p.压力 + 8, 0, 150);

      // 社交
      if (Talent.have("社交牛逼症")) p.社交 = Math.max(130, p.社交 + rnd(21) - 10);
      else {p.社交 += rnd(31) - 15 - (Talent.have("高冷") ? 5 : 0) - (Talent.have("社恐") ? 8 : 0) - (Talent.have("社交恐惧") ? 15 : 0) + (Talent.have("热情") ? 10 : 0);}
      p.社交 = clamp(p.社交, 10, 150);

      // 压力
      /* 压力
       * ★ v1.1：原来是纯粹的随机漫步（rnd(31)-15 长期无回归），
       *   三年下来压力迟早撞上 0 或 150 —— 配上"连续三周爆表就离场"的新规则，
       *   等于掷骰子决定生死，玩家做什么都救不回来。
       *   现在改成"向学业基线回归 + 随机扰动"：
       *     基线随年级升高（初一 25 → 初三 50），压力自然往基线回落一点；
       *     但连续学习每周净增约 +11，照样能把压力顶到爆表。
       *   这样"压力爆表"就变成玩家自己选出来的结果，而不是随机数。 */
      if (Talent.have("不吃压力")) p.压力 = 50 + rnd(21) - 10;
      else {
        const base = 25 + clampNum(S.term, 0, 5) * 5;
        p.压力 += (base - num(p.压力, base)) * 0.18
          + (rnd(21) - 10)
          + (Talent.have("玻璃心") ? 20 : 0)
          + (Talent.have("自律机器") ? 5 : 0)
          + (Talent.have("卷王") ? 10 : 0)
          - (Talent.have("佛系少年") ? 8 : 0);
      }
      p.压力 = clamp(p.压力, propFloor("压力"), 150);

      // 社团每周加成（入社后才生效）
      if (typeof applyClubPerk === "function") applyClubPerk();
      if (typeof checkClubTalent === "function") checkClubTalent();

      // 亲情：寄宿制下联系少了会慢慢变淡，需要主动维护
      // 约每两周 -1（不是每周都掉，否则 150 周会掉光）；
      // 压力过高时额外 -1（情绪不好容易和家人起摩擦）。
      // 想让亲情掉得更慢/更快，改 0.45 这个概率即可。
      const fc = (typeof famCfg === "function") ? famCfg() : {weeklyDrop: 0.45, weeklyDropVal: 4};
      const famDrop = (Math.random() < fc.weeklyDrop ? fc.weeklyDropVal : 0) + (p.压力 > 110 ? 2 : 0);
      p.亲情 = clamp(num(p.亲情, 80) - famDrop, propFloor("亲情"), 150);

      // 周结算遗忘
      // v1.1：decayMul 让遗忘变快，且"一周没学习"会额外流失 learnBleed。
      ensureSubj();
      const diff = difficultyCurve(S.week, S.term);
      const subs = subjectsOf(S.term);
      const cfgS = studyCfg();
      const idle = (S.didStudyWeek !== num(S.week, 0)) && (S.didQuizWeek !== num(S.week, 0));
      const bleed = idle ? clampNum(cfgS.learnBleed, 0, 0.5) : 0;
      subs.forEach(sub => {
        const decay = clampNum(diff.decay * 0.6 * cfgS.decayMul + bleed, 0, 0.9);
        S.subj[sub] = clamp(num(S.subj[sub], 30) * (1 - decay), 0, SUBJ_CAP);
      });
      if (idle && bleed > 0) S.idleWeeks = num(S.idleWeeks, 0) + 1;
      else S.idleWeeks = 0;
      recalcScore();

      // 属性兜底：任何一项变成非法值都会在这里被修正
      for (const k in PROP_RANGE) S.prop[k] = fixProp(k, S.prop[k]);

      // 重置本周事件计数
      S.evCntWeek = {};
      S.evCountWeek = 0;
    }

    function studySettle(action) {
      const p = S.prop;
      for (const k in PROP_RANGE) p[k] = fixProp(k, p[k]);
      ensureSubj();
      let base = num({study: 5.5, quiz: 2.0, rest: 1.2, social: 1.5, fun: 0.4, allowance: 0}[action], 0);
      let rate = base * (0.5 + p.效率 / 200) * (0.5 + p.悟性 / 200) * (0.6 + p.心态 / 250);
      if (!isFinite(rate)) rate = base;
      if (Talent.have("过目不忘")) rate *= 1.2;
      if (Talent.have("挑灯夜读") && action === "study") rate *= 1.15;
      if (Talent.have("卷王") && action === "study") rate *= 1.25;
      if (Talent.have("游戏宅")) rate *= 0.85;
      if (Talent.have("学习特困生")) rate *= 0.45;
      if (Talent.have("知行合一")) rate *= 1.08;
      if (Talent.have("学神降世")) rate *= 1.15;
      if (Talent.have("教师子女")) rate *= 1.05;
      if (Talent.have("笔耕不辍") && action === "study") rate *= 1.08;
      if (Talent.have("融会贯通")) rate *= 1.1;
      if (Talent.have("厌学") && action === "study") rate *= 0.8;
      if (Talent.have("重度厌学") && action === "study") rate *= 0.6;
      if (Talent.have("拖延症") && action === "study" && Math.random() < 0.3) rate *= 0.5;
      if (Talent.have("网瘾") && action === "fun") rate *= 1.5;
      if (Talent.have("严重网瘾") && action === "fun") rate *= 2.0;

      rate *= 1 - (p.压力 / 150) * studyCfg().stressPenalty;   // 压力越大越学不进去

      rate *= 1 + S.studyBuff - S.studyDebuff;
      rate *= 1 + (Math.random() * 0.5 - 0.35);

      const diff = difficultyCurve(S.week, S.term);
      rate *= diff.gainMul * studyCfg().gainMul;   // v1.1：收益整体下调

      const subs = subjectsOf(S.term);
      let weekTotal = 0;
      subs.forEach(s => {if (S.subj[s] === undefined || !isFinite(S.subj[s])) S.subj[s] = 25 + rnd(15)});
      if (!isFinite(rate) || rate < 0) rate = base;
      const weakest = subs.length ? subs.reduce((a, b) => S.subj[a] < S.subj[b] ? a : b) : null;
      const gains = [];
      for (const sub of subs) {
        let share = rate * (sub === weakest ? 1.2 : (0.75 + Math.random() * 0.3));
        if (!isFinite(share)) share = 0;
        const tn = SUBJ_TALENT[sub];
        if (tn && Talent.have(tn)) share *= 1.25;
        if (Talent.have("实验狂人") && ["物理", "化学"].includes(sub)) share *= 1.15;
        if (Talent.have("史海钩沉") && ["历史", "生物"].includes(sub)) share *= 1.15;
        if (Talent.have("书香门第") && ["语文", "历史"].includes(sub)) share *= 1.15;
        if (Talent.have("艺术世家") && ["语文", "英语"].includes(sub)) share *= 1.10;
        if (Talent.have("过目成诵") && ["语文", "英语"].includes(sub)) share *= 1.2;
        if (Talent.have("格物致知") && ["物理", "化学", "生物"].includes(sub)) share *= 1.2;
        if (Talent.have("运筹帷幄") && sub === "数学") share *= 1.2;
        if (Talent.have("博古通今") && ["历史", "政治", "地理"].includes(sub)) share *= 1.2;
        if (Talent.have("夜猫子") && action === "study" && Math.random() < 0.5) share *= 1.15;
        const rel = S.subj[sub] / (S.term + 1);
        if (rel < 180) share *= 1.15;
        else if (rel < 400) share *= 0.75;
        else share *= 0.25;
        share *= 1 + (Math.random() * 0.3 - 0.15);

        /* 遗忘只在「周结算」里发生一次（weeklySettle）。
         * ★ 这里以前也乘了一遍 (1-decay)，等于一周衰减两三次 ——
         *   结果就是学力永远涨不上去：初三时衰减量已经超过每周能学到的量，
         *   学力一路跌回个位数，rel 的 180 / 400 两档阈值也成了死代码。
         *   去掉这次重复衰减后，学力才真的能随年级累积起来。 */
        const before = num(S.subj[sub], 30);
        const after = num(before + share, before);
        S.subj[sub] = clamp(after, 0, SUBJ_CAP);
        const delta = S.subj[sub] - before;
        weekTotal += delta;
        /* 学科数值只在考试事件里出现，这里只说"哪科动了"，不说动了多少 */
        if (action === "study" && Math.abs(delta) > 2) gains.push(`${sub}${delta > 0 ? "▲" : "▼"}`);
      }
      recalcScore();
      if (action === "study" && gains.length) floatGain(gains.join(" "), true);
      if (S.buffWeeks > 0 && --S.buffWeeks === 0) S.studyBuff = 0;
      if (S.debuffWeeks > 0 && --S.debuffWeeks === 0) S.studyDebuff = 0;
      if (action === "study") {
        count("study");
        S.didStudyWeek = num(S.week, 0);      // 记一下，用于「天赋退化」判定
        p.压力 = clamp(p.压力 + 4 * studyCfg().stressMul, 0, 150);
      }
      if (action === "rest") {count("rest"); p.压力 = clamp(p.压力 - 10, 0, 150); p.健康 = clamp(p.健康 + 5, 0, 150); p.效率 = clamp(p.效率 + 8, 10, 150);}
      if (action === "social") {count("social"); S.didSocialWeek = num(S.week, 0); p.社交 = clamp(p.社交 + 6, 0, 150); p.心态 = clamp(p.心态 + 4, 0, 150); p.效率 = clamp(p.效率 + 3, 10, 150);}
      if (action === "fun") {count("fun"); p.心态 = clamp(p.心态 + (Talent.have("游戏宅") ? 16 : 8), 0, 150); p.压力 = clamp(p.压力 - 8, 0, 150);}
      // 注：原来的「打零工」已改为「向父母要零花钱」，走 allowanceSettle()
    }

    /* ==================================================================
     * 向父母要零花钱
     * ------------------------------------------------------------------
     * 初中生不适合打零工，改成向家里开口。
     * 金额随「亲情」浮动：亲情高，父母爽快地给、还多塞一点；
     * 亲情低，会被念叨甚至拒绝，并轻微伤亲情。
     * ================================================================== */

    function allowanceSettle(onDone) {
      const p = S.prop;
      for (const k in PROP_RANGE) p[k] = fixProp(k, p[k]);
      const fam = clampNum(p.亲情, 0, 150, 80);

      // 基础金额：亲情 60 时约 25，亲情 150 时约 60，亲情 20 时约 12
      let g = Math.round(12 + (fam - 20) * 0.36);
      if (Talent.have("理财达人")) g = Math.round(g * 1.25);

      /* ★ v1.1：开口本身就是有代价的 —— 亲情越低，开口掉得越多。
       * 亲情已经很僵的时候，多半直接要不到钱。 */
      const famCfgV = (typeof famCfg === "function") ? famCfg() : {askCost: 6, askCostRich: 2, lowAt: 40};
      const cost = (typeof askCostFam === "function") ? askCostFam() : 6;
      const who = (typeof parentCall === "function") ? parentCall(familyMain()) : "妈妈";

      let title, line, cls;
      if (fam >= 120) {
        // 感情好：父母主动多给
        if (Math.random() < 0.35) {
          g += 15;
          title = L("alw.t1");
          line = L("alw.l1", who);
          cls = "good";
          modProp("心态", 6); modProp("压力", -4); modProp("亲情", 2 - cost);
        } else {
          title = L("alw.t2");
          line = L("alw.l2", who);
          cls = "good";
          modProp("心态", 4); modProp("压力", -3); modProp("亲情", 1 - cost);
        }
      } else if (fam >= 70) {
        title = L("alw.t3");
        line = L("alw.l3", who);
        cls = "good";
        modProp("心态", 2); modProp("亲情", -cost);
      } else if (fam >= famCfgV.lowAt) {
        // 感情一般：会被念叨，钱也给得少
        g = Math.round(g * 0.7);
        title = L("alw.t4");
        line = L("alw.l4", who);
        cls = "";
        modProp("心态", -4); modProp("压力", 3); modProp("亲情", -2 - cost);
      } else {
        // 感情疏远：多半被拒（亲情越低，被拒的概率越高）
        const refuseP = clampNum(0.5 + (famCfgV.lowAt - fam) / famCfgV.lowAt * 0.35, 0.5, 0.9);
        if (Math.random() < refuseP) {
          g = 0;
          title = L("alw.t5");
          line = L("alw.l5", who);
          cls = "bad";
          modProp("心态", -8); modProp("压力", 6); modProp("亲情", -3 - cost);
        } else {
          g = Math.round(g * 0.5);
          title = L("alw.t6");
          line = L("alw.l6", who);
          cls = "bad";
          modProp("心态", -5); modProp("压力", 4); modProp("亲情", -2 - cost);
        }
      }

      // 开口要钱本身有一点心理成本（亲情高时抵消）
      if (fam < 100) modProp("压力", 2);
      if (g === 0) say(L("alw.refusedLog"), "bad");

      modProp("经济", g);
      S.actCount = (S.actCount || 0) + 1;
      S.evCntWeek = {};
      S.evCountWeek = 0;
      renderHUD();
      say(L("alw.log", title, g > 0 ? L("alw.got", g) : L("alw.none")), cls || "sys");
      if (cost > 0) say(L("alw.costLog", cost), "bad");
      /* 弹完这一个才继续走事件链 —— 否则两个弹窗会互相覆盖，
       * 玩家根本看不到父母说了什么。 */
      showPopup({
        kind: "free",
        badge: L("alw.badge"),
        title: `${L("alw.title")} · ${title}`,
        body: `<div style="line-height:2">${line}<br><br>
          <span style="color:var(--dim);font-size:.85rem">${L("alw.hint", Math.round(clampNum(p.亲情, 0, 150, 80)))}</span></div>`,
        options: [{t: g > 0 ? L("alw.thanks") : L("alw.know"), fn: () => {}}]
      }, () => {if (typeof onDone === "function") onDone();});
    }

    function exam(name) {
      const p = S.prop;
      for (const k in PROP_RANGE) p[k] = fixProp(k, p[k]);
      ensureSubj();
      const subs = subjectsOf(S.term) || [];
      const diff = difficultyCurve(S.week, S.term);
      const W = examWeights();
      let total = 0, rows = [], fullMarks = [], perfect = subs.length > 0;
      for (const sub of subs) {
        let v = examScoreOf(sub, p, diff, W);
        if (Talent.have("学霸光环")) v += 5;
        if (Talent.have("考场黑马")) v += 3;
        if (Talent.have("学神降世")) v += 8;
        if (Talent.have("文曲星")) v += 4;
        if (Talent.have("数学脑") && sub === "数学") v += 8;
        if (Talent.have("语感天成") && sub === "语文") v += 8;
        if (Talent.have("单词机器") && sub === "英语") v += 8;
        if (Talent.have("实验狂人") && ["物理", "化学"].includes(sub)) v += 8;
        if (Talent.have("史海钩沉") && ["历史", "生物"].includes(sub)) v += 8;
        if (Talent.have("运筹帷幄") && sub === "数学") v += 8;
        if (Talent.have("过目成诵") && ["语文", "英语"].includes(sub)) v += 5;
        if (Talent.have("格物致知") && ["物理", "化学", "生物"].includes(sub)) v += 5;
        if (Talent.have("博古通今") && ["历史", "政治", "地理"].includes(sub)) v += 5;
        if (Talent.have("融会贯通")) v += 3;
        if (Talent.have("考试焦虑")) v -= 8;
        v = Math.round(clampNum(v, 0, 100, 0));
        if (v === 100) fullMarks.push(sub);
        if (v < 90) perfect = false;
        total += v;
        const color = v >= 90 ? "var(--green)" : (v >= 60 ? "var(--gold)" : "var(--red)");
        rows.push(`<div class="subjrow"><span style="width:3em">${TZ(sub)}</span><div class="bar"><i style="width:${v}%;background:${color}"></i></div><b style="color:${color};width:2.5em;text-align:right">${v}</b></div>`);
      }
      if (S.examCharm) {S.examCharm = false;}
      if (S.penCharm) {S.penCharm = false;}
      const avg = subs.length ? Math.round(total / subs.length) : 0;
      S.lastExamScore = clampNum(avg, 0, 100); S.bestExam = Math.max(num(S.bestExam, 0), S.lastExamScore); count("exam");
      if (avg >= 80) count("goodExam");   // 用于「考试焦虑」的破茧进度
      say(L("exam.log", TZ(name), Math.round(total), subs.length * 100, avg), "exam");
      if (avg >= 90) {say(L("exam.top"), "good");}
      else if (avg < 45) {say(L("exam.bad"), "bad"); modProp("心态", -8); modProp("压力", 10);}
      else modProp("心态", 2);
      if (fullMarks.length) {S.cnt.subjFull = (S.cnt.subjFull || 0) + fullMarks.length;}
      if (perfect && subs.length > 0) count("allPerfect");
      showModal(L("exam.sheet", TZ(name)), `<div>${rows.join("")}</div><div style="margin-top:10px;text-align:right;color:var(--gold)">${L("exam.avg")}:<b>${avg}</b> / ${L("exam.full")}</div>${fullMarks.length ? `<div style="color:var(--green);margin-top:6px">${L("exam.fullMarks", TZ(fullMarks.join("、")))}</div>` : ""}`,
        [{
          t: L("exam.accept"), fn: () => {
            if (!S.daoDone && (avg >= 82 || p.悟性 >= 115) && Math.random() < 0.5) {examDao(avg);}
            else {nextWeek();}
          }
        }], null, false, false, {kind: "fixed"});
      return avg;
    }
