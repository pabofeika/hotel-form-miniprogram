Component({
  properties: {
    options: { type: Array, value: [] },
    value: { type: null, value: '' }
  },

  data: {
    currentValue: '',
    previewVisible: false,
    previewImageUrl: '',
    previewIndex: 0,
    previewPrevDisabled: true,
    previewNextDisabled: false,
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

      const options = this.properties.options || [];
      const idx = options.findIndex(o => {
        const targetUrl = o.image || o.thumb;
        return targetUrl === url;
      });

      this.setData({
        previewVisible: true,
        previewImageUrl: url,
        previewIndex: idx >= 0 ? idx : 0,
        previewPrevDisabled: idx <= 0,
        previewNextDisabled: idx >= options.length - 1
      });
    },

    previewPrev() {
      const { previewIndex } = this.data;
      const options = this.properties.options || [];
      const newIdx = previewIndex - 1;
      if (newIdx < 0) return;

      const item = options[newIdx];
      const url = item.image || item.thumb;

      this.setData({
        previewIndex: newIdx,
        previewImageUrl: url,
        previewPrevDisabled: newIdx <= 0,
        previewNextDisabled: newIdx >= options.length - 1
      });
    },

    previewNext() {
      const { previewIndex } = this.data;
      const options = this.properties.options || [];
      const newIdx = previewIndex + 1;
      if (newIdx >= options.length) return;

      const item = options[newIdx];
      const url = item.image || item.thumb;

      this.setData({
        previewIndex: newIdx,
        previewImageUrl: url,
        previewPrevDisabled: newIdx <= 0,
        previewNextDisabled: newIdx >= options.length - 1
      });
    },

    closePreview() {
      this.setData({
        previewVisible: false,
        previewImageUrl: ''
      });
    },

    stopPreviewTap() {},

    onTouchStart(e) {
      this._touchStartY = e.touches[0].clientY;
    },

    onTouchEnd(e) {
      const startY = this._touchStartY || 0;
      const endY = e.changedTouches[0].clientY;
      const deltaY = endY - startY;
      const threshold = 60;

      if (deltaY > threshold) {
        // 下滑 → 上一个
        if (!this.data.previewPrevDisabled) this.previewPrev();
      } else if (deltaY < -threshold) {
        // 上滑 → 下一个
        if (!this.data.previewNextDisabled) this.previewNext();
      }
    },

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
