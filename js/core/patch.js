/* ======================================================================
 * 核心规则补丁（需求 2/6/7/8/9/10/16 · 增量，不改原文件）
 * 接入：index.html 在 js/16-flow.js 之后加载本文件；19-boot.js 里 applyTheme()→Theme.init()
 * 所有数字只在 js/data/tweak.json。
 * ====================================================================== */
(function () { "use strict";
function tn(){ return Object.assign({
  learnMul:{story:1.10,standard:0.86,hard:0.66},
  decayMul:{story:0.70,standard:1.15,hard:1.55},
  askCost:{base:8,per100:3.2,min:4,max:18},
  askFailBond:30,askLockBond:15,conflictBond:28,regretWeeks:3,
  rotWeeks:3,rotTarget:["厌学","重度厌学","学习特困生","注意力涣散","拖延症","网瘾"],rotRecover:3,
  richWeekly:70,richStart:0.55
}, (window.GAME_CONFIG&&window.GAME_CONFIG.tweak)||{}); }
const num=v=>(typeof v==="number"&&isFinite(v))?v:0, clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const diff=()=>(window.GAME_CONFIG&&window.GAME_CONFIG.difficulty)||"standard";
const zhEn=z=>e=>window.I18n&&window.I18n.get()==="en"?e:z;

/* ⑥ HUD 模糊化：属性条数字改写；学科栏仅在 setExamOpen(true) 时显示 */
function patchHUD(){ if(window.__htzxHudPatched)return; const o=window.renderHUD;
  window.renderHUD=function(){ if(window.S&&window.S.prop)window.PropFuzzy&&window.PropFuzzy.updateFxOverlay();
    o&&o.apply(this,arguments); if(!window.S)return;
    document.querySelectorAll("[data-prop]").forEach(el=>{ const k=el.getAttribute("data-prop");
      if(window.PropFuzzy.propIsHidden(k)){el.style.display="none";return;} el.style.display="";
      const n=el.querySelector("[data-prop-num],.prop-num")||el;
      if(k==="经济"){n.textContent="¥"+Math.round(num(window.S.prop[k]));return;}
      if(window.PropFuzzy.propIsFuzzy(k)){const f=window.PropFuzzy.fuzzyOf(k);
        n.textContent=window.I18n?window.I18n.t(f.key,{v:Math.round(f.raw)}):(k+"　"+f.text);} });
    document.querySelectorAll("[data-subj]").forEach(el=>el.style.display=window.HTZX_EXAM_OPEN?"":"none"); };
  window.__htzxHudPatched=true; }
window.setExamOpen=b=>{window.HTZX_EXAM_OPEN=!!b;window.renderHUD&&window.renderHUD();};

/* ① 学习更难：收益乘难度系数；周结算衰减再放大 */
function patchStudy(){ if(window.__htzxStudyPatched)return; const t=tn;
  if(window.studySettle){ const o=window.studySettle.bind(window);
    window.studySettle=function(a){ window.__htzxStudied=window.__htzxStudied||0; if(a==="study")window.__htzxStudied++;
      const b4=window.S?window.S.score:0; o(a);
      if(a==="study"&&window.S){ const g=(window.S.score||0)-(b4||0);
        if(g>0&&t().learnMul[diff()]!=null){ const cut=g*(1-t().learnMul[diff()]);
          window.S.score=Math.max(b4||0,(window.S.score||0)-cut);
          window.S.prop.效率=clamp(window.S.prop.效率-0.4,10,150); } } }; }
  if(window.weeklySettle){ const o=window.weeklySettle.bind(window);
    window.weeklySettle=function(){ const t0={}; if(window.S&&window.S.subj)for(const k in window.S.subj)t0[k]=window.S.subj[k];
      o(); const m=(t().decayMul[diff()]||1);
      if(m>1&&window.S&&window.S.subj){ for(const k in window.S.subj)if(t0[k]!=null){const slip=(t0[k]-window.S.subj[k])*(m-1);
        window.S.subj[k]=clamp(window.S.subj[k]-slip,0,1500);} window.recalcScore&&window.recalcScore();} }; }
  window.__htzxStudyPatched=true; }

/* ② 亲情：要钱掉亲情 / 要不到 / 家庭矛盾 */
function patchFamily(){ if(window.__htzxFamilyPatched)return; const t=tn; const z=zhEn;
  window.allowanceSettle=function(onDone){ const S=window.S,p=S.prop;
    for(const k in window.PROP_RANGE)p[k]=window.fixProp(k,p[k]);
    const fam=clamp(p.亲情,0,150,80), lock=fam<=t().askLockBond, hard=fam<t().askFailBond, conf=fam<t().conflictBond;
    let g=Math.round(12+(fam-20)*0.36); if(window.Talent&&window.Talent.have("理财达人"))g=Math.round(g*1.25); g=Math.max(0,g);
    const cost=clamp(t().askCost.base+g/100*t().askCost.per100,t().askCost.min,t().askCost.max);
    const failRoll=hard?0.72:(conf?0.38:0.10);
    const done=(title,body,cls,runs,cf)=>{ (runs||[]).forEach(pair=>{const[k,v]=pair;
      window.modProp?window.modProp(k,v):(S.prop[k]=clamp(S.prop[k]+v,(window.PROP_RANGE[k]||[0,150,0])[0],(window.PROP_RANGE[k]||[0,150,0])[1]));});
      if(cf)S.familyConflict=(S.familyConflict||0)+1;
      window.PropFuzzy&&window.PropFuzzy.updateFxOverlay(); window.renderHUD&&window.renderHUD();
      window.showModal?window.showModal(title,'<div class="markdown" style="line-height:2">'+body+'</div>'
        +(cf?`<div style="color:var(--red);margin-top:8px">⚠️ 家庭矛盾：下周学习效率 -3</div>`:""),
        [{t:(window.I18n&&window.I18n.t("btn.close"))||"关闭",fn:()=>{onDone&&onDone();}}],null,false,true,{kind:"family"})
        :(onDone&&onDone()); };
    if(lock)return done(z("家里很安静，电话没人接。你把课本合上，没再说什么。")
      ("The house is silent. Nobody picks up. You close your textbook and say nothing."),"bad",
      [["亲情",-cost],["压力",6],["心态",-4]],true);
    if(Math.random()<failRoll)return done(
      conf?(z("「你除了要钱还会说什么？」碗筷都静了，这一周你做什么都提不起劲。")("What else do you ever call home for? Even the dishes go still. You can't focus all week."))
           :(z("「家里也紧。」声音很轻，你没再开口。")("Things are tight lately. The voice is quiet. You don't push it.")),
      "bad",[["亲情",-cost],["压力",conf?7:3],["心态",conf?-7:-3],...(conf?[["效率",-3]]:[])],conf);
    const warm=fam>=120, runs=[["经济",g],["亲情",warm?2:-cost*0.4]];
    if(warm){runs.push(["心态",6],["压力",-4]);} else if(fam>=70){runs.push(["心态",2]);} else {runs.push(["心态",-2],["压力",2]);}
    done(warm?(z("妈妈多塞了十五块")("She tucked in a little extra"))
             :(z("钱递过来，顺口一句「别乱花」")("The money changes hands with a flat 'Spend it well.'")),
      warm?(z("「在学校别省着。」临走又多塞了十五块。")("Don't skimp at school. She pressed a few more notes into your hand."))
          :(z("你点了一下头。")("You nod.")),"good",runs);
  };
  window.__htzxFamilyPatched=true; }
function applyFamilyConflict(){ if(!window.S||!(window.S.familyConflict>0))return;
  window.modProp&&window.modProp("效率",-3);
  window.say&&window.say((window.I18n&&window.I18n.get()==="en")
    ?"Home is still tense. Your mind drifts off the page. Efficiency −3"
    :"⚠️ 家里的气氛还没缓过来，你做题总是走神。效率 -3","bad");
  window.S.familyConflict=Math.max(0,window.S.familyConflict-1); }

/* ③ 遗憾离场 = 压力极高/心态极低/健康极低 连续 3 周 */
function patchEnding(){ if(window.__htzxEndingPatched)return; const t=tn;
  const tick=()=>{ if(!window.S||window.S.over)return; const P=window.S.prop,f=k=>window.PropFuzzy?window.PropFuzzy.fuzzyLevel(k):(P[k]/30|0);
    window.S._regret=window.S._regret||{p:0,m:0,h:0};
    window.S._regret.p = (f("压力")>=4)?window.S._regret.p+1:0;
    window.S._regret.m = (f("心态")<=0)?window.S._regret.m+1:0;
    window.S._regret.h = (f("健康")<=0)?window.S._regret.h+1:0;
    if(window.S._regret.p>=t().regretWeeks||window.S._regret.m>=t().regretWeeks||window.S._regret.h>=t().regretWeeks){
      window.S.dead="regret";window.S.over=true;window.gameOver&&window.gameOver();} };
  if(window.afterWeek){ const o=window.afterWeek.bind(window);
    window.afterWeek=function(){ tick(); if(window.S&&window.S.over)return; applyFamilyConflict(); o(); }; }
  if(window.ENDINGS&&Array.isArray(window.ENDINGS)){
    window.ENDINGS.splice(window.ENDINGS.length-4,0,{
      id:"regret",n:"遗憾结局 · 遗憾离场",icon:"🌫",c:S=>S.dead==="regret",
      t:"你不是突然倒下的。第三周的深夜，才发现窗外一直没亮过——压力、低落、疲惫，已经连着三周没放过你。\n这一局你提前退了场，但退场不等于结束，下一趟立行号会准点来。"}); }
  window.__htzxEndingPatched=true; }

/* ④ 破茧负向：连续不学→天赋🌑；做题/学习累计恢复 */
function patchCure(){ if(window.__htzxCurePatched)return; const t=tn;
  if(window.weeklySettle){ const o=window.weeklySettle.bind(window);
    window.weeklySettle=function(){ const s=window.S;
      if(s&&!s.over){ const stud=(s.__htzxStudied||0)+(s.actCounts&&s.actCounts.quiz||0);
        s._rot=Math.max(0,(s._rot||0)+(stud<=0?1:-1)); s.__htzxStudied=0;
        if(s._rot>=t().rotWeeks){ const held=(t().rotTarget||[]).filter(x=>window.Talent&&window.Talent.have(x)&&!(s._lostTalents&&s._lostTalents[x]));
          if(held.length){ const pk=held[Math.floor(Math.random()*held.length)];
            s._lostTalents=s._lostTalents||{}; s._lostTalents[pk]=(s._lostTalents[pk]||0)+1;
            window.say&&window.say("🌑 "+(window.I18n?window.I18n.t("cure.lost"):"某种惯性正在离开你")+"【"+pk+"】暂时失活","bad");
            fx("red");} s._lostTick=s._rot;} }
      o(); }; }
  const heal=()=>{ const s=window.S; if(!s||s.over)return; s._healCount=(s._healCount||0)+1;
    if(s._healCount>=t().rotRecover){ s._healCount=0;
      if(s._rot>0){ s._rot--; window.say&&window.say("🌱 久违地坐了下来…锈蚀的惯性松了一点（腐蚀 "+s._rot+"）","good");}
      else if(s._lostTalents&&Object.keys(s._lostTalents).length){ const k=Object.keys(s._lostTalents)[0];
        s._lostTalents[k]--; if(s._lostTalents[k]<=0){delete s._lostTalents[k];
          window.say&&window.say("🌿 "+(window.I18n?window.I18n.t("cure.recovered"):"你把它找了回来")+"【"+k+"】重新点亮","good"); fx("gray");} } } };
  if(window.studySettle){ const o=window.studySettle.bind(window);
    window.studySettle=function(a){ const r=o(a); if(a==="study")heal(); return r; }; }
  const qo=window.Quiz&&window.Quiz.build?window.Quiz.build:null;
  if(qo)window.Quiz.build=async function(){ const r=await qo(); heal(); return r; };
  if(window.Talent&&window.Talent.have){ const oh=window.Talent.have.bind(window.Talent);
    window.Talent.have=function(x){ if(oh(x)){ const s=window.S;
      if(s&&s._lostTalents&&s._lostTalents[x])return false; return true;} return false; };
    window.Talent.lostList=()=>{const s=window.S;return s&&s._lostTalents?Object.keys(s._lostTalents):[];}; }
  window.__htzxCurePatched=true; }
function fx(k){ document.body.classList.add(k==="red"?"fx-flash-red":"fx-flash-gray");
  setTimeout(()=>document.body.classList.remove("fx-flash-red","fx-flash-gray"),1100); }

/* ⑤ 家财万贯削 + 单亲家庭种子 */
function patchTalents(){ if(window.__htzxTalentPatched)return; const t=tn;
  if(window.TALENTS&&window.TALENTS["家财万贯"]){ const x=window.TALENTS["家财万贯"];
    x.desc="每周经济 +"+t().richWeekly+"（家底厚但边际递减），开局资金打折"; x.weekly=t().richWeekly; x._richMul=x._richMul||0.82;}
  const hash=s=>{ let h=2166136261; for(const c of String(s||""))h=((h^c.charCodeAt(0))*16777619)>>>0; return h; };
  window.singleParentSide=slot=>{ if(!window.S||!(window.Talent&&window.Talent.have("单亲家庭")))return null;
    const k=slot+"|"+(window.S.name||"")+"|"+(window.S.gender||"");
    let c=null; try{c=localStorage.getItem("__htzx_sp_"+slot);}catch(e){}
    if(!c){c=(hash(k)%2===0)?"mom":"dad"; try{localStorage.setItem("__htzx_sp_"+slot,c);}catch(e){}}
    return c; };
  window.singleParentCall=()=>{ const c=window.singleParentSide(window.slotCur||0); if(!c)return null;
    const en=window.I18n&&window.I18n.get()==="en"; return c==="mom"?(en?"Mom":"妈妈"):(en?"Dad":"爸爸"); };
  window.__htzxTalentPatched=true; }

function patchNewGame(){ if(window.__htzxNgPatched)return;
  if(window.newGame){ const o=window.newGame.bind(window);
    window.newGame=function(nm,gd){ const r=o(nm,gd); const t=tn;
      if(window.S){ if(window.Talent&&window.Talent.have&&window.Talent.have("家财万贯")&&window.S.prop.经济!=null)
        window.S.prop.经济=Math.round(window.S.prop.经济*t().richStart);
        window.S._rot=0;window.S._healCount=0;window.S._lostTalents={};
        window.S._regret={p:0,m:0,h:0};window.S.familyConflict=0;
        window.S.termRange=window.S.termRange||[0,5];
        window.singleParentSide&&window.singleParentSide(window.slotCur||0);}
      return r;}; }
  window.__htzxNgPatched=true; }

window.applyDifficulty=d=>{ if(window.GAME_CONFIG)window.GAME_CONFIG.difficulty=d; try{localStorage.setItem("htzx_diff",d);}catch(e){} };
window.applyTermRange=(a,b)=>{ const x=clamp(a,0,5),y=clamp(b,0,5);
  if(window.S)window.S.termRange=[Math.min(x,y),Math.max(x,y)]; };

function boot(){ patchHUD();patchStudy();patchFamily();patchEnding();patchCure();patchTalents();patchNewGame(); }
if(document.readyState==="complete"||document.readyState==="interactive")setTimeout(boot,0);
else document.addEventListener("DOMContentLoaded",()=>setTimeout(boot,0));
window.HTZX_PATCH={boot,patchHUD,patchStudy,patchFamily,patchEnding,patchCure,patchTalents,patchNewGame};

/* 存档白名单 + 考试时放行学科栏 */
if(window.SAVE_KEYS===undefined)window.SAVE_KEYS=[];
["_rot","_healCount","_lostTalents","_regret","familyConflict","termRange","actCounts"].forEach(k=>{
  if(window.SAVE_KEYS&&window.SAVE_KEYS.indexOf(k)<0)window.SAVE_KEYS.push(k);});
if(window.Exam&&window.Exam.runExam){ const o=window.Exam.runExam.bind(window.Exam);
  window.Exam.runExam=function(tg){ window.setExamOpen(true); const r=o(tg);
    setTimeout(()=>window.setExamOpen(false),600); return r;}; }

/* ===== 接入说明（只改 index.html + 19-boot.js 两处，见 README） ===== */
})();
