/* ==================================================================
 * 配置层 · 主题皮肤
 * ==================================================================
 * 每套主题 = 一组 CSS 变量 + 背景 + 一句文案。
 * 默认主题是学校的清华紫，其余主题供玩家在主菜单自由切换。
 *
 * 想加新主题：在 THEME_SKINS 里照抄一份，改 id / name / tagline / vars。
 * vars 必须写全，缺了会沿用上一套主题的颜色。
 *
 * 变量含义：
 *   --brand / --brand-deep / --brand-lite  按钮底色三档
 *   --purple / --purple2                   强调文字与高亮（不一定是紫色）
 *   --gold / --gold-soft                   点缀金
 *   --bg / --panel / --panel2 / --line     背景与卡片
 *   --txt / --dim                          正文与次要文字
 *   --green / --red / --blue               语义色（增益 / 减益 / 系统）
 *   --glow / --glow2 / --brand-rgb         发光色的 rgb 三元组
 *   --bg-overlay                           背景图之上的压暗层
 *   --bg-opacity                           背景图不透明度
 *
 * 维护等级：配置层（随便改）
 * ============================================================ */

    const THEME_SKINS = [

      /* ---------------- 默认：清华紫（学校主题色） ---------------- */
      {
        id: "hongta",
        name: {zh: "清华紫", en: "Tsinghua Purple"},
        tagline: {zh: "每一步 都算数", en: "Every step counts"},
        poem: {zh: "人生在立，行达天下", en: "Stand firm, and you will go far"},
        bgImage: "assets/bg.jpg",
        bgImageAlt: "assets/bg2.jpg",
        bgImageEnd: "assets/bg_end.jpg",
        bgOpacity: 0.26,
        bgGrad: "radial-gradient(1200px 800px at 20% 0%, #2a1040, #120a18 60%)",
        vars: {
          "--brand": "#660874", "--brand-deep": "#3d0647", "--brand-lite": "#8a2b9c",
          "--purple": "#c08ae8", "--purple2": "#9c4dcc",
          "--gold": "#d7b45a", "--gold-soft": "#f0d488",
          "--bg": "#120a18", "--panel": "#1e1029", "--panel2": "#443250", "--line": "#795f89",
          "--txt": "#f7f4fa", "--dim": "#cfc0da",
          "--green": "#7ee0c0", "--red": "#ff7aa2", "--blue": "#a86ddb",
          "--glow": "156, 77, 204", "--glow2": "192, 138, 232", "--brand-rgb": "102, 8, 116",
          "--bg-overlay": "rgba(18, 10, 24, .82)"
        }
      },

      /* ---------------- 群星：来时群星正落 ---------------- */
      {
        id: "stars",
        name: {zh: "群星", en: "Stars"},
        tagline: {zh: "来时群星正落", en: "The stars were falling when you came"},
        poem: {zh: "你抬头时，天上正落着一场没有声音的雨", en: "You looked up: a silent rain of stars"},
        bgOpacity: 0.22,
        bgGrad: "radial-gradient(1000px 700px at 15% 5%, #1d2450, #0b0f22 62%), radial-gradient(600px 400px at 85% 90%, #1a1f45, transparent 70%)",
        vars: {
          "--brand": "#232a5e", "--brand-deep": "#12162f", "--brand-lite": "#3f4c9c",
          "--purple": "#a9b6ff", "--purple2": "#7b8cf0",
          "--gold": "#e8d48b", "--gold-soft": "#fff0c0",
          "--bg": "#0b0f22", "--panel": "#131a35", "--panel2": "#333b59", "--line": "#606a8c",
          "--txt": "#fafbff", "--dim": "#c4cae4",
          "--green": "#6fe3c4", "--red": "#ff7a9c", "--blue": "#7aa2ff",
          "--glow": "123, 140, 240", "--glow2": "169, 182, 255", "--brand-rgb": "35, 42, 94",
          "--bg-overlay": "rgba(11, 15, 34, .80)"
        }
      },

      /* ---------------- 草原：去后野草自蓬勃（呼吸感） ---------------- */
      {
        id: "grassland",
        name: {zh: "草原", en: "Grassland"},
        tagline: {zh: "去后野草自蓬勃", en: "The grass grows on after you leave"},
        poem: {zh: "风一吹，整片野草替你把话说完了", en: "The wind speaks for you through the grass"},
        bgOpacity: 0.22,
        bgGrad: "radial-gradient(1100px 760px at 25% 0%, #35654e, #0e1a12 62%), radial-gradient(700px 500px at 80% 95%, #47805a, transparent 70%)",
        vars: {
          "--brand": "#2f6b46", "--brand-deep": "#17402a", "--brand-lite": "#4e9a68",
          "--purple": "#d8f4de", "--purple2": "#8ddca4",
          "--gold": "#eed39a", "--gold-soft": "#fff4cf",
          "--bg": "#0e1a12", "--panel": "#16281c", "--panel2": "#32493a", "--line": "#587a63",
          "--txt": "#f6fdf7", "--dim": "#c8dacc",
          "--green": "#8ce8b0", "--red": "#ff8f7a", "--blue": "#7fd3c0",
          "--glow": "110, 201, 138", "--glow2": "189, 232, 196", "--brand-rgb": "47, 107, 70",
          "--bg-overlay": "rgba(14, 26, 18, .80)"
        }
      },

      /* ---------------- 晨曦：天亮之前先把灯点着 ---------------- */
      {
        id: "dawn",
        name: {zh: "晨曦", en: "Dawn"},
        tagline: {zh: "天亮之前，先把灯点着", en: "Light the lamp before the dawn"},
        poem: {zh: "早读的窗玻璃上，先亮起来的是你", en: "On the window, you brighten first"},
        bgOpacity: 0.22,
        bgGrad: "radial-gradient(1000px 700px at 20% 0%, #6a3320, #1b110d 62%), radial-gradient(700px 500px at 85% 90%, #8a4526, transparent 70%)",
        vars: {
          "--brand": "#a84b2f", "--brand-deep": "#5e2416", "--brand-lite": "#d97a4e",
          "--purple": "#ffc9a3", "--purple2": "#ff9d6b",
          "--gold": "#ffd98a", "--gold-soft": "#fff0cf",
          "--bg": "#1b110d", "--panel": "#2a1a14", "--panel2": "#4e3b30", "--line": "#896659",
          "--txt": "#fffefc", "--dim": "#e2c9b9",
          "--green": "#9ad9a0", "--red": "#ff7a72", "--blue": "#ffb27a",
          "--glow": "255, 157, 107", "--glow2": "255, 201, 163", "--brand-rgb": "168, 75, 47",
          "--bg-overlay": "rgba(27, 17, 13, .78)"
        }
      },

      /* ---------------- 深海：越深的沉默，越亮的回声 ---------------- */
      {
        id: "abyss",
        name: {zh: "深海", en: "Deep Sea"},
        tagline: {zh: "越深的沉默，越亮的回声", en: "The deeper the silence, the brighter the echo"},
        poem: {zh: "你在水底喊了一声，三年后才听见回响", en: "You called underwater; the echo came three years later"},
        bgOpacity: 0.24,
        bgGrad: "radial-gradient(1000px 700px at 20% 0%, #10414a, #061418 62%), radial-gradient(700px 500px at 82% 92%, #0d5560, transparent 70%)",
        vars: {
          "--brand": "#0f5f6b", "--brand-deep": "#06333c", "--brand-lite": "#1a8ea0",
          "--purple": "#8fe6f0", "--purple2": "#35c3d4",
          "--gold": "#e6d68f", "--gold-soft": "#fff3bd",
          "--bg": "#061418", "--panel": "#0d2229", "--panel2": "#27434a", "--line": "#4a747e",
          "--txt": "#f3fdfe", "--dim": "#b9d4d9",
          "--green": "#6ff0d0", "--red": "#ff6f8f", "--blue": "#59c8ff",
          "--glow": "53, 195, 212", "--glow2": "143, 230, 240", "--brand-rgb": "15, 95, 107",
          "--bg-overlay": "rgba(6, 20, 24, .80)"
        }
      },

      /* ---------------- 素墨：留白处，才见少年 ---------------- */
      {
        id: "ink",
        name: {zh: "素墨", en: "Ink"},
        tagline: {zh: "留白处，才见少年", en: "In the blank space, the boy appears"},
        poem: {zh: "纸上没写的那些，才是你的三年", en: "What the page left unsaid is your three years"},
        bgOpacity: 0.18,
        bgGrad: "radial-gradient(1000px 700px at 20% 0%, #35393f, #0e1013 62%), radial-gradient(700px 500px at 80% 92%, #2a2e34, transparent 70%)",
        vars: {
          "--brand": "#3a3f48", "--brand-deep": "#171a1f", "--brand-lite": "#5c646f",
          "--purple": "#cfd6de", "--purple2": "#9aa3ad",
          "--gold": "#c9b27a", "--gold-soft": "#e8d9a8",
          "--bg": "#0e1013", "--panel": "#171a1f", "--panel2": "#393d42", "--line": "#666a72",
          "--txt": "#f7f9fa", "--dim": "#c6cad0",
          "--green": "#9fc7a6", "--red": "#d98a8a", "--blue": "#a9b6c4",
          "--glow": "154, 163, 173", "--glow2": "207, 214, 222", "--brand-rgb": "58, 63, 72",
          "--bg-overlay": "rgba(14, 16, 19, .82)"
        }
      },

      /* ---------------- 花灯：一盏灯，照亮三年 ---------------- */
      {
        id: "lantern",
        name: {zh: "花灯", en: "Lantern"},
        tagline: {zh: "一盏灯，照亮三年", en: "One lantern lights three years"},
        poem: {zh: "玉溪的花灯一亮，整条街都亮了", en: "When the lanterns of Yuxi light up, the whole street does"},
        bgOpacity: 0.22,
        bgGrad: "radial-gradient(1000px 700px at 20% 0%, #6b1524, #170a0c 62%), radial-gradient(700px 500px at 82% 90%, #8a2334, transparent 70%)",
        vars: {
          "--brand": "#8f1f2e", "--brand-deep": "#4a0d16", "--brand-lite": "#c0392f",
          "--purple": "#ffb9b0", "--purple2": "#ff7a6b",
          "--gold": "#ffd76e", "--gold-soft": "#fff0b8",
          "--bg": "#170a0c", "--panel": "#250f13", "--panel2": "#4b3236", "--line": "#8c5a61",
          "--txt": "#fcf2ef", "--dim": "#ddbfba",
          "--green": "#9fd6a0", "--red": "#ff6b6b", "--blue": "#ffab7a",
          "--glow": "255, 122, 107", "--glow2": "255, 185, 176", "--brand-rgb": "143, 31, 46",
          "--bg-overlay": "rgba(23, 10, 12, .80)"
        }
      }
    ];

    const THEME_MAP = {};
    THEME_SKINS.forEach(t => {THEME_MAP[t.id] = t;});

    const THEME_DEFAULT_ID = "hongta";
    let THEME_CUR = THEME_DEFAULT_ID;

    function themeById(id) {
      return THEME_MAP[id] || THEME_MAP[THEME_DEFAULT_ID] || THEME_SKINS[0];
    }

    function currentTheme() {return themeById(THEME_CUR);}

    /* ==================================================================
     * 应用一套主题
     * ==================================================================
     * 只往 :root 上写 CSS 变量，不改任何 DOM 结构 ——
     * 所以切换主题不需要重开一局，也不会影响存档数据。
     * ================================================================== */
    function applyThemeSkin(id) {
      if (id == null) id = THEME_CUR;      // 不传就沿用当前主题
      const t = themeById(id);
      THEME_CUR = t.id;
      const root = document.documentElement;

      // 先打上主题 class，方便 css 里写「某主题下的特殊处理」
      THEME_SKINS.forEach(s => root.classList.remove("theme-" + s.id));
      root.classList.add("theme-" + t.id);

      const v = t.vars || {};
      for (const k in v) root.style.setProperty(k, v[k]);

      // 背景：有图用图，没图用渐变（两套都写，img 缺失时自动落到渐变）
      root.style.setProperty("--bg-image", t.bgImage ? `url("${t.bgImage}")` : "none");
      root.style.setProperty("--bg-grad", t.bgGrad || "none");
      root.style.setProperty("--bg-opacity", String(t.bgOpacity == null ? 0.24 : t.bgOpacity));
      root.style.setProperty("--bg-overlay", (v["--bg-overlay"] || "rgba(18, 10, 24, .82)"));

      if (typeof GAME_CONFIG !== "undefined" && GAME_CONFIG.theme) {
        GAME_CONFIG.theme.accent = v["--brand"] || GAME_CONFIG.theme.accent;
        GAME_CONFIG.theme.accent2 = v["--purple"] || GAME_CONFIG.theme.accent2;
        GAME_CONFIG.theme.accentGold = v["--gold"] || GAME_CONFIG.theme.accentGold;
        GAME_CONFIG.theme.bgOpacity = t.bgOpacity == null ? 0.24 : t.bgOpacity;
        GAME_CONFIG.theme.bgImage = t.bgImage || "";
        GAME_CONFIG.theme.bgImageAlt = t.bgImageAlt || "";
        GAME_CONFIG.theme.bgImageEnd = t.bgImageEnd || "";
      }
      return t;
    }

    function setTheme(id, silent) {
      const t = applyThemeSkin(id);
      try {localStorage.setItem("htzx_theme", t.id);} catch (e) { }
      if (typeof saveSettings === "function") saveSettings();
      if (!silent && typeof toast === "function") toast(L("toast.theme", T(t.name)));
      if (typeof renderStartExtras === "function") renderStartExtras();
      return t;
    }

    function nextTheme() {
      const i = THEME_SKINS.findIndex(t => t.id === THEME_CUR);
      const n = THEME_SKINS[(i + 1 + THEME_SKINS.length) % THEME_SKINS.length];
      return setTheme(n.id);
    }

    /* 背景切换：main / alt / end —— 沿用当前主题的图片 */
    function themeBg(season) {
      const t = currentTheme();
      if (season === "end") return t.bgImageEnd || t.bgImage || "";
      if (season === "alt") return t.bgImageAlt || t.bgImage || "";
      return t.bgImage || "";
    }

    /* ==================================================================
     * 设置持久化（主题 + 语言）
     * ============================================================ */
    const SETTINGS_KEY = "htzx_settings_v1";

    function loadSettings() {
      let d = null;
      try {d = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null");} catch (e) {d = null;}
      // 兼容旧版单独存的两个 key
      if (!d) d = {};
      if (!d.theme) {try {d.theme = localStorage.getItem("htzx_theme") || "";} catch (e) { }}
      if (!d.lang) {try {d.lang = localStorage.getItem("htzx_lang") || "";} catch (e) { }}
      if (!THEME_MAP[d.theme]) d.theme = (typeof GAME_CONFIG !== "undefined" && GAME_CONFIG.themeId) || THEME_DEFAULT_ID;
      if (d.lang !== "en") d.lang = "zh";
      LANG = d.lang;
      applyThemeSkin(d.theme);
      return d;
    }

    function saveSettings() {
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify({theme: THEME_CUR, lang: LANG}));
      } catch (e) { }
    }

    /* ==================================================================
     * 主题选择界面（主菜单 + 弹窗）
     * ================================================================== */
    function themeChipHtml() {
      return THEME_SKINS.map(t => {
        const v = t.vars || {};
        const on = t.id === THEME_CUR;
        return `<button class="themechip${on ? " on" : ""}" onclick="setTheme('${t.id}')"
          title="${T(t.poem)}"
          style="--c1:${v["--brand-lite"]};--c2:${v["--purple"]};--c3:${v["--gold"]}">
          <span class="tcdot"></span>
          <span class="tcname">${T(t.name)}</span>
          <span class="tctag">${T(t.tagline)}</span>
        </button>`;
      }).join("");
    }

    function renderStartExtras() {
      const box = document.getElementById("themeList");
      if (box) box.innerHTML = themeChipHtml();
      const hint = document.getElementById("themeHint");
      if (hint) hint.textContent = L("menu.themeHint");
      const tl = document.getElementById("themeLabel");
      if (tl) tl.textContent = L("menu.theme");
      const ll = document.getElementById("langLabel");
      if (ll) ll.textContent = L("menu.lang");
      const lh = document.getElementById("langHint");
      if (lh) lh.textContent = L("menu.langHint");
      const lb = document.getElementById("langBtn");
      if (lb) lb.textContent = LANG === "zh" ? "English" : "中文";
      const ml = document.getElementById("moreLabel");
      if (ml) ml.textContent = L("menu.more");
      const sl = document.getElementById("slotsLabel");
      if (sl) sl.textContent = L("menu.slots");
      const al = document.getElementById("aboutLabel");
      if (al) al.textContent = L("menu.about");
      const ab = document.getElementById("aboutBody");
      if (ab) ab.innerHTML = L("about.body");
      ["btnGuide", "btnChangelog", "btnCredits"].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const map = {btnGuide: "menu.guide", btnChangelog: "menu.changelog", btnCredits: "menu.credits"};
        el.textContent = L(map[id]);
      });
    }

    /* 游戏内也能换主题（顶栏 🎨 按钮） */
    function openThemePicker() {
      const cur = currentTheme();
      showPopup({
        kind: "free",
        title: L("menu.theme"),
        body: `<div style="line-height:1.6;margin-bottom:5px;color:var(--dim);font-size:.86rem">
            ${L("menu.themeHint")}<br>
            <span style="color:var(--gold-soft)">「${T(cur.name)}」—— ${T(cur.tagline)}</span>
          </div>
          <div class="themepicker">${themeChipHtml()}</div>`,
        options: [{t: L("modal.close"), fn: () => { }}]
      });
    }
