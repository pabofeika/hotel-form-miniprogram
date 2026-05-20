Component({
  properties: {
    options: { type: Array, value: [] },
    value: { type: null, value: '' }
  },

  data: {
    currentValue: '',
    previewVisible: false,
    previewImageUrl: ''
  },

  observers: {
    value(v) {
      this.setData({ currentValue: v || '' });
    }
  },

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

      this.setData({
        previewVisible: true,
        previewImageUrl: url
      });
    },

    closePreview() {
      this.setData({
        previewVisible: false,
        previewImageUrl: ''
      });
    },

    stopPreviewTap() {},

    onImageLoad(e) {
      console.log('[field-template] image load success:', e.currentTarget.dataset.url);
    },

    onImageError(e) {
      console.error('[field-template] image load error:', {
        url: e.currentTarget.dataset.url,
        detail: e.detail
      });
      wx.showToast({ title: '图片加载失败', icon: 'none' });
    },

    onPreviewImageLoad() {
      console.log('[field-template] preview image load success:', this.data.previewImageUrl);
    },

    onPreviewImageError(e) {
      console.error('[field-template] preview image load error:', {
        url: this.data.previewImageUrl,
        detail: e.detail
      });
      wx.showToast({ title: '预览图片加载失败', icon: 'none' });
    }
  }
});
