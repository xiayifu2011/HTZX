/* ==================================================================
 * 启动入口
 * ------------------------------------------------------------------
 * 所有文件加载完毕后，由这里点火：
 *   读本地设置（主题）→ 应用主题 → 刷文案 → 渲染存档槽。
 * 这是最后一个加载的 js 文件。
 * ================================================================== */

    (function boot() {
      // 1. 先读设置：主题会立刻写到 :root 上
      if (typeof loadSettings === "function") loadSettings();

      // 2. 应用主题皮肤（校名、校训、滚动条开关也在里面）
      applyTheme();

      // 3. 把界面文案刷到页面上（现在固定中文）
      if (typeof applyLangToDom === "function") applyLangToDom();
      if (typeof refreshDocTitle === "function") refreshDocTitle();

      // 4. 主菜单：存档槽 + 主题格子 + 说明文案
      renderSlots();
      if (typeof refreshSeason === "function") refreshSeason(true);
      if (typeof renderStartExtras === "function") renderStartExtras();
    })();
