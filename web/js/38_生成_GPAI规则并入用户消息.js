// ===== v2.9.2：GPAI 服务端会忽略 system 消息（实测：不写【图N】、不标时间戳），改为并入第一条 user 消息 =====
(function () {
  const isGp = () => /ts\.net|gpai/i.test(S.base || "");
  function merge(messages) {
    const sys = messages.filter(m => m.role === "system").map(m => typeof m.content === "string" ? m.content : "").join("\n\n");
    if (!sys) return messages;
    const rest = messages.filter(m => m.role !== "system").map(m => Object.assign({}, m));
    const head = "【任务规则，必须严格遵守】\n" + sys + "\n\n【以下是任务内容】\n";
    const u = rest.find(m => m.role === "user");
    if (!u) return [{ role: "user", content: head }].concat(rest);
    if (typeof u.content === "string") u.content = head + u.content;
    else if (Array.isArray(u.content)) u.content = [{ type: "text", text: head }].concat(u.content);
    return rest;
  }
  const _chat = chat;
  chat = function (messages, opts) { return _chat.call(this, isGp() ? merge(messages || []) : messages, opts); };
  window.__gpMerge = merge;
})();
