# 把 web/js/*.js 按文件名顺序拼回 index.html 的主脚本位置（编译时运行，运行效果与单文件完全一样）
import glob, sys
h = open("web/index.html", encoding="utf-8").read()
assert h.count("/*@@APP_JS@@*/") == 1, "index.html 里找不到唯一的脚本占位符"
js = "".join(open(p, encoding="utf-8").read() for p in sorted(glob.glob("web/js/*.js")))
open(sys.argv[1], "w", encoding="utf-8").write(h.replace("/*@@APP_JS@@*/", js))
print("拼接", len(glob.glob("web/js/*.js")), "个脚本文件，", len(js), "字符")
