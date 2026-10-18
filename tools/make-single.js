#!/usr/bin/env node
/* ==================================================================
 * 打包成单个 HTML 文件
 * ------------------------------------------------------------------
 * 把 css/ 和 js/ 全部塞进一个 index.html，产出一个可以单独发送的
 * game.html —— 微信直接发、U 盘拷走、老师双击就能看，不用带文件夹。
 *
 * 用法：node make-single.js
 * 输出：../game.html
 * ============================================================ */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "game.html");

let html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");

// 1. 内联 CSS
html = html.replace(/<link rel="stylesheet" href="css\/([^"]+)">/g, (m, f) => {
  const p = path.join(ROOT, "css", f);
  if (!fs.existsSync(p)) {console.warn("⚠ 缺少 css/" + f); return "";}
  return "<style>\n" + fs.readFileSync(p, "utf8") + "\n</style>";
});

// 2. 内联 JS
html = html.replace(/<script src="js\/([^"]+)"><\/script>/g, (m, f) => {
  const p = path.join(ROOT, "js", f);
  if (!fs.existsSync(p)) {console.warn("⚠ 缺少 js/" + f); return "";}
  return "<script>\n/* ==== " + f + " ==== */\n" + fs.readFileSync(p, "utf8") + "\n</script>";
});

// 3. 处理 assets 图片：可选，把小图转成 base64 内嵌
//    （默认不转，保持图片外链；如需完全离线，把 autoInlineImages 设为 true）
const autoInlineImages = false;
if (autoInlineImages) {
  html = html.replace(/(src|url\()=["']?(assets\/[^"')]+)["']?\)?/g, (m, k, rel) => {
    const p = path.join(ROOT, rel);
    if (!fs.existsSync(p)) return m;
    const ext = path.extname(p).slice(1).toLowerCase();
    const b64 = fs.readFileSync(p).toString("base64");
    return k === "url(" ? `url("data:image/${ext};base64,${b64}")` : `src="data:image/${ext};base64,${b64}"`;
  });
}

fs.writeFileSync(OUT, html, "utf8");
const kb = (fs.statSync(OUT).size / 1024).toFixed(1);
console.log(`✅ 已生成 game.html（${kb} KB）`);
console.log(`   位置：${OUT}`);
console.log(`   这个文件可以单独发给老师审核，双击即玩。`);
