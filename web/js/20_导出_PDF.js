// v1.8.6：导出 PDF（系统打印 → 保存为 PDF；可选单栏/双栏）（vtn_pdf）
(function () {
  // v2.8.4：预览和导出共用的排版缩放函数（导出时会转成字符串放进打印页面）
  function __fnFitCore(root,W){if(!root||!W)return;function fitBases(el){[].slice.call(el.querySelectorAll('.base')).forEach(function(b){var w=b.offsetWidth;if(w>W)b.style.zoom=(W/w*0.97).toFixed(3)})}[].slice.call(root.querySelectorAll('.katex-display')).forEach(function(d){var k=d.querySelector('.katex');if(!k)return;k.style.zoom='';k.style.display='inline-block';var w=k.scrollWidth;if(w<=W)return;var an=d.querySelector('annotation');var tex=an&&an.textContent;if(tex&&window.katex&&!/\\begin|\\\\/.test(tex)){try{var nb=document.createElement('div');nb.className='fnBrk';tex=tex.replace(/,(?![^{]*\})/g,',\\allowbreak ');katex.render('\\displaystyle '+tex,nb,{displayMode:false,throwOnError:false});d.replaceWith(nb);fitBases(nb);return}catch(e){/* 失败就改用整体缩放 */}}k.style.zoom=(W/w*0.98).toFixed(3)});[].slice.call(root.querySelectorAll('table,pre')).forEach(function(t){t.style.zoom='';var w=t.scrollWidth;if(w>W)t.style.zoom=(W/w*0.98).toFixed(3)});[].slice.call(root.querySelectorAll('img')).forEach(function(i){i.style.maxWidth='100%'});[].slice.call(root.querySelectorAll('.katex')).forEach(function(k){if(!k.closest('.fnBrk,.katex-display'))fitBases(k)})}
  { const ps = document.createElement("style"); ps.textContent = ".lpv .fnBrk{display:block;margin:5pt 0;line-height:2.1;text-align:left}.lpv .fnBrk .katex{white-space:normal}.lpv .c2 .katex-display{font-size:.92em!important}.lpv .katex-display>.katex{display:inline-block;white-space:nowrap}.lpv .c2 table{font-size:.76em}.lpv .c2 th,.lpv .c2 td{padding:2pt 3pt}.lpv th,.lpv td{overflow-wrap:anywhere;word-break:break-word}"; document.head.appendChild(ps); }
  const st = document.createElement("style"); st.textContent = ".pdfS .seg{display:flex;gap:8px;flex-wrap:wrap;margin:6px 0 14px}.pdfS .lb{font-size:13px;color:var(--on-surface-variant);margin-top:4px}.pdfS .seg .chip5{flex:1;justify-content:center;min-width:72px;color:var(--on-surface,#1c1c1e);background:transparent}.pdfS .seg .chip5.on{background:#111111!important;color:#fff!important;border-color:#111111!important;font-weight:600}.pdfS .seg .chip5.on::before{color:#fff}.pdfS .pvw{display:flex;justify-content:center;margin:4px 0 12px}.pdfS .pg{width:120px;height:170px;background:#fff;border-radius:6px;box-shadow:0 4px 18px rgba(0,0,0,.18);padding:12px 10px;box-sizing:border-box;display:flex;flex-direction:column;gap:5px;transition:all .3s}.pdfS .pg .hd{height:9px;width:70%;background:#333;border-radius:2px;margin-bottom:4px}.pdfS .pg .bd{flex:1;display:flex;gap:7px}.pdfS .pg .cl{flex:1;display:flex;flex-direction:column;gap:4px}.pdfS .pg .cl i{display:block;height:3px;background:#bbb;border-radius:2px}.pdfS .pg .cl i.im{height:22px;background:#e5e5e5}.pdfS .pg.one .cl+.cl{display:none}.pdfS .pg.two .cl+.cl{border-left:1px solid #ddd;padding-left:6px}.pdfS .pg.noimg i.im{display:none}@media print{#v5print.pp{color:#222;line-height:1.62;font-family:'Noto Serif CJK SC','Source Han Serif SC','Songti SC',serif}#v5print.pp .ptl{column-span:all;border-bottom:1.2pt solid #333;padding-bottom:6pt;margin-bottom:10pt}#v5print.pp .ptl b{display:block;font-size:1.55em;line-height:1.3;font-family:sans-serif}#v5print.pp .ptl span{font-size:.8em;color:#666}#v5print.pp.c2 .pbd{column-count:2;column-gap:7mm;column-rule:.4pt solid #bbb}#v5print.pp .pbd>h1:first-child{display:none}#v5print.pp h1{column-span:all;font-size:1.35em;margin:12pt 0 6pt}#v5print.pp h2{font-size:1.18em;margin:10pt 0 4pt;padding-left:5pt;border-left:3pt solid #111111}#v5print.pp h3{font-size:1.05em;margin:8pt 0 3pt}#v5print.pp h1,#v5print.pp h2,#v5print.pp h3{break-after:avoid;page-break-after:avoid}#v5print.pp p,#v5print.pp li{orphans:2;widows:2;margin:3pt 0}#v5print.pp img,#v5print.pp figure,#v5print.pp table,#v5print.pp pre,#v5print.pp blockquote,#v5print.pp .katex-display,#v5print.pp .shot{break-inside:avoid;page-break-inside:avoid}#v5print.pp img{max-width:100%;height:auto;border-radius:3pt}#v5print.pp .katex-display{overflow:hidden;margin:5pt 0}#v5print.pp.c2 .katex-display{font-size:.9em}#v5print.pp pre{white-space:pre-wrap;word-break:break-all;font-size:.85em}#v5print.pp table{font-size:.88em;width:100%;border-collapse:collapse}#v5print.pp blockquote{margin:5pt 0;padding:4pt 8pt;border-left:2pt solid #999;background:#f5f5f5}#v5print.pp.noimg img,#v5print.pp.noimg figure,#v5print.pp.noimg .shot{display:none!important}}"; document.head.appendChild(st);
  const pst = document.createElement("style"); document.head.appendChild(pst);
  const sst = document.createElement("style"); sst.textContent = ".vSheet.pdfS{max-height:90vh;overflow-y:auto}.pdfS .fsr{display:flex;align-items:center;gap:8px}.pdfS .fsr input{flex:1}.pdfS .fsv{font-weight:600;margin-left:6px}.pdfS .smp{display:none;margin:8px 0 4px;padding:8px 10px;border:1px solid rgba(128,128,128,.35);border-radius:10px}"; sst.textContent +=
    ".pdfS .lpv{margin:4px 0 10px}.pdfS .lpvT{font-size:12px;opacity:.7;margin-bottom:6px}.pdfS .lpvF{position:relative;overflow:hidden;border-radius:6px;box-shadow:0 2px 12px rgba(0,0,0,.25);background:#fff}" +
    ".lpv .pgx{position:absolute;left:0;top:0;width:794px;height:1123px;box-sizing:border-box;transform-origin:0 0;background:#fff;color:#222;overflow:hidden;text-align:start}" +
    ".lpv .pgx .ptl{border-bottom:1.2pt solid #333;padding-bottom:6pt;margin-bottom:10pt}.lpv .pgx .ptl b{display:block;font-size:1.6em;line-height:1.3;font-family:sans-serif}.lpv .pgx .ptl span{font-size:.8em;color:#666}" +
    ".lpv .pbd.c2{column-count:2;column-gap:7mm;column-rule:.4pt solid #bbb;column-fill:auto;height:calc(100% - 60px)}.lpv .pbd>h1:first-child{display:none}" +
    ".lpv h1{font-size:1.35em;margin:12pt 0 6pt;font-family:sans-serif}.lpv h2{font-size:1.16em;margin:10pt 0 4pt;padding-left:5pt;border-left:3pt solid #111;font-family:sans-serif}.lpv h3{font-size:1.04em;margin:8pt 0 3pt;font-family:sans-serif}" +
    ".lpv ul,.lpv ol{padding-left:1.4em;margin:3pt 0}.lpv img{max-width:100%;height:auto;display:block;margin:4pt auto;border-radius:3pt}.lpv .shot{margin:5pt 0}.lpv .shot figcaption{font-size:.8em;color:#777;text-align:center}" +
    ".lpv .katex-display{margin:5pt 0;overflow:hidden}.lpv .c2 .katex-display{font-size:.88em}.lpv table{font-size:.86em;width:100%;border-collapse:collapse;table-layout:fixed}.lpv th,.lpv td{border:.5pt solid #999;padding:3pt 4pt;vertical-align:top}.lpv th{background:#eee}" +
    ".lpv blockquote{margin:5pt 0;padding:4pt 8pt;border-left:2pt solid #999;background:#f5f5f5}.lpv .pgx *{color:inherit}.lpv .pno{position:absolute;left:0;right:0;text-align:center;font:8.5pt sans-serif;color:#888}" +
    "@media (min-width:900px){.vSheet.pdfS{width:min(1240px,94vw);max-width:none;display:grid;grid-template-columns:minmax(300px,42%) 1fr;column-gap:24px;align-content:start}.vSheet.pdfS>*{grid-column:2}.vSheet.pdfS>.lpv{grid-column:1;grid-row:1/span 60;position:sticky;top:0;align-self:start}}";
  sst.textContent += ".vSheet.pdfS{border-radius:28px;padding-bottom:0}.vSheet.pdfS .lb{font-size:11px;letter-spacing:.08em;text-transform:uppercase;opacity:.55;margin:14px 0 6px}" +
    ".vSheet.pdfS .seg{border-radius:14px;padding:3px;gap:2px}.vSheet.pdfS .seg .chip5{min-height:40px;border-radius:11px;font-size:14px;white-space:nowrap;transition:background .2s,color .2s,transform .15s}.vSheet.pdfS .seg .chip5:active{transform:scale(.96)}" +
    ".vSheet.pdfS .acts{position:sticky;bottom:0;margin:16px -24px 0;padding:12px 24px 16px;background:inherit;border-top:1px solid rgba(128,128,128,.18);backdrop-filter:blur(12px);z-index:3}" +
    ".pdfS .lpvF{width:100%;box-sizing:border-box;border-radius:4px;box-shadow:0 1px 2px rgba(0,0,0,.12),0 12px 32px -8px rgba(0,0,0,.35);transition:height .25s}.pdfS .lpvT{display:flex;justify-content:space-between;font-variant-numeric:tabular-nums}" +
    ".lpv .pgx{transition:padding .25s}.lpv .pgx .pbd{transition:font-size .2s}" +
    "@media (min-width:900px){.vSheet.pdfS>.lpv{padding:18px;border-radius:20px;background:rgba(128,128,128,.10)}}";
  document.head.appendChild(sst);
  const D = { col: "2", fs: "m", fsn: "", lh: "n", ps: "n", ms: "n", img: "1", mg: "n", ff: "song", pn: "1", hd: "1", cr: "1" };
  const opt = () => { try { return Object.assign({}, D, JSON.parse(Store.get("vtn_pdf") || "{}")); } catch (e) { return Object.assign({}, D); } };
  const FS = { s: "10pt", m: "11.5pt", l: "13pt" }, MG = { n: "16mm 14mm 16mm 14mm", w: "10mm 9mm 12mm 9mm", x: "22mm 20mm 22mm 20mm" };
  const LH = { c: "1.45", n: "1.62", l: "1.85", x: "2.1" }, PS = { c: "1pt", n: "3pt", l: "6pt" }, MS = { s: 0.9, n: 1, l: 1.12 };
  const fsv = o => (o.fsn ? parseFloat(o.fsn) : parseFloat(FS[o.fs] || FS.m)) + "pt";
  const xcss = o => (o.hd === "0" ? ".ptl{display:none}" : "") + (o.cr === "0" ? ".pbd.c2{column-rule:none!important}" : "") +
    "p,li{margin:" + (PS[o.ps] || PS.n) + " 0!important}.pbd .katex{font-size:" + (1.21 * (MS[o.ms] || 1)).toFixed(3) + "em}";
  function open() {
    if (!current) { snack("先打开一篇笔记"); return; }
    const o = opt();
    const m = document.createElement("div"); m.className = "vSheetM";
    m.innerHTML = '<div class="vSheet pdfS"><div class="grab"></div><h3>导出 PDF</h3><div class="mute ttl" style="margin-bottom:10px"></div>' +
      '<div class="pvw"><div class="pg"><div class="hd"></div><div class="bd"><div class="cl"><i></i><i></i><i class="im"></i><i></i><i></i><i></i><i></i></div><div class="cl"><i></i><i></i><i></i><i class="im"></i><i></i><i></i></div></div></div></div>' +
      '<div class="lb">排版</div><div class="seg" data-k="col"><button class="chip5" data-v="1">单栏</button><button class="chip5" data-v="2">双栏（教材式）</button></div>' +
      '<div class="lb">字号 <b class="fsv"></b></div><div class="fsr"><button class="chip5" data-d="-0.5">A−</button><input type="range" class="fsi" min="8" max="16" step="0.5"><button class="chip5" data-d="0.5">A+</button></div>' +
      '<div class="smp">正文示例：牛顿第二定律 <i>F</i> = <i>ma</i>，加速度与合力成正比。<br>第二行用来看行距效果。</div>' +
      '<div class="lb">行距</div><div class="seg" data-k="lh"><button class="chip5" data-v="c">紧凑</button><button class="chip5" data-v="n">标准</button><button class="chip5" data-v="l">宽松</button><button class="chip5" data-v="x">很宽</button></div>' +
      '<div class="lb">段落间距</div><div class="seg" data-k="ps"><button class="chip5" data-v="c">紧凑</button><button class="chip5" data-v="n">标准</button><button class="chip5" data-v="l">宽松</button></div>' +
      '<div class="lb">公式大小</div><div class="seg" data-k="ms"><button class="chip5" data-v="s">小</button><button class="chip5" data-v="n">标准</button><button class="chip5" data-v="l">大</button></div>' +
      '<div class="lb">字体</div><div class="seg" data-k="ff"><button class="chip5" data-v="song">宋体</button><button class="chip5" data-v="hei">黑体</button></div>' +
      '<div class="lb">截图</div><div class="seg" data-k="img"><button class="chip5" data-v="1">全部保留</button><button class="chip5" data-v="2">只保留正文</button><button class="chip5" data-v="0">不要（更省纸）</button></div>' +
      '<div class="lb">页边距</div><div class="seg" data-k="mg"><button class="chip5" data-v="n">标准</button><button class="chip5" data-v="w">窄</button><button class="chip5" data-v="x">宽（留批注）</button></div>' +
      '<div class="lb">其他</div><div class="seg" data-k="pn"><button class="chip5" data-v="1">显示页码</button><button class="chip5" data-v="0">不要页码</button></div>' +
      '<div class="seg" data-k="hd" style="margin-top:6px"><button class="chip5" data-v="1">显示标题栏</button><button class="chip5" data-v="0">不要标题栏</button></div>' +
      '<div class="seg" data-k="cr" style="margin-top:6px"><button class="chip5" data-v="1">双栏分隔线</button><button class="chip5" data-v="0">无分隔线</button></div>' +
      '<div class="mute" style="font-size:13px;line-height:1.6;margin-top:2px">直接生成 PDF 文件，保存到 下载/VideoToNote，不经过系统打印。页边距、分栏、页码都由 App 排好。</div>' +
      '<div class="acts"><button class="sec" data-a="rs">恢复默认</button><button class="sec" data-a="x">取消</button><button class="big" data-a="go" style="flex:1">导出</button></div></div>';
    m.querySelector(".ttl").textContent = "《" + String(current.title || "").slice(0, 30) + "》";
    const lpv = document.createElement("div"); lpv.className = "lpv";
    lpv.innerHTML = '<div class="lpvT">实时预览 · 第 1 页<span></span></div><div class="lpvF"><div class="pgx"><style></style><div class="ptl"><b></b><span></span></div><div class="pbd"></div><div class="pno">1 / …</div></div></div>';
    lpv.querySelector(".ptl b").textContent = current.title || "笔记";
    lpv.querySelector(".ptl span").textContent = (current.tag ? current.tag + " · " : "") + new Date(current.time || Date.now()).toLocaleDateString();
    const sheet = m.querySelector(".vSheet"); sheet.insertBefore(lpv, sheet.querySelector(".lb"));
    const pvw0 = m.querySelector(".pvw"); if (pvw0) pvw0.style.display = "none";
    let lastImg = null;
    function pvBody() {
      if (lastImg === o.img) return; lastImg = o.img;
      const tmp = lpv.querySelector(".pbd"); tmp.innerHTML = render(curMd());
      if (o.img === "0") tmp.querySelectorAll("img,figure,.shot").forEach(x => x.remove());
      if (o.img === "2") { Array.from(tmp.querySelectorAll("h1,h2,h3,h4")).filter(h => /课堂截图/.test(h.textContent)).forEach(h => { const lv = +h.tagName[1]; let n = h.nextElementSibling; while (n && !(/^H[1-4]$/.test(n.tagName) && +n.tagName[1] <= lv) && n.tagName !== "HR") { const x = n; n = n.nextElementSibling; x.remove(); } h.remove(); }); }
    }
    function pvFit() { const f = lpv.querySelector(".lpvF"); const w = Math.floor(Math.min(f.getBoundingClientRect().width || 300, (lpv.getBoundingClientRect().width || 9999))) - 1; const k = Math.max(w, 120) / 794; lpv.querySelector(".pgx").style.transform = "scale(" + k + ")"; f.style.height = Math.round(1123 * k) + "px"; }
    // v2.8.4：预览每次重新渲染，再调用和导出完全相同的 __fnFitCore，所见即所得
    function pvFix() {
      let pb = lpv.querySelector(".pbd"); if (!pb) return;
      lastImg = null; pvBody(); pb = lpv.querySelector(".pbd"); pb.style.overflow = "hidden";
      // v2.8.5：用探针元素量出真实栏宽（clientWidth 含内边距，columnGap 可能是 normal，旧算法偏宽）
      const pr = document.createElement("div"); pr.style.cssText = "width:100%;height:0;margin:0;padding:0;border:0";
      pb.insertBefore(pr, pb.firstChild); const W = pr.offsetWidth; pr.remove();
      __fnFitCore(pb, W);
    }
    function pvPaint() {
      pvBody();
      const g = lpv.querySelector(".pgx"), mg = (MG[o.mg] || MG.n);
      g.style.padding = mg; g.style.fontSize = fsv(o); g.style.lineHeight = LH[o.lh] || "1.62";
      g.style.fontFamily = o.ff === "hei" ? "'Noto Sans CJK SC',sans-serif" : "'Noto Serif SC','Noto Serif CJK SC',serif";
      g.querySelector(".pbd").className = "pbd" + (o.col === "2" ? " c2" : "");
      g.querySelector(".pno").style.display = o.pn === "0" ? "none" : "";
      g.querySelector(".pno").style.bottom = "calc(" + mg.split(" ")[2] + " / 2 - 6px)";
      g.querySelector("style").textContent = xcss(o).replace(/(^|\})([^{}@]+)\{/g, (x, a, sel) => a + sel.split(",").map(t => ".lpv .pgx " + t.trim()).join(",") + "{");
      lpv.querySelector(".lpvT span").textContent = "  " + parseFloat(fsv(o)) + " 磅 · " + ({ c: "紧凑", n: "标准", l: "宽松", x: "很宽" }[o.lh] || "标准") + "行距 · 公式" + ({ s: "小", n: "标准", l: "大" }[o.ms] || "标准");
      pvFit();
      try { pvFix(); setTimeout(() => { try { pvFix(); } catch (e) { __err(e, "预览缩放") } }, 400); if (document.fonts) document.fonts.ready.then(() => { try { pvFix(); } catch (e) { __err(e, "预览缩放") } }); } catch (e) { __err(e, "预览缩放") }
    }
    const pg = m.querySelector(".pg");
    function paint() {
      m.querySelectorAll(".seg").forEach(sg => sg.querySelectorAll("button").forEach(b => b.classList.toggle("on", o[sg.dataset.k] === b.dataset.v)));
      pg.className = "pg " + (o.col === "2" ? "two" : "one") + (o.img === "0" ? " noimg" : "");
      const f = parseFloat(fsv(o)); m.querySelector(".fsi").value = f; m.querySelector(".fsv").textContent = f + " 磅";
      const sp = m.querySelector(".smp"); sp.style.fontSize = (f * 1.333).toFixed(1) + "px"; sp.style.lineHeight = LH[o.lh] || "1.62";
      sp.style.fontFamily = o.ff === "hei" ? "sans-serif" : "'Noto Serif SC',serif";
      try { pvPaint(); } catch (e) { __err(e, "L2556") }
    }
    m.querySelectorAll(".seg button").forEach(b => b.onclick = () => { o[b.closest(".seg").dataset.k] = b.dataset.v; paint(); });
    m.querySelector(".fsi").oninput = e => { o.fsn = String(e.target.value); paint(); };
    m.querySelectorAll(".fsr [data-d]").forEach(b => b.onclick = () => { o.fsn = String(Math.min(16, Math.max(8, parseFloat(fsv(o)) + parseFloat(b.dataset.d)))); paint(); });
    m.querySelector('[data-a="rs"]').onclick = () => { Object.keys(o).forEach(k => delete o[k]); Object.assign(o, D); paint(); };
    paint();
    const close = () => { m.remove(); if (window.__sheetClose === close) window.__sheetClose = null; };
    m.onclick = e => { if (e.target === m) close(); };
    m.querySelector('[data-a="x"]').onclick = close;
    m.querySelector('[data-a="go"]').onclick = async () => { Store.set("vtn_pdf", JSON.stringify(o)); close(); await go(o); };
    window.__sheetClose = close; document.body.appendChild(m);
    try { pvPaint(); new ResizeObserver(pvFit).observe(lpv.querySelector(".lpvF")); new ResizeObserver(pvFit).observe(lpv); requestAnimationFrame(pvFit); setTimeout(pvFit, 350); window.addEventListener("resize", pvFit); } catch (e) { __err(e, "L2568") }
  }
  async function legacyGo(o) {
    if (!HAS_NATIVE || !Native.printPdf2) { snack("请在安卓应用里使用"); return; }
    snack("正在排版，图片和公式加载中…");
    try {
      await fillPrint(curMd());
      const pa = $("v5print");
      const body = document.createElement("div"); body.className = "pbd";
      while (pa.firstChild) body.appendChild(pa.firstChild);
      const t = document.createElement("div"); t.className = "ptl";
      t.innerHTML = "<b></b><span></span>";
      t.querySelector("b").textContent = current.title || "笔记";
      t.querySelector("span").textContent = (current.tag ? current.tag + " · " : "") + new Date(current.time || Date.now()).toLocaleDateString() + (current.bvid ? " · " + current.bvid : "");
      pa.append(t, body);
      pa.className = "pp" + (o.col === "2" ? " c2" : "") + (o.img === "0" ? " noimg" : "");
      pa.style.fontSize = fsv(o); pa.style.lineHeight = LH[o.lh] || "1.62";
      pst.textContent = "@page{size:A4;margin:" + (MG[o.mg] || MG.n) + "}" + xcss(o).replace(/\.pbd/g, "#v5print .pbd");
      await new Promise(r => setTimeout(r, 250));
      let vt = ""; try { vt = verTag(); } catch (e) { __err(e, "L2587") }
      Native.printPdf2(safeName(current.title || "笔记") + vt + (o.col === "2" ? "_双栏" : ""));
    } catch (e) { snack("准备 PDF 失败：" + e.message); }
  }
  async function go(o) {
    if (!HAS_NATIVE || !Native.makePdf3) { return legacyGo(o); }
    const old = window.__nativeProg; let lastStep = "准备内容";
    const say = m => { lastStep = m; snack(m); };
    window.__nativeProg = (id, m) => say(m);
    say("正在准备内容…");
    try {
      const tmp = document.createElement("div"); tmp.innerHTML = render(curMd());
      if (o.img === "0") tmp.querySelectorAll("img,figure,.shot").forEach(x => x.remove());
      if (o.img === "2") { Array.from(tmp.querySelectorAll("h1,h2,h3,h4")).filter(h => /课堂截图/.test(h.textContent)).forEach(h => { const lv = +h.tagName[1]; let n = h.nextElementSibling; while (n && !(/^H[1-4]$/.test(n.tagName) && +n.tagName[1] <= lv) && n.tagName !== "HR") { const x = n; n = n.nextElementSibling; x.remove(); } h.remove(); }); }
      tmp.querySelectorAll("img").forEach(i => { i.removeAttribute("loading"); });
      const esc2 = t => String(t).replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
      const sub = (current.tag ? current.tag + " · " : "") + new Date(current.time || Date.now()).toLocaleDateString() + (current.bvid ? " · " + current.bvid : "");
      const FFS = "'Noto Serif SC','Noto Serif CJK SC','Source Han Serif SC','Songti SC','SimSun',serif", FFH = "'Noto Sans CJK SC','Source Han Sans SC','PingFang SC',sans-serif";
      const css = "@page{size:A4;margin:" + (MG[o.mg] || MG.n) + (o.pn === "0" ? "}" : ";@bottom-center{content:counter(page) \" / \" counter(pages);font-size:8.5pt;color:#888;font-family:sans-serif}}") +
        "html,body{background:#fff;margin:0}@media screen{html,body{width:210mm!important}}.pagedjs_pages{width:210mm!important}.pagedjs_sheet,.pagedjs_page{overflow:hidden!important}.pbd .katex{max-width:100%}.pagedjs_area,.pagedjs_page_content,.pbd,.pbd *{max-width:100%!important;box-sizing:border-box;min-width:0!important}.pbd{overflow-wrap:anywhere}.katex-display{overflow:visible!important}.katex-display>.katex{display:inline-block;white-space:nowrap}.c2 .katex-display{font-size:.92em!important}.fnBrk{display:block;margin:5pt 0;line-height:2.1;text-align:left!important}.fnBrk .katex{white-space:normal}a{word-break:break-all}"+"body{color:#222;font-size:" + fsv(o) + ";line-height:" + (LH[o.lh] || "1.62") + ";font-family:" + (o.ff === "hei" ? FFH : FFS) + ";text-align:start}" +
        "*{text-align-last:auto!important;letter-spacing:normal!important;word-spacing:normal!important}p,li,td,th,h1,h2,h3,div{text-align:start!important}" +
        ".ptl{border-bottom:1.2pt solid #333;padding-bottom:6pt;margin-bottom:10pt}.ptl b{display:block;font-size:1.6em;line-height:1.3;font-family:sans-serif}.ptl span{font-size:.8em;color:#666}" +
        ".pbd.c2{column-count:2;column-gap:7mm;column-rule:.4pt solid #bbb;column-fill:auto}.c2 table,.c2 pre,.c2 figure,.c2 .katex-display,.c2 .fnBrk{column-span:none!important}" +
        ".pbd>h1:first-child{display:none}" +
        "h1{font-size:1.35em;margin:12pt 0 6pt;font-family:sans-serif}h2{font-size:1.16em;margin:10pt 0 4pt;padding-left:5pt;border-left:3pt solid #111111;font-family:sans-serif}h3{font-size:1.04em;margin:8pt 0 3pt;font-family:sans-serif}" +
        "h1,h2,h3{break-after:avoid;page-break-after:avoid}p,li{orphans:2;widows:2;margin:3pt 0}ul,ol{padding-left:1.4em;margin:3pt 0}" +
        "img,figure,table,pre,blockquote,.katex-display,.shot{break-inside:avoid;page-break-inside:avoid}" +
        "img{max-width:100%;height:auto;border-radius:3pt;display:block;margin:4pt auto}.shot{margin:5pt 0}.shot figcaption{font-size:.8em;color:#777;text-align:center}" +
        ".katex-display{overflow:hidden;margin:5pt 0}.c2 .katex-display{font-size:.88em}" +
        "pre{white-space:pre-wrap;word-break:break-all;font-size:.85em;background:#f5f5f5;padding:5pt;border-radius:3pt}" +
        "table{font-size:.86em;width:100%;max-width:100%;border-collapse:collapse;table-layout:fixed}th,td{border:.5pt solid #999;padding:3pt 4pt;vertical-align:top;overflow-wrap:anywhere;word-break:break-word}.c2 table{font-size:.76em}.c2 th,.c2 td{padding:2pt 3pt}.c2 table .katex{font-size:.9em}"+"th{background:#eee}" +
        "blockquote{margin:5pt 0;padding:4pt 8pt;border-left:2pt solid #999;background:#f5f5f5}mark{background:#fff3a0}" + xcss(o);
      function __fnFitImpl(){return (document.fonts?document.fonts.ready:Promise.resolve()).then(function(){try{var c2=!!document.querySelector('.pbd.c2');var pr=document.createElement('div');pr.style.cssText='position:absolute;visibility:hidden;width:'+(c2?(window.__fnCW||'84mm'):(window.__fnPW||'172mm'));document.body.appendChild(pr);var W=pr.getBoundingClientRect().width;pr.remove();window.__fnFitCore(document.querySelector('.pbd'),W)}catch(e){/* 打印窗口内，失败就保持原样 */}})}
      // v2.8.2：分页完成后按每页实际栏宽复查，超出的元素整体缩小（不改分页，不跨栏）
      function __fnPostImpl(){var left=0;try{[].forEach.call(document.querySelectorAll('.pagedjs_page .pbd'),function(pb){var P=pb.getBoundingClientRect();if(!P.width)return;var c2=pb.classList.contains('c2');var gap=c2?(parseFloat(getComputedStyle(pb).columnGap)||0):0;var cw=c2?(P.width-gap)/2:P.width;function box(r){if(c2&&r.left>=P.left+cw+gap/2)return[P.left+cw+gap,P.right];return[P.left,P.left+cw]}function over(e){if(e.closest('.katex-mathml'))return null;var r=e.getBoundingClientRect();if(!r.width||!r.height)return null;var bx=box(r);return r.right>bx[1]+2?r:null}for(var pass=0;pass<4;pass++){var hit=0;[].forEach.call(pb.querySelectorAll('*'),function(e){var r=over(e);if(!r)return;var t=e.closest('table,pre,figure,.shot,img,svg,.katex-display,.fnBrk,.katex')||e;if(!pb.contains(t))t=e;if(getComputedStyle(t).display==='inline')t.style.display='inline-block';var tr=t.getBoundingClientRect();var tb=box(tr);var R=Math.max(tr.right,r.right);if(R<=tb[1]+2)return;var s=(tb[1]-tr.left)/(R-tr.left)*0.985;if(!(s>0))return;var ns=Math.max(0.3,parseFloat(t.dataset.fnS||'1')*s);t.dataset.fnS=ns;t.style.transformOrigin='left top';t.style.transform='scale('+ns.toFixed(4)+')';hit++});if(!hit)break}[].forEach.call(pb.querySelectorAll('*'),function(e){if(over(e))left++})})}catch(e){/* 打印窗口内，失败就保持原样 */}window.__fnLeft=left;return left}
      const __mgp = String(MG[o.mg] || MG.n).trim().split(/\s+/);
      const __ml = __mgp[3] || __mgp[1] || __mgp[0], __mr = __mgp[1] || __mgp[0];
      const __PW = "calc(210mm - " + __ml + " - " + __mr + ")", __CW = "calc((210mm - " + __ml + " - " + __mr + " - 7mm) / 2)";
      const FITJS = "window.__fnPW=" + JSON.stringify(__PW) + ";window.__fnCW=" + JSON.stringify(__CW) + ";window.__fnFitCore=" + __fnFitCore.toString() + ";window.__fnFit=" + __fnFitImpl.toString() + ";window.__fnPost=" + __fnPostImpl.toString() + ";";
      const cfg0 = "window.onerror=function(m){try{PdfBridge.fail(String(m))}catch(e){}};" +
        "window.PagedConfig={auto:true," +
        "before:function(){try{PdfBridge.prog('正在加载图片和公式…')}catch(e){}var a=[].slice.call(document.images);return Promise.all(a.map(function(i){return i.complete?0:new Promise(function(r){i.onload=i.onerror=r;setTimeout(r,8000)})})).then(function(){try{PdfBridge.prog('正在加载字体…')}catch(e){}return document.fonts&&document.fonts.load?Promise.race([document.fonts.load('16px Noto Serif SC',document.body.textContent.slice(0,30000)),new Promise(function(r){setTimeout(r,15000)})]).catch(function(){}):0}).then(function(){try{PdfBridge.prog('正在分页排版…')}catch(e){}})}," +
        "after:function(f){try{window.__fnPost&&window.__fnPost()}catch(e){PdfBridge.prog('排版复查失败')}try{var bad=[];var pg=document.querySelector('.pagedjs_page');var R=pg?pg.getBoundingClientRect().right+1:1e9;[].slice.call(document.querySelectorAll('.pagedjs_page_content *')).forEach(function(e){if(e.getBoundingClientRect().right>R&&bad.length<3)bad.push(e.tagName)});if(bad.length)PdfBridge.prog('有超宽元素已裁剪：'+bad.join(','))}catch(e){}var n=(f&&f.total)||document.querySelectorAll('.pagedjs_page').length;setTimeout(function(){PdfBridge.done(n)},500)}};";
      const cfg = cfg0 + ";(function(){var C=window.PagedConfig,b=C.before;C.before=function(){var t=(document.body&&document.body.innerText)||\"宋\";var w=Promise.all([document.fonts.load(\"16px 'Noto Serif SC'\",t),document.fonts.load(\"bold 16px 'Noto Serif SC'\",t)]).then(function(){return document.fonts.ready});var to=new Promise(function(r){setTimeout(r,15000)});return Promise.race([w,to]).catch(function(){}).then(function(){return b&&b.apply(this,arguments)}).then(function(){return window.__fnFit&&window.__fnFit()})}})();";
      const html = '<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="katex/katex.min.css"><link rel="stylesheet" href="fonts/serif.css"><style>' + css + "</style><script src=\"katex/katex.min.js\"><\/script><script>" + cfg + FITJS + '<\/script><script src="paged.polyfill.js"><\/script></head><body>' +
        '<div class="ptl"><b>' + esc2(current.title || "笔记") + "</b><span>" + esc2(sub) + "</span></div>" +
        '<div class="pbd' + (o.col === "2" ? " c2" : "") + '">' + tmp.innerHTML + "</div></body></html>";
      let vt = ""; try { vt = verTag(); } catch (e) { __err(e, "L2628") }
      const name = safeName(current.title || "笔记") + vt + (o.col === "2" ? "_双栏" : "") + ".pdf";
      const r = await Promise.race([
        ncall("makePdf3", html, name),
        new Promise((_, rej) => setTimeout(() => rej(new Error("超过 150 秒没有完成")), 150000))
      ]);
      window.__nativeProg = old;
      { const dm = document.createElement("div"); dm.className = "vDlgM"; dm.innerHTML = '<div class="vDlg"><div class="tt">PDF 已导出</div><div class="mm"></div><div class="bb"><button data-r="0">好的</button><button data-r="2">分享</button><button data-r="1">打开</button></div></div>'; dm.querySelector(".mm").textContent = (r.pages ? "共 " + r.pages + " 页。\n" : "") + (r.msg || "") + "\n默认用荣耀文档打开；想发给别人或用其他应用，点“分享”。"; const dc = () => { dm.remove(); if (window.__dlgClose === dc) window.__dlgClose = null; }; dm.onclick = e => { const x = e.target.closest("[data-r]"); if (!x && e.target !== dm) return; dc(); if (x && x.dataset.r === "1") { try { Native.openLast(); } catch (er) { __err(er, "L2635") } } else if (x && x.dataset.r === "2") { try { Native.shareLast(); } catch (er) { __err(er, "L2635") } } }; window.__dlgClose = dc; document.body.appendChild(dm); }
    } catch (e) {
      window.__nativeProg = old;
      const ok = await window.__askOr("导出没成功", "改用系统打印", "停在：" + lastStep + "\n原因：" + e.message + "\n\n可以先用系统打印（在打印界面选“另存为 PDF”）。请把这个提示截图发给我。");
      if (ok) legacyGo(o);
    }
  }
  window.__pdf = function (it) { if (it && (!current || current.time !== it.time)) { show(it); setTimeout(open, 200); } else open(); };
  const tools = $("readTools");
  if (tools) {
    const b = document.createElement("button"); b.className = "chip5"; b.textContent = "导出 PDF"; b.onclick = () => window.__pdf();
    const s0 = tools.querySelector('[data-a="s"]'); s0 ? s0.before(b) : tools.appendChild(b);
  }
})();
