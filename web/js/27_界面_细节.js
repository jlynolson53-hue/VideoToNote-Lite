// v2.0.4：设置列表直线分隔、进度步骤去掉方框、细节
(function () {
  const st = document.createElement("style");
  st.textContent =
    "#fnSetList{border-radius:20px;overflow:hidden}#fnSetList button{border-bottom:0!important;position:relative;border-radius:0!important}" +
    "#fnSetList button+button::before{content:'';position:absolute;top:0;left:60px;right:0;height:1px;background:var(--fn-line);transform:scaleY(.6)}" +
    ".pvS,.pvS *{outline:none!important}.pvS{box-shadow:none!important;border:0!important;background:transparent!important}.pvS::after{display:none!important}" +
    ".pvS.cur i{box-shadow:0 0 0 2px var(--on-surface)!important;color:var(--on-surface)!important;animation:fnPulse 1.6s ease-in-out infinite!important}" +
    "@keyframes fnPulse{50%{box-shadow:0 0 0 5px rgba(0,0,0,.08)}}" +
    ".dlg button,.modal button,[class*=ask] button{outline:none!important}";
  document.head.appendChild(st);
})();
