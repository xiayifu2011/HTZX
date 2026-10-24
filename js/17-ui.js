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
      showModal(L("item.use"), `<div style="line-height:2">${L("item.effect", TZ(it.n))}<br>${TZ(it.desc)}</div>`, [{t: L("modal.ok"), fn: () => { }}], null, false, false, {kind: "free", img: it.img});
    }

    const STAT_COLOR = {心态: "#ffb4d1", 经济: "#d9b3ff", 健康: "#7ee0c0", 效率: "#b388ff", 悟性: "#c9a7ff", 社交: "#ffb86b", 压力: "#ff7aa2", 亲情: "#ffd08a"};

    /* 学科栏展开/收起（默认收起，缩短界面高度） */

    function toggleSubjPanel() {
      const el = document.getElementById("subjPanel");
      if (!el) return;
      el.dataset.open = el.dataset.open ? "" : "1";
      renderHUD();
    }

    function renderHUD() {
      if (!S) return;
      document.getElementById("hudGrade").textContent = `${S.name}(${genderName(S.gender)}) · ${gradeName()}`;
      document.getElementById("hudWeekText").textContent = L("hud.week", S.week);
      document.getElementById("hudTerm").textContent = termName();
      // 属性栏：只显示 PROP_HUD 里的项（亲情不在主界面显示）
      let h = "<div class='statgrid'>";
      for (const k of (typeof PROP_HUD !== "undefined" ? PROP_HUD : Object.keys(PROP_RANGE))) {
        const v = fixProp(k, S.prop[k]); S.prop[k] = v;
        const pct = k === "经济" ? clampNum(v / 30, 0, 100, 2) : clampNum(v / 1.5, 0, 100, 0);
        h += `<div class="stat compact"><div style="display:flex;justify-content:space-between;gap:4px"><span>${propName(k)}</span><b>${Math.round(v)}</b></div><div class="bar"><i style="width:${pct}%;background:${STAT_COLOR[k]}"></i></div></div>`;
      }
      // 亲情：折叠进属性栏末尾一行小字，不占整行高度
      const fam = fixProp("亲情", S.prop.亲情); S.prop.亲情 = fam;
      h += `<div class="stat compact famrow"><div style="display:flex;justify-content:space-between;gap:4px"><span>${propName("亲情")}</span><b>${Math.round(fam)}</b></div><div class="bar"><i style="width:${clampNum(fam / 1.5, 0, 100, 0)}%;background:${STAT_COLOR.亲情}"></i></div></div>`;
      h += "</div>";
      document.getElementById("statPanel").innerHTML = h;
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
      document.getElementById("scoreNow").textContent = Math.round(num(S.score, 0));
      const subs = subjectsOf(S.term) || [];
      // 学科栏默认折叠，点击展开；只在展开时才渲染每一行，界面更短
      const subjOpen = !!document.getElementById("subjPanel").dataset.open;
      const subjRows = subs.map(s => {
        const v = clampNum(S.subj[s], 0, SUBJ_CAP, 0), rel = v / (clampNum(S.term, 0, 10) + 1);
        const pct = clampNum(rel / 700 * 100, 0, 100, 2);
        const color = rel >= 480 ? "var(--green)" : (rel >= 220 ? "var(--gold)" : "var(--red)");
        return `<div class="subjrow"><span style="width:3em">${TZ(s)}</span><div class="bar"><i style="width:${pct}%;background:${color}"></i></div><b style="width:3em;text-align:right;color:${color}">${Math.round(v)}</b></div>`;
      }).join("");
      document.getElementById("subjPanel").innerHTML =
        `<div class="subjtoggle" onclick="toggleSubjPanel()">${subjOpen ? "▾" : "▸"} ${L("hud.subjToggle", subs.length)}</div>` +
        (subjOpen ? `<div class="subjbody">${subjRows}</div>` : "");
      document.getElementById("lastExam").textContent = S.lastExamScore || "—";
      const r = S.zhongkao >= 0 ? S.zhongkao : (S.lastExamScore || 0);
      document.getElementById("rankNow").textContent = r ? L("hud.rankVal", Math.max(1, Math.round(clampNum(100 - r, 1, 100)))) : "—";
      // 静态标签（语言切换后要重刷）
      setText("talentLabel", L("hud.talent"));
      setText("talentHint", L("hud.talentHint"));
      setText("itemLabel", L("hud.item"));
      setText("subjLabel", L("hud.subjects"));
      setText("scoreLabel", L("hud.score"));
      setText("scoreTotalLabel", L("hud.scoreTotal"));
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
          el.innerHTML = `<div class="info"><b>${L("save.slot", i + 1)} · ${d.name || L("save.anon")}(${genderName(d.gender)})</b> · ${L("grade." + (Math.min(2, Math.floor(d.term / 2)) + 1))} ${L("hud.week", d.week)}${d.over ? ` · <span style='color:var(--red)'>${L("save.over")}</span>` : ""}<br>${L("save.info", d.zhongkao < 0 ? "—" : d.zhongkao, d.ach.length, d.time)}</div>
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
        if (meta && meta.img) {
          media.innerHTML = `<img src="${meta.img}" alt="" onerror="this.parentNode.style.display='none'">`;
          media.style.display = "";
        } else {media.innerHTML = ""; media.style.display = "none";}
      }

      const closeX = document.getElementById("modalCloseX");
      if (showClose) closeX.style.display = ""; else closeX.style.display = "none";
      closeX.onclick = () => closeModal(onClose);

      const b = document.getElementById("modalBody");
      if (typeof body === "string" && body.includes("<")) b.innerHTML = body; else b.textContent = body;
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
      document.getElementById("gameScreen").classList.add("hidden");
      document.getElementById("startScreen").classList.remove("hidden");
      renderSlots();
      if (typeof renderStartExtras === "function") renderStartExtras();
    }
