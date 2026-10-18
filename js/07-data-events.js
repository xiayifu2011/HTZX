/* ==================================================================
 * 内容层 · 随机事件表
 * ==================================================================
 * ★ 社团最常改的文件。
 * 每条事件：id 唯一编号 / w 出现权重 / t 标题 / c 正文 / img 配图(可选)
 *          cond 出现条件(可选) / opts 选项列表
 * 选项的 run 可以写中文指令数组（见 js/13-engine-effects.js），也可以写函数。
 *
 * 维护等级：内容层（★常改）
 * ★ 概率控制（写在事件里，可选）：
 *   once: true     一生只出现一次
 *   maxTimes: 3    最多出现 3 次
 *   decay: 0.5     每出现一次权重 ×0.5
 *   minTerm/maxTerm  限制出现在哪几个学期
 *
 * ── 时段 slot（1.0 起每条事件都要写，别让事件跑错地方）──────────────
 *   slot: "weekday"                  只在周中（住校）出现
 *   slot: "weekend"                  只在周末（回家）出现
 *   slot: ["weekday", "clubday"]     周中和周三社团课都能遇到
 *   不写 = 任何时段都可能遇到
 *
 *   判据很简单：校园里发生的事写 weekday，家里/街上发生的事写 weekend。
 *   例如「手机摔碎了」「深夜来电」必须 weekend（住校根本没有手机）；
 *   「随堂小测」「宿舍熄灯」必须 weekday（周末不在学校）。
 * ============================================================ */

    const EVENTS = [
      {
        id: "rain", w: 6, slot: "weekend", t: "突如其来的暴雨",
        c: "回家路上突降暴雨，你没带伞，离家还有两公里。\n雨点砸在柏油路上，溅起一层白雾。", opts: [
          {t: "冒雨跑回家", run: S => {if (Talent.have("钢筋铁骨") || Talent.have("天行健") || S.prop.健康 > 120) {modProp("心态", 6); count("sport"); say("你健步如飞，雨幕都成了背景。心态 +6", "good"); if (!Talent.have("钢筋铁骨") && S.prop.健康 > 120 && luckyRoll(0.4)) gainTalent("钢筋铁骨", "暴雨中狂奔而不倒");} else if (Talent.have("体弱多病")) {modProp("健康", -15); S.studyDebuff += 0.3; S.debuffWeeks = 2; say("本就虚弱的身体彻底垮了。健康 -15，接下来 2 周学习 -30%", "bad");} else {modProp("健康", -8); modProp("心态", -5); say("淋成落汤鸡。健康 -8，心态 -5", "bad");} }},
          {t: "在便利店等雨停", run: S => {modProp("经济", -10); if (Talent.have("吃货") || luckyRoll(0.5)) {modProp("心态", 5); count("food"); say("你买了关东煮，边吃边看雨水从檐口淌下来。意外的惬意。", "good");} else say("干等了一小时，雨还是没小。", "sys");}},
          {t: "打电话让家里来接", cond: S => S.prop.经济 > 60 || Talent.have("家财万贯"), run: S => {modProp("压力", -5); modProp("亲情", 3); say("爸妈开车来了，车上暖气很足。压力 -5", "good"); if (Talent.have("家徒四壁")) {Talent.remove("家徒四壁"); say("看着爸妈被雨水打湿的袖子，你暗下决心。失去了【家徒四壁】的心理阴影", "talent");} }},
        ]
      },
      {
        id: "bully", w: 5, slot: ["weekday", "clubday"], t: "楼梯拐角",
        c: "几个高年级学生把你堵在楼梯拐角，背影挡住了走廊的光。", opts: [
          {t: "硬刚到底", cond: S => S.prop.健康 > 100, run: S => {if (Talent.have("钢筋铁骨") || Talent.have("运动健将") || Talent.have("天行健")) {modProp("社交", 10); modProp("心态", 8); count("sportWin"); say("你三两下震住了他们，从此名声大噪。", "good"); if (luckyRoll(0.35)) gainTalent("豪", "打出了自信");} else {modProp("健康", -12); modProp("心态", -6); say("你赢了气势，输了架。冰敷的时候，你想了很多。", "bad");} }},
          {t: "冷静周旋", cond: S => S.prop.心态 > 90, run: S => {modProp("心态", 4); modProp("悟性", 3); say("你不慌不忙，几句话把对方绕晕，然后全身而退。", "good"); if (luckyRoll(0.3)) gainTalent("心态大师", "临危不乱");}},
          {t: "告诉老师", run: S => {if (Talent.have("高冷")) {modProp("社交", -5); say("老师处理了，但同学觉得你告状。走廊里安静了几天。", "bad");} else {modProp("心态", 3); say("老师严肃处理了此事。放学时有人拍了拍你的肩。", "good");} }},
          {t: "忍气吞声", run: S => {let d = Talent.have("道心如铁") ? 0 : (Talent.have("玻璃心") ? -16 : -10); modProp("心态", d); modProp("压力", 10); say("你把委屈咽了下去。有些事，说出来比忍着更疼。", "bad"); if (!Talent.have("道心如铁") && luckyRoll(0.3)) gainTalent("内耗者", "委屈在深夜发酵");}},
        ]
      },
      {
        id: "phone", w: 5, slot: "weekday", t: "手机诱惑",
        c: "自习课上，同桌悄悄把手机塞到你课本下面：「新皮肤，来一把？」\n教室后门的窗户上，班主任的脸随时可能出现。\n红塔中学对手机的态度，你入学第一天就知道了。", opts: [
          {t: "来一把", run: S => {
            count("game");
            // 在红塔中学，拿出手机几乎必被抓 —— 这是校纪，不是运气
            if (Math.random() < 0.85) {
              modProp("心态", -14); modProp("压力", 14); modProp("效率", -10); modProp("社交", -5);
              modProp("经济", -30); modProp("亲情", -4);
              S.studyDebuff += 0.25; S.debuffWeeks = Math.max(S.debuffWeeks, 3);
              setFlag("phone_at_school", false); setFlag("phone_banned", true);
              say("📵 班主任从后门走了进来。手机被当场没收，暂存德育处。", "bad");
              say("📵 通知家长来校签《手机管理承诺书》，本周学习状态受到严重影响。", "bad");
              say("📵 你在办公室站了一节课。红塔中学的手机红线，碰不得。", "bad");
              gainTalent("网瘾", "手机被没收后，你满脑子还是那局游戏");
            } else {
              modProp("心态", 6); modProp("效率", -8); modProp("压力", 5);
              say("居然没被发现。你出了一身冷汗，整节课都没听进去。", "bad");
              gainTalent("游戏宅", "一发不可收拾");
            }
          }},
          {t: "摇头拒绝", run: S => {modProp("压力", 3); S.studyBuff += 0.15; S.buffWeeks = Math.max(S.buffWeeks, 2); count("resist"); say("你摇了摇头，把手机推了回去。这很聪明。", "good"); if ((S.cnt.resist || 0) >= 5) gainTalent("自律机器", "五次拒绝诱惑");}},
          {t: "劝同桌也收起来", run: S => {modProp("社交", 5); modProp("心态", 3); count("resist"); S.studyBuff += 0.08; S.buffWeeks = Math.max(S.buffWeeks, 1); say("「别玩了，被抓到要请家长的。」同桌犹豫了一下，收回了手机。", "good");}},
        ]
      },
        {
          id: "phone_bring", w: 6, t: "返校前，桌上的手机",
          slot: "weekend", dist: "uniform", minGap: 2,
          cond: S => !hasFlag("phone_at_school") && !hasFlag("phone_banned"),
          c: "周末在家，返校的东西已经收好了。\n手机就放在书桌充电，屏幕亮了一下。\n红塔中学的校规你背得出来：手机不许带进校园。\n但你还是看了它一眼。",
          opts: [
            {t: "不带，放家里", run: ["心态 +3", "压力 -3"],
              say: "你把手机推进抽屉。到了学校，你就只是个学生。", cls: "good"},
            {t: "带上，藏好就行", run: ["心态 +4", "压力 +5"], flag: "phone_at_school",
              say: "你把手机塞进书包的夹层。心跳有点快。", cls: "bad",
              raise: [{id: "phone_check", weeks: 3, mult: 4, slot: "weekday"},
                      {id: "dorm_phone_night", weeks: 3, mult: 4, slot: "weekday"}]},
            {t: "带，但只用来和家里联系", run: ["心态 +2", "压力 +2", "亲情 +3"], flag: "phone_at_school",
              say: "你想着，万一家里有事呢。你还是把它放进了书包。", cls: "",
              raise: [{id: "phone_check", weeks: 2, mult: 2, slot: "weekday"}]},
          ]
        },
        {
          id: "dorm_phone_night", w: 5, t: "熄灯后",
          slot: "weekday", dist: "uniform", minGap: 3,
          cond: S => hasFlag("phone_at_school"),
          c: "宿舍熄灯了。被窝里那块屏幕的光，是你今晚唯一的秘密。",
          opts: [
            {t: "再刷十分钟就睡", run: [
              "健康 -8", "压力 +8", "心态 -10", "效率 -6", "亲情 -3",
              "学习减益 25% 3周", "清除标记 phone_at_school", "标记 phone_banned",
              "提示 📵 查寝的老师掀开了你的被子。手机没收，家长被通知到校。!bad",
              "提示 📵 第二天你在全班面前作了检讨。红塔中学的手机红线，碰不得。!bad"
            ]},
            {t: "只给家里发条消息", run: ["亲情 +5", "心态 +3", "健康 -2", "压力 +2"],
              say: "你发了句「妈我挺好的」，然后关了屏幕。", cls: "good"},
            {t: "关机，睡觉", run: ["健康 +6", "压力 -5", "心态 +3"],
              say: "你把手机塞到枕头底下，没再碰它。黑暗里，听见室友均匀的呼吸。", cls: "good"},
          ]
        },
        {
          id: "phone_check", w: 4, t: "宿舍手机突击检查",
          slot: "weekday", dist: "uniform", minGap: 3,
          cond: S => hasFlag("phone_at_school"),
          c: "熄灯前十分钟，德育处和生活老师挨个宿舍查手机。\n你枕头底下那台，此刻烫得像块炭。",
          opts: [
            {t: "主动交出去", run: S => {
              modProp("心态", -6); modProp("压力", 5); modProp("效率", -3);
              S.studyDebuff += 0.08; S.debuffWeeks = Math.max(S.debuffWeeks, 1);
              say("📵 手机被登记，周末才能取回。老师记下了你的名字，但态度缓和一些。", "bad");
              say("主动交出比被搜出来好得多 —— 这一点你很清楚。", "");
              count("resist"); modProp("亲情", -2);
            }},
            {t: "赌一把不交", run: S => {
              if (Math.random() < 0.75) {
                modProp("心态", -16); modProp("压力", 16); modProp("效率", -12); modProp("社交", -6);
                modProp("经济", -50); modProp("亲情", -6);
                S.studyDebuff += 0.3; S.debuffWeeks = Math.max(S.debuffWeeks, 4);
                setFlag("phone_at_school", false); setFlag("phone_banned", true);
                say("📵 生活老师从被褥夹层里抽出了手机。全宿舍都看见了。", "bad");
                say("📵 手机没收至学期末，家长到校陪读一周，取消本学期评优资格。", "bad");
                say("📵 你在宿舍楼道站到熄灯。红塔中学查手机，从来不是吓唬人。", "bad");
                gainTalent("严重网瘾", "被没收后你反而更想玩了");
              } else {
                modProp("压力", 10); modProp("健康", -3); modProp("心态", 4);
                say("居然没查到你这边。你攥着手机，一夜没睡踏实。", "bad");
                count("game");
              }
            }},
            {t: "我本来就没带手机", cond: S => !Talent.have("网瘾") && !Talent.have("严重网瘾"), run: S => {
              modProp("心态", 5); modProp("效率", 4); modProp("压力", -4);
              count("resist");
              say("你坦然翻开书包。老师点了点头，在名单上打了个勾。", "good");
              if ((S.cnt.resist || 0) >= 5) gainTalent("自律机器", "五次拒绝诱惑");
            }},
          ]
      },
      {
        id: "nightstudy", w: 5, slot: "weekday", t: "深夜台灯",
        c: "期中临近，舍友都睡了，你还有半本习题没刷完。\n台灯把你的影子投在墙上，很大，很安静。", opts: [
          {t: "挑灯夜读", run: S => {S.studyBuff += 0.2; S.buffWeeks = Math.max(S.buffWeeks, 2); count("night"); if (Talent.have("熬夜冠军")) {modProp("效率", 4); say("你早已习惯深夜。笔尖划过纸面的声音，是你最熟的音乐。", "good");} else if (Talent.have("体弱多病") || S.prop.健康 < 70) {modProp("健康", -10); say("身体吃不消，字开始重影。", "bad");} else {modProp("健康", -4); say("刷完题已是凌晨。窗外有虫子在叫。", "sys");} gainTalent("挑灯夜读", "深夜的灯光见证了你"); if ((S.cnt.night || 0) >= 6) gainTalent("熬夜冠军", "夜猫子大成");}},
          {t: "准时睡觉", run: S => {modProp("健康", 5); modProp("压力", -6); say("一夜好眠。明天的事，明天再说。", "good"); count("earlySleep");}},
        ]
      },
      {
        id: "gossip", w: 4, slot: ["weekday", "clubday"], t: "流言蜚语",
        c: "班里有人传你和同桌的闲话，越传越难听。\n你走进教室的时候，有两句话停在了半空。", opts: [
          {t: "当面澄清", cond: S => S.prop.社交 > 90, run: S => {modProp("社交", 5); modProp("心态", 3); say("你把话说开了。流言最怕的，就是被放到太阳底下。", "good");}},
          {t: "不予理会", run: S => {let d = Talent.have("心态大师") ? -2 : (Talent.have("玻璃心") ? -14 : -8); modProp("心态", d); say("嘴长在别人身上，路在自己脚下。", "");}},
          {t: "以谣制谣", run: S => {if (luckyRoll(0.5)) {modProp("社交", -10); say("玩脱了，两边都得罪了。", "bad");} else {modProp("心态", 5); count("lucky"); say("对方被反将一军，从此闭了嘴。", "good");} }},
        ]
      },
      {
        id: "sports", w: 5, slot: "weekday", t: "体育课长跑测试",
        c: "1000 米测试。跑到一半，你肺像着了火，操场的风都是热的。", opts: [
          {t: "咬牙冲刺", run: S => {count("sport"); if (Talent.have("运动健将") || Talent.have("钢筋铁骨") || S.prop.健康 > 110) {modProp("健康", 8); modProp("心态", 8); count("sportWin"); say("全班第一！冲过终点那一刻，风忽然变凉了。", "good"); gainTalent("运动健将", "你天生属于跑道");} else if (S.prop.健康 > 80) {modProp("健康", 3); modProp("心态", 4); say("及格了。你扶着膝盖喘了很久。", "good");} else {modProp("健康", -6); say("你虚脱地倒在终点，被同学架去了医务室。", "bad");} }},
          {t: "匀速保命跑", run: S => {modProp("压力", -3); say("不快不慢，及格万岁。跑步的时候，脑子反而空了。", "");}},
          {t: "装病请假", cond: S => S.prop.社交 > 80, run: S => {modProp("心态", 3); say("老师信了，你躲过一劫。只是心里有点空。", "");}},
        ]
      },
      {
        id: "classroom_noon", w: 4, slot: ["weekday", "clubday"], t: "教室的午后",
        c: "午休铃响过，教室里还留着几个人。阳光斜斜地落在课桌上，把粉笔灰照得发亮。", opts: [
          {t: "专注刷题", run: S => {S.studyBuff += 0.12; S.buffWeeks = Math.max(S.buffWeeks, 2); modProp("压力", -4); say("安静的环境让你效率倍增。窗外有鸟，你一次也没抬头。", "good");}},
          {t: "翻翻闲书", run: S => {modProp("悟性", 4); modProp("心态", 4); say("杂书里也有大千世界。你从别人的故事里抬起头，天已经偏西。", "good");}},
          {t: "趴桌上睡一觉", run: S => {modProp("健康", 6); modProp("压力", -6); say("阳光正好，小睡一会儿。醒来时脸上有道红印子。", "good");}},
        ]
      },
      {
        id: "volunteer", w: 4, slot: "weekend", t: "社区志愿服务",
        c: "社区招募周末志愿者，去敬老院陪老人聊天。\n报名表在居委会的桌上，笔尖有点秃。", opts: [
          {t: "报名参加", run: S => {modProp("社交", 8); modProp("心态", 8); count("volunteer"); say("老人们拉着你的手讲了许多故事。有位爷爷说他年轻时也走过你现在的路。", "good");}},
          {t: "在家复习", run: S => {S.studyBuff += 0.1; S.buffWeeks = Math.max(S.buffWeeks, 2); say("你选择把时间留给课本。窗外的喧闹一点点暗下去。", "");}},
        ]
      },
      {
        id: "teacher_praise", w: 4, slot: "weekday", t: "老师的表扬",
        c: "班主任在班会上点名表扬了你最近的进步。\n你听见自己的名字被念出来，耳朵有点热。", opts: [
          {t: "谦虚低头", run: S => {modProp("心态", 6); modProp("社交", 4); say("你红着脸低下头，心里却美滋滋的。", "good");}},
          {t: "暗暗发誓要更好", run: S => {S.studyBuff += 0.1; S.buffWeeks = Math.max(S.buffWeeks, 3); modProp("压力", 5); say("表扬成了你的动力，也成了你的担子。", "");}},
        ]
      },
      {
        id: "lost_wallet", w: 3, t: "捡到钱包",
        c: "你在公交站台捡到一个鼓鼓的钱包，拉链没拉严，能看见一沓零钱。", opts: [
          {t: "交给警察", run: S => {modProp("心态", 8); count("honest"); say("警察叔叔记下了你的学校。你说「不用写，应该的」。", "good");}},
          {t: "原地等失主", run: S => {modProp("心态", 5); modProp("效率", -3); say("等了半小时，失主赶来了，握住你的手一直抖。", "good");}},
          {t: "拿走里面的钱", run: S => {if (luckyRoll(0.5)) {modProp("经济", 200); modProp("心态", -10); say("你拿走了钱。后来的很多天，你都不敢看钱包。", "bad");} else {modProp("心态", -15); modProp("压力", 10); modProp("亲情", -5); say("失主找上门，你被请了家长。妈妈一直没说话。", "bad");} }},
        ]
      },
      {
        id: "midnight_call", w: 3, slot: "weekend", t: "深夜来电",
        c: "半夜手机震动，是一个陌生号码。屏幕在黑暗里亮了一下，又亮一下。", opts: [
          {t: "接听", run: S => {if (luckyRoll(0.4)) {modProp("心态", 8); count("lucky"); say("是多年未见的小学同学。你们聊起从前，挂电话时天快亮了。", "good");} else {modProp("心态", -5); modProp("压力", 6); say("是骚扰电话。被吵醒后，你再也睡不着。", "bad");} }},
          {t: "挂掉继续睡", run: S => {modProp("健康", 3); say("翻个身继续睡。第二天想起来，也没查是谁。", "good");}},
        ]
      },
      {
        id: "lost_diary", w: 3, slot: ["weekday", "clubday"], t: "日记本丢了",
        c: "你发现日记本不见了，可能落在教室。那里写着很多你不打算说出口的话。", opts: [
          {t: "立刻回去找", run: S => {if (luckyRoll(0.6)) {modProp("心态", -3); say("找到了，但被人翻过。书页角上有一道折痕，不是你折的。", "bad");} else {modProp("心态", -8); modProp("压力", 8); say("没找到。你担心了一整周，连上课都在想。", "bad");} }},
          {t: "算了", run: S => {modProp("压力", -4); modProp("悟性", 2); say("你选择放下。有些话写下来，本就已经完成了它的任务。", "good");}},
        ]
      },
      {
        id: "class_duty", w: 3, slot: "weekday", t: "值日安排",
        c: "轮到你们组值日，但组员都跑了。扫帚靠在门后，教室空空荡荡。", opts: [
          {t: "一个人干完", run: S => {modProp("压力", 6); modProp("社交", 5); modProp("心态", 4); count("volunteer"); say("你默默打扫到天黑。第二天有人说了句谢谢。", "good");}},
          {t: "找老师告状", run: S => {modProp("社交", -4); modProp("心态", 2); say("组员被批评了，但你也得罪了人。", "");}},
          {t: "也跟着走", run: S => {modProp("心态", -3); say("教室被扣分了。第二天你不敢看黑板旁边的评比表。", "bad");}},
        ]
      },
      {
        id: "broken_phone", w: 4, slot: "weekend", t: "手机摔碎了",
        c: "你一松手，手机摔在地上，屏幕裂了一道口子，像一道细小的闪电。", opts: [
          {t: "用零花钱修", run: S => {modProp("经济", -80); modProp("心态", -3); say("修好了，但钱包瘪了。妈妈问起来，你说是不小心。", "bad");}},
          {t: "忍着不修", run: S => {modProp("心态", -8); S.studyDebuff += 0.05; S.debuffWeeks = 1; say("凑合着用。那道裂纹每次亮屏时都会提醒你一次。", "bad");}},
        ]
      },
      {
        id: "pe_conflict", w: 4, slot: "weekday", t: "同学冲突",
        c: "体育课上，你和同学因为场地争执起来，双方都不肯退让。\n球在地上滚，谁也没去捡。", opts: [
          {t: "先让一步", run: S => {modProp("社交", 6); modProp("心态", 3); say("你主动退让。后来他递给你一瓶水。", "good");}},
          {t: "坚持己见", run: S => {if (luckyRoll(0.5)) {modProp("社交", -6); modProp("心态", -4); say("两人不欢而散。回教室的路上，谁也没说话。", "bad");} else {modProp("社交", 4); count("lucky"); say("对方被你说服了，还拍了拍你的肩。", "good");} }},
          {t: "直接走开", run: S => {modProp("心态", -2); say("你不想吵，转身离开。有些争执，走开比赢更重要。", "");}},
        ]
      },
      {
        id: "exam_result", w: 4, slot: ["weekday", "clubday"], t: "成绩单被看到",
        c: "同桌偷看了你的成绩单，还大声念了出来。教室里安静了两秒。", opts: [
          {t: "一笑而过", run: S => {modProp("心态", 5); modProp("社交", 3); say("你笑着化解尴尬。能把分数念出来的人，其实也没那么在意分数。", "good");}},
          {t: "愤怒反驳", run: S => {if (Talent.have("暴躁")) {modProp("社交", -8); modProp("心态", -6); say("你骂了回去，场面失控。老师进来时，你还在发抖。", "bad");} else {modProp("社交", -4); say("你生气地反驳，关系变差了。", "bad");} }},
          {t: "沉默不语", run: S => {modProp("压力", 6); modProp("心态", -3); say("你假装没听见，心里却不舒服了一整天。", "bad");}},
        ]
      },
      {
        id: "sick_day", w: 4, t: "生病请假",
        c: "你早上起来头痛欲裂，可能是感冒了。被子很暖，教室很远。", opts: [
          {t: "坚持去学校", run: S => {modProp("健康", -8); S.studyBuff += 0.1; S.buffWeeks = 1; say("你带病上课，学习效率却打了折扣。黑板上的字有点晃。", "bad");}},
          {t: "请假在家休息", run: S => {modProp("健康", 12); modProp("效率", -5); modProp("亲情", 3); say("休息一天，身体好多了。妈妈给你煮了粥。", "good");}},
        ]
      },
      {
        id: "rain_school", w: 3, slot: "weekday", t: "雨天值日",
        c: "下雨天，你被安排去倒垃圾。同学们都躲雨去了，走廊只剩雨声。", opts: [
          {t: "冒雨去倒", run: S => {modProp("健康", -4); modProp("社交", 5); count("volunteer"); say("你淋湿了，但被老师表扬。雨把校服贴在背上，凉得很实在。", "good");}},
          {t: "找同学帮忙", cond: S => S.prop.社交 > 90, run: S => {modProp("社交", 3); say("同学帮你一起去了。两个人撑一把伞，肩膀都湿了一半。", "good");}},
        ]
      },
      {
        id: "pop_quiz", w: 3, slot: "weekday", t: "随堂小测",
        c: "老师突然宣布随堂小测。你翻开练习本，笔尖悬在半空。", opts: [
          {t: "认真答题", run: S => {const v = Math.round(Math.random() * 40 + 50); if (v >= 80) {modProp("心态", 6); count("lucky"); say(`你考了 ${v} 分，超出预期。原来你比自己以为的多记住了一些。`, "good");} else {modProp("心态", -4); say(`你考了 ${v} 分，有点沮丧。`, "bad");} }},
          {t: "偷偷看同桌", run: S => {if (luckyRoll(0.5)) {modProp("心态", -6); modProp("社交", -3); say("被老师发现，批评了一顿。你恨不得钻进课桌底下。", "bad");} else {modProp("心态", 3); count("lucky"); say("侥幸没被发现。但你并不打算再来一次。", "");} }},
        ]
      },
      {
        id: "breakup", w: 3, t: "好友绝交",
        c: "最好的朋友突然不理你了，听说是因为一件小事。\n消息框里最后一句话，是你三天前发的。",
        cond: S => (S.cnt.love || 0) > 0 || S.prop.社交 > 100, opts: [
          {t: "主动和好", run: S => {modProp("社交", 5); modProp("心态", 6); say("你先开了口。你们重归于好，谁也没提那件小事。", "good");}},
          {t: "冷处理", run: S => {modProp("心态", -8); modProp("压力", 8); say("关系越来越远。有些友谊，是慢慢走散的。", "bad");}},
        ]
      },
      {
        id: "lost_pencil", w: 3, slot: ["weekday", "clubday"], t: "丢失的文具",
        c: "你最喜欢的一支笔不见了，可能是被人拿走了。笔杆上有你咬过的牙印。", opts: [
          {t: "问周围同学", run: S => {if (luckyRoll(0.5)) {modProp("心态", 5); count("lucky"); say("原来是被同学误拿了，他还给了你，连声说对不起。", "good");} else {modProp("心态", -4); say("没人承认。你只能作罢。", "bad");} }},
          {t: "算了，再买一支", run: S => {modProp("经济", -5); modProp("心态", 2); say("小钱而已。新笔写起来，到底还是差一点手感。", "");}},
        ]
      },
      {
        id: "newfriend", w: 3, slot: ["weekday", "clubday"], t: "新朋友",
        c: "你在食堂认识了一个其他班的同学。他端着盘子坐到你对面，聊得很投机。", opts: [
          {t: "保持联系", run: S => {modProp("社交", 8); modProp("心态", 5); say("你们成了好朋友。从此食堂排队不再难熬。", "good");}},
          {t: "点头之交", run: S => {modProp("社交", 2); say("只是打了个招呼。有些人，遇见一次就够了。", "");}},
        ]
      },

      /* ───────────────────────────────────────────────────────────
       * 以下为 1.0 新增：补齐周末与校园的日常，也顺手把几个
       * 「成就写了却永远拿不到」的计数接上了（小吃 / 纸条）。
       * ─────────────────────────────────────────────────────────── */
      {
        id: "snack_stall", w: 5, slot: "weekend", t: "校门口的小吃摊",
        c: "周末返校，校门口拐角的小吃摊支起来了。\n铁板滋啦一响，香味顺着风飘出老远。\n摊主阿姨认得你：「还是老样子？」", opts: [
          {t: "来一碗小锅米线", run: ["经济 -15", "心态 +9", "健康 +3", "压力 -6", "计数 小吃"],
            say: "滚烫的汤下肚，一周的疲惫散了一半。玉溪的米线，是有家乡味道的。", cls: "good"},
          {t: "要几块烧豆腐", run: ["经济 -10", "心态 +7", "社交 +4", "计数 小吃"],
            say: "你蹲在路边等豆腐鼓起来，和同学分着吃了。辣椒面抹在嘴角，谁也没提醒谁。", cls: "good"},
          {t: "忍住，回教室", run: ["心态 -3", "经济 +0", "压力 +2"],
            say: "你攥着饭卡走了过去。香味跟了你一路。", cls: ""},
        ]
      },
      {
        id: "note_paper", w: 4, slot: ["weekday", "clubday"], t: "课桌里的纸条",
        c: "你翻开课本，掉出一张折成方块的纸条。\n字是同桌的：「这次月考加油，我看好你。」\n纸条背面画了一个歪歪扭扭的太阳。", opts: [
          {t: "回一张给他", run: ["社交 +8", "心态 +7", "压力 -5", "计数 情书"],
            say: "你也折了一张塞回去。有些鼓励，是要还回去的。", cls: "good"},
          {t: "默默夹回书里", run: ["心态 +5", "悟性 +2"],
            say: "你把纸条夹回那一页。往后的日子，你翻到它就会慢一点。", cls: "good"},
          {t: "假装没看见", run: ["心态 +1", "社交 -2"],
            say: "你把纸条推到桌角。第二天，它不见了。", cls: ""},
        ]
      },
      {
        id: "weekend_market", w: 4, slot: "weekend", t: "陪妈妈去赶集",
        c: "周末早上，妈妈说要去集市买菜，问你去不去。\n你其实还有两张卷子没写。", opts: [
          {t: "跟着去", run: ["亲情 +10", "心态 +6", "健康 +3", "压力 -5"],
            say: "集市上人声鼎沸。妈妈挑菜时和摊主讨价还价，你在旁边提着袋子。这样的早晨，以后会越来越少。", cls: "good"},
          {t: "在家写作业", run: ["学习加成 +12% 1周", "亲情 -3", "效率 +3"],
            say: "你写完了两张卷子。中午妈妈提着菜回来，问你要不要吃水果。", cls: ""},
          {t: "去，但戴着耳机", run: ["亲情 +2", "心态 +2", "社交 -2"],
            say: "你跟在后面，半个心思在耳机里。妈妈回头看了你一眼，没说什么。", cls: ""},
        ]
      },
      {
        id: "weekend_homework", w: 4, slot: "weekend", t: "周日的作业",
        c: "周日傍晚，作业还剩一大半。\n窗外有人在打球，声音一阵一阵传进来。\n返校的车是明天一早的。", opts: [
          {t: "现在就补完", run: ["学习加成 +15% 1周", "压力 +6", "健康 -3"],
            say: "你一口气写到深夜。合上笔帽的时候，心里是踏实的。", cls: "good"},
          {t: "先玩一会儿再写", run: ["心态 +6", "压力 -4", "学习减益 10% 1周"],
            say: "你玩到天黑才想起作业。返校的车上，你还在补最后一道题。", cls: "bad"},
          {t: "去学校抄同学的", run: ["社交 +3", "心态 -4", "压力 +4", "学习减益 8% 1周"],
            say: "你借了同桌的作业本。老师说「下次不许了」，你点了点头。", cls: "bad"},
        ]
      },
      {
        id: "family_dinner", w: 4, slot: "weekend", t: "周末的一顿饭",
        c: "周末回家，桌上摆着你爱吃的菜。\n吃到一半，爸爸问起学校的事。", opts: [
          {t: "好好说说这一周", run: ["亲情 +9", "心态 +7", "压力 -7"],
            say: "你讲了考试、讲了社团、也讲了食堂的饭菜。他们听得很认真。", cls: "good"},
          {t: "只说好的那部分", run: ["亲情 +5", "心态 +4", "压力 -3"],
            say: "你挑开心的事讲。有些难处，你决定自己扛着。", cls: "good"},
          {t: "埋头吃饭，快点回屋", run: ["亲情 -4", "压力 +3", "心态 -2"],
            say: "「嗯」「还行」「知道了」。你三口两口吃完，回了房间。", cls: "bad"},
        ]
      },
    ];
