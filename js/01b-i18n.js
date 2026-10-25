/* ==================================================================
 * 工具层 · 文案集中层
 * ==================================================================
 * 用法：
 *   L("ui.save")              → 取一条文案
 *   L("hud.week", 12)         → 带参数，文案里写 {0} {1}
 *   T({zh:"学习", en:"…"})     → 双语对象取值（直接传字符串也能用）
 *   TZ("学习")                → 中文内容原样返回
 *
 * ------------------------------------------------------------------
 * ★ 关于英语模式（v1.2 现状：已下线，但保留了全部接口）
 * ------------------------------------------------------------------
 * 之前做过一版英语模式，只译好了一部分界面，事件 / 天赋 / 书目仍是中文，
 * 切过去会出现半中半英、刷新不及时的问题。v1.2 起整块下线：
 *   · 页面上的切换按钮已删除
 *   · I18N 只保留 zh 一张表
 *   · LANG 固定为 "zh"
 *
 * 但下面这些全都留着，将来要重新开放英语模式时不用改任何调用点：
 *   · L() 里"先查 LANG 表、查不到回退 zh"的逻辑原样保留
 *   · T() 里"取 v[LANG]"的逻辑原样保留
 *   · TZ() 保留（英文模式下它决定中文内容要不要显示原文）
 *   · propName / slotName / genderName / actionName 这些都是走 L() 的
 *
 * 恢复步骤（将来接手的人照做即可）：
 *   1. 在 I18N 里加回 en: { ... } 一张表
 *   2. 把 LANG 从 const 改成 let，加回 setLang() / applyLangToDom()
 *   3. 在 index.html 放一个切换按钮，onclick="toggleLang()"
 *   4. 全项目 276 处 L("key") 一行都不用动
 *
 * 维护约定：
 *   1. 新增界面文案一律走 L("key")，不要在图里硬写中文 —— 这样才能双语。
 *   2. 不要在 key 里放变量，一律用 {0} 占位 + L(key, v0)。
 *
 * 维护等级：工具层（加文案时改）
 * ============================================================ */

    /* 当前语言。英语模式恢复后这里改回 let，并配合 setLang() 使用。 */
    const LANG = "zh";

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
        "about.fold": "收起",
        "about.unfold": "展开",
        "about.foldTip": "把游戏说明收起来，主菜单更短一些",
        "about.unfoldTip": "展开看看这个游戏怎么玩",
        "menu.theme": "主题色",
                "menu.settings": "设置",
        "menu.themeHint": "点一下就换，立刻生效，会记住你的选择",
        
        "about.body":
          `你将经历初一至初三共 <b style="color:var(--gold)">120 周</b>（每学期 20 周），直至中考。<br>
           寒暑假不计入周数，它是学期之间的一段独立时间。<br>
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

        /* ---------------- 存档 ---------------- */
        "save.fail": "⚠ 存档没能写入（浏览器隐私模式或空间已满）",
        "save.auto": "自动存档",

        /* ---------------- 文档实时更新 ---------------- */
        "doc.srcNet": "📄 直接读取 docs/ 里的文件（改完刷新即可）",
        "doc.srcCache": "📄 来自本机导入的版本",
        "doc.srcBuiltin": "📄 来自打包时生成的版本（改 md 后请导入或起本地服务）",
        "doc.import": "📥 导入 / 更新",
        "doc.close": "关闭",
        "doc.importTitle": "更新《{0}》",
        "doc.importTip": "在 docs/{0} 里改完之后，把文件选进来，或把内容粘贴到下面。改完立刻生效，并记住在本机。",
        "doc.importOr": "—— 或者直接粘贴 Markdown 正文 ——",
        "doc.importPh": "把 docs 里的 Markdown 内容粘贴到这里",
        "doc.doImport": "导入并查看",
        "doc.clearCache": "清除本机版本",
        "doc.imported": "✅ 已更新",
        "doc.cleared": "已清除本机版本",
        "doc.empty": "没有读到内容",
        "doc.readFail": "文件读取失败",
        "doc.missing": "这份文档还没有内容",

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
        "cc.planLabel": "玩哪几个学期",
        "cc.title": "创建角色",
        "cc.name": "姓名",
        "cc.namePh": "输入你的名字",
        "cc.gender": "性别",
        "cc.male": "男",
        "cc.female": "女",
        "cc.planLabel": "玩哪几个学期",
        "cc.bannedToast": "这个名字不能用来建存档 —— 它的主人正坐在屏幕外面看着你。",
        "cc.plan.full": "初中三年",
        "cc.plan.fullSub": "初一上 → 初三下，完整 120 周",
        "cc.plan.from2": "初二到初三",
        "cc.plan.from2Sub": "从初二开学开始，跳过初一",
        "cc.plan.only3": "只玩初三",
        "cc.plan.only3Sub": "最短的一局，直接从冲刺开始",
        "cc.plan.only1": "只玩初一",
        "cc.plan.only1Sub": "体验版，一个学年就结束",
        "cc.diffLabel": "难度",
        "cc.diff.story": "剧情模式",
        "cc.diff.storySub": "健康心态有保底，适合展示与试玩",
        "cc.diff.normal": "标准模式",
        "cc.diff.normalSub": "玩脱了真的会积劳成疾",
        "cc.diff.hard": "硬核模式",
        "cc.diff.hardSub": "更容易被压力和经济拖垮",
        "cc.setupHint": "难度与学期范围会写进存档，读档后沿用。",
        "cc.planNote": "从中间年级开始时，各科会按该年级应有的水平初始化。",
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
        "exam.total": "卷面总分",

        /* ---------------- v1.3 旅游 ---------------- */
        "travel.title": "🧳 假期 · 要不要出去走走",
        "travel.lead": "假期长，作业也长。你是想在家待着，还是出去看看？",
        "travel.money": "手头的钱",
        "travel.hint": "出门要花路费和门票，但有些东西，只有在路上才能遇到。",
        "travel.go": "去{0}",
        "travel.from": "约 {0} 起",
        "travel.pick": "可去 {0} 站",
        "travel.stay": "在家待着",
        "travel.staySub": "省钱，但假期会平淡一些",
        "travel.mapTitle": "{0} · 选几个地方",
        "travel.mapLead": "地图上标着能去的地方。点一下选上，再点一下取消。\n{0}这一趟可以走 {1} 站。",
        "travel.chosen": "已选 {0} / {1}",
        "travel.spend": "预计花费",
        "travel.full": "这一趟最多只能去 {0} 站",
        "travel.poor": "钱不够去{0}了",
        "travel.confirm": "出发",
        "travel.back": "再想想",
        "travel.setoff": "🧳 你出发了。{0}的这一趟，开始了。",
        "travel.at": "📍 {0}",
        "travel.shortTitle": "🧳 七天假 · 要不要出去走走",
        "travel.shortLead": "七天，够去一个地方。\n作业可以回来再写，但有些地方，只有这几天才去得了。",
        "travel.shortHint": "七天假去不了太远，也去不了太多地方 —— 省内，一站。",
        "travel.shortGo": "出去走一趟",
        "travel.shortGoSub": "省内，选一个地方",
        "travel.shortOpt": "🧳 出门走走",
        "travel.shortOptSub": "七天假，够去一个地方",

        /* ---------------- v1.3 节假日 ---------------- */
        "hol.lead": "{0}　{1}",
        "hol.note": "这一周是{0}。",
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
                        "doc.missing": "文档还没生成"
      },

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
     * 把文案刷到页面上
     * ------------------------------------------------------------------
     * 元素上写 data-i18n="key" 就是改文字，
     * 写 data-i18n-html="key" 支持内联标签，
     * 写 data-i18n-ph="key" 改 placeholder，
     * 写 data-i18n-title="key" 改 title。
     *
     * 现在语言固定中文，所以这个函数只在启动时跑一次（见 js/19-boot.js）。
     * 英语模式恢复后，切换语言时再调一次即可刷新全站文案。
     * ============================================================ */
    function applyLangToDom() {
      document.documentElement.lang = "zh-CN";
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
