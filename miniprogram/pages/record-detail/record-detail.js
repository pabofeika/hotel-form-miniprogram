const { formatDate, formatStatus } = require('../../utils/util');

Page({
  data: {
    order: null,
    previewItems: [],
    loading: true,
  },

  onLoad(options) {
    console.log('[record-detail] onLoad options:', options);

    // 支持 orderId 和 id 两种参数
    const orderId = options.orderId || options.id || '';
    const order = wx.getStorageSync('last_order_detail') || {};

    // 如果 storage 里的订单 ID 不匹配，说明是旧订单列表点进来的
    if (order.id && String(order.id) !== String(orderId)) {
      console.log('[record-detail] storage订单与请求ID不匹配，清空');
      this.setData({ order: null, previewItems: [], loading: false });
      return;
    }

    console.log('[record-detail] 读取订单:', {
      orderId: order.id,
      formKeys: Object.keys(order.formValues || {}),
      previewItemsLength: (order.previewItems || []).length,
    });

    this.setData({
      order,
      previewItems: order.previewItems || [],
      loading: false,
    });
  },

  formatDate,
  formatStatus,
});
