
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

""" + "\\n\\n".join("【例%d】这是一段用来撑满页面的测试正文，检查双栏排版时文字是否铺满整页宽度，而不是缩在左上角。氮原子的孤对电子与苯环大π键共轭后，电子云向环上分散，碱性减弱。" % i for i in range(1,26))
item={'title':'共轭影响碱性','bvid':'BV1test','p':1,'md':MD,'srt':'','kind':'note','time':int(time.time()*1000),'tag':'化学'}
ev('localStorage.setItem("vtn_hist",JSON.stringify(['+json.dumps(item,ensure_ascii=False)+']));location.reload();1')
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
ev('(function(){show(loadHist()[0]);return 1})()'); time.sleep(3)
for col in ['1','2']:
    before=A('shell','ls','/sdcard/Download/VideoToNote/')
    LOG.append('pdfbtn '+str(clk('#v5pdf'))); time.sleep(3)
    LOG.append('segs '+str(ev('JSON.stringify(Array.from(document.querySelectorAll(".seg")).map(s=>[s.dataset.k,Array.from(s.querySelectorAll("button")).map(b=>b.dataset.v+":"+b.textContent.trim()+(b.classList.contains("on")?"*":""))]))')))
    LOG.append('col '+str(clk('.seg[data-k="col"] button[data-v="'+col+'"]'))); time.sleep(2)
    shot('06_导出面板_col'+col)
    LOG.append('go '+str(clk('[data-a="go"]')))
    for _ in range(60):
        time.sleep(3)
        if A('shell','ls','/sdcard/Download/VideoToNote/')!=before: break
    time.sleep(4); shot('07_导出完成_col'+col)
    ev('document.querySelectorAll(".vDlgM").forEach(x=>x.remove());1')
A('pull','/sdcard/Download/VideoToNote/','out/pdf/')
A('shell','settings','put','system','user_rotation','1'); time.sleep(5)
ev('(function(){try{closeDet()}catch(e){};tab("gen");return 1})()'); time.sleep(2); state('port_gen'); shot('08_竖屏_生成')
json.dump({'state':ST,'log':LOG},open('out/result.json','w'),ensure_ascii=False,indent=1)
open('out/logcat.txt','w').write(A('logcat','-d','-t','3000'))
print(json.dumps(ST,ensure_ascii=False)[:2000]); print('\n'.join(LOG)[:4000])
