// ===== v1.5.6：查询余额 =====
$("balBtn").onclick = async () => {
  const out = []; $("balTxt").textContent = "查询中…";
  const base = String(S.base || "").replace(/\/+$/, "");
  if (!S.key) out.push("大模型：没填 API Key");
  else if (/deepseek\.com/.test(base)) {
    try {
      const r = await http("GET", base + "/user/balance", { "Authorization": "Bearer " + S.key }, "");
      const j = JSON.parse(r.body);
      const b = (j.balance_infos || []).map(x => x.total_balance + " " + (x.currency === "CNY" ? "元" : x.currency)).join("，");
      out.push("DeepSeek 余额：" + (b || "查不到") + (j.is_available === false ? "（余额不足，不能调用）" : ""));
    } catch (e) { out.push("DeepSeek 查询失败：" + e.message); }
  } else if (/siliconflow\.cn/.test(base)) out.push("大模型用的是硅基流动，见下一行");
  else out.push("大模型：这个接口地址不支持查询余额");
  const sk = V3.sf || (/siliconflow\.cn/.test(base) ? S.key : "");
  if (sk) {
    try {
      const r = await http("GET", "https://api.siliconflow.cn/v1/user/info", { "Authorization": "Bearer " + sk }, "");
      let j = null; try { j = JSON.parse(r.body); } catch (e) { __err(e, "L1622") }
      const d = (j && (j.data || j)) || {};
      const b = d.totalBalance != null ? d.totalBalance : (d.balance != null ? d.balance : null);
      if (b != null) out.push("硅基流动余额：" + b + " 元" + (d.chargeBalance != null ? "（其中充值 " + d.chargeBalance + " 元）" : ""));
      else if (r.status === 410) out.push("硅基流动已停用余额查询接口（官方暂未提供新接口），请到硅基流动官网“费用中心”查看");
      else out.push("硅基流动查不到余额（状态码 " + r.status + "）：" + String(r.body || r.error || "").slice(0, 150));
    } catch (e) { out.push("硅基流动查询失败：" + e.message); }
  }
  $("balTxt").textContent = out.join("\n"); $("balTxt").style.whiteSpace = "pre-line";
};
// ---- 笔记详情页 ----
function openDet() { const d = $("pg-det"); if (!d.classList.contains("show")) { d.classList.add("show"); d.scrollTop = 0; } }
function closeDet() { closeSheet(); $("pg-det").classList.remove("show"); }
$("detBack").onclick = () => window.__back();
(function () {
  const v = document.createElement("div"); v.id = "verChips"; v.className = "vchips";
  const bar = $("v4bar"); bar.parentNode.insertBefore(v, bar);
  // 修改意见卡片放在版本芯片下面
  v.after($("v4note"));
})();
function renderVer() {
  const box = $("verChips");
  if (typeof MAT === "undefined" || !MAT || !MAT.vers || !MAT.vers.length) { box.style.display = "none"; box.innerHTML = ""; return; }
  box.style.display = "flex"; box.innerHTML = "";
  MAT.vers.forEach((x, i) => {
    const b = document.createElement("button"); b.className = "chip5" + (i === (MAT.cur || 0) ? " on" : ""); b.textContent = "第" + (i + 1) + "版";
    b.onclick = () => { $("v4ver").value = String(i); $("v4ver").onchange(); renderVer(); };
    box.appendChild(b);
  });
}
const _show5 = show;
show = function (item) {
  const prev = document.querySelector(".page.on");
  _show5(item);
  if (prev && prev.id !== "pg-gen") tab(prev.id.slice(3));
  $("detTitle").textContent = item.title;
  renderVer();
  $("fab").style.display = item.kind === "sub" ? "none" : "flex";
  $("source").style.display = "none"; $("preview").style.display = "block";
  openDet();
};
$("detMore").onclick = () => {
  const src = $("source").style.display !== "none";
  const hasMat = typeof MAT !== "undefined" && !!MAT;
  openMenu($("detMore"), [
    hasMat && ["AI 输入", "psychology", () => $("v4in").click()],
    ["导出 Markdown", "download", () => $("v5md").click()],
    ["系统打印", "print", () => $("v5prt").click()],
    ["分享", "share", () => $("bShare").click()],
    ["复制全文", "content_copy", () => $("bCopy").click()],
    ["保存字幕 .srt", "subtitles", () => $("bSrt").click()],
    [src ? "返回预览" : "查看源码", src ? "visibility" : "code", () => $(src ? "tPrev" : "tSrc").click()]
  ].filter(Boolean));
};
// ---- 底部面板：修改笔记 ----
(function () { const b = $("sheetBody"); ["v4txt", "v4go", "v4msg"].forEach(id => { const el = $(id); if (el) b.appendChild(el); }); $("v4go").classList.add("big"); $("v4go").textContent = "让 AI 重写"; })();
function openSheet() { $("sheet").classList.add("open"); scrimOn(); setTimeout(() => $("v4txt").focus(), 300); }
function closeSheet() { $("sheet").classList.remove("open"); if (!$("dlg").classList.contains("show")) scrimOff(); }
$("fab").onclick = () => {
  if (typeof MAT === "undefined" || !MAT) { snack("这篇是旧版本生成的，没有保存材料，不能修改"); return; }
  $("v4msg").textContent = ""; openSheet();
};
const _go5 = $("v4go").onclick;
$("v4go").onclick = async () => {
  $("sheetLin").style.display = "block";
  try { await _go5(); } finally { $("sheetLin").style.display = "none"; }
  const m = $("v4msg").textContent;
  if (/已生成/.test(m)) { closeSheet(); snack(m); renderVer(); $("pg-det").scrollTop = 0; }
};
// ---- AI 输入页 ----
const _ai5 = $("v4in").onclick;
$("v4in").onclick = () => { _ai5(); if ($("v4page").style.display === "block") enhanceAi(); };
function enhanceAi() {
  const pg = $("v4page"), top = pg.querySelector(".v4top");
  const bar = document.createElement("div"); bar.className = "appbar";
  bar.innerHTML = '<button class="icon" id="aiBack"><i class="ic" data-fb="返回">arrow_back</i></button><div class="abt">AI 输入</div>';
  const kids = Array.from(pg.children).filter(x => x !== top);
  const box = document.createElement("div"); box.className = "wrap";
  let cur = null, grid = null, item = null;
  kids.forEach(el => {
    if (el.tagName === "H3") {
      cur = document.createElement("details"); cur.className = "card aisec"; cur.open = !/文字稿|请求/.test(el.textContent);
      const sm = document.createElement("summary"); sm.textContent = el.textContent; cur.appendChild(sm); box.appendChild(cur); grid = null; item = null; return;
    }
    if (el.tagName === "DETAILS") { el.classList.add("card", "aisec"); box.appendChild(el); cur = null; return; }
    if (!cur) { box.appendChild(el); return; }
    if (el.tagName === "P" && /^图\d+/.test(el.textContent.trim())) {
      if (!grid) { grid = document.createElement("div"); grid.className = "fgrid"; cur.appendChild(grid); }
      const ps = el.textContent.split("·").map(x => x.trim());
      item = document.createElement("div"); item.className = "fitem";
      item.innerHTML = '<div class="fhd"><b></b><span class="chip5 on noc sm"></span><span class="mute"></span></div>';
      item.querySelector("b").textContent = ps[0] || ""; item.querySelector(".chip5").textContent = ps[1] || ""; item.querySelector(".mute").textContent = ps[2] || "";
      grid.appendChild(item); return;
    }
    if (item && (el.tagName === "IMG" || el.tagName === "PRE")) { item.appendChild(el); if (el.tagName === "PRE") item = null; return; }
    cur.appendChild(el);
  });
  pg.innerHTML = ""; pg.appendChild(bar); pg.appendChild(box);
  $("aiBack").onclick = () => window.__back();
  pg.querySelectorAll("pre").forEach(p => {
    const w = document.createElement("div"); w.className = "prew"; p.parentNode.insertBefore(w, p);
    const b = document.createElement("button"); b.className = "icon cp"; b.innerHTML = '<i class="ic" data-fb="复制">content_copy</i>';
    b.onclick = e => { e.preventDefault(); e.stopPropagation(); if (HAS_NATIVE) Native.copy(p.textContent); snack("已复制"); };
    w.appendChild(b); w.appendChild(p);
  });
  iconFallback(pg); pg.scrollTop = 0;
}
// ---- 全屏看图（双指缩放）----
(function () {
  const v = $("viewer"), im = v.querySelector("img"); let sc = 1, tx = 0, ty = 0, st = null;
  const ap = () => { im.style.transform = "translate(" + tx + "px," + ty + "px) scale(" + sc + ")"; };
  window.openViewer = src => { im.src = src; sc = 1; tx = 0; ty = 0; ap(); v.classList.add("show"); };
  window.closeViewer = () => v.classList.remove("show");
  const dist = t => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
  v.addEventListener("touchstart", e => {
    if (e.touches.length === 2) st = { d: dist(e.touches), sc };
    else if (e.touches.length === 1) st = { x: e.touches[0].clientX - tx, y: e.touches[0].clientY - ty };
  }, { passive: true });
  v.addEventListener("touchmove", e => {
    if (!st) return; e.preventDefault();
    if (e.touches.length === 2 && st.d) sc = Math.min(6, Math.max(1, st.sc * dist(e.touches) / st.d));
    else if (e.touches.length === 1 && st.x != null && sc > 1) { tx = e.touches[0].clientX - st.x; ty = e.touches[0].clientY - st.y; }
    ap();
  }, { passive: false });
  v.addEventListener("touchend", e => { if (!e.touches.length) { if (sc <= 1) { tx = ty = 0; ap(); } st = null; } });
  v.querySelector(".vclose").onclick = () => window.closeViewer();
  document.addEventListener("click", e => {
    const i = e.target.closest("#preview img, .fitem img"); if (!i) return;
    e.preventDefault(); e.stopPropagation(); window.openViewer(i.src);
  }, true);
})();
// ---- 笔记库 ----
drawHist = function () {
  const box = $("hist"); if (!box) return;
  const q = ($("libQ") ? $("libQ").value.trim().toLowerCase() : "");
  const h = loadHist(), dir = HAS_NATIVE ? Native.filesDir() : "";
  box.innerHTML = ""; box.className = "";
  if (!h.length) { box.innerHTML = '<div class="empty5"><i class="ic" data-fb="">menu_book</i><div>还没有笔记</div><div class="mute">在“生成”页粘贴 B 站链接，生成的笔记会保存在这里</div></div>'; iconFallback(box); return; }
  const TF = window.__tagF || ""; const list = h.filter(it => (!TF || (it.tag || "") === TF) && (!q || String(it.title || "").toLowerCase().includes(q) || String(it.md || "").toLowerCase().includes(q) || String(it.tag || "").toLowerCase().includes(q)));
  if (!list.length) { box.innerHTML = '<div class="empty5"><i class="ic" data-fb="">search_off</i><div>没有找到相关笔记</div></div>'; iconFallback(box); return; }
  list.forEach(it => {
    let vers = 1;
    if (it.mat && HAS_NATIVE) { try { const m = JSON.parse(Native.readText(it.mat) || "null"); if (m && m.vers) vers = m.vers.length; } catch (e) { __err(e, "L1764") } }
    const d = document.createElement("div"); d.className = "nc";
    const th = (it.imgs && it.imgs[0]) ? '<img class="th" loading="lazy" src="file://' + dir + '/img/' + it.imgs[0] + '">' : '<div class="th"><i class="ic" data-fb="">' + (it.kind === "sub" ? "subtitles" : "description") + '</i></div>';
    d.innerHTML = th + '<div class="nb"><div class="nt"></div><div class="mute"></div></div><button class="icon nm"><i class="ic" data-fb="⋮">more_vert</i></button>';
    d.querySelector(".nt").textContent = it.title;
    d.querySelector(".mute").textContent = (it.tag ? "[" + it.tag + "] " : "") + new Date(it.time).toLocaleString() + (it.kind === "sub" ? " · 字幕" : " · " + vers + " 个版本");
    d.onclick = () => show(it);
    const menu = e => {
      e.preventDefault(); e.stopPropagation();
      openMenu(d.querySelector(".nm"), [
        ["打开", "open_in_new", () => show(it)],
        ["导出图文 MD", "image", () => { show(it); setTimeout(() => $("v5md").click(), 150); }],
        ["导出 PDF", "picture_as_pdf", () => window.__pdf && window.__pdf(it)],
        ["设置分类", "label", () => window.__setTag && window.__setTag(it)],
        ["删除", "delete", () => {
          if (window.__delNote) { window.__delNote(it); return; }
          Store.set("vtn_hist", JSON.stringify(loadHist().filter(x => x.time !== it.time)));
          drawHist(); snack("已删除");
        }]
      ]);
    };
    d.querySelector(".nm").onclick = menu; d.oncontextmenu = menu;
    box.appendChild(d);
  });
  iconFallback(box);
};
$("libQ").oninput = () => drawHist();
drawHist();
// ---- 返回键：面板/对话框 → AI 输入页 → 详情页 → 生成页 → 退出 ----
window.__back = function () {
  if ($("viewer").classList.contains("show")) { window.closeViewer(); return true; }
  if ($("dlg").classList.contains("show")) { closeDlg(); return true; }
  if ($("pop").classList.contains("show")) { closePop(); return true; }
  if ($("sheet").classList.contains("open")) { closeSheet(); return true; }
  if ($("v4page").style.display === "block") { $("v4page").style.display = "none"; return true; }
  if ($("pg-det").classList.contains("show")) { closeDet(); return true; }
  const cur = document.querySelector(".page.on");
  if (cur && cur.id !== "pg-gen") { tab("gen"); return true; }
  return false;
};
