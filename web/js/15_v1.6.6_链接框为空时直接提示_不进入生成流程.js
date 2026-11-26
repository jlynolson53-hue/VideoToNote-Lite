// v1.6.6：链接框为空时直接提示，不进入生成流程
(function () {
  const guard = sub => () => {
    if (!$("input").value.trim()) { (typeof snack === "function" ? snack : alert)("请先粘贴视频链接或 BV 号"); $("input").focus(); return; }
    run(sub);
  };
  $("goBtn").onclick = guard(false); $("subOnly").onclick = guard(true);
})();
