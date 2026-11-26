// ===== v2.5.0：元素周期表进度（随进度逐个点亮 1–118 号元素）=====
(function () {
  const SYM = "H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og".split(" ");
  const CN = "氢氦锂铍硼碳氮氧氟氖钠镁铝硅磷硫氯氩钾钙钪钛钒铬锰铁钴镍铜锌镓锗砷硒溴氪铷锶钇锆铌钼锝钌铑钯银镉铟锡锑碲碘氙铯钡镧铈镨钕钷钐铕钆铽镝钬铒铥镱镥铪钽钨铼锇铱铂金汞铊铅铋钋砹氡钫镭锕钍镤铀镎钚镅锔锫锎锿镄钔锘铹".split("").concat(["𬬻","𬭊","𬭳","𬭛","𬭶","鿏","𫟼","𬬭","鿔","鿭","𫓧","镆","𫟷","鿬","鿫"]);
  function pos(z) {
    if (z === 1) return [1, 1]; if (z === 2) return [1, 18];
    const P = [[3, 10, 2], [11, 18, 3], [19, 36, 4], [37, 54, 5], [55, 86, 6], [87, 118, 7]];
    if (z >= 57 && z <= 71) return [9, z - 54]; if (z >= 89 && z <= 103) return [10, z - 86];
    for (const [a, b, r] of P) if (z >= a && z <= b) {
      let i = z - a;
      if (r <= 3) return [r, i < 2 ? i + 1 : i + 11];
      if (r >= 6) { if (i < 2) return [r, i + 1]; return [r, i - 13]; }
      return [r, i + 1];
    }
  }
  function cat(z) {
    if ([1, 6, 7, 8, 15, 16, 34].includes(z)) return "nm";
    if ([2, 10, 18, 36, 54, 86, 118].includes(z)) return "ng";
    if ([9, 17, 35, 53, 85, 117].includes(z)) return "ha";
    if ([3, 11, 19, 37, 55, 87].includes(z)) return "am";
    if ([4, 12, 20, 38, 56, 88].includes(z)) return "ae";
    if ([5, 14, 32, 33, 51, 52].includes(z)) return "md";
    if (z >= 57 && z <= 71) return "la"; if (z >= 89 && z <= 103) return "ac";
    if ([13, 31, 49, 50, 81, 82, 83, 84, 113, 114, 115, 116].includes(z)) return "pt";
    return "tm";
  }
  const AM = {1:"1",6:"12",7:"14",8:"16",9:"19",11:"23",12:"24",13:"27",14:"28",15:"31",16:"32",17:"35.5",19:"39",20:"40",24:"52",25:"55",26:"56",29:"64",30:"65",35:"80",47:"108",53:"127",56:"137"};
  const ROMA = ["","IA","IIA","IIIB","IVB","VB","VIB","VIIB","VIII","VIII","VIII","IB","IIB","IIIA","IVA","VA","VIA","VIIA","0"];
  function pg(z) { const p = pos(z); if (p[0] >= 9) return "第 " + (p[0] - 3) + " 周期 · IIIB 族"; return "第 " + p[0] + " 周期 · " + ROMA[p[1]] + " 族"; }
  const FACT = {"1": ["式", "2H_2 + O_2 ==点燃== 2H_2O"], "2": ["识", "氦最早是 1868 年在太阳光谱里发现的，比在地球上找到早了二十多年，名字来自希腊语的“太阳”"], "3": ["式", "4Li + O_2 ==△== 2Li_2O（锂燃烧只生成 Li_2O，不像钠能生成过氧化物）"], "4": ["识", "铍对 X 射线几乎是透明的，常用来做 X 射线管的窗口"], "5": ["识", "硼酸是一元弱酸，但它不是自己电离出 H^+，而是结合水中的 OH^-"], "6": ["式", "C + 2H_2SO_4(浓) ==△== CO_2↑ + 2SO_2↑ + 2H_2O"], "7": ["式", "N_2 + 3H_2 ⇌ 2NH_3（高温、高压、催化剂）"], "8": ["式", "2H_2O_2 ==MnO_2== 2H_2O + O_2↑"], "9": ["式", "2F_2 + 2H_2O = 4HF + O_2（氟能把水里的氧置换出来）"], "10": ["识", "“霓虹灯”的“霓虹”就是 neon 的音译，氖放电发橙红色光"], "11": ["式", "2Na + 2H_2O = 2NaOH + H_2↑"], "12": ["式", "2Mg + CO_2 ==点燃== 2MgO + C（所以镁着火不能用 CO_2 灭火）"], "13": ["式", "2Al + 2NaOH + 6H_2O = 2Na[Al(OH)_4] + 3H_2↑"], "14": ["式", "SiO_2 + 2C ==高温== Si + 2CO↑（工业制粗硅）"], "15": ["识", "白磷着火点只有约 40 ℃，要保存在水里；红磷就稳定得多"], "16": ["式", "2H_2S + SO_2 = 3S↓ + 2H_2O"], "17": ["式", "MnO_2 + 4HCl(浓) ==△== MnCl_2 + Cl_2↑ + 2H_2O"], "18": ["识", "空气中约 0.93% 是氩，名字来自希腊语的“懒惰”"], "19": ["识", "钾的焰色要透过蓝色钴玻璃看，是紫色（滤掉钠的黄光干扰）"], "20": ["式", "CaCO_3 + CO_2 + H_2O = Ca(HCO_3)_2（溶洞就是这样形成的）"], "21": ["识", "门捷列夫预言的“类硼”就是钪，后来被发现，性质和预言非常接近"], "22": ["识", "钛和人体组织相容性好，常用来做人工关节和种植牙"], "24": ["识", "查酒驾的原理之一：橙色的 Cr_2O_7^{2-} 被乙醇还原成绿色的 Cr^{3+}"], "25": ["式", "2KMnO_4 ==△== K_2MnO_4 + MnO_2 + O_2↑"], "26": ["式", "2Fe^{3+} + Cu = 2Fe^{2+} + Cu^{2+}（FeCl_3 腐蚀铜电路板）"], "27": ["识", "变色硅胶里加了氯化钴：干燥时蓝色，吸水后变粉红色"], "28": ["识", "第五套人民币的 1 元硬币是钢芯镀镍"], "29": ["式", "Cu + 4HNO_3(浓) = Cu(NO_3)_2 + 2NO_2↑ + 2H_2O"], "30": ["式", "Zn−Cu 原电池负极：Zn − 2e^- = Zn^{2+}"], "31": ["识", "镓的熔点约 29.8 ℃，放在手心里就会熔化；它就是门捷列夫预言的“类铝”"], "32": ["识", "锗就是门捷列夫预言的“类硅”，早期的晶体管就是用锗做的"], "33": ["识", "砒霜的主要成分是 As_2O_3"], "35": ["式", "Br_2 + SO_2 + 2H_2O = 2HBr + H_2SO_4（海水提溴的吸收步骤）"], "36": ["识", "1960–1983 年，国际上用氪-86 的一条光谱线来定义“米”"], "43": ["识", "锝是第一个人工制得的元素，名字就来自希腊语的“人造”"], "47": ["式", "CH_3CHO + 2Ag(NH_3)_2OH ==水浴△== CH_3COONH_4 + 2Ag↓ + 3NH_3 + H_2O"], "50": ["识", "“锡疫”：白锡在低温下会慢慢变成粉末状的灰锡"], "53": ["识", "淀粉遇 I_2 变蓝，可以用来检验碘单质"], "54": ["识", "1962 年人们制得了第一个稀有气体化合物，用的就是氙，打破了“惰性气体不反应”的说法"], "55": ["识", "“1 秒”是用铯-133 原子的振动来定义的，原子钟靠的就是它"], "56": ["识", "钡餐用 BaSO_4 而不用 BaCO_3：BaCO_3 会溶在胃酸里，放出有毒的 Ba^{2+}"], "60": ["识", "钕铁硼是目前磁性最强的永磁体，耳机、电机里都有"], "63": ["识", "欧元纸币在紫外灯下发出的荧光，就用到了铕的化合物"], "74": ["识", "钨是熔点最高的金属（约 3422 ℃），所以用来做灯丝"], "78": ["识", "做焰色试验时用铂丝蘸取试样，因为铂本身灼烧时几乎没有焰色"], "79": ["识", "金不溶于任何单一的酸，但能溶于王水（浓硝酸和浓盐酸按 1∶3 混合）"], "80": ["识", "汞是常温下唯一的液态金属"], "82": ["式", "铅蓄电池：Pb + PbO_2 + 2H_2SO_4 ⇌ 2PbSO_4 + 2H_2O（放电 / 充电）"], "84": ["识", "钋是居里夫人发现的，以她的祖国波兰命名"], "86": ["识", "氡是天然放射性气体，会从地基和石材里散出来，所以室内要注意通风"], "88": ["识", "镭是居里夫妇发现的，名字来自拉丁语的“射线”"], "92": ["识", "核电站主要靠铀-235 吸收中子后发生裂变来放出能量"], "101": ["识", "101 号元素钔是以门捷列夫的名字命名的"], "113": ["识", "鿭（Nh）是日本科学家合成的，名字来自日语里的“日本”"], "118": ["识", "鿫是目前已知最重的元素，以合成它时仍然在世的科学家奥加涅相命名"]};
  const fx = t => t.replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])).replace(/==([^=]+)==/g, '<span class="cd"><small>$1</small>=</span>').replace(/_(\d+)/g, "<sub>$1</sub>").replace(/\^\{([^}]+)\}/g, "<sup>$1</sup>").replace(/\^([+-])/g, "<sup>$1</sup>");
  const CATN = { am: "碱金属", ae: "碱土金属", tm: "过渡金属", pt: "主族金属", md: "类金属", nm: "非金属", ha: "卤素", ng: "稀有气体", la: "镧系", ac: "锕系" };
  const st = document.createElement("style");
  st.textContent =
    "#ptBox{margin:6px auto 12px;max-width:560px}" +
    "#ptTbl{display:grid;grid-template-columns:repeat(18,1fr);grid-template-rows:repeat(7,auto) 6px repeat(2,auto);gap:2px}" +
    "#ptTbl .e{position:relative;aspect-ratio:1/1.08;border-radius:3px;border:1px solid rgba(128,128,128,.28);display:flex;align-items:center;justify-content:center;" +
    "font:600 clamp(6px,1.9vw,11px)/1 system-ui,sans-serif;color:rgba(128,128,128,.55);background:transparent;transition:background .5s,color .5s,border-color .5s,transform .35s cubic-bezier(.3,1.6,.5,1),box-shadow .6s}" +
    "#ptTbl .e.ph{border-style:dashed;font-weight:400;font-size:clamp(5px,1.4vw,9px)}" +
    "#ptTbl .e.on{color:#fff;border-color:transparent;background:var(--c)}" +
    "#ptTbl .e.pop{transform:scale(1.45);z-index:2;box-shadow:0 0 10px 2px var(--c)}" +
    "#ptTbl .e.tip{z-index:1;animation:ptGlow 1.6s ease-in-out infinite}" +
    "@keyframes ptGlow{0%,100%{box-shadow:0 0 0 0 var(--c)}50%{box-shadow:0 0 9px 3px var(--c)}}" +
    ".paused #ptTbl .e.tip{animation:none;opacity:.6}" +
    "#ptTbl.fin .e.on{animation:ptWave 1.2s ease-out both;animation-delay:calc(var(--k) * 9ms)}" +
    "@keyframes ptWave{0%{filter:brightness(1)}40%{filter:brightness(1.6);transform:scale(1.15)}100%{filter:brightness(1)}}" +
    "#ptCap{display:flex;align-items:baseline;gap:8px;margin-top:8px;min-height:34px}" +
    "#ptCap .big{font:700 26px/1 system-ui,sans-serif;color:var(--c,#888);transition:color .4s}#ptCap .z{font-size:12px;opacity:.6}" +
    "#ptCap .nm{font-size:14px;font-weight:600}#ptCap .ct{font-size:12px;opacity:.65}#ptCap .cnt{margin-left:auto;font-size:12px;opacity:.7;font-variant-numeric:tabular-nums}" +
    "#ptTbl .am{--c:#e0675a}#ptTbl .ae{--c:#e8964a}#ptTbl .tm{--c:#d4a73c}#ptTbl .pt{--c:#6aa86a}#ptTbl .md{--c:#3fa59a}" +
    "#ptTbl .nm{--c:#4c8fd6}#ptTbl .ha{--c:#7a7fe0}#ptTbl .ng{--c:#a46cd6}#ptTbl .la{--c:#d66aa6}#ptTbl .ac{--c:#c4577a}" +
    "#ptBox.hide{display:none}" +
    "#ptFact{margin-top:8px;padding:8px 10px 9px;border-radius:10px;border-left:3px solid var(--c,#888);background:rgba(128,128,128,.09);min-height:52px;font-size:13px;line-height:1.55}" +
    "#ptFact.emp{visibility:hidden}#ptFact.in{animation:ptIn .45s ease-out}@keyframes ptIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}" +
    "#ptFact .h{display:flex;align-items:center;gap:8px;margin-bottom:2px}#ptFact .h b{color:var(--c)}#ptFact .h em{font-style:normal;font-size:11px;padding:0 6px;border-radius:8px;border:1px solid var(--c);color:var(--c)}" +
    "#ptFact .eq{font-family:'Times New Roman',serif;font-size:14px;overflow-wrap:anywhere}#ptFact .cd{display:inline-flex;flex-direction:column;align-items:center;line-height:1;margin:0 3px;vertical-align:middle}#ptFact .cd small{font-size:9px}" +
    "#ptFact.am{--c:#e0675a}#ptFact.ae{--c:#e8964a}#ptFact.tm{--c:#d4a73c}#ptFact.pt{--c:#6aa86a}#ptFact.md{--c:#3fa59a}#ptFact.nm{--c:#4c8fd6}#ptFact.ha{--c:#7a7fe0}#ptFact.ng{--c:#a46cd6}#ptFact.la{--c:#d66aa6}#ptFact.ac{--c:#c4577a}" +
    "#ptInf{font-size:12px;opacity:.75;min-height:16px;margin-top:2px}" +
    "#ptLg{display:flex;flex-wrap:wrap;gap:4px 10px;margin-top:8px;font-size:11px}#ptLg span{display:inline-flex;align-items:center;gap:4px;opacity:.4;transition:opacity .4s}#ptLg span.lit{opacity:1}#ptLg i{width:9px;height:9px;border-radius:2px;background:var(--c)}#ptLg b{font-weight:600;font-variant-numeric:tabular-nums}" +
    "#ptLg .am{--c:#e0675a}#ptLg .ae{--c:#e8964a}#ptLg .tm{--c:#d4a73c}#ptLg .pt{--c:#6aa86a}#ptLg .md{--c:#3fa59a}#ptLg .nm{--c:#4c8fd6}#ptLg .ha{--c:#7a7fe0}#ptLg .ng{--c:#a46cd6}#ptLg .la{--c:#d66aa6}#ptLg .ac{--c:#c4577a}" +
    "@media (max-width:430px){#ptTbl{gap:1px}#ptTbl .e{font-size:7px;border-radius:2px}#ptTbl .e:not(.on):not(.ph){font-size:0}}" +
    "@media (prefers-reduced-motion:reduce){#ptTbl .e{transition:none}#ptTbl .e.tip,#ptTbl.fin .e.on{animation:none}#ptTbl .e.pop{transform:none}}";
  document.head.appendChild(st);
  const box = document.createElement("div"); box.id = "ptBox";
  const tb = document.createElement("div"); tb.id = "ptTbl";
  const cells = [null];
  for (let z = 1; z <= 118; z++) {
    const [r, c] = pos(z), e = document.createElement("div");
    e.className = "e " + cat(z); e.textContent = SYM[z - 1];
    e.style.gridRow = r; e.style.gridColumn = c; e.style.setProperty("--k", z);
    tb.appendChild(e); cells.push(e);
  }
  [[6, "*"], [7, "**"]].forEach(([r, t]) => { const e = document.createElement("div"); e.className = "e ph"; e.textContent = t; e.style.gridRow = r; e.style.gridColumn = 3; tb.appendChild(e); });
  [[9, "*"], [10, "**"]].forEach(([r, t]) => { const e = document.createElement("div"); e.className = "e ph"; e.textContent = t; e.style.gridRow = r; e.style.gridColumn = 2; tb.appendChild(e); });
  const cap = document.createElement("div"); cap.id = "ptCap";
  cap.innerHTML = '<span class="big">—</span><span class="z"></span><span class="nm">准备点亮</span><span class="ct"></span><span class="cnt">0 / 118</span>';
  const inf = document.createElement("div"); inf.id = "ptInf";
  const lg = document.createElement("div"); lg.id = "ptLg";
  lg.innerHTML = Object.keys(CATN).map(k => '<span class="' + k + '" data-k="' + k + '"><i></i>' + CATN[k] + ' <b>0</b></span>').join("");
  const fc = document.createElement("div"); fc.id = "ptFact"; fc.className = "emp";
  box.append(tb, cap, inf, fc, lg);
  let fT = 0, fQ = null, fP = 0;
  function showFact(z) {
    const f = FACT[z]; if (!f) return; fT = Date.now(); fP = 0;
    fc.className = ""; void fc.offsetWidth; fc.className = "in " + cat(z);
    fc.innerHTML = '<div class="h"><b>' + SYM[z - 1] + " " + CN[z - 1] + "</b><em>" + (f[0] === "式" ? "重点方程式" : "小常识") + '</em></div><div class="t' + (f[0] === "式" ? " eq" : "") + '">' + fx(f[1]) + "</div>";
  }
  function fact(z) {
    if (!FACT[z]) return;
    const w = Date.now() - fT;
    if (w >= 3200) { clearTimeout(fQ); showFact(z); }
    else { fP = z; clearTimeout(fQ); fQ = setTimeout(() => showFact(fP), 3200 - w); }
  }
  let lit = 0, goal = 0, tmr = null;
  function caption(z) {
    const b = cap.querySelector(".big");
    if (!z) { b.textContent = "—"; b.style.color = ""; cap.querySelector(".z").textContent = ""; cap.querySelector(".nm").textContent = "准备点亮"; cap.querySelector(".ct").textContent = ""; }
    else {
      b.textContent = SYM[z - 1]; b.style.color = getComputedStyle(cells[z]).getPropertyValue("--c");
      cap.querySelector(".z").textContent = z + " 号";
      cap.querySelector(".nm").textContent = CN[z - 1];
      cap.querySelector(".ct").textContent = CATN[cat(z)];
    }
    cap.querySelector(".cnt").textContent = z + " / 118";
    inf.textContent = z ? pg(z) + (AM[z] ? " · 高考常用相对原子质量 " + AM[z] : "") + (z >= 104 ? " · 人工合成元素" : "") : "";
    const cnt = {}; for (let k = 1; k <= z; k++) { const c = cat(k); cnt[c] = (cnt[c] || 0) + 1; }
    if (z) fact(z);
    lg.querySelectorAll("span").forEach(x => { const n = cnt[x.dataset.k] || 0; x.querySelector("b").textContent = n; x.classList.toggle("lit", n > 0); });
  }
  function setTip() { cells.forEach((e, z) => e && e.classList.toggle("tip", z === lit && lit < 118)); }
  function step() {
    if (lit === goal) { tmr = null; setTip(); if (lit === 118) { tb.classList.remove("fin"); void tb.offsetWidth; tb.classList.add("fin"); } return; }
    if (goal < lit) { for (let z = goal + 1; z <= lit; z++) cells[z].classList.remove("on", "tip", "pop"); lit = goal; tb.classList.remove("fin"); caption(lit); setTip(); tmr = null; return; }
    lit++;
    const e = cells[lit]; e.classList.add("on", "pop"); setTimeout(() => e.classList.remove("pop"), 380);
    caption(lit); setTip();
    const gap = Math.max(18, Math.min(90, 1600 / Math.max(1, goal - lit + 1)));
    tmr = setTimeout(step, gap);
  }
  function to(p) {
    goal = Math.max(0, Math.min(118, Math.round(p / 100 * 118)));
    if (p > 0 && p < 100 && goal === 0) goal = 1;
    if (!tmr) step();
  }
  function mount() {
    const pc = $("pvPct"); if (!pc) return false;
    const anchor = $("pvFlow") || pc;
    if (!box.isConnected) anchor.parentNode.insertBefore(box, anchor);
    const rd = () => { const n = parseFloat(pc.textContent); if (!isNaN(n)) to(n); };
    new MutationObserver(rd).observe(pc, { childList: true, characterData: true, subtree: true });
    rd(); return true;
  }
  if (!mount()) { const mo = new MutationObserver(() => { if (mount()) mo.disconnect(); }); mo.observe(document.body, { childList: true, subtree: true }); }
})();
iconFallback();

