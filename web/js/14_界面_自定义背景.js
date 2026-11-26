// v1.6.7：自定义背景（vtn_bg）
(function () {
  const L = document.createElement("div"); L.id = "bgLayer"; document.body.prepend(L);
  function apply() {
    let u = ""; try { u = Store.get("vtn_bg") || ""; } catch (e) { __err(e, "L1558") }
    L.style.backgroundImage = u ? "url(" + u + ")" : "";
    document.documentElement.classList.toggle("has-bg", !!u);
    const t = $("bgTip"); if (t) t.textContent = u ? "已使用自定义背景" : "当前：纯色背景";
  }
  const about = $("verTxt") && $("verTxt").closest(".grp");
  if (about) {
    const gt = document.createElement("div"); gt.className = "gt"; gt.textContent = "背景";
    const box = document.createElement("div"); box.className = "grp";
    box.innerHTML = '<div class="li" style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:10px 0"><span id="bgTip" class="mute" style="flex:1"></span>' +
      '<button class="sec" id="bgPick">选择图片</button><button class="sec" id="bgClear">恢复纯色</button>' +
      '<input type="file" id="bgFile" accept="image/*" style="display:none"></div>';
    const ref = about.previousElementSibling && about.previousElementSibling.classList.contains("gt") ? about.previousElementSibling : about;
    ref.before(gt, box);
    $("bgPick").onclick = () => $("bgFile").click();
    $("bgClear").onclick = () => { try { Store.del("vtn_bg"); } catch (e) { __err(e, "L1573") } apply(); };
    $("bgFile").onchange = () => {
      const f = $("bgFile").files[0]; $("bgFile").value = ""; if (!f) return;
      const rd = new FileReader();
      rd.onload = () => {
        const im = new Image();
        im.onload = () => {
          const m = 1600, r = Math.min(1, m / Math.max(im.width, im.height));
          const c = document.createElement("canvas"); c.width = Math.round(im.width * r); c.height = Math.round(im.height * r);
          c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
          let q = 0.82, u = c.toDataURL("image/jpeg", q);
          while (u.length > 1500000 && q > 0.4) { q -= 0.1; u = c.toDataURL("image/jpeg", q); }
          try { Store.set("vtn_bg", u); apply(); }
          catch (e) { alert("图片太大，存不下，请换一张小一点的"); }
        };
        im.onerror = () => alert("这张图片读不出来，换一张试试");
        im.src = rd.result;
      };
      rd.readAsDataURL(f);
    };
  }
  apply();
})();
