/* ==================================================================
 * 存档层 · 本地存档
 * ==================================================================
 * 三个存档槽的读写、读档时的数据净化与字段补全。
 *
 * 维护等级：存档层（一般不动）
 * ============================================================ */

    const SAVE_KEY = "zhongkao_life_saves_v6";

    function loadSaves() {try {return JSON.parse(localStorage.getItem(SAVE_KEY)) || [null, null, null]} catch (e) {return [null, null, null]} }

    function writeSaves(a) {localStorage.setItem(SAVE_KEY, JSON.stringify(a))}

    function saveGame(manual) {
      if (!S) return;
      const a = loadSaves();
      a[slotCur] = {
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
        time: new Date().toLocaleString()
      };
      writeSaves(a);
      if (manual) {toast("💾 已保存"); renderSlots();}
    }

    function resumeGame(i) {
      const d = loadSaves()[i]; if (!d) return;
      slotCur = i; Talent.owned = d.talents || []; Talent.solve();
      const bf = Array.isArray(d.buff) ? d.buff : [0, 0, 0, 0];
      S = {week: d.week, term: d.term, name: d.name || "无名氏", gender: d.gender || "男", evCnt: d.evCnt || {}, daoDone: d.daoDone, subj: sanitizeSubj(d.subj), prop: sanitizeProp(d.prop), score: d.score, lastExamScore: d.lastExamScore, bestExam: d.bestExam, zhongkao: d.zhongkao, studyBuff: bf[0], buffWeeks: bf[1], studyDebuff: bf[2], debuffWeeks: bf[3], cnt: d.cnt, ach: d.ach, over: d.over, dead: d.dead, logs: [], items: d.items || {}, evCntWeek: d.evCntWeek || {}, evCountWeek: d.evCountWeek || 0, evWeekTotal: d.evWeekTotal || 0, actQuota: d.actQuota || 0, actCount: d.actCount || 0, cure: d.cure || {},
        slot: d.slot || "weekday", slotPlan: Array.isArray(d.slotPlan) ? d.slotPlan : ["weekday", "weekend"], slotIdx: clampNum(d.slotIdx, 0, 9),
        club: d.club || "", clubCount: num(d.clubCount, 0), clubTried: Array.isArray(d.clubTried) ? d.clubTried : [], clubSkip: !!d.clubSkip, clubTerm: num(d.clubTerm, -1), clubSkipTerm: num(d.clubSkipTerm, -1),
        flags: d.flags || {}, pending: Array.isArray(d.pending) ? d.pending : [], evLastWeek: d.evLastWeek || {}, chainQueue: Array.isArray(d.chainQueue) ? d.chainQueue : []};
      S.week = clampNum(S.week, 0, 999); S.term = clampNum(S.term, 0, TERMS);
      S.score = num(S.score, 0); S.lastExamScore = clampNum(S.lastExamScore, 0, 100);
      S.bestExam = clampNum(S.bestExam, 0, 100); S.zhongkao = num(S.zhongkao, -1);
      ensureSubj(); recalcScore();
      if (typeof setBackground === "function") setBackground(S.over && S.week > 0 ? "end" : "main");
      document.getElementById("startScreen").classList.add("hidden");
      document.getElementById("gameScreen").classList.remove("hidden");
      document.getElementById("log").innerHTML = "";
      say("💾 存档读取成功，继续你的初中生活！", "sys");
      if (S.over) {gameOver();} else startWeek();
    }

    function newGameAt(i) {
      slotCur = i;
      const m = document.getElementById("modalMask"); m.classList.remove("hidden"); m._lock = true;
      popupBusy = true;
      const _bd = document.getElementById("modalBadge"); if (_bd) _bd.style.display = "none";
      const _md = document.getElementById("modalMedia"); if (_md) {_md.innerHTML = ""; _md.style.display = "none";}
      document.getElementById("modalTitle").textContent = "创建角色";
      document.getElementById("modalBody").innerHTML =
        `<div style="line-height:2.4">
       姓名:<input id="inpName" maxlength="8" placeholder="输入你的名字" style="background:#0b0818;border:1px solid var(--line);color:var(--txt);border-radius:8px;padding:8px 12px;width:60%"><br>
       性别:<label><input type="radio" name="inpGender" value="男" checked> 男</label>
            <label style="margin-left:16px"><input type="radio" name="inpGender" value="女"> 女</label>
     </div>
     <div style="color:var(--dim);font-size:.85rem;margin-top:8px">或从下方随机名字中选一个：</div>
     <div class="namegrid" id="nameGrid"></div>`;
      const ob = document.getElementById("modalOpts"); ob.innerHTML = "";
      const btn = document.createElement("button"); btn.className = "btn primary"; btn.textContent = "开始初中生活";
      btn.onclick = () => {
        const nm = (document.getElementById("inpName").value || "").trim() || "无名氏";
        const gd = document.querySelector("input[name=inpGender]:checked").value;
        closeModal();
        newGame(nm, gd);
        if (typeof setBackground === "function") setBackground("main");
        document.getElementById("startScreen").classList.add("hidden");
        document.getElementById("gameScreen").classList.remove("hidden");
        document.getElementById("log").innerHTML = "";
        say(`🌅 ${nm} 的初中生涯，开始了。`, "sys");
        startWeek();
      };
      ob.appendChild(btn);
      setTimeout(() => {
        const grid = document.getElementById("nameGrid");
        if (!grid) return;
        const maleNames = ["李承宇", "王浩然", "张子墨", "刘俊熙", "陈宇航", "杨启航", "赵泽楷", "周天佑", "顾北辰", "沈亦白", "陆时安", "程星野", "谢知遥", "韩煜城", "顾言澈", "林书珩"];
        const femaleNames = ["林诗涵", "苏婉清", "沈梦瑶", "顾念之", "叶清欢", "陆雨萱", "唐若曦", "许安然", "江晚吟", "沈知意", "顾星晚", "温以宁", "白书予", "叶挽晴", "林疏桐", "苏可盈"];
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
