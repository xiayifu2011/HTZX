/* ======================================================================
 * 英语模式（需求 4 · 增量模块）
 * ======================================================================
 * 规则：① 引擎指令保持中文（心态 +6），不改 13-engine-effects，保证 80+ 天赋/15 校属事件零破坏；
 *       ② 只翻译显示层：属性名、按钮、弹窗壳、结局/天赋名、主题文案、做题/运动、菜单、鸣谢标题；
 *       ③ 玩家名字不过翻译；④ 切换立即刷新 HUD/行动面板/存档槽。
 * 接入：19-boot.js 在 renderSlots() 后加 I18n.init()
 * ============================================================ */
(function () { "use strict";

const DICT = {
"prop.心态":"Mindset","prop.经济":"Money","prop.健康":"Health","prop.效率":"Efficiency",
"prop.悟性":"Aptitude","prop.社交":"Social","prop.压力":"Stress","prop.亲情":"Family Bond",
"subj.数学":"Math","subj.语文":"Chinese","subj.英语":"English","subj.物理":"Physics",
"subj.化学":"Chemistry","subj.生物":"Biology","subj.政治":"Civics","subj.历史":"History",
"subj.地理":"Geography","subj.体育":"PE",
"fuzzy.veryLow":"Critically Low","fuzzy.low":"Low","fuzzy.mid":"Steady",
"fuzzy.high":"High","fuzzy.veryHigh":"Critical",
"act.study":"Hit the Books","act.rest":"Catch Some Rest","act.social":"Hang Out",
"act.fun":"Screw Around","act.allowance":"Ask Parents for Cash","act.read":"Class Bookshelf",
"act.club":"Club Activity","act.quiz":"Do a Drill","act.sport":"Work Out",
"act.study.hint":"Gain study power, fuel for the exam.",
"act.rest.hint":"Heal health, cut stress.","act.social.hint":"Grow your social, meet people.",
"act.fun.hint":"Feels good. Efficiency pays.","act.allowance.hint":"Cash scales with family bond. Costs one move.",
"act.read.hint":"Books only give good things.","act.club.hint":"Wednesday club session.",
"act.quiz.hint":"A quiz in your weakest subject. Right = buff, wrong = penalty.",
"act.sport.hint":"Chain of 2–3 sports events. Costs one move.",
"hud.week":"Week","hud.grade":"Grade","hud.term":"Term","hud.score":"Study Power","hud.act":"Move",
"hud.slot":"Phase",
"slot.weekday":"🏫 Weekday","slot.clubday":"🎪 Club Wed","slot.weekend":"🏠 Weekend",
"season.spring":"Spring 🌸","season.summer":"Summer 🌞","season.autumn":"Autumn 🍂","season.winter":"Winter ❄️",
"btn.confirm":"OK","btn.cancel":"Cancel","btn.close":"Close","btn.next":"Next",
"theme.star.name":"Starfield","theme.star.line":"When you came, the stars were falling.",
"theme.grass.name":"Grassland","theme.grass.line":"After you left, the wild grass rose on its own.",
"theme.abyss.name":"Deep Sea","theme.abyss.line":"Sink down, and you finally hear yourself.",
"theme.paper.name":"Old Paper","theme.paper.line":"The ink is barely dry; the world has turned to autumn.",
"theme.blaze.name":"Bonfire","theme.blaze.line":"After the burn, the light still lives in your hands.",
"menu.theme":"Theme","menu.lang":"Language","menu.diff":"Difficulty","menu.termRange":"Term Range",
"lang.zh":"中文","lang.en":"English",
"diff.story":"Story (forgiving)","diff.standard":"Standard","diff.hard":"Hard",
"save.title":"Saved Games","save.new":"New Game","save.empty":"Empty slot","save.overwrite":"Overwrite?",
"save.export":"Export","save.import":"Import","save.delete":"Delete",
"setup.name":"Your Name","setup.gender":"Gender","setup.male":"Male","setup.female":"Female",
"setup.start":"Begin Junior High","setup.termFrom":"Start term","setup.termTo":"End term",
"setup.termHelp":"Pick a continuous range, e.g. G7-Autumn → G9-Spring.",
"quiz.title":"Pop Quiz","quiz.pick":"Choose one","quiz.fill":"Fill in the blank",
"quiz.correct":"Nailed it!","quiz.wrong":"Not quite.","quiz.explain":"Why:","quiz.noleft":"No drills left this term.",
"quiz.subj":"Subject","quiz.grade":"Level","quiz.reward":"Reward","quiz.penalty":"Penalty",
"sport.title":"Work Out","sport.round":"Round","sport.done":"Session done.","sport.chainEnd":"And that's the end of it.",
"sport.effect.health":"Health up","sport.effect.stress":"Stress down","sport.effect.talent":"A talent stirs",
"family.title":"Ask for Cash","family.conflict":"Family Row",
"family.locked":"The house is silent. No one's picking up.",
"family.poor":"They sighed. There's barely enough for the bills.",
"family.cold":"Cold. You put the phone down.","family.warm":"They stuffed a little extra into your hand.",
"end.scholar":"Academic · The Prodigy Class","end.top":"Legend · Top of the List","end.citykey":"Glory · City Key School",
"end.district":"Fine · District Key School","end.sport":"Athlete · Sports Recruited","end.art":"Artist · The Art Route",
"end.kind":"Warm · Ordinary and Happy","end.normal":"Ordinary · Regular High School",
"end.broken":"Regret · Just Missed the Dream","end.voc":"Fork · Vocational Track",
"end.fail":"Lost · Dropped Out Early","end.sick":"Tragedy · Worn Down by Illness",
"end.crazy":"Tragedy · Mind Collapsed","end.broke":"Special · Working to Pay the Bills",
"end.regret.title":"Forced to Leave",
"end.regret.line":"Something in you finally broke — three weeks in a row: the pressure too high, the heart too heavy, the body too tired. The bell rings, but you're not in the classroom anymore.",
"cure.lost":"A habit you relied on is slipping away.","cure.recovered":"You've earned it back — the old edge returns.",
"doc.guide":"How to Play","doc.changelog":"Changelog","doc.credits":"Credits",
"event.chain":"And then…","event.result":"This week's tally","event.next":"Continue",
"fx.shake":"Reality wavers.","fx.flashRed":"Your chest tightens.","fx.flashGray":"The world goes quiet and grey.",
"err.loadFail":"Couldn't load that. Try refreshing.","err.noEvent":"Nothing stirs this week."
};

/* 中文结局/天赋名 → 英文键（用于翻译事件里硬编码的中文名） */
const ZH_KEY = {
 "学术结局 · 少年班":"end.scholar","传说结局 · 状元之门":"end.top","辉煌结局 · 市重点":"end.citykey",
 "优秀结局 · 区重点":"end.district","体育结局 · 体校特招":"end.sport","艺术结局 · 艺考之路":"end.art",
 "温暖结局 · 平凡而幸福":"end.kind","平凡结局 · 普通高中":"end.normal","遗憾结局 · 与梦想擦肩":"end.broken",
 "分岔结局 · 职高之路":"end.voc","迷茫结局 · 提前离场":"end.fail","悲剧结局 · 积劳成疾":"end.sick",
 "悲剧结局 · 心理崩溃":"end.crazy","特殊结局 · 辍学打工":"end.broke","遗憾结局 · 遗憾离场":"end.regret.title"
};

let lang = "zh";
function get() { return lang; }
function t(key, p) {
  if (lang === "zh") return fmt(key, p);
  const en = DICT[key];
  if (!en) return /^[a-z]+\./.test(key) ? key : fmt(key, p);
  return fmt(en, p);
}
function fmt(s, p) { return !p ? s : s.replace(/\{(\w+)\}/g, (_, k) => p[k] == null ? "{" + k + "}" : p[k]); }
function setLocale(l) {
  lang = (l === "en") ? "en" : "zh";
  try { localStorage.setItem("htzx_lang", lang); } catch (e) {}
  document.documentElement.setAttribute("data-lang", lang);
  if (window.PropFuzzy) window.PropFuzzy.updateFxOverlay();
  if (window.safeRender) {
    window.safeRender.hud && window.safeRender.hud();
    window.safeRender.slots && window.safeRender.slots();
    window.safeRender.actions && window.safeRender.actions();
  }
  return lang;
}
function init() { let l = null; try { l = localStorage.getItem("htzx_lang"); } catch (e) {}
  setLocale(l || "zh"); }

/* 把中文文案（结局名/属性名/天赋名）翻译成当前语言 */
function translateZh(str) {
  if (typeof str !== "string") return str;
  if (lang === "zh") return str;
  for (const k in ZH_KEY) if (str.indexOf(k) >= 0) return str.split(k).join(DICT[ZH_KEY[k]]);
  const m = /^(心态|经济|健康|效率|悟性|社交|压力|亲情)\s*[＋+]\s*(-?\d+)$/.exec(str.trim());
  if (m) { const base = DICT["prop." + m[1]] || m[1]; return m[2] > 0 ? base + " +" + m[2] : base + " " + m[2]; }
  return str;
}

window.I18n = { get, set: setLocale, init, t, fmt, translateZh, DICT };
if (typeof module !== "undefined") module.exports = window.I18n;
})();
