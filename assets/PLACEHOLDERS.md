# 图片占位清单（需求15：塔中特色图片已移除）

背景/立行号列车/林荫道全部降级为 CSS 渐变，不加载任何图片。
恢复：把图放 `assets/`，在 `theme.js` 对应主题补 `body.style.backgroundImage = url(...)` 即可，无需改 HTML。
