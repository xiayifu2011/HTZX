/* ==================================================================
 * 内容层 · 假期旅游副本
 * ==================================================================
 * v1.3：假期开始时，如果手头的钱够，可以选择出门旅游。
 *
 * ── 流程 ────────────────────────────────────────────────
 *   假期开始 → 问「要不要出去走走」
 *     ├─ 钱不够 → 只提示一句，照常过假期
 *     └─ 钱够   → 选省内 / 全国
 *                → 弹出一张地图，标出所有景点
 *                → 玩家点选 2~3 个景点（每个景点都带花费）
 *                → 逐一站过去，每个景点弹一条专属事件
 *                → 逛完照常跑常规假期事件
 *
 * ── 花费 ────────────────────────────────────────────────
 *   省内 150~400，全国 600~1500（含往返车费与门票）。
 *   出门旅游会扣钱，但换来的是别处换不到的东西：
 *   见闻（悟性）、放松（压力）、陪伴（亲情）、以及少数几个只有路上才能遇到的天赋。
 *
 * ── 加景点 ──────────────────────────────────────────────
 *   1. 往 TRAVEL_SPOTS 里加一条（x / y 是地图上的百分比坐标，0~100）
 *   2. 写好 intro（到达时的一句话）和 opts（在那儿发生的事）
 *   3. 跑 node tools/check-content.js 校验
 *
 * 维护等级：内容层（★常改）
 * ============================================================ */

    /* ==================================================================
     * 两档线路
     * ------------------------------------------------------------------
     * minMoney：至少要有多少钱才会问你「要不要出去走走」
     * pick：这次能去几个地方
     * ================================================================== */
    const TRAVEL_ROUTES = [
      {id: "local", name: "省内", icon: "🏞️", minMoney: 100, pick: 2,
       desc: "不出云南。车程都在半天以内，票价也还负担得起。"},
      {id: "far", name: "全国", icon: "🗺️", minMoney: 380, pick: 3,
       desc: "出省。要坐很久的车，但有些地方，只在课本上见过。"}
    ];

    /* ==================================================================
     * 景点表
     * ------------------------------------------------------------------
     * x / y = 在地图上的位置（0~100 的百分比）
     * cost  = 这一站的花费（会从经济里扣）
     * intro = 到达时的一句话
     * opts  = 在这儿发生的事（支持中文指令，见 js/13-engine-effects.js）
     * ================================================================== */
    const TRAVEL_SPOTS = [
      /* ---------------- 省内 ---------------- */
      {id: "fxh", route: "local", name: "抚仙湖", x: 62, y: 62, cost: 110,
        intro: "从玉溪出发，一个多小时就到了。\n湖水蓝得不讲道理，站在岸边能一直看到对岸的山。",
        opts: [
          {t: "沿着湖走一整天", run: ["健康 +8", "压力 -14", "心态 +10", "悟性 +5", "提示 你走完了半圈湖岸，回程时腿是酸的，心里是空的。!good"]},
          {t: "下水游一趟", run: ["健康 +10", "心态 +8", "压力 -10", "计数 运动", "提示 湖水凉得你叫出了声，然后就不想上岸了。!good"]},
          {t: "坐在岸边发呆", run: ["心态 +12", "压力 -12", "悟性 +4", "提示 你什么也没做，看了一下午的水。!good"]},
        ]},
      {id: "ails", route: "local", name: "哀牢山", x: 40, y: 74, cost: 130,
        intro: "山里的温度和坝子里差了七八度。\n云在半山腰飘着，公路一圈一圈地往上绕。",
        opts: [
          {t: "爬到山顶", run: ["健康 +10", "压力 -12", "悟性 +6", "效率 +5", "计数 运动", "提示 站在山顶往下看，来时的公路细得像一根线。!good"]},
          {t: "在山里住一晚", run: ["心态 +10", "健康 +5", "悟性 +7", "提示 夜里能听见虫叫，和城里完全不一样。!good"]},
          {t: "在山脚下转转", run: ["健康 +4", "心态 +6", "压力 -7", "提示 你买了一点山里人自己晒的干菌子。!good"]},
        ]},
      {id: "km", route: "local", name: "昆明 · 石林", x: 68, y: 44, cost: 150,
        intro: "灰黑色的石头从地里长出来，一根一根，高高低低。\n导游说，这些石头是海水泡了两亿七千万年泡出来的。",
        opts: [
          {t: "认真听讲解", run: ["悟性 +9", "效率 +5", "提示 你第一次知道，石头也是有年纪的。!good"]},
          {t: "在石缝里钻来钻去", run: ["健康 +7", "心态 +8", "压力 -9", "计数 运动", "提示 有一处窄到要侧着身子过。!good"]},
          {t: "找个角落写生", run: ["悟性 +8", "心态 +6", "健康 -3", "提示 你画了两小时，画出来的是一堆歪歪扭扭的柱子。!good"]},
        ]},
      {id: "dl", route: "local", name: "大理古城", x: 30, y: 40, cost: 190,
        intro: "苍山在城后面立着，洱海在城前面摊开。\n古城的石板路被踩得发亮，两边全是卖扎染和银器的铺子。",
        opts: [
          {t: "骑车环洱海", run: ["健康 +10", "压力 -13", "心态 +9", "计数 运动", "提示 骑到一半下起了雨，你淋着骑完了剩下的一半。!good"]},
          {t: "在古城里乱逛", run: ["社交 +6", "心态 +7", "悟性 +5", "压力 -8", "提示 你在一家小店里坐了很久，老板给你倒了茶。!good"]},
          {t: "爬苍山", run: ["健康 +9", "压力 -10", "悟性 +6", "计数 运动", "提示 山顶的云走得很快。!good"]},
        ]},
      {id: "lj", route: "local", name: "丽江古城", x: 24, y: 26, cost: 210,
        intro: "水从古城的每一条街边流过，水里有水草。\n据说这里的路是照着水的走向修的——顺着水走能进城，逆着水走能出城。",
        opts: [
          {t: "顺着水走", run: ["悟性 +7", "心态 +8", "压力 -9", "提示 你走了一下午，最后真的走回了入口。!good"]},
          {t: "去看一场表演", run: ["社交 +7", "心态 +9", "悟性 +4", "提示 台上的人在唱你听不懂的调子，但很好听。!good"]},
          {t: "爬到狮子山上看古城", run: ["健康 +5", "心态 +10", "悟性 +6", "压力 -10", "提示 整座城铺在下面，屋顶一片连着一片。!good"]},
        ]},
      {id: "yy", route: "local", name: "元阳梯田", x: 62, y: 84, cost: 180,
        intro: "从山脚到山顶，一层一层的田。\n当地人说，这是哈尼人用一千三百年挖出来的。",
        opts: [
          {t: "天没亮就起来等日出", run: ["健康 -4", "心态 +12", "悟性 +8", "压力 -10", "提示 太阳出来的一瞬间，整片梯田变成了镜子。!good"]},
          {t: "下到田里去", run: ["健康 +6", "心态 +7", "悟性 +5", "计数 运动", "提示 田埂窄得只能一个人过，你走得小心翼翼。!good"]},
          {t: "和村里人聊天", run: ["社交 +8", "悟性 +6", "心态 +6", "提示 老人用你半懂不懂的话讲了一整个下午。!good"]},
        ]},
      {id: "bn", route: "local", name: "西双版纳", x: 48, y: 94, cost: 230,
        intro: "一下车，空气是湿的、热的，黏在皮肤上。\n路两边全是你在课本插画里才见过的树。",
        opts: [
          {t: "进热带雨林", run: ["健康 +8", "悟性 +9", "心态 +8", "压力 -11", "计数 运动", "提示 导游指着一株植物说，它比恐龙还老。!good"]},
          {t: "去看大象", run: ["心态 +10", "悟性 +6", "社交 +5", "提示 有一头小象一直在用鼻子卷工作人员的裤腿。!good"]},
          {t: "逛夜市", run: ["社交 +8", "心态 +9", "压力 -9", "经济 -40", "提示 你吃了一路，最后数了数钱包。!good"]},
        ]},
      {id: "xgll", route: "local", name: "香格里拉", x: 14, y: 14, cost: 240,
        intro: "海拔三千三。下车第一步就有点喘。\n天蓝得发暗，草甸一直铺到山脚下。",
        opts: [
          {t: "去普达措", run: ["健康 +7", "心态 +11", "悟性 +7", "压力 -12", "计数 运动", "提示 湖边的树上挂着松萝，导游说那东西只对最干净的空气才长。!good"]},
          {t: "在草甸上躺一会儿", run: ["心态 +12", "压力 -13", "健康 +4", "提示 你躺了很久，云一朵一朵地从眼前过去。!good"]},
          {t: "去一趟松赞林寺", run: ["悟性 +8", "心态 +8", "压力 -8", "提示 殿里很暗，酥油灯的味道很重。!good"]},
        ]},

      /* ---------------- 全国 ---------------- */
      {id: "bj", route: "far", name: "北京", x: 76, y: 26, cost: 950,
        intro: "第一次出这么远的门。\n火车走了两天一夜，窗外的景色从山变成了平原。",
        opts: [
          {t: "天安门看升旗", run: ["心态 +14", "压力 -10", "悟性 +7", "健康 -4", "提示 三点半就到了广场，人已经站满了。国歌响的时候，你站直了。!good"]},
          {t: "爬长城", run: ["健康 +10", "压力 -12", "悟性 +6", "计数 运动", "提示 台阶陡得离谱，你爬到第四个烽火台就爬不动了。!good"]},
          {t: "逛故宫", run: ["悟性 +10", "心态 +8", "效率 +5", "提示 从午门走到神武门，走了一整个下午。!good"]},
          {t: "去一趟清华北大", run: ["悟性 +12", "效率 +8", "心态 +9", "提示 你在门口站了很久，没进去。!good"]},
        ]},
      {id: "sh", route: "far", name: "上海", x: 88, y: 48, cost: 780,
        intro: "地铁比你想的快得多，人也比你想的多得多。\n出站的那一刻，你被裹进了一股往前走的人流里。",
        opts: [
          {t: "外滩看夜景", run: ["心态 +12", "悟性 +7", "压力 -10", "提示 对岸的楼全亮着，江上有船慢慢开过去。!good"]},
          {t: "去一趟博物馆", run: ["悟性 +11", "效率 +6", "提示 你在青铜器那一层待了三个小时。!good"]},
          {t: "在弄堂里乱走", run: ["社交 +6", "心态 +8", "悟性 +5", "提示 晾衣竿从这家的窗户伸到那家的窗户。!good"]},
        ]},
      {id: "xa", route: "far", name: "西安", x: 64, y: 32, cost: 700,
        intro: "城墙就在市中心站着，一圈，十三公里。\n车从城门洞里穿过去，像穿过一条时间的隧道。",
        opts: [
          {t: "看兵马俑", run: ["悟性 +13", "心态 +10", "效率 +6", "提示 一号坑的那一刻，你一句话也说不出来。!good"]},
          {t: "骑车上城墙", run: ["健康 +9", "压力 -11", "悟性 +6", "计数 运动", "提示 骑完一圈十三公里，太阳正好落下去。!good"]},
          {t: "回民街吃一路", run: ["心态 +10", "社交 +5", "健康 +4", "经济 -60", "提示 你从街头吃到街尾，最后扶着墙走回旅馆。!good"]},
        ]},
      {id: "gl", route: "far", name: "桂林", x: 70, y: 66, cost: 560,
        intro: "山是一根一根单独立着的，不像别处的山连成一片。\n船在江上走，山在两边慢慢往后退。",
        opts: [
          {t: "坐竹筏游漓江", run: ["心态 +12", "压力 -13", "悟性 +7", "提示 水浅的地方能看见底下的石头。!good"]},
          {t: "爬一座山", run: ["健康 +9", "压力 -10", "悟性 +5", "计数 运动", "提示 山顶能看见整条江拐了个弯。!good"]},
          {t: "在西街待一天", run: ["社交 +8", "心态 +9", "压力 -9", "提示 街上有各种口子的外国人在聊天。!good"]},
        ]},
      {id: "san", route: "far", name: "三亚", x: 72, y: 88, cost: 880,
        intro: "飞机落地的那一刻，热浪从舱门涌进来。\n这是你第一次见到海。",
        opts: [
          {t: "在海边待一整天", run: ["健康 +10", "心态 +14", "压力 -16", "提示 你一直走到太阳沉进海里的那一刻。!good"]},
          {t: "学潜水", run: ["健康 +6", "悟性 +8", "心态 +11", "计数 运动", "提示 水下很安静，只能听见自己的呼吸。!good"]},
          {t: "早起看日出", run: ["心态 +11", "压力 -11", "悟性 +5", "健康 -3", "提示 五点半的海边只有你和几个拍照的人。!good"]},
        ]},
      {id: "cd", route: "far", name: "成都", x: 56, y: 50, cost: 600,
        intro: "整座城市都是慢的。茶馆里坐满了人，一坐就是一下午。",
        opts: [
          {t: "去看大熊猫", run: ["心态 +13", "悟性 +6", "压力 -11", "提示 有一只一直在吃，吃累了就躺下接着吃。!good"]},
          {t: "在茶馆坐一下午", run: ["心态 +11", "压力 -13", "社交 +6", "提示 隔壁桌的老爷爷在下象棋，你看了两个小时。!good"]},
          {t: "吃火锅", run: ["心态 +10", "健康 -4", "社交 +5", "经济 -50", "提示 辣得你眼泪都出来了，但第二天又想去。!good"]},
        ]},
      {id: "xz", route: "far", name: "西藏", x: 22, y: 34, cost: 950,
        intro: "海拔三千六。第一天晚上头疼得睡不着。\n但第二天天亮的时候，你看见了一辈子忘不掉的颜色。",
        opts: [
          {t: "去布达拉宫", run: ["悟性 +12", "心态 +13", "压力 -12", "健康 -5", "提示 台阶很多，你走得很慢。到顶的时候，整座拉萨在下面。!good"]},
          {t: "去纳木错", run: ["心态 +14", "悟性 +9", "压力 -14", "健康 -4", "提示 湖比你想的大得多，大得像海。!good"]},
          {t: "在八廓街走一圈", run: ["悟性 +8", "心态 +10", "社交 +6", "提示 有人一路磕着长头过去，你站了很久。!good"]},
        ]},
      {id: "hz", route: "far", name: "杭州", x: 84, y: 52, cost: 640,
        intro: "西湖不大，绕一圈也就十五公里。\n但每个角度都不一样，走一步就是一个新的样子。",
        opts: [
          {t: "骑车绕西湖", run: ["健康 +9", "心态 +11", "压力 -12", "计数 运动", "提示 苏堤上的人很多，你下来推着走了一段。!good"]},
          {t: "坐船到湖心亭", run: ["心态 +12", "悟性 +7", "压力 -10", "提示 湖心看四岸，四岸看湖心。!good"]},
          {t: "去灵隐寺", run: ["悟性 +9", "心态 +9", "压力 -9", "提示 寺里的树很老，遮住了大半个院子。!good"]},
        ]},
      {id: "dh", route: "far", name: "敦煌", x: 44, y: 22, cost: 820,
        intro: "戈壁上什么都没有，走了很远才看见一座城。\n鸣沙山在城南，风一吹，沙子会响。",
        opts: [
          {t: "看莫高窟", run: ["悟性 +13", "心态 +11", "效率 +6", "提示 洞里不许拍照，讲解员的手电照亮了一千年前的颜色。!good"]},
          {t: "爬鸣沙山", run: ["健康 +8", "压力 -11", "悟性 +6", "计数 运动", "提示 爬一步退半步，下来的时候鞋里全是沙。!good"]},
          {t: "等一场日落", run: ["心态 +13", "悟性 +8", "压力 -10", "提示 太阳落下去之后，天边烧了一整片。!good"]},
        ]},
      {id: "ts", route: "far", name: "泰山", x: 80, y: 36, cost: 480,
        intro: "夜里十点开始爬，前后都是手电的光。\n有人说，爬上去是为了看日出。",
        opts: [
          {t: "一夜爬到顶", run: ["健康 +6", "心态 +14", "压力 -12", "悟性 +7", "计数 运动", "提示 十八盘那一段，你几乎是手脚并用地上去的。日出的时候，所有人在喊。!good"]},
          {t: "坐缆车上去", run: ["心态 +9", "悟性 +5", "压力 -9", "经济 -80", "提示 省力，但少了一半的意思。"]},
          {t: "爬一半就下来了", run: ["健康 +3", "心态 -4", "压力 +3", "提示 你在中天门坐了很久，然后转身往下走。"]},
        ]},
    ];

    /* 按线路取出景点列表 */
    function spotsOf(routeId) {
      return TRAVEL_SPOTS.filter(s => s.route === routeId);
    }

    /* ==================================================================
     * 旅游流程
     * ================================================================== */

    /* 假期开始时问一句：要不要出去走走 */
    function offerTravel(done) {
      if (!S || S.over) {done && done(); return;}
      const money = clampNum(S.prop && S.prop.经济, 0, 1e9, 0);
      /* ★ 门槛按「这条线路最便宜的一站」算，而不是写死的数字。
       * 以前 minMoney 是手写的，一旦低于最便宜的景点就会出现
       * 「选了全国，结果一站都去不起」的尴尬。 */
      const cheapestOf = rid => {
        const cs = spotsOf(rid).map(x => num(x.cost, 0));
        return cs.length ? Math.min.apply(null, cs) : 0;
      };
      const routes = TRAVEL_ROUTES.filter(r => money >= cheapestOf(r.id));
      if (!routes.length) {done && done(); return;}      // 钱不够，不问

      const body = `<div style="line-height:1.62">
        <div>${L("travel.lead")}</div>
        <div style="margin-top:6px;color:var(--gold)">${L("travel.money")}：<b>${Math.round(money)}</b></div>
        <div style="margin-top:4px;color:var(--dim);font-size:.85rem">${L("travel.hint")}</div>
      </div>`;
      const opts = routes.map(r => ({
        t: `${r.icon} ${L("travel.go", r.name)}`,
        sub: `${L("travel.from", cheapestOf(r.id))} · ${L("travel.pick", r.pick)}`,
        fn: () => {openTravelMap(r.id, done);}
      }));
      opts.push({t: L("travel.stay"), sub: L("travel.staySub"), fn: () => {done && done();}});
      showPopup({kind: "free", badge: "🧳 假期", title: L("travel.title"), body: body, options: opts}, () => {});
    }

    /* 地图：标出所有景点，玩家点选若干个
     * pickOverride —— 临时改掉「这趟能去几站」。
     * 国庆只有七天，走一站就够了，所以短途传 1 进来。 */
    function openTravelMap(routeId, done, pickOverride) {
      const route = TRAVEL_ROUTES.find(r => r.id === routeId) || TRAVEL_ROUTES[0];
      const spots = spotsOf(route.id);
      const money = clampNum(S.prop && S.prop.经济, 0, 1e9, 0);
      const want = clampNum(pickOverride, 0, 9, route.pick) || num(route.pick, 2);
      const chosen = [];
      let spent = 0;
      /* ★ 钱不够走满时，能走几站就走几站 —— 至少一站就能出发。
       * 以前「出发」按钮要求选够 want 站，钱只够一站的话
       * 按钮永远是灰的，玩家卡在地图上进退不得。
       * 现在：want 是"理想站数"，实际只要 ≥1 站就能走。 */
      const MIN_PICK = 1;

      const dots = spots.map(s => {
        const afford = (money - spent - num(s.cost, 0)) >= 0 || chosen.indexOf(s.id) >= 0;
        return `<button class="spot-dot${afford ? "" : " spot-poor"}" data-spot="${s.id}"
          style="left:${s.x}%;top:${s.y}%" title="${s.name}">
          <i></i><span>${s.name}</span></button>`;
      }).join("");

      const body = `<div style="line-height:1.62">
        <div style="color:var(--dim);font-size:.85rem">${L("travel.mapLead", route.name, want)}</div>
        <div class="travel-map ${route.id === "local" ? "map-local" : "map-far"}">
          ${dots}
          <div class="map-label">${route.id === "local" ? "云南" : "中国"}</div>
        </div>
        <div id="travelInfo" style="margin-top:6px;color:var(--gold);font-size:.9rem">
          ${L("travel.chosen", 0, want)}　${L("travel.money")}：<b>${Math.round(money)}</b>
        </div>
        <div id="travelWarn" style="margin-top:4px;color:var(--red);font-size:.85rem;min-height:1.2em"></div>
      </div>`;

      const refresh = () => {
        const info = document.getElementById("travelInfo");
        const warn = document.getElementById("travelWarn");
        if (info) info.innerHTML = `${L("travel.chosen", chosen.length, want)}　${L("travel.money")}：<b>${Math.round(money - spent)}</b>`
          + (spent ? `　<span style="color:var(--dim)">${L("travel.spend")} ${spent}</span>` : "");
        document.querySelectorAll(".spot-dot").forEach(b => {
          b.classList.toggle("spot-on", chosen.indexOf(b.dataset.spot) >= 0);
          const s = spots.find(x => x.id === b.dataset.spot);
          const ok = chosen.indexOf(b.dataset.spot) >= 0 || (money - spent - num(s && s.cost, 0)) >= 0;
          b.classList.toggle("spot-poor", !ok);
        });
        const okBtn = document.getElementById("btnTravelGo");
        if (okBtn) {okBtn.disabled = chosen.length < MIN_PICK;}
        if (warn) {
          if (chosen.length >= want) warn.textContent = "";
          else if (chosen.length >= MIN_PICK) {
            /* 已经能出发了，但还没选满 —— 告诉玩家是钱不够还是自己不想去 */
            const rest = spots.filter(x => chosen.indexOf(x.id) < 0);
            const cheapest = rest.length ? Math.min.apply(null, rest.map(x => num(x.cost, 0))) : 0;
            warn.textContent = (chosen.length < want && money - spent < cheapest)
              ? L("travel.onlyOne", chosen.length) : "";
          } else warn.textContent = "";
        }
      };

      const opts = [{
        t: L("travel.confirm"), fn: () => {
          if (chosen.length < MIN_PICK) return;
          S.prop.经济 = Math.round(money - spent);
          if (typeof renderHUD === "function") renderHUD();
          say(L("travel.setoff", route.name), "sys");
          runTravelStops(chosen.slice(), done);
        },
        id: "btnTravelGo"
      }, {
        t: L("travel.back"), fn: () => {offerTravel(done);}
      }];

      showPopup({kind: "free", badge: "🗺️ 地图", title: L("travel.mapTitle", route.name), body: body,
        options: opts, afterRender: () => {
          document.querySelectorAll(".spot-dot").forEach(b => {
            b.onclick = () => {
              const id = b.dataset.spot;
              const s = spots.find(x => x.id === id);
              if (!s) return;
              const at = chosen.indexOf(id);
              if (at >= 0) {chosen.splice(at, 1); spent -= num(s.cost, 0);}
              else {
                if (chosen.length >= want) {
                  const w = document.getElementById("travelWarn");
                  if (w) w.textContent = L("travel.full", want);
                  return;
                }
                if (money - spent - num(s.cost, 0) < 0) {
                  const w = document.getElementById("travelWarn");
                  if (w) w.textContent = L("travel.poor", s.name);
                  return;
                }
                chosen.push(id); spent += num(s.cost, 0);
              }
              refresh();
            };
          });
          refresh();
        }}, () => {});
    }

    /* ==================================================================
     * 短途：节假日里抽空出去走走
     * ------------------------------------------------------------------
     * 只有七天假，去不了太远，也去不了太多地方 —— 固定省内、一站。
     * 想给别的长假日也开这个口子，在 HOLIDAY_EVENTS 那一条上加 allowTravel: true 即可。
     * ================================================================== */
    function openShortTrip(done, badge) {
      if (!S || S.over) {done && done(); return;}
      const money = clampNum(S.prop && S.prop.经济, 0, 1e9, 0);
      const cheapest = Math.min.apply(null, spotsOf("local").map(s => num(s.cost, 0)));
      if (money < cheapest) {done && done(); return;}      // 连最近的一站都去不起

      showPopup({
        kind: "free",
        badge: badge || "🧳 短途",
        title: L("travel.shortTitle"),
        body: `<div style="line-height:1.62">
          <div>${L("travel.shortLead")}</div>
          <div style="margin-top:6px;color:var(--gold)">${L("travel.money")}：<b>${Math.round(money)}</b></div>
          <div style="margin-top:4px;color:var(--dim);font-size:.85rem">${L("travel.shortHint")}</div>
        </div>`,
        options: [
          {t: L("travel.shortGo"), sub: L("travel.shortGoSub"), fn: () => {openTravelMap("local", done, 1);}},
          {t: L("travel.stay"), sub: L("travel.staySub"), fn: () => {done && done();}}
        ]
      }, () => {});
    }

    /* 一站一站走过去 */
    function runTravelStops(ids, done) {
      if (!ids || !ids.length) {done && done(); return;}
      const id = ids.shift();
      const spot = TRAVEL_SPOTS.find(s => s.id === id);
      if (!spot) {runTravelStops(ids, done); return;}

      const body = `<div style="line-height:1.62">
        <div style="white-space:pre-wrap">${spot.intro}</div>
        <div style="margin-top:6px;color:var(--dim);font-size:.85rem">${L("travel.at", spot.name)}</div>
      </div>`;
      const opts = (spot.opts || []).map(o => ({
        t: o.t,
        fn: () => {if (typeof execOption === "function") execOption(o);}
      }));
      if (!opts.length) opts.push({t: L("modal.continue"), fn: () => { }});

      showPopup({
        kind: "event",
        badge: "🧳 " + spot.name,
        title: spot.name,
        body: body,
        options: opts
      }, () => {
        if (typeof renderHUD === "function") renderHUD();
        runTravelStops(ids, done);
      });
    }
