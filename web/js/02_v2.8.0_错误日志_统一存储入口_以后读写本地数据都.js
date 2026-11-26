// ===== v2.8.0：错误日志 + 统一存储入口（以后读写本地数据都走 Store）=====
const __ERRK = "vtn_errlog"; let __errBuf = [], __errT = 0;
function __errFlush() {
  clearTimeout(__errT); if (!__errBuf.length) return;
  try {
    const a = JSON.parse(localStorage.getItem(__ERRK) || "[]");
    __errBuf.forEach(x => { const l = a[a.length - 1]; if (l && l.w === x.w && l.m === x.m) { l.n = (l.n || 1) + 1; l.t = x.t; } else a.push(x); });
    while (a.length > 100) a.shift();
    localStorage.setItem(__ERRK, JSON.stringify(a));
  } catch (x) { /* 日志本身写不进去时放弃，避免死循环 */ }
  __errBuf = [];
}
function __err(e, where) {
  try {
    __errBuf.push({ t: Date.now(), w: String(where || ""), m: String((e && (e.message || e)) || e).slice(0, 300), s: String((e && e.stack) || "").slice(0, 300) });
    clearTimeout(__errT); __errT = setTimeout(__errFlush, 800);
  } catch (x) { /* 同上 */ }
}
function __errText() {
  __errFlush(); let a = []; try { a = JSON.parse(localStorage.getItem(__ERRK) || "[]"); } catch (x) { /* 同上 */ }
  if (!a.length) return "（没有错误记录）";
  return a.slice().reverse().map(x => new Date(x.t).toLocaleString() + "  [" + x.w + "]" + (x.n > 1 ? " ×" + x.n : "") + "\n" + x.m).join("\n\n");
}
window.__err = __err; window.__errFlush = __errFlush; window.__errText = __errText;
window.addEventListener("error", ev => __err(ev.error || ev.message, "未捕获 L" + ev.lineno));
window.addEventListener("unhandledrejection", ev => __err(ev.reason, "未处理的 Promise"));
document.addEventListener("visibilitychange", () => { if (document.hidden) __errFlush(); });
const Store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { __err(e, "读取 " + k); return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) { __err(e, "写入 " + k); throw e; } },
  del(k) { try { localStorage.removeItem(k); } catch (e) { __err(e, "删除 " + k); } },
  json(k, d) { const s = Store.get(k); if (s == null) return d; try { return JSON.parse(s); } catch (e) { __err(e, "解析 " + k); return d; } }
};
window.Store = Store;
const $ = id => document.getElementById(id);
const HAS_NATIVE = typeof window.Native !== "undefined";

const cbs = {}; let seq = 0;
window.__nativeCb = (id, s) => { const f = cbs[id]; delete cbs[id]; if (f) f(JSON.parse(s)); };
function http(method, url, headers, body) {
  return new Promise((res, rej) => {
    if (!HAS_NATIVE) { rej(new Error("请在安卓应用里运行")); return; }
    const id = "r" + (++seq);
    cbs[id] = r => r.error ? rej(new Error("网络错误：" + r.error)) : res(r);
    Native.request(id, method, url, JSON.stringify(headers || {}), body || "");
  });
}

function log(msg, cls) { const d = document.createElement("div"); if (cls) d.className = cls; d.textContent = msg; $("log").appendChild(d); $("log").scrollTop = 1e9; }

const S = { base: "https://api.deepseek.com", model: "deepseek-flash", key: "" };
try { Object.assign(S, JSON.parse(Store.get("vtn_set") || "{}")); } catch (e) { __err(e, "L20") }
$("base").value = S.base; $("model").value = S.model; $("key").value = S.key;
if (!S.key) $("setBox").open = true;
$("saveSet").onclick = () => {
  S.base = $("base").value.trim() || "https://api.deepseek.com";
  S.model = $("model").value.trim() || "deepseek-flash";
  S.key = $("key").value.trim();
  Store.set("vtn_set", JSON.stringify(S));
};
$("testSet").onclick = async () => {
  $("saveSet").onclick();
  try { const t = await chat([{ role: "user", content: "只回复四个字：连接成功" }]); alert("模型回复：" + t); }
  catch (e) { alert(e.message); }
};

function refreshLogin() {
  if (!HAS_NATIVE) { $("loginState").textContent = "（浏览器预览模式，无法登录）"; return; }
  const ok = Native.hasLogin();
  $("loginState").textContent = ok ? "已登录，可以获取 AI 字幕" : "未登录";
  $("loginState").style.color = ok ? "var(--ok)" : "var(--mute)";
}
$("loginBtn").onclick = () => HAS_NATIVE && Native.openLogin();
$("logoutBtn").onclick = () => { if (HAS_NATIVE) { Native.logout(); setTimeout(refreshLogin, 500); } };
refreshLogin();

const BH = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  "Referer": "https://www.bilibili.com/"
};
async function bget(url) {
  const r = await http("GET", url, BH);
  let j; try { j = JSON.parse(r.body); } catch (e) { throw new Error("B站返回了看不懂的内容（状态码 " + r.status + "）"); }
  if (j.code !== 0) throw new Error("B站接口报错：" + j.message + "（code " + j.code + "）");
  return j.data;
}
const MIX = [46,47,18,2,53,8,23,32,15,50,10,31,58,3,45,35,27,43,5,49,33,9,42,19,29,28,14,39,12,38,41,13,37,48,7,16,24,55,40,61,26,17,0,1,60,51,30,4,22,25,54,21,56,59,6,63,57,62,11,36,20,34,44,52];
let mixinKey = null;
async function getMixin() {
  if (mixinKey) return mixinKey;
  const r = await http("GET", "https://api.bilibili.com/x/web-interface/nav", BH);
  const d = JSON.parse(r.body).data.wbi_img;
  const stem = u => u.slice(u.lastIndexOf("/") + 1).split(".")[0];
  const raw = stem(d.img_url) + stem(d.sub_url);
  mixinKey = MIX.map(i => raw[i]).join("").slice(0, 32);
  return mixinKey;
}
async function signed(params) {
  const key = await getMixin();
  params.wts = Math.floor(Date.now() / 1000);
  const q = Object.keys(params).sort().map(k =>
    encodeURIComponent(k) + "=" + encodeURIComponent(String(params[k]).replace(/[!'()*]/g, ""))).join("&");
  return q + "&w_rid=" + Native.md5(q + key);
}

async function parseInput(text) {
  let url = (text.match(/https?:\/\/[^\s\u3000\u4e00-\u9fa5]+/) || [""])[0];
  if (/b23\.tv/.test(url)) {
    log("正在解析短链接…");
    const r = await http("GET", url, BH);
    url = r.url;
  }
  const src = url || text;
  const bv = (src.match(/BV[0-9A-Za-z]{10}/) || [null])[0];
  const av = (src.match(/av(\d+)/i) || [null, null])[1];
  const p = parseInt((src.match(/[?&]p=(\d+)/) || [0, 0])[1]) || 0;
  if (!bv && !av) throw new Error("没有识别到B站视频链接或BV号");
  return { bv, av, p };
}

async function fetchSubs(info) {
  log("正在读取视频信息…");
  const view = await bget("https://api.bilibili.com/x/web-interface/view?" + (info.bv ? "bvid=" + info.bv : "aid=" + info.av));
  const pages = view.pages || [];
  const pIdx = (parseInt($("pnum").value) || info.p || 1);
  const page = pages[pIdx - 1] || pages[0];
  let title = view.title;
  if (pages.length > 1) title += " P" + page.page + " " + page.part;
  log("视频：" + title);
  log("正在查找字幕…");
  const q = await signed({ bvid: view.bvid, cid: page.cid });
  const player = await bget("https://api.bilibili.com/x/player/wbi/v2?" + q);
  const list = (player.subtitle && player.subtitle.subtitles) || [];
  if (!list.length) {
    if (!HAS_NATIVE || !Native.hasLogin()) throw new Error("没有拿到字幕。B站的 AI 字幕一般要登录后才给，请先点“登录B站”再试。");
    throw new Error("这个视频没有字幕（也没有 AI 字幕）。精简版不能在本机转写语音，请换一个视频。");
  }
  const pick = list.find(s => /^zh/.test(s.lan)) || list.find(s => /^ai-zh/.test(s.lan)) || list[0];
  let surl = pick.subtitle_url; if (surl.startsWith("//")) surl = "https:" + surl;
  log("使用字幕：" + (pick.lan_doc || pick.lan));
  const r = await http("GET", surl, BH);
  const body = JSON.parse(r.body).body || [];
  const segs = body.map(x => ({ from: x.from, to: x.to, text: x.content }));
  if (!segs.length) throw new Error("字幕内容为空");
  return { title, segs, bvid: view.bvid, p: page.page };
}

const pad = n => String(n).padStart(2, "0");
function fmt(t) { t = Math.floor(t); const h = Math.floor(t / 3600), m = Math.floor(t % 3600 / 60), s = t % 60; return (h ? h + ":" + pad(m) : pad(m)) + ":" + pad(s); }
function srtTime(t) { const ms = Math.round(t * 1000); const h = Math.floor(ms / 3600000), m = Math.floor(ms % 3600000 / 60000), s = Math.floor(ms % 60000 / 1000); return pad(h) + ":" + pad(m) + ":" + pad(s) + "," + String(ms % 1000).padStart(3, "0"); }
function toSrt(segs) { return segs.map((x, i) => (i + 1) + "\n" + srtTime(x.from) + " --> " + srtTime(x.to) + "\n" + x.text + "\n").join("\n"); }
function toLines(segs) {
  const out = []; let cur = null;
  for (const x of segs) {
    if (!cur || x.from - cur.from > 20) { cur = { from: x.from, text: x.text }; out.push(cur); }
    else cur.text += "，" + x.text;
  }
  return out.map(c => "[" + fmt(c.from) + "] " + c.text);
}

async function chat(messages, opts) {
  if (!S.key) throw new Error("还没有填写 API Key，请先展开“大模型设置”");
  const base = S.base.replace(/\/+$/, "");
  const r = await http("POST", base + "/chat/completions",
    { "Content-Type": "application/json", "Authorization": "Bearer " + S.key },
    JSON.stringify({ model: S.model, messages, temperature: 0.3 }));
  let j = null; try { j = JSON.parse(r.body); } catch (e) { __err(e, "L135") }
  if (r.status !== 200 || !j) {
    const m = (j && j.error && j.error.message) || r.body.slice(0, 200);
    const tip = { 401: "API Key 不对或已失效", 402: "账户余额不足，需要充值", 429: "请求太频繁或额度用完，稍后再试" }[r.status] || "大模型请求失败";
    throw new Error(tip + "（状态码 " + r.status + "）：" + m);
  }
  if (r.note) log("接口返回 400，已自动调整后重试：" + r.note);
  const ch = j.choices[0];
  if (opts && opts.trunc && ch.finish_reason === "length") throw Object.assign(new Error("输出被截断"), { trunc: true });
  return ch.message.content;
}
window.__chat = chat;
const STYLE = {
  study: "写成教辅书（方法册）风格的讲义，适用于任何学科，严格遵守：①层级——一级标题用视频原标题；开头写【内容提要】，用 1. 2. 3. 概括本课讲的几种方法或知识块；正文按“方法/题型”分类，二级标题写“类型Ⅰ：××法”或“一、××”（沿用老师或课件的分块和叫法），不要按例题平铺分节；概念课则按知识块分节。②每个类型开头写【方法】，用 ①②③ 写出适用条件和操作步骤，核心公式或结论单独成行。③例题——沿用课件编号写【例N】，题干原样照录（保留小问编号、选项、填空横线 ______），有来源时在括号里注明（如 2023·全国乙卷）；之后依次是【图N】→【解析】→【答案】（单独成行并加粗，每个小问都要有答案，视频没给出就写“视频未给出”）；老师在题后做的方法提炼写成【反思】；老师讲的同类延伸题写成【变式N】。④只有老师讲了两种方法时才写两种解法，先写快法；不要自己补充解法或题目，确需补充时标注【补充】。⑤对比多个对象、多个阶段或多种情形时用表格；关键结论前加 ★；老师的口诀、应试提醒保留原话。⑥用讲义口吻（可用“同学们”），以连贯段落为主，少用无序列表；不要写“作者强调”“视频中提到”。⑦结尾写【总结】（本课方法如何选择）和“易错点”；若视频有练习题，按【强化训练】列出，题号后括号注明来源，答案集中放在最后。⑧禁止编造：字幕和截图都没有的数值、条件、结论一律不写，图中没标出的写“图中未标出”。",
  brief: "写成简要摘要：先用3-5句话概括全片，再列出最多8条关键要点。",
  detail: "写成详细逐段笔记：按时间顺序逐段整理，尽量保留讲解中的细节、数据和例子。"
};
function sysPrompt() {
  return "你是专业的视频笔记助手。用户会给你带时间戳的视频字幕（格式 [分:秒] 文字）。请用简体中文输出 Markdown 笔记。" +
    STYLE[$("style").value] +
    "要求：1）每个小节标题或要点后面标注对应的开始时间，格式严格为 [mm:ss] 或 [h:mm:ss]；2）只根据字幕内容整理，不要编造；3）字幕是自动识别的，可能有错别字，请按上下文修正；4）不要输出多余的开场白。";
}
async function pool(n, items, fn) {
  const out = new Array(items.length); let k = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (k < items.length) { const i = k++; out[i] = await fn(items[i], i); }
  }));
  return out;
}
const SUM_LIM = 12000;
const SUM_P = "下面是一个视频的分段笔记，请用简体中文写一个“## 全片概要”小节（3-6句话加最多8条要点），只输出这个小节：\n\n";
async function sumPiece(t) {
  if (t.length <= SUM_LIM)
    return await chat([{ role: "user", content: "下面是一个视频中连续几段的笔记，请用简体中文压缩成要点概括（不超过600字），只输出概括：\n\n" + t }], { trunc: true });
  let m = t.lastIndexOf("\n", Math.floor(t.length / 2)); if (m < 1) m = Math.floor(t.length / 2);
  return (await sumPiece(t.slice(0, m))) + "\n\n" + (await sumPiece(t.slice(m)));
}
async function summarize(title, parts, joined) {
  try {
    let src = joined;
    if (joined.length > SUM_LIM) {
      log("内容较长，分组汇总（两段一组）…");
      let g = parts;
      do {
        const pairs = []; for (let i = 0; i < g.length; i += 2) pairs.push(g.slice(i, i + 2).join("\n\n"));
        g = await pool(3, pairs, sumPiece);
      } while (g.join("\n\n").length > SUM_LIM && g.length > 1);
      src = g.join("\n\n");
    }
    log("正在生成全片概要…");
    const sum = await chat([{ role: "user", content: SUM_P + src.slice(0, 60000) }], { trunc: true });
    return "# " + title + "\n\n" + sum + "\n\n" + joined;
  } catch (e) {
    if (!e.trunc) throw e;
    log("汇总输出被截断，已走兜底：直接按顺序拼接分段笔记");
    return "# " + title + "\n\n> 本篇未完成整体汇总，以下为分段笔记\n\n" + joined;
  }
}
let TASK = null;
function tWriteRaw(n, t) { if (TASK && HAS_NATIVE) Native.taskWrite(TASK.id, n, t); }
function tWrite(n, o) { tWriteRaw(n, JSON.stringify(o)); }
function tRead(n) { if (!TASK || !HAS_NATIVE) return null; try { return JSON.parse(Native.taskRead(TASK.id, n) || "null"); } catch (e) { return null; } }
async function makeNotes(title, segs) {
  const lines = toLines(segs);
  const chunks = []; let buf = "";
  for (const l of lines) { if (buf.length + l.length > 60000) { chunks.push(buf); buf = ""; } buf += l + "\n"; }
  if (buf) chunks.push(buf);
  if (chunks.length === 1) {
    log("正在请大模型写笔记（可能需要半分钟到两分钟）…");
    return await chat([{ role: "system", content: sysPrompt() }, { role: "user", content: "视频标题：" + title + "\n\n字幕：\n" + chunks[0] }]);
  }
  log("视频较长，分 " + chunks.length + " 段同时处理…");
  const parts = await pool(3, chunks, async (c, i) => {
    const r = await chat([{ role: "system", content: sysPrompt() + "这是长视频的其中一段，只整理这一段，不要写全片总结，用二级标题 ## 开头。" },
      { role: "user", content: "视频标题：" + title + "\n第 " + (i + 1) + "/" + chunks.length + " 段字幕：\n" + chunks[i] }]);
    log("第 " + (i + 1) + "/" + chunks.length + " 段完成");
    return r;
  });
  parts.forEach((p, i) => tWriteRaw("part_" + String(i + 1).padStart(2, "0") + ".md", p));
  return await summarize(title, parts, parts.join("\n\n"));
}

let current = null;
function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function tsToSec(t) { return t.split(":").map(Number).reduce((a, b) => a * 60 + b, 0); }
function inline(s) {
  s = esc(s);
  s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/`([^`]+)`/g, "<code>$1</code>");
  s = s.replace(/\[((?:\d+:)?\d{1,2}:\d{2})\]/g, (m, t) => '<a class="ts" href="#" data-t="' + tsToSec(t) + '">[' + t + "]</a>");
  return s;
}
function render(md) {
  const out = []; let list = null;
  const close = () => { if (list) { out.push("</" + list + ">"); list = null; } };
  for (const raw of md.split("\n")) {
    const l = raw.replace(/\s+$/, "");
    let m;
    if ((m = l.match(/^(#{1,6})\s+(.*)/))) { close(); out.push("<h" + m[1].length + ">" + inline(m[2]) + "</h" + m[1].length + ">"); }
    else if ((m = l.match(/^\s*[-*+]\s+(.*)/))) { if (list !== "ul") { close(); out.push("<ul>"); list = "ul"; } out.push("<li>" + inline(m[1]) + "</li>"); }
    else if ((m = l.match(/^\s*\d+[.)]\s+(.*)/))) { if (list !== "ol") { close(); out.push("<ol>"); list = "ol"; } out.push("<li>" + inline(m[1]) + "</li>"); }
    else if (/^\s*(-{3,}|\*{3,})\s*$/.test(l)) { close(); out.push("<hr>"); }
    else if (!l.trim()) { close(); }
    else { close(); out.push("<p>" + inline(l) + "</p>"); }
  }
  close();
  return out.join("\n");
}
$("preview").addEventListener("click", e => {
  const a = e.target.closest("a.ts"); if (!a) return; e.preventDefault();
  if (current && current.bvid && HAS_NATIVE) Native.openUrl("https://www.bilibili.com/video/" + current.bvid + "?p=" + current.p + "&t=" + a.dataset.t);
});
function show(item) {
  current = item;
  $("resCard").style.display = "block";
  $("resTitle").textContent = item.title;
  $("source").value = item.md;
  $("preview").innerHTML = render(item.md);
  $("preview").style.display = "block"; $("source").style.display = "none";
  $("resCard").scrollIntoView({ behavior: "smooth" });
}
$("tPrev").onclick = () => { current.md = $("source").value; $("preview").innerHTML = render(current.md); $("preview").style.display = "block"; $("source").style.display = "none"; };
$("tSrc").onclick = () => { $("preview").style.display = "none"; $("source").style.display = "block"; };
const safeName = s => s.replace(/[\\/:*?"<>|\n\r]/g, "_").slice(0, 80);
$("bSave").onclick = () => { current.md = $("source").value; alert(Native.saveFile(safeName(current.title) + ".md", current.md)); };
$("bSrt").onclick = () => { if (!current.srt) { alert("这条记录没有字幕数据"); return; } alert(Native.saveFile(safeName(current.title) + ".srt", current.srt)); };
$("bCopy").onclick = () => { Native.copy($("source").value); alert("已复制"); };
$("bShare").onclick = () => Native.share(current.title, $("source").value);

function loadHist() { try { return JSON.parse(Store.get("vtn_hist") || "[]"); } catch (e) { return []; } }
function saveHist(item) {
  let h = loadHist().filter(x => !(x.bvid === item.bvid && x.p === item.p && x.kind === item.kind));
  h.unshift(item); h = h.slice(0, 300);
  for (;;) { try { Store.set("vtn_hist", JSON.stringify(h)); break; } catch (e) { if (!h.length) break; h.pop(); } }
  drawHist();
}
function drawHist() {
  const h = loadHist(); const box = $("hist");
  if (!h.length) { box.textContent = "暂无"; return; }
  box.innerHTML = "";
  h.forEach((it, i) => {
    const d = document.createElement("div"); d.className = "hist";
    const s = document.createElement("span"); s.textContent = (it.kind === "sub" ? "【字幕】" : "") + it.title + "  ·  " + new Date(it.time).toLocaleString();
    const b = document.createElement("button"); b.className = "sec"; b.textContent = "打开"; b.onclick = () => show(it);
    const x = document.createElement("button"); x.className = "sec"; x.textContent = "删除";
    x.onclick = () => { const a = loadHist(); a.splice(i, 1); Store.set("vtn_hist", JSON.stringify(a)); drawHist(); };
    d.append(s, b, x); box.appendChild(d);
  });
}
drawHist();

async function run(subOnly) {
  $("log").innerHTML = "";
  $("goBtn").disabled = $("subOnly").disabled = true;
  try {
    const info = await parseInput($("input").value.trim());
    const v = await fetchSubs(info);
    log("字幕共 " + v.segs.length + " 条", "o");
    const srt = toSrt(v.segs);
    let md;
    if (subOnly) md = "# " + v.title + "【字幕】\n\n" + toLines(v.segs).join("\n\n");
    else {
      md = await makeNotes(v.title, v.segs);
      if (!/^#\s/.test(md.trim())) md = "# " + v.title + "\n\n" + md;
      md += "\n\n---\n来源：https://www.bilibili.com/video/" + v.bvid + "?p=" + v.p + "\n";
    }
    const item = { title: v.title, bvid: v.bvid, p: v.p, md, srt, kind: subOnly ? "sub" : "note", time: Date.now() };
    try { const gt = window.__genTag && window.__genTag(); if (gt && !item.tag) item.tag = gt; } catch (e) { __err(e, "L301") } saveHist(item); try { if (!item.tag && item.kind !== "sub" && window.__autoTag) window.__autoTag(item); } catch (e) { __err(e, "L301") } show(item); try { window.__doneNotify && window.__doneNotify(item); } catch (e) { __err(e, "L301") }
    log("完成！", "o");
  } catch (e) {
    log("出错了：" + e.message, "e");
  } finally {
    $("goBtn").disabled = $("subOnly").disabled = false;
  }
}
$("goBtn").onclick = () => run(false);
$("subOnly").onclick = () => run(true);

if (HAS_NATIVE) { const t = Native.takeShared(); if (t) $("input").value = t; }

// ---- 页面切换 ----
function tab(p) {
  document.querySelectorAll(".page").forEach(x => x.classList.toggle("on", x.id === "pg-" + p));
  document.querySelectorAll(".nav button").forEach(x => x.classList.toggle("on", x.dataset.p === p));
  window.scrollTo(0, 0);
  if (p === "set") refreshLogin();
}
document.querySelectorAll(".nav button").forEach(b => b.onclick = () => tab(b.dataset.p));
// ---- 白天 / 黑夜 ----
const darkMQ = window.matchMedia ? matchMedia("(prefers-color-scheme: dark)") : null;
function applyTheme() {
  const m = Store.get("vtn_theme") || "auto";
  const dark = m === "dark" || (m === "auto" && darkMQ && darkMQ.matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  $("themeChip").innerHTML = dark ? "&#9790; 黑夜" : "&#9728; 白天";
  document.querySelectorAll("#themeSeg button").forEach(b => b.classList.toggle("on", b.dataset.m === m));
}
function setTheme(m) { Store.set("vtn_theme", m); applyTheme(); }
$("themeChip").onclick = () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
document.querySelectorAll("#themeSeg button").forEach(b => b.onclick = () => setTheme(b.dataset.m));
if (darkMQ && darkMQ.addEventListener) darkMQ.addEventListener("change", applyTheme);
applyTheme();
// ---- 时间戳开关 ----
$("tsOn").checked = Store.get("vtn_ts") === "1";
function tsTip() { $("tsTip").textContent = $("tsOn").checked ? "开启：标题后带 [分:秒]，点一下跳到视频对应位置" : "关闭：笔记更干净，适合打印和复习"; }
$("tsOn").onchange = () => { Store.set("vtn_ts", $("tsOn").checked ? "1" : "0"); tsTip(); };
tsTip();
const stripTs = md => md.replace(/[ \t]*[\[（(]\s*\d{1,2}:\d{2}(?::\d{2})?\s*(?:[-~–—]\s*\d{1,2}:\d{2}(?::\d{2})?\s*)?[\]）)]/g, "");
const _mn = makeNotes;
makeNotes = async function (title, segs) {
  const md = await _mn(title, segs);
  return $("tsOn").checked ? md : stripTs(md);
};
// ---- 我的要求 ----
$("req").value = Store.get("vtn_req") || "";
let REQ_ON = Store.get("vtn_req_on") !== "0";
$("reqEn").checked = REQ_ON;
$("reqSw").addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); REQ_ON = !REQ_ON; $("reqEn").checked = REQ_ON; Store.set("vtn_req_on", REQ_ON ? "1" : "0"); reqMark(); });
function reqMark() { const has = !!$("req").value.trim(); $("reqOn").textContent = !has ? "" : (REQ_ON ? "已启用" : "未启用"); $("reqOn").className = REQ_ON ? "" : "no"; $("reqBox").classList.toggle("off", !REQ_ON); }
function reqSave() { Store.set("vtn_req", $("req").value); reqMark(); }
$("req").addEventListener("input", reqSave);
if ($("req").value.trim()) $("reqBox").open = true;
reqMark();
document.querySelectorAll("#pills button").forEach(b => b.onclick = () => {
  const t = b.textContent; const v = $("req").value;
  if (v.includes(t)) return;
  $("req").value = (v.trim() ? v.replace(/\s+$/, "") + "\n" : "") + t;
  reqSave();
});
$("reqClear").onclick = async () => { if (await window.__askOr("清空要求", "清空", "清空“我的要求”里的所有内容？", true)) { $("req").value = ""; reqSave(); } };
const _sp = sysPrompt;
sysPrompt = function () {
  const ts = $("tsOn").checked;
  let p = _sp();
  if (!ts) p = p.replace(/1）[^；]*时间[^；]*；/, "1）不要在笔记里标注任何时间戳或 [mm:ss] 形式的时间；") + "\n特别注意：字幕里的 [分:秒] 只是给你定位用的，笔记正文中一律不要出现时间。";
  const r = REQ_ON ? $("req").value.trim() : "";
  if (!r) return p;
  return p + "\n\n【用户的额外要求，请尽量满足】\n" + r +
    "\n（注意：额外要求不能违背“只根据字幕内容整理、不编造”" + (ts ? "和“标注时间戳”" : "") + "的规则；如果要求出自测题或补充例题，请明确标注“【补充】”，与视频原内容区分开。）";
};
// ---- 其它 ----
const _show = show;
show = function (item) { tab("gen"); $("hint").style.display = "none"; _show(item); };
const _run = run;
run = async function (s) { $("busy").style.display = "block"; try { await _run(s); } finally { $("busy").style.display = "none"; } };
$("goBtn").onclick = () => run(false);
$("subOnly").onclick = () => run(true);
document.querySelectorAll("#more .menu button").forEach(b => b.addEventListener("click", () => { $("more").open = false; }));
const _rl = refreshLogin;
refreshLogin = function () {
  _rl();
  const ok = HAS_NATIVE && Native.hasLogin();
  $("loginChip").textContent = ok ? "B站：已登录" : "B站：未登录";
  $("loginChip").classList.toggle("ok", ok);
};
$("loginChip").onclick = () => tab("set");
$("logoutBtn").onclick = () => { if (HAS_NATIVE) { Native.logout(); setTimeout(refreshLogin, 500); } };
document.addEventListener("visibilitychange", () => { if (!document.hidden) refreshLogin(); });
refreshLogin();
const _dh = drawHist;
drawHist = function () {
  _dh();
  const h = loadHist(); const box = $("hist");
  if (!h.length) { box.innerHTML = '<div class="empty">还没有笔记，去“生成”页做第一篇吧</div>'; return; }
  box.querySelectorAll(".hist").forEach((d, i) => {
    const it = h[i]; const s = d.querySelector("span");
    s.innerHTML = "";
    if (it.kind === "sub") { const t = document.createElement("i"); t.className = "tag"; t.textContent = "字幕"; s.appendChild(t); }
    s.appendChild(document.createTextNode(it.title));
    const sm = document.createElement("small"); sm.textContent = new Date(it.time).toLocaleString(); s.appendChild(sm);
    const bs = d.querySelectorAll("button"); bs[0].remove();
    bs[1].onclick = e => { e.stopPropagation(); if (window.__delNote) { window.__delNote(it); return; } const a = loadHist(); a.splice(i, 1); Store.set("vtn_hist", JSON.stringify(a)); drawHist(); };
    d.onclick = () => show(it);
  });
};
drawHist();
if (!S.key) tab("set");


