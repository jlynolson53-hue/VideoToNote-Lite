// ===== v1.4.1：公式 + 表格 + 过滤无关截图 + AI 输入 + 多轮修改 =====
function fixTex(md) {
  // v1.9.0：多行公式块合并、裸露的 \begin{...} 环境包上 $$、纯英文单词误用 $ 改为斜体
  md = String(md || "").replace(/\r/g, "");
  md = md.replace(/\$\$([\s\S]+?)\$\$/g, (m, t) => t.includes("\n") ? "\n$$" + t.split("\n").map(x => x.trim()).filter(Boolean).join(" ") + "$$\n" : m);
  md = md.replace(/(^|\n)([^\n$]*?\\begin\{([a-zA-Z*]+)\}[\s\S]*?\\end\{\3\}[^\n$]*)(?=\n|$)/g, (m, a, t) => t.includes("$") ? m : a + "$$" + t.split("\n").map(x => x.trim()).filter(Boolean).join(" ") + "$$");
  md = md.replace(/(^|[^$\\])\$([A-Za-z][A-Za-z '’-]{2,}[A-Za-z])\$(?!\$)/g, (m, a, w) => a + "*" + w + "*");
  // 先把多行 $$ 块合成一行，避免下面删掉单独的 $$ 行
  md = String(md || "").replace(/(^|\n)[ \t]*\$\$[ \t]*\n([\s\S]*?)\n[ \t]*\$\$[ \t]*(?=\n|$)/g, (m, a, t) => a + "$$" + t.trim().replace(/\n+/g, " \\\\ ") + "$$");
  md = md.replace(/(^|\n)\\\[\s*([\s\S]*?)\s*\\\](?=\n|$)/g, (m, a, t) => a + "$$" + t.replace(/\n+/g, " ") + "$$");
  // 整行裸露的 LaTeX 自动包上 $$
  return md.split("\n").map(l => {
    const s = l.trim();
    if (!s || s.includes("$") || /^(#|\||!|>|```|-|\*|\d+[.、)]|【)/.test(s)) return l;
    if (!/\\(frac|mathrm|xlongequal|times|approx|text|cdot|qquad|Delta|uparrow|sim|le|ge|Rightarrow)/.test(s)) return l;
    if (/[\u4e00-\u9fa5]/.test(s.replace(/\\text\{[^}]*\}/g, ""))) return l;
    return "$$" + s + "$$";
  }).join("\n");
}
function cleanMd(md) {
  return fixTex(md).split("\n").filter(l => !/^\s*(\${1,2}|\\\\)\s*$/.test(l)).join("\n").replace(/\n{3,}/g, "\n\n");
}
function texHtml(tex, disp) {
  try { if (window.katex) return katex.renderToString(tex, { displayMode: disp, throwOnError: false, strict: false }); } catch (e) { __err(e, "L725") }
  return '<code>' + esc(tex) + '</code>';
}
const CJK = /[\u3400-\u9fff\uff01-\uff5e\u3000-\u303f“”‘’]/;
const _render4 = render;
render = function (md) {
  const M = [], T = [];
  const put = (tex, disp) => { M.push([tex.trim(), disp]); return "\u0002" + (M.length - 1) + "\u0003"; };
  md = String(md || "");
  md = md.replace(/\$\$([\s\S]+?)\$\$/g, (m, t) => "\n\n" + put(t, true) + "\n\n");
  md = md.replace(/\\\[([\s\S]+?)\\\]/g, (m, t) => "\n\n" + put(t, true) + "\n\n");
  md = md.replace(/\\\(([\s\S]+?)\\\)/g, (m, t) => put(t, false));
  md = md.replace(/\$([^\$\n]+?)\$/g, (m, t) => put(t, false));
  // 没加 $ 的裸公式：整行是公式 -> 独立公式；夹在中文里 -> 行内公式
  md = md.split("\n").map(l => {
    if (!/\\[a-zA-Z]+/.test(l) || /^\s*(#|\||`)/.test(l)) return l;
    const mm = l.match(/^(\s*(?:[-*+]|\d+[.)])\s+)?(.*)$/);
    const pre = mm[1] || "", body = mm[2];
    if (!CJK.test(body) && !/\u0002/.test(body)) return pre ? pre + put(body, false) : put(body, true);
    return pre + body.replace(/[^\u3400-\u9fff\uff01-\uff5e\u3000-\u303f“”‘’\u0002\u0003]*\\[a-zA-Z]+[^\u3400-\u9fff\uff01-\uff5e\u3000-\u303f“”‘’\u0002\u0003]*/g,
      s => { const t = s.trim(); if (!t) return s; const a = s.match(/^\s*/)[0], b = s.match(/\s*$/)[0]; return a + put(t, false) + b; });
  }).join("\n");
  md = cleanMd(md);
  // 表格
  const L = md.split("\n"), out = [];
  const cells = r => r.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map(c => c.trim());
  for (let i = 0; i < L.length; i++) {
    if (/^\s*\|.*\|/.test(L[i]) && i + 1 < L.length && /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(L[i + 1])) {
      let h = '<div class="tbw"><table><thead><tr>' + cells(L[i]).map(c => "<th>" + inline(c) + "</th>").join("") + "</tr></thead><tbody>";
      i += 2;
      while (i < L.length && /^\s*\|/.test(L[i])) { h += "<tr>" + cells(L[i]).map(c => "<td>" + inline(c) + "</td>").join("") + "</tr>"; i++; }
      i--;
      T.push(h + "</tbody></table></div>");
      out.push("", "\u0004" + (T.length - 1) + "\u0005", "");
    } else out.push(L[i]);
  }
  let h = _render4(out.join("\n"));
  h = h.replace(/<p>\s*\u0004(\d+)\u0005\s*<\/p>/g, (m, i) => T[i]);
  h = h.replace(/<p>\s*\u0002(\d+)\u0003\s*<\/p>/g, (m, i) => '<div class="mathd">' + texHtml(M[i][0], true) + '</div>');
  h = h.replace(/\u0002(\d+)\u0003/g, (m, i) => texHtml(M[i][0], M[i][1]));
  return h;
};
(function () {
  const st = document.createElement("style");
  st.textContent = ".mathd{overflow-x:auto;margin:10px 0}.katex{font-size:1.08em}" +
    ".tbw{overflow-x:auto;margin:12px 0}.tbw table{border-collapse:collapse;width:100%;font-size:15px}.tbw th,.tbw td{border:1px solid var(--bd);padding:8px 10px;text-align:left;vertical-align:top}.tbw th{background:rgba(127,127,127,.12)}" +
    ".v4bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:8px 0}.v4bar select{width:auto;flex:1;min-width:140px;margin:0}.v4bar button{margin:0}" +
    "#v4note{white-space:pre-wrap;font-size:14px;background:rgba(127,127,127,.1);border-radius:8px;padding:8px 10px;margin:0 0 8px}" +
    "#v4page{position:fixed;inset:0;z-index:999;background:var(--bg,#fff);overflow:auto;padding:14px;display:none}" +
    "#v4page h3{margin:16px 0 6px}#v4page pre{white-space:pre-wrap;word-break:break-all;font-size:13px;background:rgba(127,127,127,.12);padding:10px;border-radius:8px}" +
    "#v4page img{max-width:100%;border-radius:8px;border:1px solid var(--bd)}.v4top{position:sticky;top:0;display:flex;justify-content:space-between;align-items:center;background:inherit;padding-bottom:8px}";
  document.head.appendChild(st);
})();

const GOOD = new Set(["题目", "板书", "图表"]);
const _rf4 = readFrames;
readFrames = async function (frames) {
  const r = await _rf4(frames);
  let ok = r.filter(f => GOOD.has(f.type) && f.content && !(f.t < 15 && f.type !== "题目"));
  if (!ok.length && frames.length) {
    log("识图一张都没认出来，已改为保留全部截图（按板书处理），笔记里照样插图；请检查识图模型设置", "e");
    ok = frames.filter(f => f.n).map(f => Object.assign(f, { type: GOOD.has(f.type) ? f.type : "板书", content: f.content || "（这张截图没有识别出文字）" }));
  }
  log("识图后保留 " + ok.length + " 张（已去掉片头、人像、动画等无关画面）");
  return ok;
};
const _ins4 = insertImages;
insertImages = function (md, frames) { return _ins4(md, (frames || []).filter(f => GOOD.has(f.type))); };

const MATHRULE = "\n【公式格式，必须遵守】所有数学符号和公式都必须用美元符号包裹：行内用 $...$，独立公式用 $$...$$（多行公式写在同一个 $$ 块里，用 \\\\ 换行）。不要用 \\( \\) 或 \\[ \\]，不要输出没有包裹的 LaTeX 命令。表格用标准 Markdown 表格（第二行是 |---|---|）。";
let CAP = null;
const _chat4 = chat;
chat = async function (messages) {
  if (CAP) CAP.push(messages.map(m => ({ role: m.role, content: typeof m.content === "string" ? m.content :
    m.content.map(c => c.type === "text" ? c.text : "[图片]").join("\n") })));
  return await _chat4.apply(this, arguments);
};
const _sp4 = sysPrompt;
sysPrompt = function () { return _sp4() + MATHRULE; };
const matName = it => "mat_" + it.time + ".json";
function loadMat(it) { if (!it || !it.mat || !HAS_NATIVE) return null; try { return JSON.parse(Native.readText(it.mat) || "null"); } catch (e) { return null; } }
function saveMat(name, m) { if (HAS_NATIVE) Native.writeText(name, JSON.stringify(m)); }
function updHist(item) {
  const h = loadHist(); const i = h.findIndex(x => x.time === item.time);
  if (i >= 0) h[i] = item; else h.unshift(item);
  try { Store.set("vtn_hist", JSON.stringify(h)); } catch (e) { __err(e, "L810") }
  drawHist();
}
function framesText(segs, frames) {
  const all = frames.length ? segs.concat(frames.map(f => ({ from: f.t, to: f.t, text: "【图" + f.n + "】（" + f.type + "）" + String(f.content).replace(/\s*\n\s*/g, " / ") }))).sort((a, b) => a.from - b.from) : segs;
  return toLines(all).join("\n");
}

async function runV4(subOnly) {
  $("log").innerHTML = "";
  $("goBtn").disabled = $("subOnly").disabled = true;
  try {
    const info = await parseInput($("input").value.trim());
    const v = await fetchSubs2(info);
    log("文字稿共 " + v.segs.length + " 段" + (v.asr ? "（语音识别）" : ""), "o");
    const srt = toSrt(v.segs);
    const time = Date.now();
    let md, frames = [], sys = "";
    CAP = [];
    if (subOnly) md = "# " + v.title + "【字幕】\n\n" + toLines(v.segs).join("\n\n");
    else {
      if (V3.shot) {
        try {
          frames = await getFrames(v);
          if (frames.length) frames = await readFrames(frames);
          log("有效截图 " + frames.length + " 张", "o");
        } catch (e) { log("截图/识图没成功，先生成纯文字笔记：" + e.message, "e"); frames = []; }
      }
      FRAME_MODE = frames.length > 0;
      sys = sysPrompt();
      const segsAll = FRAME_MODE
        ? v.segs.concat(frames.map(f => ({ from: f.t, to: f.t, text: "【图" + f.n + "】（" + f.type + "）" + f.content.replace(/\s*\n\s*/g, " / ") }))).sort((a, b) => a.from - b.from)
        : v.segs;
      try { md = await makeNotes(v.title, segsAll); } finally { FRAME_MODE = false; }
      md = cleanMd(md);
      if (frames.length) md = insertImages(md, frames);
      if (!/^#\s/.test(md.trim())) md = "# " + v.title + "\n\n" + md;
      md += "\n\n---\n来源：https://www.bilibili.com/video/" + v.bvid + "?p=" + v.p + "\n";
    }
    const item = { title: v.title, bvid: v.bvid, p: v.p, md, srt, kind: subOnly ? "sub" : "note", time, imgs: frames.map(f => f.name) };
    if (!subOnly) {
      item.mat = matName(item);
      saveMat(item.mat, {
        title: v.title, bvid: v.bvid, p: v.p, asr: !!v.asr, style: $("style").value, req: REQ_ON ? $("req").value.trim() : "", ts: $("tsOn").checked,
        sys, segs: v.segs.map(s => ({ from: s.from, to: s.to, text: s.text })),
        frames: frames.map(f => ({ n: f.n, t: f.t, type: f.type, content: f.content, name: f.name })),
        calls: CAP, vers: [{ md, note: "首次生成", time }], cur: 0
      });
    }
    try { const gt = window.__genTag && window.__genTag(); if (gt && !item.tag) item.tag = gt; } catch (e) { __err(e, "L859") } saveHist(item); try { if (!item.tag && item.kind !== "sub" && window.__autoTag) window.__autoTag(item); } catch (e) { __err(e, "L859") } show(item); try { window.__doneNotify && window.__doneNotify(item); } catch (e) { __err(e, "L859") }
    log("完成！", "o");
  } catch (e) {
    log("出错了：" + e.message, "e");
  } finally {
    CAP = null;
    $("goBtn").disabled = $("subOnly").disabled = false;
  }
}
