/* ==================================================================
 * 内容层 · 文档实时更新
 * ==================================================================
 * 三份文档（新手介绍 / 更新日志 / 鸣谢列表）原来要先跑
 *   node tools/sync-docs.js   （或双击 sync-docs.bat）
 * 把 docs/*.md 转成 js/00-docs.js 才能在游戏里看到 —— 改一句文案也要重跑一次。
 *
 * 现在改成三层，哪层能用用哪层，改完立刻看得见：
 *   ① 网络层：用 start-server.bat 起服务时，直接 fetch docs/*.md，改完刷新即生效
 *   ② 本地层：双击 index.html 时浏览器不让读 .md，改用「导入」按钮
 *             （选文件 或 粘贴），内容存进 localStorage，之后一直生效
 *   ③ 兜底层：都没有就用 js/00-docs.js 里那份（sync-docs 生成的）
 *
 * 维护等级：内容层（改文案的同学看这里就够了）
 * ================================================================== */

    const LIVE_DOCS = [
      {key: "guide", file: "guide.md", title: "新手介绍"},
      {key: "changelog", file: "changelog.md", title: "更新日志"},
      {key: "credits", file: "credits.md", title: "鸣谢列表"}
    ];

    const DOCS_CACHE_KEY = "htzx_docs_v1";

    /* 极简 Markdown → HTML（和 tools/sync-docs.js 保持同一套规则） */

    function mdToHtml(src) {
      const lines = String(src == null ? "" : src).replace(/\r\n/g, "\n").split("\n");
      const out = [];
      let inList = false, inTable = false;

      const inline = t => String(t)
        .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<i>$2</i>");

      const closeList = () => {if (inList) {out.push("</ul>"); inList = false;}};
      const closeTable = () => {if (inTable) {out.push("</table>"); inTable = false;}};

      for (let raw of lines) {
        const line = raw.trim();
        if (!line) {closeList(); closeTable(); continue;}

        if (/^\|(.+)\|$/.test(line)) {
          const cells = line.slice(1, -1).split("|").map(c => c.trim());
          if (!inTable) {out.push('<table class="mdtable">'); inTable = true;}
          const isSep = cells.every(c => /^[-: ]+$/.test(c));
          if (isSep) continue;
          out.push("<tr>" + cells.map(c => `<${inTable && out.length ? "td" : "td"}>${inline(c)}</td>`).join("") + "</tr>");
          continue;
        }
        closeTable();

        if (/^---+$/.test(line)) {closeList(); out.push('<hr class="mdhr">'); continue;}

        let m;
        if ((m = line.match(/^(#{1,6})\s+(.*)$/))) {
          closeList();
          const lv = Math.min(6, m[1].length + 1);
          out.push(`<h${lv}>${inline(m[2])}</h${lv}>`);
          continue;
        }
        if ((m = line.match(/^>\s?(.*)$/))) {
          closeList();
          out.push(`<blockquote>${inline(m[1])}</blockquote>`);
          continue;
        }
        if (/^([-*])\s+/.test(line)) {
          if (!inList) {out.push("<ul>"); inList = true;}
          out.push(`<li>${inline(line.replace(/^([-*])\s+/, ""))}</li>`);
          continue;
        }
        closeList();
        out.push(`<p>${inline(line)}</p>`);
      }
      closeList(); closeTable();
      return out.join("\n");
    }

    /* ---------------- 本地缓存（localStorage） ---------------- */

    function docsCache() {
      try {return JSON.parse(localStorage.getItem(DOCS_CACHE_KEY)) || {};} catch (e) {return {};}
    }

    function docsCacheSet(key, md) {
      try {
        const c = docsCache();
        c[key] = {md: md, at: new Date().toLocaleString()};
        localStorage.setItem(DOCS_CACHE_KEY, JSON.stringify(c));
        return true;
      } catch (e) {return false;}
    }

    function docsCacheClear(key) {
      try {
        const c = docsCache();
        if (key) delete c[key]; else c = {};
        localStorage.setItem(DOCS_CACHE_KEY, JSON.stringify(key ? c : {}));
      } catch (e) { }
    }

    /* ---------------- 取一份文档的正文 ---------------- */

    async function fetchDocMd(key) {
      const d = LIVE_DOCS.find(x => x.key === key);
      if (!d) return null;
      // 用 http 打开时才能 fetch；file:// 下会抛异常，直接回落
      if (location.protocol === "file:") return null;
      try {
        const r = await fetch("docs/" + d.file, {cache: "no-store"});
        if (!r.ok) return null;
        return await r.text();
      } catch (e) {return null;}
    }

    /* 打开一份文档：优先网络 → 本地缓存 → 兜底 00-docs.js */

    async function openDocLive(key) {
      const d = LIVE_DOCS.find(x => x.key === key);
      if (!d) {if (typeof toast === "function") toast(L("doc.missing")); return;}

      let md = null, from = "";
      const cached = docsCache()[key];
      if (cached && cached.md) {md = cached.md; from = "cache";}

      const net = await fetchDocMd(key);
      if (net) {md = net; from = "net";}

      if (!md && typeof GAME_DOCS !== "undefined" && GAME_DOCS[key]) {
        // 兜底：用 sync-docs 生成的那份
        renderDocModal(key, d.title, GAME_DOCS[key].html, "builtin");
        return;
      }
      if (!md) {if (typeof toast === "function") toast(L("doc.missing")); return;}
      renderDocModal(key, d.title, mdToHtml(md), from);
    }

    function renderDocModal(key, title, html, from) {
      const srcNote = from === "net" ? L("doc.srcNet")
        : (from === "cache" ? L("doc.srcCache") : L("doc.srcBuiltin"));
      showModal(title,
        `<div class="markdown">${html}</div>
         <div class="docfoot">${srcNote}</div>`,
        [
          {t: L("doc.import"), fn: () => openDocImport(key)},
          {t: L("doc.close"), fn: () => { }}
        ], null, false, true, {kind: "doc"});
    }

    /* ==================================================================
     * 导入：选文件 或 粘贴
     * ------------------------------------------------------------------
     * 双击 index.html 时这是唯一的实时更新方式 ——
     * 选一个 .md 文件（FileReader 读本地文件是允许的，不受 CORS 限制），
     * 内容立刻渲染并存进 localStorage，下次打开还在。
     * ================================================================== */

    function openDocImport(key) {
      const d = LIVE_DOCS.find(x => x.key === key);
      if (!d) return;
      const has = !!(docsCache()[key] && docsCache()[key].md);

      showModal(L("doc.importTitle", d.title),
        `<div style="line-height:1.9">
          <div style="color:var(--dim);font-size:.85rem">${L("doc.importTip", d.file)}</div>
          <div style="margin:8px 0">
            <input type="file" id="docFile" accept=".md,.txt"
              style="font-size:.82rem;color:var(--txt)">
          </div>
          <div style="color:var(--dim);font-size:.8rem">${L("doc.importOr")}</div>
          <textarea id="docPaste" rows="7" placeholder="${L("doc.importPh")}"
            style="width:100%;margin-top:6px;padding:8px 10px;border-radius:8px;border:1px solid var(--line);background:var(--panel2);color:var(--txt);font-size:.86rem;line-height:1.5"></textarea>
        </div>`,
        [
          {t: L("doc.doImport"), fn: () => doDocImport(key)},
          has ? {t: L("doc.clearCache"), fn: () => {docsCacheClear(key); toast(L("doc.cleared")); openDocLive(key);}} : null,
          {t: L("modal.cancel"), fn: () => { }}
        ].filter(Boolean), null, false, true, {kind: "free"});
    }

    function doDocImport(key) {
      const fileEl = document.getElementById("docFile");
      const ta = document.getElementById("docPaste");
      const paste = ta ? (ta.value || "").trim() : "";

      const finish = md => {
        if (!md || !md.trim()) {if (typeof toast === "function") toast(L("doc.empty")); return;}
        docsCacheSet(key, md);
        toast(L("doc.imported"));
        openDocLive(key);
      };

      if (paste) {finish(paste); return;}

      if (fileEl && fileEl.files && fileEl.files[0]) {
        const f = fileEl.files[0];
        const fr = new FileReader();
        fr.onload = () => finish(String(fr.result || ""));
        fr.onerror = () => {if (typeof toast === "function") toast(L("doc.readFail"));};
        fr.readAsText(f, "utf-8");
        return;
      }
      if (typeof toast === "function") toast(L("doc.empty"));
    }
