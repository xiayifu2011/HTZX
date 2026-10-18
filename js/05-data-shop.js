/* ==================================================================
 * 内容层 · 小卖铺道具
 * ==================================================================
 * 道具的价格与效果。eff(S) 是使用后执行的效果函数。
 *
 * 维护等级：内容层（可加道具）
 * ============================================================ */

    const SHOP_ITEMS = [
      {id: "coffee", n: "☕ 提神咖啡", price: 50, desc: "使用后本周学习行动 +15%，但健康 -3", eff: S => {S.studyBuff += 0.15; S.buffWeeks = Math.max(S.buffWeeks, 1); modProp("健康", -3);}},
      {id: "energy", n: "⚡ 能量饮料", price: 80, desc: "使用后本周效率 +10，健康 -2", eff: S => {modProp("效率", 10); modProp("健康", -2);}},
      {id: "vitamin", n: "💊 维生素片", price: 60, desc: "使用后健康 +12，心情 +3", eff: S => {modProp("健康", 12); modProp("心态", 3);}},
      {
        id: "book", n: "📕 教辅宝典", price: 120, desc: "使用后最弱科目 +25，学力提升",
        eff: S => {
          const subs = subjectsOf(S.term) || [];
          if (!subs.length) {say("【教辅宝典】暂时没有用武之地。", "sys"); return;}
          const weak = subs.reduce((a, b) => num(S.subj[a], 30) < num(S.subj[b], 30) ? a : b);
          S.subj[weak] = clamp(num(S.subj[weak], 30) + 25, 0, SUBJ_CAP);
          recalcScore();
          say(`【教辅宝典】让【${weak}】+25！`, "good");
        }
      },
      {id: "ticket", n: "🎫 考试护身符", price: 160, desc: "使用后下一次考试噪声偏正向", eff: S => {S.examCharm = true; modProp("心态", 5);}},
      {id: "letter", n: "💌 家书一封", price: 40, desc: "使用后压力 -15，心态 +8", eff: S => {modProp("压力", -15); modProp("心态", 8);}},
      {id: "coin", n: "🪙 幸运硬币", price: 100, desc: "使用后本周随机事件好运概率提升", eff: S => {S.luckyCharm = true;}},
      {id: "pen", n: "🖊️ 状元笔", price: 200, desc: "使用后下一次考试均分 +5", eff: S => {S.penCharm = true;}},
      {id: "talisman", n: "🔮 悟道符", price: 260, desc: "使用后立即 +15 悟性", eff: S => {modProp("悟性", 15);}},
      {id: "pill", n: "🍬 静心丹", price: 200, desc: "使用后压力 -30，心态 +10", eff: S => {modProp("压力", -30); modProp("心态", 10);}},
    ];
