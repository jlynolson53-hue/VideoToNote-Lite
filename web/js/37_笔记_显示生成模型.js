// ===== v2.9.1：记录并显示笔记是用哪个模型写的（只在 App 里显示，导出 PDF/MD 不带）=====
(function () {
  const NM = { "gpai-fast": "GPAI Fast", "gemini-4-neon": "Gemini 4 Neon", "claude-opus-5.5": "Claude Opus 5.5", "gpt-6.1-sol": "GPT-6.1 Sol" };
  const nice = m => NM[m] || (/deepseek/i.test(m) ? "DeepSeek · " + m : m);
  const _save = saveHist;
  saveHist = function (item) {
    if (item && window.__busy && !item.model) { item.model = S.model; item.prov = /ts\.net|gpai/i.test(S.base) ? "GPAI" : "DeepSeek"; }
    return _save.apply(this, arguments);
  };
  const st = document.createElement("style");
  st.textContent = "#modelTag{display:inline-block;font-size:12px;line-height:20px;padding:0 10px;margin:0 0 8px;border-radius:10px;background:var(--secondary-container,#e8eaf6);color:var(--on-secondary-container,#333)}";
  document.head.appendChild(st);
  const tag = document.createElement("div"); tag.id = "modelTag"; tag.style.display = "none";
  $("preview").before(tag);
  function paint(it) {
    if (it && it.model) { tag.textContent = "由 " + nice(it.model) + " 生成"; tag.style.display = ""; }
    else tag.style.display = "none";
  }
  const _show = show;
  show = function (item) { const r = _show.apply(this, arguments); paint(item); return r; };
  window.__modelTag = { paint: paint, nice: nice };
})();
