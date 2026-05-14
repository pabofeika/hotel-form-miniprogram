/**
 * API 请求封装
 * 统一处理 token 注入、错误处理
 */
const config = require('../config');

const apiBaseUrl = () => config.apiBaseUrl;

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
      header: {
        'Content-Type': method === 'POST' && data instanceof wx.UploadFile
          ? 'multipart/form-data'
          : 'application/json',
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
      },
      success(res) {
        if (res.statusCode === 401) {
          // Token expired, redirect to login
          wx.removeStorageSync('user_token');
          const app = getApp();
          app.login().then(() => {
            // Retry the request
            request(method, url, data).then(resolve).catch(reject);
          });
          return;
        }
        if (res.data.code === 0) {
          resolve(res.data.data);
        } else {
          reject({ message: res.data.message || '请求失败', code: res.data.code });
        }
      },
      fail(err) {
        reject({ message: '网络请求失败', err });
      },
    });
  });
}

module.exports = {
  get(url) { return request('GET', url); },
  post(url, data) { return request('POST', url, data); },
  put(url, data) { return request('PUT', url, data); },
  del(url) { return request('DELETE', url); },
};
