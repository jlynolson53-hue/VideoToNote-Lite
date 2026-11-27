// ===== v2.8.8：用 GPAI API 写笔记，模型可选（出图功能已移除）=====
(function () {
  const GB = "https://magicbookx16pro.taile4dd80.ts.net/v1", GK = "gpai_f8b623dc780a22582d1780787f791cae";
  const NM = { "gpai-fast": "GPAI Fast（快）", "gemini-4-neon": "Gemini 4 Neon", "claude-opus-5.5": "Claude Opus 5.5", "gpt-6.1-sol": "GPT-6.1 Sol" };
  const mi = $("model"); if (!mi) return;
  const sel = document.createElement("select"); sel.id = "modelSel"; sel.style.display = "none"; mi.after(sel);
  const row = document.createElement("div"); row.style.cssText = "display:flex;gap:8px;flex-wrap:wrap;margin:8px 0";
  row.innerHTML = '<button class="sec" id="useGpai">一键使用 GPAI</button><button class="sec" id="refModels">刷新模型列表</button><span class="mute" id="gpaiTip" style="align-self:center"></span>';
  $("base").before(row);
  const tip = t => { $("gpaiTip").textContent = t; };
  function save() { S.base = $("base").value.trim() || S.base; S.model = $("model").value.trim() || S.model; S.key = $("key").value.trim(); Store.set("vtn_set", JSON.stringify(S)); }
  function fill(ids) {
    sel.innerHTML = ids.map(id => '<option value="' + id + '">' + (NM[id] || id) + "</option>").join("");
    if (ids.indexOf(mi.value.trim()) < 0) mi.value = ids[0];
    sel.value = mi.value.trim(); sel.style.display = ""; mi.style.display = "none";
  }
  async function loadModels() {
    const base = $("base").value.trim().replace(/\/+$/, ""), key = $("key").value.trim();
    if (!base || !key) { tip("先填接口地址和 Key"); return []; }
    tip("正在读取模型列表…");
    try {
      const r = await http("GET", base + "/models", { "Authorization": "Bearer " + key }, "");
      const ids = (JSON.parse(r.body).data || []).map(x => x.id).filter(Boolean);
      if (!ids.length) throw new Error("状态码 " + r.status);
      fill(ids); save(); tip("可选 " + ids.length + " 个模型"); return ids;
    } catch (e) { __err(e, "读取模型列表"); sel.style.display = "none"; mi.style.display = ""; tip("这个接口没有提供模型列表，请手动填写模型名"); return []; }
  }
  sel.onchange = () => { mi.value = sel.value; save(); (window.snack || (() => 0))("已切换到 " + (NM[sel.value] || sel.value)); };
  $("useGpai").onclick = () => { $("base").value = GB; $("key").value = GK; if (!/^(gpai|gemini|claude|gpt)/.test(mi.value)) mi.value = "gpai-fast"; save(); loadModels(); };
  $("refModels").onclick = loadModels;
  if (/\/models$|ts\.net|gpai/i.test(S.base) && S.key) loadModels();
  window.__gpaiNote = { loadModels: loadModels, sel: sel };
})();
