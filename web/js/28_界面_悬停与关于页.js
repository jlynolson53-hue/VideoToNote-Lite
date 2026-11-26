// v2.0.5：鼠标悬停变灰、关于页修复
(function () {
  const st = document.createElement("style");
  st.textContent =
    "@media (hover:hover) and (pointer:fine){" +
    "#fnSetList button:hover,#fnSetHd button:hover,.nav button:not(.on):hover,.li:hover,.hist:hover,.chip:hover,.chip5:hover,.icon:hover,button.sec:hover,summary:hover,.card>summary:hover{background:rgba(120,120,128,.14)!important;transition:background .15s}" +
    ".nav button.on:hover{filter:brightness(1.25)}button,summary,.li,.hist{cursor:pointer}}" +
    "#pg-set .fnS.cur>*:not(.gt){display:block}#pg-set .fnS.cur .grp{opacity:1!important;visibility:visible!important;transform:none!important}";
  document.head.appendChild(st);
  const pg = $("pg-set"); if (!pg) return;
  const grp = $("verTxt") && $("verTxt").closest(".grp");
  const secs = Array.from(pg.querySelectorAll(".fnS"));
  let sec = secs.find(x => { const t = x.querySelector(".gt"); return t && /关于/.test(t.textContent); });
  if (grp && sec && !sec.contains(grp)) sec.appendChild(grp);
  if (grp && !sec) { const p = grp.closest(".fnS"); if (p) sec = p; }
  if (grp && sec && !$("fnFb")) {
    const b = document.createElement("div"); b.className = "li"; b.id = "fnFb";
    b.style.cssText = "display:flex;justify-content:space-between;padding:12px 0";
    b.innerHTML = "<span>复制反馈信息</span><i class='ic'>content_copy</i>";
    b.onclick = () => { try { const t = (typeof feedbackText === "function") ? feedbackText() : ("FrameNote " + APP_VER); navigator.clipboard.writeText(t).then(() => alert("已复制，可直接粘贴给我")).catch(() => prompt("复制以下内容", t)); } catch (e) { __err(e, "L2861") } };
    grp.appendChild(b);
    const cb = $("chgBox"); if (cb) cb.open = true;
  }
})();
