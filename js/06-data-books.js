/* ==================================================================
 * 内容层 · 读书角书目
 * ==================================================================
 * 书目、价格、阅读后的效果与读后感文案。
 *
 * 维护等级：内容层（可加书）
 * ============================================================ */

    /* ==================================================================
     * 负面天赋名单
     * ------------------------------------------------------------------
     * 读书永远只给正面的东西 —— 这是本项目的教育立场。
     * 读书角抽天赋时，下面这些一律排除。
     * ★ 加了新的负面天赋，记得也加到这里。
     * ================================================================== */
    const BAD_TALENTS = [
      "厌学", "重度厌学", "学习特困生", "注意力涣散", "拖延症", "迟钝",
      "网瘾", "严重网瘾", "夜猫子", "长期失眠", "多动症", "内耗者",
      "玻璃心", "暴躁", "深度抑郁", "社恐", "社交恐惧", "考试焦虑", "体弱多病",
      "家徒四壁", "单亲家庭", "留守少年", "偏食",
    ];

    /* 判断一个天赋是不是负面的
     * ------------------------------------------------------------------
     * 先看名单（最准），名单没写的再看描述：
     *   描述里出现减益词（下降/降低/减半/变慢/停滞/消耗变大 ……）
     *   且没有出现「+」这类增益写法 → 判为负面。
     * 只有一句话的取舍：读书只给正面的东西，宁可判严一点也不判漏。
     * ================================================================== */
    function isBadTalent(name) {
      if (BAD_TALENTS.indexOf(name) >= 0) return true;
      const d = (TALENTS[name] && TALENTS[name].desc) || "";
      if (!d) return false;
      const bad = /下降|降低|减半|变差|变慢|停滞|额外|不稳定|波动|消耗变大|大起大落|概率下降|-\d/.test(d);
      if (!bad) return false;
      // 有「+N」这种明显增益的，算有得有失，不判负面（名单里已点名的除外）
      return !/\+\s*\d/.test(d);
    }

    /* 给某一科加学力，统一走边界处理（不会越界、不会出现 NaN） */
    function addSubj(S, k, v) {
      S.subj[k] = clamp(num(S.subj[k], 30) + num(v, 0), 0, SUBJ_CAP);
      recalcScore();
    }

    /* 抽一个「正面且没拥有」的天赋；抽不到就返回 null
     *
     * ★ 出身类天赋（家财万贯 / 单亲家庭 / 书香门第 …）不在池子里。
     *   读书改变的是你这个人，不是你的出身 ——
     *   读再多书也没法把"家徒四壁"读成"书香门第"。
     *   清单见 js/03-data-talents.js 的 FAMILY_TALENTS。 */
    function pickGoodTalent(minLv, maxLv) {
      const pool = Object.keys(TALENTS).filter(t => {
        const lv = TALENTS[t].lv;
        if (lv < minLv || lv > maxLv) return false;
        if (Talent.have(t) || isBadTalent(t)) return false;
        if (typeof isFamilyTalent === "function" && isFamilyTalent(t)) return false;
        return true;
      });
      return pool.length ? pool[rnd(pool.length)] : null;
    }

    const BOOKS = [
      {n: "《平凡的世界》", cost: 30, eff: S => {modProp("心态", 12); modProp("悟性", 4); modProp("压力", -5);}, d: "苦难中看见光。", lore: "合上书，你仿佛看见黄土高原上的风。"},
      {n: "《时间简史》", cost: 40, eff: S => {modProp("悟性", 10); modProp("效率", 3); modProp("压力", 6);}, d: "宇宙的尺度。", lore: "宇宙的尽头是什么？你合上书，发现自己的烦恼渺小得可笑。"},
      {n: "《活着》", cost: 25, eff: S => {modProp("心态", 14); modProp("压力", -12); modProp("健康", -2);}, d: "活着本身就有意义。", lore: "人是为了活着本身而活着。"},
      {n: "《苏东坡传》", cost: 35, eff: S => {modProp("心态", 10); modProp("社交", 5); modProp("压力", -5);}, d: "一蓑烟雨任平生。", lore: "回首向来萧瑟处，归去，也无风雨也无晴。"},
      {n: "《几何原本》", cost: 45, eff: S => {addSubj(S, "数学", 25); modProp("悟性", 4); modProp("压力", 8);}, d: "逻辑之美。", lore: "点、线、面，构成了这个世界最底层的逻辑。"},
      {n: "《英语晨读》", cost: 30, eff: S => {addSubj(S, "英语", 25); modProp("效率", 3); modProp("压力", 4);}, d: "语感在朗读中生长。", lore: "The early bird catches the worm."},
      {n: "《古文观止》", cost: 35, eff: S => {addSubj(S, "语文", 25); modProp("悟性", 4); modProp("压力", 5);}, d: "文言雅韵。", lore: "先天下之忧而忧，后天下之乐而乐。"},
      {n: "《万历十五年》", cost: 40, eff: S => {addSubj(S, "历史", 25); modProp("悟性", 4); modProp("压力", 6);}, d: "以小见大。", lore: "历史的尘埃落在一个人的头上，就是一座山。"},
      {n: "《物种起源》", cost: 45, eff: S => {addSubj(S, "生物", 25); modProp("悟性", 4); modProp("压力", 6);}, d: "自然选择的伟力。", lore: "物竞天择，适者生存。"},
      {n: "《物理世界奇遇记》", cost: 45, eff: S => {addSubj(S, "物理", 25); modProp("悟性", 4); modProp("压力", 7);}, d: "物理也可以很有趣。", lore: "如果你能理解相对论，说明你还没疯。"},
      {n: "《元素的故事》", cost: 45, eff: S => {addSubj(S, "化学", 25); modProp("悟性", 4); modProp("压力", 6);}, d: "化学元素的前世今生。", lore: "万物皆由元素组成，包括你和我。"},
      {n: "《论语》", cost: 30, eff: S => {modProp("心态", 10); modProp("悟性", 5); modProp("社交", 3);}, d: "温故而知新。", lore: "学而时习之，不亦说乎？"},
      {n: "《道德经》", cost: 25, eff: S => {modProp("心态", 14); modProp("压力", -14); modProp("效率", -3);}, d: "上善若水。", lore: "道可道，非常道；名可名，非常名。"},
      {n: "《孙子兵法》", cost: 35, eff: S => {modProp("悟性", 9); modProp("效率", 5); modProp("压力", -3);}, d: "知己知彼。", lore: "兵者，诡道也。"},
      {n: "《昆虫记》", cost: 25, eff: S => {addSubj(S, "生物", 20); modProp("心态", 6);}, d: "微观世界的大千。", lore: "在蚂蚁的世界里，也有战争与和平。"},
      {n: "《海底两万里》", cost: 25, eff: S => {modProp("悟性", 8); modProp("心态", 6);}, d: "想象力是无价的。", lore: "海底的世界，比陆地更神秘。"},
      {n: "《钢铁是怎样炼成的》", cost: 20, eff: S => {modProp("心态", 10); modProp("压力", -7); modProp("健康", 3);}, d: "钢铁意志。", lore: "人最宝贵的是生命。"},
      {n: "《名人传》", cost: 30, eff: S => {modProp("心态", 8); modProp("悟性", 5);}, d: "伟人的苦难与光辉。", lore: "伟大的灵魂，在苦难中淬炼。"},
      {n: "《边城》", cost: 20, eff: S => {addSubj(S, "语文", 20); modProp("心态", 7);}, d: "湘西的温柔。", lore: "这个人也许永远不回来了，也许明天回来。"},
      {n: "《傅雷家书》", cost: 25, eff: S => {modProp("心态", 9); modProp("社交", 5);}, d: "父辈的叮咛。", lore: "孩子，你要做一个德艺俱备、人格卓越的艺术家。"},
      {n: "《中国国家地理》", cost: 35, eff: S => {addSubj(S, "地理", 25); modProp("悟性", 4);}, d: "大好河山。", lore: "从大兴安岭到南海之滨，每一寸土地都有它的故事。"},
      {n: "《少年法律读本》", cost: 30, eff: S => {addSubj(S, "政治", 25); modProp("心态", 5);}, d: "知法明理。", lore: "法律是底线，也是保护。"},
      {n: "《国富论》", cost: 50, eff: S => {modProp("经济", 150); modProp("悟性", 4); modProp("压力", 6);}, d: "看不见的手。", lore: "市场是一只看不见的手。"},
      {n: "《梦的解析》", cost: 45, eff: S => {modProp("心态", 8); modProp("悟性", 8); modProp("压力", 5);}, d: "潜意识之门。", lore: "梦，是愿望的达成。"},
      {n: "《人类简史》", cost: 50, eff: S => {modProp("悟性", 9); modProp("社交", 4); modProp("压力", 5);}, d: "认知革命。", lore: "智人之所以能统治世界，是因为我们相信虚构的故事。"},
      {
        n: "古籍残卷", cost: 150,
        eff: S => {
          const t = pickGoodTalent(1, 5);
          if (t) {
            gainTalent(t, "读书角·悟道"); count("bookTalent");
          } else {
            // 没有可解锁的正面天赋时，给悟性 —— 读书一定有收获
            modProp("悟性", 8); modProp("心态", 5);
            say("📖 你已阅尽群书，虽无新悟，心却静了几分。悟性 +8、心态 +5", "good");
          }
        },
        d: "消耗 150 经济，随机获得一个正面的 Lv.5 以下天赋；若无可解锁，改为悟性 +8",
        lore: "残卷泛黄，字迹模糊，却有先贤的气息。"
      },
      {
        n: "先贤手札", cost: 300,
        eff: S => {
          const t = pickGoodTalent(6, 9);
          if (t) {
            gainTalent(t, "读书角·顿悟"); count("bookTalent");
          } else {
            modProp("悟性", 12); modProp("效率", 4);
            say("📖 更高处已无书可读，但你从字里行间悟到了别的东西。悟性 +12、效率 +4", "good");
          }
        },
        d: "消耗 300 经济，随机获得一个正面的 Lv.6+ 天赋；若无可解锁，改为悟性 +12",
        lore: "手札上的字迹遒劲有力，仿佛先贤就在眼前。"
      },
    ];

    function openBookCorner(onDone) {
      const normal = BOOKS.filter(b => b.cost < 100);
      const special = BOOKS.filter(b => b.cost >= 100);
      const shuffled = [...normal].sort(() => Math.random() - 0.5);
      const picked = special.length > 0
        ? [...shuffled.slice(0, 2), special[rnd(special.length)]]
        : shuffled.slice(0, 3);
      let read = false;
      let closedByCancel = false;

      const opts = picked.map(b => ({
        t: TZ(b.n), sub: L("book.cost", b.cost),
        disabled: () => S.prop.经济 < b.cost,
        fn: () => {
          if (S.prop.经济 < b.cost) {say(L("book.poor"), "bad"); return;}
          modProp("经济", -b.cost);
          b.eff(S);
          count("read");
          S.didReadWeek = num(S.week, 0);
          read = true;
          say(L("book.read", TZ(b.n)), "good");
          checkAch(); renderHUD();
          showModal(L("book.title"), `<div style='line-height:1.62'>${TZ(b.lore) || "书页翻过，你感到有什么东西在心底沉淀下来。"}</div>`, [{
            t: L("book.close"), fn: () => { }
          }], () => {if (onDone) onDone();}, false, false, {kind: "free", badge: L("book.badge"), img: b.img});
        }
      }));
      opts.push({t: L("modal.cancel"), fn: () => {closedByCancel = true;}});

      showModal(L("book.title"), `<div>${L("book.body")}<br><span style="color:var(--dim);font-size:.85rem">${L("book.money", Math.round(S.prop.经济))}</span></div>`, opts, () => {
        if (closedByCancel || !read) {
          say(L("book.putBack"), "sys");
          setTimeout(ensureActionPanel, 0);
          return;
        }
        if (onDone) onDone();
      }, false, true, {kind: "free", badge: L("book.badge")});
    }

    /* ==================================================================
     * 成就
     * ================================================================== */
