/* ==================================================================
 * 效果解释器 · 让不会编程的人也能写事件
 * ------------------------------------------------------------------
 * 有了这个解释器，事件的 run 除了可以写函数，还可以写成中文指令数组。
 *
 *   run: ["心态 +6", "健康 -3"]                 两种写法等价，
 *   run: S => {modProp("心态",6); modProp("健康",-3)}   上面的不用会 JS
 *
 * 支持的指令一览（冒号后是说明）：
 *   属性：  心态 +6    健康 -8    压力 -2   经济 +200
 *           （可用属性：心态 经济 健康 效率 悟性 社交 压力 亲情）
 *           注：亲情不在主界面属性栏显示，只在家庭事件与结局中生效
 *   学力：  学力 数学 +25      单科加分
 *           学力 最弱 +60      给当前最弱的科目加分
 *           全科 +12%          所有科目按比例提升
 *   计数：  计数 运动          记一次（用于成就判定，可选 +N）
 *   天赋：  天赋 钢筋铁骨      直接获得
 *           概率 0.35 天赋 豪  35% 概率获得
 *   提示：  提示 你跑得飞快！  写进右侧日志
 *           提示 考砸了！!bad   !good 绿色 / !bad 红色 / !sys 蓝色
 *   增益：  学习加成 +20% 2周  本周及之后 N 周学习收益提升
 *   减益：  学习减益 -30% 2周
 *
 * 写错了会怎样：不认识的指令会被忽略，并在浏览器控制台给出中文提示，
 * 不会让游戏崩溃。改完记得用 tools/check-content.js 体检一遍。
 * ============================================================ */

const EFFECT_PROPS = ["心态", "经济", "健康", "效率", "悟性", "社交", "压力"];

/* 中文计数名 → 成就系统认识的编号。
 * 这样写「计数 运动」就等于程序里的 count("sport")，成就才能认。 */
const EFFECT_COUNT_MAP = {
  运动: "sport", 体育锻炼: "sport", 跑步: "sport",
  学习: "study", 社交: "social",
  志愿服务: "volunteer", 志愿者: "volunteer", 值日: "volunteer",
  读书: "read", 阅读: "read",
  诚实: "honest", 拾金不昧: "honest",
  兼职: "partjob", 打工: "partjob",
  拒绝诱惑: "resist", 自律: "resist",
  熬夜: "night", 挑灯夜读: "night",
  副本: "dungeon", 假期副本: "dungeon",
  情书: "love", 小吃: "food", 吃饭: "food",
  考试: "exam", 竞赛: "contestWin",
};

/* 执行一条中文指令，返回是否成功识别 */
function execCmd(cmd, S) {
  if (typeof cmd !== "string") return false;
  const s = cmd.trim();
  if (!s) return true;

  // 概率前缀：概率 0.35 天赋 豪
  let m = s.match(/^概率\s*([\d.]+)\s*(.+)$/);
  if (m) {
    if (Math.random() >= parseFloat(m[1])) return true;
    return execCmd(m[2], S);
  }

  // 提示：提示 文字 [!good|!bad|!sys]
  m = s.match(/^提示\s+(.+?)\s*(!good|!bad|!sys|!talent)?$/);
  if (m) {say(m[1], (m[2] || "").replace("!", "")); return true;}

  // 全科百分比：全科 +12%
  m = s.match(/^全科\s*([+-]?[\d.]+)%$/);
  if (m) {
    const subs = subjectsOf(S.term) || [];
    const r = 1 + parseFloat(m[1]) / 100;
    subs.forEach(k => {S.subj[k] = clamp(num(S.subj[k], 30) * r, 0, SUBJ_CAP);});
    recalcScore();
    return true;
  }

  // 学力：学力 数学 +25 / 学力 最弱 +60
  m = s.match(/^学力\s+(最弱|.+?)\s*([+-][\d.]+)$/);
  if (m) {
    const subs = subjectsOf(S.term) || [];
    let key = m[1];
    if (key === "最弱") key = subs.length ? subs.reduce((a, b) => S.subj[a] < S.subj[b] ? a : b) : null;
    if (key && S.subj[key] !== undefined) {
      S.subj[key] = clamp(num(S.subj[key], 30) + parseFloat(m[2]), 0, SUBJ_CAP);
      recalcScore();
      say(`【${key}】学力 ${m[2] > 0 ? "+" : ""}${m[2]}`, "good");
    }
    return true;
  }

  // 增益：学习加成 +20% 2周
  m = s.match(/^学习加成\s*([+-]?[\d.]+)%\s*(?:(\d+)\s*周)?$/);
  if (m) {
    S.studyBuff += parseFloat(m[1]) / 100;
    S.buffWeeks = Math.max(S.buffWeeks, parseInt(m[2] || "1", 10));
    return true;
  }
  // 减益：学习减益 -30% 2周
  m = s.match(/^学习减益\s*([\d.]+)%\s*(?:(\d+)\s*周)?$/);
  if (m) {
    S.studyDebuff += parseFloat(m[1]) / 100;
    S.debuffWeeks = Math.max(S.debuffWeeks, parseInt(m[2] || "1", 10));
    return true;
  }

  // 计数：计数 运动 [+N]（中文名会自动映射成成就认识的英文编号）
  m = s.match(/^计数\s+(\S+)(?:\s*\+(\d+))?$/);
  if (m) {
    const key = EFFECT_COUNT_MAP[m[1]] || m[1];
    const n = m[2] ? parseInt(m[2], 10) : 1;
    for (let i = 0; i < n; i++) count(key);
    return true;
  }

  // 天赋：天赋 名称
  m = s.match(/^天赋\s+(\S+)$/);
  if (m) {gainTalent(m[1], "事件"); return true;}

  // 标记：标记 phone_at_school / 清除标记 phone_at_school
  // 标记是给后续事件读的"状态"。例如带了手机才可能被查到。
  m = s.match(/^标记\s+(\S+)$/);
  if (m) {if (typeof setFlag === "function") setFlag(m[1], true); return true;}

  m = s.match(/^清除标记\s+(\S+)$/);
  if (m) {if (typeof setFlag === "function") setFlag(m[1], false); return true;}

  // 挂起：挂起 事件id 3周 4倍
  // 让某个事件在接下来几周里概率放大 —— 不必立刻触发，但"迟早会来"
  m = s.match(/^挂起\s+(\S+)\s+(\d+)周\s*([\d.]+)倍?$/);
  if (m) {
    if (typeof raiseEvent === "function") raiseEvent(m[1], parseInt(m[2], 10), parseFloat(m[3]), "");
    return true;
  }

  // 属性：心态 +6 / 健康 -8
  m = s.match(/^(心态|经济|健康|效率|悟性|社交|压力|亲情)\s*([+-][\d.]+)$/);
  if (m) {modProp(m[1], parseFloat(m[2])); return true;}

  console.warn("[内容提示] 没看懂这条指令：", cmd, "（已跳过，游戏不受影响）");
  return false;
}

/* 统一入口：run 可以是函数 / 字符串 / 字符串数组 */
function runEffectSpec(spec, S) {
  if (!spec) return;
  if (typeof spec === "function") {spec(S); return;}
  if (Array.isArray(spec)) {spec.forEach(c => execCmd(c, S)); return;}
  execCmd(spec, S);
}
