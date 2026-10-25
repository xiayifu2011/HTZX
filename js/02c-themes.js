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

    /* ==================================================================
     * v1.3 · 四季主题的四套季节配色
     * ------------------------------------------------------------------
     * 「四季」不是一套固定的颜色，而是四套颜色按时间连续混合。
     * 每一套都给全了变量，混合时逐项插值（颜色走 RGB 线性插值）。
     * 想改某个季节的观感，只动下面这一块就行。
     * ================================================================== */
    const SEASON_PALETTES = {
      春: {
        key: "春", icon: "🌸",
        name: {zh: "春", en: "Spring"},
        tagline: {zh: "东风解冻，草木初醒", en: "East wind thaws, grass wakes"},
        poem: {zh: "你说出口的第一句话，被风带去了很远的地方", en: "The wind carries your first words far away"},
        grad: [
          "radial-gradient(1100px 760px at 22% 8%, rgba(96, 168, 118, .26), transparent 66%)",
          "radial-gradient(820px 560px at 82% 92%, rgba(198, 214, 120, .18), transparent 70%)"
        ],
        vars: {
          "--brand": "#2f6b46", "--brand-deep": "#173524", "--brand-lite": "#57a074",
          "--purple": "#8fd6a8", "--purple2": "#4f9a6c",
          "--gold": "#e3c46a", "--gold-soft": "#f4e3a8",
          "--bg": "#101c15", "--panel": "#17271e", "--panel2": "#2a4030", "--line": "#5c8163",
          "--txt": "#f2fbf4", "--dim": "#bcd8c4",
          "--green": "#7ee0a0", "--red": "#ff8098", "--blue": "#79b6d8",
          "--glow": "79, 154, 108", "--glow2": "143, 214, 168", "--brand-rgb": "47, 107, 70",
          "--bg-overlay": "rgba(16, 28, 21, .80)"
        }
      },
      夏: {
        key: "夏", icon: "🌞",
        name: {zh: "夏", en: "Summer"},
        tagline: {zh: "蝉声把午后拉得很长", en: "Cicadas stretch the afternoon"},
        poem: {zh: "树叶稠密到看不见天，光还是从缝里漏了下来", en: "Light still finds the seams"},
        grad: [
          "radial-gradient(1150px 780px at 26% 6%, rgba(56, 152, 190, .26), transparent 66%)",
          "radial-gradient(860px 580px at 84% 94%, rgba(226, 196, 92, .16), transparent 70%)"
        ],
        vars: {
          "--brand": "#1f5f7a", "--brand-deep": "#0f3245", "--brand-lite": "#4a97b8",
          "--purple": "#7fd4e8", "--purple2": "#3f96b4",
          "--gold": "#f2d488", "--gold-soft": "#fbeec2",
          "--bg": "#0c1a24", "--panel": "#122734", "--panel2": "#23414f", "--line": "#4e7f96",
          "--txt": "#f0fafd", "--dim": "#b4d4e2",
          "--green": "#78e0c4", "--red": "#ff8098", "--blue": "#6fc4f0",
          "--glow": "63, 150, 180", "--glow2": "127, 212, 232", "--brand-rgb": "31, 95, 122",
          "--bg-overlay": "rgba(12, 26, 36, .78)"
        }
      },
      秋: {
        key: "秋", icon: "🍂",
        name: {zh: "秋", en: "Autumn"},
        tagline: {zh: "风里忽然有了桂花香", en: "Osmanthus on the wind"},
        poem: {zh: "有人把整条路的落叶踩得作响，走了很远还听得见", en: "Leaves keep talking long after"},
        grad: [
          "radial-gradient(1120px 770px at 24% 6%, rgba(186, 122, 42, .26), transparent 66%)",
          "radial-gradient(840px 570px at 84% 94%, rgba(214, 158, 60, .18), transparent 70%)"
        ],
        vars: {
          "--brand": "#7a4a12", "--brand-deep": "#40260a", "--brand-lite": "#b57c34",
          "--purple": "#e8bd7a", "--purple2": "#c08e42",
          "--gold": "#f2cf6a", "--gold-soft": "#fce9b0",
          "--bg": "#1d1508", "--panel": "#2a1e0f", "--panel2": "#4a361a", "--line": "#8a6530",
          "--txt": "#fdf6e8", "--dim": "#dcc79c",
          "--green": "#a8d878", "--red": "#ff8a72", "--blue": "#d8a860",
          "--glow": "192, 142, 66", "--glow2": "232, 189, 122", "--brand-rgb": "122, 74, 18",
          "--bg-overlay": "rgba(29, 21, 8, .80)"
        }
      },
      冬: {
        key: "冬", icon: "❄️",
        name: {zh: "冬", en: "Winter"},
        tagline: {zh: "早读时天还没亮", en: "Still dark at morning reading"},
        poem: {zh: "哈出的气是白的，写得下去的字是热的", en: "Breath is white, the words are warm"},
        grad: [
          "radial-gradient(1120px 770px at 24% 6%, rgba(96, 132, 190, .24), transparent 66%)",
          "radial-gradient(840px 570px at 84% 94%, rgba(178, 198, 232, .16), transparent 70%)"
        ],
        vars: {
          "--brand": "#33507a", "--brand-deep": "#1a2942", "--brand-lite": "#5f81ad",
          "--purple": "#a8c4e8", "--purple2": "#6f8fc0",
          "--gold": "#dfe6f2", "--gold-soft": "#f2f6ff",
          "--bg": "#0f1420", "--panel": "#161d2c", "--panel2": "#2a3450", "--line": "#5d6f96",
          "--txt": "#f4f8ff", "--dim": "#c2cee2",
          "--green": "#84d8c0", "--red": "#ff8098", "--blue": "#8ab4f0",
          "--glow": "111, 143, 192", "--glow2": "168, 196, 232", "--brand-rgb": "51, 80, 122",
          "--bg-overlay": "rgba(15, 20, 32, .80)"
        }
      }
    };

    /* 四季的推进顺序：春 → 夏 → 秋 → 冬 → 回到春 */
    const SEASON_ORDER = ["春", "夏", "秋", "冬"];

    const THEME_SKINS = [

      /* ══════════════════════════════════════════════════════════
       * 1 · 清华紫（默认，学校主题色）
       * 气质：庄重、书卷、紫气东来
       * 配色策略：深紫底 + 金色点缀，高贵的紫金对比
       * ══════════════════════════════════════════════════════ */
      {
        id: "hongta",
        name: {zh: "清华紫", en: "Tsinghua Purple"},
        tagline: {zh: "紫气东来，少年自立", en: "Purple air from the east, the boy stands firm"},
        poem: {zh: "人生在立，行达天下", en: "Stand firm, and you will go far"},
        bgImage: "assets/bg.jpg",
        bgImageAlt: "assets/bg2.jpg",
        bgImageEnd: "assets/bg_end.jpg",
        bgOpacity: 0.26,
        breath: 13,
        bgGrad: [
          "radial-gradient(1200px 800px at 20% 0%, #2a1040, transparent 65%)",
          "radial-gradient(700px 500px at 85% 95%, #3d0647, transparent 70%)"
        ],
        vars: {
          "--brand": "#660874", "--brand-deep": "#3d0647", "--brand-lite": "#9b52b0",
          "--purple": "#c9a3e0", "--purple2": "#8b4fa8",
          "--gold": "#d9b45a", "--gold-soft": "#f2d99a",
          "--bg": "#150a1f", "--panel": "#20112c", "--panel2": "#3b2849", "--line": "#785090",
          "--txt": "#f7f2fb", "--dim": "#cbb6dc",
          "--green": "#7ee0c0", "--red": "#ff7aa2", "--blue": "#a86ddb",
          "--glow": "139, 79, 168", "--glow2": "201, 163, 224", "--brand-rgb": "102, 8, 116",
          "--bg-overlay": "rgba(21, 10, 31, .80)"
        }
      },

      /* ══════════════════════════════════════════════════════════
       * 2 · 群星
       * 气质：深邃、辽阔、仰望
       * 配色策略：极暗底（最暗的之一）+ 冷蓝高光，三层渐变做出星云与远星
       * ══════════════════════════════════════════════════════ */
      {
        id: "stars",
        name: {zh: "群星", en: "Stars"},
        tagline: {zh: "来时群星正落", en: "The stars were falling"},
        poem: {zh: "你抬头时，天上正落着一场没有声音的雨", en: "You looked up: a silent rain of stars"},
        bgOpacity: 0.22,
        breath: 15,
        bgGrad: [
          "radial-gradient(1000px 700px at 15% 5%, #16204f, transparent 62%)",
          "radial-gradient(600px 400px at 85% 90%, #1a2450, transparent 70%)",
          "radial-gradient(320px 320px at 62% 28%, #2a3568, transparent 60%)"
        ],
        vars: {
          "--brand": "#1e2660", "--brand-deep": "#0c1030", "--brand-lite": "#3a4795",
          "--purple": "#aab8ff", "--purple2": "#6c81e8",
          "--gold": "#e8d68b", "--gold-soft": "#fff2c4",
          "--bg": "#070a18", "--panel": "#0e1330", "--panel2": "#242b50", "--line": "#4f5c8d",
          "--txt": "#eef1ff", "--dim": "#a9b4e0",
          "--green": "#6fe3c4", "--red": "#ff7a9c", "--blue": "#7aa2ff",
          "--glow": "108, 129, 232", "--glow2": "170, 184, 255", "--brand-rgb": "30, 38, 96",
          "--bg-overlay": "rgba(7, 10, 24, .78)"
        }
      },

      /* ══════════════════════════════════════════════════════════
       * 3 · 草原
       * 气质：呼吸感、开阔、生长
       * 配色策略：低饱和绿 + 一层大范围的晨雾白（高明度低饱和），
       *           呼吸周期偏快（11s），像一次完整的吸气呼气
       * ══════════════════════════════════════════════════════ */
      {
        id: "grassland",
        name: {zh: "草原", en: "Grassland"},
        tagline: {zh: "去后野草自蓬勃", en: "The grass grows on"},
        poem: {zh: "风一吹，整片野草替你把话说完了", en: "The wind speaks for you through the grass"},
        bgOpacity: 0.22,
        breath: 11,
        bgGrad: [
          "radial-gradient(1100px 760px at 25% 0%, #35654e, transparent 62%)",
          "radial-gradient(700px 500px at 80% 95%, #47805a, transparent 70%)",
          "radial-gradient(900px 620px at 50% 45%, rgba(255,255,255,.055), transparent 70%)"
        ],
        vars: {
          "--brand": "#2f6b46", "--brand-deep": "#17402a", "--brand-lite": "#5aa876",
          "--purple": "#cdefd6", "--purple2": "#7ecb96",
          "--gold": "#e6cf95", "--gold-soft": "#fff3c8",
          "--bg": "#101f16", "--panel": "#18301f", "--panel2": "#22412c", "--line": "#4e7a5e",
          "--txt": "#f4fdf6", "--dim": "#bcd9c4",
          "--green": "#8ce8b0", "--red": "#ff8f7a", "--blue": "#7fd3c0",
          "--glow": "126, 203, 150", "--glow2": "205, 239, 214", "--brand-rgb": "47, 107, 70",
          "--bg-overlay": "rgba(16, 31, 22, .76)"
        }
      },

      /* ══════════════════════════════════════════════════════════
       * 4 · 晨曦
       * 气质：希望、初始、微光
       * 配色策略：咖啡棕底 + 橙金光晕，光晕范围小且靠上（像刚升起的太阳）
       * ══════════════════════════════════════════════════════ */
      {
        id: "dawn",
        name: {zh: "晨曦", en: "Dawn"},
        tagline: {zh: "天未亮的人先看见光", en: "Who wakes before dawn sees the light first"},
        poem: {zh: "早读的窗玻璃上，先亮起来的是你", en: "On the window, you brighten first"},
        bgOpacity: 0.22,
        breath: 12,
        bgGrad: [
          "radial-gradient(1000px 700px at 20% 0%, #6a3320, transparent 62%)",
          "radial-gradient(520px 420px at 74% 18%, #8a4526, transparent 58%)"
        ],
        vars: {
          "--brand": "#a84b2f", "--brand-deep": "#5e2416", "--brand-lite": "#d97a4e",
          "--purple": "#ffc9a3", "--purple2": "#ff9d6b",
          "--gold": "#ffd98a", "--gold-soft": "#fff0cf",
          "--bg": "#1d120c", "--panel": "#2b1c13", "--panel2": "#453224", "--line": "#865c46",
          "--txt": "#fdf4ea", "--dim": "#dcbda6",
          "--green": "#9ad9a0", "--red": "#ff7a72", "--blue": "#ffb27a",
          "--glow": "255, 157, 107", "--glow2": "255, 201, 163", "--brand-rgb": "168, 75, 47",
          "--bg-overlay": "rgba(29, 18, 12, .76)"
        }
      },

      /* ══════════════════════════════════════════════════════════
       * 5 · 深海
       * 气质：深邃、沉静、回声
       * 配色策略：极深青底 + 冷光，呼吸最慢（16s）—— 越深越慢
       * ══════════════════════════════════════════════════════ */
      {
        id: "abyss",
        name: {zh: "深海", en: "Deep Sea"},
        tagline: {zh: "越深的水，回音越长", en: "The deeper the water, the longer the echo"},
        poem: {zh: "你在水底喊了一声，三年后才听见回响", en: "You called underwater; the echo came three years later"},
        bgOpacity: 0.24,
        breath: 16,
        bgGrad: [
          "radial-gradient(1000px 700px at 20% 0%, #10414a, transparent 62%)",
          "radial-gradient(700px 500px at 82% 92%, #0d5560, transparent 70%)"
        ],
        vars: {
          "--brand": "#0f5f6b", "--brand-deep": "#06333c", "--brand-lite": "#1a8ea0",
          "--purple": "#8fe6f0", "--purple2": "#35c3d4",
          "--gold": "#e6d68f", "--gold-soft": "#fff3bd",
          "--bg": "#04121a", "--panel": "#0a212c", "--panel2": "#10303d", "--line": "#2a6474",
          "--txt": "#e8fdff", "--dim": "#a5cdd6",
          "--green": "#6ff0d0", "--red": "#ff6f8f", "--blue": "#59c8ff",
          "--glow": "53, 195, 212", "--glow2": "143, 230, 240", "--brand-rgb": "15, 95, 107",
          "--bg-overlay": "rgba(4, 18, 26, .78)"
        }
      },

      /* ══════════════════════════════════════════════════════════
       * 6 · 素墨
       * 气质：留白、东方、克制
       * 配色策略：中性偏暖的宣纸灰，饱和度压到全场最低（10%/15%），
       *           连强调色都接近灰 —— 整套几乎无彩色，靠明暗说话
       * ══════════════════════════════════════════════════════ */
      {
        id: "ink",
        name: {zh: "素墨", en: "Ink"},
        tagline: {zh: "留白处，才是少年", en: "The boy lives in the blank space"},
        poem: {zh: "纸上没写的那些，才是你的三年", en: "What the page left unsaid is your three years"},
        bgOpacity: 0.18,
        breath: 14,
        bgGrad: [
          "radial-gradient(1000px 700px at 20% 0%, #35393f, transparent 62%)",
          "radial-gradient(700px 500px at 80% 92%, #2a2e34, transparent 70%)"
        ],
        vars: {
          "--brand": "#3a3f48", "--brand-deep": "#171a1f", "--brand-lite": "#626a76",
          "--purple": "#d2d7de", "--purple2": "#9aa3ad",
          "--gold": "#c9b27a", "--gold-soft": "#e8d9a8",
          "--bg": "#121316", "--panel": "#1b1d21", "--panel2": "#313438", "--line": "#60636a",
          "--txt": "#f0f1f3", "--dim": "#b5b9c0",
          "--green": "#9fc7a6", "--red": "#d98a8a", "--blue": "#a9b6c4",
          "--glow": "154, 163, 173", "--glow2": "210, 215, 222", "--brand-rgb": "58, 63, 72",
          "--bg-overlay": "rgba(18, 19, 22, .80)"
        }
      },

      /* ══════════════════════════════════════════════════════════
       * 7 · 花灯
       * 气质：温暖、人间烟火、玉溪
       * 配色策略：暗红底 + 金黄灯火，光晕小而亮，呼吸最快（9s）—— 灯火跳动
       * ══════════════════════════════════════════════════════ */
      {
        id: "lantern",
        name: {zh: "花灯", en: "Lantern"},
        tagline: {zh: "一盏灯，照三年", en: "One lantern, three years"},
        poem: {zh: "玉溪的花灯一亮，整条街都亮了", en: "When the lanterns of Yuxi light up, the whole street does"},
        bgOpacity: 0.22,
        breath: 9,
        bgGrad: [
          "radial-gradient(1000px 700px at 20% 0%, #6b1524, transparent 62%)",
          "radial-gradient(520px 400px at 58% 22%, #9c3a22, transparent 55%)"
        ],
        vars: {
          "--brand": "#8f1f2e", "--brand-deep": "#4a0d16", "--brand-lite": "#c0392f",
          "--purple": "#ffb9b0", "--purple2": "#ff7a6b",
          "--gold": "#ffd76e", "--gold-soft": "#fff0b8",
          "--bg": "#1a0b0d", "--panel": "#281013", "--panel2": "#44262b", "--line": "#8f4c54",
          "--txt": "#fdf0ec", "--dim": "#e0b3aa",
          "--green": "#9fd6a0", "--red": "#ff6b6b", "--blue": "#ffab7a",
          "--glow": "255, 122, 107", "--glow2": "255, 185, 176", "--brand-rgb": "143, 31, 46",
          "--bg-overlay": "rgba(26, 11, 13, .78)"
        }
      },

      /* ══════════════════════════════════════════════════════════
       * 9 · 四季（会变色的主题）
       * 气质：跟着时间走，一年有四种颜色
       * 配色策略：这里的 vars 只是「还没进游戏时」的兜底；
       *          进了游戏后由 applySeason() 按月份连续混合四套季节配色。
       *          背景由四层季节渐变叠着，靠透明度交叉淡入淡出，所以过渡是连续的。
       * ══════════════════════════════════════════════════════ */
      {
        id: "siji",
        name: {zh: "四季", en: "Four Seasons"},
        tagline: {zh: "一年有四种颜色", en: "A year has four colours"},
        poem: {zh: "玉溪的风一年吹过四遍，每遍都是不同的颜色", en: "The wind of Yuxi blows four times a year, each a different colour"},
        bgImage: "", bgImageAlt: "", bgImageEnd: "",
        bgOpacity: 0.30,
        breath: 14,
        seasonal: true,
        /* 兜底渐变（秋），进游戏后会被季节层盖住 */
        bgGrad: SEASON_PALETTES.秋.grad,
        vars: Object.assign({}, SEASON_PALETTES.秋.vars)
      },

      /* ══════════════════════════════════════════════════════════
       * 8 · 风
       * 气质：自由感、流动、无拘
       * 配色策略：全场最亮最通透的一套 —— 天青色、高明度低饱和、
       *           三层大范围淡色斑叠出「流动」感；呼吸最快（8s）
       * ══════════════════════════════════════════════════════ */
      {
        id: "wind",
        name: {zh: "风", en: "Wind"},
        tagline: {zh: "人生当如风般自由", en: "Life should be free like the wind"},
        poem: {zh: "风没有形状，所以它去过所有地方", en: "The wind has no shape, so it has been everywhere"},
        bgOpacity: 0.20,
        breath: 8,
        bgGrad: [
          "radial-gradient(1200px 700px at 10% 20%, #2a5c68, transparent 60%)",
          "radial-gradient(900px 600px at 80% 70%, #24505c, transparent 65%)",
          "radial-gradient(760px 520px at 50% 100%, rgba(200,235,242,.07), transparent 70%)"
        ],
        vars: {
          "--brand": "#2a7c8c", "--brand-deep": "#134652", "--brand-lite": "#3fa3b5",
          "--purple": "#a8e4ee", "--purple2": "#5cc3d6",
          "--gold": "#d9cf9a", "--gold-soft": "#f5edc2",
          "--bg": "#1a2830", "--panel": "#233740", "--panel2": "#2f4750", "--line": "#5a8894",
          "--txt": "#ffffff", "--dim": "#b8d6dd",
          "--green": "#7fe0c8", "--red": "#ff8f96", "--blue": "#6fd0ff",
          "--glow": "92, 195, 214", "--glow2": "168, 228, 238", "--brand-rgb": "42, 124, 140",
          "--bg-overlay": "rgba(26, 40, 48, .72)"
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

    /* ==================================================================
     * 四季主题：跟着时间变色
     * ------------------------------------------------------------------
     * 做法：
     *   1. 把「第几周」算成一个连续的季节进度 phase（0=春 1=夏 2=秋 3=冬）
     *      —— 用月份 + 当月第几周，所以它是连续的小数，不是四季硬切
     *   2. 按 phase 在相邻两个季节之间插值：颜色走 RGB 线性插值，
     *      背景是四层各季渐变叠着，靠透明度交叉淡入淡出
     *   3. 于是夏→秋之间会自然出现一段"夏末秋初"的中间色，过渡是丝滑的
     *
     * 没进游戏时用真实日期的月份，主菜单也能看到当季的颜色。
     * ================================================================== */

    /* 连续季节进度：0..4（4 即回到春）
     * monthF 是带小数的月份，比如 9.5 = 九月第二周 */
    function seasonPhase(monthF) {
      /* 春心在 4 月、夏心在 7 月、秋心在 10 月、冬心在 1 月 —— 每季三个月 */
      return (((num(monthF, 1) - 4) % 12) + 12) % 12 / 3;
    }

    /* 四个季节各自占多少比重（相邻两个之和恒为 1） */
    function seasonWeights(phase) {
      const p = ((num(phase, 0) % 4) + 4) % 4;
      return SEASON_ORDER.map((k, i) => {
        const d = Math.abs(p - i);
        const dist = Math.min(d, 4 - d);       // 环形距离，冬→春也能接上
        return Math.max(0, 1 - dist);
      });
    }

    /* 颜色插值：#rrggbb → #rrggbb */
    function mixHex(a, b, t) {
      const pa = hex2rgb(a), pb = hex2rgb(b);
      if (!pa || !pb) return b;
      const k = clampNum(t, 0, 1, 0);
      const r = Math.round(pa[0] + (pb[0] - pa[0]) * k);
      const g = Math.round(pa[1] + (pb[1] - pa[1]) * k);
      const bl = Math.round(pa[2] + (pb[2] - pa[2]) * k);
      return "#" + [r, g, bl].map(x => clamp(x, 0, 255).toString(16).padStart(2, "0")).join("");
    }

    function hex2rgb(h) {
      const m = /^#?([0-9a-f]{6})$/i.exec(String(h || "").trim());
      if (!m) return null;
      const n = parseInt(m[1], 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }

    /* rgb 三元组字符串（"1, 2, 3"）插值 */
    function mixRgb(a, b, t) {
      const pa = String(a || "").split(",").map(x => parseFloat(x));
      const pb = String(b || "").split(",").map(x => parseFloat(x));
      if (pa.length !== 3 || pb.length !== 3) return b;
      const k = clampNum(t, 0, 1, 0);
      return [0, 1, 2].map(i => Math.round(pa[i] + (pb[i] - pa[i]) * k)).join(", ");
    }

    /* rgba(...) 插值：只动最后一个数字（透明度）以外的部分 */
    function mixRgba(a, b, t) {
      const pa = String(a || "").match(/[\d.]+/g);
      const pb = String(b || "").match(/[\d.]+/g);
      if (!pa || !pb || pa.length < 3 || pb.length < 3) return b;
      const k = clampNum(t, 0, 1, 0);
      const v = [0, 1, 2].map(i => Math.round(num(pa[i], 0) + (num(pb[i], 0) - num(pa[i], 0)) * k));
      const al = pa.length > 3 ? num(pa[3], 1) : 1;
      return `rgba(${v[0]}, ${v[1]}, ${v[2]}, ${al})`;
    }

    function mixVar(a, b, t) {
      const sa = String(a == null ? "" : a), sb = String(b == null ? "" : b);
      if (/^rgba?\(/i.test(sa)) return mixRgba(sa, sb, t);
      if (/^#/.test(sa)) return mixHex(sa, sb, t);
      if (/^\d+,\s*\d+,\s*\d+$/.test(sa)) return mixRgb(sa, sb, t);
      return clampNum(t, 0, 1, 0) < 0.5 ? sa : sb;      // 数值/其他：谁占比大用谁
    }

    /* 四季背景层：四层各季渐变叠在一起，靠透明度交叉淡入 */
    function ensureSeasonVeil() {
      let veil = document.getElementById("seasonVeil");
      if (!veil) {
        veil = document.createElement("div");
        veil.id = "seasonVeil";
        veil.className = "season-veil";
        veil.setAttribute("aria-hidden", "true");
        veil.innerHTML = SEASON_ORDER.map(k =>
          `<i class="season-layer" data-season="${k}" style="background-image:${SEASON_PALETTES[k].grad.join(", ")}"></i>`
        ).join("");
        document.body.appendChild(veil);
      }
      return veil;
    }

    /* 按「带小数的月份」把四季配色应用到界面上 */
    function applySeason(monthF, silent) {
      const t = currentTheme();
      const veil = ensureSeasonVeil();
      const on = !!(t && t.seasonal);

      veil.classList.toggle("on", on);
      veil.classList.toggle("theme-siji", on);
      document.documentElement.classList.toggle("theme-siji-on", on);
      if (!on) return null;

      const phase = seasonPhase(monthF);
      const w = seasonWeights(phase);

      // ① 背景四层：按比重设透明度，CSS 里带 1.4s 过渡，所以是滑过去的
      veil.querySelectorAll(".season-layer").forEach(el => {
        const i = SEASON_ORDER.indexOf(el.dataset.season);
        el.style.opacity = String(clampNum(w[i], 0, 1, 0).toFixed(3));
      });

      // ② 变量：在相邻两个季节之间插值
      const root = document.documentElement;
      const keys = Object.keys(SEASON_PALETTES.春.vars);
      const i0 = Math.floor(phase) % 4;
      const i1 = (i0 + 1) % 4;
      const k = phase - Math.floor(phase);
      const A = SEASON_PALETTES[SEASON_ORDER[i0]].vars;
      const B = SEASON_PALETTES[SEASON_ORDER[i1]].vars;
      keys.forEach(key => {
        root.style.setProperty(key, mixVar(A[key], B[key], k));
      });

      // ③ 文案：显示当前占主导的那个季节
      const dom = SEASON_ORDER[w.indexOf(Math.max.apply(null, w))];
      return {phase: phase, weights: w, season: dom, pal: SEASON_PALETTES[dom]};
    }

    /* 当前应该用哪个月份（带小数）：
     * 进了游戏用校历月份 + 当月第几周，没进游戏用真实日期 */
    function seasonMonthNow() {
      if (typeof S !== "undefined" && S && !S.over && typeof weekInfo === "function") {
        const wi = weekInfo(num(S.week, 0), num(S.term, 0));
        const per = Math.max(1, Math.ceil(num(typeof WEEKS_PER_TERM !== "undefined" ? WEEKS_PER_TERM : 20, 20) / 5));
        const frac = (clampNum(wi.weekOfMonth, 1, per, 1) - 1) / per;
        return clampNum(wi.month, 1, 12, 9) + frac;
      }
      return new Date().getMonth() + 1;
    }

    /* 对外：季节变了就调一下（每周开始、读档、切主题时都会调） */
    let SEASON_NOW = null;
    let SEASON_DOM = "";

    function refreshSeason(silent) {
      const prev = SEASON_DOM;
      SEASON_NOW = applySeason(seasonMonthNow(), silent);
      SEASON_DOM = (SEASON_NOW && SEASON_NOW.season) || "";
      /* 主导季换了一季（比如夏走到秋）→ 主菜单的主题卡文案跟着换。
       * 只在真的换季时重刷，不然每周都要重画一次 DOM。 */
      if (SEASON_DOM && SEASON_DOM !== prev && typeof renderStartExtras === "function") {
        try {renderStartExtras();} catch (e) { }
      }
      return SEASON_NOW;
    }

    /* 当前季节快照（没有就现算一次） */
    function seasonNow() {
      if (SEASON_NOW) return SEASON_NOW;
      const p = seasonPhase(seasonMonthNow());
      const w = seasonWeights(p);
      const dom = SEASON_ORDER[w.indexOf(Math.max.apply(null, w))];
      return {phase: p, weights: w, season: dom, pal: SEASON_PALETTES[dom]};
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
      /* 渐变支持多层：bgGrad 可以是字符串（一层）或数组（多层）。
       * 多层由 CSS 依次叠加，做出星云、晨雾这类效果。
       * 顺序：数组里靠后的画在下面（先写的盖在上面）。 */
      const grads = Array.isArray(t.bgGrad) ? t.bgGrad : (t.bgGrad ? [t.bgGrad] : []);
      for (let i = 1; i <= 3; i++) {
        root.style.setProperty("--bg-grad-" + i, grads[i - 1] || "none");
      }
      root.style.setProperty("--bg-grad", grads.join(", ") || "none");
      root.style.setProperty("--bg-opacity", String(t.bgOpacity == null ? 0.24 : t.bgOpacity));
      root.style.setProperty("--bg-overlay", (v["--bg-overlay"] || "rgba(18, 10, 24, .82)"));
      /* 呼吸周期：每套主题自己定，深远的主题慢、轻快的主题快 */
      root.style.setProperty("--breath-dur", String(num(t.breath, 12)) + "s");

      /* 四季主题：切成它（或离开它）时，季节层要跟着开关 */
      if (typeof refreshSeason === "function") refreshSeason(true);

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
      if (!silent && typeof toast === "function") {
        /* 四季：提示带上当前季节，比如「四季 · 🍂秋」 */
        let nm = T(t.name);
        if (t.seasonal && typeof seasonNow === "function") {
          const cur = seasonNow();
          if (cur && cur.pal) nm = T(t.name) + " · " + cur.pal.icon + T(cur.pal.name);
        }
        toast(L("toast.theme", nm));
      }
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
      // 兼容旧版单独存的 key
      if (!d) d = {};
      if (!d.theme) {try {d.theme = localStorage.getItem("htzx_theme") || "";} catch (e) { }}
      if (!THEME_MAP[d.theme]) d.theme = (typeof GAME_CONFIG !== "undefined" && GAME_CONFIG.themeId) || THEME_DEFAULT_ID;
      applyThemeSkin(d.theme);
      return d;
    }

    /* 本地设置现在只存主题一项。
     * 以前这里还存 lang（语言），英语模式下线后不再需要 ——
     * 但字段结构保留成对象，将来加回语言时不用改存储格式。 */
    function saveSettings() {
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify({theme: THEME_CUR}));
      } catch (e) { }
    }

    /* ==================================================================
     * 主题选择界面（主菜单 + 弹窗）
     * ================================================================== */
    function themeChipHtml() {
      return THEME_SKINS.map(t => {
        const v = t.vars || {};
        const on = t.id === THEME_CUR;
        /* 四季：卡上显示当前季节的名字与那一季的文案 */
        let nm = T(t.name), tag = T(t.tagline), poem = T(t.poem);
        let c1 = v["--brand-lite"], c2 = v["--purple"], c3 = v["--gold"];
        if (t.seasonal) {
          const cur = (typeof seasonNow === "function") ? seasonNow() : null;
          const pal = cur ? cur.pal : null;
          if (pal) {
            nm = T(t.name) + " · " + pal.icon + T(pal.name);
            tag = T(pal.tagline);
            poem = T(t.poem) + "　|　" + T(pal.poem);
            c1 = pal.vars["--brand-lite"]; c2 = pal.vars["--purple"]; c3 = pal.vars["--gold"];
          }
        }
        return `<button class="themechip${on ? " on" : ""}" onclick="setTheme('${t.id}')"
          title="${poem}"
          style="--c1:${c1};--c2:${c2};--c3:${c3}">
          <span class="tcdot"></span>
          <span class="tcname">${nm}</span>
          <span class="tctag">${tag}</span>
        </button>`;
      }).join("");
    }

    /* 游戏说明的折叠开关 */
    const ABOUT_KEY = "htzx_about_open";

    function initAboutToggle() {
      const ab = document.getElementById("aboutBody");
      const btn = document.getElementById("btnAboutToggle");
      if (!ab || !btn) return;
      let open = true;
      try {
        const saved = localStorage.getItem(ABOUT_KEY);
        if (saved === "0") open = false;
        else if (saved === "1") open = true;
        else open = window.innerHeight > 680;    // 没存过 → 矮屏默认收起
      } catch (e) {open = window.innerHeight > 680;}

      /* ★ 每次都重新取按钮节点。
       * 重渲染会用 cloneNode 换掉按钮，闭包里存着旧节点的话，
       * 文字就永远改不动 —— 点一下状态变了、字没变，看着像没反应。 */
      const apply = () => {
        ab.classList.toggle("collapsed", !open);
        const b2 = document.getElementById("btnAboutToggle");
        if (!b2) return;
        /* 文案：展开时按钮写「收起」，收起时写「展开」。
         * 箭头由 CSS 跟着 .is-open 转，这里只管文字与无障碍属性。 */
        const txt = open ? L("about.fold") : L("about.unfold");
        const lbl = open ? L("about.foldTip") : L("about.unfoldTip");
        b2.innerHTML = `<i class="chev" aria-hidden="true"></i><span>${txt}</span>`;
        b2.classList.toggle("is-open", !!open);
        b2.setAttribute("aria-expanded", open ? "true" : "false");
        b2.setAttribute("aria-label", lbl);
        b2.title = lbl;
      };
      /* 重渲染会重建按钮，先解绑再绑，避免点一次触发两次 */
      const fresh = btn.cloneNode(true);
      btn.parentNode.replaceChild(fresh, btn);
      fresh.onclick = () => {
        open = !open;
        try {localStorage.setItem(ABOUT_KEY, open ? "1" : "0");} catch (e) {}
        apply();
      };
      apply();
    }

    function renderStartExtras() {
      const box = document.getElementById("themeList");
      if (box) box.innerHTML = themeChipHtml();
      const hint = document.getElementById("themeHint");
      if (hint) hint.textContent = L("menu.themeHint");
      const tl = document.getElementById("themeLabel");
      if (tl) tl.textContent = L("menu.theme");
      const ml = document.getElementById("moreLabel");
      if (ml) ml.textContent = L("menu.more");
      const sl = document.getElementById("slotsLabel");
      if (sl) sl.textContent = L("menu.slots");
      const al = document.getElementById("aboutLabel");
      if (al) al.textContent = L("menu.about");
      const ab = document.getElementById("aboutBody");
      if (ab) ab.innerHTML = L("about.body");
      /* 「游戏说明」的展开 / 收起
       * 屏高不足 680 时默认收起（省地方），但按钮一直在 —— 点一下就能看。
       * 记住玩家的选择，下次进来保持上一次的状态。 */
      initAboutToggle();
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
