Component({
  properties: { placeholder: { type: String, value: '请输入数字' } },
  methods: { onInput(e) { this.triggerEvent('change', e.detail.value); } },
});
