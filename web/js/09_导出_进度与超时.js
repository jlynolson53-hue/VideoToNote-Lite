// ===== v1.5.2：PDF 导出显示步骤，超时自动改用系统打印 =====
$("v5pdf").onclick = async () => {
  if (!current || !HAS_NATIVE) return;
  const b = $("v5pdf"); b.disabled = true; $("v5msg").textContent = "正在准备图片和公式…";
  const old = window.__nativeProg; let lastStep = "还没开始排版";
  window.__nativeProg = (id, msg) => { lastStep = msg; $("v5msg").textContent = msg; log("PDF：" + msg); };
  try {
    await fillPrint(curMd());
    const r = await Promise.race([
      ncall("makePdf2", safeName(current.title) + verTag() + ".pdf"),
      new Promise((_, rej) => setTimeout(() => rej(new Error("TIMEOUT")), 90000))
    ]);
    $("v5msg").textContent = r.msg; alert(r.msg);
  } catch (e) {
    const to = e.message === "TIMEOUT";
    $("v5msg").textContent = "直接导出没成功（停在：" + lastStep + "）";
    if (await window.__askOr("直接导出没成功", "改用系统打印", (to ? "直接导出超过 90 秒没完成。" : "直接导出失败：" + e.message + "。") + "\n停在的步骤：" + lastStep +
      "\n\n点“确定”改用系统打印，在打印界面选“另存为 PDF”。\n（请把这条提示截图发给我，方便修复）")) {
      await fillPrint(curMd());
      Native.printPdf2(safeName(current.title) + verTag());
    }
  } finally { window.__nativeProg = old; b.disabled = false; }
};
