Component({
  properties: { options: { type: Array, value: [] }, value: { type: null, value: '' } },
  data: { currentValue: '', previewVisible: false, previewImageUrl: '' },
  observers: { value(v) { this.setData({ currentValue: v || '' }); } },
  methods: {
    onSelect(e) {
      const val = e.currentTarget.dataset.value;
      this.setData({ currentValue: val });
      this.triggerEvent('change', val);
    },
    openPreview(e) {
      const url = e.currentTarget.dataset.url;
      console.log('[preview] url:', url);
      if (!url) {
        wx.showToast({ title: '图片地址为空', icon: 'none' });
        return;
      }
      wx.previewImage({ current: url, urls: [url] });
    },
  },
});
