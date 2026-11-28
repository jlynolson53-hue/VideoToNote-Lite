// ===== v2.8.9：DeepSeek / GPAI 两套配置各自记住；生成页直接切换写笔记模型 =====
(function () {
  const PK = "vtn_prov";
  const GPM = ["gpai-fast", "gemini-4-neon", "claude-opus-5.5", "gpt-6.1-sol"];
  const NM = { "gpai-fast": "GPAI Fast", "gemini-4-neon": "Gemini 4 Neon", "claude-opus-5.5": "Claude Opus 5.5", "gpt-6.1-sol": "GPT-6.1 Sol" };
  const isGp = b => /ts\.net|gpai/i.test(b || "");
  const P = Store.json(PK, null) || (function () {
    const p = { ds: { base: "https://api.deepseek.com", key: "", model: "deepseek-flash" }, gp: { base: "https://magicbookx16pro.taile4dd80.ts.net/v1", key: "gpai_f8b623dc780a22582d1780787f791cae", model: "gpai-fast" } };
    p[isGp(S.base) ? "gp" : "ds"] = { base: S.base, key: S.key, model: S.model };
    return p;
  })();
  const keep = () => Store.set(PK, JSON.stringify(P));
  const cur = () => isGp(S.base) ? "gp" : "ds";
  function record() {
    const b = $("base").value.trim() || S.base;
    const p = P[isGp(b) ? "gp" : "ds"]; p.base = b; p.key = $("key").value.trim(); p.model = $("model").value.trim() || p.model; keep(); paint();
  }
  function apply(prov, model, quiet) {
    const p = P[prov]; if (model) p.model = model;
    S.base = p.base; S.key = p.key; S.model = p.model; Store.set("vtn_set", JSON.stringify(S)); keep();
    $("base").value = p.base; $("key").value = p.key; $("model").value = p.model;
    const sel = $("modelSel");
    if (prov === "gp") { if (sel && window.__gpaiNote) { if (sel.options.length) { sel.value = p.model; sel.style.display = ""; $("model").style.display = "none"; } else window.__gpaiNote.loadModels(); } }
    else if (sel) { sel.style.display = "none"; $("model").style.display = ""; }
    paint();
    if (!quiet) (window.snack || (() => 0))(prov === "ds" && !p.key ? "还没填 DeepSeek 的 Key，到设置里填一次，以后会一直记住" : "写笔记改用 " + (prov === "ds" ? "DeepSeek · " + p.model : (NM[p.model] || p.model)));
  }
  // 设置页：DeepSeek | GPAI 切换（各自记住地址、Key、模型）
  const seg = document.createElement("div"); seg.className = "chips"; seg.id = "provSeg"; seg.style.margin = "6px 0 10px";
  seg.innerHTML = '<button class="chip5" data-p="ds">DeepSeek</button><button class="chip5" data-p="gp">GPAI</button>';
  $("base").before(seg);
  seg.onclick = e => { const b = e.target.closest("button"); if (!b) return; record(); apply(b.dataset.p); };
  const ug = $("useGpai"); if (ug) ug.style.display = "none";
  ["base", "key", "model"].forEach(id => $(id).addEventListener("change", record));
  $("saveSet").addEventListener("click", () => setTimeout(record, 0));
  document.addEventListener("change", e => { if (e.target && e.target.id === "modelSel") setTimeout(record, 0); });
  // 生成页：写笔记模型芯片
  const host = $("chipShot") && $("chipShot").parentNode;
  const lb = document.createElement("label"); lb.textContent = "写笔记模型";
  const box = document.createElement("div"); box.className = "chips"; box.id = "modelChips";
  if (host) { host.after(box); host.after(lb); }
  function paint() {
    const c = cur(), m = S.model;
    box.innerHTML = '<button class="chip5" data-p="ds">DeepSeek</button>' + GPM.map(id => '<button class="chip5" data-p="gp" data-m="' + id + '">' + NM[id] + "</button>").join("");
    box.querySelectorAll("button").forEach(b => b.classList.toggle("on", b.dataset.p === c && (c === "ds" || b.dataset.m === m)));
    seg.querySelectorAll("button").forEach(b => b.classList.toggle("on", b.dataset.p === c));
  }
  box.onclick = e => { const b = e.target.closest("button"); if (!b) return; apply(b.dataset.p, b.dataset.m); };
  keep(); paint();
  window.__prov = { P: P, apply: apply, paint: paint };
})();
