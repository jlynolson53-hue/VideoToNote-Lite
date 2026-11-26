// v1.8.1：笔记库体验（搜索高亮、分类面板、生成时选分类、完整备份恢复）；已删除检查更新
(function () {
  const PRESET = ["物理", "化学", "生物", "数学", "语文", "英语", "其他"];
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const st = document.createElement("style");
  st.textContent =
    "#tagBar{display:flex;gap:8px;overflow-x:auto;margin:0 0 14px;padding-bottom:2px;scrollbar-width:none}#tagBar::-webkit-scrollbar{display:none}" +
    "#tagBar .chip5{flex:none}#tagBar .chip5 b{font-weight:500;opacity:.6;margin-left:2px}" +
    ".tagPill{display:inline-block;font-size:12px;line-height:18px;padding:0 8px;border-radius:9px;background:var(--secondary-container);color:var(--on-secondary-container);margin-right:6px;vertical-align:1px}" +
    ".snip{font-size:13px;color:var(--on-surface-variant);margin-top:4px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}" +
    "mark.hl{background:rgba(255,204,0,.45);color:inherit;border-radius:3px;padding:0 1px}" +
    ".libMeta{display:flex;justify-content:space-between;align-items:center;margin:-6px 4px 10px;font-size:13px;color:var(--on-surface-variant)}" +
    ".qx{border:0;background:transparent;color:var(--on-surface-variant);font-size:18px;width:36px;height:36px;border-radius:18px;display:none}" +
    ".vSheetM{position:fixed;inset:0;z-index:9998;background:rgba(0,0,0,.4);display:flex;align-items:flex-end;justify-content:center;animation:vFade .2s}" +
    "@keyframes vFade{from{opacity:0}to{opacity:1}}@keyframes vUp{from{transform:translateY(40px);opacity:0}to{transform:none;opacity:1}}" +
    ".vSheet{background:var(--surface-container-high,#fff);color:var(--on-surface,#000);width:100%;max-width:560px;border-radius:24px 24px 0 0;padding:10px 20px calc(18px + env(safe-area-inset-bottom));animation:vUp .28s cubic-bezier(.22,1,.36,1);max-height:85vh;overflow:auto}" +
    ".vSheet .grab{width:36px;height:4px;border-radius:2px;background:var(--outline);opacity:.5;margin:0 auto 14px}" +
    ".vSheet h3{margin:0 0 6px;font-size:19px}.vSheet .row{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}" +
    ".vSheet .acts{display:flex;justify-content:flex-end;gap:8px;margin-top:14px}" +
    ".vSheet input[type=text]{width:100%;box-sizing:border-box}" +
    ".bkInfo{font-size:13px;color:var(--on-surface-variant);margin:2px 0 10px;line-height:1.6}" +
    "@media (min-width:841px){.vSheetM{align-items:center}.vSheet{border-radius:24px}}";
  document.head.appendChild(st);

  // ---- 通用底部面板 ----
  function sheet(build) {
    return new Promise(res => {
      const m = document.createElement("div"); m.className = "vSheetM";
      const p = document.createElement("div"); p.className = "vSheet"; p.innerHTML = '<div class="grab"></div>';
      m.appendChild(p);
      const done = v => { if (!m.isConnected) return; m.remove(); window.__sheetClose = null; res(v); };
      m.onclick = e => { if (e.target === m) done(null); };
      window.__sheetClose = () => done(null);
      build(p, done);
      document.body.appendChild(m);
    });
  }
  const _back = window.__back;
  if (typeof _back === "function") window.__back = function () { if (window.__sheetClose) { window.__sheetClose(); return true; } return _back.apply(this, arguments); };
  function ask(title, msg, ok, okDanger) {
    return sheet((p, done) => {
      p.insertAdjacentHTML("beforeend", '<h3></h3><div class="mute" style="white-space:pre-line;line-height:1.6"></div><div class="acts"><button class="sec" data-r="0">取消</button><button class="sec" data-r="1" style="font-weight:600"></button></div>');
      p.querySelector("h3").textContent = title; p.querySelector(".mute").textContent = msg;
      const okb = p.querySelector('[data-r="1"]'); okb.textContent = ok; if (okDanger) okb.style.color = "#FF3B30";
      p.querySelectorAll("[data-r]").forEach(b => b.onclick = () => done(b.dataset.r === "1"));
    });
  }
  window.__ask = ask; window.__pickTag = pickTag;

  // ---- 分类数据 ----
  const allTags = () => { const u = Array.from(new Set(loadHist().map(x => x.tag).filter(Boolean))); return PRESET.concat(u.filter(t => !PRESET.includes(t))); };
  function saveTag(time, tag) {
    const h = loadHist(); const x = h.find(y => y.time === time); if (!x) return false;
    if (tag) x.tag = tag; else delete x.tag;
    try { Store.set("vtn_hist", JSON.stringify(h)); } catch (e) { snack("保存失败：空间不足"); return false; }
    return true;
  }
  function pickTag(cur, title) {
    return sheet((p, done) => {
      p.insertAdjacentHTML("beforeend", '<h3></h3><div class="mute">选一个分类，或输入新的分类名</div><div class="row"></div><input type="text" maxlength="12" placeholder="新分类，例如 地理"><div class="acts"><button class="sec" data-a="clr">取消分类</button><button class="sec" data-a="ok" style="font-weight:600">确定</button></div>');
      p.querySelector("h3").textContent = title || "设置分类";
      const row = p.querySelector(".row"), inp = p.querySelector("input");
      allTags().forEach(t => {
        const b = document.createElement("button"); b.className = "chip5" + (t === cur ? " on" : ""); b.textContent = t;
        b.onclick = () => done(t); row.appendChild(b);
      });
      p.querySelector('[data-a="clr"]').onclick = () => done("");
      p.querySelector('[data-a="ok"]').onclick = () => { const v = inp.value.trim(); v ? done(v.slice(0, 12)) : done(cur || ""); };
      inp.onkeydown = e => { if (e.key === "Enter") p.querySelector('[data-a="ok"]').click(); };
    });
  }
  window.__autoTag = async function (it) {
    if (Store.get("vtn_autotag") === "0" || !window.__chat) return;
    try {
      const tags = allTags();
      const body = String(it.md || "").replace(/!\[[^\]]*\]\([^)]*\)/g, "").slice(0, 1500);
      const r = await window.__chat([{ role: "system", content: "你是笔记分类助手。根据视频标题和笔记开头判断它属于哪个分类。优先从已有分类里选一个；都不合适时给一个新的 2~4 字分类（按学科或主题，如 物理、化学、英语阅读、作文、数学导数、生活）。只输出分类名，不要任何解释或标点。" }, { role: "user", content: "已有分类：" + (tags.join("、") || "无") + "\n标题：" + (it.title || "") + "\n笔记开头：\n" + body }]);
      let t = String(r || "").trim().split(/\s|\n/)[0].replace(/["'“”「」【】\[\]。，,.:：]/g, "").slice(0, 8);
      if (!t) return;
      const hit = tags.find(x => x === t || t.includes(x) || x.includes(t)); if (hit) t = hit;
      const h = loadHist(), x = h.find(y => y.time === it.time); if (!x || x.tag) return;
      if (saveTag(it.time, t)) { it.tag = t; drawBar(); drawHist(); snack("已自动归入「" + t + "」，长按笔记可改"); }
    } catch (e) { __err(e, "L1886") }
  };
  window.__setTag = async function (it) {
    const t = await pickTag(it.tag || "", "《" + String(it.title || "").slice(0, 20) + "》的分类");
    if (t === null || t === (it.tag || "")) return;
    if (saveTag(it.time, t)) { drawBar(); drawHist(); snack(t ? "已归入「" + t + "」" : "已取消分类"); }
  };

  // ---- 笔记库：分类栏 + 搜索 ----
  const q = $("libQ"), lib = q && q.closest(".search");
  const bar = document.createElement("div"); bar.id = "tagBar";
  const meta = document.createElement("div"); meta.className = "libMeta";
  if (lib) {
    lib.after(bar); bar.after(meta);
    const x = document.createElement("button"); x.className = "qx"; x.textContent = "×"; x.title = "清空";
    lib.appendChild(x);
    x.onclick = () => { q.value = ""; x.style.display = "none"; drawHist(); q.focus(); };
    let tm = 0;
    q.oninput = () => { x.style.display = q.value ? "block" : "none"; clearTimeout(tm); tm = setTimeout(drawHist, 180); };
  }
  function drawBar() {
    const h = loadHist(), cnt = {}; h.forEach(x => { if (x.tag) cnt[x.tag] = (cnt[x.tag] || 0) + 1; });
    const used = Object.keys(cnt);
    if (window.__tagF && !cnt[window.__tagF]) window.__tagF = "";
    bar.innerHTML = "";
    const list = [["", h.length]].concat(PRESET.filter(t => cnt[t]).map(t => [t, cnt[t]]), used.filter(t => !PRESET.includes(t)).map(t => [t, cnt[t]]));
    const none = h.filter(x => !x.tag).length;
    if (used.length && none) list.push(["__none", none]);
    list.forEach(([t, n]) => {
      const b = document.createElement("button"); b.className = "chip5" + ((window.__tagF || "") === t ? " on" : "");
      b.innerHTML = esc(t === "" ? "全部" : t === "__none" ? "未分类" : t) + " <b>" + n + "</b>";
      b.onclick = () => { window.__tagF = t; drawBar(); drawHist(); };
      bar.appendChild(b);
    });
    bar.style.display = used.length ? "flex" : "none";
  }
  window.__drawTagBar = drawBar;
  // 列表画完后：加分类标签、正文摘录高亮、结果数
  const _dh = drawHist;
  drawHist = function () {
    const TF = window.__tagF || "";
    window.__tagF = TF === "__none" ? "" : TF;
    const kw = q ? q.value.trim() : "";
    const all = loadHist();
    if (TF === "__none") { const keep = Store.get("vtn_hist"); try { Store.set("vtn_hist", JSON.stringify(all.filter(x => !x.tag))); _dh(); } finally { Store.set("vtn_hist", keep); } }
    else _dh();
    window.__tagF = TF;
    const box = $("hist"); if (!box) return;
    const kl = kw.toLowerCase();
    const shown = all.filter(it => (!TF || (TF === "__none" ? !it.tag : it.tag === TF)) && (!kl || String(it.title || "").toLowerCase().includes(kl) || String(it.md || "").toLowerCase().includes(kl) || String(it.tag || "").toLowerCase().includes(kl)));
    const re = kw ? new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "ig") : null;
    box.querySelectorAll(".nc").forEach((d, i) => {
      const it = shown[i]; if (!it) return; d.dataset.t = String(it.time);
      const nt = d.querySelector(".nt"), mu = d.querySelector(".nb .mute");
      if (re) nt.innerHTML = esc(it.title).replace(new RegExp(esc(kw).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "ig"), m => '<mark class="hl">' + m + "</mark>");
      if (it.tag && mu) { mu.textContent = mu.textContent.replace(/^\[[^\]]*\]\s*/, ""); mu.insertAdjacentHTML("afterbegin", '<span class="tagPill">' + esc(it.tag) + "</span>"); }
      if (re && !String(it.title || "").toLowerCase().includes(kl)) {
        const md = String(it.md || "").replace(/!\[[^\]]*\]\([^)]*\)|[#*>`|_]/g, " ").replace(/\s+/g, " ");
        const k = md.toLowerCase().indexOf(kl);
        if (k >= 0) {
          const a = Math.max(0, k - 24), piece = (a ? "…" : "") + md.slice(a, k + kw.length + 60);
          const sn = document.createElement("div"); sn.className = "snip";
          sn.innerHTML = esc(piece).replace(new RegExp(esc(kw).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "ig"), m => '<mark class="hl">' + m + "</mark>");
          d.querySelector(".nb").appendChild(sn);
        }
      }
    });
    meta.innerHTML = kw || TF ? "<span>找到 " + shown.length + " 篇</span>" : "<span>共 " + all.length + " 篇笔记</span>";
    meta.style.display = all.length ? "flex" : "none";
  };
  drawBar(); drawHist();

  // ---- 生成页：选分类，生成的笔记自动归类 ----
  const go = $("goBtn");
  if (go) {
    const lb = document.createElement("label"); lb.textContent = "分类（可选）";
    const row = document.createElement("div"); row.id = "genTagRow"; row.style.cssText = "display:flex;gap:8px;flex-wrap:wrap;margin:0 0 6px";
    function drawGen() {
      const cur = Store.get("vtn_gentag") || "";
      row.innerHTML = "";
      [""].concat(allTags()).forEach(t => {
        const b = document.createElement("button"); b.className = "chip5" + (cur === t ? " on" : ""); b.textContent = t || "不分类";
        b.onclick = () => { Store.set("vtn_gentag", t); drawGen(); };
        row.appendChild(b);
      });
    }
    drawGen();
    const anchor = $("reqBox") || go;
    anchor.before(lb, row);
    window.__genTag = () => Store.get("vtn_gentag") || "";
  }

  // ---- 生成完成：前台用提示条，后台发系统通知 ----
  window.__doneNotify = function (item) {
    const t = item.kind === "sub" ? "字幕已提取" : "笔记已写好";
    if (document.hidden) { try { if (HAS_NATIVE && Native.notifyDone2) Native.notifyDone2(t, "《" + (item.title || "笔记") + "》" + (item.tag ? " · " + item.tag : "") + "，点按查看"); else if (HAS_NATIVE && Native.notifyDone) Native.notifyDone(item.title || ""); } catch (e) { __err(e, "L1981") } }
    else snack(t + "：" + (item.title || ""));
    drawBar();
  };

  // ---- 备份与恢复 ----
  const about = $("verTxt") && $("verTxt").closest(".grp");
  if (!about) return;
  const gt = document.createElement("div"); gt.className = "gt"; gt.textContent = "备份与恢复";
  const g = document.createElement("div"); g.className = "grp";
  g.innerHTML = '<div class="li" style="display:flex;gap:10px;flex-wrap:wrap;padding:10px 0">' +
    '<button class="sec" id="bkOut">导出备份</button><button class="sec" id="bkIn">从备份恢复</button>' +
    '<input type="file" id="bkFile" accept=".json,application/json" style="display:none"></div>' +
    '<div class="bkInfo" id="bkInfo"></div>';
  about.before(gt, g);
  function info() {
    const h = loadHist(), ts = parseInt(Store.get("vtn_bk_ts") || "0");
    const imgs = h.reduce((n, x) => n + ((x.imgs && x.imgs.length) || 0), 0);
    $("bkInfo").textContent = "笔记 " + h.length + " 篇，截图 " + imgs + " 张。" + (ts ? "上次备份：" + new Date(ts).toLocaleString() : "还没有备份过") + "。备份文件存到 下载/VideoToNote，不含 API Key。";
  }
  info();
  $("bkOut").onclick = async () => {
    const h = loadHist(); if (!h.length) { snack("还没有笔记可以备份"); return; }
    const imgN = h.reduce((n, x) => n + ((x.imgs && x.imgs.length) || 0), 0);
    const mode = await sheet((p, done) => {
      p.insertAdjacentHTML("beforeend", '<h3>导出备份</h3><div class="mute" style="line-height:1.6">共 ' + h.length + ' 篇笔记、' + imgN + ' 张截图</div>' +
        '<div class="acts" style="flex-direction:column;align-items:stretch"><button class="big" data-m="full">完整备份（含截图和历史版本）</button><button class="sec" data-m="lite">仅正文（文件小）</button><button class="sec" data-m="">取消</button></div>');
      p.querySelectorAll("[data-m]").forEach(b => b.onclick = () => done(b.dataset.m || null));
    });
    if (!mode) return;
    snack("正在打包备份…");
    await new Promise(r => setTimeout(r, 60));
    const SKIP = ["vtn_set", "vtn_bg", "vtn_lastclip", "vtn_upd_ts"];
    const data = { app: "vtn", fmt: 2, ver: APP_VER, time: Date.now(), ls: {}, mat: {}, img: {} };
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith("vtn_") && !SKIP.includes(k)) data.ls[k] = Store.get(k); }
    if (mode === "full" && HAS_NATIVE) {
      h.forEach(it => {
        if (it.mat) { try { const t = Native.readText(it.mat); if (t) data.mat[it.mat] = t; } catch (e) { __err(e, "L2018") } }
        (it.imgs || []).forEach(n => { try { const b = Native.readB64(n); if (b) data.img[n] = b; } catch (e) { __err(e, "L2019") } });
      });
    }
    const d = new Date(), p2 = n => String(n).padStart(2, "0");
    const nm = "FrameNote备份_" + d.getFullYear() + p2(d.getMonth() + 1) + p2(d.getDate()) + "_" + p2(d.getHours()) + p2(d.getMinutes()) + (mode === "full" ? "_完整" : "_正文") + ".json";
    try {
      const txt = JSON.stringify(data);
      const r = HAS_NATIVE && Native.saveFile ? Native.saveFile(nm, txt) : "";
      if (r && String(r).startsWith("err")) throw new Error(r);
      Store.set("vtn_bk_ts", String(Date.now())); info();
      snack("已导出 " + (txt.length / 1048576).toFixed(1) + " MB：下载/VideoToNote/" + nm);
    } catch (e) { snack("导出失败：" + e.message); }
  };
  $("bkIn").onclick = () => $("bkFile").click();
  $("bkFile").onchange = e => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    e.target.value = "";
    const rd = new FileReader();
    rd.onload = async () => {
      let d; try { d = JSON.parse(rd.result); } catch (x) { snack("不是有效的备份文件"); return; }
      if (!d || d.app !== "vtn" || !d.ls) { snack("不是 FrameNote 的备份文件"); return; }
      let cur = loadHist(), inc = []; try { inc = JSON.parse(d.ls.vtn_hist || "[]"); } catch (x) { __err(x, "L2040") }
      const seen = new Set(cur.map(x => x.time)), add = inc.filter(x => !seen.has(x.time));
      const imgN = Object.keys(d.img || {}).length;
      const ok = await (window.__ask || ask)("从备份恢复", "备份时间：" + new Date(d.time || 0).toLocaleString() + "\n备份里有 " + inc.length + " 篇笔记，其中 " + add.length + " 篇是新的" + (imgN ? "，含 " + imgN + " 张截图" : "（不含截图）") + "。\n\n只会添加新笔记，不会删除或覆盖现有笔记。", "恢复 " + add.length + " 篇");
      if (!ok) return;
      let imgOk = 0;
      if (HAS_NATIVE) {
        Object.keys(d.mat || {}).forEach(k => { try { Native.writeText(k, d.mat[k]); } catch (x) { __err(x, "L2047") } });
        if (Native.imgWriteB64) Object.keys(d.img || {}).forEach(k => { try { if (!Native.imgExists(k) && Native.imgWriteB64(k, d.img[k]) === "ok") imgOk++; } catch (x) { __err(x, "L2048") } });
      }
      cur = cur.concat(add).sort((a, b) => b.time - a.time);
      try { Store.set("vtn_hist", JSON.stringify(cur)); } catch (x) { snack("手机存储空间不足，恢复失败"); return; }
      drawBar(); drawHist(); info();
      snack("已恢复 " + add.length + " 篇笔记" + (imgOk ? "、" + imgOk + " 张截图" : ""));
    };
    rd.readAsText(f);
  };
})();
