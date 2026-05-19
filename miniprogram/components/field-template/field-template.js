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
      console.log('[field-template] options:', JSON.stringify(this.properties.options));
      console.log('[field-template] preview url:', url);

      if (!url) {
        wx.showToast({ title: '图片地址为空', icon: 'none' });
        return;
      }

      wx.showLoading({ title: '加载图片' });

      wx.getImageInfo({
        src: url,
        success: (res) => {
          console.log('[field-template] getImageInfo success:', res.path);
          wx.hideLoading();

          wx.previewImage({
            current: res.path,
            urls: [res.path],
            fail: (err) => {
              console.error('[field-template] previewImage fail:', err);
              wx.showToast({ title: '图片预览失败', icon: 'none' });
            },
          });
        },
        fail: (err) => {
          wx.hideLoading();
          console.error('[field-template] getImageInfo fail:', err);
          wx.showToast({ title: '图片读取失败', icon: 'none' });
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
