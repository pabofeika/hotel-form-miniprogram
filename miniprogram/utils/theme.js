/**
 * 主题管理工具 - 纯状态管理
 * 页面样式通过 page-{{theme}} class 控制
 */
const THEME_KEY = 'app_theme';

function getTheme() {
  return wx.getStorageSync(THEME_KEY) || 'light';
}

function setTheme(t) {
  wx.setStorageSync(THEME_KEY, t);
}

function toggleTheme() {
  setTheme(getTheme() === 'light' ? 'dark' : 'light');
}

function syncTabBar(theme) {
  const isDark = theme === 'dark';
  try {
    wx.setTabBarStyle({
      color: isDark ? '#8A8F98' : '#999999',
      selectedColor: isDark ? '#90CAF9' : '#2563eb',
      backgroundColor: isDark ? '#111827' : '#FFFFFF',
      borderStyle: isDark ? 'black' : 'white',
    });
    const tabItems = [
      { index: 0, iconPath: isDark ? 'images/home_dark.png' : 'images/home.png', selectedIconPath: isDark ? 'images/home_active_dark.png' : 'images/home_active.png' },
      { index: 1, iconPath: isDark ? 'images/list_dark.png' : 'images/list.png', selectedIconPath: isDark ? 'images/list_active_dark.png' : 'images/list_active.png' },
    ];
    tabItems.forEach(item => wx.setTabBarItem(item));
  } catch (e) {}
}

module.exports = { getTheme, setTheme, toggleTheme, syncTabBar };
