Component({
  properties: {
    label: { type: String, value: '' },
    required: { type: null, value: false },
    placeholder: { type: String, value: '请输入' },
  },
  methods: {
    onInput(e) {
      // 极轻量：无 setData、无计算，只通知父组件
      this.triggerEvent('change', e.detail.value);
    },
  },
});
