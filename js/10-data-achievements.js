/* ==================================================================
 * 内容层 · 成就表
 * ==================================================================
 * 成就的达成条件。c(S) 返回 true 即达成，unlock 可指定达成后赠送的天赋。
 *
 * 维护等级：内容层（可加成就）
 * ============================================================ */

    const ACHIEVEMENTS = {
      firstExam: {n: "初露锋芒", d: "第一次参加月考", c: S => S.cnt.exam >= 1},
      topScore: {n: "一鸣惊人", d: "单次考试 ≥ 90 分", c: S => S.bestExam >= 90},
      perfect: {n: "满分神话", d: "单次考试达到 100 分", c: S => S.bestExam >= 100},
      exam10: {n: "考场老将", d: "参加 10 次考试", c: S => S.cnt.exam >= 10},
      study30: {n: "学而不倦", d: "选择学习行动 30 次", c: S => S.cnt.study >= 30},
      study60: {n: "卷王本王", d: "选择学习行动 60 次", c: S => S.cnt.study >= 60},
      sportKing: {n: "运动达人", d: "参加运动 5 次", c: S => (S.cnt.sport || 0) >= 5},
      sportWin: {n: "冠军之心", d: "赢得 2 次运动胜利", c: S => (S.cnt.sportWin || 0) >= 2},
      social10: {n: "交际花", d: "选择社交行动 10 次", c: S => S.cnt.social >= 10},
      lucky5: {n: "锦鲤本鲤", d: "好运连连 5 次", c: S => (S.cnt.lucky || 0) >= 5},
      rich: {n: "小富翁", d: "经济达到 1000", c: S => S.prop.经济 >= 1000},
      talent5: {n: "天赋异禀", d: "同时拥有 5 个天赋", c: S => Talent.owned.length >= 5},
      talent8: {n: "天选之人", d: "同时拥有 8 个天赋", c: S => Talent.owned.length >= 8},
      contest: {n: "竞赛之星", d: "入选竞赛班", c: S => (S.cnt.contestWin || 0) >= 1},
      love: {n: "青春悸动", d: "给同学递出一张纸条", c: S => (S.cnt.love || 0) >= 1},
      pressure100: {n: "压力山大", d: "压力达到 100", c: S => S.prop.压力 >= 100},
      survive2y: {n: "初三老兵", d: "升入初三", c: S => S.term >= 4},
      resist5: {n: "钢铁意志", d: "拒绝诱惑 5 次", c: S => (S.cnt.resist || 0) >= 5, unlock: "道心如铁"},
      nightOwl: {n: "夜之王者", d: "挑灯夜读 6 次", c: S => (S.cnt.night || 0) >= 6, unlock: "熬夜冠军"},
      foodie: {n: "干饭之魂", d: "光顾小吃摊 4 次", c: S => (S.cnt.food || 0) >= 4, unlock: "大胃袋"},
      zhongkao: {n: "最后一战", d: "参加中考", c: S => S.cnt.zhongkao >= 1},
      subjFull: {n: "单科状元", d: "任意科目考出满分", c: S => (S.cnt.subjFull || 0) >= 1},
      allPerfect: {n: "全科封神", d: "一次考试所有科目 ≥ 90", c: S => (S.cnt.allPerfect || 0) >= 1},
      dungeon3: {n: "副本达人", d: "完成 3 个假期副本", c: S => (S.cnt.dungeon || 0) >= 3},
      bookworm: {n: "书虫", d: "在读书角读书 10 次", c: S => (S.cnt.read || 0) >= 10},
      bookDao: {n: "以书入道", d: "通过读书角获得 3 个天赋", c: S => (S.cnt.bookTalent || 0) >= 3},
      // 注：压力不算在内 —— 压力高是坏事，不该是"六边形"的一条边
      allRounder: {n: "六边形战士", d: "六项主属性同时 ≥ 120", c: S => ["心态", "经济", "健康", "效率", "悟性", "社交"].every(k => num(S.prop[k], 0) >= 120)},
      richKid: {n: "富甲一方", d: "经济 ≥ 3000", c: S => S.prop.经济 >= 3000},
      poorScholar: {n: "寒门贵子", d: "经济 ≤ 50 且中考 ≥ 85", c: S => S.prop.经济 <= 50 && S.zhongkao >= 85},
      volunteer: {n: "热心肠", d: "参加志愿服务 1 次", c: S => (S.cnt.volunteer || 0) >= 1},
      honest: {n: "拾金不昧", d: "捡到钱包交给警察", c: S => (S.cnt.honest || 0) >= 1},
      shopper: {n: "剁手党", d: "在小卖铺购买 5 件道具", c: S => Object.values(S.items).reduce((a, b) => a + b, 0) >= 5},
    };

    /* ==================================================================
     * 破茧 · 负面天赋的消除表
     * ------------------------------------------------------------------
     * talent 要消除的天赋        stat  靠什么行为累积进度
     * need   需要累积多少次      grant 消除后可选赠送的正面天赋（可留空）
     * 触发时会弹出一个鼓励性的提示框
     * ================================================================== */
