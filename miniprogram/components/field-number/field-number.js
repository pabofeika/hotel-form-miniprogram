Component({
  properties: { label: { type: null, value: '' }, required: { type: null, value: false }, placeholder: { type: String, value: '请输入数字' } },
  methods: { onInput(e) { this.triggerEvent('change', e.detail.value); } },
});
