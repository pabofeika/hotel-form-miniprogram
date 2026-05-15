Component({
  properties: {
    label: { type: String, value: '' },
    required: { type: null, value: false },
    placeholder: { type: String, value: '请输入邮箱' },
    value: { type: String, value: '' },
  },
  data: { inputValue: '' },
  attached() { this.setData({ inputValue: this.properties.value || '' }); },
  observers: { value(v) { if (v !== this.data.inputValue) this.setData({ inputValue: v || '' }); } },
  methods: {
    onInput(e) { const val = e.detail.value; this.setData({ inputValue: val }); this.triggerEvent('change', val); },
  },
});
