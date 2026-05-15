/**
 * API 请求封装 + 离线降级
 * 网络超时时自动使用本地数据
 */
const config = require('../config');
const { defaultFormTemplate } = require('./mock-data');

const apiBaseUrl = () => config.apiBaseUrl;
let isRetrying = false;

function getToken() {
  return wx.getStorageSync('user_token') || '';
}

function request(method, url, data = {}) {
  const token = getToken();
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiBaseUrl() + url,
      method,
      data,
      timeout: 10000,
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
      },
      success(res) {
        if (res.statusCode === 401) {
          if (isRetrying) { reject({ message: '登录异常', code: 401 }); return; }
          isRetrying = true;
          wx.removeStorageSync('user_token');
          const app = getApp();
          app.login().then((user) => {
            isRetrying = false;
            if (user) request(method, url, data).then(resolve).catch(reject);
            else reject({ message: '登录失败', code: 401 });
          }).catch(() => { isRetrying = false; reject({ message: '登录失败', code: 401 }); });
          return;
        }
        if (res.data.code === 0) resolve(res.data.data);
        else reject({ message: res.data.message || '请求失败', code: res.data.code });
      },
      fail(err) {
        reject({ message: '网络请求失败', err, isTimeout: err.errMsg && err.errMsg.includes('timeout') });
      },
    });
  });
}

// 带离线降级的 forms 请求
async function getForms() {
  try {
    return await request('GET', '/forms');
  } catch (e) {
    if (e.isTimeout || e.message === '网络请求失败') {
      return [
        { id: defaultFormTemplate.id, title: defaultFormTemplate.title, description: defaultFormTemplate.description, version: defaultFormTemplate.version, created_at: '离线模式' }
      ];
    }
    throw e;
  }
}

async function getFormDetail(formId) {
  try {
    return await request('GET', '/forms/' + formId);
  } catch (e) {
    if (e.isTimeout || e.message === '网络请求失败') {
      return defaultFormTemplate;
    }
    throw e;
  }
}

module.exports = {
  get: (url) => {
    if (url === '/forms') return getForms();
    const match = url.match(/^\/forms\/(\d+)$/);
    if (match) return getFormDetail(parseInt(match[1]));
    return request('GET', url);
  },
  post: (url, data) => request('POST', url, data),
  put: (url, data) => request('PUT', url, data),
  del: (url) => request('DELETE', url),
};
