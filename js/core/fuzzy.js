/* 属性模糊化 + 隐藏属性 + 红雾/灰暗开关（需求 2 / 8） */
(function () { "use strict";
const FUZZY = {
  心态:{LO:15,LOW:35,MID:65,HIGH:85,labels:["极低","较低","中","较高","极高"]},
  健康:{LO:15,LOW:35,MID:65,HIGH:85,labels:["极低","较低","中","较高","极高"]},
  压力:{LO:15,LOW:35,MID:65,HIGH:85,labels:["极低","较低","中","较高","极高"]},
  效率:{LO:15,LOW:35,MID:65,HIGH:85,labels:["极低","较低","中","较高","极高"]},
  悟性:{LO:15,LOW:35,MID:65,HIGH:85,labels:["极低","较低","中","较高","极高"]},
  社交:{LO:15,LOW:35,MID:65,HIGH:85,labels:["极低","较低","中","较高","极高"]}
};
const KEY={"极低":"fuzzy.veryLow","较低":"fuzzy.low","中":"fuzzy.mid","较高":"fuzzy.high","极高":"fuzzy.veryHigh"};
const SUBJ = (typeof SUBJECTS_BY_GRADE!=="undefined") ? (function(){const s={};for(const g in SUBJECTS_BY_GRADE)SUBJECTS_BY_GRADE[g].forEach(k=>s[k]=1);return s;})() : {};

function propIsFuzzy(k){ if(k==="经济")return false; if(SUBJ[k])return true; return !!FUZZY[k]; }
function propIsHidden(k){
  if(typeof PROP_HIDDEN!=="undefined"&&PROP_HIDDEN.indexOf(k)>=0)return true;
  return !!SUBJ[k];
}
function fuzzyOf(k,v){
  const c=FUZZY[k]; if(!c)return {raw:v,level:2,text:String(v),key:null};
  const n=(typeof v==="number"&&isFinite(v))?v:((window.S&&window.S.prop)?window.S.prop[k]:0);
  const i=n<=c.LO?0:n<=c.LOW?1:n<=c.MID?2:n<=c.HIGH?3:4;
  return {raw:n,level:i,text:c.labels[i],key:KEY[c.labels[i]]};
}
function propDisplay(k){
  if(propIsHidden(k))return "";
  if(k==="经济")return "¥"+Math.round((window.S&&window.S.prop)?window.S.prop[k]:0);
  const f=fuzzyOf(k);
  return window.I18n?window.I18n.t(f.key,{v:Math.round(f.raw)}):(k+"　"+f.text);
}
function updateFxOverlay(){
  if(typeof document==="undefined"||!window.S||!window.S.prop)return;
  const p=window.S.prop, cP=FUZZY["压力"]||{}, cM=FUZZY["心态"]||{}, cH=FUZZY["健康"]||{};
  const step=(v,gate,up)=>{const d=up?(v-gate):(gate-v);if(d<=0)return 0;if(d<12)return 1;if(d<30)return 2;return 3;};
  document.body.setAttribute("data-fx-pressure",String(step(p.压力||0,cP.HIGH||85,1)));
  document.body.setAttribute("data-fx-mind",String(Math.max(step(p.心态||0,cM.LO||15,-1),step(p.健康||0,cH.LO||15,-1))));
}
function fuzzyLevel(k){return fuzzyOf(k).level;}
window.PropFuzzy={FUZZY,propIsFuzzy,propIsHidden,fuzzyOf,propDisplay,updateFxOverlay,fuzzyLevel,SUBJ_SET:SUBJ};
})();
