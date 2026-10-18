/* ==================================================================
 * 内容层 · 固定事件与假期副本
 * ==================================================================
 * 开学、月考、期中、期末、运动会、艺术节、假期副本、考场悟道。
 * fixedEventOf() 是每学期的日程表，wit 是本学期第几周。
 *
 * 维护等级：内容层（可改日程）
 * ============================================================ */

    const GRADES = ["初一", "初二", "初三"], WEEKS_PER_TERM = 24, TERMS = 6;

    /* ==================================================================
     * 每学期的固定日程表
     * ------------------------------------------------------------------
     * wit = 本学期第几周（0~24）。大致对应：
     *   wit 0 ≈ 9 月初开学      wit 10 ≈ 11 月期中考试
     *   wit 8 ≈ 10 月底（体艺节） wit 20 ≈ 1 月期末考试
     *   wit 24 = 学期结束、假期副本
     * ------------------------------------------------------------------
     * ★ 体育艺术文化节：红塔中学一年只办一次。
     *   因此只在「上学期」（term 0 / 2 / 4）的第 8 周出现，
     *   约在 10~11 月、期中考试（第 10 周）之前。
     *   想改成期中考后，把 8 改成 12 即可。
     * ================================================================== */
    const SPORTS_FEST_WEEK = 8;

    function fixedEventOf(term, wit) {
      if (wit === 0) return {id: "newTerm"};
      if (wit === 5) return {id: "exam", name: "月考(一)"};
      if (term % 2 === 0 && wit === SPORTS_FEST_WEEK) return {id: "sportsMeet"};   // 一年一次
      if (wit === 10) return {id: "exam", name: "期中考试"};
      if (wit === 15) return {id: "exam", name: "月考(二)"};
      if (wit === 20) return {id: "exam", name: "期末考试"};
      if (term % 2 === 1 && wit === 17) return {id: "artFest"};                    // 下学期：社团展演季
      if (wit === 24) return {id: "vacation"};
      return null;
    }

    /* 学校文化语料：校训 + 立行文化四立 + 玉溪本土元素 */
    const CULTURE_LINES = [
      "人生在立，行达天下。", "立德、立志、立学、立身。",
      "每一步都算数。", "立行不仅是当下的行动，更是面向未来的品格。",
      "行者不仅是赶路的人，更是创造风景的人。",
      "天行健，君子以自强不息。", "路漫漫其修远兮，吾将上下而求索。",
      "博观而约取，厚积而薄发。", "不积跬步，无以至千里。",
      "宝剑锋从磨砺出，梅花香自苦寒来。",
    ];

    const OPENING_LINES = [
      "九月的风卷着桂花香，你背着新书包站在校门口。红色教学楼下，「人生在立，行达天下」八个字正对着你。",
      "校门口的电子屏滚动着一行字：登上立行号，向未来出发。你深吸一口气，走了进去。",
      "蝉鸣还没散尽。你低头看了看崭新的校牌，上面印着你的名字——从今天起，你是红塔少年了。",
      "操场上红旗招展，你混在人群里。有人念叨着入学誓词，你也跟着念了一遍。",
      "母亲在校门口叮嘱了最后一句。你点点头，转身走进了那栋红色的教学楼。",
    ];

    const OPENING_TALENTS_HINT = [
      "天赋不会在此刻选择，它们将在你未来的每一个抉择中自然觉醒。",
      "你此刻一无所有，但每一次选择都在悄悄塑造你。",
      "三年之后回望，你会明白：所谓天赋，不过是选择留下的痕迹。",
      "「立行号」已经进站，这趟车上的每一步，都算数。",
    ];

    function runFixed(f) {
      switch (f.id) {
        case "newTerm": {
          if (S.term === 0) {
            const line = OPENING_LINES[rnd(OPENING_LINES.length)];
            const hint = OPENING_TALENTS_HINT[rnd(OPENING_TALENTS_HINT.length)];
            const sc = GAME_CONFIG.school;
            showModal(`${sc.name} · 初一开学`,
              `<div>${line}<br><br><span style='color:var(--gold)'>${S.name}</span>，${gradeName()}${termName()}，正式开始。<br>
               <span style='color:var(--dim);font-size:.85rem'>${sc.motto}　|　${sc.culture.join(" · ")}</span><br><br>
               <span style='color:var(--dim)'>${hint}</span></div>`,
              [{t: "登上立行号", fn: () => { }}], () => {nextWeek();}, false, false, {kind: "fixed"});
          } else {
            say(`🎒 ${gradeName()}${termName()}开学了!`, "sys");
            say(`「${CULTURE_LINES[rnd(CULTURE_LINES.length)]}」`, "sys");
            if (S.term === 4) say("初三了。黑板右上角出现了中考倒计时。", "exam");
            nextWeek();
          }
          break;
        }
        case "exam": {
          const v = exam(f.name);
          if (f.name === "期末考试" && v >= 85) {modProp("经济", 80); say("压岁钱/奖励到手!经济 +80", "good");}
          break;
        }
        case "sportsMeet":
          showModal("体育艺术文化节 · 行者",
            "今年的体育艺术文化节开幕了，主题是「行者」。<br><span style='color:var(--dim);font-size:.85rem'>行者不仅是赶路的人，更是创造风景的人。</span>", [
            {t: "报 1000 米长跑", fn: () => {count("sport"); if (Talent.have("运动健将") || S.prop.健康 > 115) {modProp("社交", 10); modProp("心态", 10); count("sportWin"); say("🏃 你拿下了长跑冠军，全场都在喊你的名字!", "good");} else if (S.prop.健康 < 70) {modProp("健康", -8); say("你跑到一半被扶下了跑道……", "bad");} else {modProp("健康", 5); modProp("心态", 4); say("完赛就是胜利!", "good");} }},
            {t: "参加文艺汇演", fn: () => {if (S.prop.社交 > 100 || Talent.have("热情")) {modProp("心态", 10); modProp("社交", 8); say("🎨 你的节目惊艳全场!", "good");} else {modProp("心态", -4); modProp("社交", 4); say("上台前手一直在抖，但你还是唱完了。", "");} }},
            {t: "当后勤志愿者", fn: () => {count("volunteer"); modProp("社交", 6); modProp("心态", 5); say("🙏 你搬了一上午的矿泉水，也被记在了表扬名单里。", "good");}},
            {t: "在看台上写作业", fn: () => {S.studyBuff += 0.1; S.buffWeeks = Math.max(S.buffWeeks, 1); say("喧闹与你无关。", "");}},
          ], () => {nextWeek();}, false, false, {kind: "fixed"});
          break;
        case "artFest":
          showModal("社团展演季", "课后服务展演开始报名了：朗诵、话剧、合唱、黏土国画、英语配音……", [
            {t: "上台表演", fn: () => {if (S.prop.社交 > 100 || Talent.have("热情")) {modProp("心态", 10); modProp("社交", 8); say("🎨 你的节目惊艳全场!", "good");} else {modProp("心态", -4); modProp("社交", 4); say("忘词了，但你撑到了最后。", "");} }},
            {t: "做幕后布置", fn: () => {modProp("社交", 4); modProp("压力", -4); say("默默付出也很快乐。", "good");}},
            {t: "当观众", fn: () => {modProp("心态", 4); modProp("悟性", 2); say("看了场热闹的演出。", "");}},
          ], () => {nextWeek();}, false, false, {kind: "fixed"});
          break;
        case "vacation": vacationDungeon(); break;
      }
    }

    function vacationDungeon() {
      const termNames = ["初一", "初二", "初三"];
      setBackground("alt");            // 假期换一张更清爽的背景
      showModal(`假期副本 · ${termNames[Math.min(2, Math.floor(S.term / 2))]}篇`, "学期结束!假期是一张崭新的地图。选择你的假期副本——", [
        {t: "📚 补习营副本", fn: () => dungeonTutor(1)},
        {t: "🧗 社会实践副本", fn: () => dungeonSocial(1)},
        {t: "🏝 躺平休养副本", fn: () => dungeonRest(1)},
      ], null, false, false, {kind: "fixed"});
    }

    function dungeonEnd() {setBackground("main"); S.term++; nextWeek();}

    function dungeonTutor(stage) {
      if (stage === 1) showModal("补习营 · 第一幕", "集训营的第一天,老师发下一张摸底卷。你的策略?", [
        {t: "全力冲刺", fn: () => {if (S.lastExamScore >= 70 || Talent.have("学霸光环")) {say("你杀进了尖子班!", "good"); S.studyBuff += 0.2; S.buffWeeks = Math.max(S.buffWeeks, 6); dungeonTutor(2);} else {say("差一点，进了普通班。", "bad"); S.studyBuff += 0.1; S.buffWeeks = Math.max(S.buffWeeks, 6); dungeonTutor(2);} }},
        {t: "稳扎稳打", fn: () => {S.studyBuff += 0.12; S.buffWeeks = Math.max(S.buffWeeks, 6); dungeonTutor(2);}},
      ], null, false, false, {kind: "fixed"});
      else showModal("补习营 · 终幕", "集训最后一天，有个全国竞赛的推荐名额，老师问谁想要。", [
        {t: "举手!", fn: () => {const subs = subjectsOf(S.term) || []; if (subs.length) {const weak = subs.reduce((a, b) => num(S.subj[a], 30) < num(S.subj[b], 30) ? a : b); S.subj[weak] = clamp(num(S.subj[weak], 30) + 60, 0, SUBJ_CAP); recalcScore(); say(`整个假期的积累爆发，最弱科【${weak}】学力 +60！`, "good");} else say("你把整个假期的笔记都带回了家。", "good"); count("dungeon"); checkAch(); dungeonEnd();}},
        {t: "默默回家", fn: () => {(subjectsOf(S.term) || []).forEach(s => {S.subj[s] = clamp(num(S.subj[s], 30) * 1.12, 0, SUBJ_CAP);}); recalcScore(); say("全科巩固完成，各科 +12%！", "good"); modProp("压力", 10); count("dungeon"); checkAch(); dungeonEnd();}},
      ], null, false, false, {kind: "fixed"});
    }

    function dungeonSocial(stage) {
      if (stage === 1) showModal("社会实践 · 第一幕", "社区招募假期志愿者,同时奶茶店也在招兼职。你选——", [
        {t: "当志愿者", fn: () => {modProp("社交", 12); modProp("心态", 8); say("服务他人,收获满满。", "good"); if (Math.random() < 0.3) gainTalent("贵人相助", "社区主任很欣赏你"); dungeonSocial(2);}},
        {t: "奶茶店兼职", fn: () => {let g = Talent.have("理财达人") ? 300 : 200; modProp("经济", g); say(`一个假期的工资:${g}!`, "good"); count("partjob"); dungeonSocial(2);}},
      ], null, false, false, {kind: "fixed"});
      else showModal("社会实践 · 终幕", "假期最后,社区/店里要评选「假期之星」。", [
        {t: "争取一下", fn: () => {if (S.prop.社交 > 100 || Talent.have("热情")) {modProp("心态", 12); modProp("社交", 8); say("🏅 你当选假期之星!", "good");} else {modProp("心态", 3); say("没评上,但过程本身就是收获。", "");} count("dungeon"); checkAch(); dungeonEnd();}},
        {t: "事了拂衣去", fn: () => {modProp("压力", -10); say("深藏功与名。", "good"); count("dungeon"); checkAch(); dungeonEnd();}},
      ], null, false, false, {kind: "fixed"});
    }

    function dungeonRest(stage) {
      if (stage === 1) showModal("躺平休养 · 第一幕", "难得的假期,你打算怎么躺?", [
        {t: "规律作息", fn: () => {modProp("健康", 25); modProp("压力", -25); say("🏝 身心彻底修复!", "good"); dungeonRest(2);}},
        {t: "昼夜颠倒", fn: () => {modProp("心态", 15); modProp("健康", -10); say("快乐是快乐,就是有点虚。", ""); dungeonRest(2);}},
      ], null, false, false, {kind: "fixed"});
      else showModal("躺平休养 · 终幕", "假期最后一天,你忽然有点心慌:作业还没动。", [
        {t: "通宵补作业", fn: () => {S.studyBuff += 0.05; S.buffWeeks = Math.max(S.buffWeeks, 2); modProp("健康", -8); say("一支笔,一个晚上,一个奇迹。", "bad"); count("dungeon"); checkAch(); dungeonEnd();}},
        {t: "摆烂到底", fn: () => {modProp("心态", 5); modProp("压力", 10); say("开学等着挨批吧。", ""); count("dungeon"); checkAch(); dungeonEnd();}},
      ], null, false, false, {kind: "fixed"});
    }

    /* ==================================================================
     * 读书角
     * ================================================================== */

    function examDao(v) {
      showModal("考场悟道", "收卷铃响前的最后一刻，你盯着试卷，忽然觉得天地一静——<br>三年的知识在你脑海中连成了一条线。<br><br><span style='color:var(--gold)'>这是一次顿悟的机会，你选择抓住哪一种「道」？</span>", [
        {t: "以笔为剑，杀伐果断", sub: "悟【学神降世】Lv.7(需悟性≥100)", disabled: () => S.prop.悟性 < 100, fn: () => {S.daoDone = true; gainTalent("学神降世", "考场悟道"); nextWeek();}},
        {t: "文思泉涌，下笔如有神", sub: "悟【文曲星】Lv.6", fn: () => {S.daoDone = true; gainTalent("文曲星", "考场悟道"); nextWeek();}},
        {t: "返观内照，照见本心", sub: "悟【心如明镜】Lv.6(需心态≥100)", disabled: () => S.prop.心态 < 100, fn: () => {S.daoDone = true; gainTalent("心如明镜", "考场悟道"); nextWeek();}},
        {t: "电光石火，融会贯通", sub: "悟【知行合一】Lv.6(需效率≥100)", disabled: () => S.prop.效率 < 100, fn: () => {S.daoDone = true; gainTalent("知行合一", "考场悟道"); nextWeek();}},
        {t: "心如止水，万念俱寂", sub: "悟【心如止水】Lv.7(需心态≥115)", disabled: () => S.prop.心态 < 115, fn: () => {S.daoDone = true; gainTalent("心如止水", "考场悟道"); nextWeek();}},
        {t: "天人合一，物我两忘", sub: "悟【天人合一】Lv.7(需健康≥115且效率≥115)", disabled: () => S.prop.健康 < 115 || S.prop.效率 < 115, fn: () => {S.daoDone = true; gainTalent("天人合一", "考场悟道"); nextWeek();}},
        {t: "顺其自然，不为所动", sub: "悟性 +5", fn: () => {modProp("悟性", 5); say("灵光散去了，但留下了一点什么。悟性 +5", ""); nextWeek();}},
      ], null, false, false, {kind: "fixed"});
    }
