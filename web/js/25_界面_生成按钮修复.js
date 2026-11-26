// v2.0.2：真正修复生成按钮、设置双栏、重复箭头、侧栏图标底色
(function () {
  const st = document.createElement("style");
  st.textContent =
    "#fnBar{display:flex!important;flex-wrap:nowrap!important;align-items:center!important;gap:12px!important}" +
    "#fnBar #goBtn{flex:1 1 auto!important;width:auto!important;min-width:220px!important;max-width:none!important;height:52px!important;min-height:52px!important;border-radius:26px!important;padding:0 28px!important;white-space:nowrap!important;display:flex!important;flex-direction:row!important;align-items:center!important;justify-content:center!important;gap:8px!important}" +
    "#fnBar #subOnly{flex:0 0 auto!important;width:auto!important;min-width:0!important;padding:0 16px!important;height:52px!important;border-radius:26px!important;border:1px solid var(--fn-line)!important;background:transparent!important}" +
    "#fnOpt>summary::after{display:none!important;content:none!important}" +
    ".nav button .pill,.nav button.on .pill{background:none!important;box-shadow:none!important}.nav button .pill::before,.nav button .pill::after{display:none!important}" +
    "@media (min-width:841px){#pg-set .fnSet{display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start}#pg-set .fnS{min-width:0}#pg-set .fnS>.grp{margin-bottom:0!important}}";
  document.head.appendChild(st);
  const w = $("pg-set") && $("pg-set").querySelector(".wrap");
  if (w && !w.querySelector(".fnSet")) {
    const gts = Array.from(w.children).filter(x => x.classList.contains("gt"));
    if (gts.length > 1) {
      const g = document.createElement("div"); g.className = "fnSet"; gts[0].before(g);
      gts.forEach(t => {
        const sec = document.createElement("div"); sec.className = "fnS"; g.appendChild(sec);
        let n = t; const mv = [t]; n = t.nextElementSibling;
        while (n && !n.classList.contains("gt") && n !== g) { mv.push(n); n = n.nextElementSibling; }
        mv.forEach(x => sec.appendChild(x));
      });
      Array.from(w.children).filter(x => x !== g && x.classList.contains("card")).forEach(c => { const sec = document.createElement("div"); sec.className = "fnS"; sec.appendChild(c); g.appendChild(sec); });
    }
  }
  const sb = $("sBox"); if (sb) sb.classList.remove("open");
})();
