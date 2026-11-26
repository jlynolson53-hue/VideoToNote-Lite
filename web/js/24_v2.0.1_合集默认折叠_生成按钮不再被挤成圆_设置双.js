// v2.0.1：合集默认折叠、生成按钮不再被挤成圆、设置双栏、去掉点击蓝框、更多动效
(function () {
  const st = document.createElement("style");
  st.textContent =
    "*{-webkit-tap-highlight-color:transparent!important}button:focus,button:focus-visible,a:focus,.nav button:focus{outline:none!important}" +
    "#fnBar #goBtn{position:static!important;width:auto!important;min-width:0!important;height:52px!important;border-radius:26px!important;padding:0 24px!important;display:flex!important;align-items:center;justify-content:center;gap:8px;overflow:visible!important;transform:none;right:auto!important;bottom:auto!important;left:auto!important}" +
    "#fnBar #goBtn *{display:inline!important}" +
    "#fnBar{background:var(--surface,#fff)!important;border-top:1px solid var(--fn-line);padding-left:4px;padding-right:4px}" +
    "#sBox .ph{cursor:pointer;user-select:none}#sBox .ph::after{content:'expand_more';font-family:'Material Symbols Rounded';font-size:22px;margin-left:8px;transition:transform .3s cubic-bezier(.2,.8,.2,1)}#sBox.open .ph::after{transform:rotate(180deg)}" +
    "#sBox #sList,#sBox .pa{display:grid}#sBox:not(.open) #sList,#sBox:not(.open) .pa{display:none!important}#sBox.open #sList{animation:fnDrop .32s cubic-bezier(.2,.8,.2,1)}" +
    "#fnOpt[open]>div{animation:fnDrop .3s cubic-bezier(.2,.8,.2,1)}#fnOpt>summary .ic:last-child{transition:transform .3s}#fnOpt[open]>summary .ic:last-child{transform:rotate(180deg)}" +
    "@keyframes fnDrop{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}" +
    "@keyframes fnUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}" +
    "button,.chip5,.nav button,.card,.hist>*,#libList>*{transition:transform .18s cubic-bezier(.2,.8,.2,1),background-color .25s,color .25s,box-shadow .25s,border-color .25s!important}" +
    "button:active,.chip5:active{transform:scale(.96)}.nav button:active{transform:scale(.97)}" +
    ".page.on .card,.page.on .fnS{animation:fnUp .42s cubic-bezier(.2,.8,.2,1) both}" +
    ".page.on .card:nth-child(2),.page.on .fnS:nth-child(2){animation-delay:.05s}.page.on .card:nth-child(3),.page.on .fnS:nth-child(3){animation-delay:.1s}.page.on .card:nth-child(4),.page.on .fnS:nth-child(4){animation-delay:.15s}.page.on .card:nth-child(n+5){animation-delay:.2s}" +
    ".chip5.on{animation:fnPop .25s}@keyframes fnPop{50%{transform:scale(1.06)}}" +
    "@media (min-width:841px){#pg-set .wrap{max-width:1200px!important}#pg-set .fnGrid{display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start}#pg-set .fnGrid>.card{margin:0!important}" +
    "#pg-set .fnGrid>.card>h2,#pg-set .fnGrid>.card>summary{font-size:17px}}" +
    "#pg-set .card{border-radius:20px!important}";
  document.head.appendChild(st);
  // 合集：默认折叠，点标题展开
  const sb = $("sBox");
  if (sb) sb.addEventListener("click", e => { if (e.target.closest(".ph")) sb.classList.toggle("open"); });
  // 设置页：卡片排成两栏
  const ps = $("pg-set"), w = ps && ps.querySelector(".wrap");
  if (w) {
    const g = document.createElement("div"); g.className = "fnGrid";
    const cards = Array.from(w.children).filter(x => x.classList && (x.classList.contains("card") || x.tagName === "DETAILS"));
    if (cards.length > 1) { cards[0].before(g); cards.forEach(c => g.appendChild(c)); }
  }
})();
