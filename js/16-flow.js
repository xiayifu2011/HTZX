/* ==================================================================
 * 引擎层 · 主循环
 * ==================================================================
 * 一周的完整流程：开周 → 选行动 → 弹事件 → 结算 → 下一周。
 * 事件链（一次一弹、连锁概率）也在这里。
 *
 * 维护等级：引擎层（一般不动）
 * ============================================================ */

    function weekInTerm() {return S.week % (WEEKS_PER_TERM + 1)}

    function gradeName() {return L("grade." + (Math.min(2, Math.floor(S.term / 2)) + 1))}

    function termName() {return (S.term % 2 === 0) ? L("term.up") : L("term.down")}

    function nextWeek() {
      if (S.over) return;
      S.week++;
      saveGame(false);
      startWeek();
    }

    function ensureActionPanel() {
      if (!S || S.over || popupBusy) return;   // 有弹窗正在处理时不补行动面板
      const panel = document.getElementById("actionPanel");
      if (!panel) return;
      if (panel.innerHTML !== "") return;
      const wit = weekInTerm();
      const fixed = fixedEventOf(S.term, wit);
      if (!fixed) offerActions();
    }

    function startWeek() {
      if (S) {
        S.evWeekTotal = 0;           // 新的一周：事件计数清零
        S.evCountWeek = 0;
        S.evCntWeek = {};
        S.actCount = 0;
        S.actQuota = 0;
        flushPending();              // 清掉过期的后续事件
        // 生成本周的时段序列（周中 → 周末，顺序固定；数量可动态增减）
        S.slotPlan = buildWeekSlots();
        S.slotIdx = 0;
        S.slot = S.slotPlan[0];
        S.actQuota = S.slotPlan.length;
      }
      const wit0 = weekInTerm();
      if (S && !fixedEventOf(S.term, wit0)) S.actQuota = num(S.slotPlan && S.slotPlan.length, actionQuota());
      renderHUD();
      if (S.over) return;
      /* 中考：跑完玩家选的那几个学期就考（默认跑满六年制 → 6 个学期）。
       * 只玩初一 / 只玩初三时，endTerm() 会提前收口。 */
      const last = (typeof endTerm === "function") ? endTerm() : (TERMS - 1);
      if (S.week > 0 && weekInTerm() === 0 && S.term > last) {return zhongkao();}
      const wit = weekInTerm();
      const wi = weekInfo(S.week, S.term);
      say(L("flow.weekHead", S.week, gradeName(), termName(), wi.month, wi.seasonIcon, wi.season), "week-head");
      const fixed = fixedEventOf(S.term, wit);
      if (fixed) runFixed(fixed);
      else offerActions();
    }

    /* 是否需要抢社团
     * ------------------------------------------------------------------
     * 规则：
     *   1. 只在「上学期」开放（初一上 / 初二上 / 初三上，term 0 / 2 / 4）
     *   2. 窗口是每学期第 3~5 周的周末
     *   3. 整个窗口只弹一次 —— 抢不上就这一年没有社团
     *   4. 已经选中过「不报了」的，这一年不再问
     * ================================================================== */
    function needClubGrab() {
      if (!S) return false;
      const term = clampNum(S.term, 0, 9, 0);
      if (term % 2 !== 0) return false;               // 只有上学期
      if (S.clubTerm === term) return false;          // 这一年已经处理过了
      if (S.clubSkipTerm === term) return false;      // 这一年主动放弃了
      const wit = weekInTerm();
      if (wit < 3 || wit > 5) return false;           // 第 3~5 周
      if (S.slot !== "weekend") return false;
      return true;
    }

    function showClubGrab() {
      S.clubTerm = clampNum(S.term, 0, 9, 0);     // 这一年只问这一次
      const wi = weekInfo(S.week, S.term);
      showPopup({
        kind: "free",
        badge: "🎉 社团 · 周末",
        title: CLUB_GRAB_EVENT.t,
        body: `<div style="line-height:2">${String(CLUB_GRAB_EVENT.c).replace(/\n/g, "<br>")}
          <br><span style="color:var(--dim);font-size:.85rem">${wi.month}月 · ${wi.seasonIcon}${wi.season} · ${gradeName()}上学期 · 报名窗口只有这一次</span></div>`,
        options: (typeof buildClubGrabOpts === "function") ? buildClubGrabOpts() : [{t: "知道了", fn: () => {ensureActionPanel();}}]
      }, () => {ensureActionPanel();});
    }

    function offerActions() {
      // 开学第 3~5 周的周末：抢社团（红塔中学特色，手慢无，每学年上学期一次）
      if (needClubGrab()) {showClubGrab(); return;}

      // 周三社团课：行动选项换成社团专属的
      if (S.slot === "clubday") {offerClubActions(); return;}

      const acts = [
        {k: "study", t: L("act.study")},
        {k: "quiz", t: L("act.quiz")},
        {k: "sport", t: L("act.sport")},
        {k: "rest", t: L("act.rest")},
        {k: "social", t: L("act.social")},
        {k: "fun", t: L("act.fun")},
        {k: "allowance", t: L("act.allowance")},
        {k: "read", t: L("act.read")},
      ];

      const box = document.getElementById("actionPanel");
      const doneN = num(S.actCount, 0), allN = num(S.actQuota, 1);
      const slot = SLOT_MAP[S.slot] || SLOTS[0];
      box.innerHTML = `<div class='tag-title'>${slot.icon} ${slotName(slot)} · ${allN > 1 ? L("act.titleN", doneN + 1, allN) : L("act.title")}</div>`;
      const grid = document.createElement("div");
      grid.className = "actgrid";
      acts.forEach(a => {
        const b = document.createElement("button"); b.className = "btn";
        b.innerHTML = `<b>${a.t}</b>`;
        b.dataset.actKey = "act." + a.k;      // 记住文案键，切语言时原地改字
        b.onclick = () => takeAction(a.k); grid.appendChild(b);
      });
      box.appendChild(grid);
      // 道具不在这里重复列出 —— 用道具请点顶部「🎒 道具」按钮
      renderHUD();
    }

    /* 周三社团课的行动选项
     * 社团活动只在周三下午发生，这里的选项和平时不一样。 */
    function offerClubActions() {
      const c = CLUB_MAP[S.club];
      const box = document.getElementById("actionPanel");
      const doneN = num(S.actCount, 0), allN = num(S.actQuota, 1);
      const slot = SLOT_MAP[S.slot] || SLOTS[0];
      box.innerHTML = `<div class='tag-title'>${slot.icon} ${slotName(slot)}${allN > 1 ? `（${doneN + 1}/${allN}）` : ""}</div>`;

      const grid = document.createElement("div");
      grid.className = "actgrid";

      const mk = (t, sub, fn, key, subKey) => {
        const b = document.createElement("button");
        b.className = "btn";
        b.innerHTML = sub ? `<b>${t}</b><br><small>${sub}</small>` : `<b>${t}</b>`;
        if (key) b.dataset.actKey = key;
        if (subKey) b.dataset.actSubKey = subKey;
        b.onclick = fn;
        grid.appendChild(b);
      };

      mk(`${c ? c.icon : "🎪"} ${L("act.club")}`, c ? TZ(c.n) : "", () => takeAction("club"), "act.club");
      mk(L("act.clubSkip"), L("act.clubSub"), () => takeAction("study"), "act.clubSkip", "act.clubSub");
      mk(L("act.clubRest"), L("act.restSub"), () => takeAction("rest"), "act.clubRest", "act.restSub");
      mk(L("act.clubSocial"), L("act.socialSub"), () => takeAction("social"), "act.clubSocial", "act.socialSub");

      box.appendChild(grid);
      renderHUD();
    }

    /* 切换语言后，把行动按钮上的字原地换成新语言
     * （不能重新 offerActions —— 那会重置本周的行动进度） */

    function relabelActions() {
      const box = document.getElementById("actionPanel");
      if (!box) return;
      box.querySelectorAll("button[data-act-key]").forEach(b => {
        const key = b.dataset.actKey;
        const subKey = b.dataset.actSubKey;
        const icon = (b.textContent.match(/^[^\u4e00-\u9fa5A-Za-z]*/) || [""])[0];
        const t = L(key);
        if (subKey) {
          const small = b.querySelector("small");
          const clubName = small ? small.textContent : "";
          b.innerHTML = `<b>${t}</b><br><small>${L(subKey) || clubName}</small>`;
        } else {
          b.innerHTML = `<b>${t}</b>`;
        }
      });
      // 标题行（含时段名与进度）整体重刷一次
      const tag = box.querySelector(".tag-title");
      if (tag && typeof slotName === "function") {
        const slot = SLOT_MAP[S.slot] || SLOTS[0];
        const allN = num(S.actQuota, 1), doneN = num(S.actCount, 0);
        tag.innerHTML = `${slot.icon} ${slotName(slot)} · ${allN > 1 ? L("act.titleN", doneN + 1, allN) : L("act.title")}`;
      }
    }

    /* 本周可以选几次行动（按学期取配置） */

    function actionQuota() {
      const cfg = GAME_CONFIG.actionsPerWeek;
      const v = cfg[Math.min(cfg.length - 1, Math.max(0, clampNum(S.term, 0, 5)))];
      return Math.max(1, Math.round(num(v, 1)));
    }

    /* 推进到下一个时段（周中 → 周末），返回是否还有时段 */
    function advanceSlot() {
      if (!Array.isArray(S.slotPlan) || !S.slotPlan.length) {
        S.slotPlan = buildWeekSlots(); S.slotIdx = 0; S.slot = S.slotPlan[0];
        S.actQuota = S.slotPlan.length;
        return true;
      }
      S.slotIdx = clampNum(S.slotIdx + 1, 0, S.slotPlan.length - 1);
      if (S.slotIdx >= S.slotPlan.length - 1) S.slotIdx = S.slotPlan.length - 1;
      S.slot = S.slotPlan[S.slotIdx];
      return S.slotIdx < S.slotPlan.length - 1 || S.actCount < S.actQuota;
    }

    /* 当前时段是否已走完（用于判断是否进入下一个时段） */
    function slotDone() {
      if (!Array.isArray(S.slotPlan) || !S.slotPlan.length) return true;
      return (S.slotIdx + 1) > (S.actCount || 0);
    }

    /* 一次「本周行动」：结算 → 1 个事件弹窗 → 可能连锁 1~2 个 → 收尾 */

    function takeAction(k) {
      document.getElementById("actionPanel").innerHTML = "";
      if (k === "read") {openBookCorner(() => afterAction(k)); return;}
      // 「做题」：先弹一道题，答完才算这一周的行动结算完毕
      if (k === "quiz") {openQuiz(() => afterAction(k)); return;}
      // 「运动锻炼」：先结算身体收益，再按概率连锁运动类事件
      if (k === "sport") {sportSettle(() => runSportChain(() => afterAction(k))); return;}
      // 「向父母要零花钱」不产生学力，走单独的结算（弹完再走事件链）
      if (k === "allowance") {allowanceSettle(() => runEventChain(() => afterAction(k))); return;}
      // 「去社团活动」：走社团专属事件（周三社团课）
      if (k === "club") {
        S.actCount = (S.actCount || 0) + 1;
        S.evCntWeek = {};
        S.evCountWeek = 0;
        say(L("flow.clubLog", clubName() || L("flow.club")), "sys");
        renderHUD();
        runClubEvent(() => afterAction(k));
        return;
      }
      studySettle(k);
      say(L("flow.actionLog", (S.actCount || 0) + 1, S.actQuota || 1, actionName(k), Math.round(num(S.score, 0))), "sys");
      S.actCount = (S.actCount || 0) + 1;
      S.evCntWeek = {};
      S.evCountWeek = 0;
      renderHUD();
      runEventChain(() => afterAction(k));
    }

    /* ==================================================================
     * 运动锻炼的连锁事件
     * ------------------------------------------------------------------
     * 运动完之后，按配置概率从 SPORT_EVENTS 里抽 1~2 条运动类事件。
     * 抽不到就安静收尾 —— 运动本身已经给了身体上的收益。
     * ================================================================== */

    function runSportChain(done) {
      const cfg = (GAME_CONFIG && GAME_CONFIG.sport) || {};
      const chances = [num(cfg.chainChance && cfg.chainChance[0], 0.7), num(cfg.chainChance && cfg.chainChance[1], 0.35)];
      if (typeof pickSportEvent !== "function") {done(); return;}

      let i = 0;
      const step = () => {
        if (S.over || i >= chances.length) {done(); return;}
        if ((S.evWeekTotal || 0) >= GAME_CONFIG.maxEventsPerWeek) {done(); return;}
        if (Math.random() >= chances[i]) {done(); return;}
        const ev = pickSportEvent();
        if (!ev) {done(); return;}
        i++;
        S.evCntWeek[ev.id] = true;
        S.evCnt[ev.id] = (S.evCnt[ev.id] || 0) + 1;
        if (!S.evLastWeek) S.evLastWeek = {};
        S.evLastWeek[ev.id] = num(S.week, 0);
        S.evWeekTotal = (S.evWeekTotal || 0) + 1;
        S.evCountWeek = (S.evCountWeek || 0) + 1;
        renderHUD();
        showPopup(defOf(ev, "🏃 运动 · 连锁"), () => showEventResult(step));
      };
      step();
    }

    /* 周三社团课：保证出一个本社团的事件
     * 优先从本社团的事件里挑；实在没有（比如全都冷却中）就走普通事件链。 */
    function runClubEvent(done) {
      const mine = EVENTS.filter(e => e.id && e.id.indexOf("cl_") === 0
        && CLUB_MAP[S.club] && e.id.indexOf("cl_" + S.club) === 0
        && (!e.cond || e.cond(S)) && eventAllowed(e) && !S.evCntWeek[e.id]);
      let ev = null;
      if (mine.length) {
        const total = mine.reduce((a, e) => a + Math.max(0.1, eventWeight(e)), 0);
        let r = Math.random() * total;
        for (const e of mine) {r -= Math.max(0.1, eventWeight(e)); if (r <= 0) {ev = e; break;} }
        if (!ev) ev = mine[0];
      }
      if (!ev) {runEventChain(done); return;}
      S.evCntWeek[ev.id] = true;
      S.evCnt[ev.id] = (S.evCnt[ev.id] || 0) + 1;
      if (!S.evLastWeek) S.evLastWeek = {};
      S.evLastWeek[ev.id] = num(S.week, 0);
      S.evWeekTotal = (S.evWeekTotal || 0) + 1;
      S.evCountWeek = (S.evCountWeek || 0) + 1;
      renderHUD();
      showPopup(defOf(ev, "🎪 社团活动"), () => showEventResult(done));
    }

    /* 行动结束：先结算「破茧」进度，再决定是继续选行动还是结束本周 */

    function afterAction(k) {
      const cont = () => {
        if (S.over) return;
        if ((S.actCount || 0) < (S.actQuota || 1)) {
          advanceSlot();               // 周中做完 → 进入周末
          offerActions();
        } else afterWeek();
      };
      // 先消负面天赋（破茧），再检查有没有正面天赋因为久不练习而退化
      flushCure(() => {
        if (typeof flushDecay === "function") flushDecay(cont);
        else cont();
      });
    }

    /* 事件链：一次只弹一个；保底 1 个，之后按概率连锁，最多 maxChainEvents 个 */

    let resultBase = 0;

    function runEventChain(done) {
      let fired = 0;
      const step = () => {
        if (S.over) return done();
        if ((S.evWeekTotal || 0) >= GAME_CONFIG.maxEventsPerWeek) return done();
        const maxHere = Math.max(1, GAME_CONFIG.eventsPerAction) + Math.max(0, GAME_CONFIG.maxChainEvents);
        if (fired >= maxHere) return done();
        // 保底事件放完后，按概率决定是否连锁
        if (fired >= Math.max(1, GAME_CONFIG.eventsPerAction)) {
          const idx = fired - Math.max(1, GAME_CONFIG.eventsPerAction);
          const p = num(GAME_CONFIG.chainChance[idx], 0);
          if (Math.random() >= p) return done();
        }
        const def = buildEventDef();          // 现场挑选（能感知上一条事件带来的变化）
        if (!def) return done();              // 没有可用事件，直接收尾
        fired++;
        S.evCountWeek = (S.evCountWeek || 0) + 1;
        S.evWeekTotal = (S.evWeekTotal || 0) + 1;
        renderHUD();
        showPopup(def, () => showEventResult(step));
      };
      step();
    }

    /* 挑一个随机事件，包装成统一的弹窗定义 */

    /* ==================================================================
     * 单个事件的概率控制
     * ------------------------------------------------------------------
     * 写在事件定义里的可选字段（不写就用全局默认）：
     *   w: 5          基础权重，数字越大越常见
     *   once: true    一生只出现一次
     *   maxTimes: 3   最多出现 3 次，之后永不再出现
     *   decay: 0.5    每出现一次，权重乘以 0.5（0.5 = 减半）
     *   decayFloor: 0.1  衰减到原权重的 10% 就不再降了
     *   minTerm: 4    最早第几学期才出现（0=初一上，4=初三上）
     *   maxTerm: 5    最晚第几学期还会出现
     *
     * 例：
     *   {id: "x", w: 6, once: true,   ...}   // 很常见，但只出现一次
     *   {id: "y", w: 4, decay: 0.3,   ...}   // 出现一次后概率降到三成
     *   {id: "z", w: 5, maxTimes: 2,  ...}   // 最多出现两次
     * ================================================================== */

    /* 全局默认衰减（事件自己没写 decay 时用这个） */

    const EVENT_DECAY_STEP = 0.2;    // 每出现一次衰减 20%
    const EVENT_DECAY_MAX = 3;       // 最多衰减 3 次
    const EVENT_DECAY_FLOOR = 0.4;   // 最低不低于原权重的 40%

    /* 该事件此刻是否还能出现
     * ------------------------------------------------------------------
     * 依次检查：是否进池 → 次数/年级 → 时段 → 季节/月份 → 最小间隔
     * ================================================================== */

    function eventAllowed(e) {
      if (num(e.w, 1) <= 0) return false;              // w:0 = 不走随机池（由固定日程调用）
      const n = S.evCnt[e.id] || 0;
      if (e.once && n >= 1) return false;
      if (e.maxTimes != null && n >= e.maxTimes) return false;
      if (e.minTerm != null && clampNum(S.term, 0, 9) < e.minTerm) return false;
      if (e.maxTerm != null && clampNum(S.term, 0, 9) > e.maxTerm) return false;

      // 时段：周中住校的事不会跑到周末去，反之亦然
      // slot 可以写成单个 "weekday"，也可以写成数组 ["weekday","clubday"]
      const slot = e.slot || "any";
      if (slot !== "any" && S.slot) {
        const arr = Array.isArray(slot) ? slot : [slot];
        if (arr.indexOf(S.slot) < 0) return false;
      }

      // 季节 / 月份
      if (e.season || e.months) {
        const w = weekInfo(S.week, S.term);
        if (e.season) {
          const arr = Array.isArray(e.season) ? e.season : [e.season];
          if (arr.indexOf(w.season) < 0) return false;
        }
        if (e.months) {
          const arr = Array.isArray(e.months) ? e.months : [e.months];
          if (arr.indexOf(w.month) < 0) return false;
        }
      }

      // 最小间隔（让事件均匀地铺开，而不是扎堆）
      const gap = num(e.minGap, num(GAME_CONFIG.eventDist && GAME_CONFIG.eventDist.minGap, 0));
      if (gap > 0 && n > 0) {
        const last = (S.evLastWeek && S.evLastWeek[e.id] != null) ? num(S.evLastWeek[e.id], 0) : null;
        if (last != null && (num(S.week, 0) - last) < gap) return false;
      }
      return true;
    }

    /* 该事件此刻的有效权重
     * ------------------------------------------------------------------
     * dist 决定它「怎么分布在整个游戏里」：
     *   uniform 均匀 —— 距上次出现越久，权重越高（适合社团这类常驻事件）
     *   decay   衰减 —— 每出现一次权重 ×decay（适合一次性强的事件）
     *   front   前期多 —— 游戏前期概率高
     *   back    后期多 —— 游戏后期概率高
     * 另外：被「挂起」的事件（raiseEvent）权重会临时放大
     * ================================================================== */

    function eventWeight(e) {
      const n = S.evCnt[e.id] || 0;
      const w0 = num(e.w, 1);
      const cfg = GAME_CONFIG.eventDist || {};
      const mode = e.dist || cfg.mode || "decay";
      let w = w0;

      if (mode === "uniform") {
        const last = (S.evLastWeek && S.evLastWeek[e.id] != null) ? num(S.evLastWeek[e.id], 0) : null;
        if (last == null) w = w0 * 1.6;                       // 从没出现过 → 优先
        else {
          const gap = Math.max(0, num(S.week, 0) - last);
          const target = Math.max(2, num(e.minGap, 4));
          w = w0 * clampNum(gap / target, 0.15, 1.8);
        }
      } else if (mode === "decay") {
        const d = (e.decay != null) ? e.decay : num(cfg.decay, 0.5);
        const fl = (e.decayFloor != null) ? e.decayFloor : num(cfg.decayFloor, 0.15);
        w = w0 * Math.max(fl, Math.pow(clampNum(d, 0, 1, 0.5), n));
      } else if (mode === "front") {
        const prog = clampNum(S.week, 0, 150) / 150;
        w = w0 * clampNum(1.4 - prog * 1.2, 0.15, 1.4);
      } else if (mode === "back") {
        const prog = clampNum(S.week, 0, 150) / 150;
        w = w0 * clampNum(0.3 + prog * 1.3, 0.3, 1.6);
      }

      w *= pendingMult(e.id);      // 被挂起的后续事件，概率临时放大
      return Math.max(0, w);
    }

    /* 执行一个选项：基础效果 + 条件分支 + 后续安排 */

    function execOption(o) {
      resultBase = S.logs.length;
      runEffectSpec(o.run, S);

      // 条件分支：按顺序判断，命中第一个就执行并停止
      if (Array.isArray(o.branch) && o.branch.length) {
        for (const b of o.branch) {
          const ok = (typeof b.cond === "function") ? !!b.cond(S) : true;
          if (!ok) continue;
          runEffectSpec(b.run, S);
          if (b.say) say(b.say, b.cls || "");
          break;
        }
      }

      // 后续安排
      if (o.flag) setFlag(o.flag, true);
      if (Array.isArray(o.flags)) o.flags.forEach(f => setFlag(f, true));
      if (o.unflag) setFlag(o.unflag, false);
      if (o.raise) {
        const list = Array.isArray(o.raise) ? o.raise : [o.raise];
        list.forEach(r => {
          if (!r || !r.id) return;
          raiseEvent(r.id, r.weeks, r.mult, r.slot);
        });
      }
      if (o.next) {
        if (!Array.isArray(S.chainQueue)) S.chainQueue = [];
        S.chainQueue.push(o.next);       // 排在后面，等本条结束再弹
      }
      checkAch();
    }

    /* 标记（flag）：让"有没有带手机"这类状态能被后续事件读到 */

    function setFlag(k, v) {
      if (!S.flags) S.flags = {};
      S.flags[k] = !!v;
    }

    function hasFlag(k) {
      return !!(S.flags && S.flags[k]);
    }

    function buildEventDef() {
      if ((S.evWeekTotal || 0) >= GAME_CONFIG.maxEventsPerWeek) return null;

      // 优先弹「排队等着的后续事件」
      if (Array.isArray(S.chainQueue) && S.chainQueue.length) {
        const id = S.chainQueue.shift();
        const q = EVENTS.find(e => e.id === id);
        if (q && (!q.cond || q.cond(S)) && q.opts && q.opts.length) {
          S.evCntWeek[id] = true;
          S.evCnt[id] = (S.evCnt[id] || 0) + 1;
          if (!S.evLastWeek) S.evLastWeek = {};
          S.evLastWeek[id] = num(S.week, 0);
          return defOf(q, "⚡ 事件 · 后续");
        }
      }

      let pool = EVENTS.filter(e => !e.cond || e.cond(S));
      pool = pool.filter(e => eventAllowed(e));               // 时段/季节/次数/间隔
      pool = pool.filter(e => !S.evCntWeek[e.id]);            // 同一事件每周最多 1 次
      const fresh = pool.filter(e => (S.evCnt[e.id] || 0) < 2);
      if (fresh.length > 0) pool = fresh;                      // 优先没见过的
      if (!pool.length) return null;
      const effW = e => Math.max(0.1, eventWeight(e));
      const total = pool.reduce((s, e) => s + effW(e), 0);
      let r = Math.random() * total, ev = pool[0];
      for (const e of pool) {r -= effW(e); if (r <= 0) {ev = e; break;} }
      S.evCntWeek[ev.id] = true;
      S.evCountWeek++;
      S.evCnt[ev.id] = (S.evCnt[ev.id] || 0) + 1;
      if (!S.evLastWeek) S.evLastWeek = {};
      S.evLastWeek[ev.id] = num(S.week, 0);
      return defOf(ev, "");
    }

    /* 把一个事件定义包装成弹窗定义 */

    function defOf(ev, badge) {
      const slot = SLOT_MAP[S.slot] || SLOTS[0];
      /* 单亲 / 留守家庭：事件里爸爸妈妈的称呼要统一，不能一会妈一会爸。
       * 双亲家庭 famText 原样返回，不做任何改动。 */
      const F = (typeof famText === "function") ? famText : (x => x);
      const body = ev.c;
      return {
        kind: "event",
        title: F(ev.t),
        body: F(body),
        img: ev.img,
        badge: badge || "",
        slotNote: slot.icon + slot.name,
        options: ev.opts.filter(o => true).map(o => ({
          t: F(o.t), sub: F(o.sub || ""),
          disabled: !!(o.cond && !o.cond(S)),
          fn: () => {execOption(o);}
        }))
      };
    }

    /* 事件结果：同一个弹窗原地变成结果，玩家点「继续」才进下一个 */

    function showEventResult(next) {
      const logs = S.logs.slice(resultBase);
      if (GAME_CONFIG.eventResultMode === "log" || !logs.length) {next(); return;}
      const html = logs.map(l => `<div class="${l.cls || ""}" style="margin:2px 0">${l.txt}</div>`).join("");
      showPopup({
        kind: "event",
        badge: L("ev.resultBadge", clampNum(S.evWeekTotal, 0, 99), GAME_CONFIG.maxEventsPerWeek),
        title: L("ev.result"),
        body: `<div style="line-height:2.2">${html}</div>`,
        options: [{t: L("modal.continue")}]
      }, next);
    }

    /* ==================================================================
     * 「遗憾离场」：压力连续爆表若干周
     * ------------------------------------------------------------------
     * v1.1 起不再"压力一到 100 就崩"，而是给玩家三周的自救窗口：
     *   第 1 周 → 记一笔，日志里提醒
     *   第 2 周 → 黄牌警告（弹窗）
     *   第 3 周 → 遗憾离场
     * 中间任何一周把压力压回阈值以下，计数立刻清零。
     * ================================================================== */

    function burnCfg() {
      const b = (GAME_CONFIG && GAME_CONFIG.burnout) || {};
      return {at: num(b.stressAt, 100), weeks: Math.max(0, num(b.weeks, 3))};
    }

    function checkBurnout(done) {
      const c = burnCfg();
      if (c.weeks <= 0 || !S || S.over) {done(); return;}
      const hot = num(S.prop.压力, 0) >= c.at;

      if (!hot) {S.stressStreak = 0; done(); return;}

      S.stressStreak = num(S.stressStreak, 0) + 1;

      if (S.stressStreak >= c.weeks) {
        S.dead = "压力";
        say(L("burn.over"), "bad");
        gameOver();
        return;
      }

      // 还没到：给一次明确的警告（最后一次警告用弹窗，别让玩家莫名其妙就结束）
      const left = c.weeks - S.stressStreak;
      say(L("burn.warn", S.stressStreak, left), "bad");
      if (left <= 1) {
        showPopup({
          kind: "free",
          badge: L("burn.badge"),
          title: L("burn.warnTitle"),
          body: `<div style="line-height:2.2">${L("burn.warnBody", left)}</div>`,
          options: [{t: L("modal.continue")}]
        }, done);
      } else done();
    }

    /* ==================================================================
     * 亲情过低 → 家庭矛盾
     * ================================================================== */

    function checkFamilyConflict(done) {
      if (typeof shouldFamilyConflict !== "function" || typeof buildFamilyConflict !== "function") {done(); return;}
      if (!shouldFamilyConflict()) {done(); return;}
      say(L("fam.conflictLog"), "bad");
      showPopup(buildFamilyConflict(), done);
    }

    function afterWeek() {
      if (S.prop.健康 <= 0) {S.dead = "健康"; return gameOver();}
      if (S.prop.心态 <= 0) {S.dead = "心态"; return gameOver();}
      const brokeNeed = GAME_CONFIG.difficulty === "hard" ? 5 : (GAME_CONFIG.difficulty === "story" ? 12 : 8);
      if (S.prop.经济 <= 0 && S.term >= 2) {count("brokeWeek"); if (S.cnt.brokeWeek >= brokeNeed) {S.dead = "经济"; return gameOver();} }

      weeklySettle();
      if (S.prop.压力 >= 100) {modProp("心态", GAME_CONFIG.difficulty === "story" ? -7 : -15); say(L("flow.stressBurst", GAME_CONFIG.difficulty === "story" ? 7 : 15), "bad");}
      if (S.prop.健康 < 30) say(L("flow.healthWarn"), "bad");
      if (S.prop.心态 < 30) say(L("flow.mindWarn"), "bad");
      if (S.prop.压力 >= 80 && !Talent.have("不吃压力")) {modProp("效率", -3);}
      checkAch();

      if (S.prop.健康 <= 0) {S.dead = "健康"; return gameOver();}
      if (S.prop.心态 <= 0) {S.dead = "心态"; return gameOver();}

      renderHUD();

      // 压力连续爆表 → 遗憾离场（判定要在进下一周之前）
      checkBurnout(() => {
        if (S.over) return;
        // 亲情过低 → 家庭矛盾
        checkFamilyConflict(() => {
          if (S.over) return;
          if (!S.over) {nextWeek();}
        });
      });
    }

    function checkAch() {
      for (const [id, a] of Object.entries(ACHIEVEMENTS)) {
        if (S.ach.includes(id)) continue;
        if (a.c(S)) {
          S.ach.push(id);
          say(`🏆 达成成就【${a.n}】——${a.d}`, "ach");
          toast(`🏆 成就:${a.n}`, true);
          if (a.unlock) gainTalent(a.unlock, "成就奖励·免费");
        }
      }
    }

    function zhongkao() {
      count("zhongkao");
      /* 中考考哪几科，按「本局最后一个学期」算，而不是当前已经越界的 S.term。
       * 否则只玩初一的局，会拿初三的科目表去考（科目凭空多出物理化学）。 */
      const last = (typeof endTerm === "function") ? endTerm() : clampNum(S.term, 0, TERMS - 1);
      if (S.term !== last) S.term = last;
      const p = S.prop, subs = subjectsOf(S.term) || [];
      for (const k in PROP_RANGE) p[k] = fixProp(k, p[k]);
      ensureSubj();
      const diff = difficultyCurve(S.week, S.term);
      const W = examWeights();
      let total = 0;
      for (const sub of subs) {
        let v = examScoreOf(sub, p, diff, W);
        if (Talent.have("学神降世")) v += 8;
        if (Talent.have("学霸光环")) v += 5;
        if (Talent.have("考场黑马")) v += 3;
        if (Talent.have("考试焦虑")) v -= 8;
        total += clampNum(v, 0, 100, 0);
      }
      S.zhongkao = subs.length ? Math.round(clampNum(total / subs.length, 0, 100, 0)) : 0;
      S.lastExamScore = S.zhongkao;
      say(L("flow.zhongkao", S.zhongkao), "exam");
      checkAch();
      gameOver();
    }

    function gameOver() {
      S.over = true;
      const end = ENDINGS.find(e => e.c(S)) || ENDINGS[ENDINGS.length - 1];
      const sc = GAME_CONFIG.school;
      setBackground("end");            // 结局画面切到「立行号」列车背景
      if (typeof clearMood === "function") clearMood();   // 结局不该再被红雾盖住
      renderHUD();
      const talentList = Talent.owned.length ? Talent.owned.map(t => `${TZ(t)}(Lv.${TALENTS[t].lv})`).join("、") : L("end.none");
      const achList = S.ach.length ? S.ach.map(id => TZ(ACHIEVEMENTS[id].n)).join("、") : L("end.none");
      let reasonLine = "";
      if (S.zhongkao < 0) {
        if (S.dead === "健康") reasonLine = L("end.reasonHealth");
        else if (S.dead === "心态") reasonLine = L("end.reasonMind");
        else if (S.dead === "经济") reasonLine = L("end.reasonMoney");
        else if (S.dead === "压力") reasonLine = L("end.reasonStress");
      }
      showModal(L("end.title"),
        `<div class="endcard"><div class="big">${end.icon}</div><h2 style="color:var(--gold)">${TZ(end.n)}</h2><p style="margin-top:12px;line-height:2">${TZ(end.t)}</p>
     ${reasonLine ? `<p style="margin-top:8px;color:var(--red);font-weight:bold">${reasonLine}</p>` : ""}
     <p style="margin-top:14px;color:var(--dim);font-size:.9rem">「${sc.motto}」<br>
      <span style="font-size:.82rem">${L("end.arrival", sc.train)}</span></p>
     <p style="margin-top:16px;color:var(--dim)">${L("end.stat", S.week, S.zhongkao < 0 ? "—" : S.zhongkao, Talent.owned.length, S.ach.length, Object.keys(ACHIEVEMENTS).length)}</p>
     <div style="margin-top:14px;font-size:.85rem;color:var(--dim);text-align:left;line-height:1.9">
       <b style="color:var(--purple)">${L("end.talents")}:</b>${talentList}<br>
       <b style="color:#ffb86b">${L("end.ach")}:</b>${achList}
     </div></div>`,
        [{
          t: L("end.back"), fn: () => {setBackground("main"); toStart();}
        }, {t: L("end.restart"), fn: () => {setBackground("main"); newGameAt(slotCur);}}], null, true, false, {kind: "ending"});
    }
