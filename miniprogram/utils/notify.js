/**
 * 订阅消息模块
 */

function requestSubscribe(tmplIds) {
  return new Promise((resolve, reject) => {
    wx.requestSubscribeMessage({
      tmplIds,
      success(res) {
        const result = {};
        tmplIds.forEach(id => {
          result[id] = res[id] || 'reject';
        });
        resolve(result);
      },
      fail(err) {
        reject(err);
      },
    });
  });
}

module.exports = { requestSubscribe };
