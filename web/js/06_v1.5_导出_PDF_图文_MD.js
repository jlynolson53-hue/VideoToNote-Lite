// ===== v1.5：导出 PDF / 图文 MD =====
const PCSS = "body{font-family:sans-serif;font-size:15px;line-height:1.75;color:#222;margin:0}" +
  "h1{font-size:24px;border-bottom:2px solid #2f6fed;padding-bottom:6px}h2{font-size:20px;border-left:4px solid #2f6fed;padding-left:8px;margin-top:22px}h3{font-size:17px}" +
  "a{color:inherit;text-decoration:none}code{background:#f2f2f2;padding:0 3px;border-radius:3px}" +
  ".shot,.tbw,.mathd,table,img{page-break-inside:avoid;break-inside:avoid}.shot{margin:12px 0}.shot img{max-width:100%;border:1px solid #ddd;border-radius:6px;display:block}.shot figcaption{font-size:12px;color:#888}" +
  ".tbw table{border-collapse:collapse;width:100%;font-size:14px}.tbw th,.tbw td{border:1px solid #bbb;padding:6px 8px;text-align:left;vertical-align:top}.tbw th{background:#eef2fb}" +
  ".mathd{margin:10px 0}.katex{font-size:1.05em}h1,h2,h3{page-break-after:avoid;break-after:avoid}";
function pdfHtml(md) {
  return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=794,initial-scale=1"><link rel="stylesheet" href="katex/katex.min.css"><style>' + PCSS +
    '</style></head><body>' + render(md) + '</body></html>';
}
function curMd() { if (current) current.md = $("source").value; return current ? current.md : ""; }
function verTag() { return MAT && MAT.vers.length > 1 ? "_第" + ((MAT.cur || 0) + 1) + "版" : ""; }
(function () {
  const d = document.createElement("div");
  d.className = "v4bar";
  d.innerHTML = '<button id="v5pdf">导出 PDF</button><button id="v5md" class="ghost">导出图文 MD</button><button id="v5prt" class="ghost">系统打印</button><span class="mute" id="v5msg"></span>';
  $("v4bar").appendChild(d);
})();
$("v5pdf").onclick = async () => {
  if (!current) return;
  const b = $("v5pdf"); b.disabled = true; $("v5msg").textContent = "正在生成 PDF…";
  try {
    const r = await ncall("makePdf", pdfHtml(curMd()), safeName(current.title) + verTag() + ".pdf");
    $("v5msg").textContent = r.msg; alert(r.msg + "\n\n如果打开后公式或图片缺失，可以改用“系统打印”→ 保存为 PDF。");
  } catch (e) { $("v5msg").textContent = ""; alert("导出失败：" + e.message + "\n可以改用“系统打印”→ 保存为 PDF。"); }
  finally { b.disabled = false; }
};
$("v5prt").onclick = () => { if (current && HAS_NATIVE) Native.printPdf(pdfHtml(curMd()), safeName(current.title)); };
$("v5md").onclick = () => {
  if (!current || !HAS_NATIVE) return;
  let miss = 0;
  const md = curMd().replace(/\]\(img\/([^)\s]+)\)/g, (m, n) => { const b = Native.readB64(n); if (!b) { miss++; return m; } return "](data:image/jpeg;base64," + b + ")"; });
  alert(Native.saveFile(safeName(current.title) + verTag() + ".md", md) + (miss ? "\n有 " + miss + " 张图片找不到，保留了原链接。" : "\n图片已直接嵌入文件，换设备打开也能看到。"));
};
