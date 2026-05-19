const api = require('../../utils/api');
const { formatDate, formatStatus } = require('../../utils/util');
const theme = require('../../utils/theme');

Page({
  data: {
    statusTabs: [
      { label: '全部', value: '' },
      { label: '草稿', value: 'draft' },
      { label: '已提交', value: 'submitted' },
      { label: '已完成', value: 'approved' },
    ],
    currentStatus: '',
    records: [],
    page: 1,
    loading: false,
    hasMore: true,
    theme: 'light',
    rootStyle: '',
  },

  onLoad() {
    const t = theme.getTheme();
    this.setData({ theme: t, rootStyle: theme.getThemeStyle(t) });
    theme.syncTabBar(t);
    this.loadRecords();
  },

  onShow() {
    theme.syncTabBar(theme.getTheme());
    if (this.data.page > 1) {
      this.loadRecords(true);
    }
  },

  switchTab(e) {
    const status = e.currentTarget.dataset.value;
    this.setData({ currentStatus: status, records: [], page: 1, hasMore: true });
    this.loadRecords();
  },

  async loadRecords(reset = false) {
    if (this.data.loading) return;
    this.setData({ loading: true });

    try {
      const result = await api.get(`/records?status=${this.data.currentStatus}&page=${this.data.page}&page_size=20`);
      const records = reset ? result.records : [...this.data.records, ...result.records];
      this.setData({
        records,
        hasMore: this.data.page < result.pagination.total_pages,
        loading: false,
      });
    } catch (err) {
      this.setData({ loading: false });
      wx.showToast({ title: err.message || '加载失败', icon: 'none' });
    }
  },

  viewDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/record-detail/record-detail?id=${id}` });
  },

  formatDate,
  formatStatus,

  onReachBottom() {
    if (this.data.hasMore) {
      this.setData({ page: this.data.page + 1 });
      this.loadRecords();
    }
  },

  toggleTheme() {
    theme.toggleTheme();
    const t = theme.getTheme();
    this.setData({ theme: t, rootStyle: theme.getThemeStyle(t) });
    theme.syncTabBar(t);
  },

  setTheme(t) {
    this.setData({ theme: t });
    theme.syncTabBar(t);
  },
  },
});
