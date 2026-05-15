/**
 * 安全导航工具函数
 * 防止 navigateBack 时页面栈不足导致报错
 */

function safeBack(delta = 1) {
  const pages = getCurrentPages();

  if (pages.length > delta) {
    wx.navigateBack({ delta });
  } else {
    wx.reLaunch({
      url: '/pages/index/index',
    });
  }
}

/**
 * 带防重复点击的返回
 */
function backWithGuard(that, delta = 1) {
  if (that._backing) return;
  that._backing = true;

  const pages = getCurrentPages();

  if (pages.length > delta) {
    wx.navigateBack({
      delta,
      complete: () => {
        setTimeout(() => { that._backing = false; }, 500);
      },
    });
  } else {
    wx.reLaunch({
      url: '/pages/index/index',
      complete: () => {
        setTimeout(() => { that._backing = false; }, 500);
      },
    });
  }
}

/**
 * 带 return this 的快速设置，用于防重复点击
 */
function preventDoubleTap(page) {
  if (page._tapping) return true;
  page._tapping = true;
  setTimeout(() => { page._tapping = false; }, 500);
  return false;
}

module.exports = { safeBack, backWithGuard, preventDoubleTap };
