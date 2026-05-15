Component({
  properties: { placeholder: { type: String, value: '请上传文件' }, value: { type: null, value: '' } },
  data: { fileName: '' },
  observers: { value(v) { this.setData({ fileName: v || '' }); } },
  methods: {
    chooseFile() {
      wx.chooseMessageFile({
        count: 1, type: 'file', extension: ['apk', 'zip'],
        success: (res) => {
          const file = res.tempFiles[0];
          this.setData({ fileName: file.name });
          this.triggerEvent('change', file.name);
        },
      });
    },
  },
});
