/* ==================================================================
 * 引擎层 · 天赋管理
 * ==================================================================
 * 天赋的拥有、矛盾裁剪、解锁判定、等级上限、悟性消耗。
 *
 * 维护等级：引擎层（一般不动）
 * ============================================================ */

    const Talent = {
      owned: [],
      have(n) {return this.owned.includes(n)},
      solve() {
        const sorted = [...this.owned].sort((a, b) => TALENTS[b].lv - TALENTS[a].lv);
        const banned = new Set(), kept = [];
        for (const t of sorted) {
          if (banned.has(t)) continue;
          kept.push(t);
          TALENTS[t].inc.forEach(x => banned.add(x));
        }
        this.owned = kept;
      },
      countByLevel() {
        const c = {};
        this.owned.forEach(t => {const lv = TALENTS[t].lv; c[lv] = (c[lv] || 0) + 1;});
        return c;
      },
      unlock(name) {
        const me = TALENTS[name];
        if (this.have(name)) return [false, "已拥有该天赋"];
        const byLv = this.countByLevel();
        if ((byLv[me.lv] || 0) >= 3) return [false, `Lv.${me.lv} 天赋已达上限(3个)`];
        const removed = [];
        for (const c of me.inc) {
          if (this.have(c)) {
            if (TALENTS[c].lv >= me.lv) return [false, `已有更高等级矛盾天赋【${c}】`];
            removed.push(c);
            this.owned = this.owned.filter(x => x !== c);
          }
        }
        this.owned.push(name);
        this.solve();
        return [true, null, removed];
      },
      remove(name) {this.owned = this.owned.filter(x => x !== name); this.solve()}
    };

    function gainTalent(name, reason) {
      if (Talent.have(name)) return;
      const t = TALENTS[name];
      if (!t) return;
      if (t.lv >= 7 && S && S.prop.悟性 < 120 && !(reason || "").includes("悟道")) {
        say(`【${name}】需要极高的悟性（≥120），你尚未触及。`, "bad");
        modProp("悟性", 2);
        return;
      }
      if (t.lv >= 6 && S && !(reason || "").includes("悟道")) {
        const ok = S.prop.悟性 >= 110 || S.prop.心态 >= 110 || S.prop.健康 >= 110 || S.prop.效率 >= 110;
        if (!ok) {say(`【${name}】的门槛太高，你尚未触及。`, "bad"); modProp("悟性", 2); return;}
      }
      const cost = t.lv * 5;
      if (S && S.prop.悟性 < cost && !(reason || "").includes("免费")) {
        say(`解锁【${name}】需要 ${cost} 悟性，你悟性不足（当前 ${Math.round(S.prop.悟性)}）。`, "bad");
        return;
      }
      if (S && !(reason || "").includes("免费")) modProp("悟性", -cost);
      const [ok, msg, removed] = Talent.unlock(name);
      if (ok) {
        if (removed && removed.length) {
          say(`🔄 获得【${name}】后，原有的低等级矛盾天赋【${removed.join("、")}】被取代。`, "sys");
        }
        say(`🔓 获得天赋【${name}】(Lv.${t.lv})——${t.desc}${reason ? `(${reason})` : ""}`, "talent");
        toast(`🔓 天赋:${name}`);
      } else {
        say(`未能获得【${name}】:${msg}。但你在尝试中有所感悟。`, "bad");
        modProp("悟性", 3);
      }
    }
