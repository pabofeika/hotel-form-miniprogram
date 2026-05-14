Component({
  properties: {
    label: { type: String, value: '' },
    required: { type: [Boolean, Number], value: false },
    placeholder: { type: String, value: '请输入' },
    value: { type: String, value: '' },
  },
  methods: {
    onInput(e) { this.triggerEvent('change', e.detail.value); },
  },
});
