Component({
  properties: {
    label: { type: String, value: '' },
    required: { type: null, value: false },
    placeholder: { type: String, value: '请上传文件' },
    value: { type: String, value: '' },
  },

  data: {
    fileName: '',
  },

  observers: {
    value(val) { this.setData({ fileName: val || '' }); },
  },

  methods: {
    chooseFile() {
      wx.chooseMessageFile({
        count: 1,
        type: 'file',
        extension: ['apk', 'zip'],
        success: (res) => {
          const file = res.tempFiles[0];
          this.setData({ fileName: file.name });
          this.triggerEvent('change', file.name);
        },
      });
    },
  },
});
