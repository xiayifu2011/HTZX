/* ======================================================================
 * 运动锻炼（需求 5 · 增量模块）
 * ======================================================================
 * 点击「运动锻炼」→ 消耗 1 次行动 → 抽首层节点 → 弹窗选项 → 走 2~3 层链。
 * 所有加血/减压/天赋变化都走原版 runEffectSpec/execCmd（中文指令串），
 * 与天赋·成就·飘字·日志完全兼容。配置见 js/data/tweak.json → sport。
 * 接入：16-flow.js 的 takeAction("sport") 分支改成：
 *      showModalDef(Sport.build(), () => sportChain(() => afterAction("sport")));
 * ====================================================================== */
(function () { "use strict";

let round = 0;

function resetRound() { round = 0; }

function pickSeed() {
  const p = (window.S && window.S.prop) || {};
  const nodes = (window.GAME_CONFIG && window.GAME_CONFIG.sport && window.GAME_CONFIG.sport.nodes) || [];
  if (!nodes.length) return DEFAULT;
  const health = num(p.健康, 100), stress = num(p.压力, 10);
  const scored = nodes.map(n => {
    let w = n.weight != null ? n.weight : 1;
    if (n.heal && health < 60) w *= 1.6;
    if (n.calm && stress > 70) w *= 1.8;
    if (n.risk && health < 40) w *= 0.25;
    return { n, w: Math.max(0.05, w) };
  });
  const tot = scored.reduce((s, x) => s + x.w, 0);
  let r = Math.random() * tot;
  for (const x of scored) { r -= x.w; if (r <= 0) return x.n; }
  return scored[scored.length - 1].n;
}
function num(v, d) { return (typeof v === "number" && isFinite(v)) ? v : d; }

const DEFAULT = {
  title: { zh: "🏃 运动锻炼", en: "Work Out" },
  body:  { zh: "下午的阳光把跑道烤得发白。你换上旧球鞋，选一个项目。",
           en: "The track is bleached white by the afternoon sun. You lace up your old trainers." },
  opts: [
    { t: { zh: "绕着操场跑三圈", en: "Three laps around the track" },
      run: ["健康 +10", "压力 -8", "效率 -1", "提示 跑完最后一圈，肺里全是风。!good", "计数 sport:1"],
      next: "afterRun" },
    { t: { zh: "打半小时篮球", en: "Shoot hoops for half an hour" },
      run: ["健康 +8", "社交 +6", "压力 -5", "提示 球砸在筐上，哐的一声很解压。!good"],
      next: "afterBall" },
    { t: { zh: "找个树荫躺一会儿", en: "Lie down in the shade" },
      run: ["健康 +4", "压力 -10", "提示 云走得很慢，你也是。!good"] }
  ]
};

function toDef(node) {
  const zh = v => typeof v === "string" ? v : (v && (v.zh || v.en) || "");
  const title = zh(node.title);
  const body = zh(node.body) + `<div style="color:var(--dim);font-size:.8rem;margin-top:6px">${roundLabel()}</div>`;
  return {
    kind: "event", badge: window.I18n ? window.I18n.t("sport.title") : "运动",
    title, body,
    options: (node.opts || []).map(o => ({
      t: zh(o.t),
      fn: () => commit(o)
    }))
  };
}
function roundLabel() {
  return window.I18n && window.I18n.get() === "en"
    ? `Round ${round} · the chain may go on` : `第 ${round} 段 · 可能还会接着发生`;
}

function commit(o) {
  const eff = o.run || o.effect || [];
  runCmd(Array.isArray(eff) ? eff : [eff]);
  window.count && window.count("sport");
  round++;
  const cfg = (window.GAME_CONFIG && window.GAME_CONFIG.sport) || {};
  const maxDepth = Math.max(1, Math.min(3, cfg.maxDepth || 2));
  if (!o.next || round >= maxDepth) return done();
  const chainAt = cfg.chainChance || [0.7, 0.45, 0.2];
  if (Math.random() > (chainAt[round - 1] != null ? chainAt[round - 1] : 0)) return done();
  const nxt = resolveNode(o.next);
  if (!nxt) return done();
  window.showModalDef && window.showModalDef(toDef(nxt));
}
function done() {
  window.say && window.say("🏃 " + (window.I18n ? window.I18n.t("sport.done") : "运动结束"), "sys");
  window.renderHUD && window.renderHUD();
  if (window.afterSportChain) window.afterSportChain();
}
function resolveNode(ref) {
  if (!ref) return null;
  if (typeof ref === "object") return ref;
  const nodes = (window.GAME_CONFIG && window.GAME_CONFIG.sport && window.GAME_CONFIG.sport.nodes) || [];
  return nodes.find(n => n.id === ref) || LIB[ref] || null;
}
function runCmd(arr) {
  const zhs = arr.map(x => typeof x === "string" ? x : (x && x.zh) || "").filter(Boolean);
  window.runEffectSpec ? window.runEffectSpec(zhs, window.S)
    : (window.execCmd && zhs.forEach(c => window.execCmd(c, window.S)));
}

window.Sport = {
  resetRound, build: () => { round = 1; return toDef(pickSeed()); },
  commit, done, resolveNode, _round: () => round
};

/* —— 链后续节点库（可在 tweak.json 的 sport.nodes 里用 id 引用或覆盖） —— */
const LIB = {
  afterRun: {
    title: { zh: "跑道边上", en: "By the Track" },
    body:  { zh: "你弯着腰喘气，有人递来一瓶水。", en: "You're bent over, gasping. Someone hands you a bottle." },
    opts: [
      { t: { zh: "接过来，道声谢", en: "Take it, say thanks" }, run: ["健康 +2", "社交 +3", "提示 水有点温，但刚好。!good"] },
      { t: { zh: "摆摆手，自己走", en: "Wave it off, walk away" }, run: ["压力 -2", "提示 一个人吹吹风也不错。!good"] }
    ]
  },
  afterBall: {
    title: { zh: "场边围观", en: "On the Sideline" },
    body:  { zh: "球赛散了，队友喊你一起去小卖铺。", en: "The game's over. Your teammate yells for you to hit the tuck shop." },
    opts: [
      { t: { zh: "一起去（花点钱）", en: "Go along (spend a little)" },
        run: ["经济 -8", "社交 +5", "压力 -3", "提示 冰汽水在喉咙里炸开。!good"], next: "shopChat" },
      { t: { zh: "摇头回教室", en: "Shake your head, back to class" },
        run: ["效率 +2", "提示 你擦完汗，把错题本翻开了。!good"] }
    ]
  },
  shopChat: {
    title: { zh: "小卖铺门口", en: "At the Tuck Shop" },
    body:  { zh: "几个人蹲在台阶上聊天，不知谁提起了下周的考试。", en: "Squatting on the step, someone brings up next week's exam." },
    opts: [
      { t: { zh: "跟着笑，不接话", en: "Laugh along, stay out of it" }, run: ["压力 -2", "社交 +2"] },
      { t: { zh: "接上两句，倒是放松了", en: "Jump in — turns out it's a relief" },
        run: ["压力 -4", "社交 +3", "提示 原来大家都一样慌。!good"] }
    ]
  }
};

})();
