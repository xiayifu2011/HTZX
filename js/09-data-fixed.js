/* ==================================================================
 * 内容层 · 固定事件与假期副本
 * ==================================================================
 * 开学、月考、期中、期末、运动会、艺术节、假期副本、考场悟道。
 * fixedEventOf() 是每学期的日程表，wit 是本学期第几周。
 *
 * 维护等级：内容层（可改日程）
 * ============================================================ */

    /* 每学期 20 周，六个学期共 120 周（v1.2）。
 * 寒暑假不计入周数 —— 它是独立于 S.week 的一个阶段，见 js/05e-data-vacation.js。
 * 改这个数字会同时影响：月份分配、固定日程的 wit、中考触发点。 */
    const GRADES = ["初一", "初二", "初三"], WEEKS_PER_TERM = 20, TERMS = 6;

    /* ==================================================================
     * 每学期的固定日程表
     * ------------------------------------------------------------------
     * wit = 本学期第几周（1~20，v1.2 起每学期 20 周）。大致对应：
     *   wit 1  = 开学             wit 11 = 11 月期中考试
     *   wit 8  = 10 月底（体艺节）  wit 19 = 期末考试
     *   wit 20 = 学期结束 → 进入假期（假期不算周，见 js/05e-data-vacation.js）
     * ------------------------------------------------------------------
     * ★ 体育艺术文化节：红塔中学一年只办一次。
     *   因此只在「上学期」（term 0 / 2 / 4）的第 8 周出现，
     *   约在 10~11 月、期中考试（第 10 周）之前。
     *   想改成期中考后，把 8 改成 12 即可。
     * ================================================================== */
    const SPORTS_FEST_WEEK = 8;

    /* ==================================================================
     * v1.3 体育艺术文化节：一年一个主题
     * ------------------------------------------------------------------
     * 一年只办一次，所以每一届都有一个自己的名字：
     *   初一 · 少年   —— 刚进校，一切都是新的
     *   初二 · 行者   —— 走到一半，开始问"我要往哪去"
     *   初三 · 星辰大海 —— 要走了，看向外面的世界
     * 按「第几届」取（term 0/2/4 都是上学期），取不到就退回最后一届。
     * ================================================================== */
    const SPORTS_FEST_THEMES = [
      {grade: "初一", name: "少年",
       line: "少年二字，写出来只有十一画，读出来却用了整整三年。",
       desc: "你刚进校，看什么都新鲜。跑道是新刷的，看台上的彩旗也是新的。"},
      {grade: "初二", name: "行者",
       line: "行者不仅是赶路的人，更是创造风景的人。",
       desc: "走到一半了。有人开始加速，有人停下来想自己要去哪。"},
      {grade: "初三", name: "星辰大海",
       line: "从红塔出发的人，终会去看更大的世界。",
       desc: "这是你在红塔的最后一次体艺节。看台还是那个看台，你却已经不一样了。"},
    ];

    /* 这一届的主题（term 0/2/4 → 少年/行者/星辰大海） */
    function sportsFestTheme(term) {
      const t = clampNum(term, 0, 9, 0);
      const i = clamp(Math.floor(t / 2), 0, SPORTS_FEST_THEMES.length - 1);
      return SPORTS_FEST_THEMES[i];
    }

    /* ==================================================================
     * v1.3 节假日
     * ------------------------------------------------------------------
     * 长假日（国庆 / 元旦 / 清明 / 劳动节）占掉一整周：
     *   那一周的行动面板换成节假日专属内容，见 HOLIDAY_EVENTS。
     * 短假日（中秋 / 端午 / 五四 / 教师节）不占周：
     *   只是在那一周里插一条事件，弹完照常上课。
     * ================================================================== */

    const HOLIDAY_EVENTS = {
      national: {
        t: "🇨🇳 国庆 · 七天",
        /* 七天假够出门走一趟 —— 开了这个开关，选项里会多出一个「出门走走」。
         * 想给别的长假日也开，照抄这一行即可。 */
        allowTravel: true,
        c: "校门口挂起了国旗，广播站从早放到晚。\n七天假，作业有三套卷子，还有一张手抄报。\n你打算怎么过这几天？",
        opts: [
          {t: "先把作业做完", run: ["效率 +7", "悟性 +4", "心态 +5", "压力 -5", "提示 三天写完三套卷子，剩下的四天你睡了个够。!good"]},
          {t: "和家里人出去走走", run: ["亲情 +8", "心态 +10", "压力 -12", "健康 +5", "经济 -60", "提示 你去了趟不远的地方，拍了一堆照片。!good"]},
          {t: "约同学出去玩", run: ["社交 +10", "心态 +8", "压力 -9", "经济 -50", "提示 你们在街上逛了一整天，走到腿酸。!good"]},
          {t: "在家躺七天", run: ["健康 +8", "压力 -14", "效率 -5", "心态 +6", "提示 你什么也没干，七天就这么过去了。"]},
          {t: "回一趟老家", run: ["亲情 +12", "心态 +9", "压力 -10", "经济 -40", "提示 奶奶做了一桌子菜，你吃了三碗。!good"]},
        ]
      },
      newyear: {
        t: "🎆 元旦 · 新年第一天",
        c: "校门口换了新横幅。班里在筹备元旦联欢，\n黑板上有人写了「新年快乐」四个大字。",
        opts: [
          {t: "报名表演节目", run: ["社交 +9", "心态 +10", "压力 -4", "计数 志愿", "提示 你唱完的时候，底下有人在喊安可。!good"]},
          {t: "帮忙布置教室", run: ["社交 +6", "心态 +7", "效率 +4", "计数 志愿", "提示 你把彩带挂满了整个教室。!good"]},
          {t: "写一张新年计划", run: ["悟性 +6", "效率 +8", "心态 +5", "学习加成 +10% 2周", "提示 你写下了三条，贴在书桌前面。!good"]},
          {t: "当观众", run: ["心态 +6", "社交 +3", "压力 -6", "提示 你吃着瓜子看完了整场联欢。!good"]},
        ]
      },
      qingming: {
        t: "🌿 清明 · 三天",
        c: "清明前后，雨断断续续下了两天。\n有人说要回老家扫墓，有人说要留在学校补课。",
        opts: [
          {t: "回老家扫墓", run: ["亲情 +10", "心态 +7", "压力 -9", "经济 -40", "提示 山上的草长得很高，你跟着走了很远。!good"]},
          {t: "留在学校自习", run: ["效率 +7", "悟性 +5", "健康 -3", "压力 +4", "提示 空荡荡的教室里只有三个人。"]},
          {t: "和同学去踏青", run: ["社交 +8", "健康 +7", "心态 +9", "压力 -10", "计数 运动", "提示 雨后的山很干净，你们走到半山腰。!good"]},
          {t: "在家补觉", run: ["健康 +9", "压力 -12", "效率 -4", "提示 你睡了两天，醒来时天还亮着。"]},
        ]
      },
      labour: {
        t: "🛠️ 劳动节 · 五天",
        c: "五一放假五天。\n老师说，这个假期最适合补短板——但也没人真的这么干。",
        opts: [
          {t: "补最弱的那一科", run: ["效率 +8", "悟性 +6", "压力 +5", "健康 -4", "学力 最弱 +45", "提示 你把最弱那科的错题重做了一遍。!good"]},
          {t: "帮家里干活", run: ["亲情 +9", "健康 +5", "心态 +7", "计数 志愿", "提示 你干了一整天活，晚上倒头就睡。!good"]},
          {t: "出去玩", run: ["心态 +10", "社交 +7", "压力 -11", "经济 -60", "提示 你玩了五天，回来时才想起作业。"]},
          {t: "做一次志愿服务", run: ["社交 +8", "心态 +8", "计数 志愿", "计数 实践", "提示 你在路口站了一上午，举着小红旗。!good"]},
        ]
      },
      midautumn: {
        t: "🥮 中秋",
        c: "食堂窗口摆出了月饼，甜的咸的各一堆。\n晚上月亮很圆，有人在操场上坐着看。",
        opts: [
          {t: "和家人一起过", run: ["亲情 +10", "心态 +9", "压力 -8", "提示 你把月饼掰成四份，一人一块。!good"]},
          {t: "和同学分月饼", run: ["社交 +8", "心态 +7", "经济 -20", "提示 你们在操场上坐着，把一盒月饼分完了。!good"]},
          {t: "一个人在操场看月亮", run: ["悟性 +6", "心态 +5", "压力 -7", "提示 月亮很亮，操场上有风。"]},
        ]
      },
      dragonboat: {
        t: "🛶 端午",
        c: "食堂里粽子的味道飘了一整天。\n有人争论甜的好吃还是咸的好吃，争了一节课。",
        opts: [
          {t: "吃甜的", run: ["心态 +7", "健康 +3", "经济 -15", "提示 红枣馅的，你从小吃到大。!good"]},
          {t: "吃咸的", run: ["心态 +7", "健康 +3", "经济 -15", "提示 肉馅的，第一口有点怪，第二口就上瘾了。!good"]},
          {t: "去看赛龙舟", run: ["社交 +6", "心态 +8", "悟性 +5", "压力 -6", "提示 鼓点一下一下，船飞快地往前冲。!good"]},
        ]
      },
      youth: {
        t: "🎓 五四青年节",
        c: "下午放假半天，初二的入团仪式在礼堂举行。\n念到名字的人一个一个走上台。",
        opts: [
          {t: "认真听完仪式", run: ["心态 +9", "悟性 +5", "效率 +4", "提示 念到你名字的时候，你把背挺直了。!good"]},
          {t: "去操场打球", run: ["健康 +7", "压力 -8", "社交 +5", "计数 运动", "提示 半天假，你打到了天黑。!good"]},
          {t: "回教室写作业", run: ["效率 +6", "压力 +3", "健康 -2", "提示 礼堂里的声音隔着窗户传过来。"]},
        ]
      },
      teacher: {
        t: "🍎 教师节",
        c: "讲台上堆了一排花和卡片。\n有人提议全班凑钱买个大蛋糕。",
        opts: [
          {t: "写一张卡片", run: ["心态 +8", "社交 +6", "悟性 +4", "提示 你写了三行字，最后一行是自己想的。!good"]},
          {t: "跟着凑钱买蛋糕", run: ["社交 +7", "心态 +7", "经济 -20", "提示 蛋糕切开的时候，全班都在笑。!good"]},
          {t: "什么都不做", run: ["心态 +2", "提示 你什么也没说，只是那天的课听得很认真。"]},
        ]
      },
    };

    function fixedEventOf(term, wit) {
      /* v1.2：一学期 20 周，日程重新排布。
       * 期末考放在第 19 周，第 20 周留给「学期结束 → 假期」。
       *
       * v1.3：两个特殊考期
       *   初二下（term 3）第 19 周 = 生地会考 —— 考完生物地理成绩锁死
       *   初三下（term 5）第 19 周 = 中考   —— 其余科目结算，合上生地成绩
       * 另外实验操作考试放在第 14 周（临近大考，见 runFixed）。 */
      /* 节假日：长假日占整周，短假日只在这一周开头弹一条（弹完照常上课）。
       * 都避开开学周、考试周和假期周 —— 那些更重要。 */
      if (wit !== 1 && wit !== 5 && wit !== 11 && wit !== 15 && wit !== 19 && wit !== 20) {
        const hd = (typeof holidayOf === "function") ? holidayOf(term * WEEKS_PER_TERM + (wit - 1), term) : null;
        if (hd) return {id: "holiday", hid: hd.id};
      }
      if (wit === 1) return {id: "newTerm"};
      if (wit === 5) return {id: "exam", name: "月考(一)"};
      if (term % 2 === 0 && wit === SPORTS_FEST_WEEK) return {id: "sportsMeet"};   // 一年一次
      if (wit === 11) return {id: "exam", name: "期中考试"};
      /* 实验操作考试：临近生地会考 / 中考，各 10 分，计入中考总分 */
      if (term === 3 && wit === 14) return {id: "expExam", name: "生物"};
      if (term === 5 && wit === 14) return {id: "expExam", name: "物化"};
      if (wit === 15) return {id: "exam", name: "月考(二)"};
      if (term % 2 === 1 && wit === 17) return {id: "artFest"};                    // 下学期：社团展演季
      if (term === 3 && wit === 19) return {id: "hk", name: "生地会考"};           // 初二下期末
      if (term === 5 && wit === 19) return {id: "zhongkao"};                       // 初三下期末 = 中考
      if (wit === 19) return {id: "exam", name: "期末考试"};
      if (wit === 20) return {id: "vacation"};
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
          /* ★ 开学不占一周。
           * 以前开学弹窗关掉就直接 nextWeek()，等于把「本学期第 1 周」
           * 整个跳过去了 —— 20 周的学期实际只有 19 周能玩，
           * 而且顶栏会从「第 21 周」直接跳到「第 22 周」。
           * 现在关掉弹窗后照常进入本周行动，第 1 周是一周正经的课。 */
          if (S.term === 0) {
            const line = OPENING_LINES[rnd(OPENING_LINES.length)];
            const hint = OPENING_TALENTS_HINT[rnd(OPENING_TALENTS_HINT.length)];
            const sc = GAME_CONFIG.school;
            showModal(`${sc.name} · 初一开学`,
              `<div>${line}<br><span style='color:var(--gold)'>${S.name}</span>，${gradeName()}${termName()}，正式开始。<br>
               <span style='color:var(--dim);font-size:.85rem'>${sc.motto}　|　${sc.culture.join(" · ")}</span><br>
               <span style='color:var(--dim)'>${hint}</span></div>`,
              [{t: "登上立行号", fn: () => { }}],
              () => {S.fixedDone = true; setTimeout(ensureActionPanel, 0);},
              false, false, {kind: "fixed"});
          } else {
            say(`🎒 ${gradeName()}${termName()}开学了!`, "sys");
            say(`「${CULTURE_LINES[rnd(CULTURE_LINES.length)]}」`, "sys");
            if (S.term === 4) say("初三了。黑板右上角出现了中考倒计时。", "exam");
            S.fixedDone = true;
            offerActions();
          }
          break;
        }
        case "exam": {
          const v = exam(f.name);
          if (f.name === "期末考试" && v >= 85) {modProp("经济", 80); say("压岁钱/奖励到手!经济 +80", "good");}
          break;
        }
        case "sportsMeet": {
          const th = sportsFestTheme(S.term);
          showModal(`体育艺术文化节 · ${th.name}`,
            `${th.grade}的体育艺术文化节开幕了，今年主题是「${th.name}」。<br>
             <span style='color:var(--gold)'>${th.line}</span><br>
             <span style='color:var(--dim);font-size:.85rem'>${th.desc}</span>`, [
            {t: "报 1000 米长跑", fn: () => {count("sport"); if (Talent.have("运动健将") || S.prop.健康 > 115) {modProp("社交", 10); modProp("心态", 10); count("sportWin"); say("🏃 你拿下了长跑冠军，全场都在喊你的名字!", "good");} else if (S.prop.健康 < 70) {modProp("健康", -8); say("你跑到一半被扶下了跑道……", "bad");} else {modProp("健康", 5); modProp("心态", 4); say("完赛就是胜利!", "good");} }},
            {t: "参加文艺汇演", fn: () => {if (S.prop.社交 > 100 || Talent.have("热情")) {modProp("心态", 10); modProp("社交", 8); say("🎨 你的节目惊艳全场!", "good");} else {modProp("心态", -4); modProp("社交", 4); say("上台前手一直在抖，但你还是唱完了。", "");} }},
            {t: "当后勤志愿者", fn: () => {count("volunteer"); modProp("社交", 6); modProp("心态", 5); say("🙏 你搬了一上午的矿泉水，也被记在了表扬名单里。", "good");}},
            {t: "在看台上写作业", fn: () => {S.studyBuff += 0.1; S.buffWeeks = Math.max(S.buffWeeks, 1); say("喧闹与你无关。", "");}},
          ], () => {nextWeek();}, false, false, {kind: "fixed"});
          break;
        }
        case "artFest":
          showModal("社团展演季", "课后服务展演开始报名了：朗诵、话剧、合唱、黏土国画、英语配音……", [
            {t: "上台表演", fn: () => {if (S.prop.社交 > 100 || Talent.have("热情")) {modProp("心态", 10); modProp("社交", 8); say("🎨 你的节目惊艳全场!", "good");} else {modProp("心态", -4); modProp("社交", 4); say("忘词了，但你撑到了最后。", "");} }},
            {t: "做幕后布置", fn: () => {modProp("社交", 4); modProp("压力", -4); say("默默付出也很快乐。", "good");}},
            {t: "当观众", fn: () => {modProp("心态", 4); modProp("悟性", 2); say("看了场热闹的演出。", "");}},
          ], () => {nextWeek();}, false, false, {kind: "fixed"});
          break;
        case "vacation":
          /* v1.2：假期不再是一张副本，而是学期之间的独立阶段。
           * 内容见 js/05e-data-vacation.js。 */
          if (typeof startVacation === "function") startVacation();
          else dungeonEnd();      // 兜底：文件没加载时退回旧行为
          break;
        /* -------- v1.3：节假日 -------- */
        case "holiday": {
          runHoliday(f.hid);
          break;
        }
        /* -------- v1.3：实验操作考试（各 10 分，计入中考） -------- */
        case "expExam": {
          runExpExam(f.name);
          break;
        }
        /* -------- v1.3：生地会考（初二下期末，考完成绩锁死） -------- */
        case "hk": {
          runHuiKao();
          break;
        }
        /* -------- v1.3：中考（初三下期末） -------- */
        case "zhongkao": {
          if (typeof zhongkao === "function") zhongkao();
          else nextWeek();
          break;
        }
      }
    }

    /* ==================================================================
     * v1.3 节假日事件
     * ------------------------------------------------------------------
     * hid = HOLIDAYS 里的 id。长假日整周替换行动，短假日只弹一条。
     * ================================================================== */
    function runHoliday(hid) {
      if (!S) return;
      const hd = (typeof HOLIDAYS !== "undefined") ? HOLIDAYS.find(h => h.id === hid) : null;
      const ev = HOLIDAY_EVENTS[hid];
      const name = (hd && hd.name) || "节假日";
      if (!ev) {nextWeek(); return;}

      const long = !!(hd && hd.long);
      const opts = (ev.opts || []).map(o => ({
        t: o.t,
        fn: () => {if (typeof execOption === "function") execOption(o);}
      }));
      if (!opts.length) opts.push({t: "继续", fn: () => { }});

      /* 开了 allowTravel 的长假日：多给一个「出门走走」的选项。
       * 钱不够就不显示 —— 免得点进去才发现去不起。 */
      const money = clampNum(S.prop && S.prop.经济, 0, 1e9, 0);
      const canTravel = ev.allowTravel && long
        && typeof openShortTrip === "function"
        && money >= 150;
      if (canTravel) {
        opts.push({
          t: L("travel.shortOpt"),
          sub: L("travel.shortOptSub"),
          fn: () => {openShortTrip(() => {S.fixedDone = true; nextWeek();}, (hd && hd.icon ? hd.icon + " " : "") + name);}
        });
      }

      say(`🎉 ${name} —— ${long ? "这一周放假" : "今天放假"}`, "week-head");
      showPopup({
        kind: "fixed",
        badge: (hd && hd.icon ? hd.icon + " " : "") + name,
        title: ev.t,
        body: `<div style="line-height:1.62"><div style="white-space:pre-wrap">${ev.c}</div>
          <div style="margin-top:6px;color:var(--dim);font-size:.85rem">${hd && hd.desc ? hd.desc : ""}</div></div>`,
        options: opts
      }, () => {
        /* 长假日：这一整周都被节假日占掉了，直接进下一周
         * 短假日：弹完照常出行动面板 */
        if (long) {S.fixedDone = true; nextWeek();}
        else {S.fixedDone = true; setTimeout(ensureActionPanel, 0);}
      });
    }

    /* ==================================================================
     * v1.3 实验操作考试
     * ------------------------------------------------------------------
     * 生物 / 物理 / 化学各 10 分，直接计入中考总分。
     * 规则：第一次认真备考 + 认真做 → 当场拿满 10 分；
     *      敷衍了事 → 要补考，补考也能拿 10 分，但过程要付出代价
     *      （压力、心态、健康，以及多搭进去的一段时间）。
     * ================================================================== */
    function runExpExam(which) {
      if (!S) return;
      S.exp = S.exp || {};
      const subs = (which === "物化") ? ["物理", "化学"] : ["生物"];
      const nearHK = which === "生物";
      const title = nearHK ? "🧪 生物实验操作考试" : "🧪 物理 · 化学实验操作考试";
      const lead = nearHK
        ? "生地会考临近，实验操作考试先一步到来。<br>考场里摆着显微镜、载玻片和一台摄像头——你的一举一动都在被录。"
        : "中考前最后一次实验操作考试。<br>物理是电路，化学是配制溶液。摄像头亮着红灯，监考老师站在你侧后方。";

      const detail = nearHK
        ? "你要在 10 分钟内完成洋葱表皮细胞的临时装片，并调到清晰。"
        : "物理：连好电路，让小灯泡亮起来。化学：用量筒量取 10 毫升溶液。";

      /* 补考：也能拿满 10 分，但代价是实打实的 */
      const makeUp = () => {
        showModal("🧪 实验操作 · 补考", `<div style="line-height:1.62">
          ${lead}<br><br>上次没过，这周放学后你得留下来重考。<br>
          空荡荡的实验室里只剩你和一个监考老师，反而更紧张。
        </div>`, [
          {t: "这次一步一步来", fn: () => {
            subs.forEach(x => {S.exp[x] = 10;});
            modProp("压力", 8); modProp("心态", -5); modProp("健康", -3);
            say(`🧪 补考通过，${subs.join("、")}实验操作 +10 分。`, "good");
            say("你走出实验室时天已经黑了。路灯把影子拉得很长。", "");
          }},
        ], () => nextWeek(), false, false, {kind: "fixed"});
      };

      showModal(title, `<div style="line-height:1.62">
        ${lead}<br><br><span style="color:var(--dim)">${detail}</span><br>
        <span style="color:var(--gold);font-size:.85rem">这 10 分直接计入中考总分。</span>
      </div>`, [
        {t: "认真备考，认真做", fn: () => {
          S._expMakeup = false;
          subs.forEach(x => {S.exp[x] = 10;});
          modProp("悟性", 3); modProp("效率", 2); modProp("压力", 2);
          say(`🧪 一次通过！${subs.join("、")}实验操作 +10 分。`, "good");
          say(nearHK ? "你调出清晰细胞的那一下，监考老师点了点头。"
                     : "灯泡亮起来的那一刻，你听见自己松了口气。", "good");
        }},
        {t: "按自己的感觉做", fn: () => {
          modProp("压力", 4);
          say("步骤记得不全，做的时候手忙脚乱。", "bad");
          say("监考老师在记录表上写了点什么。", "bad");
          S._expMakeup = true;      // 还有补考，外层先别推进周
          setTimeout(makeUp, 0);
        }},
        {t: "照着同桌的步骤抄", fn: () => {
          modProp("压力", 5); modProp("心态", -3);
          say("你盯着同桌的手，跟着做完了。摄像头把这一切都录了下来。", "bad");
          S._expMakeup = true;
          setTimeout(makeUp, 0);
        }},
      ], () => {if (!S._expMakeup) nextWeek(); S._expMakeup = false;}, false, false, {kind: "fixed"});
    }

    /* ==================================================================
     * v1.3 生地会考
     * ------------------------------------------------------------------
     * 初二下期末考生物、地理。考完这两科成绩锁死，
     * 初三不再学生物地理，中考时直接把锁死的成绩按权重折进去。
     * ================================================================== */
    function runHuiKao() {
      if (!S) return;
      const p = S.prop;
      for (const k in PROP_RANGE) p[k] = fixProp(k, p[k]);
      ensureSubj();
      const diff = difficultyCurve(S.week, S.term);
      const W = examWeights();
      S.hk = S.hk || {};

      const rows = [];
      let total = 0, full = 0;
      ["生物", "地理"].forEach(sub => {
        const fm = (typeof fullMarkOf === "function") ? fullMarkOf(sub) : 100;
        let v = (typeof examScoreOf === "function") ? examScoreOf(sub, p, diff, W) : 60;
        v = clampNum((typeof toPaperScore === "function") ? toPaperScore(sub, v) : v, 0, fm, 0);
        S.hk[sub] = Math.round(v);          // ★ 锁死
        total += v; full += fm;
        const color = v >= fm * 0.9 ? "var(--green)" : (v >= fm * 0.6 ? "var(--gold)" : "var(--red)");
        rows.push(`<div class="subjrow"><span style="width:3em">${sub}</span><div class="bar"><i style="width:${fm ? v / fm * 100 : 0}%;background:${color}"></i></div><b style="color:${color};width:2.5em;text-align:right">${Math.round(v)}</b><small style="width:2.2em;color:var(--dim)">/${fm}</small></div>`);
      });
      S.hkDone = true;
      count("exam");
      say(`📘 生地会考：生物 ${S.hk.生物}、地理 ${S.hk.地理} —— 成绩已锁定。`, "exam");

      showModal("📘 生地会考 · 成绩单", `<div style="line-height:1.62">
        <div style="color:var(--dim);font-size:.85rem">初二下学期的最后一战。<br>
        考完这两科，成绩就锁死了——初三不再学生物地理，中考直接按权重折算。</div>
        ${rows.join("")}
        <div style="margin-top:8px;text-align:right;color:var(--gold)">卷面合计：<b>${Math.round(total)}</b> / ${full}</div>
        <div style="margin-top:4px;color:var(--dim);font-size:.82rem">折算进中考：生物 ×40%、地理 ×30%</div>
      </div>`, [{t: "知道了", fn: () => {}}], () => nextWeek(), false, false, {kind: "fixed"});
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

    /* 假期结束 → 进下一学期。
     * v1.2 起正常的假期走 js/05e-data-vacation.js 的 endVacation()，
     * 这个函数只作为兜底（假期文件没加载时不会卡死流程）。 */
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
      showModal("考场悟道", "收卷铃响前的最后一刻，你盯着试卷，忽然觉得天地一静——<br>三年的知识在你脑海中连成了一条线。<br><span style='color:var(--gold)'>这是一次顿悟的机会，你选择抓住哪一种「道」？</span>", [
        {t: "以笔为剑，杀伐果断", sub: "悟【学神降世】Lv.7(需悟性≥100)", disabled: () => S.prop.悟性 < 100, fn: () => {S.daoDone = true; gainTalent("学神降世", "考场悟道"); nextWeek();}},
        {t: "文思泉涌，下笔如有神", sub: "悟【文曲星】Lv.6", fn: () => {S.daoDone = true; gainTalent("文曲星", "考场悟道"); nextWeek();}},
        {t: "返观内照，照见本心", sub: "悟【心如明镜】Lv.6(需心态≥100)", disabled: () => S.prop.心态 < 100, fn: () => {S.daoDone = true; gainTalent("心如明镜", "考场悟道"); nextWeek();}},
        {t: "电光石火，融会贯通", sub: "悟【知行合一】Lv.6(需效率≥100)", disabled: () => S.prop.效率 < 100, fn: () => {S.daoDone = true; gainTalent("知行合一", "考场悟道"); nextWeek();}},
        {t: "心如止水，万念俱寂", sub: "悟【心如止水】Lv.7(需心态≥115)", disabled: () => S.prop.心态 < 115, fn: () => {S.daoDone = true; gainTalent("心如止水", "考场悟道"); nextWeek();}},
        {t: "天人合一，物我两忘", sub: "悟【天人合一】Lv.7(需健康≥115且效率≥115)", disabled: () => S.prop.健康 < 115 || S.prop.效率 < 115, fn: () => {S.daoDone = true; gainTalent("天人合一", "考场悟道"); nextWeek();}},
        {t: "顺其自然，不为所动", sub: "悟性 +5", fn: () => {modProp("悟性", 5); say("灵光散去了，但留下了一点什么。悟性 +5", ""); nextWeek();}},
      ], null, false, false, {kind: "fixed"});
    }
