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
 * 填空题的判定非常宽容，见文件末尾的 quizMatch：
 *   一 / 1 / 1.0 / 01 都算对；1/2 / 0.5 / 二分之一 都算对；
 *   大小写不分、空格随便加、书名号括号可省、单位可写可不写。
 *
 * 维护等级：内容层（同学可以直接加题）
 * ================================================================== */

    const QUIZ_BANK = {
      语文: [
        {g: 0, type: "choice", q: "「床前明月光」的下一句是：", opts: ["疑是地上霜", "低头思故乡", "举头望明月", "霜叶红于二月花"], ans: "疑是地上霜", why: "李白《静夜思》"},
        {g: 0, type: "fill", q: "补全诗句：会当凌绝顶，______。", ans: "一览众山小", why: "杜甫《望岳》"},
        {g: 0, type: "choice", q: "下列成语书写正确的一项是：", opts: ["再接再励", "再接再厉", "在接再厉", "再接再历"], ans: "再接再厉", why: "「厉」通「砺」，磨砺之意"},
        {g: 0, type: "fill", q: "补全诗句：海内存知己，______。", ans: "天涯若比邻", why: "王勃《送杜少府之任蜀州》"},
        {g: 0, type: "choice", q: "「山重水复疑无路」的下一句是：", opts: ["柳暗花明又一村", "衣带渐宽终不悔", "直挂云帆济沧海", "轻舟已过万重山"], ans: "柳暗花明又一村", why: "陆游《游山西村》"},
        {g: 0, type: "choice", q: "下列词语中没有错别字的一项是：", opts: ["走投无路", "走头无路", "走投无鹿", "走头无鹿"], ans: "走投无路", why: "「投」是投奔之意"},
        {g: 0, type: "fill", q: "「春眠不觉晓」的下一句是「处处闻啼___」", ans: "鸟", why: "孟浩然《春晓》"},
        {g: 0, type: "choice", q: "《论语》中「学而不思则罔」的下一句是：", opts: ["思而不学则殆", "思而不学则怠", "思而不学则失", "思而不学则惘"], ans: "思而不学则殆", why: "《论语·为政》"},
        {g: 1, type: "fill", q: "补全诗句：沉舟侧畔千帆过，______。", ans: "病树前头万木春", why: "刘禹锡《酬乐天扬州初逢席上见赠》"},
        {g: 1, type: "choice", q: "「先天下之忧而忧」出自：", opts: ["《岳阳楼记》", "《醉翁亭记》", "《桃花源记》", "《小石潭记》"], ans: "《岳阳楼记》", why: "范仲淹《岳阳楼记》"},
        {g: 1, type: "choice", q: "「锲而不舍」的下一句是：", opts: ["金石可镂", "朽木不折", "金石可鉴", "朽木难雕"], ans: "金石可镂", why: "《荀子·劝学》"},
        {g: 1, type: "fill", q: "补全诗句：不畏浮云遮望眼，______。", ans: "自缘身在最高层", why: "王安石《登飞来峰》"},
        {g: 1, type: "choice", q: "「醉翁之意不在酒」的下一句是：", opts: ["在乎山水之间也", "在乎山水之乐也", "在乎宴酣之乐也", "在乎游人去也"], ans: "在乎山水之间也", why: "欧阳修《醉翁亭记》"},
        {g: 1, type: "fill", q: "「落红不是无情物」的下一句是「化作春泥更护___」", ans: "花", why: "龚自珍《己亥杂诗》"},
        {g: 1, type: "choice", q: "「但愿人长久」的下一句是：", opts: ["千里共婵娟", "天涯共此时", "海上生明月", "把酒问青天"], ans: "千里共婵娟", why: "苏轼《水调歌头》"},
        {g: 2, type: "fill", q: "补全诗句：长风破浪会有时，______。", ans: "直挂云帆济沧海", why: "李白《行路难》"},
        {g: 2, type: "choice", q: "「人生自古谁无死」的下一句是：", opts: ["留取丹心照汗青", "留取丹心照汉青", "留得丹心照汗青", "留取真心照汗青"], ans: "留取丹心照汗青", why: "文天祥《过零丁洋》"},
        {g: 2, type: "fill", q: "补全诗句：会挽雕弓如满月，西北望，射___。", ans: "天狼", why: "苏轼《江城子·密州出猎》"},
        {g: 2, type: "choice", q: "「生于忧患」的下一句是：", opts: ["死于安乐", "死于忧患", "生于安乐", "死于安逸"], ans: "死于安乐", why: "《孟子·告子下》"},
        {g: 2, type: "fill", q: "补全诗句：春蚕到死丝方尽，______。", ans: "蜡炬成灰泪始干", why: "李商隐《无题》"},
        {g: 2, type: "choice", q: "《出师表》的作者是：", opts: ["诸葛亮", "曹操", "刘备", "周瑜"], ans: "诸葛亮", why: "诸葛亮《出师表》"},
        {g: 2, type: "choice", q: "「先帝创业未半而中道崩殂」出自：", opts: ["《出师表》", "《诫子书》", "《隆中对》", "《后出师表》"], ans: "《出师表》", why: "诸葛亮《出师表》开篇"},
      ],
      数学: [
        {g: 0, type: "choice", q: "计算：(-3) × (-4) + (-6) =", opts: ["6", "-6", "18", "-18"], ans: "6", why: "负负得正：12 - 6 = 6"},
        {g: 0, type: "fill", q: "解方程 2x + 6 = 14，x = ___", ans: "4", why: "2x = 8，x = 4"},
        {g: 0, type: "choice", q: "|-5| 的值是：", opts: ["5", "-5", "0", "±5"], ans: "5", why: "绝对值永远非负"},
        {g: 0, type: "fill", q: "一个三角形内角和是 ___ 度", ans: "180", why: "三角形内角和 180°"},
        {g: 0, type: "choice", q: "下列哪个数是无理数？", opts: ["π", "0.5", "1/3", "-2"], ans: "π", why: "π 是无限不循环小数"},
        {g: 0, type: "fill", q: "|-7| + |-3| = ___", ans: "10", why: "7 + 3 = 10"},
        {g: 0, type: "choice", q: "化简 3a + 2a 的结果是：", opts: ["5a", "6a", "5a²", "a⁵"], ans: "5a", why: "合并同类项：系数相加"},
        {g: 0, type: "fill", q: "把 0.25 化成分数是 ___（填如 1/4 的形式）", ans: "1/4", why: "0.25 = 1/4"},
        {g: 1, type: "choice", q: "若 x² = 16，则 x 的值为：", opts: ["4", "±4", "-4", "8"], ans: "±4", why: "平方根有两个"},
        {g: 1, type: "fill", q: "直角三角形两直角边为 3 和 4，斜边长为 ___", ans: "5", why: "勾股定理：3²+4²=5²"},
        {g: 1, type: "choice", q: "一次函数 y = kx + b 中，k 表示：", opts: ["斜率", "截距", "自变量", "常数"], ans: "斜率", why: "k 是斜率，b 是纵截距"},
        {g: 1, type: "fill", q: "计算：(-2)³ = ___", ans: "-8", why: "(-2)×(-2)×(-2) = -8"},
        {g: 1, type: "choice", q: "下列图形中一定是轴对称图形的是：", opts: ["等腰三角形", "平行四边形", "梯形", "直角三角形"], ans: "等腰三角形", why: "等腰三角形底边上的高是对称轴"},
        {g: 1, type: "fill", q: "分解因式：x² - 9 = (x+3)(x-___)", ans: "3", why: "平方差公式"},
        {g: 1, type: "choice", q: "不等式 -3x > 6 的解集是：", opts: ["x < -2", "x > -2", "x < 2", "x > 2"], ans: "x < -2", why: "两边同除以负数，不等号变向"},
        {g: 2, type: "choice", q: "一元二次方程 x² - 5x + 6 = 0 的两根之和为：", opts: ["5", "-5", "6", "-6"], ans: "5", why: "韦达定理：两根之和 = -b/a = 5"},
        {g: 2, type: "fill", q: "函数 y = 2x + 1，当 x = 3 时，y = ___", ans: "7", why: "2×3+1 = 7"},
        {g: 2, type: "choice", q: "不等式 2x - 4 > 0 的解集是：", opts: ["x > 2", "x < 2", "x > -2", "x > 4"], ans: "x > 2", why: "2x > 4，x > 2"},
        {g: 2, type: "fill", q: "sin30° 的值是 ___", ans: "0.5", why: "sin30° = 1/2"},
        {g: 2, type: "choice", q: "抛物线 y = x² - 2x + 1 的顶点坐标是：", opts: ["(1, 0)", "(0, 1)", "(-1, 0)", "(1, 1)"], ans: "(1, 0)", why: "配方得 (x-1)²，顶点 (1,0)"},
        {g: 2, type: "fill", q: "半径为 3 的圆，面积是 ___π", ans: "9", why: "S = πr² = 9π"},
        {g: 2, type: "choice", q: "两组对边分别平行的四边形是：", opts: ["平行四边形", "梯形", "矩形", "菱形"], ans: "平行四边形", why: "平行四边形的定义"},
        {g: 2, type: "fill", q: "数据 2、4、6、8 的平均数是 ___", ans: "5", why: "(2+4+6+8)/4 = 5"},
      ],
      英语: [
        {g: 0, type: "choice", q: "「library」的意思是：", opts: ["图书馆", "实验室", "食堂", "操场"], ans: "图书馆", why: "library = 图书馆"},
        {g: 0, type: "fill", q: "拼写：学校（英文）___", ans: "school", why: "school"},
        {g: 0, type: "choice", q: "He ______ to school every day.", opts: ["go", "goes", "going", "gone"], ans: "goes", why: "第三人称单数加 -es"},
        {g: 0, type: "fill", q: "拼写：老师（英文）___", ans: "teacher", why: "teacher"},
        {g: 0, type: "choice", q: "「I ______ a student.」横线处应填：", opts: ["am", "is", "are", "be"], ans: "am", why: "第一人称 I 搭配 am"},
        {g: 0, type: "fill", q: "拼写：水（英文）___", ans: "water", why: "water"},
        {g: 0, type: "choice", q: "「book」的复数形式是：", opts: ["books", "bookes", "book", "bookies"], ans: "books", why: "一般情况直接加 -s"},
        {g: 1, type: "fill", q: "拼写：环境（英文）___", ans: "environment", why: "environment"},
        {g: 1, type: "choice", q: "「I have been here ______ two hours.」", opts: ["for", "since", "in", "at"], ans: "for", why: "for + 一段时间，since + 时间点"},
        {g: 1, type: "fill", q: "拼写：重要的（英文）___", ans: "important", why: "important"},
        {g: 1, type: "choice", q: "「If it ______ tomorrow, we will stay at home.」", opts: ["rains", "will rain", "rained", "is raining"], ans: "rains", why: "主将从现：主句将来时，从句一般现在时"},
        {g: 1, type: "fill", q: "写出「go」的过去式：___", ans: "went", why: "go-went-gone"},
        {g: 1, type: "choice", q: "「She is ______ than her sister.」", opts: ["taller", "tall", "tallest", "more tall"], ans: "taller", why: "两者比较用比较级"},
        {g: 2, type: "choice", q: "The book ______ by him yesterday.", opts: ["was written", "is written", "wrote", "writes"], ans: "was written", why: "一般过去时的被动语态"},
        {g: 2, type: "fill", q: "拼写：机会（英文）___", ans: "opportunity", why: "opportunity"},
        {g: 2, type: "choice", q: "「I don't know ______ he will come.」", opts: ["whether", "what", "which", "that"], ans: "whether", why: "whether 表示「是否」"},
        {g: 2, type: "fill", q: "写出「do」的过去分词：___", ans: "done", why: "do-did-done"},
        {g: 2, type: "choice", q: "「He asked me ______ I had finished my homework.」", opts: ["if", "that", "what", "which"], ans: "if", why: "if 引导宾语从句，表示「是否」"},
        {g: 2, type: "fill", q: "拼写：成功（名词，英文）___", ans: "success", why: "success"},
      ],
      物理: [
        {g: 1, type: "choice", q: "光在真空中的传播速度约为：", opts: ["3×10⁸ m/s", "3×10⁶ m/s", "340 m/s", "1500 m/s"], ans: "3×10⁸ m/s", why: "约三十万公里每秒"},
        {g: 1, type: "fill", q: "水的密度是 ___ g/cm³", ans: "1", why: "1 g/cm³，即 1000 kg/m³"},
        {g: 1, type: "choice", q: "声音在空气中（15℃）的传播速度约为：", opts: ["340 m/s", "340 km/s", "1500 m/s", "3×10⁸ m/s"], ans: "340 m/s", why: "约 340 米每秒"},
        {g: 1, type: "fill", q: "力的单位是 ___（填中文）", ans: "牛顿", why: "力的单位是牛顿，符号 N"},
        {g: 1, type: "choice", q: "下列属于光的折射现象的是：", opts: ["筷子在水中看起来弯折", "水中倒影", "影子", "平面镜成像"], ans: "筷子在水中看起来弯折", why: "光从水进入空气发生折射"},
        {g: 1, type: "fill", q: "1 标准大气压约等于 ___ Pa（填科学记数法如 1.01×10⁵）", ans: "1.01×10⁵", why: "1.01×10⁵ Pa"},
        {g: 2, type: "choice", q: "一个物体受到的重力方向总是：", opts: ["竖直向下", "垂直向下", "指向地心", "向下"], ans: "竖直向下", why: "重力方向竖直向下"},
        {g: 2, type: "fill", q: "欧姆定律：I = U / ___", ans: "R", why: "I = U/R"},
        {g: 2, type: "choice", q: "串联电路中，各处电流的关系是：", opts: ["处处相等", "与电阻成正比", "与电阻成反比", "越往后越小"], ans: "处处相等", why: "串联电路电流处处相等"},
        {g: 2, type: "fill", q: "电功率公式 P = ___（用 U 和 I 表示）", ans: "UI", why: "P = UI"},
        {g: 2, type: "choice", q: "物体做匀速直线运动时，其速度：", opts: ["保持不变", "逐渐增大", "逐渐减小", "先增后减"], ans: "保持不变", why: "匀速即速度不变"},
        {g: 2, type: "fill", q: "g = 9.8 N/kg 表示质量为 1kg 的物体受到的重力是 ___ N", ans: "9.8", why: "G = mg = 1×9.8 = 9.8N"},
        {g: 2, type: "choice", q: "下列做法能增大摩擦的是：", opts: ["轮胎上刻花纹", "给轴承加润滑油", "用滚动代替滑动", "使接触面变光滑"], ans: "轮胎上刻花纹", why: "增大接触面粗糙程度可增大摩擦"},
      ],
      化学: [
        {g: 2, type: "choice", q: "水的化学式是：", opts: ["H₂O", "CO₂", "O₂", "H₂O₂"], ans: "H₂O", why: "两个氢原子一个氧原子"},
        {g: 2, type: "fill", q: "空气中体积分数最大的气体是 ___（填化学式）", ans: "N2", why: "氮气约占 78%"},
        {g: 2, type: "choice", q: "下列变化属于化学变化的是：", opts: ["铁生锈", "冰融化", "玻璃破碎", "水蒸发"], ans: "铁生锈", why: "有新物质生成才是化学变化"},
        {g: 2, type: "choice", q: "二氧化碳的化学式是：", opts: ["CO₂", "CO", "C₂O", "CO₃"], ans: "CO₂", why: "一个碳原子两个氧原子"},
        {g: 2, type: "fill", q: "氧气的化学式是 ___", ans: "O2", why: "氧气是双原子分子 O₂"},
        {g: 2, type: "choice", q: "下列物质属于纯净物的是：", opts: ["蒸馏水", "空气", "海水", "食醋"], ans: "蒸馏水", why: "蒸馏水只含水分子"},
        {g: 2, type: "fill", q: "地壳中含量最多的元素是 ___（填元素符号）", ans: "O", why: "氧元素含量最高"},
        {g: 2, type: "choice", q: "「Cu」是哪种元素的符号？", opts: ["铜", "钙", "碳", "氯"], ans: "铜", why: "Cu = 铜，Ca = 钙，C = 碳，Cl = 氯"},
        {g: 2, type: "fill", q: "铁的元素符号是 ___", ans: "Fe", why: "Fe = 铁"},
        {g: 2, type: "choice", q: "下列气体能使澄清石灰水变浑浊的是：", opts: ["二氧化碳", "氧气", "氮气", "氢气"], ans: "二氧化碳", why: "CO₂ 与石灰水反应生成碳酸钙沉淀"},
      ],
      生物: [
        {g: 0, type: "choice", q: "植物进行光合作用的主要场所是：", opts: ["叶绿体", "线粒体", "细胞核", "液泡"], ans: "叶绿体", why: "叶绿体是光合作用的场所"},
        {g: 0, type: "fill", q: "人体最大的消化腺是 ___", ans: "肝脏", why: "肝脏分泌胆汁"},
        {g: 0, type: "choice", q: "细胞的控制中心是：", opts: ["细胞核", "细胞膜", "细胞质", "细胞壁"], ans: "细胞核", why: "细胞核含遗传物质"},
        {g: 0, type: "fill", q: "绿色植物通过光合作用制造的有机物主要是 ___（填一种糖）", ans: "淀粉", why: "光合作用主要产物是淀粉"},
        {g: 0, type: "choice", q: "下列属于生态系统中的生产者的是：", opts: ["绿色植物", "兔子", "蘑菇", "细菌"], ans: "绿色植物", why: "生产者能自己制造有机物"},
        {g: 1, type: "choice", q: "血液中运输氧气的细胞是：", opts: ["红细胞", "白细胞", "血小板", "血浆"], ans: "红细胞", why: "红细胞含血红蛋白"},
        {g: 1, type: "fill", q: "人体呼吸系统的主要器官是 ___", ans: "肺", why: "肺是气体交换的主要场所"},
        {g: 1, type: "choice", q: "人体血液循环的动力器官是：", opts: ["心脏", "肺", "肝脏", "肾脏"], ans: "心脏", why: "心脏是血液循环的泵"},
        {g: 1, type: "fill", q: "遗传物质 DNA 主要存在于细胞的 ___ 中", ans: "细胞核", why: "DNA 主要在细胞核的染色体上"},
        {g: 1, type: "choice", q: "下列现象属于条件反射的是：", opts: ["望梅止渴", "膝跳反射", "缩手反射", "眨眼反射"], ans: "望梅止渴", why: "条件反射是后天学习获得的"},
        {g: 1, type: "fill", q: "人体最大的器官是 ___", ans: "皮肤", why: "皮肤是人体面积最大的器官"},
        {g: 1, type: "choice", q: "达尔文的进化学说核心是：", opts: ["自然选择", "用进废退", "获得性遗传", "物种不变"], ans: "自然选择", why: "《物种起源》提出自然选择"},
      ],
      历史: [
        {g: 0, type: "choice", q: "中国近代史的开端事件是：", opts: ["鸦片战争", "辛亥革命", "洋务运动", "甲午战争"], ans: "鸦片战争", why: "1840 年鸦片战争"},
        {g: 0, type: "fill", q: "辛亥革命爆发于 ___ 年", ans: "1911", why: "1911 年武昌起义"},
        {g: 0, type: "choice", q: "「百家争鸣」出现在哪个时期？", opts: ["春秋战国", "秦汉", "隋唐", "宋元"], ans: "春秋战国", why: "春秋战国时期思想大爆发"},
        {g: 0, type: "fill", q: "中国历史上第一个统一的中央集权封建国家是 ___（填朝代）", ans: "秦朝", why: "公元前 221 年秦统一六国"},
        {g: 0, type: "choice", q: "「丝绸之路」的起点是：", opts: ["长安", "洛阳", "北京", "咸阳"], ans: "长安", why: "长安是丝绸之路的东方起点"},
        {g: 1, type: "choice", q: "戊戌变法发生在哪一年？", opts: ["1898", "1895", "1900", "1911"], ans: "1898", why: "1898 年戊戌变法，又称百日维新"},
        {g: 1, type: "fill", q: "五四运动爆发于 ___ 年", ans: "1919", why: "1919 年 5 月 4 日"},
        {g: 1, type: "choice", q: "中国近代「睁眼看世界」的第一人是：", opts: ["林则徐", "魏源", "李鸿章", "康有为"], ans: "林则徐", why: "林则徐组织编译《四洲志》"},
        {g: 1, type: "fill", q: "中国共产党成立于 ___ 年", ans: "1921", why: "1921 年中共一大召开"},
        {g: 2, type: "fill", q: "新中国成立的时间是 ___ 年 10 月 1 日", ans: "1949", why: "1949 年"},
        {g: 2, type: "choice", q: "标志着中国半殖民地半封建社会结束的事件是：", opts: ["新中国成立", "抗日战争胜利", "辛亥革命", "五四运动"], ans: "新中国成立", why: "1949 年新中国成立"},
        {g: 2, type: "fill", q: "抗日战争全面爆发的标志是 ___ 事变（填地名）", ans: "卢沟桥", why: "1937 年卢沟桥事变"},
        {g: 2, type: "choice", q: "世界上现存最早的成文法典之一是：", opts: ["《汉谟拉比法典》", "《十二铜表法》", "《拿破仑法典》", "《民法典》"], ans: "《汉谟拉比法典》", why: "古巴比伦《汉谟拉比法典》"},
      ],
      地理: [
        {g: 0, type: "choice", q: "地球上面积最大的大洋是：", opts: ["太平洋", "大西洋", "印度洋", "北冰洋"], ans: "太平洋", why: "太平洋约占海洋面积一半"},
        {g: 0, type: "fill", q: "中国陆地面积约 ___ 万平方千米", ans: "960", why: "约 960 万平方千米"},
        {g: 0, type: "choice", q: "地球自转产生的现象是：", opts: ["昼夜交替", "四季变化", "五带划分", "昼夜长短变化"], ans: "昼夜交替", why: "自转产生昼夜交替，公转产生四季"},
        {g: 0, type: "fill", q: "地球上最大的大陆是 ___ 大陆", ans: "亚欧", why: "亚欧大陆面积最大"},
        {g: 1, type: "choice", q: "云南省的省会是：", opts: ["昆明", "大理", "丽江", "玉溪"], ans: "昆明", why: "昆明，春城"},
        {g: 1, type: "fill", q: "中国最长的河流是 ___（填河流名）", ans: "长江", why: "长江是中国第一长河"},
        {g: 1, type: "choice", q: "下列省级行政区中，纬度最低的是：", opts: ["海南省", "广东省", "云南省", "福建省"], ans: "海南省", why: "海南省纬度最低"},
        {g: 1, type: "fill", q: "地球上热带与温带的分界线叫 ___（填纬线名）", ans: "回归线", why: "南北回归线是热带与温带的分界"},
        {g: 1, type: "choice", q: "世界上面积最大的国家是：", opts: ["俄罗斯", "加拿大", "中国", "美国"], ans: "俄罗斯", why: "俄罗斯领土面积最大"},
        {g: 1, type: "fill", q: "亚洲与非洲的分界线是 ___ 运河", ans: "苏伊士", why: "苏伊士运河"},
        {g: 1, type: "choice", q: "我国地势的特点是：", opts: ["西高东低，呈阶梯状", "东高西低", "中间高四周低", "南高北低"], ans: "西高东低，呈阶梯状", why: "我国地势西高东低，三级阶梯"},
        {g: 1, type: "fill", q: "世界上最高的山峰是___（填名称）", ans: "珠穆朗玛峰", why: "珠穆朗玛峰，海拔 8848 米以上"},
      ],
      政治: [
        {g: 0, type: "choice", q: "我国的根本政治制度是：", opts: ["人民代表大会制度", "政治协商制度", "民族区域自治制度", "基层群众自治制度"], ans: "人民代表大会制度", why: "根本政治制度"},
        {g: 0, type: "fill", q: "我国是 ___ 领导的社会主义国家（填两个字的阶级）", ans: "工人", why: "工人阶级领导"},
        {g: 0, type: "choice", q: "未成年人的合法权益受哪部法律专门保护？", opts: ["《未成年人保护法》", "《义务教育法》", "《民法典》", "《刑法》"], ans: "《未成年人保护法》", why: "专门保护未成年人的法律"},
        {g: 0, type: "fill", q: "我国实行 ___ 年义务教育", ans: "九", why: "九年义务教育"},
        {g: 1, type: "choice", q: "我国处理民族关系的基本原则不包括：", opts: ["民族自决", "民族平等", "民族团结", "各民族共同繁荣"], ans: "民族自决", why: "三大原则是平等、团结、共同繁荣"},
        {g: 1, type: "fill", q: "我国宪法规定的公民基本权利中，最基本的政治权利是___（填四个字）", ans: "选举权", why: "选举权和被选举权是基本政治权利"},
        {g: 1, type: "choice", q: "下列属于公民基本义务的是：", opts: ["依法纳税", "自由旅行", "选择职业", "发表言论"], ans: "依法纳税", why: "依法纳税是公民的基本义务"},
        {g: 1, type: "choice", q: "我国的最高国家权力机关是：", opts: ["全国人民代表大会", "国务院", "中央军委", "最高人民法院"], ans: "全国人民代表大会", why: "全国人大是最高国家权力机关"},
        {g: 2, type: "fill", q: "中国特色社会主义最本质的特征是___（填四个字）", ans: "党的领导", why: "党的领导是最本质特征"},
        {g: 2, type: "choice", q: "我国的基本经济制度的基础是：", opts: ["公有制", "私有制", "混合所有制", "个体经济"], ans: "公有制", why: "公有制为主体、多种所有制共同发展"},
        {g: 2, type: "fill", q: "我国现阶段的主要矛盾是人民日益增长的美好生活需要和___的发展之间的矛盾", ans: "不平衡不充分", why: "党的十九大提出的主要矛盾"},
        {g: 2, type: "choice", q: "公民在法律面前一律平等，意味着：", opts: ["任何人都不能有超越法律的特权", "所有人权利完全相同", "未成年人可不受约束", "官员享有豁免权"], ans: "任何人都不能有超越法律的特权", why: "法律面前人人平等"},
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

    /* ==================================================================
     * 填空题的答案比对
     * ------------------------------------------------------------------
     * 判卷要宽容 —— 学生答对了意思，就不该因为写法被判错。
     * 下面这些写法都算对：
     *   一 / 1 / 1.0 / 01            → 同一个数
     *   1/2 / 0.5 / 二分之一          → 同一个值
     *   50% / 0.5                    → 同一个值（百分号可写可不写）
     *   H₂O / H2O / h2o              → 下标与大小写
     *   4cm / 4厘米 / 4 厘米          → 单位可写可不写
     *   《岳阳楼记》/ 岳阳楼记          → 书名号可省
     *   x=4 若答案是 4                → 只填数字也算对
     * ================================================================== */

    const CN_DIGIT = {零: "0", 〇: "0", 一: "1", 二: "2", 两: "2", 三: "3", 四: "4",
      五: "5", 六: "6", 七: "7", 八: "8", 九: "9"};

    /* 中文数字串 → 阿拉伯数字：十 → 10，二十五 → 25，一百 → 100 */
    function cnNumToArabic(s) {
      if (!/[零〇一二两三四五六七八九十百千]/.test(s)) return null;
      let out = "";
      const UNIT = {千: 1000, 百: 100, 十: 10};
      let total = 0, cur = 0, has = false;
      for (const ch of s) {
        if (CN_DIGIT[ch] != null) {cur = Number(CN_DIGIT[ch]); has = true; continue;}
        if (UNIT[ch]) {
          total += (cur || 1) * UNIT[ch];
          cur = 0; has = true;
          continue;
        }
        // 遇到非数字字符：先把攒下的收进去，其余原样保留
        if (has) {out += String(total + cur); total = 0; cur = 0; has = false;}
        out += ch;
      }
      if (has) out += String(total + cur);
      return out;
    }

    /* 去掉多余的零：4.0 → 4，0.50 → 0.5，01 → 1 */
    function trimNumZeros(s) {
      return String(s)
        .replace(/(\d+)\.0+(?![\d])/g, "$1")     // 4.0 → 4
        .replace(/(\d+\.\d*?)0+(?![\d])/g, "$1") // 0.50 → 0.5
        .replace(/(^|[^\d.])0+(\d)/g, "$1$2");   // 01 → 1
    }

    /* 分数 a/b → 小数（保留 6 位，够用） */
    function fracToDec(s) {
      const m = String(s).match(/^(-?[\d.]+)\s*\/\s*(-?[\d.]+)$/);
      if (!m) return null;
      const a = parseFloat(m[1]), b = parseFloat(m[2]);
      if (!isFinite(a) || !isFinite(b) || b === 0) return null;
      return String(Math.round((a / b) * 1e6) / 1e6);
    }

    /* 百分号：50% → 0.5（也保留 50 本身作为候选） */
    function pctVariants(s) {
      const m = String(s).match(/^(-?[\d.]+)\s*%$/);
      if (!m) return [];
      const v = parseFloat(m[1]);
      if (!isFinite(v)) return [];
      return [String(Math.round(v / 100 * 1e6) / 1e6), String(v)];
    }

    /* 把答案归一化成一组「等价写法」，任一相等即判对 */
    function answerVariants(raw) {
      let s = String(raw == null ? "" : raw).trim();
      if (!s) return [];
      const out = new Set();

      /* ★ 关键：数字中间的小数点必须保留。
       * 以前把 "." 当成句号一并删掉，结果 "1.0" 变成 "10"、"0.5" 变成 "05"，
       * 学生明明答对了却被判错。现在只删首尾与中文标点。 */
      const base = s
        .toLowerCase()
        .replace(/\s+/g, "")                                  // 去所有空格
        .replace(/[（）()]/g, "")                               // 去括号
        .replace(/[《》〈〉"\[\]【】]/g, "")                     // 去书名号与引号
        .replace(/[。．、;；:：!！?？]/g, "")                     // 中文标点
        .replace(/^[.,]+|[.,]+$/g, "")                         // 首尾的点/逗号
        .replace(/₂/g, "2").replace(/₂/g, "2").replace(/²/g, "2")
        .replace(/₃/g, "3").replace(/³/g, "3")
        .replace(/×/g, "*").replace(/÷/g, "/")
        .replace(/[—–－]/g, "-");                               // 各种横线统一
      out.add(base);

      // 中文数字 → 阿拉伯数字
      const cn = cnNumToArabic(base);
      if (cn && cn !== base) out.add(cn);

      // 中文分数："二分之一" → 0.5
      const fm = base.match(/^(.+?)分之(.+)$/);
      if (fm) {
        const a = Number(cnNumToArabic(fm[1]) || fm[1]);
        const b = Number(cnNumToArabic(fm[2]) || fm[2]);
        if (isFinite(a) && isFinite(b) && a !== 0) {
          out.add(String(Math.round((b / a) * 1e6) / 1e6));
        }
      }

      // 逐个变体再做「数字形态」的等价展开（做两轮，覆盖「中文数字 → 分数」这类组合）
      for (let round = 0; round < 2; round++) {
        const extra = [];
        out.forEach(v => {
          extra.push(trimNumZeros(v));
          const f = fracToDec(v); if (f) extra.push(f);
          pctVariants(v).forEach(x => extra.push(x));
        });
        extra.forEach(v => {if (v) out.add(v);});
      }

      return [...out];
    }

    /* 一个「词」级别的兜底：把常见单位后缀去掉再比一次 */
    function stripUnits(s) {
      return String(s).replace(/(厘米|cm|米|m|千克|kg|克|g|秒|s|小时|h|度|°)$/i, "");
    }

    function quizMatch(input, ans) {
      const a = String(input == null ? "" : input).trim();
      if (!a) return false;
      const AV = answerVariants(a);
      const BV = answerVariants(ans);
      // 直接命中
      for (const x of AV) for (const y of BV) if (x === y && x !== "") return true;
      // 去掉单位后再比一次（4cm ↔ 4）
      const AU = AV.map(stripUnits), BU = BV.map(stripUnits);
      for (const x of AU) for (const y of BU) if (x === y && x !== "") return true;
      // "x=4" 这类：答案是 4，学生写了 x=4
      const eqTail = a.split("=").pop();
      if (eqTail && eqTail !== a) {
        for (const y of BV) if (answerVariants(eqTail).indexOf(y) >= 0 && y !== "") return true;
      }
      // 答案是 "x=4"，学生只填了 4
      const ansTail = String(ans).split("=").pop();
      if (ansTail && ansTail !== String(ans)) {
        for (const x of AV) if (answerVariants(ansTail).indexOf(x) >= 0 && x !== "") return true;
      }
      return false;
    }
