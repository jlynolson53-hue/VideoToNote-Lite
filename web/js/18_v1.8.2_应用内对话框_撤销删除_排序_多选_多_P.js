// v1.8.2：应用内对话框、撤销删除、排序、多选、多 P 批量、笔记内搜索、阅读工具
(function () {
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const reEsc = t => String(t).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const st = document.createElement("style");
  st.textContent =
    ".vDlgM{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.38);display:flex;align-items:center;justify-content:center;padding:24px;animation:vFade .18s}" +
    ".vDlg{background:var(--surface-container-high,#fff);color:var(--on-surface,#000);width:100%;max-width:340px;border-radius:22px;overflow:hidden;box-shadow:0 18px 50px rgba(0,0,0,.28);animation:vPop .24s cubic-bezier(.34,1.56,.64,1);text-align:center}" +
    ".vDlg .tt{font-size:18px;font-weight:600;padding:22px 22px 6px}.vDlg .mm{font-size:15px;line-height:1.55;color:var(--on-surface-variant);padding:0 22px 20px;white-space:pre-line}" +
    ".vDlg .bb{display:flex;border-top:1px solid var(--outline-variant,rgba(128,128,128,.22))}.vDlg .bb button{flex:1;height:44px!important;min-height:44px!important;margin:0!important;padding:0 18px!important;border:0!important;border-radius:0!important;outline:0!important;background:transparent!important;font-size:16px;color:var(--primary,#111111);box-shadow:none!important}" +
    ".vDlg .bb button+button{border-left:1px solid var(--outline-variant,rgba(128,128,128,.22))!important;font-weight:600}.vDlg .bb button.dz{color:#FF3B30}.vDlg .bb button:active{background:rgba(128,128,128,.12)!important;transform:none}" +
    "#undoBar{position:fixed;left:50%;bottom:calc(28px + env(safe-area-inset-bottom));transform:translate(-50%,40px);opacity:0;pointer-events:none;z-index:9997;display:flex;align-items:center;gap:6px;background:#2c2c2e;color:#fff;border-radius:16px;padding:6px 6px 6px 18px;font-size:15px;box-shadow:0 10px 30px rgba(0,0,0,.3);transition:transform .34s cubic-bezier(.34,1.56,.64,1),opacity .2s;max-width:92vw}" +
    "#undoBar.show{transform:translate(-50%,0);opacity:1;pointer-events:auto}#undoBar span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    "#undoBar button{background:rgba(90,200,250,.16);border:0;color:#5AC8FA;font-weight:600;font-size:15px;padding:0 16px;height:38px;min-height:0;border-radius:12px;flex:none}" +
    "#undoBar i{display:block;position:absolute;left:14px;right:14px;bottom:3px;height:2px;border-radius:1px;background:#5AC8FA;opacity:.6;transform-origin:left}" +
    ".libMeta .acts2{display:flex;gap:4px}.libMeta .acts2 button{border:0;background:transparent;color:var(--primary,#111111);font-size:14px;padding:4px 8px;min-height:0;box-shadow:none}" +
    "#hist.sel .nc{padding-left:48px;position:relative}#hist.sel .nc::before{content:'';position:absolute;left:14px;top:50%;width:22px;height:22px;margin-top:-11px;border-radius:11px;border:2px solid var(--outline,#c7c7cc);box-sizing:border-box;transition:all .2s}" +
    "#hist.sel .nc.pk{background:var(--secondary-container)}#hist.sel .nc.pk::before{background:var(--primary,#111111);border-color:var(--primary,#111111);box-shadow:inset 0 0 0 4px var(--surface-container-high,#fff)}#hist.sel .nm{visibility:hidden}" +
    "#selBar{position:fixed;left:50%;bottom:calc(20px + env(safe-area-inset-bottom));transform:translate(-50%,120%);z-index:60;display:flex;align-items:center;gap:4px;background:var(--surface-container-high,#fff);border-radius:20px;padding:8px;box-shadow:0 10px 36px rgba(0,0,0,.22);transition:transform .34s cubic-bezier(.34,1.56,.64,1);max-width:94vw}" +
    "#selBar.show{transform:translate(-50%,0)}#selBar b{padding:0 12px;font-size:15px;white-space:nowrap}#selBar button{border:0;background:transparent;color:var(--primary,#111111);font-size:15px;height:40px;min-height:0;padding:0 12px;border-radius:12px;box-shadow:none}#selBar button.dz{color:#FF3B30}#selBar button:disabled{opacity:.35}" +
    "#linkHint{font-size:13px;margin:6px 4px 0;min-height:18px}#linkHint.ok{color:#34C759}#linkHint.bad{color:#FF9500}" +
    "#pBox{margin:10px 0 4px;padding:14px;border-radius:16px;background:var(--surface-container,rgba(128,128,128,.08));display:none;animation:vIn .3s}" +
    "#pBox .ph{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px}#pBox .ph b{font-size:15px}#pBox .ph span{font-size:13px;color:var(--on-surface-variant)}" +
    "#pList{max-height:300px;overflow:auto;display:flex;flex-direction:column;gap:6px}" +
    "#pList label{position:relative;display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:14px;font-size:14px;color:var(--on-surface);margin:0;cursor:pointer;-webkit-tap-highlight-color:transparent;border:1.5px solid transparent;transition:background-color .25s,border-color .25s,transform .25s cubic-bezier(.34,1.56,.64,1)}" +
    "#pList label:active{transform:scale(.98)}" +
    "#pList input{position:absolute;opacity:0;width:1px;height:1px;pointer-events:none}" +
    "#pList label::before{content:'';flex:none;width:22px;height:22px;border-radius:11px;border:2px solid var(--outline,#c7c7cc);box-sizing:border-box;transition:all .28s cubic-bezier(.34,1.56,.64,1)}" +
    "#pList label.on{background:var(--secondary-container);border-color:var(--primary,#111111)}" +
    "#pList label.on::before{border-color:var(--primary,#111111);background:var(--primary,#111111) url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M6 12.5l4 4 8-9' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\") center/16px no-repeat;animation:vCk .32s cubic-bezier(.34,1.56,.64,1)}" +
    "@keyframes vCk{0%{transform:scale(.6)}60%{transform:scale(1.15)}100%{transform:scale(1)}}" +
    "#pList label.on span{color:var(--on-secondary-container);font-weight:500}" +
    "#pList em{font-style:normal;color:var(--on-surface-variant);font-size:12px;margin-left:auto;flex:none}" +
    "#pList label.dn:not(.on) span{color:var(--on-surface-variant)}#pList label.dn em{color:#34C759}#pList label.cur{animation:vPulse 1.6s ease-in-out infinite}" +
    "#pBox .pa{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}#pBox .pa .sec{flex:1}" +
    "#errBox .errTip{font-size:14px;line-height:1.6;margin-top:10px;padding:10px 12px;border-radius:12px;background:rgba(255,149,0,.12)}#errBox .errAct{display:flex;gap:8px;margin-top:10px}" +
    "#readTools{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:0 0 12px}#readTools .chip5{height:32px;min-height:32px}" +
    "#findBar{display:none;align-items:center;gap:6px;margin:0 0 12px;padding:4px 4px 4px 14px;border-radius:14px;background:var(--surface-container-high,rgba(128,128,128,.1));animation:vIn .25s}#findBar.on{display:flex}" +
    "#findBar input{flex:1;border:0!important;background:transparent!important;height:40px;padding:0!important;margin:0;box-shadow:none!important}#findBar span{font-size:13px;color:var(--on-surface-variant);min-width:44px;text-align:center}" +
    "#findBar button{border:0;background:transparent;width:36px;height:36px;min-height:0;padding:0;border-radius:18px;font-size:18px;color:var(--on-surface);box-shadow:none}" +
    "mark.fd{background:rgba(255,204,0,.45);color:inherit;border-radius:3px}mark.fd.cur{background:#FF9500;color:#fff}" +
    "#tocBox a{display:block;padding:10px 6px;border-radius:10px;color:inherit;text-decoration:none;font-size:15px}#tocBox a:active{background:rgba(128,128,128,.12)}" +
    "#readBar{position:fixed;top:0;left:0;height:3px;background:var(--primary,#111111);width:0;z-index:50;border-radius:0 2px 2px 0}" +
    "#topBtn{position:fixed;right:20px;bottom:calc(90px + env(safe-area-inset-bottom));width:46px;height:46px;min-height:0;border-radius:23px;border:0;background:var(--surface-container-high,#fff);color:var(--on-surface,#000);box-shadow:0 4px 16px rgba(0,0,0,.18);font-size:20px;z-index:40;opacity:0;transform:scale(.7);pointer-events:none;transition:opacity .2s,transform .3s cubic-bezier(.34,1.56,.64,1)}#topBtn.show{opacity:1;transform:none;pointer-events:auto}";
  document.head.appendChild(st);

  // ===== 0. 应用内对话框，替换系统弹窗 =====
  function askOr(title, ok, msg, danger, cancel) {
    return new Promise(res => {
      const m = document.createElement("div"); m.className = "vDlgM";
      m.innerHTML = '<div class="vDlg"><div class="tt"></div><div class="mm"></div><div class="bb"><button data-r="0"></button><button data-r="1"></button></div></div>';
      m.querySelector(".tt").textContent = title; m.querySelector(".mm").textContent = msg || "";
      if (!msg) m.querySelector(".mm").style.display = "none";
      m.querySelector('[data-r="0"]').textContent = cancel || "取消";
      const b = m.querySelector('[data-r="1"]'); b.textContent = ok; if (danger) b.classList.add("dz");
      const done = v => { if (!m.isConnected) return; m.remove(); if (window.__dlgClose === close) window.__dlgClose = null; res(v); };
      const close = () => done(false);
      m.onclick = e => { const x = e.target.closest("[data-r]"); if (x) done(x.dataset.r === "1"); else if (e.target === m) done(false); };
      window.__dlgClose = close;
      document.body.appendChild(m);
    });
  }
  window.__askOr = askOr;
  window.__ask = (title, msg, ok, danger) => askOr(title, ok, msg, danger);
  const _bk = window.__back;
  if (typeof _bk === "function") window.__back = function () { if (window.__dlgClose) { window.__dlgClose(); return true; } return _bk.apply(this, arguments); };
  window.confirm = function (m) { snack(String(m)); return false; };

  // ===== 1. 删除可撤销 =====
  const ub = document.createElement("div"); ub.id = "undoBar"; ub.innerHTML = "<span></span><button>撤销</button><i></i>"; document.body.appendChild(ub);
  let undoFn = null, ut = 0;
  function undoSnack(msg, fn) {
    const sn = $("snack"); if (sn) sn.classList.remove("show");
    undoFn = fn; ub.querySelector("span").textContent = msg; ub.classList.add("show");
    const bar = ub.querySelector("i"); bar.style.transition = "none"; bar.style.transform = "scaleX(1)"; void bar.offsetWidth;
    bar.style.transition = "transform 6s linear"; bar.style.transform = "scaleX(0)";
    clearTimeout(ut); ut = setTimeout(() => { ub.classList.remove("show"); undoFn = null; }, 6000);
  }
  ub.querySelector("button").onclick = () => { clearTimeout(ut); ub.classList.remove("show"); const f = undoFn; undoFn = null; if (f) f(); };
  function refresh() { if (window.__drawTagBar) window.__drawTagBar(); drawHist(); }
  function delMany(times, label) {
    const before = Store.get("vtn_hist") || "[]";
    const set = new Set(times.map(String));
    Store.set("vtn_hist", JSON.stringify(loadHist().filter(x => !set.has(String(x.time)))));
    refresh();
    undoSnack(label, () => { Store.set("vtn_hist", before); refresh(); snack("已恢复"); });
  }
  window.__delNote = it => delMany([it.time], "已删除《" + String(it.title || "").slice(0, 12) + "》");

  // ===== 2. 排序 + 多选 =====
  const SORTS = [["new", "最新在前", "schedule"], ["old", "最早在前", "history"], ["title", "按标题", "sort_by_alpha"]];
  let selMode = false; const picked = new Set();
  const _dh = drawHist;
  drawHist = function () {
    const mode = Store.get("vtn_sort") || "new";
    if (mode === "new") _dh();
    else {
      const keep = Store.get("vtn_hist") || "[]"; let a = []; try { a = JSON.parse(keep); } catch (e) { __err(e, "L2155") }
      a.sort(mode === "old" ? (x, y) => x.time - y.time : (x, y) => String(x.title || "").localeCompare(String(y.title || ""), "zh"));
      try { Store.set("vtn_hist", JSON.stringify(a)); _dh(); } finally { Store.set("vtn_hist", keep); }
    }
    decorate();
  };
  function decorate() {
    const meta = document.querySelector(".libMeta"), box = $("hist"); if (!meta || !box) return;
    box.classList.toggle("sel", selMode);
    box.querySelectorAll(".nc").forEach(d => d.classList.toggle("pk", picked.has(d.dataset.t)));
    if (meta.querySelector(".acts2")) return;
    const mode = Store.get("vtn_sort") || "new";
    const w = document.createElement("div"); w.className = "acts2";
    w.innerHTML = '<button data-a="sort"></button><button data-a="sel">选择</button>';
    w.querySelector('[data-a="sort"]').textContent = SORTS.find(x => x[0] === mode)[1] + " ▾";
    w.querySelector('[data-a="sort"]').onclick = e => { e.stopPropagation(); openMenu(e.currentTarget, SORTS.map(([k, t, ic]) => [t + (k === mode ? "  ✓" : ""), ic, () => { Store.set("vtn_sort", k); drawHist(); }])); };
    w.querySelector('[data-a="sel"]').onclick = () => setSel(!selMode);
    if (selMode) w.querySelector('[data-a="sel"]').textContent = "完成";
    meta.appendChild(w);
  }
  const sb = document.createElement("div"); sb.id = "selBar";
  sb.innerHTML = '<b>已选 0 篇</b><button data-a="all">全选</button><button data-a="tag">分类</button><button data-a="md">导出</button><button data-a="del" class="dz">删除</button>';
  document.body.appendChild(sb);
  function upSel() {
    sb.querySelector("b").textContent = "已选 " + picked.size + " 篇";
    ["tag", "del", "md"].forEach(k => sb.querySelector('[data-a="' + k + '"]').disabled = !picked.size);
    const vis = Array.from(document.querySelectorAll("#hist .nc")).map(d => d.dataset.t);
    sb.querySelector('[data-a="all"]').textContent = vis.length && vis.every(t => picked.has(t)) ? "全不选" : "全选";
    document.querySelectorAll("#hist .nc").forEach(d => d.classList.toggle("pk", picked.has(d.dataset.t)));
  }
  function setSel(on) { selMode = on; picked.clear(); sb.classList.toggle("show", on); const f = document.querySelector(".fab"); if (f) f.style.visibility = on ? "hidden" : ""; drawHist(); upSel(); }
  window.__exitSel = () => { if (selMode) { setSel(false); return true; } return false; };
  const _bk2 = window.__back;
  if (typeof _bk2 === "function") window.__back = function () { if (selMode) { setSel(false); return true; } return _bk2.apply(this, arguments); };
  const hb = $("hist");
  if (hb) {
    hb.addEventListener("click", e => {
      if (!selMode) return; const d = e.target.closest(".nc"); if (!d) return;
      e.stopPropagation(); e.preventDefault();
      const t = d.dataset.t; picked.has(t) ? picked.delete(t) : picked.add(t); upSel();
    }, true);
    let lp = 0;
    hb.addEventListener("touchstart", e => { const d = e.target.closest(".nc"); if (!d || selMode) return; lp = setTimeout(() => { setSel(true); picked.add(d.dataset.t); upSel(); if (navigator.vibrate) navigator.vibrate(15); }, 550); }, { passive: true });
    ["touchend", "touchmove", "touchcancel"].forEach(ev => hb.addEventListener(ev, () => clearTimeout(lp), { passive: true }));
  }
  sb.onclick = async e => {
    const b = e.target.closest("button"); if (!b) return; const a = b.dataset.a;
    if (a === "all") { const vis = Array.from(document.querySelectorAll("#hist .nc")).map(d => d.dataset.t); const allOn = vis.every(t => picked.has(t)); vis.forEach(t => allOn ? picked.delete(t) : picked.add(t)); upSel(); }
    if (a === "del") { const n = picked.size; const ts = Array.from(picked); setSel(false); delMany(ts, "已删除 " + n + " 篇笔记"); }
    if (a === "tag" && window.__pickTag) {
      const t = await window.__pickTag("", "给 " + picked.size + " 篇笔记设置分类"); if (t === null) return;
      const h = loadHist(); h.forEach(x => { if (picked.has(String(x.time))) { if (t) x.tag = t; else delete x.tag; } });
      Store.set("vtn_hist", JSON.stringify(h)); const n = picked.size; setSel(false); refresh(); snack(t ? n + " 篇已归入「" + t + "」" : "已取消 " + n + " 篇的分类");
    }
    if (a === "md") {
      const h = loadHist().filter(x => picked.has(String(x.time)));
      const md = h.map(x => "# " + x.title + "\n\n" + String(x.md || "").replace(/^#\s[^\n]*\n/, "")).join("\n\n---\n\n");
      const d = new Date(), p2 = n => String(n).padStart(2, "0");
      const nm = "FrameNote合集_" + h.length + "篇_" + d.getFullYear() + p2(d.getMonth() + 1) + p2(d.getDate()) + ".md";
      try { const r = Native.saveFile(nm, md); if (String(r).startsWith("err")) throw new Error(r); snack("已导出到 下载/VideoToNote/" + nm); setSel(false); } catch (x) { snack("导出失败：" + x.message); }
    }
  };

  // ===== 3. 生成页：链接识别 + 多 P 批量 =====
  const inp = $("input");
  const pBox = document.createElement("div"); pBox.id = "pBox";
  if (inp) {
    const hint = document.createElement("div"); hint.id = "linkHint";
    (inp.closest("div") || inp).after(hint); hint.after(pBox);
    let jt = 0, lastKey = "", pages = [], vTitle = "";
    function judge() {
      const t = inp.value.trim(); hint.className = ""; hint.textContent = "";
      if (!t) { pBox.style.display = "none"; lastKey = ""; return; }
      const bv = t.match(/\bBV[0-9A-Za-z]{10}\b/), av = t.match(/\bav(\d{3,})\b/i), b23 = /b23\.tv\/\w+/i.test(t), p = t.match(/[?&]p=(\d+)/);
      if (bv || av) { hint.className = "ok"; hint.textContent = "已识别：" + (bv ? bv[0] : "av" + av[1]) + (p ? " · 第 " + p[1] + " P" : ""); }
      else if (b23) { hint.className = "ok"; hint.textContent = "已识别：B 站短链"; }
      else if (/https?:\/\//.test(t)) { hint.className = "bad"; hint.textContent = "这不像 B 站视频链接，请检查"; pBox.style.display = "none"; return; }
      else { hint.className = "bad"; hint.textContent = "没找到 BV 号或链接"; pBox.style.display = "none"; return; }
      clearTimeout(jt); jt = setTimeout(loadPages, 500);
    }
    async function loadPages() {
      const t = inp.value.trim(); if (t === lastKey || window.__batch) return; lastKey = t;
      try {
        const info = await parseInput(t);
        const v = await bget("https://api.bilibili.com/x/web-interface/view?" + (info.bv ? "bvid=" + info.bv : "aid=" + info.av));
        if (inp.value.trim() !== t) return;
        pages = v.pages || []; vTitle = v.title || "";
        const ht = $("linkHint"); ht.className = "ok"; ht.textContent = "《" + vTitle.slice(0, 30) + "》" + (pages.length > 1 ? " · 共 " + pages.length + " P" : "");
        if (pages.length > 1) drawP(info.p || 0); else pBox.style.display = "none";
      } catch (e) { pBox.style.display = "none"; }
    }
    const fmtT = s => Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
    function drawP(cur) {
      const done = new Set(loadHist().filter(x => x.title && x.title.indexOf(vTitle) === 0).map(x => x.p));
      pBox.innerHTML = '<div class="ph"><b>这是多 P 视频</b><span></span></div><div id="pList"></div><div class="pa"><button class="sec" data-a="all">全选</button><button class="sec" data-a="new">只选没做过的</button><button class="big" data-a="go" style="flex:2">批量生成</button></div>';
      const L = pBox.querySelector("#pList");
      pages.forEach(pg => {
        const lb = document.createElement("label"); if (done.has(pg.page)) lb.className = "dn";
        lb.innerHTML = '<input type="checkbox"><span></span><em></em>';
        lb.querySelector("input").value = pg.page; lb.querySelector("input").checked = cur ? pg.page === cur : false;
        lb.querySelector("span").textContent = "P" + pg.page + "  " + (pg.part || "");
        lb.querySelector("em").textContent = done.has(pg.page) ? "已生成" : fmtT(pg.duration || 0);
        L.appendChild(lb);
      });
      const cnt = () => { L.querySelectorAll("label").forEach(l => l.classList.toggle("on", l.querySelector("input").checked)); const n = L.querySelectorAll("input:checked").length; pBox.querySelector(".ph span").textContent = "已选 " + n + " P"; pBox.querySelector('[data-a="go"]').textContent = n > 1 ? "批量生成 " + n + " P" : "批量生成"; pBox.querySelector('[data-a="go"]').disabled = n < 2; };
      L.onchange = cnt; cnt();
      pBox.querySelector('[data-a="all"]').onclick = () => { const bs = L.querySelectorAll("input"); const on = Array.from(bs).some(b => !b.checked); bs.forEach(b => b.checked = on); cnt(); };
      pBox.querySelector('[data-a="new"]').onclick = () => { L.querySelectorAll("label").forEach(l => l.querySelector("input").checked = !l.classList.contains("dn")); cnt(); };
      pBox.querySelector('[data-a="go"]').onclick = () => batch(Array.from(L.querySelectorAll("input:checked")).map(b => +b.value));
      pBox.style.display = "block";
    }
    async function batch(list) {
      if (window.__busy || !list.length) return;
      const ok = await askOr("批量生成 " + list.length + " P", "开始", "会一 P 一 P 依次生成，每一 P 存成一篇笔记。\n中途出错会停下，已完成的不受影响。可以切到后台。");
      if (!ok) return;
      window.__batch = true; const pn = $("pnum"), keep = pn.value; let okN = 0;
      const L = pBox.querySelector("#pList");
      try {
        for (let i = 0; i < list.length; i++) {
          L.querySelectorAll("label").forEach(l => l.classList.toggle("cur", +l.querySelector("input").value === list[i]));
          pBox.querySelector(".ph span").textContent = "进行中 " + (i + 1) + " / " + list.length;
          pn.value = list[i];
          if ($("progErr")) $("progErr").textContent = "";
          await run(false);
          if ($("progErr") && $("progErr").textContent.trim()) { snack("P" + list[i] + " 出错，批量已停止"); break; }
          okN++;
          const lb = Array.from(L.querySelectorAll("label")).find(l => +l.querySelector("input").value === list[i]);
          if (lb) { lb.className = "dn"; lb.querySelector("em").textContent = "已生成"; lb.querySelector("input").checked = false; }
          L.dispatchEvent(new Event("change"));
        }
      } finally {
        window.__batch = false; pn.value = keep;
        L.querySelectorAll("label").forEach(l => l.classList.remove("cur"));
        pBox.querySelector(".ph span").textContent = "完成 " + okN + " / " + list.length;
        try { if (document.hidden && HAS_NATIVE && Native.notifyDone2) Native.notifyDone2("批量生成结束", "《" + vTitle + "》完成 " + okN + " / " + list.length + " P"); } catch (e) { __err(e, "L2289") }
        snack("批量生成结束：完成 " + okN + " / " + list.length + " P");
      }
    }
    inp.addEventListener("input", judge); setTimeout(judge, 900);
    const pn = $("pnum"); if (pn) pn.addEventListener("input", judge);
  }

  // ===== 4. 出错说明 + 重试 =====
  const pe = $("progErr");
  if (pe) {
    const eb = document.createElement("div"); eb.id = "errBox"; pe.after(eb);
    const tips = [
      [/401|unauthor|invalid.*key|api key/i, "API Key 不对或已失效：去“设置”重新粘贴 Key，再点“测试”。"],
      [/402|insufficient|余额|balance|quota/i, "账户余额不足：去模型平台充值后重试。"],
      [/429|rate limit|频繁|too many/i, "请求太频繁：等 1 分钟再点“重试”。"],
      [/timeout|超时|network|failed to fetch|网络/i, "网络不稳定：换个网络或稍后重试，已完成的进度不会丢。"],
      [/字幕|subtitle/i, "这个视频没有字幕：可在设置里填硅基流动 Key，用语音转写。"],
      [/-404|不存在|啥都木有/i, "视频找不到：检查链接是否正确、视频是否已删除。"],
      [/没有识别到/i, "链接不对：复制 B 站视频的分享链接或 BV 号再试。"]
    ];
    const upd = () => {
      const txt = pe.textContent.trim(); eb.innerHTML = "";
      if (!txt || window.__busy) return;
      const hit = tips.find(([re]) => re.test(txt));
      if (hit) { const d = document.createElement("div"); d.className = "errTip"; d.textContent = hit[1]; eb.appendChild(d); }
      const a = document.createElement("div"); a.className = "errAct";
      a.innerHTML = '<button class="sec" data-a="retry">重试</button><button class="sec" data-a="log">查看日志</button>';
      a.querySelector('[data-a="retry"]').onclick = () => { if (window.__busy) return; eb.innerHTML = ""; $("goBtn").click(); };
      a.querySelector('[data-a="log"]').onclick = () => { const l = $("logBox"); if (l) { l.open = true; l.scrollIntoView({ behavior: "smooth" }); } };
      eb.appendChild(a);
    };
    new MutationObserver(() => setTimeout(upd, 50)).observe(pe, { childList: true, characterData: true, subtree: true });
  }

  // ===== 5. 阅读工具 + 笔记内搜索 =====
  const pv = $("preview");
  if (pv) {
    const bar = document.createElement("div"); bar.id = "readBar"; document.body.appendChild(bar);
    const top = document.createElement("button"); top.id = "topBtn"; top.textContent = "↑"; document.body.appendChild(top);
    top.onclick = () => scrollTo({ top: 0, behavior: "smooth" });
    const tools = document.createElement("div"); tools.id = "readTools";
    tools.innerHTML = '<button class="chip5" data-a="find">搜索</button><button class="chip5" data-a="toc">目录</button><button class="chip5" data-a="s">A−</button><button class="chip5" data-a="b">A+</button><span class="mute" id="readInfo" style="font-size:13px;margin-left:auto"></span>';
    const fb = document.createElement("div"); fb.id = "findBar";
    fb.innerHTML = '<input id="findQ" placeholder="在这篇笔记里搜索"><span id="findN"></span><button data-a="up">↑</button><button data-a="dn">↓</button><button data-a="x">×</button>';
    pv.before(tools, fb);
    const fs = () => parseInt(Store.get("vtn_fs") || "17");
    const applyFs = () => { pv.style.fontSize = fs() + "px"; };
    applyFs();
    tools.querySelector('[data-a="s"]').onclick = () => { Store.set("vtn_fs", String(Math.max(13, fs() - 1))); applyFs(); snack("字号 " + fs()); };
    tools.querySelector('[data-a="b"]').onclick = () => { Store.set("vtn_fs", String(Math.min(24, fs() + 1))); applyFs(); snack("字号 " + fs()); };
    let hits = [], hi = 0;
    function clearMarks() { pv.querySelectorAll("mark.fd").forEach(m => { const t = document.createTextNode(m.textContent); m.replaceWith(t); }); pv.normalize(); hits = []; }
    function find() {
      clearMarks(); const q = $("findQ").value.trim(); $("findN").textContent = "";
      if (!q) return;
      const re = new RegExp(reEsc(q), "ig"), nodes = [];
      const w = document.createTreeWalker(pv, NodeFilter.SHOW_TEXT, { acceptNode: n => n.parentElement.closest(".katex,script,style") ? 2 : 1 });
      while (w.nextNode()) nodes.push(w.currentNode);
      nodes.forEach(n => {
        const t = n.nodeValue; if (!re.test(t)) return; re.lastIndex = 0;
        const f = document.createDocumentFragment(); let last = 0, m;
        while ((m = re.exec(t))) { f.append(t.slice(last, m.index)); const mk = document.createElement("mark"); mk.className = "fd"; mk.textContent = m[0]; f.append(mk); hits.push(mk); last = m.index + m[0].length; }
        f.append(t.slice(last)); n.replaceWith(f);
      });
      hi = 0; go(0);
    }
    function go(d) {
      if (!hits.length) { $("findN").textContent = $("findQ").value.trim() ? "0/0" : ""; return; }
      hits.forEach(h => h.classList.remove("cur"));
      hi = (hi + d + hits.length) % hits.length;
      hits[hi].classList.add("cur"); hits[hi].scrollIntoView({ behavior: "smooth", block: "center" });
      $("findN").textContent = (hi + 1) + "/" + hits.length;
    }
    let ft = 0;
    $("findQ").oninput = () => { clearTimeout(ft); ft = setTimeout(find, 250); };
    $("findQ").onkeydown = e => { if (e.key === "Enter") go(1); };
    fb.querySelector('[data-a="up"]').onclick = () => go(-1);
    fb.querySelector('[data-a="dn"]').onclick = () => go(1);
    const closeFind = () => { clearMarks(); $("findQ").value = ""; $("findN").textContent = ""; fb.classList.remove("on"); };
    fb.querySelector('[data-a="x"]').onclick = closeFind;
    tools.querySelector('[data-a="find"]').onclick = () => { if (fb.classList.toggle("on")) setTimeout(() => $("findQ").focus(), 50); else closeFind(); };
    tools.querySelector('[data-a="toc"]').onclick = () => {
      const hs = Array.from(pv.querySelectorAll("h1,h2,h3"));
      if (!hs.length) { snack("这篇笔记没有小标题"); return; }
      const m = document.createElement("div"); m.className = "vSheetM";
      m.innerHTML = '<div class="vSheet"><div class="grab"></div><h3>目录</h3><div id="tocBox"></div></div>';
      const box = m.querySelector("#tocBox");
      const close = () => { m.remove(); if (window.__sheetClose === close) window.__sheetClose = null; };
      hs.forEach(hd => {
        const a = document.createElement("a"); a.href = "javascript:void 0";
        a.style.paddingLeft = (hd.tagName === "H3" ? 26 : hd.tagName === "H2" ? 14 : 6) + "px";
        if (hd.tagName === "H1") a.style.fontWeight = "600";
        a.textContent = hd.textContent;
        a.onclick = () => { close(); hd.scrollIntoView({ behavior: "smooth", block: "start" }); };
        box.appendChild(a);
      });
      m.onclick = e => { if (e.target === m) close(); };
      window.__sheetClose = close; document.body.appendChild(m);
    };
    function info() {
      if (hits.length) return;
      const n = (pv.textContent || "").replace(/\s/g, "").length;
      $("readInfo").textContent = n ? "约 " + n + " 字 · 读完约 " + Math.max(1, Math.round(n / 500)) + " 分钟" : "";
      if (fb.classList.contains("on") && $("findQ").value) setTimeout(find, 0);
    }
    new MutationObserver(info).observe(pv, { childList: true }); info();
    addEventListener("scroll", () => {
      const det = $("pg-det"), on = det && det.classList.contains("on");
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.width = on && max > 0 ? Math.min(100, scrollY / max * 100) + "%" : "0";
      top.classList.toggle("show", !!on && scrollY > 600);
    }, { passive: true });
  }
  drawHist();
})();
