/* 开局界面增强：难度 + 学期连续区间 + 语言 + 主题（需求 3/4/16） */
(function () { "use strict";
const TK=["grade.g7u","grade.g7d","grade.g8u","grade.g8d","grade.g9u","grade.g9d"];
function I(k){return window.I18n?window.I18n.t(k):k.replace("grade.","G")
  .replace("g7u","7·上").replace("g7d","7·下").replace("g8u","8·上").replace("g8d","8·下").replace("g9u","9·上").replace("g9d","9·下");}
function seg(id,label,cur,def){const on=(cur===id)||(!cur&&def);
  return `<button class="${on?"on":""}" data-v="${id}">${label}</button>`;}
function mount(){
  const ob=document.getElementById("modalBody"); if(!ob||window.__htzxSetup||!document.getElementById("modalTitle"))return;
  const t=document.getElementById("modalTitle");
  if(!/创建角色|开始|角色/.test(t.textContent||"")||document.getElementById("htzxSetup"))return;
  window.__htzxSetup=true; const box=ob; box.dataset.htzx="1";
  const diff=load("htzx_diff")||"standard", tr=loadRange(), lang=load("htzx_lang")||"zh", th=load("htzx_theme")||"star";
  box.innerHTML=`<div id="htzxSetup" style="line-height:2.2">
   <div class="hz-row"><span>${I("setup.name")}</span>
     <input id="inpName" maxlength="8" placeholder="${I("setup.name")}" style="bg">
     <label style="margin-left:14px"><input type="radio" name="inpGender" value="男" checked> ${I("setup.male")}</label>
     <label style="margin-left:10px"><input type="radio" name="inpGender" value="女"> ${I("setup.female")}</label></div>
   <div class="hz-row"><span>${I("menu.diff")}</span><div class="hz-seg" data-group="diff">
     ${seg("story",I("diff.story"),diff,1)}${seg("standard",I("diff.standard"),diff)}${seg("hard",I("diff.hard"),diff)}</div></div>
   <div class="hz-row"><span>${I("setup.termRange")}</span>
     <select id="trFrom">${TK.map((k,i)=>`<option value="${i}"${i===tr[0]?" selected":""}>${I(k)}</option>`).join("")}</select>
     <span style="margin:0 8px">→</span>
     <select id="trTo">${TK.map((k,i)=>`<option value="${i}"${i===tr[1]?" selected":""}>${I(k)}</option>`).join("")}</select>
     <div style="color:var(--dim);font-size:.78rem;width:100%;margin-top:2px">${I("setup.termHelp")}</div></div>
   <div class="hz-row"><span>${I("menu.lang")}</span><div class="hz-seg" data-group="lang">
     ${seg("zh",I("lang.zh"),lang,1)}${seg("en",I("lang.en"),lang)}</div></div>
   <div class="hz-row"><span>${I("menu.theme")}</span><div class="hz-seg" data-group="theme">
     ${(window.Theme?window.Theme.list():[{id:"star",nameKey:"theme.star.name"}]).map(t=>seg(t.id,I(t.nameKey),th)).join("")}</div></div>
  </div><style>
   .hz-row{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:6px 0}
   .hz-row>span{min-width:82px;color:var(--dim);font-size:.88rem}
   .hz-seg{display:flex;gap:6px;flex-wrap:wrap}
   .hz-seg button{border:1px solid var(--line);background:var(--panel2);color:var(--txt);padding:5px 12px;border-radius:20px;font-size:.86rem;cursor:pointer}
   .hz-seg button.on{background:var(--brand);border-color:var(--brand-lite);box-shadow:0 0 12px var(--brand)}
   input[style*="bg"]{background:#0b0818;border:1px solid var(--line);color:var(--txt);border-radius:8px;padding:7px 12px;width:46%}
  </style>`;
  box.querySelectorAll(".hz-seg button").forEach(b=>b.onclick=()=>{
    const g=b.parentElement.dataset.group,id=b.dataset.v;
    box.querySelectorAll(`.hz-seg[data-group="${g}"] button`).forEach(x=>x.classList.remove("on"));
    b.classList.add("on");
    if(g==="diff")window.applyDifficulty(id);
    if(g==="lang")window.I18n&&window.I18n.set(id);
    if(g==="theme")window.Theme&&window.Theme.set(id);});
  window.Theme&&window.Theme.set(th); window.I18n&&window.I18n.set(lang);
  setTimeout(()=>{ const btn=document.querySelector("#modalOpts .btn.primary");
    if(!btn||btn.dataset.htzx)return; btn.dataset.htzx="1";
    btn.onclick=()=>{ const nm=(document.getElementById("inpName").value||"").trim()||"无名氏";
      const gd=document.querySelector("input[name=inpGender]:checked").value;
      const a=parseInt(document.getElementById("trFrom").value,10),b=parseInt(document.getElementById("trTo").value,10);
      window.applyTermRange(a,b); saveRange([Math.min(a,b),Math.max(a,b)]);
      window.applyDifficulty(document.querySelector('.hz-seg[data-group="diff"] .on').dataset.v);
      window.closeModal&&window.closeModal(); window.newGame&&window.newGame(nm,gd);};},50);
}
function load(k){try{return localStorage.getItem(k);}catch(e){return null;}}
function loadRange(){try{const r=JSON.parse(localStorage.getItem("htzx_termRange"));
  if(Array.isArray(r)&&r.length===2)return r;}catch(e){}return[0,5];}
function saveRange(r){try{localStorage.setItem("htzx_termRange",JSON.stringify(r));}catch(e){}}

function topbar(){ if(document.getElementById("htzxTop"))return;
  const nav=document.querySelector("nav,.topbar,#top,header")||document.body;
  const b=document.createElement("div"); b.id="htzxTop";
  b.style.cssText="position:fixed;top:10px;right:14px;z-index:9990;display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end";
  b.innerHTML=`<button class="hz-mini" id="htzxLang">中/EN</button><button class="hz-mini" id="htzxTheme">🎨</button><style>
   .hz-mini{border:1px solid var(--line);background:var(--panel2);color:var(--txt);border-radius:20px;padding:5px 12px;font-size:.8rem;cursor:pointer}
   .hz-mini:hover{background:var(--brand)}
   .hz-tm{position:fixed;top:46px;right:14px;z-index:9991;background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:8px;min-width:200px;box-shadow:0 10px 40px rgba(0,0,0,.5)}
   .hz-tm .it{padding:7px 10px;border-radius:8px;cursor:pointer;font-size:.88rem;display:flex;flex-direction:column}
   .hz-tm .it:hover{background:var(--panel2)} .hz-tm .ln{color:var(--dim);font-size:.74rem;font-style:italic}</style>`;
  nav.appendChild(b);
  document.getElementById("htzxLang").onclick=()=>{ const n=window.I18n.get()==="zh"?"en":"zh";
    window.I18n.set(n); document.querySelector("#htzxTheme").dispatchEvent(new MouseEvent("click"));
    document.querySelector("#htzxTheme").dispatchEvent(new MouseEvent("click"));};
  document.getElementById("htzxTheme").onclick=e=>{ e.stopPropagation(); const o=document.querySelector(".hz-tm");
    if(o){o.remove();return;} const m=document.createElement("div"); m.className="hz-tm";
    (window.Theme?window.Theme.list():[]).forEach(t=>{ const d=document.createElement("div"); d.className="it";
      d.innerHTML=`<b>${I(t.nameKey)}</b><span class="ln">${I(t.lineKey)}</span>`;
      d.onclick=()=>{window.Theme.set(t.id);m.remove();}; m.appendChild(d);});
    document.body.appendChild(m);
    setTimeout(()=>{const once=()=>{m.remove();document.removeEventListener("click",once);};
      document.addEventListener("click",once);},0);};
}
if(document.readyState==="complete"||document.readyState==="interactive")setTimeout(()=>{mount();topbar();},80);
else document.addEventListener("DOMContentLoaded",()=>setTimeout(()=>{mount();topbar();},80));
window.HTZX_SETUP={mount,topbar};
})();
