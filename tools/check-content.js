#!/usr/bin/env node
/* ==================================================================
 * 内容体检脚本
 * ------------------------------------------------------------------
 * 改完内容后跑一下，它会用中文告诉你哪里写错了。
 *
 * 用法（在 tools/ 目录下开终端）：
 *     node check-content.js
 *
 * 也可以双击「体检内容.bat」（Windows）
 * ============================================================ */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const PROPS = ["心态", "经济", "健康", "效率", "悟性", "社交", "压力", "亲情"];
const SUBJECTS = ["语文", "数学", "英语", "物理", "化学", "历史", "政治", "生物", "地理"];

let errors = [], warns = [], oks = [];

/* 只把"数据部分"抽出来执行，避免依赖浏览器环境 */
function loadDataPart(file) {
  const src = fs.readFileSync(path.join(ROOT, "js", file), "utf8");
  return src;
}

function runInSandbox(files) {
  const ctx = {console, Math, JSON, isFinite, parseFloat, parseInt, Object, Array, String, Number};
  vm.createContext(ctx);
  // 提供内容文件里可能用到的最小桩
  ctx.S = null;
  ctx.say = () => {};
  ctx.count = () => {};
  ctx.modProp = () => {};
  ctx.gainTalent = () => {};
  ctx.subjectsOf = () => [];
  ctx.Talent = {have: () => false};
  ctx.TALENTS = {};
  for (const f of files) {
    try {vm.runInContext(loadDataPart(f), ctx, {filename: f});}
    catch (e) {errors.push(`【${f}】语法错误：${e.message}`);}
  }
  return ctx;
}

// ---------- 1. 语法检查 ----------
console.log("────────────────────────────────");
console.log(" 中考人生模拟器 · 内容体检");
console.log("────────────────────────────────\n");

const DATA_FILES = [
  "03-data-talents.js", "04-data-subjects.js", "05-data-shop.js",
  "06-data-books.js", "07-data-events.js", "08-data-events-school.js",
  "10-data-achievements.js", "11-data-endings.js", "12-data-cures.js",
];

/* 社团表依赖 TALENTS，单独开一个沙盒跑 */
const CLUB_FILES = ["03-data-talents.js", "05b-data-clubs.js"];

for (const f of DATA_FILES) {
  const p = path.join(ROOT, "js", f);
  if (!fs.existsSync(p)) {errors.push(`缺少文件 ${f}`); continue;}
  const src = fs.readFileSync(p, "utf8");
  try {new Function(src); oks.push(`${f} 语法正常`);}
  catch (e) {errors.push(`【${f}】JS 语法错误：${e.message}\n      可能原因：逗号多了/少了、引号没配对、括号没闭合`);}
}

// ---------- 2. 载入数据 ----------
const ctx = runInSandbox(DATA_FILES);
/* 顶层 const 不会挂到 context 对象上，要用表达式取 */
function get(expr, fallback) {
  try {const v = vm.runInContext(expr, ctx); return v === undefined ? fallback : v;}
  catch (e) {return fallback;}
}

function getFrom(c, expr, fallback) {
  try {const v = vm.runInContext(expr, c); return v === undefined ? fallback : v;}
  catch (e) {return fallback;}
}

/* 1.0 新增：时段与季节的合法取值。写错字事件就永远不出现了 */
const SLOT_OK = ["weekday", "clubday", "weekend"];
const SEASON_OK = ["春", "夏", "秋", "冬"];

// ---------- 3. 事件检查 ----------
const evMain = get("EVENTS", []), evSchool = get("SCHOOL_EVENTS", []);
/* 学校事件已并入 EVENTS，这里去重避免误报重复 */
const events = evMain.concat(evSchool.filter(e => !evMain.some(x => x.id === e.id)));
console.log(`共载入 ${events.length} 条随机事件`);
const seenId = new Set();
let cmdCount = 0;

for (const ev of events) {
  const name = ev.t || "(无标题)";
  if (!ev.id) errors.push(`事件「${name}」缺少 id（唯一编号）`);
  else if (seenId.has(ev.id)) errors.push(`事件 id 重复：${ev.id}（每个事件的 id 必须不一样）`);
  else seenId.add(ev.id);

  if (!ev.t) errors.push(`事件 ${ev.id} 缺少标题 t`);
  if (!ev.c) warns.push(`事件「${name}」没有正文 c`);
  if (typeof ev.w !== "number") warns.push(`事件「${name}」的 w（出现权重）不是数字，建议写 3~6`);
  if (!Array.isArray(ev.opts) || !ev.opts.length) {errors.push(`事件「${name}」没有任何选项`); continue;}

  /* 时段 / 季节：写错字事件就永远不出现，必须拦下来 */
  const slotList = Array.isArray(ev.slot) ? ev.slot : (ev.slot ? [ev.slot] : []);
  for (const s of slotList) {
    if (!SLOT_OK.includes(s)) errors.push(`事件「${name}」的 slot「${s}」写错了，只能是 ${SLOT_OK.join(" / ")}（或写成数组）`);
  }
  const seasonList = Array.isArray(ev.season) ? ev.season : (ev.season ? [ev.season] : []);
  for (const s of seasonList) {
    if (!SEASON_OK.includes(s)) errors.push(`事件「${name}」的 season「${s}」写错了，只能是 ${SEASON_OK.join(" / ")}`);
  }

  for (const o of ev.opts) {
    if (!o.t) errors.push(`事件「${name}」有一个选项没写文字`);
    // 「挂起 / raise」指定的后续事件必须真的存在，否则永远不会触发
    if (Array.isArray(o.raise)) for (const r of o.raise) {
      if (r && r.id && !events.some(x => x.id === r.id)) {
        errors.push(`事件「${name}」→ 选项「${o.t}」挂起的事件「${r.id}」在事件表里不存在`);
      }
    }
    /* 中文指令可能写在 o.run 里，也可能写在条件分支 o.branch[].run 里
     * —— 两处都要体检，以前只看 o.run，分支里的错别字一直没人发现。 */
    const specs = [];
    if (o.run) specs.push(o.run);
    if (Array.isArray(o.branch)) for (const b of o.branch) if (b.run) specs.push(b.run);
    for (const spec of specs) {
      const runs = Array.isArray(spec) ? spec : (typeof spec === "string" ? [spec] : null);
      if (!runs) continue;
      for (const cmd of runs) {
        if (typeof cmd !== "string") continue;
        cmdCount++;
        checkCmd(cmd, `事件「${name}」→ 选项「${o.t}」`);
      }
    }
  }
}

function checkCmd(cmd, where) {
  const s = String(cmd).trim();
  if (!s) return;
  // 概率前缀
  let m = s.match(/^概率\s*([\d.]+)\s*(.+)$/);
  if (m) {
    const p = parseFloat(m[1]);
    if (!(p >= 0 && p <= 1)) errors.push(`${where}：概率要写成 0~1 之间的小数，例如「概率 0.35 天赋 豪」，现在是 ${m[1]}`);
    return checkCmd(m[2], where);
  }
  if (/^提示\s+/.test(s)) return;
  if (/^全科\s*[+-]?[\d.]+%$/.test(s)) return;
  if (/^学力\s+(最弱|.+?)\s*[+-][\d.]+$/.test(s)) {
    const k = s.match(/^学力\s+(最弱|.+?)\s*[+-]/)[1];
    if (k !== "最弱" && !SUBJECTS.includes(k)) errors.push(`${where}：科目名「${k}」不存在，可用：${SUBJECTS.join("、")}`);
    return;
  }
  if (/^学习加成\s*[+-]?[\d.]+%(\s*\d+\s*周)?$/.test(s)) return;
  if (/^学习减益\s*[\d.]+%(\s*\d+\s*周)?$/.test(s)) return;
  if (/^计数\s+\S+(\s*\+\d+)?$/.test(s)) return;
  if (/^标记\s+\S+$/.test(s)) return;
  if (/^清除标记\s+\S+$/.test(s)) return;
  if (/^挂起\s+\S+\s+\d+周\s*[\d.]+倍?$/.test(s)) {
    const id = s.match(/^挂起\s+(\S+)/)[1];
    const all = get("EVENTS", []);
    if (!all.some(e => e.id === id)) errors.push(`${where}：挂起的事件 id「${id}」在事件表里不存在`);
    return;
  }
  if (/^天赋\s+\S+$/.test(s)) {
    const tn = s.match(/^天赋\s+(\S+)$/)[1];
    if (!get("TALENTS", {})[tn]) errors.push(`${where}：天赋「${tn}」在天赋表里不存在`);
    return;
  }
  m = s.match(/^(.+?)\s*([+-][\d.]+)$/);
  if (m) {
    if (!PROPS.includes(m[1])) errors.push(`${where}：「${m[1]}」不是有效属性名，可用：${PROPS.join("、")}`);
    return;
  }
  errors.push(`${where}：看不懂这条指令「${s}」，请对照 docs/CONTENT_GUIDE.md 的指令表`);
}

// ---------- 4. 天赋表检查 ----------
const T = get("TALENTS", {});
console.log(`共载入 ${Object.keys(T).length} 个天赋`);
for (const [name, t] of Object.entries(T)) {
  if (typeof t.lv !== "number") errors.push(`天赋「${name}」缺少等级 lv`);
  if (!t.desc) warns.push(`天赋「${name}」没有效果描述 desc`);
  if (Array.isArray(t.inc)) for (const c of t.inc) {
    if (!T[c]) errors.push(`天赋「${name}」的矛盾项「${c}」在天赋表里不存在`);
  }
}

// ---------- 4.5 社团表检查 ----------
const clubCtx = runInSandbox(CLUB_FILES);
const CLUBS = getFrom(clubCtx, "CLUBS", []);
const CLUB_EVENTS = getFrom(clubCtx, "CLUB_EVENTS", []);
const T2 = get("TALENTS", {});
console.log(`共载入 ${CLUBS.length} 个社团 · ${CLUB_EVENTS.length} 条社团事件`);
const clubIds = new Set();
for (const c of CLUBS) {
  if (!c.id) {errors.push("有一个社团缺少 id"); continue;}
  if (clubIds.has(c.id)) errors.push(`社团 id 重复：${c.id}`);
  clubIds.add(c.id);
  if (!c.n) errors.push(`社团 ${c.id} 缺少名称 n`);
  /* 社团的「长期参与奖励」必须是一个真实存在的天赋，
   * 否则玩家坚持 6 次什么也拿不到 —— 这个坑以前踩过。 */
  if (c.talent && !T2[c.talent]) {
    errors.push(`社团「${c.n || c.id}」的奖励天赋「${c.talent}」在天赋表里不存在（去 js/03-data-talents.js 加，或改成一个已有的天赋）`);
  }
  if (c.perk) for (const k in c.perk) {
    if (!PROPS.includes(k)) errors.push(`社团「${c.n || c.id}」的加成属性「${k}」不存在，可用：${PROPS.join("、")}`);
  }
}
for (const e of CLUB_EVENTS) {
  if (seenId.has(e.id)) errors.push(`事件 id 重复（社团事件与别的事件撞了）：${e.id}`);
  else seenId.add(e.id);
  if (!Array.isArray(e.opts) || !e.opts.length) errors.push(`社团事件 ${e.id} 没有选项`);
  const sl = Array.isArray(e.slot) ? e.slot : (e.slot ? [e.slot] : []);
  for (const s of sl) if (!SLOT_OK.includes(s)) errors.push(`社团事件 ${e.id} 的 slot「${s}」写错了`);
}

// ---------- 4.6 成就可达性检查（死成就） ----------
/* 成就写好了、但全项目没有任何一处会给它计数 —— 玩家一辈子也拿不到。
 * 这里把「成就用到的计数」和「代码里真的会累加的计数」对一遍。 */
const jsDir = path.join(ROOT, "js");
const allSrc = fs.readdirSync(jsDir).filter(f => f.endsWith(".js"))
  .map(f => fs.readFileSync(path.join(jsDir, f), "utf8")).join("\n");

const countedKeys = new Set();
for (const m of allSrc.matchAll(/count\(\s*["']([A-Za-z_]\w*)["']\s*\)/g)) countedKeys.add(m[1]);
for (const m of allSrc.matchAll(/S\.cnt\.([A-Za-z_]\w*)\s*(?:=[^=]|\+\+|--|\+=)/g)) countedKeys.add(m[1]);

/* 「计数 运动」这类中文指令，要经 EFFECT_COUNT_MAP 翻译后才算数 */
const fxSrc = fs.readFileSync(path.join(jsDir, "13-engine-effects.js"), "utf8");
const mapBlock = fxSrc.match(/const EFFECT_COUNT_MAP = \{([\s\S]*?)\};/);
const zh2key = {};
if (mapBlock) {
  for (const m of mapBlock[1].matchAll(/([\u4e00-\u9fa5]+)\s*:\s*"(\w+)"/g)) zh2key[m[1]] = m[2];
}
for (const ev of events) for (const o of (ev.opts || [])) {
  const specs = [];
  if (o.run) specs.push(o.run);
  if (Array.isArray(o.branch)) for (const b of o.branch) if (b.run) specs.push(b.run);
  for (const spec of specs) {
    const runs = Array.isArray(spec) ? spec : (typeof spec === "string" ? [spec] : null);
    if (!runs) continue;
    for (const cmd of runs) {
      const m = String(cmd).match(/^计数\s+(\S+)/);
      if (m) countedKeys.add(zh2key[m[1]] || m[1]);
    }
  }
}

const achSrc = fs.readFileSync(path.join(jsDir, "10-data-achievements.js"), "utf8");
const achKeys = new Set();
for (const m of achSrc.matchAll(/S\.cnt\.([A-Za-z_]\w*)/g)) achKeys.add(m[1]);
for (const k of achKeys) {
  if (!countedKeys.has(k)) {
    errors.push(`成就用到了计数「${k}」，但整个项目没有任何地方会给它 +1（玩家永远拿不到这个成就）`);
  }
}

// ---------- 5. 破茧表检查 ----------
const CURES = get("CURES", []);
console.log(`共载入 ${CURES.length} 条破茧`);
for (const c of CURES) {
  if (!T[c.talent]) errors.push(`破茧条目「${c.talent}」在天赋表里不存在`);
  if (!c.stat) errors.push(`破茧「${c.talent}」缺少 stat（靠什么行为累积）`);
  if (typeof c.need !== "number") errors.push(`破茧「${c.talent}」的 need 不是数字`);
  if (c.grant && !T[c.grant]) errors.push(`破茧「${c.talent}」赠送的天赋「${c.grant}」不存在`);
  if (!c.text) warns.push(`破茧「${c.talent}」没有鼓励文案`);
}

// ---------- 6. 结局检查 ----------
const END = get("ENDINGS", []);
console.log(`共载入 ${END.length} 个结局`);
END.forEach((e, i) => {if (!e.n || !e.c) errors.push(`第 ${i + 1} 个结局缺少名称或条件`);});

// ---------- 输出结果 ----------
console.log(`\n检查了 ${cmdCount} 条中文指令\n`);
console.log("────────────────────────────────");
if (errors.length) {
  console.log(`\n❌ 发现 ${errors.length} 个必须修的问题：\n`);
  errors.forEach((e, i) => console.log(`  ${i + 1}. ${e}`));
} else {
  console.log("\n✅ 全部通过，可以放心运行！");
}
if (warns.length) {
  console.log(`\n⚠️  ${warns.length} 个小提醒（不影响运行）：\n`);
  warns.slice(0, 20).forEach(w => console.log(`  · ${w}`));
  if (warns.length > 20) console.log(`  …还有 ${warns.length - 20} 条`);
}
console.log("\n────────────────────────────────\n");
process.exit(errors.length ? 1 : 0);
