// ===== v1.5.1：PDF 改为打印主界面里的专用区域 =====
(function () {
  const pa = document.createElement("div"); pa.id = "v5print"; document.body.appendChild(pa);
  const st = document.createElement("style");
  st.textContent = "#v5print{display:none}" +
    "@media print{html,body{background:#fff!important;color:#222!important}" +
    "body>*:not(#v5print){display:none!important}#v5print{display:block!important;padding:0;margin:0}" +
    PCSS.replace(/body\{/g, "#v5print{") + "}";
  document.head.appendChild(st);
})();
async function fillPrint(md) {
  const pa = $("v5print");
  pa.innerHTML = render(md);
  const imgs = Array.from(pa.querySelectorAll("img"));
  imgs.forEach(i => { i.loading = "eager"; });
  await Promise.all(imgs.map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; setTimeout(r, 8000); })));
  if (document.fonts && document.fonts.ready) { try { await document.fonts.ready; } catch (e) { __err(e, "L1123") } }
  await new Promise(r => setTimeout(r, 300));
}
$("v5pdf").onclick = async () => {
  if (!current || !HAS_NATIVE) return;
  const b = $("v5pdf"); b.disabled = true; $("v5msg").textContent = "正在准备图片和公式…";
  const old = window.__nativeProg;
  window.__nativeProg = (id, msg) => { $("v5msg").textContent = msg; log(msg); };
  try {
    await fillPrint(curMd());
    const r = await Promise.race([
      ncall("makePdf2", safeName(current.title) + verTag() + ".pdf"),
      new Promise((_, rej) => setTimeout(() => rej(new Error("超过 90 秒没有完成")), 90000))
    ]);
    $("v5msg").textContent = r.msg; alert(r.msg);
  } catch (e) {
    $("v5msg").textContent = "导出失败";
    alert("导出失败：" + e.message + "\n可以改用“系统打印”→ 保存为 PDF。请把这条提示截图发给我。");
  } finally { window.__nativeProg = old; b.disabled = false; }
};
$("v5prt").onclick = async () => {
  if (!current || !HAS_NATIVE) return;
  $("v5msg").textContent = "正在打开系统打印…";
  await fillPrint(curMd());
  Native.printPdf2(safeName(current.title) + verTag());
  $("v5msg").textContent = "";
};
