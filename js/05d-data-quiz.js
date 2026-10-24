/* ==================================================================
 * 内容层 · 做题（本周行动）
 * ==================================================================
 * 消耗一次行动，随机出一道「当前年级 + 当前科目」范围内的题：
 *   选择题：四个选项，选对 → 本科目学力加成；选错 → 小幅倒扣
 *   填空题：手写一个答案，对/错的奖惩同上
 *
 * 加题很简单，往 QUIZ_BANK[科目] 里 push 一条即可，字段说明见下：
 *   g     最低年级（0=初一 1=初二 2=初三），不写就是全年级通用
 *   type  "choice" 选择题 | "fill" 填空题
 *   q     题干
 *   opts  选项数组（choice 必填，2~4 个，答案写哪个都行，脚本会自动打乱）
 *   ans   正确答案：choice 填选项文字，fill 填答案字符串
 *   why   答完显示的一句讲解（可留空）
 *
 * 填空题的判定：去空格、不分大小写、中英文括号与句号都算对。
 *
 * 维护等级：内容层（同学可以直接加题）
 * ================================================================== */

    const QUIZ_BANK = {
      语文: [
        {g: 0, type: "choice", q: "「床前明月光」的下一句是：", opts: ["疑是地上霜", "低头思故乡", "举头望明月", "霜叶红于二月花"], ans: "疑是地上霜", why: "李白《静夜思》"},
        {g: 0, type: "fill", q: "补全诗句：会当凌绝顶，______。", ans: "一览众山小", why: "杜甫《望岳》"},
        {g: 0, type: "choice", q: "下列成语书写正确的一项是：", opts: ["再接再励", "再接再厉", "在接再厉", "再接再历"], ans: "再接再厉", why: "「厉」通「砺」，磨砺之意"},
        {g: 1, type: "fill", q: "补全诗句：沉舟侧畔千帆过，______。", ans: "病树前头万木春", why: "刘禹锡《酬乐天扬州初逢席上见赠》"},
        {g: 1, type: "choice", q: "「先天下之忧而忧」出自：", opts: ["《岳阳楼记》", "《醉翁亭记》", "《桃花源记》", "《小石潭记》"], ans: "《岳阳楼记》", why: "范仲淹《岳阳楼记》"},
        {g: 2, type: "fill", q: "补全诗句：长风破浪会有时，______。", ans: "直挂云帆济沧海", why: "李白《行路难》"},
        {g: 2, type: "choice", q: "「人生自古谁无死」的下一句是：", opts: ["留取丹心照汗青", "留取丹心照汉青", "留得丹心照汗青", "留取真心照汗青"], ans: "留取丹心照汗青", why: "文天祥《过零丁洋》"},
        {g: 1, type: "choice", q: "「锲而不舍」的下一句是：", opts: ["金石可镂", "朽木不折", "金石可鉴", "朽木难雕"], ans: "金石可镂", why: "《荀子·劝学》"},
      ],
      数学: [
        {g: 0, type: "choice", q: "计算：(-3) × (-4) + (-6) =", opts: ["6", "-6", "18", "-18"], ans: "6", why: "负负得正：12 - 6 = 6"},
        {g: 0, type: "fill", q: "解方程 2x + 6 = 14，x = ___", ans: "4", why: "2x = 8，x = 4"},
        {g: 1, type: "choice", q: "若 x² = 16，则 x 的值为：", opts: ["4", "±4", "-4", "8"], ans: "±4", why: "平方根有两个"},
        {g: 1, type: "fill", q: "直角三角形两直角边为 3 和 4，斜边长为 ___", ans: "5", why: "勾股定理：3²+4²=5²"},
        {g: 2, type: "choice", q: "一元二次方程 x² - 5x + 6 = 0 的两根之和为：", opts: ["5", "-5", "6", "-6"], ans: "5", why: "韦达定理：两根之和 = -b/a = 5"},
        {g: 2, type: "fill", q: "函数 y = 2x + 1，当 x = 3 时，y = ___", ans: "7", why: "2×3+1 = 7"},
        {g: 2, type: "choice", q: "不等式 2x - 4 > 0 的解集是：", opts: ["x > 2", "x < 2", "x > -2", "x > 4"], ans: "x > 2", why: "2x > 4，x > 2"},
      ],
      英语: [
        {g: 0, type: "choice", q: "「library」的意思是：", opts: ["图书馆", "实验室", "食堂", "操场"], ans: "图书馆", why: "library = 图书馆"},
        {g: 0, type: "fill", q: "拼写：学校（英文）___", ans: "school", why: "school"},
        {g: 0, type: "choice", q: "He ______ to school every day.", opts: ["go", "goes", "going", "gone"], ans: "goes", why: "第三人称单数加 -es"},
        {g: 1, type: "fill", q: "拼写：环境（英文）___", ans: "environment", why: "environment"},
        {g: 1, type: "choice", q: "「I have been here ______ two hours.」", opts: ["for", "since", "in", "at"], ans: "for", why: "for + 一段时间，since + 时间点"},
        {g: 2, type: "choice", q: "The book ______ by him yesterday.", opts: ["was written", "is written", "wrote", "writes"], ans: "was written", why: "一般过去时的被动语态"},
        {g: 2, type: "fill", q: "拼写：机会（英文）___", ans: "opportunity", why: "opportunity"},
      ],
      物理: [
        {g: 1, type: "choice", q: "光在真空中的传播速度约为：", opts: ["3×10⁸ m/s", "3×10⁶ m/s", "340 m/s", "1500 m/s"], ans: "3×10⁸ m/s", why: "约三十万公里每秒"},
        {g: 1, type: "fill", q: "水的密度是 ___ g/cm³", ans: "1", why: "1 g/cm³，即 1000 kg/m³"},
        {g: 2, type: "choice", q: "一个物体受到的重力方向总是：", opts: ["竖直向下", "垂直向下", "指向地心", "向下"], ans: "竖直向下", why: "重力方向竖直向下"},
        {g: 2, type: "fill", q: "欧姆定律：I = U / ___", ans: "R", why: "I = U/R"},
      ],
      化学: [
        {g: 2, type: "choice", q: "水的化学式是：", opts: ["H₂O", "CO₂", "O₂", "H₂O₂"], ans: "H₂O", why: "两个氢原子一个氧原子"},
        {g: 2, type: "fill", q: "空气中体积分数最大的气体是 ___（填化学式）", ans: "N2", why: "氮气约占 78%"},
        {g: 2, type: "choice", q: "下列变化属于化学变化的是：", opts: ["铁生锈", "冰融化", "玻璃破碎", "水蒸发"], ans: "铁生锈", why: "有新物质生成才是化学变化"},
      ],
      生物: [
        {g: 0, type: "choice", q: "植物进行光合作用的主要场所是：", opts: ["叶绿体", "线粒体", "细胞核", "液泡"], ans: "叶绿体", why: "叶绿体是光合作用的场所"},
        {g: 0, type: "fill", q: "人体最大的消化腺是 ___", ans: "肝脏", why: "肝脏分泌胆汁"},
        {g: 1, type: "choice", q: "血液中运输氧气的细胞是：", opts: ["红细胞", "白细胞", "血小板", "血浆"], ans: "红细胞", why: "红细胞含血红蛋白"},
      ],
      历史: [
        {g: 0, type: "choice", q: "中国近代史的开端事件是：", opts: ["鸦片战争", "辛亥革命", "洋务运动", "甲午战争"], ans: "鸦片战争", why: "1840 年鸦片战争"},
        {g: 0, type: "fill", q: "辛亥革命爆发于 ___ 年", ans: "1911", why: "1911 年武昌起义"},
        {g: 1, type: "choice", q: "「百家争鸣」出现在哪个时期？", opts: ["春秋战国", "秦汉", "隋唐", "宋元"], ans: "春秋战国", why: "春秋战国时期思想大爆发"},
        {g: 2, type: "fill", q: "新中国成立的时间是 ___ 年 10 月 1 日", ans: "1949", why: "1949 年"},
      ],
      地理: [
        {g: 0, type: "choice", q: "地球上面积最大的大洋是：", opts: ["太平洋", "大西洋", "印度洋", "北冰洋"], ans: "太平洋", why: "太平洋约占海洋面积一半"},
        {g: 0, type: "fill", q: "中国陆地面积约 ___ 万平方千米", ans: "960", why: "约 960 万平方千米"},
        {g: 1, type: "choice", q: "云南省的省会是：", opts: ["昆明", "大理", "丽江", "玉溪"], ans: "昆明", why: "昆明，春城"},
      ],
      政治: [
        {g: 0, type: "choice", q: "我国的根本政治制度是：", opts: ["人民代表大会制度", "政治协商制度", "民族区域自治制度", "基层群众自治制度"], ans: "人民代表大会制度", why: "根本政治制度"},
        {g: 1, type: "fill", q: "我国是 ___ 领导的社会主义国家（填两个字的阶级）", ans: "工人", why: "工人阶级领导"},
        {g: 2, type: "choice", q: "我国处理民族关系的基本原则不包括：", opts: ["民族自决", "民族平等", "民族团结", "各民族共同繁荣"], ans: "民族自决", why: "三大原则是平等、团结、共同繁荣"},
      ],
    };

    /* ==================================================================
     * 出题
     * ------------------------------------------------------------------
     * 从「当前年级考的科目」里随机挑一科，再从该科题库里挑一道
     * 不超过当前年级的题。选项顺序会打乱，避免背答案。
     * ================================================================== */

    function gradeNow() {
      return clamp(Math.floor(clampNum(S && S.term, 0, 9, 0) / 2), 0, 2);
    }

    function pickQuiz() {
      const g = gradeNow();
      const subs = (typeof subjectsOf === "function" ? subjectsOf(S.term) : []) || [];
      const usable = subs.filter(s => QUIZ_BANK[s] && QUIZ_BANK[s].length);
      if (!usable.length) return null;

      const sub = usable[rnd(usable.length)];
      const bank = QUIZ_BANK[sub].filter(x => num(x.g, 0) <= g);
      const pool = bank.length ? bank : QUIZ_BANK[sub];
      const raw = pool[rnd(pool.length)];
      if (!raw) return null;

      const item = {sub, type: raw.type === "fill" ? "fill" : "choice", q: raw.q, ans: String(raw.ans), why: raw.why || ""};

      if (item.type === "choice") {
        const opts = (raw.opts || []).slice();
        if (opts.length < 2) return null;
        // 洗牌，避免同一道题永远是同一个正确位置
        for (let i = opts.length - 1; i > 0; i--) {
          const j = rnd(i + 1);
          const t = opts[i]; opts[i] = opts[j]; opts[j] = t;
        }
        item.opts = opts.map(String);
        item.ansIndex = Math.max(0, item.opts.indexOf(String(raw.ans)));
      }
      return item;
    }

    /* 填空题的答案比对：去空格、不分大小写、中英文标点都算对 */

    function quizMatch(input, ans) {
      const norm = s => String(s == null ? "" : s)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/[（）()]/g, "")
        .replace(/[。．.,，、]/g, "")
        .replace(/₂/g, "2").replace(/₂/g, "2")
        .replace(/²/g, "2")
        .replace(/×/g, "*");
      const a = norm(input), b = norm(ans);
      if (!a) return false;
      if (a === b) return true;
      // 数学：允许 "x=4" 只填 "4"
      if (b.indexOf("=") >= 0 && a === b.split("=").pop()) return true;
      return false;
    }
