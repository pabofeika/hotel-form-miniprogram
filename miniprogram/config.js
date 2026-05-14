// Environment configuration
const app = getApp();

module.exports = {
  get apiBaseUrl() {
    return app.globalData.apiBaseUrl;
  },
  set apiBaseUrl(url) {
    app.globalData.apiBaseUrl = url;
  },
};
