/* ==================================================================
 * 存档层 · 本地存档
 * ==================================================================
 * 三个存档槽的读写、读档时的数据净化与字段补全。
 *
 * 维护等级：存档层（一般不动）
 * ============================================================ */

    const SAVE_KEY = "zhongkao_life_saves_v6";
    const SAVE_VER = 7;             // 存档结构版本，升级结构时 +1
    const SAVE_SLOTS = 3;

    /* 读存档：任何一条坏数据都不许让主菜单打不开 */
    function loadSaves() {
      let raw = null;
      try {raw = JSON.parse(localStorage.getItem(SAVE_KEY));} catch (e) {raw = null;}
      if (!Array.isArray(raw)) raw = [];
      // 补齐 / 截断到固定槽数，脏字段直接丢掉
      const out = [];
      for (let i = 0; i < SAVE_SLOTS; i++) out.push(isSaveUsable(raw[i]) ? raw[i] : null);
      return out;
    }

    /* 一个存档槽的数据是否还能用（最基本的可读性检查） */
    function isSaveUsable(d) {
      if (!d || typeof d !== "object") return false;
      if (typeof d.name !== "string") return false;
      if (!isFinite(d.week) || !isFinite(d.term)) return false;
      if (d.week < 0 || d.term < 0) return false;
      return true;
    }

    /* 写存档：写不进去（隐私模式 / 空间满）也不能崩 */
    function writeSaves(a) {
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(a));
        return true;
      } catch (e) {
        if (typeof toast === "function") toast(L("save.fail"));
        return false;
      }
    }

    function saveGame(manual, autoSave) {
      if (!S) return false;
      // 槽号越界（存档结构变动 / 手动改过 localStorage）时拉回 0 号槽
      if (!(slotCur >= 0 && slotCur < SAVE_SLOTS)) slotCur = 0;
      const a = loadSaves();
      a[slotCur] = {
        v: SAVE_VER,
        week: S.week, term: S.term, name: S.name, gender: S.gender,
        evCnt: S.evCnt, daoDone: S.daoDone, subj: S.subj, prop: S.prop,
        score: S.score, lastExamScore: S.lastExamScore, bestExam: S.bestExam, zhongkao: S.zhongkao,
        buff: [S.studyBuff, S.buffWeeks, S.studyDebuff, S.debuffWeeks],
        cnt: S.cnt, ach: S.ach, over: S.over, dead: S.dead,
        talents: Talent.owned, items: S.items,
        evCntWeek: S.evCntWeek, evCountWeek: S.evCountWeek, evWeekTotal: S.evWeekTotal,
        actQuota: S.actQuota, actCount: S.actCount, cure: S.cure,
        // —— 时间系统 ——（不存的话读档会退回周中）
        slot: S.slot, slotPlan: S.slotPlan, slotIdx: S.slotIdx,
        // —— 社团 ——（不存的话读档社团会凭空消失）
        club: S.club, clubCount: S.clubCount, clubTried: S.clubTried,
        clubSkip: S.clubSkip, clubTerm: S.clubTerm, clubSkipTerm: S.clubSkipTerm,
        // —— 事件调度 ——（手机标记、挂起事件、事件冷却都在这里）
        flags: S.flags, pending: S.pending, evLastWeek: S.evLastWeek, chainQueue: S.chainQueue,
        // —— 开局设置（难度 + 学期范围）与 v1.1 新增的周标记 ——
        setup: {planId: (GAME_CONFIG.start || {}).planId, difficulty: (GAME_CONFIG.start || {}).difficulty,
          termFrom: (GAME_CONFIG.start || {}).termFrom, termTo: (GAME_CONFIG.start || {}).termTo},
        didStudyWeek: S.didStudyWeek, didSportWeek: S.didSportWeek, didReadWeek: S.didReadWeek,
        didSocialWeek: S.didSocialWeek, didQuizWeek: S.didQuizWeek,
        idleWeeks: S.idleWeeks, stressStreak: S.stressStreak,
        famConflictWeek: S.famConflictWeek, familyMain: S.familyMain,
        time: new Date().toLocaleString(),
        // 周结束自动存档时打标记，主菜单能显示"自动存于第 N 周"
        autoWeek: num(S.week, 0),
        auto: !!autoSave
      };
      const ok = writeSaves(a);
      if (manual) {toast(ok ? L("save.saved") : L("save.fail")); renderSlots();}
      else if (typeof renderSlots === "function" && autoSave) renderSlots();
      return ok;
    }

    function resumeGame(i) {
      const d = loadSaves()[i]; if (!d) return;
      slotCur = i; Talent.owned = d.talents || []; Talent.solve();
      const bf = Array.isArray(d.buff) ? d.buff : [0, 0, 0, 0];
      S = {week: d.week, term: d.term, name: d.name || "无名氏", gender: d.gender || "男", evCnt: d.evCnt || {}, daoDone: d.daoDone, subj: sanitizeSubj(d.subj), prop: sanitizeProp(d.prop), score: d.score, lastExamScore: d.lastExamScore, bestExam: d.bestExam, zhongkao: d.zhongkao, studyBuff: bf[0], buffWeeks: bf[1], studyDebuff: bf[2], debuffWeeks: bf[3], cnt: d.cnt, ach: d.ach, over: d.over, dead: d.dead, logs: [], items: d.items || {}, evCntWeek: d.evCntWeek || {}, evCountWeek: d.evCountWeek || 0, evWeekTotal: d.evWeekTotal || 0, actQuota: d.actQuota || 0, actCount: d.actCount || 0, cure: d.cure || {},
        slot: d.slot || "weekday", slotPlan: Array.isArray(d.slotPlan) ? d.slotPlan : ["weekday", "weekend"], slotIdx: clampNum(d.slotIdx, 0, 9),
        club: d.club || "", clubCount: num(d.clubCount, 0), clubTried: Array.isArray(d.clubTried) ? d.clubTried : [], clubSkip: !!d.clubSkip, clubTerm: num(d.clubTerm, -1), clubSkipTerm: num(d.clubSkipTerm, -1),
        flags: d.flags || {}, pending: Array.isArray(d.pending) ? d.pending : [], evLastWeek: d.evLastWeek || {}, chainQueue: Array.isArray(d.chainQueue) ? d.chainQueue : [],
        // —— v1.1 新增字段 ——
        didStudyWeek: d.didStudyWeek, didSportWeek: d.didSportWeek, didReadWeek: d.didReadWeek,
        didSocialWeek: d.didSocialWeek, didQuizWeek: d.didQuizWeek,
        idleWeeks: num(d.idleWeeks, 0), stressStreak: num(d.stressStreak, 0),
        famConflictWeek: d.famConflictWeek, familyMain: d.familyMain};

      // 开局设置：读档后沿用存档时的难度与学期范围
      if (d.setup && typeof applyStartSetup === "function") {
        applyStartSetup(d.setup.planId, d.setup.difficulty);
      }
      S.week = clampNum(S.week, 0, 999); S.term = clampNum(S.term, 0, TERMS);
      S.score = num(S.score, 0); S.lastExamScore = clampNum(S.lastExamScore, 0, 100);
      S.bestExam = clampNum(S.bestExam, 0, 100); S.zhongkao = num(S.zhongkao, -1);
      ensureSubj(); recalcScore();
      if (typeof setBackground === "function") setBackground(S.over && S.week > 0 ? "end" : "main");
      document.getElementById("startScreen").classList.add("hidden");
      document.getElementById("gameScreen").classList.remove("hidden");
      document.getElementById("log").innerHTML = "";
      say(L("save.loaded"), "sys");
      if (S.over) {gameOver();} else startWeek();
    }

    function newGameAt(i) {
      slotCur = i;
      const m = document.getElementById("modalMask"); m.classList.remove("hidden"); m._lock = true;
      popupBusy = true;
      const _bd = document.getElementById("modalBadge"); if (_bd) _bd.style.display = "none";
      const _md = document.getElementById("modalMedia"); if (_md) {_md.innerHTML = ""; _md.style.display = "none";}
      document.getElementById("modalTitle").textContent = L("cc.title");
      document.getElementById("modalBody").innerHTML =
        `<div style="line-height:1.75">
       ${L("cc.name")}:<input id="inpName" maxlength="8" placeholder="${L("cc.namePh")}" style="background:#0b0818;border:1px solid var(--line);color:var(--txt);border-radius:8px;padding:8px 12px;width:60%"><br>
       ${L("cc.gender")}:<label><input type="radio" name="inpGender" value="男" checked> ${L("cc.male")}</label>
            <label style="margin-left:16px"><input type="radio" name="inpGender" value="女"> ${L("cc.female")}</label>
     </div>
     <div style="color:var(--dim);font-size:.85rem;margin-top:8px">${L("cc.pick")}</div>
     <div class="namegrid" id="nameGrid"></div>
     <div class="setup-block">
       <div class="setup-label">${L("cc.planLabel")}</div>
       <div class="setupgrid" id="planGrid"></div>
       <div class="setup-label">${L("cc.diffLabel")}</div>
       <div class="setupgrid" id="diffGrid"></div>
       <div class="setup-hint">${L("cc.setupHint")}</div>
     </div>`;
      const ob = document.getElementById("modalOpts"); ob.innerHTML = "";
      const btn = document.createElement("button"); btn.className = "btn primary"; btn.textContent = L("cc.start");
      btn.onclick = () => {
        const nm = (document.getElementById("inpName").value || "").trim() || L("save.anon");
        const gd = document.querySelector("input[name=inpGender]:checked").value;
        const body = document.getElementById("modalBody");
        const planId = (body && body._pickPlan) ? body._pickPlan() : (GAME_CONFIG.TERM_PLAN && GAME_CONFIG.TERM_PLAN[0].id);
        const diff = (body && body._pickDiff) ? body._pickDiff() : "story";
        closeModal();
        applyStartSetup(planId, diff);
        newGame(nm, gd);
        if (typeof setBackground === "function") setBackground("main");
        document.getElementById("startScreen").classList.add("hidden");
        document.getElementById("gameScreen").classList.remove("hidden");
        document.getElementById("log").innerHTML = "";
        say(L("cc.begin", nm), "sys");
        startWeek();
      };
      ob.appendChild(btn);
      setTimeout(() => {
        /* ---- 开局设置：学期范围 + 难度 ---- */
        const plans = (GAME_CONFIG.TERM_PLAN || []).slice();
        const diffs = ["story", "normal", "hard"];
        let pickPlan = (GAME_CONFIG.start && GAME_CONFIG.start.planId) || plans[0].id;
        let pickDiff = (GAME_CONFIG.start && GAME_CONFIG.start.difficulty) || "story";
        if (!plans.some(x => x.id === pickPlan)) pickPlan = plans[0].id;

        const drawPlan = () => {
          const g = document.getElementById("planGrid"); if (!g) return;
          g.innerHTML = "";
          plans.forEach(p => {
            const b = document.createElement("button");
            b.className = "setupbtn" + (p.id === pickPlan ? " sel" : "");
            b.innerHTML = `<b>${L("cc.plan." + p.id)}</b><small>${L("cc.plan." + p.id + "Sub")}</small>`;
            b.onclick = () => {pickPlan = p.id; drawPlan();};
            g.appendChild(b);
          });
        };
        const drawDiff = () => {
          const g = document.getElementById("diffGrid"); if (!g) return;
          g.innerHTML = "";
          diffs.forEach(d => {
            const b = document.createElement("button");
            b.className = "setupbtn" + (d === pickDiff ? " sel" : "");
            b.innerHTML = `<b>${L("cc.diff." + d)}</b><small>${L("cc.diff." + d + "Sub")}</small>`;
            b.onclick = () => {pickDiff = d; drawDiff();};
            g.appendChild(b);
          });
        };
        drawPlan(); drawDiff();
        document.getElementById("modalBody")._pickPlan = () => pickPlan;
        document.getElementById("modalBody")._pickDiff = () => pickDiff;
        if (typeof setupScrollFade === "function") setupScrollFade(document.getElementById("modalBody"));

        const grid = document.getElementById("nameGrid");
        if (!grid) return;
        const maleNames = LANG === "en"
          ? ["Ethan", "Noah", "Liam", "Lucas", "Mason", "Owen", "Caleb", "Ryan", "Adrian", "Felix", "Julian", "Milo", "Theo", "Ivan", "Oscar", "Leon"]
          : ["李承宇", "王浩然", "张子墨", "刘俊熙", "陈宇航", "杨启航", "赵泽楷", "周天佑", "顾北辰", "沈亦白", "陆时安", "程星野", "谢知遥", "韩煜城", "顾言澈", "林书珩"];
        const femaleNames = LANG === "en"
          ? ["Emma", "Ava", "Sophia", "Chloe", "Luna", "Mia", "Nora", "Iris", "Elena", "Clara", "Hazel", "Ruby", "Vera", "Stella", "Freya", "Lydia"]
          : ["林诗涵", "苏婉清", "沈梦瑶", "顾念之", "叶清欢", "陆雨萱", "唐若曦", "许安然", "江晚吟", "沈知意", "顾星晚", "温以宁", "白书予", "叶挽晴", "林疏桐", "苏可盈"];
        const getG = () => document.querySelector("input[name=inpGender]:checked").value;
        const renderNames = () => {
          const pool = getG() === "男" ? maleNames : femaleNames;
          grid.innerHTML = "";
          pool.forEach(n => {
            const b = document.createElement("button");
            b.className = "namebtn"; b.textContent = n;
            b.onclick = () => {document.getElementById("inpName").value = n;};
            grid.appendChild(b);
          });
        };
        renderNames();
        document.querySelectorAll("input[name=inpGender]").forEach(r => r.onchange = renderNames);
      }, 0);
    }
