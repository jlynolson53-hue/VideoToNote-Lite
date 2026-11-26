// v1.8.4：B 站合集批量生成
(function () {
  const inp = $("input"), pBox = $("pBox"); if (!inp || !pBox) return;
  const stl = document.createElement("style"); stl.textContent = "#sBox{margin:10px 0 4px;padding:14px;border-radius:16px;background:var(--surface-container,rgba(128,128,128,.08));display:none;animation:vIn .3s}#sBox .ph{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px}#sBox .ph b{font-size:15px}#sBox .ph span{font-size:13px;color:var(--on-surface-variant)}#sList{max-height:300px;overflow:auto;display:flex;flex-direction:column;gap:6px}#sList label{position:relative;display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:14px;font-size:14px;color:var(--on-surface);margin:0;cursor:pointer;-webkit-tap-highlight-color:transparent;border:1.5px solid transparent;transition:background-color .25s,border-color .25s,transform .25s cubic-bezier(.34,1.56,.64,1)}#sList label:active{transform:scale(.98)}#sList input{position:absolute;opacity:0;width:1px;height:1px;pointer-events:none}#sList label::before{content:'';flex:none;width:22px;height:22px;border-radius:11px;border:2px solid var(--outline,#c7c7cc);box-sizing:border-box;transition:all .28s cubic-bezier(.34,1.56,.64,1)}#sList label.on{background:var(--secondary-container);border-color:var(--primary,#111111)}#sList label.on::before{border-color:var(--primary,#111111);background:var(--primary,#111111) url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M6 12.5l4 4 8-9' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\") center/16px no-repeat;animation:vCk .32s cubic-bezier(.34,1.56,.64,1)}#sList label.on span{color:var(--on-secondary-container);font-weight:500}#sList em{font-style:normal;color:var(--on-surface-variant);font-size:12px;margin-left:auto;flex:none}#sList label.dn:not(.on) span{color:var(--on-surface-variant)}#sList label.dn em{color:#34C759}#sList label.cur{animation:vPulse 1.6s ease-in-out infinite}#sBox .pa{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}#sBox .pa .sec{flex:1}" + "#sBox .ph em{font-style:normal;font-size:12px;color:var(--on-surface-variant);margin-left:6px}";
  document.head.appendChild(stl);
  const box = document.createElement("div"); box.id = "sBox"; pBox.after(box);
  let eps = [], sTitle = "", lastKey = "", jt = 0;
  const fmtT = s => Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
  function judge() { clearTimeout(jt); if (!inp.value.trim()) { box.style.display = "none"; lastKey = ""; return; } jt = setTimeout(load, 700); }
  async function load() {
    const t = inp.value.trim(); if (t === lastKey || window.__batch) return; lastKey = t;
    try {
      const info = await parseInput(t);
      const v = await bget("https://api.bilibili.com/x/web-interface/view?" + (info.bv ? "bvid=" + info.bv : "aid=" + info.av));
      if (inp.value.trim() !== t) return;
      const ss = v.ugc_season;
      eps = []; if (ss && ss.sections) ss.sections.forEach(sec => (sec.episodes || []).forEach(e => eps.push({ bv: e.bvid, title: e.title || (e.arc && e.arc.title) || e.bvid, dur: (e.page && e.page.duration) || (e.arc && e.arc.duration) || 0 })));
      sTitle = (ss && ss.title) || "";
      if (eps.length > 1) draw(v.bvid); else box.style.display = "none";
    } catch (e) { box.style.display = "none"; }
  }
  function draw(curBv) {
    const done = new Set(loadHist().map(x => x.bvid));
    box.innerHTML = '<div class="ph"><b></b><span></span></div><div id="sList"></div><div class="pa"><button class="sec" data-a="all">全选</button><button class="sec" data-a="new">只选没做过的</button><button class="big" data-a="go" style="flex:2">批量生成</button></div>';
    box.querySelector(".ph b").textContent = "所属合集《" + sTitle.slice(0, 20) + "》"; box.querySelector(".ph b").insertAdjacentHTML("beforeend", "<em>共 " + eps.length + " 集</em>");
    const L = box.querySelector("#sList");
    eps.forEach((e, i) => {
      const lb = document.createElement("label"); if (done.has(e.bv)) lb.className = "dn";
      lb.innerHTML = '<input type="checkbox"><span></span><em></em>';
      lb.querySelector("input").value = e.bv; lb.querySelector("input").checked = e.bv === curBv;
      lb.querySelector("span").textContent = (i + 1) + ". " + e.title + (e.bv === curBv ? "（当前）" : "");
      lb.querySelector("em").textContent = done.has(e.bv) ? "已生成" : fmtT(e.dur);
      L.appendChild(lb);
    });
    const cnt = () => { L.querySelectorAll("label").forEach(l => l.classList.toggle("on", l.querySelector("input").checked)); const n = L.querySelectorAll("input:checked").length; box.querySelector(".ph span").textContent = "已选 " + n + " 集"; const g = box.querySelector('[data-a="go"]'); g.textContent = n ? "批量生成 " + n + " 集" : "批量生成"; g.disabled = !n; };
    L.onchange = cnt; cnt();
    box.querySelector('[data-a="all"]').onclick = () => { const bs = L.querySelectorAll("input"); const on = Array.from(bs).some(b => !b.checked); bs.forEach(b => b.checked = on); cnt(); };
    box.querySelector('[data-a="new"]').onclick = () => { L.querySelectorAll("label").forEach(l => l.querySelector("input").checked = !l.classList.contains("dn")); cnt(); };
    box.querySelector('[data-a="go"]').onclick = () => batch(Array.from(L.querySelectorAll("input:checked")).map(b => b.value), L);
    box.style.display = "block";
  }
  async function batch(list, L) {
    if (window.__busy || !list.length) return;
    const ok = await window.__askOr("批量生成 " + list.length + " 集", "开始", "合集里的视频会一集一集依次生成，每集存成一篇笔记（多 P 的视频只做 P1）。\n中途出错会停下，已完成的不受影响。可以切到后台。");
    if (!ok) return;
    window.__batch = true; const pn = $("pnum"), keepP = pn.value, keepIn = inp.value; let okN = 0;
    try {
      for (let i = 0; i < list.length; i++) {
        const lb = Array.from(L.querySelectorAll("label")).find(l => l.querySelector("input").value === list[i]);
        L.querySelectorAll("label").forEach(l => l.classList.toggle("cur", l === lb));
        if (lb) lb.scrollIntoView({ block: "nearest", behavior: "smooth" });
        box.querySelector(".ph span").textContent = "进行中 " + (i + 1) + " / " + list.length;
        inp.value = "https://www.bilibili.com/video/" + list[i]; pn.value = "";
        if ($("progErr")) $("progErr").textContent = "";
        await run(false);
        if ($("progErr") && $("progErr").textContent.trim()) { snack("第 " + (i + 1) + " 集出错，批量已停止"); break; }
        okN++;
        if (lb) { lb.className = "dn"; lb.querySelector("em").textContent = "已生成"; lb.querySelector("input").checked = false; L.dispatchEvent(new Event("change")); }
      }
    } finally {
      window.__batch = false; pn.value = keepP; inp.value = keepIn; lastKey = keepIn;
      L.querySelectorAll("label").forEach(l => l.classList.remove("cur"));
      box.querySelector(".ph span").textContent = "完成 " + okN + " / " + list.length;
      try { if (document.hidden && HAS_NATIVE && Native.notifyDone2) Native.notifyDone2("合集批量生成结束", "《" + sTitle + "》完成 " + okN + " / " + list.length + " 集"); } catch (e) { __err(e, "L2468") }
      snack("合集批量生成结束：完成 " + okN + " / " + list.length + " 集");
    }
  }
  inp.addEventListener("input", judge); setTimeout(judge, 1000);
})();
