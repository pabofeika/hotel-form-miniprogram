/**
 * 主题管理工具
 */
const THEME_KEY = 'app_theme';

/**
 * 获取当前主题
 */
function getTheme() {
  const t = wx.getStorageSync(THEME_KEY);
  return t || 'light';
}

/**
 * 设置主题并同步到页面
 */
function setTheme(theme) {
  wx.setStorageSync(THEME_KEY, theme);
  const pages = getCurrentPages();
  pages.forEach(p => {
    if (p.setTheme) p.setTheme(theme);
  });
  // 给所有页面设置 data-theme 属性
  wx.nextTick(() => {
    const pages = getCurrentPages();
    pages.forEach(p => {
      const page = p;
      if (page.setData) {
        page.setData({ theme });
      }
    });
  });
}

/**
 * 切换主题
 */
function toggleTheme() {
  const current = getTheme();
  setTheme(current === 'light' ? 'dark' : 'light');
}

module.exports = { getTheme, setTheme, toggleTheme };
