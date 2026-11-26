// ===== v1.5.4：Material 3 界面层 =====
(function () { const p = $("v5pdf"); if (p) p.remove(); })();
// ---- 图标字体加载失败时用文字代替 ----
let ICON_OK = true;
function iconFallback(root) {
  if (ICON_OK) return;
  (root || document).querySelectorAll("i.ic").forEach(i => { if (!i.dataset.done) { i.dataset.done = "1"; i.classList.add("fb"); i.textContent = i.dataset.fb || ""; } });
}
if (document.fonts && document.fonts.load) {
  document.fonts.load('24px "Material Symbols Rounded"', "home").then(f => { if (!f || !f.length) { ICON_OK = false; iconFallback(); } }).catch(() => { ICON_OK = false; iconFallback(); });
}
// ---- 主题色 ----
const SEEDS = {
  blue:   { n: "蓝", l: ["#111111", "#ffffff", "#d3e3fd", "#041e49", "#c2e7ff", "#001d35"], d: ["#f2f2f2", "#062e6f", "#0842a0", "#d3e3fd", "#004a77", "#c2e7ff"] },
  green:  { n: "绿", l: ["#146c2e", "#ffffff", "#c4eed0", "#072711", "#d6e8d5", "#0f1f10"], d: ["#6dd58c", "#0a3818", "#0f5223", "#c4eed0", "#3a4b3a", "#d6e8d5"] },
  purple: { n: "紫", l: ["#6750a4", "#ffffff", "#eaddff", "#21005d", "#e8def8", "#1d192b"], d: ["#d0bcff", "#381e72", "#4f378b", "#eaddff", "#4a4458", "#e8def8"] },
  orange: { n: "橙", l: ["#8b5000", "#ffffff", "#ffdcbe", "#2c1600", "#f6dfcd", "#2a1709"], d: ["#ffb871", "#4a2800", "#6a3c00", "#ffdcbe", "#52443a", "#f6dfcd"] }
};
const BARBG = { l: "#f6f8fc", d: "#131314" };
function applyPalette() {
  const dark = document.documentElement.dataset.theme === "dark";
  const sd = SEEDS[Store.get("vtn_seed") || "blue"] || SEEDS.blue;
  const c = dark ? sd.d : sd.l, st = document.documentElement.style;
  [["--primary", c[0]], ["--on-primary", c[1]], ["--primary-container", c[2]], ["--on-primary-container", c[3]], ["--secondary-container", c[4]], ["--on-secondary-container", c[5]]]
    .forEach(([k, v]) => st.setProperty(k, v));
  if (HAS_NATIVE && Native.setBars) { try { Native.setBars(dark ? BARBG.d : BARBG.l, !dark); } catch (e) { __err(e, "L1198") } }
  document.querySelectorAll("#seedChips .seed").forEach(b => b.classList.toggle("on", b.dataset.s === (Store.get("vtn_seed") || "blue")));
}
const _at5 = applyTheme;
applyTheme = function () { _at5(); applyPalette(); };
if (darkMQ && darkMQ.addEventListener) darkMQ.addEventListener("change", applyPalette);
(function () {
  const box = $("seedChips");
  Object.keys(SEEDS).forEach(k => {
    const b = document.createElement("button"); b.className = "seed"; b.dataset.s = k; b.title = SEEDS[k].n;
    b.style.background = SEEDS[k].l[0];
    b.onclick = () => { Store.set("vtn_seed", k); applyPalette(); };
    box.appendChild(b);
  });
})();
applyTheme();
// ---- 提示条和错误对话框 ----
function snack(t) {
  const s = $("snack"); s.textContent = String(t); s.classList.add("show");
  clearTimeout(snack.t); snack.t = setTimeout(() => s.classList.remove("show"), 3500);
}
function scrimOn(clear) { $("scrim").classList.add("show"); $("scrim").classList.toggle("clear", !!clear); }
function scrimOff() { $("scrim").classList.remove("show", "clear"); }
function dialog(t) { $("dlgTxt").textContent = String(t); $("dlg").classList.add("show"); scrimOn(); }
function closeDlg() { $("dlg").classList.remove("show"); if (!$("sheet").classList.contains("open")) scrimOff(); }
$("dlgOk").onclick = closeDlg;
window.alert = function (m) {
  m = String(m == null ? "" : m);
  if (/失败|出错|错误|不对|无法|拿不到|没有拿到|请先/.test(m)) dialog(m); else snack(m);
};
// ---- 弹出菜单 ----
function closePop() { $("pop").classList.remove("show"); if (!$("sheet").classList.contains("open") && !$("dlg").classList.contains("show")) scrimOff(); }
function openMenu(anchor, items) {
  const p = $("pop"); p.innerHTML = "";
  items.forEach(([t, ic, fn]) => {
    const b = document.createElement("button");
    b.innerHTML = '<i class="ic" data-fb="">' + ic + '</i><span></span>'; b.querySelector("span").textContent = t;
    b.onclick = e => { e.stopPropagation(); closePop(); fn(); };
    p.appendChild(b);
  });
  iconFallback(p);
  p.classList.add("show"); scrimOn(true);
  const r = anchor.getBoundingClientRect(), w = p.offsetWidth, h = p.offsetHeight;
  let x = Math.min(r.right - w, innerWidth - w - 8), y = r.bottom + 4;
  if (y + h > innerHeight - 8) y = Math.max(8, r.top - h - 4);
  p.style.left = Math.max(8, x) + "px"; p.style.top = y + "px";
}
$("scrim").onclick = () => { if ($("pop").classList.contains("show")) closePop(); else if ($("dlg").classList.contains("show")) closeDlg(); else if ($("sheet").classList.contains("open")) closeSheet(); };
// ---- 涟漪效果 ----
document.addEventListener("pointerdown", e => {
  const t = e.target.closest("button, .nc"); if (!t || t.disabled) return;
  const r = t.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2;
  const sp = document.createElement("span"); sp.className = "rpl";
  sp.style.width = sp.style.height = d + "px"; sp.style.left = (e.clientX - r.left - d / 2) + "px"; sp.style.top = (e.clientY - r.top - d / 2) + "px";
  t.appendChild(sp); setTimeout(() => sp.remove(), 500);
});
// ---- 生成页：风格芯片、选项芯片、粘贴 ----
(function () {
  const box = $("styleChips"), sel = $("style");
  Array.from(sel.options).forEach(o => {
    const b = document.createElement("button"); b.className = "chip5"; b.textContent = o.textContent; b.dataset.v = o.value;
    b.onclick = () => { sel.value = o.value; Store.set("vtn_style", o.value); sync(); };
    box.appendChild(b);
  });
  const sv = Store.get("vtn_style"); if (sv) sel.value = sv;
  function sync() {
    box.querySelectorAll(".chip5").forEach(b => b.classList.toggle("on", b.dataset.v === sel.value));
    $("chipTs").classList.toggle("on", $("tsOn").checked);
    $("chipShot").classList.toggle("on", !!($("shotOn") && $("shotOn").checked));
  }
  $("chipTs").onclick = () => { $("tsOn").checked = !$("tsOn").checked; $("tsOn").dispatchEvent(new Event("change")); sync(); snack($("tsTip").textContent); };
  $("chipShot").onclick = () => { const c = $("shotOn"); if (!c) return; c.checked = !c.checked; c.dispatchEvent(new Event("change")); sync(); };
  window.__syncChips = sync; sync();
  $("pasteBtn").onclick = async () => {
    let t = "";
    if (HAS_NATIVE && Native.paste) { try { t = Native.paste() || ""; } catch (e) { __err(e, "L1273") } }
    if (!t) { try { t = await navigator.clipboard.readText(); } catch (e) { __err(e, "L1274") } }
    t = (t || "").trim();
    if (t) { $("input").value = t; $("input").dispatchEvent(new Event("input")); snack("已粘贴"); }
    else snack("剪贴板是空的，先去B站复制链接");
  };
})();
