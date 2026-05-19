Component({
  properties: { options: { type: Array, value: [] }, value: { type: null, value: '' } },
  data: { currentValue: '' },
  observers: { value(v) { this.setData({ currentValue: v || '' }); } },
  methods: {
    onSelect(e) {
      const val = e.currentTarget.dataset.value;
      this.setData({ currentValue: val });
      this.triggerEvent('change', val);
    },

    onPreviewImage(e) {
      const url = e.currentTarget.dataset.url;
      console.log('[field-template] preview url:', url);

      if (!url) {
        wx.showToast({ title: '图片地址为空', icon: 'none' });
        return;
      }

      wx.previewImage({
        current: url,
        urls: [url],
        fail(err) {
          console.error('[field-template] previewImage fail:', err);
          wx.showToast({ title: '图片预览失败', icon: 'none' });
        },
      });
    },

    onImageLoad(e) {
      console.log('[field-template] image load success:', e.currentTarget.dataset.url);
    },

    onImageError(e) {
      console.error('[field-template] image load error:', {
        url: e.currentTarget.dataset.url,
        detail: e.detail,
      });
      wx.showToast({ title: '图片加载失败', icon: 'none' });
    },
  },
});
