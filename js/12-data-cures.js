/* ==================================================================
 * 内容层 · 破茧（负面天赋消除表）
 * ==================================================================
 * 每个负面天赋的消除条件与弹窗文案。
 * talent 要消除的天赋 / stat 靠什么行为累积 / need 需要多少次
 * grant 消除后赠送的正面天赋（可留空）/ title 弹窗标题 / text 正文 / poem 诗句。
 *
 * 维护等级：内容层（可加破茧）
 * ============================================================ */

    const CURES = [
      {talent: "厌学", stat: "study", need: 12,
        title: "重新翻开书本",
        text: "你又一次坐回书桌前。起初只是机械地翻页，后来某一个瞬间，你忽然读懂了那一行字。\n原来你并不是讨厌学习本身，只是讨厌那个被推着往前走的自己。\n书页很薄，但你今天翻过去的，是压了很久的一座山。",
        poem: "山重水复疑无路，柳暗花明又一村。"},
      {talent: "重度厌学", stat: "study", need: 22,
        title: "与课本和解",
        text: "你曾经看见课本就反胃。但一次、两次、二十次之后，你发现自己不再需要咬着牙才能坐下来。\n不是你突然爱上了学习，而是你终于不再害怕它。\n能坐在书桌前这件事本身，就已经赢了。",
        poem: "千淘万漉虽辛苦，吹尽狂沙始到金。"},
      {talent: "学习特困生", stat: "study", need: 15,
        title: "困意被你赶走了",
        text: "以前一翻开书，眼皮就重得像挂了铅。\n现在你还是会困，但你已经学会在困意里多撑十分钟——而那十分钟，慢慢变成了半小时、一小时。\n你不是不困了，你只是比困意更倔。",
        poem: "锲而舍之，朽木不折；锲而不舍，金石可镂。"},
      {talent: "注意力涣散", stat: "study", need: 14,
        title: "把心收了回来",
        text: "窗外有鸟、走廊有人、同桌在转笔。\n你曾经每一秒都被它们偷走。现在它们还在，但你学会了把目光轻轻拽回纸上。\n专注不是天生的，是一次次走神后又一次次回来。",
        poem: "心不在焉，视而不见；心若在焉，万物皆明。"},
      {talent: "拖延症", stat: "study", need: 16, grant: "自律机器",
        title: "今天就把事做完",
        text: "「明天再说吧」这句话，你已经很久没说出口了。\n不是因为你变得有多勤快，而是你终于知道了：明天还会有明天的明天。\n今天能做完的事，就别留给那个更累的自己。",
        poem: "明日复明日，明日何其多。我生待明日，万事成蹉跎。"},
      {talent: "迟钝", stat: "read", need: 8,
        title: "慢一点，也没关系",
        text: "你反应比别人慢半拍，这从来不是错。\n一次一次地读、一遍一遍地想，那些别人一眼看穿的东西，你也终于在下一次相遇时认出了它。\n慢，是另一种方式的稳。",
        poem: "大器晚成，大音希声。"},
      {talent: "网瘾", stat: "rest", need: 10,
        title: "放下了那块屏幕",
        text: "你把手机扣在桌上，屏幕朝下。\n一开始手会痒，后来你发现窗外其实有风，楼下有人在打球，晚饭的香气从厨房飘过来。\n虚拟世界很热闹，但真实世界也有人等你好久。",
        poem: "偷得浮生半日闲，原来人间亦有味。"},
      {talent: "严重网瘾", stat: "rest", need: 14,
        title: "走出了那片峡谷",
        text: "一天不玩就浑身难受的日子，是真的过去了。\n你曾经在游戏里当王者，如今你在自己的日子里当了主人。\n账号还在，但你不再需要它来证明什么了。",
        poem: "一入峡谷深似海，回头是岸亦是春。"},
      {talent: "夜猫子", stat: "rest", need: 8, grant: "晨型人",
        title: "看见了清晨五点",
        text: "你第一次不是为了熬夜，而是为了早起而醒着。\n天还没亮透，操场上有雾，跑道上有露水。\n原来清晨的世界这么安静，安静得能听见自己的心跳。",
        poem: "一日之计在于晨，一年之计在于春。"},
      {talent: "长期失眠", stat: "rest", need: 12,
        title: "终于睡了一个整觉",
        text: "你闭上眼，没有数羊，没有翻来覆去。\n再睁开的时候，天已经亮了。\n那些夜里睁着眼想的事，白天想起来，其实没那么可怕。",
        poem: "夜夜除非，好梦留人睡。"},
      {talent: "多动症", stat: "rest", need: 8,
        title: "学会了安静地坐着",
        text: "你不是坐不住，你只是还没找到值得坐下来的事。\n当你真的沉进去，时间会自己放慢。\n那份停不下来的劲头，其实也是一种能量——只是现在，它有了方向。",
        poem: "心猿归正，意马收缰。"},
      {talent: "内耗者", stat: "rest", need: 10,
        title: "不再和自己吵架",
        text: "你曾经在深夜一遍遍重播那些没说好的话、没做对的事。\n现在你学会了在念头冒出来的时候，轻轻说一句：够了，睡吧。\n放过自己，也是一种能力。",
        poem: "抽刀断水水更流，不如放下任东流。"},
      {talent: "玻璃心", stat: "rest", need: 8,
        title: "心长出了一层茧",
        text: "别人的一句话，还是会让你愣一下——但只愣一下。\n敏感不是缺点，它让你能听见别人听不见的声音。\n你只是终于学会了：听见之后，不必每一句都往心里去。",
        poem: "感时花溅泪，恨别鸟惊心；但使心能定，风过不留痕。"},
      {talent: "暴躁", stat: "rest", need: 8,
        title: "火气慢慢降了下来",
        text: "一点就着的日子过去了。\n你不是不再生气，而是学会了在那三秒里先吸一口气。\n三秒很短，却足够把你从一场后悔里拉回来。",
        poem: "猝然临之而不惊，无故加之而不怒。"},
      {talent: "深度抑郁", stat: "rest", need: 14,
        title: "心里的灯又亮了",
        text: "那盏熄灭了很久的灯，不知道从哪天起，又有一点微弱的光。\n它很小，但它还在。\n你不需要马上好起来，你只需要知道——天亮这件事，不以你的意志为转移，它一定会来。",
        poem: "沉舟侧畔千帆过，病树前头万木春。"},
      {talent: "社恐", stat: "social", need: 10, grant: "热情",
        title: "先说了第一句",
        text: "你曾经在人多的地方浑身不自在。\n后来你试着先开口说了第一句话——对方笑了，你也笑了。\n原来最难的不是社交，是开口前的那三秒。",
        poem: "独坐幽篁里，亦有人来听。"},
      {talent: "社交恐惧", stat: "social", need: 15,
        title: "走出了那间教室",
        text: "和同桌说话会紧张这件事，已经是很久以前的事了。\n你依然喜欢安静，但安静不再是躲藏。\n你可以选择独处，也可以选择人群——这中间的差别，叫作自由。",
        poem: "举世皆浊我独清，众人皆醉我独醒；清者自清，醒者从容。"},
      {talent: "考试焦虑", stat: "goodExam", need: 4,
        title: "考场不再发抖",
        text: "发下卷子的那一刻，你的手还是有点凉——但它稳住了。\n四次像样的成绩告诉你：你准备过的东西，不会因为紧张就消失。\n深呼吸，写名字，翻开第一页。",
        poem: "近乡情更怯，然归途终须至。"},
      {talent: "体弱多病", stat: "sport", need: 8,
        title: "身体慢慢跟上来了",
        text: "你曾经跑两百米就要停下来扶着膝盖喘。\n后来是四百米、八百米。\n病弱不是你的标签，它只是你出发时的起点——而你已经走了很远。",
        poem: "千磨万击还坚劲，任尔东西南北风。"},
    ];

    /* 累积「破茧」进度（只加数字，不弹窗） */

    function bumpCure(stat) {
      if (!S || S.over || !stat) return;
      S.cure = S.cure || {};
      for (const c of CURES) {
        if (c.stat !== stat) continue;
        if (!Talent.have(c.talent)) {S.cure[c.talent] = 0; continue;}
        S.cure[c.talent] = clampNum((S.cure[c.talent] || 0) + 1, 0, 999);
      }
    }

    /* 检查是否有天赋可以「破茧」，有就弹窗，弹完继续检查下一个 */

    function flushCure(done) {
      if (!S || S.over) {done && done(); return;}
      S.cure = S.cure || {};
      const hit = CURES.find(c => Talent.have(c.talent) && (S.cure[c.talent] || 0) >= c.need);
      if (!hit) {done && done(); return;}

      S.cure[hit.talent] = 0;
      Talent.remove(hit.talent);
      let got = "";
      if (hit.grant && !Talent.have(hit.grant)) {
        gainTalent(hit.grant, "破茧·免费");
        if (Talent.have(hit.grant)) got = `<div style="margin-top:10px;color:var(--green)">🌱 你同时领悟了新天赋【${hit.grant}】</div>`;
      }
      say(`🌱 破茧：你走出了【${hit.talent}】的阴影。`, "talent");
      toast(`🌱 破茧：${hit.talent} 已消除`, true);
      checkAch();
      renderHUD();

      const body = `<div style="line-height:2">
        <div style="color:var(--red);font-size:.9rem">已消除负面天赋：<b>${hit.talent}</b></div>
        <div style="margin-top:10px;white-space:pre-wrap">${hit.text}</div>
        ${got}
        <div style="margin-top:12px;color:var(--dim);font-size:.82rem;font-style:italic">「${hit.poem}」</div>
      </div>`;
      showPopup({
        kind: "free", badge: "🌱 破茧", title: hit.title, body: body,
        options: [{t: "继续走下去"}]
      }, () => flushCure(done));
    }

    /* 天赋面板上显示破茧进度，例如「🌱 5/12」 */

    function cureProgress(name) {
      if (!S || !S.cure || !Talent.have(name)) return "";
      const c = CURES.find(x => x.talent === name);
      if (!c) return "";
      const n = S.cure[name] || 0;
      return n > 0 ? ` <span style="color:var(--green);font-size:.72rem">🌱${n}/${c.need}</span>` : "";
    }

    /* ==================================================================
     * 结局
     * ================================================================== */
