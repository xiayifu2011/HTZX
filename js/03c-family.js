/* ==================================================================
 * 内容层 · 亲情与家庭称呼
 * ==================================================================
 * 两件事：
 *   1. 亲情逻辑：要钱掉亲情、亲情低会触发家庭矛盾、也会要不到钱
 *   2. 家庭称呼：带「单亲家庭」天赋时，事件里的爸爸妈妈不会再换来换去
 *
 * 维护等级：内容层（可直接改文案与数值）
 * ================================================================== */

    /* ---------------- 配置读取 ---------------- */

    function famCfg() {
      const f = (typeof GAME_CONFIG !== "undefined" && GAME_CONFIG.family) || {};
      return {
        askCost: num(f.askCost, 6),
        askCostRich: num(f.askCostRich, 2),
        lowAt: num(f.lowAt, 40),
        conflictAt: num(f.conflictAt, 30),
        conflictChance: num(f.conflictChance, 0.35),
        weeklyDrop: num(f.weeklyDrop, 0.45),
        weeklyDropVal: num(f.weeklyDropVal, 4)
      };
    }

    function famOf() {
      if (!S || !S.prop) return 80;
      return clampNum(S.prop.亲情, 0, 150, 80);
    }

    /* ==================================================================
     * 家庭称呼：单亲家庭只会有一个大人
     * ------------------------------------------------------------------
     * S.familyMain 记录"家里是谁" —— "妈" 或 "爸"。
     * 普通家庭：事件里写妈妈就是妈妈，写爸爸就是爸爸（原样）。
     * 单亲家庭：两种称呼一律收敛成同一位家长，不会再一会爸爸一会妈妈。
     * 留守少年：父母在外，家里说话的是奶奶。
     *
     * ★ 想改称呼，只改下面 PARENT_WORD 这一张表。
     * ================================================================== */

    const PARENT_WORD = {
      mom: {zh: "妈妈", en: "Mum"},
      dad: {zh: "爸爸", en: "Dad"},
      grandma: {zh: "奶奶", en: "Grandma"},
      grandpa: {zh: "爷爷", en: "Grandpa"}
    };

    /* 这位家长在游戏里叫什么 */
    function parentCall(which) {
      const w = PARENT_WORD[which] || PARENT_WORD.mom;
      return (typeof LANG !== "undefined" && LANG === "en") ? w.en : w.zh;
    }

    /* 家里现在主要靠谁（缓存，避免每次都随机）
     * ★ 家庭结构变了（比如中途拿到/失去「单亲家庭」）会重新定一次。 */
    function familyMain() {
      if (!S) return "mom";
      const type = (typeof familyType === "function") ? familyType() : "both";
      const cur = S.familyMain;
      const okSingle = (cur === "mom" || cur === "dad");
      const okLeft = (cur === "grandma");

      if (type === "left") {if (!okLeft) S.familyMain = "grandma"; return S.familyMain;}
      if (type === "single") {
        if (!okSingle) S.familyMain = Math.random() < 0.5 ? "mom" : "dad";
        return S.familyMain;
      }
      return cur || "mom";
    }

    /* 家庭结构：single 单亲 / left 留守 / both 双亲 */
    function familyType() {
      if (typeof Talent === "undefined") return "both";
      if (Talent.have("留守少年")) return "left";
      if (Talent.have("单亲家庭")) return "single";
      return "both";
    }

    /* ==================================================================
     * 事件文本里的家长称呼统一替换
     * ------------------------------------------------------------------
     * 用法：渲染事件前对 title / body / 选项文字跑一遍 famText()。
     * 双亲家庭：原样返回（事件里写什么就是什么）。
     * 单亲 / 留守：所有"爸爸""妈妈""爸妈"都收敛成同一位家长。
     * ================================================================== */

    function famText(s) {
      if (s == null) return s;
      if (typeof s !== "string") return s;
      const type = familyType();
      if (type === "both") return s;             // 双亲家庭不需要改
      if (s.indexOf("妈") < 0 && s.indexOf("爸") < 0 && s.indexOf("父母") < 0 && s.indexOf("家长") < 0) return s;

      const who = parentCall(familyMain());
      let out = s;

      if (type === "left") {
        // 留守：爸妈都在外地，家里管你的是爷爷奶奶
        out = out.replace(/妈妈/g, parentCall("grandma"));
        out = out.replace(/爸爸/g, parentCall("grandpa"));
        return out;                 // 「爸妈 / 父母」保留，因为说的确实是那两个人
      }

      // 单亲：一律用同一位家长
      out = out.replace(/爸妈|父母|家长/g, who);
      out = out.replace(/妈妈|母亲/g, who);
      out = out.replace(/爸爸|父亲/g, who);
      return out;
    }

    /* ==================================================================
     * 亲情数值操作
     * ================================================================== */

    /* 要一次钱 → 掉多少亲情（亲情本来就低时掉得更多，形成恶性循环） */
    function askCostFam() {
      const c = famCfg(), fam = famOf();
      if (fam >= 120) return c.askCostRich;
      if (fam >= 80) return Math.round(c.askCost * 0.6);
      return c.askCost;
    }

    /* 亲情是否低到"开口都难" */
    function famLow() {return famOf() < famCfg().lowAt;}

    /* ==================================================================
     * 家庭矛盾：亲情过低时触发
     * ------------------------------------------------------------------
     * 负面效果是实打实的：心态、压力、效率都受挫，且亲情再掉一截。
     * 触发后设一个冷却，不会连续几周连环炸。
     * ================================================================== */

    const FAMILY_CONFLICTS = [
      {
        t: "饭桌上的沉默",
        c: "晚饭时你多夹了一筷子菜，{p}把碗一放：「你现在眼里还有这个家吗？」\n你低头扒饭，没接话。\n碗筷碰撞的声音，比吵起来还难熬。",
        say: "饭桌上的一句话，堵了你一整晚。",
      },
      {
        t: "电话里的争吵",
        c: "你在电话里提了一句想要买资料，{p}在那头沉默了很久。\n「上周不是刚给过？」\n你说那是用完了，{p}说：「那你说说花在哪了。」\n你忽然觉得很累。",
        say: "电话挂断后，宿舍安静得能听见走廊的灯管在响。",
      },
      {
        t: "成绩单被翻了出来",
        c: "{p}收拾房间时翻出了上次考试的卷子。\n分数就印在右上角，谁都看得见。\n「这就是你说的好好学？」\n你想解释，但张开嘴发现自己也没有底气。",
        say: "你躲进房间，把那张卷子压在了抽屉最底下。",
      },
      {
        t: "谁也不肯先开口",
        c: "周末回家，你和{p}一整天没说超过三句话。\n不是不在乎，是都太累了 —— 一个累于生计，一个累于期待。\n晚上你听见客厅的电视一直开着，其实没人看。",
        say: "有些隔阂不是吵出来的，是慢慢长出来的。",
      },
    ];

    /* 是否该在本周结算时触发一次家庭矛盾 */
    function shouldFamilyConflict() {
      const c = famCfg();
      if (famOf() >= c.conflictAt) return false;
      if (S.famConflictWeek != null && Math.abs(num(S.week, 0) - num(S.famConflictWeek, 0)) < 3) return false;  // 冷却 3 周
      return Math.random() < c.conflictChance;
    }

    /* 弹一次家庭矛盾（返回弹窗定义，由调用方 showPopup） */
    function buildFamilyConflict() {
      const e = FAMILY_CONFLICTS[rnd(FAMILY_CONFLICTS.length)];
      const p = parentCall(familyMain());
      S.famConflictWeek = num(S.week, 0);

      const body = famText(e.c).replace(/\{p\}/g, p);
      return {
        kind: "event",
        badge: L("fam.badge"),
        title: famText(e.t).replace(/\{p\}/g, p),
        body: `<div style="line-height:1.7">${body.replace(/\n/g, "<br>")}</div>`,
        options: [{
          t: L("fam.apologize"),
          fn: () => {
            modProp("心态", -6); modProp("压力", 8); modProp("效率", -6); modProp("亲情", 4);
            say(L("fam.apologizeLog", e.say), "bad");
          }
        }, {
          t: L("fam.shutup"),
          fn: () => {
            modProp("心态", -10); modProp("压力", 12); modProp("效率", -4); modProp("亲情", -5);
            say(L("fam.shutupLog", e.say), "bad");
          }
        }, {
          t: L("fam.hug"),
          cond: () => famOf() >= 20,
          fn: () => {
            modProp("心态", -2); modProp("压力", 2); modProp("亲情", 10);
            say(L("fam.hugLog"), "good");
          }
        }]
      };
    }
