// ===== v1.3：截图识图 + 无字幕语音转写 =====
window.__nativeProg = (id, msg) => log(msg);
function ncall(fn) {
  const args = Array.prototype.slice.call(arguments, 1);
  return new Promise((res, rej) => {
    if (!HAS_NATIVE) { rej(new Error("请在安卓应用里运行")); return; }
    const id = "n" + (++seq);
    cbs[id] = r => r.error ? rej(new Error(r.error)) : res(r);
    Native[fn].apply(Native, [id].concat(args));
  });
}
const V3 = {
  shot: Store.get("vtn_shot") !== "0",
  gap: parseInt(Store.get("vtn_gap") || "60"),
  sf: Store.get("vtn_sf") || "",
  vm: Store.get("vtn_vm") || "Qwen/Qwen3-VL-32B-Instruct",
  vmode: Store.get("vtn_vmode") || "main"
};
(function () {
  const st = document.createElement("style");
  st.textContent = ".shot{margin:12px 0}.shot img{max-width:100%;border-radius:8px;border:1px solid var(--bd);display:block}.shot figcaption{font-size:13px;color:var(--mute);margin-top:4px}";
  document.head.appendChild(st);
  const box = document.createElement("div");
  box.className = "card";
  box.innerHTML =
    '<h2>截图识图 / 语音转写</h2>' +
    '<label style="display:flex;gap:8px;align-items:center;color:inherit"><input type="checkbox" id="shotOn" style="width:auto"> 截图笔记（读取 PPT 题目和板书，并把截图插进笔记）</label>' +
    '<label>保底截图间隔</label><select id="shotGap"><option value="30">每 30 秒</option><option value="60">每 60 秒（推荐）</option><option value="120">每 120 秒</option><option value="0">不保底，只在老师提到图/题时截</option></select>' +
    '<p class="mute">截图会让笔记更完整，但更慢、费用更高。每个视频最多保留约 30 张。</p>' +
    '<label>硅基流动 API Key（视频没有字幕时，用它把语音转成文字）</label>' +
    '<input id="sfKey" type="password" placeholder="sk-...">' +
    '<p class="mute" id="sfTip"></p>' +
    '<label>识图方式</label><select id="vmode"><option value="main">笔记模型直接看图（DeepSeek V4.1 Flash，推荐）</option><option value="sf">硅基流动千问 VL</option></select>' +
    '<p class="mute">选“笔记模型直接看图”时，如果模型不支持图片，会自动改用下面的千问 VL（需要填硅基流动 Key）。</p>' +
    '<label>备用识图模型（硅基流动，必须支持看图）</label><input id="vmName" placeholder="Qwen/Qwen3-VL-32B-Instruct">' +
    '<p class="mute">填了硅基流动 Key 时，截图交给这个模型识别；没填时用上面的大模型，它如果不支持看图，识图会全部失败。</p>';
  ($("pg-set") || document.body).appendChild(box);
  $("shotOn").checked = V3.shot;
  $("shotGap").value = String(V3.gap);
  $("sfKey").value = V3.sf;
  $("vmName").value = V3.vm;
  $("vmode").value = V3.vmode;
  $("vmode").onchange = () => { V3.vmode = $("vmode").value; Store.set("vtn_vmode", V3.vmode); MAIN_VFAIL = false; };
  $("vmName").oninput = () => { V3.vm = $("vmName").value.trim() || "Qwen/Qwen3-VL-32B-Instruct"; Store.set("vtn_vm", V3.vm); };
  const tip = () => { $("sfTip").textContent = V3.sf ? "已填写：没字幕的视频会自动转写" : "未填写：没字幕的视频无法生成笔记"; };
  tip();
  $("shotOn").onchange = () => { V3.shot = $("shotOn").checked; Store.set("vtn_shot", V3.shot ? "1" : "0"); };
  $("shotGap").onchange = () => { V3.gap = parseInt($("shotGap").value); Store.set("vtn_gap", String(V3.gap)); };
  $("sfKey").oninput = () => { V3.sf = $("sfKey").value.trim(); Store.set("vtn_sf", V3.sf); tip(); };
})();

const cleanAsr = s => String(s || "").replace(/<\|[^|]*\|>/g, "").replace(/\s+/g, " ").trim();

async function fetchSubs2(info) {
  log("正在读取视频信息…");
  const view = await bget("https://api.bilibili.com/x/web-interface/view?" + (info.bv ? "bvid=" + info.bv : "aid=" + info.av));
  const pages = view.pages || [];
  const pIdx = (parseInt($("pnum").value) || info.p || 1);
  const page = pages[pIdx - 1] || pages[0];
  let title = view.title;
  if (pages.length > 1) title += " P" + page.page + " " + page.part;
  log("视频：" + title);
  const v = { title, bvid: view.bvid, p: page.page, cid: page.cid, dur: page.duration || view.duration || 0, asr: false, segs: [] };
  log("正在查找字幕…");
  const q = await signed({ bvid: view.bvid, cid: page.cid });
  const player = await bget("https://api.bilibili.com/x/player/wbi/v2?" + q);
  const list = (player.subtitle && player.subtitle.subtitles) || [];
  const logged = HAS_NATIVE && Native.hasLogin();
  if (list.length) {
    const pick = list.find(s => /^zh/.test(s.lan)) || list.find(s => /^ai-zh/.test(s.lan)) || list[0];
    let surl = pick.subtitle_url; if (surl.startsWith("//")) surl = "https:" + surl;
    log("使用字幕：" + (pick.lan_doc || pick.lan));
    const r = await http("GET", surl, BH);
    const body = JSON.parse(r.body).body || [];
    v.segs = body.map(x => ({ from: x.from, to: x.to, text: x.content }));
    if (v.segs.length) return v;
  }
  if (!V3.sf) {
    if (!logged) throw new Error("没有拿到字幕。B站的 AI 字幕一般要登录后才给，请先登录B站；或者在“设置”里填写硅基流动 Key，用语音识别。");
    throw new Error("这个视频没有字幕。请在“设置”里填写硅基流动 API Key，App 会自动把语音转成文字。");
  }
  if (!logged) log("提示：登录B站后，很多视频有现成的 AI 字幕，比语音识别更快。");
  log("没有字幕，改用语音识别（硅基流动 SenseVoice）…");
  const q2 = await signed({ bvid: view.bvid, cid: page.cid, fnval: 16, fourk: 0 });
  const pd = await bget("https://api.bilibili.com/x/player/wbi/playurl?" + q2);
  const au = ((pd.dash && pd.dash.audio) || []).slice().sort((a, b) => a.bandwidth - b.bandwidth)[0];
  if (!au) throw new Error("拿不到这个视频的音频");
  const r = await ncall("transcribe", au.baseUrl || au.base_url, V3.sf, "FunAudioLLM/SenseVoiceSmall", 60);
  v.segs = (r.segs || []).map(x => ({ from: x.from, to: x.to, text: cleanAsr(x.text) })).filter(x => x.text);
  if (!v.segs.length) throw new Error("语音识别没有得到文字（视频可能没有人声）");
  v.asr = true;
  return v;
}

const KW = /如图|看(一下|这)?[个张幅道]?图|这(道|个|一)题|题目|我们(来|先)?(写|算|列|画|看)|写(一下|出来)|列(式|方程)|受力|示意图|电路|板书|画(一下|个|出)|推导|结构(式|简式)|方程式|装置|曲线|图像/;
function pickTimes(segs, dur) {
  const end = dur || (segs.length ? segs[segs.length - 1].to : 0);
  let ts = [];
  for (const s of segs) if (KW.test(s.text)) ts.push(Math.min(s.to + 4, Math.max(0, end - 1)));
  if (V3.gap > 0) for (let t = V3.gap / 2; t < end; t += V3.gap) ts.push(t);
  ts.sort((a, b) => a - b);
  const out = [];
  for (const t of ts) if (!out.length || t - out[out.length - 1] >= 8) out.push(Math.round(t));
  return thin(out, 60);
}
function thin(a, n) { if (a.length <= n) return a; const r = []; for (let i = 0; i < n; i++) r.push(a[Math.floor(i * a.length / n)]); return r; }
function thumbDiff(a, b) {
  if (!a || !b || a.length !== b.length) return 999;
  let s = 0; const n = a.length / 2;
  for (let i = 0; i < n; i++) s += Math.abs(parseInt(a.substr(2 * i, 2), 16) - parseInt(b.substr(2 * i, 2), 16));
  return s / n;
}
async function videoUrl(bvid, cid) {
  const tries = [
    async () => bget("https://api.bilibili.com/x/player/wbi/playurl?" + await signed({ bvid, cid, qn: 80, fnval: 1, platform: "html5", high_quality: 1 })),
    async () => bget("https://api.bilibili.com/x/player/playurl?bvid=" + bvid + "&cid=" + cid + "&qn=80&fnval=1&platform=html5&high_quality=1")
  ];
  let err = null;
  for (const f of tries) {
    try { const d = await f(); const u = d.durl && d.durl[0] && d.durl[0].url; if (u) return u; } catch (e) { err = e; }
  }
  throw err || new Error("拿不到视频画面地址");
}
async function getFrames(v) {
  const times = pickTimes(v.segs, v.dur);
  if (!times.length) return [];
  log("准备截图 " + times.length + " 处（视频越长越慢，请耐心等）…");
  const url = await videoUrl(v.bvid, v.cid);
  const r = await ncall("grabFrames", url, JSON.stringify(times), v.bvid + "_p" + v.p + "_" + (Date.now() % 1000000));
  const kept = []; let delCnt = 0;
  for (const f of (r.frames || [])) {
    const last = kept[kept.length - 1];
    if (last && thumbDiff(last.thumb, f.thumb) < 3.5) {
      if (last.clean && last.name !== last.clean) { try { if (HAS_NATIVE && Native.imgDel) Native.imgDel(last.name); } catch (e) { __err(e, "L546") } delCnt++; }
      kept[kept.length - 1] = Object.assign({}, f, { t: last.t, clean: last.clean || last.name, cnt: (last.cnt || 1) + 1 });
    }
    else kept.push(f);
  }
  const res = thin(kept, 30);
  if (HAS_NATIVE && Native.imgDel) kept.filter(k => !res.includes(k)).forEach(k => { try { Native.imgDel(k.name); if (k.clean) Native.imgDel(k.clean); } catch (e) { __err(e, "L552") } delCnt++; });
  log("截图去重后剩 " + res.length + " 张" + (delCnt ? "，已删除 " + delCnt + " 张同页中间截图" : ""));
  return res;
}
const VPROMPT = "你会看到一节高中网课视频中按时间顺序截取的几张画面，多为 PPT（展示题目）或手写板书（展示解题过程）。请逐张识别，只输出一个 JSON 数组，不要任何其他文字，格式：[{\"n\":编号,\"type\":\"题目\"或\"板书\"或\"图表\"或\"无关\",\"content\":\"识别内容\"}]。规则：题目——完整抄录题干、选项和题图中的已知条件；板书——按书写顺序写出推导步骤；图表——描述图中的物理/化学/生物要素（受力、电路连接、实验装置、结构式、曲线走势等）；只有人像、片头片尾、空白或完全看不清的画面标为“无关”，content 留空。公式一律用 LaTeX，行内用 $...$。看不清的字写“[看不清]”，不要猜。图中没有标出的数值不要估读，写“未标出”；不要自己推断产物或答案，只抄录画面上真实写着的内容（包括手写批注，注明“手写”）。";
function parseJsonArr(txt) {
  const t = String(txt || "").replace(/```(?:json)?/gi, "");
  const m = t.match(/\[[\s\S]*\]/);
  if (!m) return [];
  const norm = a => Array.isArray(a) ? a.map(o => Object.assign({}, o, {
    n: parseInt(String(o.n == null ? "" : o.n).replace(/\D/g, "")) || null,
    content: String(o.content || "").replace(/\\n(?![a-zA-Z])/g, "\n")
  })) : [];
  try { return norm(JSON.parse(m[0])); } catch (e) { __err(e, "L565") }
  const fix = m[0].replace(/\\(["\\\/])|\\/g, (x, c) => c ? x : "\\\\");
  try { return norm(JSON.parse(fix)); } catch (e) { __err(e, "L567") }
  const out = [], re = /\{[^{}]*\}/g; let g;
  while ((g = re.exec(fix))) { try { out.push(JSON.parse(g[0])); } catch (e) { __err(e, "L569") } }
  return norm(out);
}
const VM_LIST = ["Qwen/Qwen3-VL-32B-Instruct", "Qwen/Qwen3-VL-30B-A3B-Instruct", "Qwen/Qwen3-VL-8B-Instruct"];
let VM_OK = null, VFAIL = null, MAIN_VFAIL = false;
async function vcall(model, content) {
  const r = await http("POST", "https://api.siliconflow.cn/v1/chat/completions",
    { "Content-Type": "application/json", "Authorization": "Bearer " + V3.sf },
    JSON.stringify({ model, messages: [{ role: "user", content }], temperature: 0.2 }));
  let j = null; try { j = JSON.parse(r.body); } catch (e) { __err(e, "L578") }
  if (r.status === 200 && j && j.choices) return { ok: true, txt: j.choices[0].message.content };
  const m = (j && (j.message || (j.error && j.error.message))) || String(r.body || "").slice(0, 200);
  return { ok: false, status: r.status, m, bad: /disabled|not exist|does not exist|not found|invalid model/i.test(m) || r.status === 404 };
}
async function vchat(content) {
  if (V3.vmode !== "sf" || !V3.sf) {
    if (!MAIN_VFAIL) {
      try { return await chat([{ role: "user", content }]); }
      catch (e) {
        if (!V3.sf || /401|402|余额|Key/.test(e.message)) throw e;
        MAIN_VFAIL = true; log("笔记模型看图失败（" + e.message.slice(0, 80) + "），本次改用硅基流动千问 VL", "o");
      }
    } else if (!V3.sf) throw new Error("笔记模型不支持看图，且没有填硅基流动 Key");
  }
  if (VFAIL) throw VFAIL;
  const tries = [VM_OK || V3.vm].concat(VM_LIST).filter((x, i, a) => x && a.indexOf(x) === i);
  let last = null;
  for (const model of tries) {
    const r = await vcall(model, content);
    if (r.ok) {
      if (model !== V3.vm && VM_OK !== model) log("识图模型 " + V3.vm + " 不可用，已自动改用 " + model, "o");
      VM_OK = model; return r.txt;
    }
    last = r;
    if (!r.bad) break;
    log("识图模型 " + model + " 不可用（" + r.m + "），换下一个试试");
  }
  const tip = { 401: "硅基流动 Key 不对", 402: "硅基流动余额不足", 403: "硅基流动拒绝请求", 429: "识图请求太频繁" }[last.status] || "识图模型请求失败";
  const err = new Error(tip + "（状态码 " + last.status + "）：" + last.m + "。可在设置里换一个带 VL 的识图模型");
  if (last.bad || last.status === 401 || last.status === 402) VFAIL = err;
  throw err;
}
async function readFrames(frames) {
  const starts = []; for (let i = 0; i < frames.length; i += 4) starts.push(i);
  await pool(3, starts, async i => {
    const b = frames.slice(i, i + 4);
    log("识图 " + (i + 1) + "-" + (i + b.length) + " / " + frames.length + " …");
    const content = [{ type: "text", text: VPROMPT + "\n本批图片编号依次为：" + b.map((f, j) => "图" + (i + j + 1)).join("、") }];
    b.forEach(f => content.push({ type: "image_url", image_url: { url: "data:image/jpeg;base64," + Native.readB64(f.name) } }));
    let txt;
    try { txt = await vchat(content); }
    catch (e) { if (i === 0) throw e; log("这一批识图失败，跳过：" + e.message, "e"); return; }
    const arr = parseJsonArr(txt);
    if (!arr.length) log("识图 " + (i + 1) + "-" + (i + b.length) + " 没返回可用结果，模型回复开头：" + String(txt || "").replace(/\s+/g, " ").slice(0, 80), "e");
    b.forEach((f, j) => {
      const n = i + j + 1;
      const o = arr.find(x => Number(x.n) === n) || arr[j] || {};
      f.n = n; f.type = String(o.type || "其他"); f.content = String(o.content || "").trim();
    });
  });
  return frames.filter(f => f.n && f.type !== "无关");
}
let FRAME_MODE = false;
const _sp3 = sysPrompt;
sysPrompt = function () {
  const p = _sp3();
  if (!FRAME_MODE) return p;
  return p + "\n\n【关于截图】字幕中“【图N】（类型）内容”的部分，是该时刻视频画面的识别结果（PPT 题目或板书推导），比口头讲解更准确，也算作视频内容。请：1）把题目完整写进笔记，把板书推导整理成清晰的解题步骤；2）公式用 LaTeX，行内用 $...$，独立公式用 $$...$$；识别结果里的 Unicode 下标（如 CO₂）请改写为 $\\mathrm{CO_2}$；同一页课件被识别多次时只按一次处理；3）在笔记中最合适的位置单独起一行，原样写出【图N】，每张图最多出现一次，App 会把它换成截图。";
};
function insertImages(md, frames) {
  const used = new Set();
  md = md.replace(/【图(\d+)】/g, (m, n) => {
    const f = frames.find(x => String(x.n) === n);
    if (!f || used.has(n)) return "";
    used.add(n);
    return "\n\n![图" + n + "](img/" + (f.clean || f.name) + ")\n\n";
  });
  const rest = frames.filter(f => (!used.has(String(f.n)) || f.clean) && (f.type === "题目" || f.type === "板书" || f.type === "图表"));
  if (rest.length) md += "\n\n## 其余课堂截图\n\n" + rest.map(f => "![图" + f.n + (f.clean && used.has(String(f.n)) ? "（批注最全）" : "（" + (f.type === "板书" ? "截图" : f.type) + "）") + "](img/" + f.name + ")").join("\n\n");
  return md.replace(/\n{3,}/g, "\n\n");
}
const _render3 = render;
render = function (md) {
  const dir = HAS_NATIVE ? Native.filesDir() : "";
  return _render3(md).replace(/<p>!\[([^\]]*)\]\((img\/[^)\s]+)\)<\/p>/g,
    (m, alt, src) => '<figure class="shot"><img src="file://' + dir + '/' + src + '" alt="' + alt + '" loading="lazy"><figcaption>' + alt + '</figcaption></figure>');
};
const _save3 = $("bSave").onclick;
$("bSave").onclick = () => {
  const md = $("source").value; const names = [];
  md.replace(/\]\(img\/([^)\s]+)\)/g, (m, n) => { names.push(n); return m; });
  if (names.length && HAS_NATIVE) Native.exportImages(JSON.stringify(names));
  if (_save3) _save3();
};
async function runV3(subOnly) {
  $("log").innerHTML = "";
  $("goBtn").disabled = $("subOnly").disabled = true;
  try {
    const info = await parseInput($("input").value.trim());
    const v = await fetchSubs2(info);
    log("文字稿共 " + v.segs.length + " 段" + (v.asr ? "（语音识别）" : ""), "o");
    const srt = toSrt(v.segs);
    let md, frames = [];
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
      const segsAll = FRAME_MODE
        ? v.segs.concat(frames.map(f => ({ from: f.t, to: f.t, text: "【图" + f.n + "】（" + f.type + "）" + f.content.replace(/\s*\n\s*/g, " / ") }))).sort((a, b) => a.from - b.from)
        : v.segs;
      try { md = await makeNotes(v.title, segsAll); } finally { FRAME_MODE = false; }
      if (frames.length) md = insertImages(md, frames);
      if (!/^#\s/.test(md.trim())) md = "# " + v.title + "\n\n" + md;
      md += "\n\n---\n来源：https://www.bilibili.com/video/" + v.bvid + "?p=" + v.p + "\n";
    }
    const item = { title: v.title, bvid: v.bvid, p: v.p, md, srt, kind: subOnly ? "sub" : "note", time: Date.now(), imgs: frames.map(f => f.name) };
    try { const gt = window.__genTag && window.__genTag(); if (gt && !item.tag) item.tag = gt; } catch (e) { __err(e, "L691") } saveHist(item); try { if (!item.tag && item.kind !== "sub" && window.__autoTag) window.__autoTag(item); } catch (e) { __err(e, "L691") } show(item); try { window.__doneNotify && window.__doneNotify(item); } catch (e) { __err(e, "L691") }
    log("完成！", "o");
  } catch (e) {
    log("出错了：" + e.message, "e");
  } finally {
    $("goBtn").disabled = $("subOnly").disabled = false;
  }
}
run = async function (s) { $("busy").style.display = "block"; try { await runV3(s); } finally { $("busy").style.display = "none"; } };
$("goBtn").onclick = () => run(false);
$("subOnly").onclick = () => run(true);
