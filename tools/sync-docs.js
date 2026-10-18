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
function md2html(src) {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const out = [];
  let inList = false;
  let inTable = false;

  const inline = t => t
    .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<i>$2</i>");

  const closeList = () => {if (inList) {out.push("</ul>"); inList = false;}};
  const closeTable = () => {if (inTable) {out.push("</table>"); inTable = false;}};

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trimEnd();

    // 表格
    if (/^\s*\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1])) {
      if (!inTable) {out.push('<table class="mdtable">'); inTable = true;}
      const cells = line.split("|").slice(1, -1).map(c => c.trim());
      out.push("<tr>" + cells.map(c => `<th>${inline(c)}</th>`).join("") + "</tr>");
      i++; // 跳过分隔行
      while (i + 1 < lines.length && /^\s*\|.*\|\s*$/.test(lines[i + 1])) {
        i++;
        const cs = lines[i].split("|").slice(1, -1).map(c => c.trim());
        out.push("<tr>" + cs.map(c => `<td>${inline(c)}</td>`).join("") + "</tr>");
      }
      continue;
    }
    closeTable();

    if (!line.trim()) {closeList(); out.push(""); continue;}

    // 标题
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      closeList();
      const lv = Math.min(4, h[1].length + 1);
      out.push(`<h${lv}>${inline(h[2])}</h${lv}>`);
      continue;
    }

    // 分隔线
    if (/^-{3,}$/.test(line.trim())) {closeList(); out.push('<hr class="mdhr">'); continue;}

    // 引用
    if (/^>\s?/.test(line)) {
      closeList();
      out.push(`<blockquote>${inline(line.replace(/^>\s?/, ""))}</blockquote>`);
      continue;
    }

    // 列表
    const li = line.match(/^\s*[-*]\s+(.*)$/);
    if (li) {
      if (!inList) {out.push("<ul>"); inList = true;}
      out.push(`<li>${inline(li[1])}</li>`);
      continue;
    }
    closeList();

    out.push(`<p>${inline(line)}</p>`);
  }
  closeList();
  closeTable();
  return out.join("\n");
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
