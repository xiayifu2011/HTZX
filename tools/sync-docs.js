#!/usr/bin/env node
/* ==================================================================
 * 把 docs/ 下的三份 Markdown 转成 js/00-docs.js
 * ------------------------------------------------------------------
 * 为什么要这一步：
 *   双击本地 index.html 打开时，浏览器出于安全策略不允许读取 .md 文件。
 *   所以把 .md 预先转成 JS 里的字符串，游戏一定能读到。
 *
 * 用法：
 *   node sync-docs.js
 * Windows 用户直接双击：tools/同步文档.bat
 *
 * 改完 docs/guide.md / changelog.md / credits.md 之后跑一次即可。
 * ============================================================ */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DOCS = [
  {key: "guide", file: "guide.md", title: "新手介绍"},
  {key: "changelog", file: "changelog.md", title: "更新日志"},
  {key: "credits", file: "credits.md", title: "鸣谢列表"}
];

/* 极简 Markdown → HTML：够用就好，不引入任何依赖 */
/* 极简 Markdown → HTML：够用就好，不引入任何依赖
 *
 * 两个「把文档变短」的关键处理（v1.1）：
 *   ① 软换行合并：源文件里一句话被拆成两行写 → 合成一个 <p>
 *   ② 断句接回：源文件里一句话被空行拆成两段 → 接回一个 <p>
 *      （判断依据：上一段不是以 。？！…」』） 结尾，说明话没说完）
 *  写 md 的同学可以放心按"一句一行、行间空行"的舒服写法来，
 *  渲染出来照样是一整段。
 */
function md2html(src) {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const out = [];
  let inList = false;
  let inTable = false;

  const inline = t => t
    .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<i>$2</i>");

  /* 一段话是否「说完了」：以句号 / 叹号 / 问号 / 省略号 / 收尾引号结尾 */
  const ENDS = /[。！？!?.…）)】」』》”"'〉]\s*$/;

  /* 记住最后一个 <p> 的位置；一旦插入标题、列表、表格等结构性元素就清空，
   * 避免段落跨过它们去拼接。 */
  let lastParaIdx = -1;
  function pushHtml(h) {
    out.push(h);
    lastParaIdx = /^<p>/.test(h) ? out.length - 1 : -1;
  }

  const closeList = () => {if (inList) {pushHtml("</ul>"); inList = false;}};
  const closeTable = () => {if (inTable) {pushHtml("</table>"); inTable = false;}};

  let paraBuf = [];
  const flushPara = () => {
    if (!paraBuf.length) return;
    let t = paraBuf[0];
    for (let k = 1; k < paraBuf.length; k++) {
      const prev = paraBuf[k - 1], cur = paraBuf[k];
      // 英文/数字之间补一个空格；中文直接连上，不要凭空插空格
      const needSpace = /[A-Za-z0-9.,;:!?]$/.test(prev) && /^[A-Za-z0-9]/.test(cur);
      t += (needSpace ? " " : "") + cur;
    }
    paraBuf = [];
    // 上一段话没说完 → 接上去
    // ★ 但整段是一个元素（如整行加粗 **玉溪市红塔中学**）时不能接 ——
    //   它的结尾是 ">" 而不是标点，会被误判成"话没说完"，
    //   结果和下一行拼在一起，那句话就重复出现了一遍。
    if (lastParaIdx >= 0) {
      const prev = out[lastParaIdx].replace(/^<p>/, "").replace(/<\/p>$/, "");
      const prevText = prev.replace(/<[^>]+>/g, "");   // 去掉标签取纯文本
      const endsWithTag = />$/.test(prev);             // 整段就是一个元素
      if (!endsWithTag && !ENDS.test(prevText)) {
        const needSpace = /[A-Za-z0-9.,;:!?]$/.test(prev) && /^[A-Za-z0-9]/.test(t);
        pushHtml(`<p>${inline(prev + (needSpace ? " " : "") + t)}</p>`);
        return;
      }
    }
    pushHtml(`<p>${inline(t)}</p>`);
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trimEnd();

    // 表格
    if (/^\s*\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1])) {
      flushPara();
      if (!inTable) {pushHtml('<table class="mdtable">'); inTable = true;}
      const cells = line.split("|").slice(1, -1).map(c => c.trim());
      pushHtml("<tr>" + cells.map(c => `<th>${inline(c)}</th>`).join("") + "</tr>");
      i++; // 跳过分隔行
      while (i + 1 < lines.length && /^\s*\|.*\|\s*$/.test(lines[i + 1])) {
        i++;
        const cs = lines[i].split("|").slice(1, -1).map(c => c.trim());
        pushHtml("<tr>" + cs.map(c => `<td>${inline(c)}</td>`).join("") + "</tr>");
      }
      continue;
    }
    closeTable();

    if (!line.trim()) {flushPara(); closeList(); continue;}

    // 标题
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      flushPara(); closeList();
      const lv = Math.min(4, h[1].length + 1);
      pushHtml(`<h${lv}>${inline(h[2])}</h${lv}>`);
      continue;
    }

    // 分隔线
    if (/^-{3,}$/.test(line.trim())) {flushPara(); closeList(); pushHtml('<hr class="mdhr">'); continue;}

    // 引用
    if (/^>\s?/.test(line)) {
      flushPara(); closeList();
      pushHtml(`<blockquote>${inline(line.replace(/^>\s?/, ""))}</blockquote>`);
      continue;
    }

    // 列表
    const li = line.match(/^\s*[-*]\s+(.*)$/);
    if (li) {
      flushPara();
      if (!inList) {pushHtml("<ul>"); inList = true;}
      pushHtml(`<li>${inline(li[1])}</li>`);
      continue;
    }
    paraBuf.push(line.trim());
  }
  flushPara();
  closeList();
  closeTable();
  return out.join("");
}

let js = `/* ==================================================================
 * 自动生成 · 请勿手工编辑
 * ------------------------------------------------------------------
 * 这个文件由 tools/sync-docs.js 从 docs/*.md 生成。
 * 要改内容请改 docs/guide.md / changelog.md / credits.md，
 * 然后运行 node tools/sync-docs.js（或双击 tools/同步文档.bat）。
 * ============================================================ */

const GAME_DOCS = {
`;

const parts = [];
DOCS.forEach(d => {
  const p = path.join(ROOT, "docs", d.file);
  if (!fs.existsSync(p)) {
    console.warn(`⚠ 缺少 docs/${d.file}，已用占位内容代替`);
    parts.push(`  ${d.key}: {title: "${d.title}", html: "<p>（内容缺失，请检查 docs/${d.file}）</p>"}`);
    return;
  }
  const md = fs.readFileSync(p, "utf8");
  const html = md2html(md);
  parts.push(`  ${d.key}: {title: ${JSON.stringify(d.title)}, html: ${JSON.stringify(html)}}`);
  console.log(`  ✓ docs/${d.file} → ${d.title}（${md.length} 字符）`);
});

js += parts.join(",\n") + "\n};\n";
js += `
/* 打开一个文档弹窗 */
function openDoc(key) {
  const d = (typeof GAME_DOCS !== "undefined") && GAME_DOCS[key];
  if (!d) {if (typeof toast === "function") toast("文档还没生成，请先运行 tools/sync-docs.js"); return;}
  showModal(d.title, '<div class="markdown">' + d.html + "</div>",
    [{t: "关闭", fn: function () {}}], null, false, true, {kind: "doc"});
}
`;

const outPath = path.join(ROOT, "js", "00-docs.js");
fs.writeFileSync(outPath, js, "utf8");
console.log(`\n✅ 已生成 js/00-docs.js（${(fs.statSync(outPath).size / 1024).toFixed(1)} KB）`);
console.log("   现在刷新网页或双击 index.html 就能看到新内容。");
