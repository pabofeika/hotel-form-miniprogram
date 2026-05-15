Component({
  properties: {
    label: { type: String, value: '' },
    required: { type: null, value: false },
    placeholder: { type: String, value: '请输入邮箱' },
  },
  methods: {
    onBlur(e) { this.triggerEvent('change', e.detail.value); },
  },
});
