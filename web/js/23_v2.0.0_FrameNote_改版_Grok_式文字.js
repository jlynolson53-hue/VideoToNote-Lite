// v2.0.0：FrameNote 改版——Grok 式文字侧栏、黑白主色、生成页底部操作栏、选项折叠
(function () {
  const st = document.createElement("style");
  st.textContent =
    ":root{--primary:#111!important;--on-primary:#fff!important;--secondary-container:#e9e9ec!important;--on-secondary-container:#111!important;--fn-line:rgba(0,0,0,.12)}" +
    "@media (prefers-color-scheme:dark){:root{--primary:#f2f2f2!important;--on-primary:#111!important;--secondary-container:#2c2c2e!important;--on-secondary-container:#fff!important;--fn-line:rgba(255,255,255,.16)}}" +
    "html.dark{--primary:#f2f2f2!important;--on-primary:#111!important;--secondary-container:#2c2c2e!important;--on-secondary-container:#fff!important;--fn-line:rgba(255,255,255,.16)}" +
    ".chip5{background:transparent!important;border:1px solid var(--fn-line)!important;color:var(--on-surface)!important;box-shadow:none!important}" +
    ".chip5.on{background:var(--secondary-container)!important;border-color:var(--on-surface)!important;color:var(--on-surface)!important;font-weight:600}" +
    "#goBtn,.big,#readTools .pri,.pdfS .seg .chip5.on{background:var(--primary)!important;color:var(--on-primary)!important;border-color:var(--primary)!important;box-shadow:0 4px 14px rgba(0,0,0,.18)!important}" +
    "#readTools .pri::before{color:inherit}" +
    ".fn-brand{display:none}" +
    "@media (min-width:841px){body{padding-left:256px!important}" +
    ".nav{width:240px!important;padding:20px 16px!important;gap:8px!important;align-items:stretch!important}" +
    ".fn-brand{display:flex;align-items:center;gap:10px;font-size:22px;font-weight:800;padding:4px 8px 18px;color:var(--on-surface)}" +
    ".fn-brand i{width:34px;height:34px;border-radius:9px;background:#000;color:#fff;display:flex;align-items:center;justify-content:center;font-style:normal;font-size:20px}" +
    ".nav button{flex-direction:row!important;justify-content:flex-start!important;gap:14px!important;padding:14px 16px!important;border-radius:16px!important;font-size:17px!important;font-weight:600!important;color:var(--on-surface)!important;background:var(--surface,#fff)!important;max-width:none!important;width:100%}" +
    ".nav button .pill{width:auto!important;height:auto!important}" +
    ".nav button.on{background:var(--primary)!important;color:var(--on-primary)!important}" +
    ".wrap{max-width:960px!important;margin:0 auto!important}}" +
    "#fnOpt{border:1px solid var(--fn-line);border-radius:16px;padding:0 14px;margin:12px 0}" +
    "#fnOpt>summary{list-style:none;display:flex;align-items:center;gap:8px;padding:12px 0;cursor:pointer;font-size:15px}" +
    "#fnOpt>summary::-webkit-details-marker{display:none}" +
    "#fnOpt>summary b{font-weight:600}#fnOpt>summary span{color:var(--on-surface-variant);flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    "#fnBar{position:sticky;bottom:0;z-index:20;display:flex;align-items:center;gap:10px;padding:12px 0 calc(12px + env(safe-area-inset-bottom));margin-top:8px;background:linear-gradient(to top,var(--surface,#fff) 75%,transparent)}" +
    "#fnBar #goBtn{flex:1;margin:0!important;height:52px;border-radius:26px!important;font-size:17px}#fnBar #subOnly{margin:0!important;white-space:nowrap}";
  document.head.appendChild(st);
  const nav = document.querySelector(".nav");
  if (nav && !nav.querySelector(".fn-brand")) { const b = document.createElement("div"); b.className = "fn-brand"; b.innerHTML = "<i>▶</i>FrameNote"; nav.prepend(b); }
  const card = $("genCard"), go = $("goBtn"), sub = $("subOnly"), row = $("input") && $("input").closest(".frow");
  if (card && go && row) {
    const det = document.createElement("details"); det.id = "fnOpt";
    det.innerHTML = '<summary><i class="ic" style="font-size:20px">tune</i><b>生成选项</b><span id="fnSum"></span><i class="ic">expand_more</i></summary>';
    const box = document.createElement("div"); det.appendChild(box);
    let n = row.nextSibling; const mv = [];
    while (n && n !== go) { mv.push(n); n = n.nextSibling; }
    mv.forEach(x => box.appendChild(x));
    row.after(det);
    const bar = document.createElement("div"); bar.id = "fnBar"; det.after(bar); bar.appendChild(go); if (sub) bar.appendChild(sub);
    const sum = () => {
      const on = Array.from(box.querySelectorAll(".chip5.on")).map(c => c.textContent.trim()).filter(t => t && t !== "不分类");
      const p = $("pnum") && $("pnum").value ? "P" + $("pnum").value : "";
      const rq = $("reqEn") && $("reqEn").checked ? "我的要求" : "";
      $("fnSum").textContent = [p].concat(on, [rq]).filter(Boolean).join(" · ") || "默认";
    };
    box.addEventListener("click", () => setTimeout(sum, 50)); box.addEventListener("change", sum); box.addEventListener("input", sum);
    setTimeout(sum, 300);
  }
})();
