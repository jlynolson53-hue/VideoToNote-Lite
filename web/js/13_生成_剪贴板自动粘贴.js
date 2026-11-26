// v1.7.5：剪贴板有 B 站链接时自动粘贴
(function () {
  const RE = /(b23\.tv\/\w+|bilibili\.com\/video\/|\bBV[0-9A-Za-z]{10}\b|\bav\d{3,}\b)/i;
  const on = () => Store.get("vtn_autoclip") !== "0";
  function autoClip() {
    if (!on() || window.__busy || !HAS_NATIVE || !Native.paste) return;
    const box = $("input"); if (!box || box.value.trim()) return;
    let t = ""; try { t = (Native.paste() || "").trim(); } catch (e) { return; }
    if (!t || !RE.test(t)) return;
    if (Store.get("vtn_lastclip") === t) return;
    Store.set("vtn_lastclip", t);
    box.value = t; box.dispatchEvent(new Event("input"));
    box.classList.remove("vflash"); void box.offsetWidth; box.classList.add("vflash");
    (typeof snack === "function" ? snack : alert)("已自动粘贴剪贴板里的 B 站链接");
  }
  setTimeout(autoClip, 700);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) setTimeout(autoClip, 400); });
  window.addEventListener("focus", () => setTimeout(autoClip, 400));
  const about = $("verTxt") && $("verTxt").closest(".grp");
  if (about) {
    const gt = document.createElement("div"); gt.className = "gt"; gt.textContent = "便捷";
    const g = document.createElement("div"); g.className = "grp";
    g.innerHTML = '<label class="sw" style="display:flex;align-items:center;justify-content:space-between;padding:10px 0"><span style="color:var(--on-surface);font-size:17px">自动粘贴剪贴板里的 B 站链接</span><input type="checkbox" id="autoClipSw"><i></i></label>';
    const ref = about.previousElementSibling && about.previousElementSibling.classList.contains("gt") ? about.previousElementSibling : about;
    ref.before(gt, g);
    const sw = $("autoClipSw"); sw.checked = on();
    sw.onchange = () => Store.set("vtn_autoclip", sw.checked ? "1" : "0");
  }
})();
