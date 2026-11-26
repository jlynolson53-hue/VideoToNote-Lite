// ===== v2.8.0：设置 → 关于 → 错误日志 =====
(function () {
  const v = document.getElementById("verTxt"); if (!v) return;
  const row = document.createElement("div"); row.className = "li"; row.id = "errRow"; row.style.cursor = "pointer";
  row.innerHTML = '<span>错误日志</span><span class="mute" id="errCnt"></span>';
  v.parentNode.after(row);
  const upd = () => { __errFlush(); const a = Store.json(__ERRK, []); $("errCnt").textContent = a.length ? a.length + " 条" : "无"; };
  upd(); document.addEventListener("click", e => { if (e.target.closest && e.target.closest('.nav button[data-p="set"]')) setTimeout(upd, 300); }, true);
  row.onclick = async () => {
    const t = __errText(); const ask = window.__askOr;
    if (!ask) { snack(t.slice(0, 200)); return; }
    if (await ask("错误日志（最新在前）", "复制", t.slice(0, 3000), false, "关闭")) {
      try { await navigator.clipboard.writeText("FrameNote " + APP_VER + " 错误日志\n\n" + t); snack("已复制，可直接粘贴给我"); } catch (e) { __err(e, "复制日志"); }
      if (await ask("清空错误日志？", "清空", "复制好以后可以清空，方便下次只看新错误。", true)) { Store.del(__ERRK); upd(); snack("已清空"); }
    }
  };
})();
