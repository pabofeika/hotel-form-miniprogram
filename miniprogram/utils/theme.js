/**
 * 主题管理工具
 */
const THEME_KEY = 'app_theme';

/**
 * 从 app.wxss 提取的亮/暗主题核心色板（行内样式用）
 */
const palettes = {
  light: {
    '--color-bg': '#f4f6fa',
    '--color-bg-card': '#ffffff',
    '--color-bg-input': '#f0f2f5',
    '--color-bg-hover': '#eef2ff',
    '--color-glass': 'rgba(255,255,255,0.82)',
    '--color-text-primary': '#0f172a',
    '--color-text-secondary': '#475569',
    '--color-text-tertiary': '#94a3b8',
    '--color-border': '#e8ecf1',
    '--color-border-active': '#bfdbfe',
    '--color-primary': '#2563eb',
    '--color-primary-light': '#dbeafe',
    '--color-info-bg': '#eff6ff',
    '--color-error': '#dc2626',
    '--color-error-bg': '#fef2f2',
    '--color-success-bg': '#f0fdf4',
    '--color-warning-bg': '#fffbeb',
  },
  dark: {
    '--color-bg': '#0f1117',
    '--color-bg-card': '#1a1d27',
    '--color-bg-input': '#232734',
    '--color-bg-hover': '#1e2940',
    '--color-glass': 'rgba(26,29,39,0.88)',
    '--color-text-primary': '#f1f5f9',
    '--color-text-secondary': '#cbd5e1',
    '--color-text-tertiary': '#64748b',
    '--color-border': '#2a2e3a',
    '--color-border-active': '#1e40af',
    '--color-primary': '#60a5fa',
    '--color-primary-light': '#1e3a5f',
    '--color-info-bg': '#0d1f3c',
    '--color-error': '#f87171',
    '--color-error-bg': '#2d1115',
    '--color-success-bg': '#0d2818',
    '--color-warning-bg': '#281f0d',
  },
};

function getTheme() {
  return wx.getStorageSync(THEME_KEY) || 'light';
}

function setTheme(t) {
  wx.setStorageSync(THEME_KEY, t);
}

function toggleTheme() {
  setTheme(getTheme() === 'light' ? 'dark' : 'light');
}

/**
 * 生成行内 CSS 变量字符串，直接用在页面根元素 style 上
 * 例如：<view style="{{rootStyle}}">
 */
function getThemeStyle(theme) {
  const vars = palettes[theme] || palettes.light;
  return Object.entries(vars)
    .map(([k, v]) => `${k}: ${v}`)
    .join('; ');
}

module.exports = { getTheme, setTheme, toggleTheme, getThemeStyle };
