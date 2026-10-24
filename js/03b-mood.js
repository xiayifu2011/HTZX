/* ==================================================================
 * 界面层 · 氛围特效（屏幕情绪）
 * ==================================================================
 * 让画面本身替玩家"感受"状态：
 *   压力爆表  → 四周涌起红雾 .mood-stress
 *   心态过低  → 整屏褪色灰暗 .mood-dark
 *   健康过低  → 画面失血发虚 .mood-weak
 *   经济见底  → 边角发冷发青 .mood-broke（最弱一档，不喧宾夺主）
 *
 * 三档强度：0 关 / 1 轻 / 2 重。数值越糟档位越高，特效越强。
 * 全部走 CSS 变量与 class，不改任何 DOM 结构，也不碰存档数据。
 *
 * 开关：GAME_CONFIG.mood（enabled / stressAt / darkAt / weakAt / brokeAt）
 *
 * 维护等级：界面层
 * ================================================================== */

    const MOOD_CLASSES = ["mood-stress", "mood-dark", "mood-weak", "mood-broke"];

    /* 上一次的状态，用于避免每帧重复写 class */
    let MOOD_LAST = "";

    function moodCfg() {
      const m = (typeof GAME_CONFIG !== "undefined" && GAME_CONFIG.mood) || {};
      return {
        enabled: m.enabled !== false,
        stressAt: num(m.stressAt, 100),
        darkAt: num(m.darkAt, 35),
        weakAt: num(m.weakAt, 30),
        brokeAt: num(m.brokeAt, 20),
        warnAt: num(m.warnAt, 78)      // 预警档：还没爆表，先给一点提示
      };
    }

    /* ==================================================================
     * 计算当前应该挂哪些 class
     * ------------------------------------------------------------------
     * 每一档都写成 "类名:强度"，强度 1 = 轻，2 = 重。
     * 最后由 CSS 按强度调 --mood-* 这几个变量。
     * ================================================================== */
    function moodState() {
      const out = {};
      if (!S) return out;
      const c = moodCfg();
      if (!c.enabled) return out;

      const st = clampNum(S.prop.压力, 0, 150, 0);
      const md = clampNum(S.prop.心态, 0, 150, 100);
      const hp = clampNum(S.prop.健康, 0, 150, 100);
      const mo = clampNum(S.prop.经济, 0, 1e9, 100);

      // 压力：先预警，再爆表
      if (st >= c.stressAt) out["mood-stress"] = 2;
      else if (st >= c.warnAt) out["mood-stress"] = 1;

      // 心态：越低越灰
      if (md <= c.darkAt) out["mood-dark"] = 2;
      else if (md <= c.darkAt + 20) out["mood-dark"] = 1;

      // 健康：越低越虚
      if (hp <= c.weakAt) out["mood-weak"] = 2;
      else if (hp <= c.weakAt + 20) out["mood-weak"] = 1;

      // 经济：见底时边缘发冷（最轻的一档）
      if (mo <= c.brokeAt) out["mood-broke"] = 1;

      return out;
    }

    /* ==================================================================
     * 把状态刷到 <html> 上
     * ------------------------------------------------------------------
     * 只在状态真的变了时才写 DOM —— renderHUD 每周会调好几次，
     * 无脑重写 class 会让 CSS 动画反复重启，红雾会一直闪。
     * ================================================================== */
    function updateMood() {
      const root = document.documentElement;
      if (!root || !root.classList) return;
      const st = moodState();

      // 结局画面不压特效：那是一段收束，不该再被红雾盖住
      const ending = S && S.over;
      const keys = Object.keys(st);
      const sig = ending ? "" : keys.sort().map(k => k + st[k]).join("|");
      if (sig === MOOD_LAST) return;
      MOOD_LAST = sig;

      MOOD_CLASSES.forEach(c => root.classList.remove(c));
      root.style.removeProperty("--mood-stress");
      root.style.removeProperty("--mood-dark");
      root.style.removeProperty("--mood-weak");
      root.style.removeProperty("--mood-broke");
      if (ending) return;

      keys.forEach(k => {
        root.classList.add(k);
        const lvl = clampNum(st[k], 1, 2, 1);
        const varName = "--mood-" + k.slice(5);        // mood-stress → --mood-stress
        root.style.setProperty(varName, String(lvl));
      });
    }

    /* 关掉全部特效（设置里点一下，或进结局时调用） */
    function clearMood() {
      const root = document.documentElement;
      if (!root || !root.classList) return;
      MOOD_CLASSES.forEach(c => root.classList.remove(c));
      MOOD_LAST = "";
    }

    /* ==================================================================
     * 氛围文案：状态糟糕时在日志里轻轻提一句（每周最多一次）
     * ================================================================== */
    let moodSaidWeek = -1;

    function moodWhisper() {
      if (!S) return;
      const c = moodCfg();
      if (!c.enabled) return;
      if (moodSaidWeek === num(S.week, -1)) return;      // 一周只说一次
      const st = clampNum(S.prop.压力, 0, 150, 0);
      const md = clampNum(S.prop.心态, 0, 150, 100);
      const hp = clampNum(S.prop.健康, 0, 150, 100);
      let line = "";
      if (st >= c.stressAt) line = L("mood.stress");
      else if (md <= c.darkAt) line = L("mood.dark");
      else if (hp <= c.weakAt) line = L("mood.weak");
      if (!line) return;
      moodSaidWeek = num(S.week, -1);
      say(line, "bad");
    }
