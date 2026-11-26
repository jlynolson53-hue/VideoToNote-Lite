// ===== v1.5.5：断点续跑 =====
let PENDING_ST = null;
const _chatC = chat;
chat = async function (messages, opts) {
  if (!TASK || !HAS_NATIVE) return await _chatC(messages, opts);
  const key = "c_" + Native.md5(JSON.stringify(messages)) + ".txt";
  const hit = Native.taskRead(TASK.id, key);
  if (hit) return hit;
  const r = await _chatC(messages, opts);
  Native.taskWrite(TASK.id, key, r);
  return r;
};
function saveSt(st, step) { st.step = step; tWrite("state.json", st); }
function applySt(st) {
  $("input").value = st.input || ""; $("pnum").value = st.p || ""; $("style").value = st.style || "study";
  $("tsOn").checked = !!st.ts; $("req").value = st.req || ""; REQ_ON = st.reqOn !== false; $("reqEn").checked = REQ_ON; reqMark();
  V3.shot = !!st.shot;
}
async function runTask(subOnly) {
  $("log").innerHTML = "";
  $("goBtn").disabled = $("subOnly").disabled = true;
  if ($("resumeBox")) $("resumeBox").style.display = "none";
  let st = PENDING_ST; PENDING_ST = null; VFAIL = null;
  try {
    if (st) { applySt(st); subOnly = !!st.sub; TASK = st; log("继续上次没完成的任务：" + (st.title || st.input), "o"); }
    else {
      st = { id: String(Date.now()), input: $("input").value.trim(), p: $("pnum").value, style: $("style").value, ts: $("tsOn").checked,
        req: $("req").value, reqOn: REQ_ON, shot: !!V3.shot, sub: !!subOnly, step: "取字幕", start: Date.now(), title: "" };
      TASK = st;
    }
    saveSt(st, "取字幕");
    let v = tRead("subs.json");
    if (v) log("已跳过取字幕（用上次保存的结果）", "o");
    else { const info = await parseInput(st.input); v = await fetchSubs2(info); tWrite("subs.json", v); }
    st.title = v.title;
    log("文字稿共 " + v.segs.length + " 段" + (v.asr ? "（语音识别）" : ""), "o");
    const srt = toSrt(v.segs);
    const time = Date.now();
    let md, frames = [], sys = "";
    CAP = [];
    if (subOnly) md = "# " + v.title + "【字幕】\n\n" + toLines(v.segs).join("\n\n");
    else {
      if (V3.shot) {
        try {
          saveSt(st, "截图");
          let fr = tRead("frames.json");
          if (fr && fr.every(f => Native.imgExists(f.name))) log("已跳过截图（用上次保存的结果）", "o");
          else { fr = await getFrames(v); tWrite("frames.json", fr); }
          saveSt(st, "识图");
          const rd = tRead("frames_read.json");
          if (rd) { frames = rd; log("已跳过识图（用上次保存的结果）", "o"); }
          else { frames = fr.length ? await readFrames(fr) : []; tWrite("frames_read.json", frames); }
          log("有效截图 " + frames.length + " 张", "o");
        } catch (e) { if (/余额|API Key|状态码 40[12]/.test(e.message)) throw e; log("截图/识图没成功，先生成纯文字笔记：" + e.message, "e"); frames = []; }
      }
      saveSt(st, "写笔记");
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
        title: v.title, bvid: v.bvid, p: v.p, asr: !!v.asr, style: st.style, req: st.reqOn !== false ? String(st.req || "").trim() : "", ts: !!st.ts,
        sys, segs: v.segs.map(s => ({ from: s.from, to: s.to, text: s.text })),
        frames: frames.map(f => ({ n: f.n, t: f.t, type: f.type, content: f.content, name: f.name })),
        calls: CAP, vers: [{ md, note: "首次生成", time }], cur: 0
      });
    }
    try { const gt = window.__genTag && window.__genTag(); if (gt && !item.tag) item.tag = gt; } catch (e) { __err(e, "L945") } saveHist(item); try { if (!item.tag && item.kind !== "sub" && window.__autoTag) window.__autoTag(item); } catch (e) { __err(e, "L945") } show(item); try { window.__doneNotify && window.__doneNotify(item); } catch (e) { __err(e, "L945") }
    if (HAS_NATIVE) Native.taskDel(st.id);
    log("完成！", "o");
  } catch (e) {
    log("出错了：" + e.message, "e");
    if (TASK) { tWrite("state.json", st); log("进度已保存，处理好问题后可以点“继续生成”接着做", "o"); }
  } finally {
    CAP = null; TASK = null;
    $("goBtn").disabled = $("subOnly").disabled = false;
    showResume();
  }
}
function showResume() {
  if (!HAS_NATIVE || window.__busy) return;
  let ids = []; try { ids = JSON.parse(Native.taskList() || "[]"); } catch (e) { __err(e, "L959") }
  let st = null;
  for (const id of ids) {
    let x = null; try { x = JSON.parse(Native.taskRead(id, "state.json") || "null"); } catch (e) { __err(e, "L962") }
    if (!x) { Native.taskDel(id); continue; }
    if (!st || Number(x.id) > Number(st.id)) st = x;
  }
  let box = $("resumeBox");
  if (!st) { if (box) box.style.display = "none"; return; }
  if (!box) { box = document.createElement("div"); box.id = "resumeBox"; box.className = "req"; $("genCard").insertBefore(box, $("genCard").firstChild); }
  box.style.display = "block";
  box.innerHTML = "<p style='margin:12px 0 4px'><b>上次的笔记没生成完</b></p><div class='mute'></div>" +
    "<div style='margin:8px 0 12px'><button id='rsGo'>继续生成</button> <button class='sec' id='rsDrop'>放弃</button></div>";
  box.querySelector(".mute").textContent = (st.title || st.input || "未命名视频") + " · 停在：" + (st.step || "开始");
  $("rsGo").onclick = () => { PENDING_ST = st; run(!!st.sub); };
  $("rsDrop").onclick = async () => { if (await window.__askOr("放弃任务", "放弃", "已保存的进度会被删除。", true)) { Native.taskDel(st.id); showResume(); } };
}
run = async function (s) { $("busy").style.display = "block"; try { await runTask(s); } finally { $("busy").style.display = "none"; } };
$("goBtn").onclick = () => run(false);
$("subOnly").onclick = () => run(true);

(function () {
  const bar = document.createElement("div");
  bar.id = "v4bar";
  bar.innerHTML =
    '<div class="v4bar"><select id="v4ver"></select><button id="v4in" class="ghost">AI 输入</button></div>' +
    '<div id="v4note" style="display:none"></div>' +
    '<details id="v4rev"><summary>不满意？写修改意见让 AI 重写</summary>' +
    '<textarea id="v4txt" rows="3" placeholder="例如：第二题的受力分析写得更详细；公式全部单独成行；删掉和题目无关的闲聊"></textarea>' +
    '<button id="v4go">按意见重写（不重新截图、不重新取字幕）</button><p class="mute" id="v4msg"></p></details>' +
    '<p class="mute" id="v4old" style="display:none">这篇是旧版本生成的，没有保存材料，不能查看 AI 输入或修改。</p>';
  $("resTitle").after(bar);
  const pg = document.createElement("div"); pg.id = "v4page"; document.body.appendChild(pg);
})();
let MAT = null;
function drawNote() {
  const v = MAT && MAT.vers[MAT.cur || 0];
  const show1 = v && (MAT.cur || 0) > 0;
  $("v4note").style.display = show1 ? "block" : "none";
  if (show1) $("v4note").textContent = "第 " + (MAT.cur + 1) + " 版的修改意见：\n" + v.note;
}
function drawBar(item) {
  MAT = loadMat(item);
  const has = !!MAT;
  $("v4ver").parentNode.style.display = has ? "flex" : "none";
  $("v4rev").style.display = has ? "block" : "none";
  $("v4old").style.display = (!has && item.kind !== "sub") ? "block" : "none";
  if (!has) { $("v4note").style.display = "none"; return; }
  $("v4ver").innerHTML = MAT.vers.map((x, i) => '<option value="' + i + '">第 ' + (i + 1) + ' 版：' + esc(x.note.replace(/\s+/g, " ").slice(0, 12)) + (x.note.length > 12 ? "…" : "") + '</option>').join("");
  $("v4ver").value = String(MAT.cur || 0);
  drawNote();
}
const _show4 = show;
show = function (item) { _show4(item); drawBar(item); };
$("v4ver").onchange = () => {
  if (!MAT || !current) return;
  MAT.cur = parseInt($("v4ver").value);
  current.md = MAT.vers[MAT.cur].md;
  $("source").value = current.md; $("preview").innerHTML = render(current.md);
  saveMat(current.mat, MAT); updHist(current); drawNote();
};
$("v4in").onclick = () => {
  if (!MAT) return;
  const dir = HAS_NATIVE ? Native.filesDir() : "";
  const pre = s => "<pre>" + esc(String(s || "（无）")) + "</pre>";
  let h = '<div class="v4top"><b>本次提供给 AI 的材料</b><button id="v4fb">一键复制反馈</button><button id="v4close">返回</button></div>';
  h += "<h3>基本信息</h3>" + pre("标题：" + MAT.title + "\n来源：" + MAT.bvid + " P" + MAT.p + "\n文字稿：" + (MAT.asr ? "语音识别" : "B站字幕") + "，" + MAT.segs.length + " 段\n截图：" + MAT.frames.length + " 张\n笔记风格：" + MAT.style + "\n时间戳：" + (MAT.ts ? "开" : "关"));
  h += "<h3>我的要求</h3>" + pre(MAT.req);
  h += "<h3>各版本的修改意见</h3>" + pre(MAT.vers.map((x, i) => "第 " + (i + 1) + " 版：" + x.note).join("\n\n"));
  h += "<h3>System Prompt（给 AI 的规则）</h3>" + pre(MAT.sys);
  h += "<h3>截图和识图结果（" + MAT.frames.length + " 张）</h3>";
  MAT.frames.forEach(f => {
    const t = Math.floor(f.t / 60) + ":" + String(Math.floor(f.t % 60)).padStart(2, "0");
    h += "<p><b>图" + f.n + "</b> · " + esc(f.type) + " · " + t + '</p><img loading="lazy" src="file://' + dir + "/img/" + f.name + '">' + pre(f.content);
  });
  h += "<details><summary><b>文字稿全文（含截图插入位置）</b></summary>" + pre(framesText(MAT.segs, MAT.frames)) + "</details>";
  h += "<details><summary><b>实际发送的请求记录（" + (MAT.calls || []).length + " 次）</b></summary>";
  (MAT.calls || []).forEach((c, i) => { h += "<p><b>第 " + (i + 1) + " 次</b></p>" + c.map(m => "<p class='mute'>" + m.role + "</p>" + pre(m.content.length > 20000 ? m.content.slice(0, 20000) + "\n…（太长，已截断显示）" : m.content)).join(""); });
  h += "</details>";
  const pg = $("v4page"); pg.innerHTML = h; pg.style.display = "block"; pg.scrollTop = 0;
  $("v4close").onclick = () => { pg.style.display = "none"; };
  $("v4fb").onclick = () => copyFeedback();
};
$("v4go").onclick = async () => {
  if (!MAT || !current) return;
  const note = $("v4txt").value.trim();
  if (!note) { alert("先写修改意见"); return; }
  const btn = $("v4go"); btn.disabled = true; $("v4msg").textContent = "正在重写，大约半分钟到两分钟…";
  CAP = [];
  try {
    const prev = $("source").value.replace(/!\[图(\d+)\]\(img\/[^)\s]+\)/g, "【图$1】").replace(/\n---\n来源：[^\n]*\n?$/, "");
    let mat = framesText(MAT.segs, MAT.frames);
    if (mat.length > 60000) mat = mat.slice(0, 60000) + "\n…（后面省略）";
    let base = MAT.sys || sysPrompt(); if (base.indexOf("【公式格式") < 0) base += MATHRULE;
    const sys = base + "\n\n【修改模式】用户对上一版笔记不满意，会给出修改意见。请根据原始材料和上一版笔记，按意见输出修改后的完整笔记（Markdown，从一级标题开始），不要解释改了什么。保留上一版中合理的部分和【图N】标记。再次强调：公式只能用 $...$ 或 $$...$$ 包裹。";
    const user = "视频标题：" + MAT.title + "\n\n【原始材料：字幕和截图识别】\n" + mat + "\n\n【上一版笔记】\n" + prev + "\n\n【修改意见】\n" + note;
    let md = await chat([{ role: "system", content: sys }, { role: "user", content: user }]);
    md = cleanMd(md);
    if (!MAT.ts) md = stripTs(md);
    if (MAT.frames.length) md = insertImages(md, MAT.frames);
    if (!/^#\s/.test(md.trim())) md = "# " + MAT.title + "\n\n" + md;
    md += "\n\n---\n来源：https://www.bilibili.com/video/" + MAT.bvid + "?p=" + MAT.p + "\n";
    MAT.vers.push({ md, note, time: Date.now() }); MAT.cur = MAT.vers.length - 1;
    MAT.calls = (MAT.calls || []).concat(CAP);
    current.md = md; saveMat(current.mat, MAT); updHist(current);
    show(current); $("v4txt").value = "";
    $("v4msg").textContent = "已生成第 " + MAT.vers.length + " 版，可在上方下拉框切换各版本。";
  } catch (e) { $("v4msg").textContent = "重写失败：" + e.message; }
  finally { CAP = null; btn.disabled = false; }
};

