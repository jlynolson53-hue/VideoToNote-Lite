// v2.0.3：侧栏选中图标变白、设置页改 Grok 式列表（点进去才展开）、去掉蓝色发光
(function () {
  const st = document.createElement("style");
  st.textContent =
    ".nav button.on .ic,.nav button.on .pill,.nav button.on .pill *{color:var(--on-primary)!important;opacity:1!important;visibility:visible!important}" +
    "*:focus{box-shadow:none}input:focus,textarea:focus,select:focus{outline:none!important;box-shadow:0 0 0 1.5px var(--on-surface)!important}" +
    "#pg-set .fnSet{display:block!important}#pg-set .wrap{max-width:900px!important}" +
    "#fnSetList{background:var(--surface,#fff);border-radius:20px;overflow:hidden;margin:8px 0 20px}" +
    "#fnSetList button{all:unset;box-sizing:border-box;display:flex;align-items:center;gap:16px;width:100%;padding:18px 20px;cursor:pointer;border-bottom:1px solid var(--fn-line);transition:background .2s}" +
    "#fnSetList button:last-child{border-bottom:0}#fnSetList button:active{background:rgba(120,120,128,.12)}" +
    "#fnSetList .ic{font-size:24px;color:var(--on-surface)}#fnSetList b{flex:1;font-size:17px;font-weight:600;color:var(--on-surface)}#fnSetList small{display:block;font-weight:400;font-size:13px;color:var(--on-surface-variant);margin-top:2px}" +
    "#fnSetList .ar{color:var(--on-surface-variant);font-size:22px}" +
    "#pg-set.fnSub #fnSetList,#pg-set.fnSub .wrap>.hd{display:none}#pg-set .fnS{display:none}#pg-set .fnS.cur{display:block;animation:fnIn .3s cubic-bezier(.2,.8,.2,1)}" +
    "#fnSetHd{display:none;align-items:center;gap:12px;margin:8px 0 16px}#pg-set.fnSub #fnSetHd{display:flex}#fnSetHd button{all:unset;cursor:pointer;width:40px;height:40px;border-radius:20px;display:flex;align-items:center;justify-content:center}#fnSetHd button:active{background:rgba(120,120,128,.15)}#fnSetHd span{font-size:24px;font-weight:800}" +
    "#pg-set .fnS>.gt{display:none}@keyframes fnIn{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:none}}";
  document.head.appendChild(st);
  const pg = $("pg-set"), w = pg && pg.querySelector(".wrap"); if (!w) return;
  let secs = Array.from(w.querySelectorAll(".fnS"));
  if (!secs.length) return;
  const IC = [[/模型|API/, "smart_toy", "接口、模型名、Key、余额"], [/截图|识图|语音/, "photo_camera", "截图笔记、识图方式、语音转写"], [/外观|主题|显示/, "contrast", "深浅色与显示"], [/B ?站|登录|账号/, "account_circle", "B 站登录状态"], [/备份|数据|导入|导出/, "backup", "备份与恢复"], [/关于|版本|更新|反馈/, "info", "版本、更新日志、反馈"]];
  const list = document.createElement("div"); list.id = "fnSetList";
  const hd = document.createElement("div"); hd.id = "fnSetHd"; hd.innerHTML = '<button aria-label="返回"><i class="ic">arrow_back</i></button><span></span>';
  const g = w.querySelector(".fnSet") || secs[0].parentNode; g.before(list, hd);
  const close = () => { pg.classList.remove("fnSub"); secs.forEach(x => x.classList.remove("cur")); scrollTo({ top: 0 }); };
  hd.querySelector("button").onclick = close;
  secs.forEach(sec => {
    const t = sec.querySelector(".gt"), title = t ? t.textContent.trim() : ((sec.querySelector("h2,summary") || {}).textContent || "其他").trim();
    const m = IC.find(x => x[0].test(title)) || [0, "tune", ""];
    const b = document.createElement("button");
    b.innerHTML = '<i class="ic">' + m[1] + "</i><b>" + title + (m[2] ? "<small>" + m[2] + "</small>" : "") + '</b><i class="ic ar">chevron_right</i>';
    b.onclick = () => { secs.forEach(x => x.classList.toggle("cur", x === sec)); hd.querySelector("span").textContent = title; pg.classList.add("fnSub"); scrollTo({ top: 0 }); };
    list.appendChild(b);
  });
  document.querySelectorAll('.nav button[data-p="set"]').forEach(n => n.addEventListener("click", close));
  window.addEventListener("popstate", () => { if (pg.classList.contains("fnSub")) close(); });
})();
