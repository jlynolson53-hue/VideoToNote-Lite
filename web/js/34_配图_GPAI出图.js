// ===== v2.8.6：GPAI 配图（每张截图都可在“原截图”和“GPAI 配图”之间自由切换）=====
(function () {
  const K = "vtn_aifig";
  const cfg = () => Object.assign({ base: "https://magicbookx16pro.taile4dd80.ts.net", key: "gpai_f8b623dc780a22582d1780787f791cae" }, Store.json(K, {}));
  const st = document.createElement("style");
  st.textContent = ".aiBar{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin:-4px 0 12px;font-size:13px}.aiBar button{border:1px solid var(--outline-variant,#ccc);background:transparent;color:inherit;border-radius:14px;padding:3px 12px;font-size:13px}.aiBar button.on{background:var(--primary,#1a73e8);color:var(--on-primary,#fff);border-color:transparent}.aiBar button:disabled{opacity:.4}.aiBar .mute{opacity:.7}.aiIn{width:100%;box-sizing:border-box;margin:6px 0 10px;padding:8px;border-radius:8px;border:1px solid #ccc;font-size:14px}";
  document.head.appendChild(st);
  const ENG = { "化学": "chemistry", "数学": "graph", "物理": "diagram", "生物": "diagram" };
  function engineFor(it) { const t = (it.tag || "") + " " + (it.title || ""); for (const k in ENG) if (t.indexOf(k) >= 0) return ENG[k]; return cfg().engine || "diagram"; }
  function nativeCall(fn, a, b, c) { return new Promise((res, rej) => { const id = "r" + (++seq); cbs[id] = r => r.error ? rej(new Error(r.error)) : res(r); Native[fn](id, a, b, c); }); }
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const baseUrl = () => String(cfg().base || "").replace(/\/+$/, "");
  function ctxOf(md, orig) {
    const ls = md.split("\n"); const i = ls.findIndex(l => l.indexOf("](img/" + orig + ")") >= 0); const out = [];
    for (let j = i - 1; j >= 0 && out.join("").length < 160; j--) { const l = ls[j].trim(); if (!l || /^!\[/.test(l) || /^\|?\s*-{3}/.test(l)) continue; out.unshift(l.replace(/[#*>`|]/g, " ").replace(/\s+/g, " ")); }
    return out.join(" ").slice(-200);
  }
  async function api(method, path, body) {
    const c = cfg(); if (!c.base || !c.key) throw new Error("还没填出图服务地址和密钥（设置 → GPAI 出图服务）");
    for (let k = 0; ; k++) {
      const r = await http(method, baseUrl() + path, { "Content-Type": "application/json", "X-API-Key": c.key }, body ? JSON.stringify(body) : "");
      const s = +r.status || 0;
      if (s === 503 && k < 6) { await sleep(8000); continue; }
      if (s === 401) throw new Error("出图密钥不对（401）");
      if (s === 400) throw new Error("提示词或引擎不被接受（400）");
      if (!s || s >= 300) throw new Error("出图服务出错 " + s + " " + String(r.body || "").slice(0, 120));
      return JSON.parse(r.body);
    }
  }
  // v2.8.7：先用识图模型把原截图逐字转写，再让 GPAI 严格照原文重画（实测内容与原图一致）
  const TRP = "请把这张课堂截图（板书或 PPT）里的内容逐行、逐字转写出来，用于原样重画。要求：1）按从上到下、从左到右的顺序，每行写成“第N行：……”；2）公式照写，可用 LaTeX；3）最后用一两句话说明红框、圈注、箭头、下划线分别标在哪几行；4）只转写图中实际有的内容，不要解题、不要补充、不要解释。看不清的字写成[?]。";
  async function transcribe(it, orig) {
    it.aiTr = it.aiTr || {}; if (it.aiTr[orig]) return it.aiTr[orig];
    if (!HAS_NATIVE || typeof vchat !== "function") return "";
    const b = Native.readB64(orig); if (!b) return "";
    const t = String(await vchat([{ type: "text", text: TRP }, { type: "image_url", image_url: { url: "data:image/jpeg;base64," + b } }]) || "").trim();
    if (t.length > 8) it.aiTr[orig] = t;
    return t;
  }
  async function genOne(it, orig, alt, onStep) {
    let tr = ""; if (onStep) onStep("读取原截图");
    try { tr = await transcribe(it, orig); } catch (e) { __err(e, "配图转写"); }
    const prompt = tr
      ? "把下面这张课堂板书原样重绘成整洁的学习笔记图。严格要求：只能使用下列原文，逐行照抄，行的顺序和分行保持不变；不得增加任何推导、公式、例子或解释，不得删改任何字；保留红框、圈注和箭头的位置。白底，黑色文字，红色只用于原有的框和圈，排版清晰。\n原文：\n" + tr.slice(0, 1800)
      : "为高中学习笔记画一张清晰的图解，白底，中文标注，结构清楚，适合放进学习笔记。笔记：" + it.title + "。这张图要表达：" + (alt || "本节要点") + "。相关内容：" + ctxOf(it.md, orig);
    let j = await api("POST", "/img/jobs", { prompt: prompt, engine: tr ? "illust" : engineFor(it) });
    const id = j.variant_id; const url = j.status_url || ("/img/jobs/" + id);
    for (let n = 0; j.status !== "completed"; n++) {
      if (j.status === "failed") throw new Error("出图失败：" + (j.error || ""));
      if (n > 90) throw new Error("出图超时（6 分钟）");
      if (onStep) onStep(j.status || "排队中");
      await sleep(4000); j = await api("GET", url);
    }
    const src = j.local_url ? baseUrl() + j.local_url : j.image_url;
    if (!src) throw new Error("服务没有返回图片地址");
    const name = "ai_" + String(id || Date.now()).replace(/[^A-Za-z0-9_-]/g, "").slice(0, 24) + ".png";
    await nativeCall("imgFetch", src, name, JSON.stringify({ "X-API-Key": cfg().key }));
    return name;
  }
  function persist(it) {
    if (it === current) it.md = $("source").value;
    const h = loadHist(); const i = h.findIndex(x => x.time === it.time && x.bvid === it.bvid);
    if (i >= 0) { h[i] = it; Store.set("vtn_hist", JSON.stringify(h)); }
  }
  function setMd(md) { $("source").value = md; current.md = md; $("preview").innerHTML = render(md); persist(current); }
  const swap = (md, a, b) => md.split("](img/" + a + ")").join("](img/" + b + ")");
  const mapOf = it => (it.aiMap = it.aiMap || {});
  function origOf(name) { if (!/^ai_/.test(name)) return name; const m = mapOf(current); return Object.keys(m).find(k => m[k] === name) || null; }
  function use(name, which) { const o = origOf(name); if (!o) return; const a = mapOf(current)[o]; const md = curMd(); if (which === "a" && a) setMd(swap(md, o, a)); if (which === "o" && a) setMd(swap(md, a, o)); }
  function useAll(which) { if (!current) return; let md = curMd(); const mp = mapOf(current); Object.keys(mp).forEach(o => { md = which === "a" ? swap(md, o, mp[o]) : swap(md, mp[o], o); }); setMd(md); }
  function remember(it, o, n) { const old = mapOf(it)[o]; mapOf(it)[o] = n; it.imgs = Array.from(new Set((it.imgs || []).concat([n]))); if (old && old !== n && it === current) setMd(swap(curMd(), old, n)); }
  function nameOf(img) { const m = /\/img\/([^/?#]+)$/.exec((img && img.getAttribute("src")) || ""); return m ? decodeURIComponent(m[1]) : ""; }
  function decorate() {
    const pv = $("preview"); if (!pv || !current) return;
    pv.querySelectorAll("figure.shot").forEach(f => {
      if (f.nextElementSibling && f.nextElementSibling.classList.contains("aiBar")) return;
      const img = f.querySelector("img"); const nm = nameOf(img); if (!nm) return;
      const o = origOf(nm); const a = o && mapOf(current)[o]; const isA = /^ai_/.test(nm);
      const bar = document.createElement("div"); bar.className = "aiBar";
      bar.innerHTML = '<button data-k="o" class="' + (isA ? "" : "on") + '">原截图</button><button data-k="a" class="' + (isA ? "on" : "") + '"' + (a ? "" : " disabled") + '>GPAI 配图</button><button data-k="g">' + (a ? "重新生成" : "生成配图") + '</button><span class="mute"></span>';
      bar.onclick = async e => {
        const b = e.target.closest("button"); if (!b || b.disabled) return; const k = b.dataset.k;
        if (k !== "g") { use(nm, k); return; }
        if (!HAS_NATIVE) return; b.disabled = true; const it = current; const tip = bar.querySelector(".mute");
        try { const n = await genOne(it, o || nm, (img.getAttribute("alt") || ""), s => { tip.textContent = "GPAI 正在出图（" + s + "）…"; }); remember(it, o || nm, n); if (it === current) setMd(swap(curMd(), nm, n)); else persist(it); }
        catch (x) { __err(x, "GPAI 出图"); tip.textContent = x.message; b.disabled = false; }
      };
      f.after(bar);
    });
  }
  new MutationObserver(decorate).observe($("preview"), { childList: true });
  async function genAll(opt) {
    opt = opt || {}; if (!current) return 0; const it = current; const tell = window.snack || (() => 0);
    const re = /!\[([^\]]*)\]\(img\/([^)\s]+)\)/g; const todo = []; let m;
    while ((m = re.exec(it.md))) if (!/^ai_/.test(m[2]) && !mapOf(it)[m[2]]) todo.push([m[2], m[1]]);
    if (!todo.length) { tell("这篇笔记没有待出图的截图"); return 0; }
    tell("开始为 " + todo.length + " 张截图出图，每张约半分钟到一分钟");
    let p = 0, done = 0, fail = 0;
    const worker = async () => { while (p < todo.length) { const t = todo[p++]; try { remember(it, t[0], await genOne(it, t[0], t[1])); done++; } catch (e) { __err(e, "GPAI 出图"); fail++; } } };
    await Promise.all([worker(), worker(), worker()]);
    persist(it);
    const msg = "生成了 " + done + " 张" + (fail ? "，失败 " + fail + " 张（详情见错误日志）" : "") + "。原截图不会删除，每张图下面都能随时切换。";
    if (done && it === current) {
      if (opt.auto || (window.__askOr && await window.__askOr("GPAI 配图完成", "全部换成 GPAI 配图", msg, false, "先保留原截图"))) useAll("a");
      else $("preview").innerHTML = render(curMd());
    } else tell(msg);
    return done;
  }
  function setDlg() {
    const c = cfg(); const m = document.createElement("div"); m.className = "vDlgM";
    m.innerHTML = '<div class="vDlg"><div class="tt">GPAI 出图服务</div><div class="mm">地址和密钥见出图服务的 CURRENT_ACCESS.txt。<input class="aiIn" id="aiBase" placeholder="https://xxx.trycloudflare.com"><input class="aiIn" id="aiKey" placeholder="gpai_xxxxxxxx"></div><div class="bb"><button data-r="0">取消</button><button data-r="1">保存</button></div></div>';
    document.body.appendChild(m); $("aiBase").value = c.base || ""; $("aiKey").value = c.key || "";
    m.onclick = e => { const b = e.target.closest("button"); if (!b) return; if (b.dataset.r === "1") { Store.set(K, JSON.stringify(Object.assign(c, { base: $("aiBase").value.trim(), key: $("aiKey").value.trim() }))); const s = $("aiSt"); if (s) s.textContent = "已设置"; (window.snack || alert)("已保存"); } m.remove(); };
  }
  function menu() {
    const m = document.createElement("div"); m.className = "vDlgM";
    m.innerHTML = '<div class="vDlg"><div class="tt">GPAI 配图</div><div class="mm">先读出每张截图里的文字和公式，再由 GPAI 照原文重画成白底清晰版，内容与原截图一致。原截图一直保留：每张图下面可以单独切换，也可以在这里一键切换。导出 PDF 和图文 MD 用的是当前选中的那一种。</div><div class="bb" style="flex-wrap:wrap"><button data-r="g">为全部截图出图</button><button data-r="a">全部用 GPAI 配图</button><button data-r="o">全部用原截图</button><button data-r="s">服务设置</button><button data-r="x">关闭</button></div></div>';
    m.onclick = e => { const b = e.target.closest("button"); if (!b && e.target !== m) return; m.remove(); const r = b && b.dataset.r; if (r === "g") genAll(); if (r === "a") useAll("a"); if (r === "o") useAll("o"); if (r === "s") setDlg(); };
    document.body.appendChild(m);
  }
  function addBtn() {
    if ($("aiFigBtn")) return; const p = Array.from(document.querySelectorAll("#pg-det button")).find(x => x.textContent.trim() === "导出 PDF");
    const b = document.createElement("button"); b.id = "aiFigBtn"; b.className = p ? p.className : "sec"; b.textContent = "GPAI 配图"; b.onclick = menu;
    if (p) p.after(b); else if ($("tSrc")) $("tSrc").after(b);
  }
  addBtn(); setTimeout(addBtn, 1500);
  const er = $("errRow");
  if (er) { const row = document.createElement("div"); row.className = "li"; row.id = "aiRow"; row.style.cursor = "pointer"; row.innerHTML = '<span>GPAI 出图服务</span><span class="mute" id="aiSt">' + (cfg().base ? "已设置" : "未设置") + "</span>"; er.after(row); row.onclick = setDlg; }
  window.__aiFig = { genAll: genAll, useAll: useAll, use: use, cfg: cfg };
})();
