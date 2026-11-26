// v1.9.2：阅读页工具栏重排——导出 PDF 为主按钮，其余收成次要图标组
(function () {
  const t = $("readTools"); if (!t) return;
  const st = document.createElement("style");
  st.textContent = "#readTools{gap:8px!important;align-items:center;justify-content:flex-start!important}#readTools>*{flex:0 0 auto!important}#readTools .grp{border:1px solid rgba(120,120,128,.28)!important}#readTools .grp .chip5+.chip5{border-left:1px solid rgba(120,120,128,.28)!important;border-radius:0!important}#readTools .grp .chip5{min-width:0!important;width:auto!important;flex:0 0 auto!important;margin:0!important;height:32px!important;padding:0 10px!important}#readTools{}#readTools .grp{display:inline-flex;background:rgba(120,120,128,.14);border-radius:999px;padding:3px}#readTools .grp .chip5{background:transparent!important;border:0!important;box-shadow:none!important;min-width:40px;padding:0 12px;color:var(--on-surface-variant,#555)}#readTools .grp .chip5:active{background:rgba(0,0,0,.15)!important}#readTools .pri{background:#111111!important;color:#fff!important;border:0!important;font-weight:600;padding:0 18px;height:36px!important;box-shadow:0 2px 8px rgba(0,0,0,.35)}#readTools .pri::before{content:'picture_as_pdf';font-family:'Material Symbols Rounded';font-size:20px;margin-right:6px;vertical-align:middle}";
  document.head.appendChild(st);
  const bs = Array.from(t.querySelectorAll("button.chip5"));
  const by = f => bs.find(f);
  const pdf = by(b => /导出 PDF/.test(b.textContent));
  const font = by(b => /^(宋体|黑体)$/.test(b.textContent.trim()));
  const s = t.querySelector('[data-a="s"]'), b = t.querySelector('[data-a="b"]');
  const find = t.querySelector('[data-a="find"]'), toc = t.querySelector('[data-a="toc"]');
  const g1 = document.createElement("span"); g1.className = "grp";
  const g2 = document.createElement("span"); g2.className = "grp";
  const ico = (el, name, tip) => { if (!el) return; el.innerHTML = '<span class="ic" style="font-size:20px">' + name + "</span>"; el.title = tip; el.setAttribute("aria-label", tip); };
  ico(find, "search", "搜索"); ico(toc, "toc", "目录");
  [find, toc].forEach(x => x && g1.appendChild(x));
  [font, s, b].forEach(x => x && g2.appendChild(x));
  if (pdf) { pdf.classList.add("pri"); t.prepend(pdf); }
  const info = $("readInfo");
  info ? (info.before(g1), info.before(g2)) : (t.appendChild(g1), t.appendChild(g2));
})();
