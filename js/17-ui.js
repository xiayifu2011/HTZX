/* ==================================================================
 * 界面层 · 渲染与弹窗
 * ==================================================================
 * 属性面板、天赋面板、行动面板、存档槽、统一弹窗系统。
 * 弹窗分四类：event 事件 / fixed 固定 / free 自由 / ending 结局。
 *
 * 维护等级：界面层（一般不动）
 * ============================================================ */

    function openTalentInfo(name) {
      const t = TALENTS[name];
      if (!t) return;
      const owned = Talent.have(name);
      const lvColor = t.lv >= 6 ? "var(--gold)" : (t.lv >= 4 ? "var(--purple)" : "var(--blue)");
      const incList = t.inc && t.inc.length
        ? t.inc.map(i => `${i} Lv.${TALENTS[i] ? TALENTS[i].lv : "?"}`).join(" · ")
        : "无";

      showModal(L("talent.detail"),
        `<div class="talent-header">
            <span class="talent-name" style="color:${lvColor}">${TZ(name)}</span>
            <span class="talent-lv" style="color:${lvColor}">Lv.${t.lv}</span>
         </div>
         <div class="talent-poem">「${TZ(t.poem) || "——"}」</div>
         <div class="talent-row">
            <div class="talent-section">
               <div class="label">${L("talent.effect")}</div>
               <div class="value">${TZ(t.desc)}</div>
            </div>
            <div class="talent-section">
               <div class="label">${L("talent.status")}</div>
               <div class="value">${owned
          ? `<span style='color:var(--green)'>${L("talent.owned")}</span>`
          : `${L("talent.locked")} · ${TZ(t.hint) || "—"}`}</div>
            </div>
         </div>
         <div class="talent-section inc">
            <div class="label">${L("talent.conflict")}</div>
            <div class="value">${incList}</div>
         </div>`,
        [{t: L("modal.close"), fn: () => { }}], null, false, true);
    }

    /* 天赋图鉴：每个天赋只占一行小卡片，诗句改用 title 悬停显示，
     * 这样 80 个天赋不用拉很长的滚动条。 */

    function openTalentBook() {
      const all = Object.entries(TALENTS);
      const got = all.filter(([n]) => Talent.have(n));
      const lock = all.filter(([n]) => !Talent.have(n));
      let h = `<div style="color:var(--dim);font-size:.8rem;margin-bottom:8px">
        ${L("talent.bookHint", got.length, all.length)}</div>`;
      h += "<div class='talentgrid'>";
      const row = ([name, t], owned) =>
        `<div class="talentitem ${owned ? "c" + t.lv : "lock"}" onclick="openTalentInfo('${name}')" title="${TZ(t.poem) || ""}">
          <b>${owned ? "🏆" : "🔒"} ${TZ(name)}</b><span class="tlv">Lv.${t.lv}</span>
          <div class="tdesc">${TZ(t.desc)}</div>
        </div>`;
      got.sort((a, b) => b[1].lv - a[1].lv).forEach(x => {h += row(x, true);});
      lock.sort((a, b) => a[1].lv - b[1].lv).forEach(x => {h += row(x, false);});
      h += "</div>";
      showModal(L("talent.book"), h, [{t: L("modal.close"), fn: () => { }}], null, false, true);
    }

    function openShop() {
      const opts = SHOP_ITEMS.map(it => ({
        t: TZ(it.n), sub: L("shop.price", it.price),
        disabled: () => S.prop.经济 < it.price,
        fn: () => {
          if (S.prop.经济 < it.price) {say(L("shop.poor"), "bad"); return;}
          modProp("经济", -it.price);
          S.items[it.id] = (S.items[it.id] || 0) + 1;
          say(L("shop.buy", TZ(it.n)), "good");
          toast(`${L("shop.title")}: ${TZ(it.n)}`);
          renderHUD();
          setTimeout(openShop, 100);
        }
      }));
      opts.push({t: L("shop.leave"), fn: () => {ensureActionPanel();}});
      showModal(L("shop.title"), `<div>${L("shop.body")}<br><span style="color:var(--dim);font-size:.85rem">${L("shop.money", Math.round(S.prop.经济))}</span></div>`, opts, null, false, true, {kind: "free"});
    }

    function useItem(id) {
      const it = SHOP_ITEMS.find(x => x.id === id);
      if (!it || !S.items[id] || S.items[id] <= 0) return;
      S.items[id]--;
      it.eff(S);
      say(L("item.used", TZ(it.n), TZ(it.desc)), "good");
      renderHUD();
      showModal(L("item.use"), `<div style="line-height:1.62">${L("item.effect", TZ(it.n))}<br>${TZ(it.desc)}</div>`, [{t: L("modal.ok"), fn: () => { }}], null, false, false, {kind: "free", img: it.img});
    }

    const STAT_COLOR = {心态: "#ffb4d1", 经济: "#d9b3ff", 健康: "#7ee0c0", 效率: "#b388ff", 悟性: "#c9a7ff", 社交: "#ffb86b", 压力: "#ff7aa2", 亲情: "#ffd08a"};

    /* ==================================================================
     * 属性面板
    /* ==================================================================
     * 属性面板
     * ------------------------------------------------------------------
     * v1.1 起只显示四项：心态 / 经济 / 健康 / 压力。
     *   经济 —— 显示具体数值（钱本来就该数得清）
     *   其余 —— 只显示「极低 / 较低 / 中 / 较高 / 极高」+ 五格刻度条
     * 效率 / 悟性 / 社交 / 亲情 仍在后台实时计算，但面板上一律不出现。
     * ================================================================== */

    function renderStatPanel() {
      const list = (typeof PROP_HUD !== "undefined") ? PROP_HUD : Object.keys(PROP_RANGE);
      let h = "<div class='statgrid'>";
      for (const k of list) {
        const v = fixProp(k, S.prop[k]); S.prop[k] = v;
        h += `<div class="stat compact">${statRowHtml(k, v)}</div>`;
      }
      h += "</div>";
      return h;
    }

    /* 单条属性：经济给数字，其余给档位 */
    function statRowHtml(k, v) {
      const name = propName(k);

      // 经济：唯一显示数字的一项
      if (k === "经济") {
        const pct = clampNum(v / 30, 0, 100, 2);
        return `<div class="stathead"><span>${name}</span><b class="num">${Math.round(v)}</b></div>
          <div class="bar"><i style="width:${pct}%;background:${STAT_COLOR[k] || "var(--gold)"}"></i></div>`;
      }

      // 其余：档位文字 + 五格刻度
      const lv = propLevel(v);
      const text = propLevelText(k, v);
      const tone = propPolarity(k) > 0 ? lv : (4 - lv);   // 压力反向配色
      let segs = "";
      for (let i = 0; i < 5; i++) {
        segs += `<i class="${i <= lv ? "on" : ""}"></i>`;
      }
      return `<div class="stathead"><span>${name}</span><b class="lv t${tone}">${text}</b></div>
        <div class="segbar t${tone}">${segs}</div>`;
    }

    function renderHUD() {
      if (!S) return;
      document.getElementById("hudGrade").textContent = `${S.name}(${genderName(S.gender)}) · ${gradeName()}`;
      document.getElementById("hudWeekText").textContent = L("hud.week", S.week);
      document.getElementById("hudTerm").textContent = termName();
      // 属性栏：只显示 PROP_HUD 的四项，且除经济外一律只给档位
      document.getElementById("statPanel").innerHTML = renderStatPanel();
      document.getElementById("talentCount").textContent = Talent.owned.length;
      document.getElementById("talentPanel").innerHTML = Talent.owned.length ?
        [...Talent.owned].sort((a, b) => TALENTS[b].lv - TALENTS[a].lv).map(t => `<span class="badge c${TALENTS[t].lv}" title="${TZ(TALENTS[t].desc)}" onclick="openTalentInfo('${t}')">${TZ(t)} Lv.${TALENTS[t].lv}${cureProgress(t)}</span>`).join("") : `<span style='color:var(--dim)'>${L("hud.noTalent")}</span>`;
      const itemCount = Object.values(S.items).reduce((a, b) => a + b, 0);
      document.getElementById("itemCount").textContent = itemCount;
      document.getElementById("itemPanel").innerHTML = itemCount > 0 ?
        Object.entries(S.items).filter(([k, v]) => v > 0).map(([k, v]) => {
          const it = SHOP_ITEMS.find(x => x.id === k);
          return it ? `<span class="badge" onclick="useItem('${k}')">${TZ(it.n)} ×${v}</span>` : "";
        }).join("") : `<span style='color:var(--dim)'>${L("hud.noItem")}</span>`;
      document.getElementById("lastExam").textContent = S.lastExamScore || "—";
      const r = S.zhongkao >= 0 ? S.zhongkao : (S.lastExamScore || 0);
      document.getElementById("rankNow").textContent = r ? L("hud.rankVal", Math.max(1, Math.round(clampNum(100 - r, 1, 100)))) : "—";
      // 静态标签（语言切换后要重刷）
      setText("talentLabel", L("hud.talent"));
      setText("talentHint", L("hud.talentHint"));
      setText("itemLabel", L("hud.item"));
      setText("scoreLabel", L("hud.score"));
      setText("lastExamLabel", L("hud.lastExam"));
      setText("rankLabel", L("hud.rank"));
      setText("actLabel", L("hud.act"));
      setText("evLabel", L("hud.ev"));
      setText("btnShop", L("hud.shop"));
      setText("btnTalentBook", L("hud.talentBook"));
      setText("btnAch", L("hud.ach"));
      setText("btnTheme", L("hud.theme"));
      setText("btnSave", L("hud.save"));
      setText("btnHome", L("hud.home"));
      setText("btnLang", L("hud.lang"));

      // 氛围特效：压力红雾 / 心态灰暗 / 健康发虚 / 经济见底
      if (typeof updateMood === "function") updateMood();
      if (typeof moodWhisper === "function") moodWhisper();

      // 本周行动进度
      const aq = num(S.actQuota, 0), ac = clampNum(S.actCount, 0, aq || 0);
      const ap = document.getElementById("actPill");
      if (ap) {
        ap.style.display = aq ? "" : "none";
        document.getElementById("actNow").textContent = ac;
        document.getElementById("actMax").textContent = aq;
      }

      // 本周事件进度
      const quota = Math.min(num(GAME_CONFIG.maxEventsPerWeek, 4), 8);
      const now = clampNum(S.evWeekTotal, 0, quota);
      const dots = document.getElementById("evDots");
      if (dots) dots.innerHTML = quota ? Array.from({length: quota}, (_, i) => `<span class="dot${i < now ? " on" : ""}"></span>`).join("") : "";
      const pill = document.getElementById("evPill");
      if (pill) pill.style.display = quota ? "" : "none";

      // 顶栏：时间（月份 + 季节 + 时段）与社团
      const tp = document.getElementById("hudTime");
      if (tp && typeof nowTimeText === "function") tp.textContent = nowTimeText();
      const cp = document.getElementById("clubPill");
      if (cp) {
        const cn = (typeof clubName === "function") ? clubName() : "";
        cp.classList.toggle("hidden", !cn);
        document.getElementById("hudClub").textContent = cn || "—";
      }

      // 弹窗处理中：暂时锁住自由面板，避免弹窗互相覆盖
      ["btnShop", "btnTalentBook", "btnAch"].forEach(id => {
        const el = document.getElementById(id);
        if (el) {el.disabled = popupBusy; el.classList.toggle("busy-lock", popupBusy);}
      });
      setTimeout(ensureActionPanel, 0);
    }

    function renderSlots() {
      const a = loadSaves(), box = document.getElementById("slotList"); box.innerHTML = "";
      a.forEach((d, i) => {
        const el = document.createElement("div"); el.className = "slot";
        if (d) {
          // 自动存档时记下是哪一周，主菜单能显示"已存到第 N 周"，玩家知道进度被记住了
          const autoTag = (d.auto && d.autoWeek != null) ? ` · <span style='color:var(--green)'>${L("save.auto")} ${L("hud.week", d.autoWeek)}</span>` : "";
          el.innerHTML = `<div class="info"><b>${L("save.slot", i + 1)} · ${d.name || L("save.anon")}(${genderName(d.gender)})</b> · ${L("grade." + (Math.min(2, Math.floor(d.term / 2)) + 1))} ${L("hud.week", d.week)}${d.over ? ` · <span style='color:var(--red)'>${L("save.over")}</span>` : ""}${autoTag}<br>${L("save.info", d.zhongkao < 0 ? "—" : d.zhongkao, d.ach.length, d.time)}</div>
      <div><button class="btn green" onclick="resumeGame(${i})">${L("save.resume")}</button><button class="btn" onclick="if(confirm('${L("save.confirmOver")}'))newGameAt(${i})">${L("save.restart")}</button><button class="btn" onclick="delSave(${i})">${L("save.delete")}</button></div>`;
        } else {
          el.innerHTML = `<div class="info"><b>${L("save.slot", i + 1)}</b> · ${L("save.empty")}</div><div><button class="btn primary" onclick="newGameAt(${i})">${L("save.new")}</button></div>`;
        }
        box.appendChild(el);
      });
    }

    function delSave(i) {if (!confirm(L("save.confirmDel"))) return; const a = loadSaves(); a[i] = null; writeSaves(a); renderSlots();}

    /* ------------------------------------------------------------------
     * 统一弹窗层：一切「需要玩家点击选择」的界面都是弹窗，弹窗就是事件
     *   kind 说明：
     *     event  随机事件 —— 消耗本周行动额度
     *     fixed  固定事件 —— 开学/考试/运动会/假期副本
     *     free   自由操作 —— 小卖铺/道具/读书角/图鉴/成就，不消耗任何额度
     *     ending 结局
     * 同一时刻只会有一个弹窗，处理完才排下一个（避免弹窗互相覆盖）
     * ------------------------------------------------------------------ */

    let popupBusy = false;

    function badgeText(kind) {
      if (!S) return "";
      if (kind === "event") return L("badge.event", clampNum(S.evWeekTotal, 0, 99), GAME_CONFIG.maxEventsPerWeek);
      if (kind === "fixed") return L("badge.fixed");
      if (kind === "free") return L("badge.free");
      if (kind === "ending") return L("badge.ending");
      return "";
    }

    function hideModalRaw() {document.getElementById("modalMask").classList.add("hidden")}

    /* 把换行转成 <br>，但只转「真正在文字中间」的那些换行。
     *
     * 规则（逐字符扫描，跟踪是否处在 <...> 标签内部）：
     *   ① 标签内部的换行 —— 原样保留，绝不转换（转了就毁标签）
     *   ② 标签之间、元素之间的换行 —— 直接丢掉（那是 HTML 源码排版）
     *   ③ 文字与文字之间的换行 —— 转成 <br>（这是文案作者真实的换行）
     */
    function nl2br(src) {
      if (typeof src !== "string") return src;
      if (!src.includes("\n")) return src;
      let out = "", inTag = false;
      for (let i = 0; i < src.length; i++) {
        const c = src[i];
        if (c === "<") {inTag = true; out += c; continue;}
        if (c === ">") {inTag = false; out += c; continue;}
        if (c !== "\n") {out += c; continue;}
        if (inTag) {out += c; continue;}          // ① 标签内：保留
        // 前后跳过空白，看紧邻的是什么
        let j = i - 1; while (j >= 0 && /[ \t\r]/.test(src[j])) j--;
        let k = i + 1; while (k < src.length && /[ \t\r]/.test(src[k])) k++;
        const prev = j >= 0 ? src[j] : "";
        const next = k < src.length ? src[k] : "";
        // ② 挨着标签边界（或开头/结尾）的换行：丢掉
        if (prev === ">" || next === "<" || prev === "" || next === "") continue;
        out += "<br>";                            // ③ 文字中间：转 <br>
      }
      return out;
    }

    function showModal(title, body, opts, onClose, lock, showClose, meta) {
      const m = document.getElementById("modalMask");
      const modalEl = document.getElementById("modalBox") || m.querySelector(".modal");
      const kind = (meta && meta.kind) || "free";
      popupBusy = true;
      m.classList.remove("hidden");
      modalEl.classList.remove("k-event", "k-fixed", "k-ending", "k-free");
      modalEl.classList.add("k-" + kind);
      if (title === L("talent.detail")) modalEl.classList.add("talent-modal");
      else modalEl.classList.remove("talent-modal");
      document.getElementById("modalTitle").textContent = title === L("talent.detail") ? "" : title;

      const badge = document.getElementById("modalBadge");
      const bt = (meta && meta.badge) || badgeText(kind);
      if (bt) {badge.textContent = bt; badge.className = "pop-badge k-" + kind; badge.style.display = "";}
      else badge.style.display = "none";

      const media = document.getElementById("modalMedia");
      if (media) {
        // 配图总开关关掉时，弹窗里也不显示任何图片
        if (meta && meta.img && (typeof photosOn === "function" ? photosOn() : true)) {
          media.innerHTML = `<img src="${meta.img}" alt="" onerror="this.parentNode.style.display='none'">`;
          media.style.display = "";
        } else {media.innerHTML = ""; media.style.display = "none";}
      }

      const closeX = document.getElementById("modalCloseX");
      if (showClose) closeX.style.display = ""; else closeX.style.display = "none";
      closeX.onclick = () => closeModal(onClose);

      const b = document.getElementById("modalBody");
      /* 正文里的手动换行（事件文案常写 \n）要变成 <br>。
       * 以前靠弹窗整体的 white-space:pre-wrap 兜着 —— 但那样会把
       * 模板字符串里的缩进换行也一起渲染出来，窗口凭空长出一大截空行。
       *
       * 现在用 nl2br() 精确处理：只有「夹在真实文字之间」的换行才转 <br>，
       * 标签内部的换行（模板字符串为了好看做的缩进）必须原样保留 ——
       * 否则 <button ...\n style="..."> 会在标签中间被插入 <br>，
       * 标签结构被破坏，属性内容会直接显示成文字（曾经让主题卡片上
       * 出现一整串 style="--c1:#8a2b9c;..." 的代码块）。 */
      const html = nl2br(body);
      if (typeof html === "string" && html.includes("<")) b.innerHTML = html; else b.textContent = html;
      const ob = document.getElementById("modalOpts"); ob.innerHTML = "";
      const list = opts || [{t: L("modal.continue"), fn: () => { }}];
      let anyEnabled = false;
      list.forEach(o => {
        const btn = document.createElement("button"); btn.className = "btn primary optbtn";
        btn.innerHTML = o.sub ? `<b>${o.t}</b><br><small>${o.sub}</small>` : o.t;
        const dis = typeof o.disabled === "function" ? o.disabled(S) : o.disabled;
        if (dis) btn.disabled = true; else anyEnabled = true;
        btn.onclick = () => {
          popupBusy = false;              // 先释放当前弹窗
          o.fn && o.fn(S);                // 若它内部又开了新弹窗，popupBusy 会重新变 true
          if (!popupBusy) {               // 没有新弹窗 → 收尾并交还控制权
            hideModalRaw();
            setTimeout(ensureActionPanel, 0);
            onClose && onClose();
          }
          renderHUD();
        };
        ob.appendChild(btn);
      });
      if (!anyEnabled) {
        const btn = document.createElement("button"); btn.className = "btn primary optbtn";
        btn.textContent = L("modal.continue");
        btn.onclick = () => closeModal(onClose);
        ob.appendChild(btn);
      }
      m._lock = lock;

      // 内容区滚动提示：没滚到底就在底部加一道渐隐
      setupScrollFade(document.getElementById("modalBody"));
    }

    /* 滚动提示：给可滚动的内容区挂上/摘掉渐隐
     * 滚动条被隐藏之后，玩家需要知道"下面还有内容"。 */
    function setupScrollFade(el) {
      if (!el) return;
      const update = () => {
        const room = el.scrollHeight - el.clientHeight;
        const atEnd = el.scrollTop + el.clientHeight >= el.scrollHeight - 4;
        el.classList.toggle("fade", room > 4 && !atEnd);
        el.classList.toggle("at-end", room <= 4 || atEnd);
      };
      el.onscroll = update;
      // 内容刚塞进去时尺寸还没算出来，下一帧再量一次
      update();
      setTimeout(update, 0);
      setTimeout(update, 120);
    }

    function closeModal(onClose) {
      hideModalRaw();
      popupBusy = false;
      setTimeout(ensureActionPanel, 0);
      renderHUD();
      onClose && onClose();
    }

    /* 语义化入口：def = {kind, title, body, img, options:[{t,sub,disabled,fn}], showClose, lock} */

    function showPopup(def, onResolve) {
      showModal(def.title, def.body, def.options, () => onResolve && onResolve(),
        def.lock, def.showClose, {kind: def.kind || "free", img: def.img, badge: def.badge});
    }

    /* ==================================================================
     * 做题（本周行动）
     * ------------------------------------------------------------------
     * 消耗一次行动，出一道「当前年级 + 当前科目」范围内的题。
     * 答对：该科学力加成（随年级放大），心态小涨
     * 答错：该科小幅倒扣，压力小涨 —— 做错题也是有代价的
     * 题库见 js/05d-data-quiz.js 的 QUIZ_BANK。
     * ================================================================== */

    function openQuiz(done) {
      const q = (typeof pickQuiz === "function") ? pickQuiz() : null;

      // 该年级暂无题目：退化成一次普通学习，不浪费玩家的行动
      if (!q) {
        say(L("quiz.none"), "sys");
        studySettle("quiz");
        S.actCount = (S.actCount || 0) + 1;
        S.didQuizWeek = num(S.week, 0);
        count("quiz");
        renderHUD();
        if (typeof done === "function") done();
        return;
      }

      const grad = clamp(Math.floor(clampNum(S.term, 0, 9, 0) / 2), 0, 2);
      const bonus = Math.round(14 + grad * 8);              // 答对：初一 14 → 初三 30
      const penalty = -Math.max(4, Math.round(bonus * 0.35)); // 答错：扣三成半

      const finish = (ok) => {
        if (ok) {
          S.subj[q.sub] = clamp(num(S.subj[q.sub], 30) + bonus, 0, SUBJ_CAP);
          modProp("心态", 3);
          if (Math.random() < 0.35) modProp("悟性", 1);
          say(L("quiz.right", TZ(q.sub), bonus), "good");
          floatGain(L("quiz.rightFloat", TZ(q.sub)), true);
        } else {
          S.subj[q.sub] = clamp(num(S.subj[q.sub], 30) + penalty, 0, SUBJ_CAP);
          modProp("心态", -2); modProp("压力", 2);
          say(L("quiz.wrong", TZ(q.sub), Math.abs(penalty)), "bad");
          floatGain(L("quiz.wrongFloat", TZ(q.sub)), false);
        }
        recalcScore();
        S.actCount = (S.actCount || 0) + 1;
        S.didQuizWeek = num(S.week, 0);
        S.didStudyWeek = num(S.week, 0);     // 做题也算"碰过学习"，避免天赋退化
        count("quiz");
        renderHUD();
      };

      const meta = {kind: "free", badge: L("quiz.badge")};
      const whyLine = q.why ? `<div style="margin-top:5px;color:var(--dim);font-size:.85rem">${L("quiz.why")} ${q.why}</div>` : "";

      if (q.type === "choice") {
        const opts = q.opts.map((o, i) => ({
          t: o,
          fn: () => {
            const ok = (i === q.ansIndex);
            finish(ok);
            showModal(L("quiz.resultTitle"), `<div style="line-height:1.62">
              <div>${q.q}</div>
              <div style="margin-top:5px;color:${ok ? "var(--green)" : "var(--red)"}">${ok ? L("quiz.correct") : L("quiz.incorrect")}</div>
              <div style="margin-top:4px">${L("quiz.answer")} <b>${q.opts[q.ansIndex]}</b></div>
              ${whyLine}</div>`, [{t: L("modal.continue")}], () => {if (done) done();}, false, false, meta);
          }
        }));
        showModal(L("quiz.title", TZ(q.sub)), `<div style="line-height:1.62">${q.q}</div>
          <div style="margin-top:6px;color:var(--dim);font-size:.82rem">${L("quiz.tip")}</div>`,
          opts, null, false, false, meta);
        return;
      }

      // 填空题：手写一个答案
      const bodyHtml = `<div style="line-height:1.62">${q.q}</div>
        <div style="margin-top:5px"><input id="quizInput" type="text" autocomplete="off"
          placeholder="${L("quiz.placeholder")}"
          style="width:100%;padding:8px 10px;border-radius:8px;border:1px solid var(--line);background:var(--panel2);color:var(--txt);font-size:.95rem"></div>
        <div style="margin-top:6px;color:var(--dim);font-size:.82rem">${L("quiz.fillTip")}</div>`;

      showModal(L("quiz.title", TZ(q.sub)), bodyHtml, [{
        t: L("quiz.submit"),
        fn: () => {
          const el = document.getElementById("quizInput");
          const val = el ? el.value : "";
          const ok = (typeof quizMatch === "function") ? quizMatch(val, q.ans) : false;
          finish(ok);
          showModal(L("quiz.resultTitle"), `<div style="line-height:1.62">
            <div>${q.q}</div>
            <div style="margin-top:5px;color:${ok ? "var(--green)" : "var(--red)"}">${ok ? L("quiz.correct") : L("quiz.incorrect")}</div>
            <div style="margin-top:4px">${L("quiz.answer")} <b>${q.ans}</b>${val ? `（${L("quiz.yours")} ${val}）` : ""}</div>
            ${whyLine}</div>`, [{t: L("modal.continue")}], () => {if (done) done();}, false, false, meta);
        }
      }, {
        t: L("quiz.giveup"),
        fn: () => {
          say(L("quiz.giveupLog", TZ(q.sub)), "sys");
          finish(false);
          showModal(L("quiz.resultTitle"), `<div style="line-height:1.62">
            <div>${q.q}</div>
            <div style="margin-top:5px;color:var(--dim)">${L("quiz.gaveup")}</div>
            <div style="margin-top:4px">${L("quiz.answer")} <b>${q.ans}</b></div>
            ${whyLine}</div>`, [{t: L("modal.continue")}], () => {if (done) done();}, false, false, meta);
        }
      }], null, false, false, meta);

      // 回车即提交：输入框里按 Enter 等同于点「交卷」
      setTimeout(() => {
        const el = document.getElementById("quizInput");
        if (!el) return;
        el.focus();
        el.onkeydown = (e) => {
          if (e.key !== "Enter") return;
          e.preventDefault();
          const btn = document.querySelector("#modalOpts button");
          if (btn && !btn.disabled) btn.click();
        };
      }, 60);
    }

    function toast(t, isAch) {
      const d = document.createElement("div");
      d.className = "toast" + (isAch ? " ach-toast" : "");
      d.textContent = t;
      document.getElementById("toastBox").appendChild(d);
      setTimeout(() => d.remove(), 2600);
    }

    function openAch() {
      let h = "<div class='achlist'>";
      for (const [id, a] of Object.entries(ACHIEVEMENTS)) {
        const got = S && S.ach.includes(id);
        h += `<div class="achitem ${got ? "" : "lock"}"><b>${got ? "🏆" : "🔒"} ${TZ(a.n)}</b><br><span style="color:var(--dim)">${TZ(a.d)}</span></div>`;
      }
      showModal(L("ach.title"), h + "</div>", [{t: L("modal.close"), fn: () => { }}], null, false, true, {kind: "free"});
    }

    function toStart() {
      saveGame(false);
      if (typeof setBackground === "function") setBackground("main");
      if (typeof clearMood === "function") clearMood();   // 主菜单不该带着红雾
      document.getElementById("gameScreen").classList.add("hidden");
      document.getElementById("startScreen").classList.remove("hidden");
      renderSlots();
      if (typeof renderStartExtras === "function") renderStartExtras();
    }
