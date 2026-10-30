/* ======================================================================
 * 做题系统（需求 12 · 增量模块）
 * ======================================================================
 * 点击「做题」→ 耗 1 行动 → 按当前最弱且权重最高的学科 × 年级抽题（选择/填空）
 * → 答对：该科学力 +X、效率 +；答错：学力 +微量、压力 +、效率 -。
 * 题库：js/content/question_banks/<学科拼音>_g<7|8|9>.json，改完刷新即生效。
 * 数值全在 js/data/tweak.json → quiz。
 * 接入：16-flow.js 的 takeAction("quiz") 分支：
 *      Quiz.build().then(def => showModalDef(def, () => chainTail(() => afterAction("quiz"))));
 *
 * 题库一条：{ "q":"3x+5=14，x=?","type":"fill","answer":"3","explain":"3x=9→x=3",
 *            "subj":"数学","grade":7,"diff":1 }
 * 选择题型：options:["A","B","C","D"], answer:0（下标）
 * 支持 q_en / explain_en，英语模式下自动切换。
 * ====================================================================== */
(function () { "use strict";

const BANK = "js/content/question_banks/";
const CACHE = {}, tried = {};
let round = 0;
function resetRound() { round = 0; for (const k in tried) delete tried[k]; }

function currentGrade() { const t = (window.S && window.S.term) || 0; return Math.min(9, Math.max(7, 7 + Math.floor(t / 2))); }
function pickSubj() {
  const subs = window.subjectsOf ? window.subjectsOf(window.S && window.S.term) : [];
  if (!subs.length) return "数学";
  const W = window.examWeights ? window.examWeights() : {};
  let best = subs[0], worst = 1e9;
  for (const k of subs) {
    const w = (W && W[k]) || 1;
    const score = (window.S.subj[k] || 0) - (w > 1 ? 30 : 0);
    if (score < worst) { worst = score; best = k; }
  }
  return best;
}
function fileOf(subj, g) {
  const m = { 数学:"math", 语文:"chinese", 英语:"english", 物理:"physics", 化学:"chem",
    生物:"bio", 政治:"civics", 历史:"history", 地理:"geo", 体育:"pe" };
  return (m[subj] || "math") + "_g" + g + ".json";
}
function loadBank(subj, g) {
  const key = subj + "_g" + g;
  if (CACHE[key] !== undefined) return Promise.resolve(CACHE[key]);
  return fetch(BANK + fileOf(subj, g), { cache: "no-store" })
    .then(r => r.ok ? r.json() : Promise.reject(0))
    .then(j => { CACHE[key] = Array.isArray(j) ? j : (j.questions || []); return CACHE[key]; })
    .catch(() => { CACHE[key] = (FALLBACK[key] || FALLBACK._any || []); return CACHE[key]; });
}
function pick(qs) {
  const g = currentGrade(), lo = Math.max(1, g - 6), hi = lo + 1;
  const pool = (qs || []).filter(q => (q.grade == null || q.grade === g)
    && (q.diff == null || (q.diff >= lo && q.diff <= hi)) && !tried[q.id || q.q]);
  const arr = pool.length ? pool : (qs || []);
  if (!arr.length) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}
function norm(a) { return (a || "").toString().trim().toLowerCase().replace(/[，。\s]/g, ""); }

async function build() {
  const subj = pickSubj(), grade = currentGrade();
  const qs = await loadBank(subj, grade);
  const q = pick(qs);
  if (!q) { window.say && window.say("📭 " + t("quiz.noleft"), "sys"); return null; }
  tried[q.id || q.q] = 1; round++;
  const isEn = window.I18n && window.I18n.get() === "en";
  const qtxt = isEn && q.q_en ? q.q_en : (q.q || "");

  return new Promise(resolve => {
    const wrap = document.createElement("div");
    wrap.innerHTML = `
      <div style="color:var(--dim);font-size:.82rem;margin-bottom:8px">
        ${t("quiz.subj")}：${t("subj." + subj) || subj} · ${t("quiz.grade")} G${grade}</div>
      <div style="font-size:1.08rem;line-height:1.9;margin-bottom:12px">${qtxt}</div>
      <div class="qopts" data-mode="${q.type === "fill" ? "fill" : "choice"}"></div>
      <div class="qex" style="display:none;margin-top:10px;padding:8px 10px;border-left:3px solid var(--gold);
        background:var(--panel2);border-radius:6px;font-size:.9rem;line-height:1.7"></div>`;

    const optsBox = wrap.querySelector(".qopts");
    let locked = false;
    const finish = ok => {
      if (locked) return; locked = true;
      const ex = wrap.querySelector(".qex");
      ex.style.display = "block";
      ex.innerHTML = `<b>${ok ? "✅ " + t("quiz.correct") : "❌ " + t("quiz.wrong")}</b>`
        + `<br>${t("quiz.explain")} ` + (isEn && q.explain_en ? q.explain_en : (q.explain || ""));
      applyResult(q, ok, subj);
      optsBox.querySelectorAll("button,input").forEach(x => x.disabled = true);
      const b = document.createElement("button");
      b.className = "btn primary"; b.textContent = t("btn.close");
      b.style.marginTop = "12px"; b.onclick = () => resolve(null);
      wrap.appendChild(b);
    };

    if (q.type === "fill") {
      const inp = document.createElement("input");
      inp.type = "text"; inp.placeholder = "…"; inp.maxLength = 24;
      inp.style.cssText = "background:#0b0818;border:1px solid var(--line);color:var(--txt);border-radius:8px;padding:9px 12px;width:70%;font-size:1rem";
      const sub = document.createElement("button"); sub.className = "btn primary"; sub.textContent = t("btn.confirm");
      sub.onclick = () => {
        const ans = norm(inp.value);
        const right = Array.isArray(q.answer) ? q.answer : [q.answer];
        finish(right.some(a => norm(a) === ans));
      };
      inp.onkeydown = e => { if (e.key === "Enter") sub.click(); };
      optsBox.appendChild(inp); optsBox.appendChild(sub);
    } else {
      (q.options || []).forEach((o, i) => {
        const b = document.createElement("button"); b.className = "btn"; b.style.margin = "5px 0";
        b.innerHTML = `<b>${String.fromCharCode(65 + i)}.</b> ${o}`;
        b.onclick = () => finish(i === q.answer);
        optsBox.appendChild(b);
      });
    }

    window.showModalDef && window.showModalDef({
      kind: "quiz", badge: t("quiz.title"),
      title: t("quiz.title") + " · " + (t("subj." + subj) || subj),
      body: wrap.outerHTML, options: []
    });
    setTimeout(() => rebind(wrap, q, finish), 40);
  });
}

/* showModalDef 注入 innerHTML 会丢 listener，重新挂 */
function rebind(wrap, q, finish) {
  const host = document.querySelector(".modal-body"); if (!host) return;
  const live = host.querySelector(".qopts"); if (!live || live._b) return; live._b = true;
  const clone = wrap.querySelector(".qopts").cloneNode(true);
  live.parentNode.replaceChild(clone, live);
  if (q.type === "fill") {
    const inp = clone.querySelector("input"), btn = clone.querySelector("button");
    const go = () => {
      const ans = norm(inp.value); const right = Array.isArray(q.answer) ? q.answer : [q.answer];
      finish(right.some(a => norm(a) === ans));
    };
    btn.onclick = go; inp.onkeydown = e => { if (e.key === "Enter") go(); };
  } else {
    clone.querySelectorAll("button").forEach((b, i) => {
      b.onclick = () => finish(i === q.answer);
    });
  }
}

function applyResult(q, ok, subj) {
  const cfg = (window.GAME_CONFIG && window.GAME_CONFIG.quiz) || { reward: { subj: 14, eff: 2 }, penalty: { subj: 3, stress: 5, eff: 1 } };
  const sc = ok ? (cfg.reward || {}) : (cfg.penalty || {});
  const S = window.S; if (!S) return;
  const fb = [];
  if (sc.subj) {
    window.addSubj ? window.addSubj(S, subj, sc.subj) : (S.subj[subj] = (S.subj[subj] || 0) + sc.subj);
    if (q.type === "fill" && ok && cfg.fillBonus) {
      window.addSubj ? window.addSubj(S, subj, cfg.fillBonus) : (S.subj[subj] += cfg.fillBonus);
    }
    fb.push(`${subj} ${ok ? "+" : ""}${sc.subj}`);
  }
  if (sc.eff)  window.modProp("效率",  ok ? sc.eff : -sc.eff);
  if (sc.apt)  window.modProp("悟性",  ok ? sc.apt : 0);
  if (sc.stress) window.modProp("压力", sc.stress);
  if (sc.health) window.modProp("健康", sc.health);
  if (sc.talent && ok) window.gainTalent && window.gainTalent(sc.talent, t("quiz.reward"));
  window.say && window.say(`📝 ${ok ? "✅" : "❌"} ${t("subj." + subj) || subj}：${fb.join("，") || (ok ? t("quiz.correct") : t("quiz.wrong"))}`, ok ? "good" : "bad");
  window.count && window.count("study");   // 做题 = 认真学习，推进破茧、抵消不学腐蚀
  window.count && window.count("quiz");
  window.PropFuzzy && window.PropFuzzy.updateFxOverlay();
}
function t(k) { return window.I18n ? window.I18n.t(k) : k.replace("quiz.","");
}

window.Quiz = { build, resetRound, currentGrade, pickSubj };

/* ============ 兜底题库（JSON 加载失败时也能玩） ============ */
const FALLBACK = {
  _any: [{ q: "你最近一次认真坐下来学习，是几天前？", type: "choice",
    options: ["就今天", "昨天", "上周", "记不清了"], answer: 0,
    explain: "诚实面对就好。坐下来，就是起点。", subj: "数学", grade: 7, diff: 1 }],
  "数学_g7": [{ q: "3x + 5 = 14，则 x = ?", type: "fill", answer: ["3"], explain: "3x=9 → x=3", subj: "数学", grade: 7, diff: 1 },
    { q: "下列各数中最小的是？", type: "choice", options: ["-3", "-1", "0", "2"], answer: 0, explain: "-3 在数轴上最靠左", subj: "数学", grade: 7, diff: 1 },
    { q: "三角形内角和是？", type: "choice", options: ["90°", "180°", "360°", "270°"], answer: 1, explain: "任意三角形内角和恒为 180°", subj: "数学", grade: 7, diff: 1 }],
  "数学_g8": [{ q: "√16 的值是？", type: "fill", answer: ["4"], explain: "算术平方根取非负，√16=4", subj: "数学", grade: 8, diff: 1 },
    { q: "y = 2x + 1 的图像经过哪些象限？", type: "choice", options: ["一、二、三", "一、三、四", "二、三、四", "一、二、四"], answer: 0, explain: "k>0 过一三，b>0 交 y 正半轴", subj: "数学", grade: 8, diff: 2 }],
  "数学_g9": [{ q: "x² − 5x + 6 = 0 的两根之和是？", type: "fill", answer: ["5"], explain: "韦达定理 x₁+x₂ = −b/a = 5", subj: "数学", grade: 9, diff: 2 },
    { q: "y = −(x−1)² + 4 的最大值是？", type: "fill", answer: ["4"], explain: "开口向下，顶点纵坐标即最大值", subj: "数学", grade: 9, diff: 3 }],
  "语文_g7": [{ q: "「床前明月光」的作者是？", type: "choice", options: ["李白", "杜甫", "白居易", "王维"], answer: 0, explain: "李白《静夜思》", subj: "语文", grade: 7, diff: 1 },
    { q: "《朝花夕拾》是____的散文集。", type: "fill", answer: ["鲁迅"], explain: "鲁迅回忆性散文集", subj: "语文", grade: 7, diff: 1 }],
  "语文_g8": [{ q: "「苔痕上阶绿，草色入帘青」出自？", type: "choice", options: ["《陋室铭》", "《岳阳楼记》", "《醉翁亭记》", "《桃花源记》"], answer: 0, explain: "刘禹锡《陋室铭》", subj: "语文", grade: 8, diff: 2 },
    { q: "说明顺序一般不含？", type: "choice", options: ["时间顺序", "空间顺序", "逻辑顺序", "情感顺序"], answer: 3, explain: "说明文按时间/空间/逻辑，不按情感", subj: "语文", grade: 8, diff: 2 }],
  "语文_g9": [{ q: "「先天下之忧而忧」出自？", type: "choice", options: ["范仲淹《岳阳楼记》", "欧阳修《醉翁亭记》", "苏轼《赤壁赋》", "王安石《伤仲永》"], answer: 0, explain: "范仲淹《岳阳楼记》", subj: "语文", grade: 9, diff: 2 },
    { q: "议论文三要素是论点、论据和____。", type: "fill", answer: ["论证"], explain: "论点·论据·论证", subj: "语文", grade: 9, diff: 2 }],
  "英语_g7": [{ q: "— How are you? — ______.", type: "choice", options: ["I'm fine, thanks.", "I'm 13.", "It's red.", "By bus."], answer: 0, explain: "How are you 的固定应答", subj: "英语", grade: 7, diff: 1 },
    { q: "「苹果」的英文是？", type: "fill", answer: ["apple"], explain: "apple", subj: "英语", grade: 7, diff: 1 }],
  "英语_g8": [{ q: "I ______ TV when mom came in.", type: "choice", options: ["watch", "watched", "was watching", "am watching"], answer: 2, explain: "过去进行时 was/were + doing", subj: "英语", grade: 8, diff: 2 },
    { q: "「已经」的英文是？", type: "fill", answer: ["already"], explain: "already 用于肯定，yet 用于疑问/否定", subj: "英语", grade: 8, diff: 2 }],
  "英语_g9": [{ q: "If it ______ tomorrow, we'll stay home.", type: "choice", options: ["rains", "will rain", "rained", "is raining"], answer: 0, explain: "if 条件句主将从现", subj: "英语", grade: 9, diff: 2 },
    { q: "「成功」的动词是？", type: "fill", answer: ["succeed"], explain: "success(n.)→succeed(v.)→successful(adj.)", subj: "英语", grade: 9, diff: 3 }],
  "物理_g8": [{ q: "速度单位 m/s 读作？", type: "choice", options: ["米每秒", "每秒米", "米秒", "秒米"], answer: 0, explain: "复合单位按分母倒读", subj: "物理", grade: 8, diff: 1 },
    { q: "光在真空中速度约为 ____ km/s。", type: "fill", answer: ["300000"], explain: "约 3×10⁸ m/s = 3×10⁵ km/s", subj: "物理", grade: 8, diff: 2 }],
  "化学_g9": [{ q: "水的化学式是？", type: "fill", answer: ["H₂O", "H2O"], explain: "两个氢一个氧", subj: "化学", grade: 9, diff: 1 },
    { q: "下列属于纯净物的是？", type: "choice", options: ["蒸馏水", "自来水", "空气", "生理盐水"], answer: 0, explain: "蒸馏水只含 H₂O 一种物质", subj: "化学", grade: 9, diff: 2 }]
};
(() => { for (const k in FALLBACK) if (k !== "_any" && !FALLBACK[k].length) FALLBACK[k] = FALLBACK._any; })();

})();
