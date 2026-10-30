/* ======================================================================
 * 主题系统（需求 3 · 增量模块）
 * ======================================================================
 * 原版 applyTheme() 只从 GAME_CONFIG.theme 读一套清华紫。本模块在其之上加「主题包」：
 * 切换 data-theme 即连背景 / 字体 / 动效一起换。默认「群星」承接原清华紫。
 * 红雾/灰暗的颜色固定在 css/effects.css，这里故意不动。
 * 用法：Theme.set("grass")；选择存 localStorage "htzx_theme"
 * 接入：19-boot.js 里把 applyTheme() 换成 Theme.init()
 * ============================================================ */
(function () { "use strict";

const THEMES = [
  { id: "star",   nameKey: "theme.star.name",   lineKey: "theme.star.line",
    bg: "linear-gradient(160deg,#0d0818 0%,#1a0d2e 55%,#26113a 100%)",
    font: "'Noto Serif SC','Songti SC',serif",
    vars: { brand:"#660874", "brand-deep":"#3d0647", "brand-lite":"#8a2b9c",
      purple:"#c08ae8", purple2:"#9c4dcc", gold:"#d7b45a", "gold-soft":"#f0d488",
      bg:"#120a18", panel:"#1e1029", panel2:"#2a1638", line:"#4a2760",
      txt:"#f2ecf7", dim:"#bda9cd", green:"#7ee0c0", red:"#ff7aa2", blue:"#a86ddb" } },

  { id: "grass",  nameKey: "theme.grass.name",  lineKey: "theme.grass.line",
    bg: "linear-gradient(165deg,#0f1c14 0%,#16281d 55%,#1d3a26 100%)",
    font: "'PingFang SC','Microsoft YaHei',sans-serif",
    vars: { brand:"#2f6b3f", "brand-deep":"#1c4528", "brand-lite":"#4d9a63",
      purple:"#8fd6a4", purple2:"#5fb57c", gold:"#e3c06a", "gold-soft":"#f5dc9c",
      bg:"#0f1c14", panel:"#15241a", panel2:"#1e3324", line:"#355c42",
      txt:"#eef6ee", dim:"#a9c7b3", green:"#8fe0a8", red:"#ff9a7a", blue:"#7cc4d6" } },

  { id: "abyss",  nameKey: "theme.abyss.name",  lineKey: "theme.abyss.line",
    bg: "linear-gradient(160deg,#02060d 0%,#06101f 50%,#0a1a30 100%)",
    font: "'Noto Serif SC','Songti SC',serif",
    vars: { brand:"#12406b", "brand-deep":"#0a2747", "brand-lite":"#2a6fb0",
      purple:"#6fb0e0", purple2:"#3f86c0", gold:"#9fb6d4", "gold-soft":"#c8dcef",
      bg:"#02060d", panel:"#07101c", panel2:"#0c1a2c", line:"#1d3550",
      txt:"#dfeaf7", dim:"#829cb5", green:"#5fd0b0", red:"#ff8aa0", blue:"#7aa8e8" } },

  { id: "paper",  nameKey: "theme.paper.name",  lineKey: "theme.paper.line",
    bg: "linear-gradient(150deg,#f3eadc 0%,#e7dcc4 55%,#ddd0b2 100%)",
    font: "'Noto Serif SC','Songti SC',serif", invert: true,
    vars: { brand:"#8a5a2b", "brand-deep":"#5c3a17", "brand-lite":"#b5824a",
      purple:"#6b4a2e", purple2:"#8a5a2b", gold:"#a9802a", "gold-soft":"#d3ad66",
      bg:"#f3eadc", panel:"#fbf5e9", panel2:"#f0e6cf", line:"#d6c4a4",
      txt:"#2b241c", dim:"#7a6a52", green:"#5f8a4a", red:"#c25a4a", blue:"#4a6f8a" } },

  { id: "blaze",  nameKey: "theme.blaze.name",  lineKey: "theme.blaze.line",
    bg: "linear-gradient(155deg,#1a0709 0%,#300d12 55%,#4a1520 100%)",
    font: "'PingFang SC','Microsoft YaHei',sans-serif",
    vars: { brand:"#a81d2c", "brand-deep":"#660f18", "brand-lite":"#d14452",
      purple:"#ff9a6b", purple2:"#e05a3a", gold:"#ffcf6b", "gold-soft":"#ffe0a0",
      bg:"#1a0709", panel:"#2a0d14", panel2:"#3d1620", line:"#6a2630",
      txt:"#fbeee8", dim:"#cda9a0", green:"#ffb06b", red:"#ff6b7a", blue:"#d98fb0" } }
];

const LS = "htzx_theme"; let cur = null;

function list() { return THEMES.map(t => ({ id: t.id, nameKey: t.nameKey, lineKey: t.lineKey })); }
function current() { return cur ? cur.id : THEMES[0].id; }

function apply(t) {
  const cfg = THEMES.find(x => x.id === t) || THEMES[0];
  const root = document.documentElement, body = document.body;
  root.setAttribute("data-theme", cfg.id);
  if (cfg.font) root.style.setProperty("--game-font", cfg.font);
  root.classList.toggle("theme-light", !!cfg.invert);
  for (const k in cfg.vars) root.style.setProperty("--" + k, cfg.vars[k]);
  if (cfg.bg && (!window.GAME_CONFIG || !window.GAME_CONFIG.theme || !window.GAME_CONFIG.theme.bg)) {
    body.style.setProperty("--theme-bg", cfg.bg);
    body.style.backgroundImage = cfg.bg;
  }
  if (cfg.fxTint) body.style.setProperty("--fx-tint", cfg.fxTint);
  cur = cfg;
  try { localStorage.setItem(LS, cfg.id); } catch (e) {}
  if (window.safeRender && window.safeRender.hud) window.safeRender.hud();
  return cfg.id;
}
function init() {
  let t = null; try { t = localStorage.getItem(LS); } catch (e) {}
  if (window.GAME_CONFIG && window.GAME_CONFIG.themeId) t = window.GAME_CONFIG.themeId;
  apply(t || THEMES[0].id);
}

window.Theme = { list, current, set: apply, init, THEMES };
if (typeof module !== "undefined") module.exports = window.Theme;
})();
