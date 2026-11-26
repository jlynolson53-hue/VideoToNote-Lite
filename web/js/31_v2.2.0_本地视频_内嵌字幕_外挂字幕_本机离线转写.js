// v2.2.0：本地视频（内嵌字幕 / 外挂字幕 / 本机离线转写）
(function () {
  if (!HAS_NATIVE || !Native.pickVideo) return;
  const L = window.__LV = { cur: null, sub: null, asr: false };
  const st = document.createElement("style");
  st.textContent = "#pvBar{height:6px;border-radius:3px;background:var(--fn-line);overflow:hidden;margin:10px 0 4px}#pvBar i{display:block;height:100%;background:var(--on-surface);border-radius:3px;transition:width .6s ease}#lvBox{margin:8px 0 4px}#lvBox .lvRow{display:flex;gap:8px;flex-wrap:wrap}#lvBox .chip5{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:18px;cursor:pointer}#lvBox .chip5 .ic{font-size:18px}#lvInfo{margin-top:8px;font-size:13px;line-height:1.7}#lvInfo b{color:var(--on-surface)}#lvInfo a{color:var(--on-surface);text-decoration:underline}";
  document.head.appendChild(st);
  const fr = document.querySelector("#genCard .frow"); if (!fr) return;
  const box = document.createElement("div"); box.id = "lvBox";
  box.innerHTML = '<div class="lvRow"><button class="chip5" id="lvPick"><i class="ic">video_file</i>选择本地视频</button><button class="chip5" id="lvSub" style="display:none"><i class="ic">subtitles</i>外挂字幕</button><button class="chip5" id="lvClr" style="display:none"><i class="ic">close</i>改用 B 站链接</button></div><div class="mute" id="lvInfo"></div>';
  fr.after(box);
  const info = $("lvInfo"), inp = $("input"), ph = inp ? inp.placeholder : "";
  const mst = () => { try { return JSON.parse(Native.asrStatus()); } catch (e) { return {}; } };
  const fmt = s => { s = Math.round(s || 0); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
  function paint() {
    const c = L.cur;
    $("lvSub").style.display = $("lvClr").style.display = c ? "" : "none";
    if (!c) { info.innerHTML = ""; return; }
    let src;
    if (L.sub) src = "外挂字幕 " + esc(L.sub.name) + "（" + L.sub.segs.length + " 条）";
    else if (c.subs && c.subs.length) src = "视频内嵌字幕（" + esc(c.subs[0].lang || c.subs[0].mime) + "）";
    else { const m = mst(); src = m.ok ? "本机离线语音转写（SenseVoice，不耗额度）　<a href='#' id='lvImp'>重新导入模型</a>" : "本机语音转写，<b>还没导入模型</b>　<a href='#' id='lvImp'>导入模型文件</a><br>一次选中 model.int8.onnx、tokens.txt、silero_vad.onnx 三个文件（在 Download/DSH-Go/models 里）"; }
    info.innerHTML = "<b>" + esc(c.name) + "</b>　" + fmt(c.dur) + (c.audio === false ? "　（没有音轨）" : "") + "<br>文字来源：" + src;
    const a = $("lvImp"); if (a) a.onclick = e => { e.preventDefault(); imp(); };
  }
  async function imp() {
    try {
      snack("请一次选中 model.int8.onnx、tokens.txt、silero_vad.onnx");
      const r = await ncall("asrImport"); if (r.cancel) return;
      const miss = []; if (!r.model) miss.push("model.int8.onnx"); if (!r.tokens) miss.push("tokens.txt"); if (!r.vad) miss.push("silero_vad.onnx");
      snack(r.ok ? "模型已导入，可以离线转写了" : "还缺：" + miss.join("、")); paint();
    } catch (e) { snack("导入失败：" + e.message); }
  }
  $("lvPick").onclick = async () => {
    try {
      const r = await ncall("pickVideo"); if (r.cancel) return;
      L.cur = { uri: r.uri, name: r.name || "本地视频", dur: r.dur || 0, subs: r.subs || [], audio: r.audio, bv: "LV" + (Date.now() % 100000000) };
      L.sub = null; if (inp) { inp.value = "本地视频：" + L.cur.name; inp.readOnly = true; }
      paint();
    } catch (e) { snack(e.message); }
  };
  $("lvSub").onclick = async () => {
    try {
      const r = await ncall("pickSub"); if (r.cancel) return;
      const segs = parseSub(r.text || "");
      if (!segs.length) { snack("没认出字幕格式（支持 srt / vtt / ass）"); return; }
      L.sub = { name: r.name || "字幕", segs }; paint();
    } catch (e) { snack(e.message); }
  };
  $("lvClr").onclick = () => { L.cur = null; L.sub = null; if (inp) { inp.value = ""; inp.readOnly = false; inp.placeholder = ph; } paint(); };
  ["goBtn", "subOnly"].forEach(id => { const b = $(id); if (b) b.addEventListener("click", () => { if (L.cur && inp && !inp.value.trim()) inp.value = "本地视频：" + L.cur.name; }, true); });
  try { const m = mst(); if (m.ok) log("本机转写模型已就绪（已保存在 App 内，无需重复导入）"); } catch (e) { __err(e, "L2982") }
  function parseSub(t) {
    t = String(t).replace(/^\uFEFF/, "").replace(/\r/g, "");
    const segs = [];
    const ts = x => { const m = String(x || "").trim().match(/(?:(\d+):)?(\d{1,2}):(\d{2})[.,](\d{1,3})/); return m ? (+(m[1] || 0)) * 3600 + (+m[2]) * 60 + (+m[3]) + (+("0." + m[4])) : NaN; };
    if (/\[Events\]/i.test(t)) {
      t.split("\n").forEach(l => {
        if (!/^Dialogue:/i.test(l)) return;
        const p = l.slice(9).split(","); if (p.length < 10) return;
        const tx = p.slice(9).join(",").replace(/\{[^}]*\}/g, "").replace(/\\N/gi, " ").trim();
        const a = ts(p[1]), b = ts(p[2]);
        if (tx && !isNaN(a)) segs.push({ from: a, to: isNaN(b) ? a + 3 : b, text: tx });
      });
    } else {
      t.split(/\n\s*\n/).forEach(bl => {
        const ls = bl.split("\n").filter(x => x.trim()); const i = ls.findIndex(x => x.includes("-->")); if (i < 0) return;
        const pr = ls[i].split("-->"); const tx = ls.slice(i + 1).join(" ").replace(/<[^>]+>/g, "").replace(/\{[^}]*\}/g, "").trim();
        const a = ts(pr[0]), b = ts(pr[1]);
        if (tx && !isNaN(a)) segs.push({ from: a, to: isNaN(b) ? a + 3 : b, text: tx });
      });
    }
    segs.sort((x, y) => x.from - y.from);
    return segs.filter((x, i) => !i || x.text !== segs[i - 1].text);
  }
  async function localV() {
    const c = L.cur; L.asr = false;
    const v = { title: c.name.replace(/\.[^.]+$/, ""), bvid: c.bv, p: 1, cid: 0, dur: c.dur || 0, asr: false, segs: [] };
    log("本地视频：" + c.name);
    if (L.sub) { v.segs = L.sub.segs.slice(); log("使用外挂字幕：" + L.sub.name); }
    else if (c.subs && c.subs.length) {
      log("读取内嵌字幕…");
      try { const r = await ncall("readEmbSub", c.uri, c.subs[0].i); v.segs = r.segs || []; log("内嵌字幕 " + v.segs.length + " 条"); }
      catch (e) { log("内嵌字幕读取失败，改用本机转写：" + e.message); }
    }
    if (!v.segs.length) {
      if (!mst().ok) throw new Error("这个视频没有字幕，需要本机语音转写，但还没导入模型。请在“选择本地视频”下方点“导入模型文件”。");
      log("开始本机离线转写（SenseVoice），不消耗额度…");
      const t0 = Date.now();
      const r = await ncall("asrLocal", c.uri);
      v.segs = (r.segs || []).filter(x => x.text);
      if (!v.segs.length) throw new Error("没有识别出文字（视频可能没有人声）");
      v.asr = true; L.asr = true;
      log("转写完成：" + v.segs.length + " 段，用时 " + Math.round((Date.now() - t0) / 1000) + " 秒", "o");
    }
    if (!v.dur && v.segs.length) v.dur = v.segs[v.segs.length - 1].to;
    return v;
  }
  const _pi = parseInput; parseInput = async function (t) { if (L.cur) return { local: true, p: 1 }; return _pi.apply(this, arguments); };
  const _fs = fetchSubs; fetchSubs = async function (info) { if (info && info.local && L.cur) return localV(); return _fs.apply(this, arguments); };
  if (typeof fetchSubs2 === "function") { const _f2 = fetchSubs2; fetchSubs2 = async function (info) { if (info && info.local && L.cur) return localV(); return _f2.apply(this, arguments); }; }
  const _vu = videoUrl; videoUrl = async function (b) { if (L.cur && b === L.cur.bv) return L.cur.uri; return _vu.apply(this, arguments); };
  const _sh = saveHist; saveHist = function (item) {
    try { if (item && L.cur && item.bvid === L.cur.bv) { item.local = L.cur.uri; item.md = String(item.md || "").replace(/来源：https:\/\/www\.bilibili\.com\/video\/LV\d+\?p=\d+/g, "来源：本地视频《" + L.cur.name + "》"); } } catch (e) { __err(e, "L3034") }
    return _sh.apply(this, arguments);
  };
  const _mn = makeNotes; makeNotes = async function (title, segs) {
    if (L.cur && L.asr && segs && segs.length) segs = [{ from: segs[0].from, to: segs[0].from, text: "【说明：以下是本机语音识别的转写稿，可能有同音错字，请结合高中数学、物理、化学、生物术语自动纠正，不要照抄错字】" }].concat(segs);
    return _mn.call(this, title, segs);
  };
  document.addEventListener("click", e => {
    const a = e.target.closest && e.target.closest("#preview a.ts,#preview .shot figcaption.tsj"); if (!a) return;
    try { if (current && current.bvid && /^LV/.test(current.bvid)) { e.preventDefault(); e.stopPropagation(); snack("本地视频的时间跳转下个版本支持"); } } catch (x) { __err(x, "L3043") }
  }, true);
})();

