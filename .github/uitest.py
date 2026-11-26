
import subprocess,time,json,urllib.request,re,os,websocket
os.makedirs('out/pdf',exist_ok=True)
def A(*c): return subprocess.run(['adb',*c],capture_output=True,text=True).stdout
def shot(n):
    open('out/'+n+'.png','wb').write(subprocess.run(['adb','exec-out','screencap','-p'],capture_output=True).stdout)
LOG=[]
print(A('install','-r','-g','app.apk'))
A('shell','pm','grant','com.vtn.lite','android.permission.POST_NOTIFICATIONS')
A('shell','settings','put','system','accelerometer_rotation','0')
A('shell','settings','put','system','user_rotation','0')
A('shell','monkey','-p','com.vtn.lite','-c','android.intent.category.LAUNCHER','1'); time.sleep(12)
shot('00_launch')
names=[]
for _ in range(30):
    names=re.findall(r'(webview_devtools_remote_\d+)',A('shell','cat','/proc/net/unix'))
    if names: break
    time.sleep(2)
A('forward','tcp:9222','localabstract:'+names[-1])
pages=json.load(urllib.request.urlopen('http://127.0.0.1:9222/json'))
pg=[p for p in pages if 'index.html' in p.get('url','')][0]
ws=websocket.create_connection(pg['webSocketDebuggerUrl'],timeout=120,suppress_origin=True)
I=[0]
def send(m,**p):
    I[0]+=1; ws.send(json.dumps({'id':I[0],'method':m,'params':p}))
    while True:
        r=json.loads(ws.recv())
        if r.get('id')==I[0]: return r
        if r.get('method') in ('Runtime.consoleAPICalled','Runtime.exceptionThrown'): LOG.append(json.dumps(r['params'],ensure_ascii=False)[:800])
def ev(e):
    r=send('Runtime.evaluate',expression=e,awaitPromise=True,returnByValue=True).get('result',{})
    if 'exceptionDetails' in r: LOG.append('EVAL ERR '+e[:80]+' '+json.dumps(r['exceptionDetails'],ensure_ascii=False)[:500]); return None
    return r.get('result',{}).get('value')
send('Runtime.enable')
MD="""# 共轭影响碱性

【内容提要】

1. 判断氮碱性强弱：找氮上的孤对电子，看它参与哪些共轭体系。
2. 比较 $N(\\alpha)$ 与 $N(\\beta)$ 的碱性：共轭对象越多，孤对电子电子云密度越小，碱性越弱。
3. 判断能否被酸性 $\\mathrm{KMnO_4}$ 氧化：苯环不行，酰氨基不行，氨基行。

## 类型Ⅰ：共轭影响碱性强弱判断法

【方法】

① 先找碱性中心：氮原子上的孤对电子。

② 再看孤对电子与哪些 $\\pi$ 体系共轭：共轭对象越多、共轭程度越大，电子云密度越小。

③ 最后落到结合 $\\mathrm{H^+}$ 的能力：电子云密度越小，结合 $\\mathrm{H^+}$ 能力越弱，碱性越弱。

★ 核心结论：

$$\\text{孤对电子共轭程度越大} \\Rightarrow \\text{电子云密度越小} \\Rightarrow \\text{结合 H}^+\\text{能力越弱} \\Rightarrow \\text{碱性越弱}$$

| 物质 | 孤对电子共轭对象 | 碱性 |
|---|---|---|
| 脂肪胺 | 无 | 最强 |
| 苯胺 | 苯环 | 较弱 |
| 酰胺 | 羰基 | 几乎无 |

## 排版压力样例

$$E=mc^2+\\frac{1}{2}mv^2+mgh+\\frac{kQq}{r}+\\int_0^{T}P(t)\\,dt+\\sum_{i=1}^{n}F_i\\cdot s_i+\\frac{p^2}{2m}+\\frac{1}{2}kx^2+\\frac{1}{2}I\\omega^2+qU+\\frac{1}{2}CU^2+\\frac{1}{2}LI^2$$

| 列1 | 列2 | 列3 | 列4 | 列5 | 列6 | 列7 | 列8 | 列9 | 列10 |
|---|---|---|---|---|---|---|---|---|---|
| 很长很长的单元格内容 | 很长很长的单元格内容 | 很长很长的单元格内容 | 很长很长的单元格内容 | 很长很长的单元格内容 | 很长很长的单元格内容 | 很长很长的单元格内容 | 很长很长的单元格内容 | 很长很长的单元格内容 | 很长很长的单元格内容 |

""" + "\\n\\n".join("【例%d】这是一段用来撑满页面的测试正文，检查双栏排版时文字是否铺满整页宽度，而不是缩在左上角。氮原子的孤对电子与苯环大π键共轭后，电子云向环上分散，碱性减弱。" % i for i in range(1,26))
item={'title':'共轭影响碱性','bvid':'BV1test','p':1,'md':MD,'srt':'','kind':'note','time':int(time.time()*1000),'tag':'化学'}
import glob as _g
ITEMS=[item]
for _k,_p in enumerate(sorted(_g.glob('.github/fixtures/*.md'))):
    _md=open(_p,encoding='utf-8').read(); _t=(re.findall(r'(?m)^#\s+(.+)',_md) or ['测试笔记'+str(_k)])[0][:30]
    ITEMS.append({'title':_t,'bvid':'BVfix'+str(_k),'p':1,'md':_md,'srt':'','kind':'note','time':int(time.time()*1000)-(_k+1)*1000,'tag':'测试'})
NOTE_N=len(ITEMS)
ev('localStorage.setItem("vtn_hist",JSON.stringify('+json.dumps(ITEMS,ensure_ascii=False)+'));location.reload();1')
time.sleep(10)
ST={}
def state(k): ST[k]=ev('JSON.stringify({w:innerWidth,h:innerHeight,dpr:devicePixelRatio,nav:(document.querySelector(".nav")||{getBoundingClientRect:()=>0}).getBoundingClientRect(),det:document.getElementById("pg-det").getBoundingClientRect(),detShow:document.getElementById("pg-det").classList.contains("show"),page:(document.querySelector(".page.on")||{}).id})')
def clk(sel): return ev('(function(){var e=document.querySelector('+json.dumps(sel)+');if(!e)return "NOEL";e.click();return "ok"})()')
state('gen'); shot('01_横屏_生成')
LOG.append('click lib '+str(clk('.nav button[data-p="lib"]'))); time.sleep(2); state('lib'); shot('02_横屏_笔记库')
LOG.append('click set '+str(clk('.nav button[data-p="set"]'))); time.sleep(2); state('set'); shot('03_横屏_设置')
clk('.nav button[data-p="lib"]'); time.sleep(1)
LOG.append('show '+str(ev('(function(){show(loadHist()[0]);return "ok"})()'))); time.sleep(4); state('det'); shot('04_横屏_笔记')
LOG.append('click gen in det '+str(clk('.nav button[data-p="gen"]'))); time.sleep(2); state('det_then_gen'); shot('05_笔记中点生成')
for j in range(NOTE_N):
    ev('(function(){show(loadHist()['+str(j)+']);return 1})()'); time.sleep(3)
    for col in ['1','2']:
        before=A('shell','ls','/sdcard/Download/VideoToNote/')
        LOG.append('pdfbtn '+str(ev('(function(){var b=Array.from(document.querySelectorAll("#pg-det button")).find(x=>/导出 ?PDF/.test(x.textContent));if(!b)return "NOBTN";b.click();return "ok"})()'))); time.sleep(3)
        LOG.append('segs '+str(ev('JSON.stringify(Array.from(document.querySelectorAll(".pdfS .seg")).map(s=>[s.dataset.k,Array.from(s.querySelectorAll("button")).map(b=>b.dataset.v+":"+b.textContent.trim()+(b.classList.contains("on")?"*":""))]))')))
        LOG.append('col '+str(clk('.pdfS .seg[data-k="col"] [data-v="'+col+'"]'))); time.sleep(2)
        time.sleep(3); _pv=ev('(function(){var pb=document.querySelector(".lpv .pbd");if(!pb)return -1;var P=pb.getBoundingClientRect();var s=P.width/(pb.clientWidth||1);var c2=pb.classList.contains("c2");var gap=c2?(parseFloat(getComputedStyle(pb).columnGap)||0)*s:0;var cw=c2?(P.width-gap)/2:P.width;var n=[];function colR(r){return (c2&&r.left>=P.left+cw+gap/2)?P.right:P.left+cw}pb.querySelectorAll(".katex-display,.fnBrk,table,pre,img").forEach(function(d){var r=d.getBoundingClientRect();if(!r.width||r.top>=P.bottom-1||r.left>=P.right-1)return;var R=colR(r);var right=r.right;d.querySelectorAll(".katex,.base,td,th").forEach(function(x){var q=x.getBoundingClientRect();if(q.width&&q.right>right)right=q.right});if(right>R+1.5||right>r.right+1.5)n.push([d.tagName,d.className,(d.textContent||\"\").slice(0,30),Math.round(r.left),Math.round(r.right),Math.round(right),Math.round(R),d.style.zoom||\"\",(d.querySelector(\"[style*=zoom]\")||{}).outerHTML?1:0])});return n.length?JSON.stringify(n):0})()')
        globals().setdefault('PVBAD',[])
        if _pv!=0: PVBAD.append((j,col,_pv))
        shot('06_导出面板_col'+col)
        LOG.append('go '+str(clk('.pdfS [data-a="go"]')))
        for _ in range(60):
            time.sleep(3)
            if A('shell','ls','/sdcard/Download/VideoToNote/')!=before: break
        time.sleep(4); shot('07_导出完成_col'+col)
        ev('document.querySelectorAll(".vDlgM").forEach(x=>x.remove());1')
A('pull','/sdcard/Download/VideoToNote/','out/pdf/')
A('shell','settings','put','system','user_rotation','1'); time.sleep(5)
ev('(function(){try{closeDet()}catch(e){};tab("gen");return 1})()'); time.sleep(2); state('port_gen'); shot('08_竖屏_生成')

# ===== v2.8.0 新增断言：失败时让测试变红 =====
import sys
FAIL=[]
def chk(name,ok):
    LOG.append(('PASS ' if ok else 'FAIL ')+name)
    if not ok: FAIL.append(name)
def stv(k):
    try: return json.loads(ST.get(k) or 'null') or {}
    except Exception: return {}
chk('笔记库页能打开',stv('lib').get('page')=='pg-lib')
chk('设置页能打开',stv('set').get('page')=='pg-set')
chk('笔记详情能打开',stv('det').get('detShow') is True)
chk('Store 读写删',ev('(function(){Store.set("vtn_uitest","1");var a=Store.get("vtn_uitest");Store.del("vtn_uitest");return a+"|"+Store.get("vtn_uitest")})()')=='1|null')
chk('Store.json 坏数据不崩',ev('(function(){localStorage.setItem("vtn_uitest","{bad");var r=Store.json("vtn_uitest",42);Store.del("vtn_uitest");return r})()')==42)
chk('错误日志能记录',ev('(function(){__err(new Error("UI自测"),"uitest");return __errText().indexOf("UI自测")>=0})()') is True)
chk('设置里有错误日志入口',ev('!!document.getElementById("errRow")') is True)
chk('笔记数据没丢',ev('loadHist().length')==NOTE_N)
chk('每篇笔记单栏和双栏都导出了 PDF（共 '+str(2*NOTE_N)+' 个）',len([f for r,_,fs in os.walk('out/pdf') for f in fs if f.endswith('.pdf')])>=2*NOTE_N)
# ---- 逐页扫描 PDF：左右边界外、双栏中缝有没有墨迹 ----
import pypdfium2 as _pd, numpy as _np
MGN=[16.0, 14.0, 16.0, 14.0]
os.makedirs('out/render',exist_ok=True); os.makedirs('out/bad',exist_ok=True)
for _r,_,_fs in os.walk('out/pdf'):
    for _f in sorted(_fs):
        if not _f.endswith('.pdf'): continue
        _c2='_双栏' in _f; _doc=_pd.PdfDocument(os.path.join(_r,_f)); _iss=[]
        for _i in range(len(_doc)):
            _im=_doc[_i].render(scale=3).to_pil().convert('L'); _a=_np.array(_im); _H,_W=_a.shape; _px=_W/210.0; _ink=_a<140
            _T=int(MGN[0]*_px); _B=_H-int(MGN[2]*_px); _L=int(MGN[3]*_px); _R=_W-int(MGN[1]*_px)
            _band=_ink[_T:_B]; _y0=0
            if _i==0:
                _fr=_band[:int(70*_px),_L:_R].mean(1); _ln=_np.where(_fr>0.7)[0]
                if len(_ln): _y0=int(_ln[0])+int(2*_px)
            _p=[]
            if _band[:,_R+int(1.5*_px):].any(): _p.append('右边界外')
            if _band[:,:max(0,_L-int(1.5*_px))].any(): _p.append('左边界外')
            if _c2:
                _m=(_L+_R)//2; _g=_band[_y0:,_m-int(2*_px):_m+int(2*_px)]
                if int(_g.any(1).sum())>3: _p.append('越过双栏中缝')
            if _i==0: _im.save('out/render/'+_f[:-4]+'_p1.png')
            if _p: _iss.append((_i+1,_p)); _im.save('out/bad/'+_f[:-4]+'_p'+str(_i+1)+'.png')
        chk('PDF 不越界：'+_f+' '+(str(_iss) if _iss else ''),not _iss)
chk('实时预览不越界 '+str(globals().get('PVBAD',[])),not globals().get('PVBAD',[]))
chk('没有脚本执行错误',not any(x.startswith('EVAL ERR') for x in LOG))
ST['errlog']=ev('__errText()')
json.dump({'state':ST,'log':LOG},open('out/result.json','w'),ensure_ascii=False,indent=1)
open('out/logcat.txt','w').write(A('logcat','-d','-t','3000'))
print(json.dumps(ST,ensure_ascii=False)[:2000]); print('\n'.join(LOG)[:4000])
if FAIL: print('失败项：',FAIL); sys.exit(1)
print('全部通过')
