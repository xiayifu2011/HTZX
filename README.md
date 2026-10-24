# 中考人生模拟器 · 红塔中学版

**当前版本：v1.0（正式版）** —— 更新日志见 docs/changelog.md，审核清单见 docs/REVIEW.md。

玉溪市红塔中学（玉溪一中附属中学）社团开发项目。

一款"初中三年"主题的网页文字养成游戏。学生扮演一名**红塔少年**，
从初一走到中考，每周做一次选择，每次选择后触发随机事件，最终影响中考成绩与结局。

> 校训「**人生在立，行达天下**」　|　登上「**立行号**」，每一步都算数

**核心设计**：天赋不是开局送的，而是在一次次选择中长出来的；
负面天赋（厌学、网瘾、拖延症等）都可以通过坚持行动"破茧"消除。

---

## 时间与社团

- **校历时间**：9月开学→次年1月，2月开学→6月，分春 🌸 夏 🌞 秋 🍂 冬 ❄️ 四季
- **一周两时段**：🏫 周中（住校）→ 🏠 周末（回家），按先后顺序推进，不会倒流
- **时段数量动态**：上周埋了后续伏笔，下周对应时段会自动延长
- **13 个社团**（国画/黏土/花灯/合唱/朗诵/话剧/英语播音配音/篮球/啦啦操/乒乓球/围棋/摄影/编程）
- **社团活动只在周三**：时段顺序为 周中 → 周三社团课 → 周末
- **抢社团**：每学年上学期第 3~5 周，窗口只弹一次，抢不上这一年就没社团
- 事件可按 `slot`（时段）、`season`（季节）、`months`（月份）限定出现时机
- 事件分布有开关：`dist: uniform` 均匀 / `decay` 衰减 / `front` 前期 / `back` 后期

## 游戏规则要点

- **手机**：红塔中学对手机零容忍。自习课玩手机 85% 被抓，宿舍藏手机 75% 被搜出，
  后果包括没收、请家长、取消评优、学习减益数周。**自律会有正向回报**。
- **家庭**：不打零工，改成向父母要零花钱。金额随亲情浮动，亲情靠家庭事件维护。
- **读书**：图书角只解锁**正面**天赋；若无正面天赋可解锁，改为给悟性。
- **体育艺术节**：一年一次，上学期第 8 周（约 10~11 月、期中考前）。
- **图书角**：学校没有图书馆，游戏里是教室后墙的班级图书角。

---

## 文件名说明

**所有文件名都是英文**，这样在任何电脑、任何解压软件下都不会出现乱码。
（Windows 自带的解压工具对中文文件名支持不好，会显示成乱码。）

v1.1 起：启动脚本（`.bat`）的内容也改成了纯 ASCII 英文输出，
根目录下不会再出现「鍚姩娓告垙.bat」这类乱码文件。
`history/` 里保留着早期 C++ 版本的存档，文件名仍是中文，不影响游戏本体。

| 文件名 | 作用 |
|---|---|
| `start-game.bat` | 双击启动游戏（Windows） |
| `start-game.command` | 双击启动游戏（Mac） |
| `start-server.bat` | 局域网展示服务器（Windows） |
| `index.html` | 游戏本体，双击也能直接玩 |
| `game.html` | 打包好的单文件版，可单独发给别人 |
| `tools/check.bat` | 内容体检，改完内容双击跑一下 |
| `docs/ARCHITECTURE.md` | 文件大纲：每个文件干什么 |
| `docs/CUSTOMIZE.md` | **完全自定义手册**：所有能改的东西、去哪改、怎么改 |（最常用）

| `docs/CONTENT_GUIDE.md` | 内容编写教程（不会编程也能写） |
| `docs/REVIEW.md` | 审核清单（给老师看） |
| `docs/guide.md` | 新手介绍（玩家看，游戏内可打开） |
| `docs/changelog.md` | 更新日志 |
| `docs/credits.md` | 鸣谢列表 |
| `tools/sync-docs.bat` | 把上面三个 .md 同步进游戏（双击运行） |

> 如果 zip 解压后仍出现乱码，请用 7-Zip 或 Bandizip 解压，
> 不要用 Windows 资源管理器自带的解压功能。

---

## 三种打开方式

### 1. 双击即玩（最简单）

双击 `index.html`，浏览器打开就能玩。**不需要联网、不需要安装任何东西。**

### 2. 一键启动

- Windows：双击 `start-game.bat`
- Mac：双击 `start-game.command`

### 3. 全校展示 / 局域网

双击 `start-server.bat`，同 WiFi 下的手机和电脑都能访问（需要装 Python）。

### 4. 放到网上（GitHub Pages）

```bash
git init
git add .
git commit -m "初始化项目"
git remote add origin 你的仓库地址
git push -u origin main
```
然后到仓库 Settings → Pages → Source 选 `main` 分支 → 根目录 → Save，
两分钟后得到一个公开网址，扫码即玩。

### 附：给老师审核的单文件版

运行 `node tools/make-single.js` 会生成 `game.html`（约 170 KB），
**一个文件就包含全部内容**，可以微信直接发、U 盘拷走，双击即玩。

---

## 目录说明

```
zhongkao-life/
├─ index.html        页面骨架
├─ css/              外观（四层，见 docs/ARCHITECTURE.md）
├─ js/               逻辑（19 个文件，按数字顺序加载）
├─ docs/
│   ├─ ARCHITECTURE.md    文件大纲：每个文件干什么
│   ├─ CONTENT_GUIDE.md   内容编写教程（不会编程也能写）
│   └─ REVIEW.md          审核清单（给老师看）
├─ tools/
│   ├─ check-content.js   内容体检（改完跑一下）
│   ├─ make-single.js     打包成单文件
│   └─ check.bat               体检的双击版
└─ assets/           图片（校徽、背景、事件配图）
```

**不知道改哪个文件？** 看 `docs/ARCHITECTURE.md`。
**想加内容但不会编程？** 看 `docs/CONTENT_GUIDE.md`。

---

## 学校特色（已完成）

已填入 `js/02-config.js`：校名、校训、立行文化四立、立行号、主题色清华紫。

```js
school: {
  name: "玉溪市红塔中学", subName: "玉溪一中附属中学",
  motto: "人生在立，行达天下",
  studentName: "红塔少年",
  culture: ["立德", "立志", "立学", "立身"],
  slogan: "每一步 都算数", train: "立行号",
},
theme: {
  bgImage: "assets/bg.jpg",       // 主背景
  bgImageAlt: "assets/bg2.jpg",   // 假期背景
  bgImageEnd: "assets/bg_end.jpg",// 结局背景
  accent: "#660874",              // 清华紫
}
```

**学校专属事件 15 条**在 `js/08-data-events-school.js`：
立行号、校训墙、叠被子大赛、宿舍熄灯后、内务检查、
花灯社团研学、《聂耳》花灯剧、社团招新、竞赛选拔、
体育艺术文化节、家校团建、秋日林荫道、图书馆闭馆、期末复誓、红色教学楼黄昏。

单独存放，将来升级游戏本体不会覆盖。

### 关于图片

- 主题色：**清华紫 #660874**（另有群星 / 草原 / 晨曦 / 深海 / 素墨 / 花灯 六套可切换）
- **学校目前没有官方校徽，游戏不使用校徽图标**，只用校名与校训文字
- **v1.1 起暂不使用校园插画配图**，界面改用七套主题自带的渐变底色，不会白屏。
  想恢复：把 `js/02-config.js` 里的 `usePhotos` 改回 `true`，图片放回 `assets/` 即可。
  恢复时请注意：背景应为校园实景的**扁平矢量插画风格艺术化重绘**，
  不含真实人物、不出现校服与肖像

---

## 常用调整

| 想改什么 | 改哪里 |
|---|---|
| 学习难度（收益/遗忘/考试/压力） | `js/02-config.js` → `study`（四个系数，全改回 1 就是旧版） |
| 屏幕情绪特效（红雾 / 灰暗） | `js/02-config.js` → `mood`（`enabled: false` 全关） |
| 属性档位文案 | `js/01b-i18n.js` → `level.vlow / low / mid / high / vhigh` |
| 哪些属性可见 / 模糊 | `js/01-utils.js` → `PROP_HUD` / `PROP_HIDDEN` / `PROP_BLUR` |
| 运动锻炼的事件 | `js/05c-data-sport.js`（id 以 `sp_` 开头，只有运动能抽到） |
| 做题题库 | `js/05d-data-quiz.js` → `QUIZ_BANK`（按科目 + 年级加题） |
| 天赋退化（久不练习会失去） | `js/12-data-cures.js` → `TALENT_DECAY` |
| 开局可选的时间跨度 | `js/02-config.js` → `TERM_PLAN` |
| 亲情逻辑与家长称呼 | `js/03c-family.js` |
| 主题配色与文案 | `js/02c-themes.js` → `THEME_SKINS` |
| 手机违规的惩罚力度 | `js/07-data-events.js` → `phone`、`phone_check` |
| 向父母要零花钱的金额 | `js/15-engine-study.js` → `allowanceSettle()` |
| 亲情回落速度 | `js/02-config.js` → `family.weeklyDrop`（现为 0.35 概率、每次 -2） |
| 体艺节出现在第几周 | `js/09-data-fixed.js` → `SPORTS_FEST_WEEK`（现为 8） |
| 读书角能抽到哪些天赋 | `js/06-data-books.js` → `BAD_TALENTS`、`pickGoodTalent()` |
| 界面紧凑程度 | `css/02-components.css` → 「界面瘦身」那一段 |
| 要不要滚动条 | `js/02-config.js` → `ui.hideScrollbar`（false = 显示滚动条） |
| 一周几个时段 | `js/02-config.js` → `week.slots` |
| 事件默认分布方式 | `js/02-config.js` → `eventDist` |
| 社团与社团事件 | `js/05b-data-clubs.js` |
| 月份怎么映射到学期 | `js/02b-time.js` → `TERM_MONTHS` |
| 新手介绍/更新日志/鸣谢 | `docs/guide.md` / `changelog.md` / `credits.md`，改完跑 `tools/sync-docs.bat` |
| 学力涨不动（衰减太快） | 衰减只应发生在周结算；如发现每次行动也衰减，是重复计算，见 js/15-engine-study.js 的 studySettle() |
| 一局太长 | `js/02-config.js` → `actionsPerWeek` 调小 |
| 事件太多 | `js/02-config.js` → `chainChance` 调小（如 `[0.2, 0.1]`） |
| 太难/太容易 | `js/02-config.js` → `difficulty`（`story` 剧情 / `normal` 标准 / `hard` 硬核） |
| 分数不好看 | `js/15-engine-study.js` → `exam()` 里的公式 |
| 加事件 | `js/08-data-events-school.js`（推荐）或 `js/07-data-events.js` |
| 加天赋 | `js/03-data-talents.js` |
| 改颜色 | `css/01-base.css` 顶部的 `:root` 变量 |

---

## 改完内容记得体检

```bash
cd tools
node check-content.js
```
（或双击 `tools/check.bat`）

会用中文提示哪里写错，看到"全部通过"就可以提交了。

---

## 玩法规则速览

- 七项主属性：心态、经济、健康、效率、悟性、社交、压力（0~150）
- **亲情**（第八项，0~150）：不在主属性栏显示，只在家庭事件与要零花钱时生效
- 每周 1~2 次「本周行动」：学习 / 休息 / 社交 / 娱乐 / **向父母要零花钱** / 图书角
- 每次行动后跟 1 个随机事件，可能连锁最多 2 个
- 固定日程：开学、月考×2、期中、期末、运动会/艺术节、假期副本
- 小卖铺、读书角、天赋图鉴、成就属于**自由操作**，不占用行动次数
- 3 个本地存档槽，自动保存

---

## 给 AI 提需求的正确姿势

❌ "帮我改一下游戏" → AI 要读全部代码，慢且容易出错

✅ "改 `js/08-data-events-school.js`，末尾加 3 条社团招新事件"
✅ "改 `js/02-config.js`，把每周行动次数改成 1"
✅ "改 `js/12-data-cures.js`，把厌学的消除次数从 12 改成 8"

**指定文件名，AI 只读一个小文件，又快又准，还省钱。**

---

## 技术说明

- 纯静态网页：HTML + CSS + 原生 JavaScript，**无任何依赖、无构建步骤**
- 数据保存在浏览器 localStorage，不联网、不采集信息
- 所有数值经过边界处理，不会出现 NaN
