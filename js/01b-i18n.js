/* ==================================================================
 * 工具层 · 双语（中文 / English）
 * ==================================================================
 * 用法：
 *   L("ui.save")              → 当前语言的文案
 *   L("hud.week", 12)         → 带参数，文案里写 {0} {1}
 *   T({zh:"学习", en:"Study"}) → 双语对象取值（直接传字符串也能用）
 *   TZ("学习")                → 只在英文模式下显示原文（中文内容用）
 *
 * 维护约定：
 *   1. 新增界面文案时，zh / en 两边都写；en 没写会自动回退到中文。
 *   2. 旧事件 / 天赋 / 书目文案仍是中文，会逐批补译（不是 bug）。
 *   3. 不要在 key 里放变量，一律用 {0} 占位 + L(key, v0)。
 *
 * 维护等级：工具层（加文案时改）
 * ============================================================ */

    const LANGS = [
      {id: "zh", label: "中文", short: "中"},
      {id: "en", label: "English", short: "EN"}
    ];

    let LANG = "zh";

    /* ==================================================================
     * 文案表
     * ============================================================ */
    const I18N = {

      /* ---------------- 主菜单 ---------------- */
      zh: {
        "app.title": "中考人生模拟器",
        "app.suffix": "版",

        "menu.slots": "存档槽位",
        "menu.more": "了解更多",
        "menu.guide": "📘 新手介绍",
        "menu.changelog": "🆕 更新日志",
        "menu.credits": "🙏 鸣谢列表",
        "menu.about": "游戏说明",
        "menu.theme": "主题色",
        "menu.lang": "语言",
        "menu.settings": "设置",
        "menu.themeHint": "点一下就换，立刻生效，会记住你的选择",
        "menu.langHint": "界面与新增内容双语；旧事件文案仍在补译中",

        "about.body":
          `你将经历初一至初三共 <b style="color:var(--gold)">150 周</b>，直至中考。<br>
           <b style="color:var(--purple)">天赋不会在一开始赠送</b> —— 它们藏在一次次选择里。<br>
           每周可做 <b style="color:var(--gold)">1~2 次本周行动</b>，每次行动后都会跟一个 <b style="color:var(--gold)">⚡ 事件弹窗</b>，偶尔还会连锁出后续事件。<br>
           <b style="color:var(--green)">🎒 小卖铺 / 读书角 / 天赋图鉴 / 成就</b> 属于自由操作，<b>不占用行动次数</b>。<br>
           一些负面天赋是可以<b style="color:var(--green)">「破茧」消除</b>的 —— 坚持学习、坚持休息，阴影总会散去。<br>
           <span style="color:var(--dim);font-size:.85rem">「人生在立，行达天下」—— 登上立行号，这三年走的每一步，都算数。</span>`,

        /* ---------------- 顶栏 / HUD ---------------- */
        "hud.week": "第 {0} 周",
        "hud.act": "本周行动",
        "hud.ev": "事件",
        "hud.shop": "🏪 小卖铺",
        "hud.talentBook": "📖 天赋图鉴",
        "hud.ach": "🏆 成就",
        "hud.save": "💾 保存",
        "hud.home": "🏠 主菜单",
        "hud.theme": "🎨 主题",
        "hud.lang": "🌐 中/EN",

        "hud.talent": "天赋",
        "hud.talentHint": "点击看详情",
        "hud.item": "道具",
        "hud.subjects": "各科(本年级)",
        "hud.score": "成绩",
        "hud.scoreTotal": "综合学力",
        "hud.lastExam": "最近考试",
        "hud.rank": "年级排名(估)",
        "hud.rankVal": "前 {0}%",
        "hud.noTalent": "尚无天赋 —— 在选择中觉醒",
        "hud.noItem": "暂无道具 —— 可去小卖铺购买",
        "hud.subjToggle": "各科详情（{0} 科）",

        /* ---------------- 属性 ---------------- */
        "prop.心态": "心态",
        "prop.经济": "经济",
        "prop.健康": "健康",
        "prop.效率": "效率",
        "prop.悟性": "悟性",
        "prop.社交": "社交",
        "prop.压力": "压力",
        "prop.亲情": "亲情",

        /* ---------------- 本周行动 ---------------- */
        /* ---------------- 属性档位（模糊化显示） ---------------- */
        "level.vlow": "极低",
        "level.low": "较低",
        "level.mid": "中",
        "level.high": "较高",
        "level.vhigh": "极高",

        "mood.stress": "压力快要撑不住了。",
        "mood.dark": "世界好像褪色了。",
        "mood.weak": "身体在发虚。",

        /* ---------------- 运动锻炼 ---------------- */
        "sport.log": "🏃 你去操场动了一身汗。",
        "sport.float": "身体结实了一点",

        /* ---------------- 做题 ---------------- */
        "quiz.badge": "✏️ 本周行动 · 做题",
        "quiz.title": "一道{0}题",
        "quiz.tip": "答对该科有加成，答错会小幅倒扣。",
        "quiz.placeholder": "在这里写答案",
        "quiz.fillTip": "不用写单位，中英文标点都算对。",
        "quiz.submit": "交卷",
        "quiz.giveup": "放弃这道题",
        "quiz.giveupLog": "你跳过了这道{0}题。",
        "quiz.gaveup": "你空着交了上去。",
        "quiz.resultTitle": "对答案",
        "quiz.correct": "✔ 答对了。",
        "quiz.incorrect": "✘ 答错了。",
        "quiz.answer": "正确答案：",
        "quiz.yours": "你写的：",
        "quiz.why": "讲解：",
        "quiz.right": "{0}答对了，本科目有长进。",
        "quiz.wrong": "{0}做错了，这一块还是没吃透。",
        "quiz.rightFloat": "{0} ▲",
        "quiz.wrongFloat": "{0} ▼",
        "quiz.none": "这个年级暂时没有合适的题，你改成了自己看书。",

        /* ---------------- 亲情 / 家庭 ---------------- */
        "fam.badge": "🏠 家庭 · 矛盾",
        "fam.apologize": "低头认错",
        "fam.shutup": "一句话不说",
        "fam.hug": "主动去抱一下",
        "fam.apologizeLog": "{0} 你说了句对不起，气氛缓了一些，但心里还是堵。",
        "fam.shutupLog": "{0} 你什么都没说，这顿饭吃得格外久。",
        "fam.hugLog": "你走过去抱了一下。僵了很久的肩膀，终于松了一点。",
        "fam.conflictLog": "🏠 家里起了摩擦。",

        /* ---------------- 遗憾离场 ---------------- */
        "burn.badge": "🕯 压力 · 警告",
        "burn.warn": "⚠ 压力已连续 {0} 周爆表，再撑 {1} 周就要撑不住了。",
        "burn.warnTitle": "最后一周",
        "burn.warnBody": "你已经连续好几周顶着压力硬扛了。\n再这样下去，身体会先替你做决定。\n这周试着休息一次、运动一次，或者找人说说。",
        "burn.over": "🕯 压力连续三周爆表，你没能撑到中考。",

        "act.title": "选择行动",
        "act.titleN": "选择行动（第 {0}/{1} 次）",
        "act.study": "📖 努力学习",
        "act.quiz": "✏️ 做题",
        "act.sport": "🏃 运动锻炼",
        "act.rest": "😴 好好休息",
        "act.social": "👥 社交活动",
        "act.fun": "🎮 摸鱼娱乐",
        "act.allowance": "🏠 向父母要零花钱",
        "act.read": "📚 图书角",
        "act.club": "🎪 去社团活动",
        "act.clubSkip": "📖 留在教室写作业",
        "act.clubRest": "😴 回宿舍休息",
        "act.clubSocial": "👥 找同学玩",
        "act.clubSub": "推掉这周社团",
        "act.restSub": "这周不想动",
        "act.socialSub": "不上社团课",

        /* ---------------- 弹窗通用 ---------------- */
        "modal.close": "关闭",
        "modal.continue": "继续",
        "modal.ok": "好",
        "modal.cancel": "取消",

        "badge.event": "⚡ 事件 {0}/{1}",
        "badge.fixed": "📅 固定事件",
        "badge.free": "🎒 自由操作 · 不消耗本周行动",
        "badge.ending": "🏁 结局",
        "ev.result": "事件结局",
        "ev.resultBadge": "⚡ 事件 {0}/{1} · 结果",

        /* ---------------- 天赋 ---------------- */
        "talent.detail": "天赋详情",
        "talent.effect": "效果",
        "talent.status": "状态",
        "talent.owned": "已拥有",
        "talent.locked": "未拥有",
        "talent.conflict": "矛盾项",
        "talent.none": "无",
        "talent.book": "天赋图鉴",
        "talent.bookHint": "已解锁 {0} / {1}　·　点任意天赋可看详情",

        /* ---------------- 小卖铺 / 道具 ---------------- */
        "shop.title": "小卖铺",
        "shop.body": "你走进校门口的小卖铺，货架上摆满了各种物件。",
        "shop.money": "当前经济：{0}",
        "shop.price": "价格 {0}",
        "shop.leave": "离开",
        "shop.buy": "🏪 你购买了【{0}】。",
        "shop.poor": "经济不足，买不起。",
        "item.use": "道具使用",
        "item.used": "🎒 你使用了【{0}】——{1}",
        "item.effect": "【{0}】的效果已经生效：",

        /* ---------------- 图书角 ---------------- */
        "book.title": "班级图书角",
        "book.body": "教室后墙的图书角摆着同学们捐的书，窗边那格落满阳光。你抽出一本——",
        "book.money": "当前经济：{0}",
        "book.cost": "花费 {0}",
        "book.read": "📖 你读了{0}。",
        "book.poor": "经济不足，买不起这本书。",
        "book.close": "合上书",
        "book.putBack": "你把书放回原处，转身回到座位。",
        "book.badge": "📚 本周行动 · 图书角",

        /* ---------------- 成就 ---------------- */
        "ach.title": "成就系统",

        /* ---------------- 存档 ---------------- */
        "save.slot": "存档 {0}",
        "save.empty": "空",
        "save.resume": "继续",
        "save.restart": "重开",
        "save.delete": "删除",
        "save.new": "新开存档",
        "save.over": "已完结",
        "save.info": "中考:{0} · 成就 {1} · {2}",
        "save.confirmOver": "覆盖该存档?",
        "save.confirmDel": "确定删除该存档?",
        "save.saved": "💾 已保存",
        "save.loaded": "💾 存档读取成功，继续你的初中生活！",
        "save.anon": "无名氏",
        "save.male": "男",
        "save.female": "女",

        /* ---------------- 创建角色 ---------------- */
        "cc.title": "创建角色",
        "cc.name": "姓名",
        "cc.namePh": "输入你的名字",
        "cc.gender": "性别",
        "cc.male": "男",
        "cc.female": "女",
        "cc.pick": "或从下方随机名字中选一个：",
        "cc.start": "开始初中生活",
        "cc.begin": "🌅 {0} 的初中生涯，开始了。",

        /* ---------------- 流程提示 ---------------- */
        "flow.weekHead": "—— 第 {0} 周 · {1}{2} · {3}月{4}{5} ——",
        "flow.actionLog": "本周行动({0}/{1}):{2} → 学力已结算",
        "flow.clubLog": "🎪 周三社团课：{0}",
        "flow.study": "努力学习",
        "flow.quiz": "做题",
        "flow.sport": "运动锻炼",
        "flow.rest": "好好休息",
        "flow.social": "社交活动",
        "flow.fun": "摸鱼娱乐",
        "flow.allowance": "向父母要零花钱",
        "flow.read": "图书角",
        "flow.club": "社团活动",
        "flow.stressBurst": "压力爆表!心态 -{0}",
        "flow.healthWarn": "⚠️ 身体在报警，下周该休息了。",
        "flow.mindWarn": "⚠️ 你最近情绪很低落，注意调节。",
        "flow.zhongkao": "🎓 中考放榜!你的均分:{0}/100",

        /* ---------------- 考试 ---------------- */
        "exam.sheet": "{0} · 成绩单",
        "exam.avg": "均分",
        "exam.full": "满分 100",
        "exam.fullMarks": "🎉 满分科目:{0}",
        "exam.accept": "收下成绩单",
        "exam.log": "📝【{0}】总分 {1}/{2}，均分 {3}",
        "exam.top": "名列前茅！全年级都听说了你的名字。",
        "exam.bad": "考砸了……心态 -8，压力 +10",

        /* ---------------- 向父母要钱 ---------------- */
        "alw.title": "向父母要零花钱",
        "alw.badge": "🏠 本周行动 · 家庭",
        "alw.hint": "当前亲情：{0}　·　亲情越高，父母越愿意给，也越少念叨",
        "alw.thanks": "谢谢爸妈",
        "alw.know": "知道了",
        "alw.t1": "父母多塞了点",
        "alw.t2": "痛快给了",
        "alw.t3": "给了",
        "alw.t4": "被念叨了一顿",
        "alw.t5": "被拒绝了",
        "alw.t6": "只给了很少一点",
        "alw.l1": "你刚开口，{0}就掏出了钱包：「在学校别省着，该买的就买。」临走又多塞了十五块。",
        "alw.l2": "{0}二话没说就转了钱，还问你最近学习累不累。",
        "alw.l3": "{0}数了数钱递给你，顺口叮嘱了一句「别乱花」。",
        "alw.l4": "「上周不是才给过吗？」{0}一边数落一边还是掏了钱。你觉得脸上有点发热。",
        "alw.l5": "{0}皱着眉：「家里最近也不宽裕。」你张了张嘴，最后没再说什么。",
        "alw.l6": "{0}翻遍口袋，只凑出几张零票。你说了声谢谢，心里不是滋味。",
        "alw.refusedLog": "这次一分钱也没要到。",
        "alw.costLog": "开口的那一刻，亲情 -{0}。有些话一出口就收不回来了。",
        "alw.log": "🏠 向父母要零花钱：{0}{1}",
        "alw.got": "，拿到 {0} 元",
        "alw.none": "，一分没拿到",

        /* ---------------- 时段 / 学期 / 年级 ---------------- */
        "slot.weekday": "周中",
        "slot.clubday": "周三社团课",
        "slot.weekend": "周末",
        "term.up": "上学期",
        "term.down": "下学期",
        "grade.1": "初一",
        "grade.2": "初二",
        "grade.3": "初三",

        /* ---------------- 结局 ---------------- */
        "end.title": "初中落幕",
        "end.back": "回到主菜单",
        "end.restart": "重新开始",
        "end.talents": "天赋",
        "end.ach": "成就",
        "end.none": "无",
        "end.stat": "历时 {0} 周 · 中考 {1} 分 · 天赋 {2} 个 · 成就 {3}/{4}",
        "end.arrival": "{0} 到站了。这三年走过的每一步，都算数。",
        "end.reasonHealth": "你因健康问题提前离场。",
        "end.reasonMind": "你因心理压力过重提前离场。",
        "end.reasonMoney": "你因家庭经济困难提前离场。",
        "end.reasonStress": "你因压力连续爆表提前离场。",

        /* ---------------- 提示 ---------------- */
        "toast.saved": "💾 已保存",
        "toast.theme": "🎨 主题：{0}",
        "toast.lang": "🌐 English",
        "toast.langZh": "🌐 已切换为中文",
        "doc.missing": "文档还没生成",
      },

      /* ================================================================== */
      en: {
        "app.title": "Life Simulator",
        "app.suffix": "Edition",

        "menu.slots": "Save Slots",
        "menu.more": "Learn More",
        "menu.guide": "📘 Guide",
        "menu.changelog": "🆕 Changelog",
        "menu.credits": "🙏 Credits",
        "menu.about": "About",
        "menu.theme": "Theme",
        "menu.lang": "Language",
        "menu.settings": "Settings",
        "menu.themeHint": "Tap to switch — applies instantly and remembers your pick",
        "menu.langHint": "UI and new content are bilingual; older event text is still being translated",

        "about.body":
          `You will live through <b style="color:var(--gold)">150 weeks</b>, from Grade 7 to the high-school entrance exam.<br>
           <b style="color:var(--purple)">Talents are never handed out at the start</b> — they grow out of your choices.<br>
           Each week you take <b style="color:var(--gold)">1~2 actions</b>, and every action is followed by an <b style="color:var(--gold)">⚡ event popup</b>, sometimes chained.<br>
           <b style="color:var(--green)">🎒 Shop / Book Corner / Talent Codex / Achievements</b> are free actions and <b>cost no action slot</b>.<br>
           Some negative talents can be <b style="color:var(--green)">broken out of</b> — keep studying, keep resting, and the shadow lifts.<br>
           <span style="color:var(--dim);font-size:.85rem">"Stand firm, go far." — aboard the train, every step counts.</span>`,

        "hud.week": "Week {0}",
        "hud.act": "Actions",
        "hud.ev": "Events",
        "hud.shop": "🏪 Shop",
        "hud.talentBook": "📖 Talent Codex",
        "hud.ach": "🏆 Achievements",
        "hud.save": "💾 Save",
        "hud.home": "🏠 Menu",
        "hud.theme": "🎨 Theme",
        "hud.lang": "🌐 中/EN",

        "hud.talent": "Talents",
        "hud.talentHint": "tap for details",
        "hud.item": "Items",
        "hud.subjects": "Subjects (this grade)",
        "hud.score": "Scores",
        "hud.scoreTotal": "Overall",
        "hud.lastExam": "Last exam",
        "hud.rank": "Grade rank (est.)",
        "hud.rankVal": "Top {0}%",
        "hud.noTalent": "No talents yet — they awaken through choices",
        "hud.noItem": "No items — try the shop",
        "hud.subjToggle": "Subject detail ({0})",

        "prop.心态": "Mind",
        "prop.经济": "Money",
        "prop.健康": "Health",
        "prop.效率": "Focus",
        "prop.悟性": "Insight",
        "prop.社交": "Social",
        "prop.压力": "Stress",
        "prop.亲情": "Family",

        /* ---------------- 属性档位（模糊化显示） ---------------- */
        "level.vlow": "Very low",
        "level.low": "Low",
        "level.mid": "Fair",
        "level.high": "High",
        "level.vhigh": "Very high",

        "mood.stress": "You are about to break.",
        "mood.dark": "The world has lost its colour.",
        "mood.weak": "Your body is failing.",

        /* ---------------- 运动锻炼 ---------------- */
        "sport.log": "🏃 You broke a sweat on the field.",
        "sport.float": "Getting stronger",

        /* ---------------- 做题 ---------------- */
        "quiz.badge": "✏️ Action · Problem",
        "quiz.title": "A {0} question",
        "quiz.tip": "A correct answer boosts the subject; a wrong one costs you a little.",
        "quiz.placeholder": "Type your answer",
        "quiz.fillTip": "Units optional; punctuation is ignored.",
        "quiz.submit": "Submit",
        "quiz.giveup": "Skip it",
        "quiz.giveupLog": "You skipped the {0} question.",
        "quiz.gaveup": "You handed in a blank.",
        "quiz.resultTitle": "Check the answer",
        "quiz.correct": "✔ Correct.",
        "quiz.incorrect": "✘ Wrong.",
        "quiz.answer": "Answer: ",
        "quiz.yours": "Yours: ",
        "quiz.why": "Why: ",
        "quiz.right": "{0} — correct. That subject moved forward.",
        "quiz.wrong": "{0} — wrong. This part still slips.",
        "quiz.rightFloat": "{0} ▲",
        "quiz.wrongFloat": "{0} ▼",
        "quiz.none": "No problem fits your grade yet — you ended up reading instead.",

        /* ---------------- 亲情 / 家庭 ---------------- */
        "fam.badge": "🏠 Family · Friction",
        "fam.apologize": "Say sorry",
        "fam.shutup": "Say nothing",
        "fam.hug": "Go and hug them",
        "fam.apologizeLog": "{0} You said sorry. It eased a little, but it still sits heavy.",
        "fam.shutupLog": "{0} You said nothing. That meal took forever.",
        "fam.hugLog": "You walked over and hugged them. Shoulders that had been tight for weeks finally loosened.",
        "fam.conflictLog": "🏠 There was friction at home.",

        /* ---------------- 遗憾离场 ---------------- */
        "burn.badge": "🕯 Stress · Warning",
        "burn.warn": "⚠ Stress has been maxed out for {0} week(s) — {1} more and you will break.",
        "burn.warnTitle": "Last week",
        "burn.warnBody": "You have been pushing through for weeks.\nKeep going and your body will decide for you.\nRest once, work out, or talk to someone this week.",
        "burn.over": "🕯 Stress stayed maxed out for three weeks. You did not make it to the exam.",

        "act.title": "Choose an action",
        "act.titleN": "Choose an action ({0}/{1})",
        "act.study": "📖 Study hard",
        "act.quiz": "✏️ Do a problem",
        "act.sport": "🏃 Work out",
        "act.rest": "😴 Rest",
        "act.social": "👥 Socialize",
        "act.fun": "🎮 Slack off",
        "act.allowance": "🏠 Ask parents for money",
        "act.read": "📚 Book corner",
        "act.club": "🎪 Go to club",
        "act.clubSkip": "📖 Stay and do homework",
        "act.clubRest": "😴 Back to the dorm",
        "act.clubSocial": "👥 Hang out instead",
        "act.clubSub": "skip club this week",
        "act.restSub": "not in the mood",
        "act.socialSub": "no club today",

        "modal.close": "Close",
        "modal.continue": "Continue",
        "modal.ok": "OK",
        "modal.cancel": "Cancel",

        "badge.event": "⚡ Event {0}/{1}",
        "badge.fixed": "📅 Scheduled",
        "badge.free": "🎒 Free · costs no action",
        "badge.ending": "🏁 Ending",
        "ev.result": "Result",
        "ev.resultBadge": "⚡ Event {0}/{1} · Result",

        "talent.detail": "Talent",
        "talent.effect": "Effect",
        "talent.status": "Status",
        "talent.owned": "Owned",
        "talent.locked": "Not owned",
        "talent.conflict": "Conflicts",
        "talent.none": "None",
        "talent.book": "Talent Codex",
        "talent.bookHint": "Unlocked {0} / {1}　·　tap any talent for details",

        "shop.title": "Shop",
        "shop.body": "You step into the shop by the school gate. The shelves are packed.",
        "shop.money": "Money: {0}",
        "shop.price": "Price {0}",
        "shop.leave": "Leave",
        "shop.buy": "🏪 You bought [{0}].",
        "shop.poor": "Not enough money.",
        "item.use": "Item used",
        "item.used": "🎒 You used [{0}] — {1}",
        "item.effect": "[{0}] takes effect:",

        "book.title": "Classroom Book Corner",
        "book.body": "Books donated by classmates line the back wall. Sunlight falls on one shelf. You pull out a book —",
        "book.money": "Money: {0}",
        "book.cost": "Cost {0}",
        "book.read": "📖 You read {0}.",
        "book.poor": "Not enough money for this book.",
        "book.close": "Close the book",
        "book.putBack": "You put the book back and return to your seat.",
        "book.badge": "📚 Action · Book Corner",

        "ach.title": "Achievements",

        "save.slot": "Slot {0}",
        "save.empty": "empty",
        "save.resume": "Continue",
        "save.restart": "Restart",
        "save.delete": "Delete",
        "save.new": "New game",
        "save.over": "finished",
        "save.info": "Exam:{0} · Achievements {1} · {2}",
        "save.confirmOver": "Overwrite this save?",
        "save.confirmDel": "Delete this save?",
        "save.saved": "💾 Saved",
        "save.loaded": "💾 Save loaded — your middle school life continues!",
        "save.anon": "Nameless",
        "save.male": "Male",
        "save.female": "Female",

        "cc.title": "Create Character",
        "cc.name": "Name",
        "cc.namePh": "Enter your name",
        "cc.gender": "Gender",
        "cc.male": "Male",
        "cc.female": "Female",
        "cc.pick": "Or pick one of these:",
        "cc.start": "Begin",
        "cc.begin": "🌅 {0}'s middle school life begins.",

        "flow.weekHead": "—— Week {0} · {1}{2} · {3}月{4}{5} ——",
        "flow.actionLog": "Action ({0}/{1}): {2} → settled",
        "flow.clubLog": "🎪 Wednesday club: {0}",
        "flow.study": "Study hard",
        "flow.quiz": "Do a problem",
        "flow.sport": "Work out",
        "flow.rest": "Rest",
        "flow.social": "Socialize",
        "flow.fun": "Slack off",
        "flow.allowance": "Ask parents for money",
        "flow.read": "Book corner",
        "flow.club": "Club",
        "flow.stressBurst": "Stress overload! Mind -{0}",
        "flow.healthWarn": "⚠️ Your body is waving a red flag. Rest next week.",
        "flow.mindWarn": "⚠️ You've been down lately. Take care of yourself.",
        "flow.zhongkao": "🎓 Results are out! Your average: {0}/100",

        "exam.sheet": "{0} · Report Card",
        "exam.avg": "Average",
        "exam.full": "out of 100",
        "exam.fullMarks": "🎉 Perfect scores: {0}",
        "exam.accept": "Take the report card",
        "exam.log": "📝 [{0}] total {1}/{2}, average {3}",
        "exam.top": "Top of the grade! Everyone knows your name now.",
        "exam.bad": "You bombed it… Mind -8, Stress +10",

        "alw.title": "Ask Parents for Money",
        "alw.badge": "🏠 Action · Family",
        "alw.hint": "Family bond: {0}　·　the closer you are, the more they give and the less they nag",
        "alw.thanks": "Thanks, Mom and Dad",
        "alw.know": "Okay",
        "alw.t1": "They added a bit more",
        "alw.t2": "Given gladly",
        "alw.t3": "Given",
        "alw.t4": "Given with a lecture",
        "alw.t5": "Refused",
        "alw.t6": "Only a little",
        "alw.l1": "Before you finished asking, {0} had the wallet out: \"Don't scrimp at school.\" Then fifteen more.",
        "alw.l2": "{0} transferred it without a word, then asked whether school has been tiring.",
        "alw.l3": "{0} counted it out and handed it over, adding \"don't waste it\".",
        "alw.l4": "\"Didn't I just give you some last week?\" {0} scolded, but paid anyway. Your face went hot.",
        "alw.l5": "{0} frowned: \"Money is tight at home right now.\" You opened your mouth, then closed it.",
        "alw.l6": "{0} emptied every pocket and scraped together a few notes. You said thanks, and it tasted strange.",
        "alw.refusedLog": "You got nothing this time.",
        "alw.costLog": "The moment you asked, family bond -{0}. Some words cannot be taken back.",
        "alw.log": "🏠 Ask parents for money: {0}{1}",
        "alw.got": ", got {0}",
        "alw.none": ", got nothing",

        "slot.weekday": "Weekdays",
        "slot.clubday": "Wed club",
        "slot.weekend": "Weekend",
        "term.up": "1st term",
        "term.down": "2nd term",
        "grade.1": "Grade 7",
        "grade.2": "Grade 8",
        "grade.3": "Grade 9",

        "end.title": "Junior High Ends",
        "end.back": "Back to menu",
        "end.restart": "Play again",
        "end.talents": "Talents",
        "end.ach": "Achievements",
        "end.none": "none",
        "end.stat": "{0} weeks · Exam {1} · Talents {2} · Achievements {3}/{4}",
        "end.arrival": "{0} has arrived. Every step of these three years counted.",
        "end.reasonHealth": "You left early because of your health.",
        "end.reasonMind": "You left early under too much pressure.",
        "end.reasonMoney": "You left early because your family could not afford it.",
        "end.reasonStress": "You left early after weeks of unrelenting stress.",

        "toast.saved": "💾 Saved",
        "toast.theme": "🎨 Theme: {0}",
        "toast.lang": "🌐 English",
        "toast.langZh": "🌐 Switched to Chinese",
        "doc.missing": "Document not generated yet",
      }
    };

    /* ==================================================================
     * 取值
     * ============================================================ */

    /* 主入口：L("key", a, b) → 把文案里的 {0} {1} 依次替换 */
    function L(key) {
      const args = Array.prototype.slice.call(arguments, 1);
      let s = null;
      if (LANG !== "zh" && I18N[LANG] && I18N[LANG][key] != null) s = I18N[LANG][key];
      if (s == null && I18N.zh && I18N.zh[key] != null) s = I18N.zh[key];
      if (s == null) return key;
      for (let i = 0; i < args.length; i++) {
        s = s.split("{" + i + "}").join(args[i] == null ? "" : args[i]);
      }
      return s;
    }

    /* 双语对象取值：T({zh:"…", en:"…"}) 或 T("纯字符串") */
    function T(v) {
      if (v == null) return "";
      if (typeof v === "string") return v;
      if (typeof v !== "object") return String(v);
      if (LANG !== "zh" && v[LANG] != null) return v[LANG];
      return v.zh != null ? v.zh : (v.en != null ? v.en : "");
    }

    /* 中文专有名词：英文模式下保留中文（旧内容还没译，先原样显示） */
    function TZ(s) {return s == null ? "" : String(s);}

    /* 属性显示名 */
    function propName(k) {
      const s = L("prop." + k);
      return s === ("prop." + k) ? k : s;
    }

    /* 往某个 id 的元素里塞文本，元素不存在就安静跳过 */
    function setText(id, txt) {
      const el = document.getElementById(id);
      if (el) el.textContent = txt;
      return el;
    }

    /* 时段显示名：SLOTS 里的 {id,name} → 当前语言 */
    function slotName(slot) {
      if (!slot) return "";
      const s = L("slot." + slot.id);
      return s === ("slot." + slot.id) ? (slot.name || slot.id) : s;
    }

    /* 性别显示名：数据里存的还是 男 / 女，只在显示时翻译 */
    function genderName(g) {
      if (g === "女" || g === "Female") return L("cc.female");
      if (g === "男" || g === "Male") return L("cc.male");
      return g || "";
    }

    /* 行动显示名：study / rest / social … → 当前语言 */
    function actionName(k) {
      const s = L("flow." + k);
      return s === ("flow." + k) ? k : s;
    }

    /* ==================================================================
     * 切换语言
     * ============================================================ */
    function setLang(id, silent) {
      const ok = LANGS.some(l => l.id === id);
      LANG = ok ? id : "zh";
      try {localStorage.setItem("htzx_lang", LANG);} catch (e) { }
      if (typeof applyLangToDom === "function") applyLangToDom();
      if (typeof saveSettings === "function") saveSettings();
      if (!silent) toast(LANG === "en" ? L("toast.lang") : L("toast.langZh"));
      // 主菜单是静态 HTML，标签要靠 renderStartExtras 重刷一遍
      if (typeof renderStartExtras === "function") renderStartExtras();
      // 行动按钮是动态生成的，切语言时原地换字（不能重建，会重置本周进度）
      if (typeof relabelActions === "function") relabelActions();
      if (typeof renderHUD === "function" && S) renderHUD();
      return LANG;
    }

    function toggleLang() {
      setLang(LANG === "zh" ? "en" : "zh");
      if (typeof ensureActionPanel === "function") {
        const p = document.getElementById("actionPanel");
        if (p && p.innerHTML !== "" && S && !S.over) {p.innerHTML = ""; ensureActionPanel();}
      }
    }

    /* ==================================================================
     * 把文案刷到页面上
     * ------------------------------------------------------------------
     * 元素上写 data-i18n="key" 就是改文字，
     * 写 data-i18n-html="key" 支持内联标签，
     * 写 data-i18n-ph="key" 改 placeholder，
     * 写 data-i18n-title="key" 改 title。
     * ============================================================ */
    function applyLangToDom() {
      document.documentElement.lang = LANG === "en" ? "en" : "zh-CN";
      const root = document.body;
      if (!root) return;
      const list = root.querySelectorAll("[data-i18n],[data-i18n-html],[data-i18n-ph],[data-i18n-title]");
      for (let i = 0; i < list.length; i++) {
        const el = list[i];
        const k = el.getAttribute("data-i18n");
        if (k) el.textContent = L(k);
        const kh = el.getAttribute("data-i18n-html");
        if (kh) el.innerHTML = L(kh);
        const kp = el.getAttribute("data-i18n-ph");
        if (kp) el.setAttribute("placeholder", L(kp));
        const kt = el.getAttribute("data-i18n-title");
        if (kt) el.setAttribute("title", L(kt));
      }
      const t = document.getElementById("appTitle");
      if (t) t.textContent = L("app.title");
      if (typeof refreshDocTitle === "function") refreshDocTitle();
    }

    function refreshDocTitle() {
      const sc = (typeof GAME_CONFIG !== "undefined" && GAME_CONFIG.school) ? GAME_CONFIG.school : {};
      document.title = L("app.title") + " · " + (sc.name || "");
    }

    /* ==================================================================
     * 文档弹窗：英文模式下提示"仍在补译"
     * ------------------------------------------------------------------
     * 覆盖 js/00-docs.js 里的同名函数（本文件在它之后加载）。
     * ================================================================== */
    function openDoc(key) {
      const d = (typeof GAME_DOCS !== "undefined") && GAME_DOCS[key];
      if (!d) {if (typeof toast === "function") toast(L("doc.missing")); return;}
      const note = (LANG !== "zh")
        ? `<p style="color:var(--dim);font-size:.78rem;margin-top:8px">This document is still in Chinese — translation in progress.</p>`
        : "";
      showModal(d.title, '<div class="markdown">' + d.html + '</div>' + note,
        [{t: L("modal.close"), fn: function () { }}], null, false, true, {kind: "doc"});
    }
