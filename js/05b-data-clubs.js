/* ==================================================================
 * 内容层 · 社团系统（红塔中学 13 个社团）
 * ------------------------------------------------------------------
 * 结构：
 *   1. 开学第 1~3 周（初一上）周末「抢社团」—— 手慢无，这是塔中特色
 *   2. 入社后，社团事件在整个学期里均匀分布地冒出来
 *   3. 每个社团有每周的微小加成 perk，和长期参与可能获得的天赋
 *
 * 维护等级：内容层（可加社团、改文案）
 * ================================================================== */

    /* ============================================================
     * 13 个社团
     * ------------------------------------------------------------
     * pop = 热门程度 1~5，越高越难抢到
     * perk = 入社后每周的属性微增
     * talent = 长期参与（累计 6 次社团事件后）可能获得的天赋
     * ============================================================ */
    const CLUBS = [
      {id: "guohua", n: "国画社", icon: "🖌", cat: "美术", pop: 3,
        desc: "一笔一划，画的是山水，磨的是性子。", perk: {悟性: 1, 压力: -1}, talent: "匠心"},
      {id: "niantu", n: "黏土社", icon: "🎨", cat: "美术", pop: 3,
        desc: "一坨泥在手里，能变成任何东西。", perk: {悟性: 1, 心态: 1}, talent: "匠心"},
      {id: "huadeng", n: "花灯社", icon: "🏮", cat: "非遗", pop: 4,
        desc: "玉溪花灯戏，国家级非物质文化遗产。", perk: {悟性: 1, 社交: 1}, talent: "语感天成", outdoor: true},
      {id: "chorus", n: "合唱团", icon: "🎵", cat: "文艺", pop: 3,
        desc: "四声部合唱，艺术节的压轴。", perk: {心态: 1, 社交: 1}, talent: "热情"},
      {id: "recite", n: "朗诵社", icon: "🎙", cat: "文艺", pop: 3,
        desc: "晨读时的声音训练，也承接各类活动的朗诵。", perk: {悟性: 1, 心态: 1}, talent: "语感天成"},
      {id: "drama", n: "话剧社", icon: "🎭", cat: "文艺", pop: 4,
        desc: "一年一部大戏，从剧本到灯光都自己来。", perk: {社交: 1, 心态: 1}, talent: "热情"},
      {id: "english", n: "英语播音配音社", icon: "🔊", cat: "语言", pop: 3,
        desc: "校园广播的英文时段，也给动画片段配音。", perk: {悟性: 1, 效率: 1}, talent: "语感天成"},
      {id: "basketball", n: "篮球社", icon: "🏀", cat: "体育", pop: 5,
        desc: "全校最抢手的社团，名额三十个，报名两百。", perk: {健康: 2, 社交: 1}, talent: "运动健将"},
      {id: "cheer", n: "啦啦操社", icon: "🤸", cat: "体育", pop: 5,
        desc: "运动会开幕式的门面，训练很苦。", perk: {健康: 1, 社交: 1}, talent: "运动健将"},
      {id: "pingpong", n: "乒乓球社", icon: "🏓", cat: "体育", pop: 3,
        desc: "球台在体育馆角落，课间总有人占不到。", perk: {健康: 1, 悟性: 1}, talent: "运动健将"},
      {id: "weiqi", n: "围棋社", icon: "♟", cat: "益智", pop: 2,
        desc: "棋盘上落子的声音，比教室安静得多。", perk: {悟性: 2}, talent: "逻辑鬼才"},
      {id: "photo", n: "摄影社", icon: "📷", cat: "传媒", pop: 3,
        desc: "扛着相机满校园跑，运动会全是他们的活。", perk: {悟性: 1, 社交: 1}, talent: "匠心"},
      {id: "coding", n: "编程社", icon: "💻", cat: "科创", pop: 4,
        desc: "写代码、做小项目，也去市里参加比赛。", perk: {悟性: 1, 效率: 1}, talent: "逻辑鬼才"},
    ];

    const CLUB_MAP = {};
    CLUBS.forEach(c => {CLUB_MAP[c.id] = c;});

    /* 抢社团的成功率（0~1） */
    function clubGrabChance(cid) {
      const c = CLUB_MAP[cid];
      if (!c) return 0.5;
      const base = {1: 0.85, 2: 0.75, 3: 0.6, 4: 0.45, 5: 0.35}[clampNum(c.pop, 1, 5, 3)] || 0.6;
      // 效率高 = 手速快、网速好
      const eff = clampNum(S.prop.效率, 10, 150, 100);
      const bonus = clampNum((eff - 100) * 0.004, -0.15, 0.2);
      // 热门社团第二次抢会容易一点（别人退了）
      const retry = (S.clubTried && S.clubTried[cid]) ? 0.1 : 0;
      return clampNum(base + bonus + retry, 0.05, 0.95);
    }

    /* ============================================================
     * 抢社团事件（初一上第 1~3 周，周末）
     * ============================================================ */
    const CLUB_GRAB_EVENT = {
      id: "club_grab",
      w: 0,                       // 不走随机池，由固定日程直接调用
      slot: "weekend",
      t: "社团抢选",
      c: "课后服务展演刚结束，广播里说社团报名系统今晚八点开放。\n" +
         "红塔中学的社团是「抢」的——名额有限，手慢无。\n" +
         "你盯着手机上的倒计时，心跳有点快。",
      opts: null                  // 选项在运行时动态生成
    };

    /* 生成抢社团的选项 */
    function buildClubGrabOpts() {
      const opts = [];
      // 展示 6 个社团（含热门与冷门），而不是 13 个，避免选项爆炸
      const hot = CLUBS.filter(c => c.pop >= 4);
      const cool = CLUBS.filter(c => c.pop <= 3);
      const pick = [...hot.sort(() => Math.random() - 0.5).slice(0, 3),
                    ...cool.sort(() => Math.random() - 0.5).slice(0, 3)]
        .sort(() => Math.random() - 0.5);

      pick.forEach(c => {
        const chance = Math.round(clubGrabChance(c.id) * 100);
        opts.push({
          t: `${c.icon} 抢「${c.n}」`,
          sub: `${c.cat} · 名额${c.pop >= 4 ? "紧张" : "充足"} · 成功率约 ${chance}%`,
          fn: () => {
            if (!Array.isArray(S.clubTried)) S.clubTried = [];
            S.clubTried.push(c.id);
            if (Math.random() < clubGrabChance(c.id)) {
              joinClub(c.id);
              showPopup({
                kind: "free", badge: "🎉 社团", title: `抢到了！${c.icon} ${c.n}`,
                body: `<div style="line-height:1.62">系统显示「报名成功」的那一刻，你在宿舍里叫出了声。<br>
                  ${c.desc}<br>
                  <span style="color:var(--dim);font-size:.85rem">此后每周三的社团课会有社团的事。坚持参加 6 次，可能有所收获。</span></div>`,
                options: [{t: "太好了", fn: () => {ensureActionPanel();}}]
              });
            } else {
              say(`😢 ${c.n} 名额满了，你慢了一步。`, "bad");
              showPopup({
                kind: "free", badge: "😢 社团", title: `没抢上 ${c.icon} ${c.n}`,
                body: `<div style="line-height:1.62">页面刷出来的时候，名额已经是灰的了。<br>
                  「${c.pop >= 4 ? "两百人抢三十个位置" : "今年报的人比往年多"}。」室友在旁边叹气。<br>
                  <span style="color:var(--dim);font-size:.85rem">下周还有一次机会，也可以看看别的社团。</span></div>`,
                options: [{t: "下周再试", fn: () => {ensureActionPanel();}}]
              });
            }
          }
        });
      });
      opts.push({t: "算了，不报了", sub: "把时间留给学习", fn: () => {
        S.clubSkip = true;
        S.clubSkipTerm = clampNum(S.term, 0, 9, 0);
        say("你退出了报名页面。这一年，你始终是个旁观者。", "sys");
        ensureActionPanel();
      }});
      return opts;
    }

    /* 入社 */
    function joinClub(cid) {
      const c = CLUB_MAP[cid];
      if (!c) return;
      S.club = cid;
      S.clubCount = 0;
      say(`🎉 你加入了「${c.n}」。`, "good");
      checkAch();
    }

    /* ============================================================
     * 社团每周事件
     * ------------------------------------------------------------
     * dist:"uniform" + minGap —— 让社团事件在整个学期里均匀冒出来，
     * 不会一周连着来三次、然后一学期没动静。
     * cond 里限定「只有本社团成员才会遇到」。
     * ============================================================ */
    const CLUB_EVENTS = [
      // ——— 国画社 ———
      {id: "cl_guohua_1", w: 5, dist: "uniform", minGap: 4, slot: "clubday",
        cond: S => S.club === "guohua",
        t: "国画社 · 临《千里江山图》", c: "周三下午，社团活动课。\n你要临的是《千里江山图》里的一角。\n青绿的山，要用深浅不同的墨一层层染。",
        opts: [
          {t: "一层层慢慢染", run: ["悟性 +5", "压力 -5", "心态 +4", "计数 club", "提示 你的山有了远近。!good"]},
          {t: "随便涂涂", run: ["悟性 +1", "计数 club", "提示 你的山像一坨绿色的云。"]},
        ]},
      {id: "cl_guohua_2", w: 5, dist: "uniform", minGap: 5, slot: "clubday",
        cond: S => S.club === "guohua",
        t: "国画社 · 作品被展出", c: "你的画被挂在了教学楼走廊的展板上。\n有同学路过时停下来看了一会儿。",
        opts: [
          {t: "悄悄看别人怎么看", run: ["心态 +7", "社交 +4", "计数 club", "提示 有人念出了展板上你的名字。!good"]},
          {t: "当作没看见", run: ["心态 +3", "计数 club", "提示 你低着头快步走过去了。"]},
        ]},

      // ——— 黏土社 ———
      {id: "cl_niantu_1", w: 5, dist: "uniform", minGap: 4, slot: "clubday",
        cond: S => S.club === "niantu",
        t: "黏土社 · 捏个小东西", c: "周三的社团课，桌上一盒彩泥。\n老师说：今天不限主题，想捏什么捏什么。",
        opts: [
          {t: "捏一个认真的小物件", run: ["悟性 +5", "压力 -5", "心态 +3", "计数 club", "提示 你捏了一只巴掌大的猫，耳朵是歪的，但很像。!good"]},
          {t: "随手捏个球", run: ["悟性 +1", "计数 club", "提示 你捏了个球，然后把它拍扁了。"]},
        ]},
      {id: "cl_niantu_2", w: 5, dist: "uniform", minGap: 5, slot: "clubday",
        cond: S => S.club === "niantu",
        t: "黏土社 · 送给了谁", c: "你把上周捏的那个小东西，放在了同桌的桌上。",
        opts: [
          {t: "留一张纸条", run: ["社交 +7", "心态 +6", "计数 club", "提示 他第二天回赠了你一颗糖。!good"]},
          {t: "偷偷放下就走", run: ["社交 +3", "心态 +4", "计数 club", "提示 你看见他拿起来，笑了。"]},
        ]},

      // ——— 花灯社 ———
      {id: "cl_huadeng_1", w: 5, dist: "uniform", minGap: 4, slot: "clubday",
        cond: S => S.club === "huadeng",
        t: "花灯社 · 压腿", c: "社团活动课，排练厅里。\n社长让你把腿架在把杆上。\n花灯戏的台步，第一步是压腿，疼得你直抽气。",
        opts: [
          {t: "咬牙压下去", run: ["健康 +4", "心态 +4", "压力 +3", "计数 club", "提示 老师说：「台上一分钟，台下十年功。」!good"]},
          {t: "偷偷少压一会", run: ["压力 -2", "健康 +1", "计数 club", "提示 你看了眼窗外，假装很疼。"]},
        ]},
      {id: "cl_huadeng_2", w: 5, dist: "uniform", minGap: 5, slot: "weekend",
        cond: S => S.club === "huadeng",
        t: "花灯社 · 去剧院研学", c: "社团组织去玉溪市花灯剧院。\n这是唯一一次走出校园的活动。\n院长亲自讲解，还让你们上台试着走了两步台步。",
        opts: [
          {t: "上台试一试", run: ["悟性 +6", "社交 +5", "心态 +6", "计数 club", "提示 灯光打在脸上，你忽然懂了什么叫「亮相」。!good"]},
          {t: "认真记笔记", run: ["悟性 +5", "效率 +3", "计数 club", "提示 你记了满满三页。!good"]},
        ]},

      // ——— 合唱团 ———
      {id: "cl_chorus_1", w: 5, dist: "uniform", minGap: 4, slot: "clubday",
        cond: S => S.club === "chorus",
        t: "合唱团 · 分声部", c: "指挥把你从男高调到男低：「你的声音太亮了，压一压。」\n你不太服气。",
        opts: [
          {t: "照做，压着唱", run: ["心态 +5", "悟性 +3", "计数 club", "提示 混进和声里的那一刻，你起了一身鸡皮疙瘩。!good"]},
          {t: "偷偷唱高声部", run: ["社交 -2", "心态 +2", "计数 club", "提示 指挥看了你一眼。"]},
        ]},
      {id: "cl_chorus_2", w: 5, dist: "uniform", minGap: 5, slot: "clubday",
        cond: S => S.club === "chorus",
        t: "合唱团 · 加排", c: "艺术节前一周，通知加排。你还有两张卷子没写。",
        opts: [
          {t: "去加排", run: ["社交 +6", "心态 +5", "学习减益 10% 1周", "计数 club", "提示 你和声部的人混熟了。!good"]},
          {t: "请假写作业", run: ["学习加成 +10% 1周", "社交 -3", "计数 club", "提示 你在教室写完了卷子。"]},
        ]},

      // ——— 朗诵社 ———
      {id: "cl_recite_1", w: 5, dist: "uniform", minGap: 4, slot: "clubday",
        cond: S => S.club === "recite",
        t: "朗诵社 · 练发声", c: "社团课的开始是练声。\n「气息下沉——」指导老师的声音穿过整间教室。",
        opts: [
          {t: "跟着一起练", run: ["健康 +3", "心态 +4", "悟性 +2", "计数 club", "提示 你学会了用肚子说话。!good"]},
          {t: "在旁边听着", run: ["悟性 +2", "计数 club", "提示 你觉得这么多人一起喊有点怪。"]},
        ]},
      {id: "cl_recite_2", w: 5, dist: "uniform", minGap: 5, slot: "clubday",
        cond: S => S.club === "recite",
        t: "朗诵社 · 被推上台", c: "指导老师临时说：这周由你来领诵一段。\n所有人的目光转到你身上。",
        opts: [
          {t: "站上去", run: ["社交 +7", "心态 +6", "悟性 +3", "计数 club", "提示 你的声音在教室里回荡。!good"]},
          {t: "推给别人", run: ["压力 -3", "社交 +2", "计数 club", "提示 社长瞪了你一眼，还是上了。"]},
        ]},

      // ——— 话剧社 ———
      {id: "cl_drama_1", w: 5, dist: "uniform", minGap: 4, slot: "clubday",
        cond: S => S.club === "drama",
        t: "话剧社 · 背台词", c: "这学期的大戏是《雷雨》，你分到了一个有三十句台词的角色。\n社团课上，别人都在对词。",
        opts: [
          {t: "当场背下来", run: ["效率 +5", "心态 +5", "健康 -3", "计数 club", "提示 你终于能脱稿了。!good"]},
          {t: "下次再背", run: ["心态 +3", "压力 -3", "计数 club", "提示 你把剧本塞进抽屉。"]},
        ]},
      {id: "cl_drama_2", w: 5, dist: "uniform", minGap: 5, slot: "clubday",
        cond: S => S.club === "drama",
        t: "话剧社 · 联排", c: "第一次全剧联排，你在第二幕忘了词。\n全场安静了三秒。",
        opts: [
          {t: "道歉，重来一遍", run: ["社交 +6", "心态 +4", "压力 +4", "计数 club", "提示 第二遍你一条过，大家鼓了掌。!good"]},
          {t: "躲在后台不出来", run: ["心态 -6", "压力 +6", "计数 club", "提示 社长进来拍了拍你的肩。"]},
        ]},

      // ——— 英语播音配音社 ———
      {id: "cl_english_1", w: 5, dist: "uniform", minGap: 4, slot: "clubday",
        cond: S => S.club === "english",
        t: "英语社 · 第一次播音", c: "社团课的录音练习，你对着麦克风。手心全是汗。\n「Good afternoon, everyone...」",
        opts: [
          {t: "稳住念完", run: ["社交 +5", "心态 +5", "悟性 +3", "计数 club", "提示 回放时你自己都愣了一下。!good"]},
          {t: "念错几个词", run: ["心态 -3", "社交 +2", "计数 club", "提示 你听见自己的声音在抖。"]},
        ]},
      {id: "cl_english_2", w: 5, dist: "uniform", minGap: 5, slot: "clubday",
        cond: S => S.club === "english",
        t: "英语社 · 给动画配音", c: "这周的任务是给一段动画配音，你配的角色要哭。\n一个人对着麦克风哭，实在有点怪。",
        opts: [
          {t: "真的投入进去", run: ["悟性 +6", "社交 +4", "心态 +3", "计数 club", "提示 回放时连社长都安静了一下。!good"]},
          {t: "尴尬地念出来", run: ["悟性 +2", "计数 club", "提示 你觉得这辈子没这么尴尬过。"]},
        ]},

      // ——— 篮球社 ———
      {id: "cl_basketball_1", w: 6, dist: "uniform", minGap: 4, slot: "clubday",
        cond: S => S.club === "basketball",
        t: "篮球社 · 训练", c: "社团活动课，篮球队在球场集合。\n社长说：「正式队员，训练不能缺。」",
        opts: [
          {t: "跟着练完", run: ["计数 运动", "健康 +7", "压力 -3", "效率 +3", "计数 club", "提示 出汗之后整个人是清醒的。!good"]},
          {t: "装肚子疼", run: ["健康 +2", "社交 -2", "计数 club", "提示 你在旁边坐了一节课。"]},
        ]},
      {id: "cl_basketball_2", w: 6, dist: "uniform", minGap: 5, slot: "clubday",
        cond: S => S.club === "basketball",
        t: "篮球社 · 队内对抗赛", c: "队内赛，赢的人进首发名单。\n你在替补席上坐了大半场。",
        opts: [
          {t: "主动请缨上场", run: ["计数 运动", "健康 +5", "社交 +6", "心态 +5", "计数 club", "提示 你投进了压哨球。全队冲上来撞你的肩。!good"]},
          {t: "坐着看完", run: ["心态 +2", "计数 club", "提示 你在场边坐到了结束。"]},
        ]},

      // ——— 啦啦操社 ———
      {id: "cl_cheer_1", w: 6, dist: "uniform", minGap: 4, slot: "clubday",
        cond: S => S.club === "cheer",
        t: "啦啦操社 · 托举训练", c: "托举是最难的动作，也是最容易受伤的动作。\n你在下面当底座，肩膀被踩得生疼。",
        opts: [
          {t: "扛住", run: ["健康 -4", "社交 +6", "心态 +5", "压力 +4", "计数 club", "提示 全队都信任你站的位置。!good"]},
          {t: "喊停换人", run: ["健康 +2", "社交 -2", "计数 club", "提示 换了个男生来当底座。"]},
        ]},
      {id: "cl_cheer_2", w: 6, dist: "uniform", minGap: 5, slot: "clubday",
        cond: S => S.club === "cheer",
        t: "啦啦操社 · 开幕式彩排", c: "运动会开幕式的彩排，全校都在看。\n音乐响起的那一刻，你脑子里一片空白。",
        opts: [
          {t: "跟着节拍做完", run: ["社交 +7", "心态 +6", "健康 +3", "计数 club", "提示 台下的掌声响起来的时候，你知道成了。!good"]},
          {t: "中间停了一下", run: ["心态 -4", "社交 -2", "计数 club", "提示 你跟不上节拍，愣了半秒。!bad"]},
        ]},

      // ——— 乒乓球社 ———
      {id: "cl_pingpong_1", w: 5, dist: "uniform", minGap: 4, slot: "clubday",
        cond: S => S.club === "pingpong",
        t: "乒乓球社 · 占台子", c: "社团课，体育馆只有六张台子，来了二十几个人。\n要打球，先得占住一张台。",
        opts: [
          {t: "排队等着上", run: ["计数 运动", "健康 +5", "社交 +4", "心态 +3", "计数 club", "提示 你等了二十分钟，打了三局。!good"]},
          {t: "找角落练发球", run: ["计数 运动", "健康 +3", "悟性 +3", "计数 club", "提示 你对着墙练了一节课的发球。"]},
        ]},
      {id: "cl_pingpong_2", w: 5, dist: "uniform", minGap: 5, slot: "clubday",
        cond: S => S.club === "pingpong",
        t: "乒乓球社 · 和高年级打", c: "一个初三的学长过来问：要不要来一局？\n他拿拍的姿势和你完全不一样。",
        opts: [
          {t: "接下这一局", run: ["计数 运动", "健康 +4", "社交 +5", "悟性 +4", "计数 club", "提示 你输了，但你学会了一个发球。!good"]},
          {t: "说还有作业", run: ["社交 -2", "心态 +1", "计数 club", "提示 你把拍子放回了架子上。"]},
        ]},

      // ——— 围棋社 ———
      {id: "cl_weiqi_1", w: 4, dist: "uniform", minGap: 4, slot: "clubday",
        cond: S => S.club === "weiqi",
        t: "围棋社 · 输了一下午", c: "社团课你连下了五盘，全输了。\n对手是初二的，比你小一岁。",
        opts: [
          {t: "复盘", run: ["悟性 +6", "压力 +3", "计数 club", "提示 你找到了自己的毛病：太急。!good"]},
          {t: "不下了", run: ["心态 -3", "计数 club", "提示 你把棋子一推，回了教室。"]},
        ]},
      {id: "cl_weiqi_2", w: 4, dist: "uniform", minGap: 5, slot: "clubday",
        cond: S => S.club === "weiqi",
        t: "围棋社 · 终于赢了一盘", c: "第六盘，你赢了。\n赢的那一刻没什么感觉，只是松了口气。",
        opts: [
          {t: "再下一盘", run: ["悟性 +5", "心态 +5", "计数 club", "提示 你赢下了第二盘。!good"]},
          {t: "见好就收", run: ["心态 +4", "悟性 +3", "计数 club", "提示 你收了棋子，心里很稳。"]},
        ]},

      // ——— 摄影社 ———
      {id: "cl_photo_1", w: 5, dist: "uniform", minGap: 4, slot: "clubday",
        cond: S => S.club === "photo",
        t: "摄影社 · 等一束光", c: "为了拍教学楼，社长让你在操场上等了很久。\n「光不对，再等等。」",
        opts: [
          {t: "等下去", run: ["悟性 +5", "心态 +5", "压力 -4", "计数 club", "提示 云散开的一刻，红色教学楼被照得发亮。!good"]},
          {t: "随便拍一张走人", run: ["悟性 +1", "计数 club", "提示 你的照片灰蒙蒙的。"]},
        ]},
      {id: "cl_photo_2", w: 5, dist: "uniform", minGap: 5, slot: "clubday",
        cond: S => S.club === "photo",
        t: "摄影社 · 运动会的活", c: "运动会期间，摄影社全员上阵。\n你负责终点线，蹲在那里。",
        opts: [
          {t: "蹲一整天", run: ["健康 -4", "社交 +6", "悟性 +4", "计数 club", "提示 你拍到了冲线那一秒的表情。!good"]},
          {t: "拍会儿就溜", run: ["社交 -2", "悟性 +1", "计数 club", "提示 你回教室写了会儿作业。"]},
        ]},

      // ——— 编程社 ———
      {id: "cl_coding_1", w: 5, dist: "uniform", minGap: 4, slot: "clubday",
        cond: S => S.club === "coding",
        t: "编程社 · 调试", c: "机房里，你的程序跑了三遍都是错的。\n社长说：「别急，先看报错信息。」",
        opts: [
          {t: "一行行看报错", run: ["悟性 +6", "效率 +4", "健康 -3", "压力 +4", "计数 club", "提示 你找到了那个少写的括号。!good"]},
          {t: "抄社长的代码", run: ["悟性 +1", "效率 +2", "计数 club", "提示 程序跑通了，但你不太懂为什么。"]},
        ]},
      {id: "cl_coding_2", w: 5, dist: "uniform", minGap: 5, slot: "clubday",
        cond: S => S.club === "coding",
        t: "编程社 · 做出一个小东西", c: "你用几周时间写了一个小工具——\n能把全班的名字随机排座位的那种。",
        opts: [
          {t: "发给同学用", run: ["社交 +7", "心态 +6", "悟性 +4", "计数 club", "提示 有人问你：能不能也加个值日表功能？!good"]},
          {t: "自己留着", run: ["悟性 +5", "心态 +3", "计数 club", "提示 你把它存在了 U 盘里。"]},
        ]},
    ];

    /* 把社团事件并入主事件表（幂等） */
    (function mergeClubEvents() {
      if (typeof EVENTS === "undefined") return;
      CLUB_EVENTS.forEach(e => {
        if (!EVENTS.some(x => x.id === e.id)) EVENTS.push(e);
      });
    })();

    /* 社团每周加成 —— 在 weeklySettle 里调用 */
    function applyClubPerk() {
      if (!S || !S.club) return;
      const c = CLUB_MAP[S.club];
      if (!c || !c.perk) return;
      for (const k in c.perk) {
        const v = num(c.perk[k], 0);
        if (v) S.prop[k] = fixProp(k, num(S.prop[k], 0) + v);
      }
    }

    /* 社团参与次数累计到一定程度，可能获得天赋 */
    function checkClubTalent() {
      if (!S || !S.club) return;
      const c = CLUB_MAP[S.club];
      if (!c || !c.talent || !TALENTS[c.talent]) return;
      const n = num(S.cnt.club, 0);
      if (n >= 6 && !Talent.have(c.talent) && Math.random() < 0.35) {
        gainTalent(c.talent, `${c.n}的长期坚持`);
      }
    }

    /* 当前社团名（HUD 显示用） */
    function clubName() {
      return (S && S.club && CLUB_MAP[S.club]) ? CLUB_MAP[S.club].icon + CLUB_MAP[S.club].n : "";
    }
