# 交接手册 · 中考人生模拟器（红塔中学版）

给下一个接手代码的 AI / 同学看的。读完这份，你应该能在 10 分钟内定位到要改的文件。

> 基准版本：GitHub `xiayifu2011/HTZX` main 分支（2026-10-18 最后一次上传）。
> 本地工作副本在 `HTZX-main/`，在基准之上做过一批 v1.2 改动（见文末「当前改动状态」）。

---

## 一句话概览

纯静态网页游戏，无框架、无构建、无联网。学生扮演红塔少年，从初一走到中考，每周做 1~2 次选择，每次选择后触发随机事件，最终影响中考分数与结局。

打开方式：双击 `index.html` 就能玩。技术栈是 HTML + CSS + 原生 JS，数据存 localStorage。

---

## 文件地图

### 加载顺序（index.html 里的顺序即依赖顺序，数字前缀就是层次）

| 前缀 | 层次 | 能不能常改 |
|---|---|---|
| `00` | 文档 / 工具 | 改 docs/*.md 后跑同步脚本 |
| `01` | 工具层（工具函数、文案集中层） | 一般不动 |
| `02` | 配置层（学校特色、主题、时间） | ★ 常改参数在这 |
| `03` | 天赋 / 家庭 / 屏幕情绪 | ★ 常改 |
| `04` | 科目表 | 很少改 |
| `05` | 数据层（商店、图书、事件、社团、题库、假期） | ★★ 最常改 |
| `06`~`12` | 更多数据（书目、成就、结局、破茧） | ★ 常改 |
| `13`~`16` | 引擎层（效果解释、天赋、学习、流程） | 一般不动 |
| `17`~`19` | UI / 存档 / 启动 | 一般不动 |

### 逐个文件

**骨架**
- `index.html` —— 页面骨架 + 脚本加载顺序。顶栏、属性栏、行动面板、日志区都在这里
- `game.html` —— 打包好的单文件版（由 `tools/make-single.js` 生成）

**CSS（四层，按顺序覆盖）**
- `css/01-base.css` —— 变量、根字号自适应、基础排版（**改颜色主要在这**）
- `css/02-components.css` —— 卡片、按钮、属性栏、日志（712 行，最大的一个）
- `css/03-modal.css` —— 弹窗系统
- `css/04-theme.css` —— 八套主题的渐变与呼吸光晕
- `css/05-mood.css` —— 屏幕情绪特效（压力红雾 / 心态灰暗 / 健康发虚 / 经济见底）

**JS 逐文件**

| 文件 | 行数 | 干什么 |
|---|---|---|
| `00-docs.js` | 21 | 打包进游戏的文档（由 sync-docs 生成，**不要手改**） |
| `00b-docs-live.js` | 252 | 浏览器端 Markdown 渲染 + 实时更新 |
| `01-utils.js` | 226 | `rnd` `clamp` `num` `luckyRoll` `modProp` `say` `toast` … |
| `01b-i18n.js` | 498 | 文案集中层 `L("key")`（英语模式已下线，接口保留） |
| `02-config.js` | 328 | ★ 学校特色、难度、学期跨度、行动次数、UI 开关 |
| `02c-themes.js` | 419 | ★ 八套主题（配色 + 文案 + 渐变 + 呼吸周期） |
| `02b-time.js` | 162 | 校历 time：月份 / 季节 / 时段 |
| `03-data-talents.js` | 116 | ★ 天赋表 + `FAMILY_TALENTS`（出身类，读书不给） |
| `03c-family.js` | 199 | 亲情、家长称呼、`parentCall()` |
| `03b-mood.js` | 131 | 屏幕情绪特效的判定与挂载 |
| `04-data-subjects.js` | 25 | 各年级科目表（初三没生物地理、初一没物理化学） |
| `05-data-shop.js` | 30 | 小卖铺 |
| `06-data-books.js` | 161 | ★ 图书角书目 |
| `07-data-events.js` | 343 | ★ 通用随机事件 |
| `08-data-events-school.js` | 354 | ★ 红塔中学专属事件（**推荐新事件写这里**） |
| `05c-data-sport.js` | 134 | 运动事件链（「运动锻炼」行动触发） |
| `05d-data-quiz.js` | 462 | ★ 题库（205 题） |
| `05e-data-vacation.js` | 707 | ★ 寒暑假事件（5 套 × 12 条） |
| `05b-data-clubs.js` | 609 | ★ 13 个社团 + 社团事件 |
| `09-data-fixed.js` | 189 | ★ 固定日程表 + `WEEKS_PER_TERM` |
| `10-data-achievements.js` | 51 | 成就 |
| `11-data-endings.js` | 37 | 结局 |
| `12-data-cures.js` | 269 | 破茧（负面天赋消除 + 正面天赋退化） |
| `13-engine-effects.js` | 145 | 中文指令解释器（**写事件必读**） |
| `14-engine-talent.js` | 77 | 天赋增删查 |
| `15-engine-study.js` | 568 | 学习、考试、中考公式、存档初始化 |
| `16-flow.js` | 742 | ★ 主流程：周推进、事件抽取、选项执行 |
| `17-ui.js` | 547 | 渲染 HUD、属性栏、弹窗内容 |
| `18-save.js` | 260 | 存档、`NAME_POOL`、`BANNED_NAMES`（彩蛋） |
| `19-boot.js` | 23 | 启动入口，最后一个加载 |

**tools/**
- `check-content.js` —— 内容体检，改完必跑
- `make-single.js` —— 打包成 `game.html`
- `sync-docs.js` —— 把 `docs/*.md` 同步进 `js/00-docs.js`

**docs/**
- `guide.md` / `changelog.md` / `credits.md` —— 玩家能看到的三个文档
- `ARCHITECTURE.md` / `CONTENT_GUIDE.md` / `CUSTOMIZE.md` / `REVIEW.md` —— 开发者文档
- `THEME_ROADMAP.md` —— 主题系统优化方向（P0/P1/P2）

---

## 核心数据结构

### 全局状态 `S`（一个全局对象，所有函数直接读写）

```
S.week        全局周（0 起，0~119）
S.term        学期（0=初一上 … 5=初三下）
S.prop        属性对象：心态 经济 健康 效率 悟性 社交 压力 亲情
S.subj        各科分数对象
S.slot        当前时段：weekday / clubday / weekend
S.slotPlan    本周时段序列（动态，可能多于 2 个）
S.club        社团 id
S.flags       标记（如 hasPhone）
S.pending     挂起的后续事件
S.chainQueue  连锁事件队列
S.cure        破茧进度
S.vac         假期状态（假期期间才有）
```

### 属性

| 属性 | 显示 | 说明 |
|---|---|---|
| 心态 / 健康 / 压力 | 档位（极低~极高） | 模糊化，不显示数字 |
| 经济 | 数字 | 唯一显示数字的 |
| 效率 / 悟性 / 社交 / 亲情 | 不显示 | 后台实时计算 |

### 事件

```js
{
  id: "rain",           // 唯一
  w: 6,                 // 权重（0 = 不走随机池）
  slot: "weekend",      // weekday / clubday / weekend，或数组
  season: "秋",          // 可选
  months: [9, 10],      // 可选
  minTerm: 0, maxTerm: 5, // 可选
  minGap: 4,            // 最小间隔
  dist: "uniform",      // uniform / decay / front / back
  once: true,           // 一生一次
  maxTimes: 3,
  t: "标题", c: "正文",
  opts: [
    {t: "选项文字",
     cond: S => ...,              // 出现条件
     run: ["心态 +6", "健康 -3"],   // 中文指令（推荐）
     run: S => {...},             // 或函数
     branch: [...],               // 条件分支
     next: "后续事件id",           // 连锁
     raise: {id, weeks, mult},    // 挂起（几周内提高概率）
     flag: "xxx"}                 // 打标记
  ]
}
```

**写事件用中文指令，不用会 JS。** 支持的指令全集在 `js/13-engine-effects.js` 文件头：
`属性 ±N` / `学力 数学 +25` / `学力 最弱 +60` / `全科 +12%` / `计数 运动` / `天赋 xxx` / `概率 0.35 天赋 豪` / `提示 文案!good` / `学习加成 +20% 2周`

### 时间系统

```
一学期 20 周，六学期共 120 周
weekInTerm() = (S.week % 20) + 1   → 1~20
wit 1=开学  5=月考一  8=体艺节(上学期)  11=期中  15=月考二  17=艺术节(下学期)  19=期末  20=假期
```

**寒暑假是独立阶段，不占周数。** 第 20 周结束 → 进假期（`S.vac`）→ 假期跑完 → `S.term++` → 周数接着往上数。假期期间顶栏不显示「第 N 周」，改显「❄️ 寒假 / 🌞 暑假」。

### 主题

八套：`hongta` 清华紫（默认）/ `stars` 群星 / `grassland` 草原 / `dawn` 晨曦 / `abyss` 深海 / `ink` 素墨 / `lantern` 花灯 / `wind` 风。

每套 = 一组 CSS 变量 + `bgGrad` 多层渐变 + `breath` 呼吸周期（8~16 秒）+ 一句 tagline。切换写在 `localStorage`。

---

## 改东西去哪改（速查表）

| 想改什么 | 改哪里 |
|---|---|
| 加事件 | `js/08-data-events-school.js`（推荐）或 `js/07-data-events.js` |
| 加社团事件 | `js/05b-data-clubs.js` |
| 加假期事件 | `js/05e-data-vacation.js` |
| 加题目 | `js/05d-data-quiz.js`（注意 `g` 字段是年级 0/1/2） |
| 加天赋 | `js/03-data-talents.js` |
| 加书目 | `js/06-data-books.js` |
| 改学校信息 | `js/02-config.js` → `school` |
| 改难度 / 行动次数 | `js/02-config.js` → `difficulty` / `actionsPerWeek` |
| 改主题配色 | `js/02c-themes.js` |
| 改基础颜色 | `css/01-base.css` 顶部 `:root` |
| 改每学期周数 | `js/09-data-fixed.js` → `WEEKS_PER_TERM` |
| 改体艺节在第几周 | `js/09-data-fixed.js` → `SPORTS_FEST_WEEK` |
| 改中考公式 | `js/15-engine-study.js` → `exam()` |
| 改界面文案 | `js/01b-i18n.js` 的 `I18N.zh`（走 `L("key")`） |
| 改玩家看的文档 | `docs/*.md`，改完跑 `node tools/sync-docs.js` |
| 改彩蛋名字 | `js/18-save.js` → `BANNED_NAMES` |

---

## 必知的坑

1. **不要手改 `js/00-docs.js`** —— 它是生成的，改了会被 `sync-docs.js` 覆盖。

2. **弹窗正文不要整体 `pre-wrap`** —— v1.1.1 踩过：HTML 模板字符串的缩进换行被渲染成真实空行，弹窗被拉长一倍。现在默认 normal，需要保留换行的地方单独声明。

3. **换行转 `<br>` 要用 `nl2br()`** —— 直接 `\n → <br>` 会破坏 HTML 标签内部结构，导致 `style="..."` 这类属性内容泄漏到页面上（v1.1.2 修过）。

4. **事件的 `slot` 必须符合逻辑** —— 住校（weekday）没有手机，家里（weekend）才可能刷手机；社团只在 `clubday`。体检查这个。

5. **题目的 `g` 字段** —— 生物地理只到初二（g≤1），物理从初二开始，化学只有初三。标错年级会变成永远抽不到的死题，体检脚本会报。

6. **`S.week` 从 0 起** —— 玩家看到的是 `S.week + 1`。写日志/HUD 时注意 +1。

7. **开学不占周** —— v1.2 改的。以前开学弹窗关掉直接 `nextWeek()`，白吃掉一整周。现在靠 `S.fixedDone` 标记，关掉弹窗后照常进本周行动。

8. **`js/01b-i18n.js` 的英语接口保留着** —— 页面上没有切换按钮，`I18N` 只有 `zh` 一张表，`LANG` 是 `const "zh"`。将来要恢复英语模式：加回 `en` 表 + 把 `LANG` 改回 `let` + 加切换函数，276 处 `L()` 调用一行都不用动。

9. **改完必须跑体检** —— `cd tools && node check-content.js`。它会查：天赋引用是否存在、时段季节是否合法、死题、成就有没有人计数、条件分支里的指令错别字。

10. **文件名全英文** —— 这是硬要求。Windows 自带解压对中文名会乱码。

---

## 常用命令

```bash
cd tools
node check-content.js      # 内容体检，会用中文报哪里写错
node make-single.js        # 打包成 game.html
node sync-docs.js          # 把 docs/*.md 同步进游戏
```

浏览器验收（有 Playwright 时）：开 `index.html`，用 `newGameAt(0)` 建号，靠点击 `#actionPanel button` 推进周数，用 `#modalMask` 判断有没有弹窗。

---

## 当前改动状态（v1.2，本地副本相对 GitHub）

**已完成**
- 英语模式整块下线（按钮已删、英文表已删、接口保留）
- 彩蛋名字屏蔽：`xyf` / `xiayifu` / `夏毅夫` / `夏if`（不分大小写）
- 每学期 20 周，三年 120 周；开学不占周
- 寒暑假独立成阶段，不占周数，5 个假期各 12 条事件
- 八套主题重做（新增「风」），多层渐变 + 呼吸光晕
- 题库 136 → 205 题，修掉抽到超纲题的兜底
- 事件逻辑修正：抢社团场景改到家里（手机零容忍）、初三不再遇到「初三的学长」
- 社团事件扩充：13 个社团各加 2 条

**v1.2 收尾已完成**

- `js/05b-data-clubs.js` 编程社的新事件已补上，13 个社团各 4 条、共 52 条
- 全套回归体检通过（`node tools/check-content.js` →「全部通过」）
- `docs/changelog.md` 写入 v1.2 条目，`docs/guide.md` 的周数改为 120 周
- `game.html` 已重新生成（577.8 KB），与 index.html 双双验收通过

**审查过程中发现并修掉的问题**

1. `defOf()` 只取 `ev.c` 原值，不支持函数 —— 导致「按年级变化的正文」写不出来
   （对象字面量里的三元表达式在文件加载时就求值，那时 `S` 还不存在）。
   已给引擎加上 `t` / `c` 的函数支持，向后兼容。
2. `bully`（楼梯拐角）里是「高年级学生」，但没限制年级 —— 初三玩家会遇到
   比自己更高年级的人。已加 `maxTerm: 3`，只在初一初二出现。
3. 社团事件原先每个社团只有 2 条，一学期约 18 次社团课会导致同一条出现 9 次。
   扩到 4 条后降到 4.5 次。

**v1.2 反馈类修正**

- 游戏说明与创角界面的周数从 150 改成 120（之前只改了 `docs/guide.md`，
  `js/01b-i18n.js` 里的 `about.body` 和 `cc.plan.fullSub` 漏了）
- 成就即时解锁：`exam()` 里算出分数就立刻判定，不再等下一次行动。
  以前「初露锋芒 · 第一次参加月考」要拖到下一周才跳出来
- `nextWeek()` 开头加了成就兜底判定，固定日程（体艺节、艺术节）达成条件的成就
  也会在本周结束时就解锁
- 获得天赋后立即 `renderHUD()`，新天赋马上出现在左侧面板（以前要等下次渲染）
- 主题文案只保留前半句，完整句仍在 `poem` 字段（鼠标悬停可见）

**v1.3 中考结算重制**

- 新增常量（都在 `js/04-data-subjects.js`）：
  `SUBJ_FULL`（物化生卷面 90、其余 100）、`ZK_WEIGHT`（中考折算权重）、
  `CHINESE_KNEE/SLOPE`（语文 87 分以上 2.5 倍学力）、
  `HK_SUBJECTS`、`EXP_SUBJECTS`、`toPaperScore()`
- 新增固定日程（`js/09-data-fixed.js` 的 `fixedEventOf`）：
  term3/wit14 生物实验、term5/wit14 物化实验、term3/wit19 生地会考、term5/wit19 中考
- 新增函数：`runExpExam()`（含补考分支）、`runHuiKao()`（成绩锁进 `S.hk`）
- `zhongkao()` 重写（`js/16-flow.js`）：卷面 + 实验 → ×权重 → 总分 530，
  并弹出可展开的成绩单
- 学习代价写在 `GAME_CONFIG.study.studyCost`，在 `studySettle()` 里生效
- 社团开课频率：`js/02b-time.js` 的 `clubWeekOn()`（按周号确定性哈希，
  默认约一半的周有社团课，配置在 `GAME_CONFIG.week.clubRate`）
- 「不去社团」：置 `S.clubOff`，`eventAllowed()` 里跳过所有 `cl_` 开头的事件

**v1.3 假期旅游 + 节假日**

- 新文件 `js/05f-data-travel.js`：景点表 `TRAVEL_SPOTS`（省内 8 / 全国 10）、
  线路表 `TRAVEL_ROUTES`、`offerTravel()` / `openTravelMap()` / `runTravelStops()`
- 地图样式在 `css/03-modal.css` 末尾（`.travel-map` / `.spot-dot`），
  纯 CSS 渐变 + 百分比定位，不依赖任何图片
- `showPopup()` 新增两个能力（`js/17-ui.js`）：
  `afterRender`（画完之后再回调，地图靠它挂点击事件）、
  选项带 `id` 时按 id 挂到按钮上。**顺序不能反** —— 先挂 id 再 afterRender，
  否则 afterRender 里按 id 取按钮取不到，禁用状态设不上
- 节假日：`js/02b-time.js` 的 `HOLIDAYS` 表 + `holidayOf(week, term)`；
  事件在 `js/09-data-fixed.js` 的 `HOLIDAY_EVENTS` + `runHoliday()`
- 节假日判定按「校历月份 + 本学期第几周」，与 `TERM_MONTHS` 联动。
  **改校历（TERM_MONTHS 或 WEEKS_PER_TERM）后必须重新核对 HOLIDAYS 的 wit**
- 长假日占整周（`runHoliday` 结尾 `nextWeek()`），
  短假日不占周（结尾 `ensureActionPanel()`）
- 节假日避开了开学周和考试周（wit 1 / 5 / 11 / 15 / 19 / 20）

**v1.3 节假日短途旅游**

- `js/05f-data-travel.js` 新增 `openShortTrip(done, badge)`：省内、固定 1 站
- `openTravelMap(routeId, done, pickOverride)` 加了第三个参数，用来临时改「去几站」
- 开关写在 `js/09-data-fixed.js` 的 `HOLIDAY_EVENTS` 上：`allowTravel: true`。
  目前只有 `national`（国庆）开了。想给清明 / 劳动节也开，照抄这一行
- 钱低于 150 时选项不显示（免得点进去才发现去不起）
- 选了短途，跑完那一站就直接 `nextWeek()` —— 这一周被旅游占掉了

**v1.3 三处修正**

- **游戏说明**：`css/01-base.css` 里 `@media(max-height:680px)` 曾把
  `#startScreen #aboutBody` 直接 `display:none`。现在改成靠 `.collapsed`
  类折叠，标题右侧有「展开 / 收起」按钮（`js/02c-themes.js` 的 `initAboutToggle()`），
  选择记在 localStorage 的 `htzx_about_open`。
  ★ 坑：重渲染会用 `cloneNode` 换掉按钮，`apply()` 里必须重新取节点，
  否则状态变了、文字不动，看着像没反应。
- **物价**：`js/05-data-shop.js` 的 `price` 字段，整体下调约三成
- **社团续留**：`js/05b-data-clubs.js` 的 `buildClubGrabOpts()` 首项加
  「继续留在原社团」；`joinClub()` 改成只有换社团才清零 `clubCount`。
  ★ 设计前提：社团身份跨学年保留，续留不重抢

**v1.3 四季主题 + 说明按钮重写**

- 新增第 9 套主题 `siji`（四季），在 `THEME_SKINS` 里带 `seasonal: true`
- 四季配色在 `js/02c-themes.js` 的 `SEASON_PALETTES`（春/夏/秋/冬各一套完整 vars + grad）
- 核心函数（同文件）：
  `seasonPhase(monthF)` 连续季节进度、`seasonWeights(phase)` 四季比重、
  `mixHex/mixRgb/mixRgba/mixVar` 插值、`applySeason(monthF)` 应用、
  `seasonMonthNow()` 取当前带小数月份、`refreshSeason()` 对外入口
- 背景：JS 动态建 `#seasonVeil`（4 个 `.season-layer`），靠 opacity 交叉淡入。
  样式在 `css/04-theme.css` 末尾。变量过渡写在 `.theme-siji-on` 下
- 刷新时机：`renderHUD()`（`js/17-ui.js`）每次都调 —— 周推进了颜色就跟着走；
  切主题走 `applyThemeSkin()` 末尾
- ★ 设计前提：季节身份由「校历月份 + 当月第几周」算，改 `TERM_MONTHS` 或
  `WEEKS_PER_TERM` 后要重看一眼 `seasonPhase()` 的季心（现为 4/7/10/1 月）
- 「展开 / 收起」按钮：`js/02c-themes.js` 的 `initAboutToggle()`，
  箭头是 CSS 三角形 `.chev`，转向靠 `.is-open`。
  ★ 坑：按钮会被 `cloneNode` 换掉，`apply()` 里必须重新取节点

**v1.3 六处调整**

- **主题提亮**：八套主题的 `vars` 整体重写（背景 L 6~9% → 15~22%）。
  色相重排为 清华紫291 / 群星246 / 深海205 / 风175 / 草原112 / 素墨41 / 晨曦31 / 花灯348。
  相邻至少差 40°，或靠饱和度差区分（素墨只有 19% 饱和）。
  ★ 校验：改完跑一遍卡片对比度，正文需 ≥8、描边 ≥3（素墨描边曾只有 2.96）
- **体艺节主题**：`js/09-data-fixed.js` 的 `SPORTS_FEST_THEMES` +
  `sportsFestTheme(term)`，按 term 0/2/4 取 少年 / 行者 / 星辰大海
- **旅游**：景点 `cost` 下调约四成；`TRAVEL_ROUTES` 的 `minMoney` 改成按
  「该线路最便宜一站」动态算（`cheapestOf()`），不再写死。
  ★ 关键修复：`openTravelMap()` 里「出发」按钮的启用条件从
  `chosen.length !== want` 改成 `chosen.length < MIN_PICK`（MIN_PICK=1）——
  以前钱只够一站时按钮永远灰着，玩家卡死在地图上
- **四季提鲜**：`SEASON_PALETTES` 四季 vars 饱和度整体提高
- **事件数**：`GAME_CONFIG.chainChance` `[0.26, 0.10]`、`maxEventsPerWeek` 3、
  `sport.chainChance` `[0.52, 0.22]`
- **难度**：`GAME_CONFIG.start.difficulty` 默认 `hard`、`planId` 默认 `full`；
  新增 `GAME_CONFIG.difficultyTune`（三档各自的 gain/decay/exam/stress 系数），
  在 `studyCfg()` 里乘到基础值上。
  ★ 设计前提：以前难度只影响学习代价与保底线，主旋钮三档共用 —— 硬核名不副实

**两份备份****两份备份**
- `_bak_a/` —— v1.2 改动前的完整副本
- `_bak_c/` —— 社团事件扩充前的副本

---

## 上手建议

1. 先读 `js/02-config.js` 和 `js/16-flow.js`，一个是所有参数，一个是主流程
2. 加内容优先动 `05`~`08` 这几个数据文件，别碰引擎层
3. 写完跑体检，看到「全部通过」再提交
4. 不确定改哪个文件，看 `docs/ARCHITECTURE.md`
