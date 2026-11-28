// ===== v2.9.0：取消正在生成的笔记 =====
(function () {
  const pb = $("pvPause"); if (!pb) return;
  const cb = document.createElement("button"); cb.id = "pvCancel"; cb.className = pb.className.replace(/\bpaused\b/, ""); cb.textContent = "取消";
  pb.after(cb);
  PV.cancel = false;
  const CE = () => Object.assign(new Error("已取消生成"), { cancelled: true });
  const _gate = pvGate;
  pvGate = function () { if (PV.cancel) return Promise.reject(CE()); return _gate().then(() => { if (PV.cancel) throw CE(); }); };
  const _h = http;
  http = async function (m, u, h, b) {
    if (PV.cancel) throw CE();
    const r = await _h(m, u, h, b);
    if (PV.cancel) throw CE();   // 已发出的请求无法中途掐断，回来后直接丢弃结果
    return r;
  };
  const _reset = pvReset;
  pvReset = function () { PV.cancel = false; cb.disabled = false; cb.textContent = "取消"; return _reset.apply(this, arguments); };
  async function doCancel() {
    const ask = window.__askOr;
    if (ask && !(await ask("取消这次生成？", "取消生成", "已经完成的步骤会丢弃，正在进行的请求返回后不再使用。", true, "继续生成"))) return;
    PV.cancel = true; cb.disabled = true; cb.textContent = "正在取消…";
    $("pvTitle").textContent = "已取消";
    PV.waiters.splice(0).forEach(r => r());   // 若处于暂停，立刻放行让流程退出
    try { if (HAS_NATIVE && Native.bgStop) Native.bgStop(); } catch (e) { __err(e, "取消生成"); }
    log("已取消生成");
    (window.snack || (() => 0))("已取消生成");
  }
  cb.onclick = doCancel;
  window.__cancelGen = doCancel;
})();
