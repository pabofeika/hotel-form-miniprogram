Component({
  properties: {
    label: { type: String, value: '' },
    required: { type: null, value: false },
    placeholder: { type: String, value: '请输入数字' },
  },
  methods: {
    onBlur(e) { this.triggerEvent('change', e.detail.value); },
  },
});
