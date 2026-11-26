// v2.1.2：公式放大/复制、截图跳转视频、深色模式修正
(function () {
  const st = document.createElement("style");
  st.textContent =
    ":root[data-theme=light]{--primary:#111!important;--on-primary:#fff!important;--secondary-container:#e9e9ec!important;--on-secondary-container:#111!important;--fn-line:rgba(0,0,0,.12)!important}" +
    ":root[data-theme=dark]{--primary:#f2f2f2!important;--on-primary:#111!important;--secondary-container:#2c2c2e!important;--on-secondary-container:#fff!important;--fn-line:rgba(255,255,255,.16)!important}" +
    "[data-theme=dark] #preview h2{border-left-color:var(--on-surface)!important}[data-theme=dark] .pvS.cur i{animation:fnPulseD 1.6s ease-in-out infinite!important}@keyframes fnPulseD{50%{box-shadow:0 0 0 5px rgba(255,255,255,.14)}}" +
    "[data-theme=dark] .katex{color:var(--on-surface)}[data-theme=dark] #preview .shot img{border-color:rgba(255,255,255,.12)}" +
    "#preview .katex-display,#preview .katex{cursor:zoom-in}#preview .katex-display{overflow-x:auto;overflow-y:hidden;padding:4px 0}" +
    "#fnMath{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.55);display:none;align-items:center;justify-content:center;padding:24px}#fnMath.show{display:flex;animation:fnIn .2s}" +
    "#fnMath .bx{background:var(--surface,#fff);color:var(--on-surface,#111);border-radius:20px;max-width:94vw;max-height:80vh;overflow:auto;padding:28px 24px 16px}" +
    "#fnMath .eq{font-size:2em;white-space:nowrap}#fnMath .ft{display:flex;gap:8px;justify-content:flex-end;margin-top:16px}#fnMath .ft button{all:unset;cursor:pointer;padding:8px 16px;border-radius:18px;border:1px solid var(--fn-line);font-size:14px}" +
    "#preview .shot figcaption.tsj{cursor:pointer;text-decoration:underline dotted}";
  document.head.appendChild(st);
  const ov = document.createElement("div"); ov.id = "fnMath";
  ov.innerHTML = '<div class="bx"><div class="eq"></div><div class="ft"><button data-a="m">缩小</button><button data-a="p">放大</button><button data-a="c">复制 LaTeX</button><button data-a="x">关闭</button></div></div>';
  document.body.appendChild(ov);
  let tex = "", fz = 2;
  const texOf = k => { const a = k.querySelector("annotation"); return a ? a.textContent.trim() : ""; };
  const copy = t => { if (!t) return; (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => { try { snack("已复制 LaTeX"); } catch (e) { __err(e, "L2885") } }).catch(() => prompt("复制以下 LaTeX", t)); };
  const openM = k => { tex = texOf(k); fz = 2; const eq = ov.querySelector(".eq"); eq.style.fontSize = "2em"; eq.innerHTML = ""; eq.appendChild(k.cloneNode(true)); ov.classList.add("show"); };
  ov.onclick = e => { const b = e.target.closest("button"); if (e.target === ov || (b && b.dataset.a === "x")) { ov.classList.remove("show"); return; } if (!b) return;
    if (b.dataset.a === "c") copy(tex); else { fz = Math.max(1, Math.min(5, fz + (b.dataset.a === "p" ? .5 : -.5))); ov.querySelector(".eq").style.fontSize = fz + "em"; } };
  const pv = $("preview"); if (!pv) return;
  let tm = null, longed = false;
  pv.addEventListener("pointerdown", e => { const k = e.target.closest(".katex-display,.katex"); if (!k) return; longed = false; tm = setTimeout(() => { longed = true; copy(texOf(k)); }, 550); });
  ["pointerup", "pointercancel", "pointermove"].forEach(ev => pv.addEventListener(ev, e => { if (ev !== "pointermove" || Math.abs(e.movementX) + Math.abs(e.movementY) > 6) clearTimeout(tm); }));
  pv.addEventListener("click", e => {
    const k = e.target.closest(".katex-display") || e.target.closest(".katex");
    if (k && !longed) { e.preventDefault(); openM(k.classList.contains("katex-display") ? k : k); return; }
    const fc = e.target.closest(".shot figcaption.tsj");
    if (fc && current && current.bvid && HAS_NATIVE) { e.preventDefault(); Native.openUrl("https://www.bilibili.com/video/" + current.bvid + "?p=" + (current.p || 1) + "&t=" + fc.dataset.t); }
  }, true);
  const mark = () => pv.querySelectorAll(".shot figcaption:not(.tsj)").forEach(fc => {
    const m = fc.textContent.match(/(?:(\d+):)?(\d{1,2}):(\d{2})/); if (!m) return;
    fc.dataset.t = (+(m[1] || 0)) * 3600 + (+m[2]) * 60 + (+m[3]); fc.classList.add("tsj"); fc.title = "点击跳到视频这一刻";
  });
  new MutationObserver(mark).observe(pv, { childList: true, subtree: true }); mark();
})();
