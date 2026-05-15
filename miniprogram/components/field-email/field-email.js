Component({
  properties: { placeholder: { type: String, value: '请输入邮箱' } },
  methods: { onInput(e) { this.triggerEvent('change', e.detail.value); } },
});
