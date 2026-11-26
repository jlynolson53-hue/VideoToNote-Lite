// v2.1.3：搜索框同色（学 Grok）、动效优化
(function () {
  const st = document.createElement("style");
  st.textContent =
    ".search{background:var(--surface-container-high,#e9e9ec)!important;border:0!important;box-shadow:none!important;border-radius:28px!important;transition:background .2s,box-shadow .2s}" +
    ".search input,.search input:focus{background:transparent!important;border:0!important;box-shadow:none!important;outline:none!important;border-radius:0!important}" +
    ".search:focus-within{background:var(--surface,#fff)!important;box-shadow:0 0 0 1.5px var(--on-surface)!important}" +
    "[data-theme=dark] .search{background:#2c2c2e!important}[data-theme=dark] .search:focus-within{background:#1b1b1c!important}" +
    "@media (prefers-reduced-motion:no-preference){" +
    ".page.on{animation:fnPage .32s cubic-bezier(.2,.8,.2,1)!important}@keyframes fnPage{from{opacity:0;transform:translateY(10px) scale(.995)}to{opacity:1;transform:none}}" +
    "#hist>*{animation:fnRise .35s cubic-bezier(.2,.8,.2,1) both}#hist>*:nth-child(2){animation-delay:.03s}#hist>*:nth-child(3){animation-delay:.06s}#hist>*:nth-child(4){animation-delay:.09s}#hist>*:nth-child(5){animation-delay:.12s}#hist>*:nth-child(n+6){animation-delay:.15s}" +
    "@keyframes fnRise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}" +
    "button,.hist,.li,.chip5,#fnSetList button{transition:transform .18s cubic-bezier(.3,1.6,.5,1),background .18s,opacity .18s}" +
    "#fnMath.show .bx{animation:fnZoom .25s cubic-bezier(.2,.9,.3,1.2)}@keyframes fnZoom{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:none}}" +
    "details[open]>*:not(summary){animation:fnRise .25s ease}" +
    ".nav button .ic{transition:transform .25s cubic-bezier(.3,1.6,.5,1)}.nav button.on .ic{transform:scale(1.08)}" +
    "}" +
    "@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}";
  document.head.appendChild(st);
  const q = $("libQ"); if (q && !q.dataset.fnClr) {
    q.dataset.fnClr = 1; const x = document.createElement("i"); x.className = "ic"; x.textContent = "close";
    x.style.cssText = "cursor:pointer;opacity:0;transition:opacity .2s;margin-right:6px";
    q.after(x); const up = () => x.style.opacity = q.value ? .6 : 0;
    q.addEventListener("input", up); x.onclick = () => { q.value = ""; q.dispatchEvent(new Event("input")); q.focus(); up(); };
  }
})();
