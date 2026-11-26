# 编译前的脚本检查：语法、空 catch、直接读写 localStorage，任一超标就让编译失败
import re, subprocess, sys
h = open(sys.argv[1], encoding="utf-8").read()
blocks = re.findall(r"<script>(.*?)</script>", h, re.S)
main = max(blocks, key=len); bad = []
for i, b in enumerate(blocks):
    p = "/tmp/chk" + str(i) + ".js"
    open(p, "w", encoding="utf-8").write(b)
    r = subprocess.run(["node", "--check", p], capture_output=True, text=True)
    if r.returncode: bad.append("语法错误（第 " + str(i) + " 段脚本）：" + r.stderr[:600])
nc = len(re.findall(r"catch\s*\(\w+\)\s*\{\s*\}", main))
nl = len(re.findall(r"localStorage\.(?:get|set|remove)Item\(", main))
if nc > 7: bad.append("新增了空的 catch：" + str(nc) + " 处（上限 7）。请写成 catch (e) { __err(e, '位置') }")
if nl > 6: bad.append("新增了直接读写 localStorage：" + str(nl) + " 处（上限 6）。请改用 Store.get/set/del")
dup = {}
for f in re.findall(r"(?m)^function\s+(\w+)", main): dup[f] = dup.get(f, 0) + 1
d = [k for k, v in dup.items() if v > 1]
if d: bad.append("顶层同名函数：" + ", ".join(d))
print("脚本", len(blocks), "段，空 catch", nc, "，直接 localStorage", nl)
if bad: print("\n".join(bad)); sys.exit(1)
print("检查通过")
