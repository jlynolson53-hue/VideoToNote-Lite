// ===== v1.6.3：暂停 + 生成过程可视化 =====
const PV = { paused: false, waiters: [], done: 0, run: 0, stage: 0, t0: 0, timer: null, aiDone: 0, aiTotal: 0 };
const PV_ST = ["解析", "字幕", "截图", "识图", "写笔记", "汇总", "完成"];
function pvGate() { return PV.paused ? new Promise(r => PV.waiters.push(r)) : Promise.resolve(); }
function pvDraw() {
  const f = $("pvFlow"); if (!f) return;
  f.innerHTML = PV_ST.map((s, i) => '<div class="pvS ' + (i < PV.stage ? "done" : i === PV.stage ? "cur" : "") + '"><i>' + (i < PV.stage ? "✓" : i + 1) + "</i>" + ((i === 1 && window.__LV && __LV.cur && !__LV.sub && !(__LV.cur.subs && __LV.cur.subs.length)) ? "转写" : s) + "</div>").join("");
  $("pvReq").textContent = PV.done; $("pvRun").textContent = PV.run;
  let pct = Math.round(PV.stage / (PV_ST.length - 1) * 100);
  if (PV.stage >= 3 && PV.stage <= 5 && PV.aiTotal) pct = Math.min(95, Math.round((PV.stage + Math.min(1, PV.aiDone / PV.aiTotal)) / (PV_ST.length - 1) * 100));
  if (PV.stage === 1 && PV.sub) pct = Math.round((1 + Math.min(1, PV.sub)) / (PV_ST.length - 1) * 100);
  $("pvPct").textContent = pct + "%";
  try { const bar = $("pvBar") || (() => { const b = document.createElement("div"); b.id = "pvBar"; b.innerHTML = "<i></i>"; $("pvNow").before(b); return b; })(); bar.style.display = (PV.stage === 1 && PV.sub) ? "" : "none"; bar.firstChild.style.width = Math.round(Math.min(1, PV.sub || 0) * 100) + "%"; } catch (e) { __err(e, "L1395") }
  $("progCard").classList.toggle("paused", PV.paused);
}
function pvSet(s) { if (s > PV.stage) { PV.stage = s; pvDraw(); } }
function pvReset() {
  PV.sub = 0; PV.asrT0 = 0;
  Object.assign(PV, { paused: false, done: 0, run: 0, stage: 0, aiDone: 0, aiTotal: 0, t0: Date.now() });
  PV.waiters.splice(0).forEach(r => r());
  const b = $("pvPause"); b.textContent = "暂停"; b.classList.remove("paused"); $("pvTitle").textContent = "正在生成";
  clearInterval(PV.timer);
  PV.timer = setInterval(() => {
    const s = Math.floor((Date.now() - PV.t0) / 1000); $("pvTime").textContent = String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
    if (!window.__busy && PV.stage > 0 && !PV.paused) clearInterval(PV.timer);
  }, 1000);
  pvDraw();
}
$("pvPause").onclick = () => {
  PV.paused = !PV.paused; const b = $("pvPause");
  if (PV.paused) { b.textContent = "继续"; b.classList.add("paused"); $("pvTitle").textContent = "已暂停"; snack(PV.run ? "正在进行的请求完成后停下" : "已暂停"); log("已暂停（进行中的请求会先完成）"); }
  else { b.textContent = "暂停"; b.classList.remove("paused"); $("pvTitle").textContent = "正在生成"; log("继续生成"); PV.waiters.splice(0).forEach(r => r()); }
  pvDraw();
};
const _httpPV = http;
http = async function (method, url, headers, body) {
  await pvGate();
  const ai = /chat\/completions/.test(url);
  PV.run++; if (ai) PV.aiTotal++; pvDraw();
  try { return await _httpPV(method, url, headers, body); }
  finally { PV.run--; PV.done++; if (ai) PV.aiDone++; pvDraw(); }
};
const _logPV = log;
log = function (msg, cls) {
  _logPV(msg, cls);
  const m = String(msg || "");
  if (!/已暂停|继续生成/.test(m) && $("pvNow")) $("pvNow").textContent = m;
  if (cls === "e" || /出错|失败/.test(m)) return;
  if (/^(本地视频|读取内嵌字幕|内嵌字幕|使用外挂字幕|开始本机离线转写|正在加载转写模型|本机转写|转写完成)/.test(m)) {
    pvSet(1);
    const q = m.match(/^本机转写 ([\d:]+) \/ ([\d:]+)（(\d+)%）/);
    if (q) {
      const p = +q[3] / 100; PV.sub = p;
      if (!PV.asrT0) PV.asrT0 = Date.now();
      const el = (Date.now() - PV.asrT0) / 1000;
      let eta = "";
      if (p > 0.03 && el > 5) { const r = Math.round(el / p * (1 - p)); eta = "，预计还要 " + (r >= 60 ? Math.floor(r / 60) + " 分 " : "") + (r % 60) + " 秒"; }
      if ($("pvNow")) $("pvNow").textContent = "本机转写 " + q[1] + " / " + q[2] + "（" + q[3] + "%）" + eta;
      pvDraw();
    }
    if (/^转写完成/.test(m)) { PV.sub = 1; pvDraw(); }
    return;
  }
  if (/汇总|合并/.test(m)) pvSet(5);
  else if (/分段|写笔记|生成笔记|第\s*\d+\s*段|正在写/.test(m)) pvSet(4);
  else if (/识图|识别/.test(m)) pvSet(3);
  else if (/截图/.test(m)) pvSet(2);
  else if (/字幕|语音|文字稿/.test(m)) pvSet(1);
  if (/完成|已保存/.test(m) && PV.stage >= 4) pvSet(6);
};
new MutationObserver(() => { const c = $("progCard"); if (c.style.display !== "none" && !c.dataset.pv) { c.dataset.pv = "1"; pvReset(); } else if (c.style.display === "none") delete c.dataset.pv; })
  .observe($("progCard"), { attributes: true, attributeFilter: ["style"] });
pvDraw();
// ---- 设置页：把截图卡片搬进分组、Key 显示/隐藏 ----
(function () {
  const c = $("shotOn"); if (!c) return;
  const old = c.closest(".card"), g = $("grpShot");
  const sw = document.createElement("label"); sw.className = "sw";
  sw.innerHTML = '<span>截图笔记<small>读取 PPT 题目和板书，并把截图插进笔记</small></span>';
  c.removeAttribute("style"); sw.appendChild(c); sw.appendChild(document.createElement("i"));
  g.appendChild(sw);
  c.addEventListener("change", () => window.__syncChips && window.__syncChips());
  Array.from(old.children).forEach(el => { if (el.tagName === "H2" || (el.tagName === "LABEL" && !el.textContent.trim() && !el.children.length)) return; if (el.tagName === "LABEL" && el.querySelector && el.querySelector("input[type=checkbox]") === null && /截图笔记/.test(el.textContent)) return; g.appendChild(el); });
  old.remove();
  const k = $("sfKey"); if (k) {
    const w = document.createElement("div"); w.className = "pw"; k.parentNode.insertBefore(w, k); w.appendChild(k);
    const b = document.createElement("button"); b.className = "icon eye"; b.dataset.for = "sfKey"; b.innerHTML = '<i class="ic" data-fb="显示">visibility</i>'; w.appendChild(b);
  }
  document.querySelectorAll(".eye").forEach(b => b.onclick = e => {
    e.preventDefault(); const i = $(b.dataset.for); const show = i.type === "password";
    i.type = show ? "text" : "password"; const ic = b.querySelector(".ic"); if (ICON_OK) ic.textContent = show ? "visibility_off" : "visibility"; else ic.textContent = show ? "隐藏" : "显示";
  });
  window.__syncChips && window.__syncChips();
})();
// ---- 生成进度视图 ----
const STEPS = [["subtitles", "取字幕 / 语音转写"], ["photo_camera", "截图"], ["image_search", "识图"], ["edit_note", "写笔记"]];
let stepIdx = -1;
function drawSteps() {
  $("steps").innerHTML = STEPS.map((x, i) => '<li class="' + (i < stepIdx ? "done" : i === stepIdx ? "cur" : "") + '"><i class="ic" data-fb="' + (i + 1) + '">' + (i < stepIdx ? "check" : x[0]) + '</i>' + x[1] + '</li>').join("");
  iconFallback($("steps"));
}
function setStep(i) { if (i <= stepIdx) return; stepIdx = i; drawSteps(); }
const _log5 = log;
log = function (msg, cls) {
  _log5(msg, cls);
  const m = String(msg);
  if (/准备截图|截图去重/.test(m)) setStep(1);
  else if (/识图/.test(m)) setStep(2);
  else if (/大模型|写笔记|分段处理|全片概要/.test(m)) setStep(3);
  else if (/视频信息|字幕|转写|语音|音频/.test(m)) setStep(0);
  if (cls === "e") $("logBox").open = true;
};
const _run5 = run;
run = async function (sub) {
  stepIdx = -1; drawSteps();
  $("progErr").textContent = "";
  $("progCard").style.display = "block"; $("genCard").style.display = "none"; $("logBox").open = false;
  try { await _run5(sub); }
  finally {
    $("genCard").style.display = "block";
    const L = $("log"), last = L.lastChild ? L.lastChild.textContent : "";
    if (/^完成/.test(last)) { $("progCard").style.display = "none"; }
    else {
      const errs = L.querySelectorAll(".e");
      $("progErr").textContent = errs.length ? errs[errs.length - 1].textContent : "没有完成，请查看运行日志";
      $("logBox").open = true;
    }
  }
};
$("goBtn").onclick = () => run(false);
$("subOnly").onclick = () => run(true);
// ---- 后台保活：生成期间开前台服务，切到后台也继续 ----
const _runBg = run;
run = async function (s) {
  window.__busy = true;
  try { if (HAS_NATIVE && Native.bgStart) Native.bgStart(s ? "正在提取字幕" : "正在生成笔记"); if (HAS_NATIVE && Native.notifOk && !Native.notifOk()) { snack("通知权限被关闭，切到后台可能中断，请开启“FrameNote”的通知"); setTimeout(() => { try { Native.openNotifSet(); } catch (e) { __err(e, "L1518") } }, 1500); } } catch (e) { __err(e, "L1518") }
  try { return await _runBg(s); }
  finally { window.__busy = false; try { if (HAS_NATIVE && Native.bgStop) Native.bgStop(); } catch (e) { __err(e, "L1520") } showResume(); }
};
$("goBtn").onclick = () => run(false);
$("subOnly").onclick = () => run(true);
setTimeout(showResume, 300);
