// v1.8.8：阅读字体（宋体/黑体）（vtn_rfont）
(function () {
  const pv = $("preview"), tools = $("readTools"); if (!pv || !tools) return;
  const lk = document.createElement("link"); lk.rel = "stylesheet"; lk.href = "fonts/serif.css"; document.head.appendChild(lk);
  const st = document.createElement("style");
  st.textContent = "#preview{text-align:start}#preview.song{font-family:\"Noto Serif SC\",\"Noto Serif CJK SC\",\"Source Han Serif SC\",\"Songti SC\",\"SimSun\",serif}#preview.song h1,#preview.song h2,#preview.song h3{font-family:\"Noto Sans CJK SC\",\"Source Han Sans SC\",\"PingFang SC\",sans-serif}";
  document.head.appendChild(st);
  const b = document.createElement("button"); b.className = "chip5";
  const song = () => Store.get("vtn_rfont") === "song";
  const apply = () => { pv.classList.toggle("song", song()); b.textContent = song() ? "宋体" : "黑体"; };
  b.onclick = () => { Store.set("vtn_rfont", song() ? "hei" : "song"); apply(); snack(song() ? "阅读字体：宋体" : "阅读字体：黑体"); };
  const s0 = tools.querySelector('[data-a="s"]'); s0 ? s0.before(b) : tools.appendChild(b);
  apply();
})();
