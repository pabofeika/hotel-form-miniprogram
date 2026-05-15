Component({
  properties: {
    label: { type: String, value: '' },
    required: { type: null, value: false },
    placeholder: { type: String, value: '请输入数字' },
    value: { type: null, value: '' },
  },
  data: { inputValue: '' },
  attached() { this.setData({ inputValue: this.properties.value !== undefined && this.properties.value !== null ? String(this.properties.value) : '' }); },
  observers: { value(v) { const s = v !== undefined && v !== null ? String(v) : ''; if (s !== this.data.inputValue) this.setData({ inputValue: s }); } },
  methods: {
    onInput(e) { const val = e.detail.value; this.setData({ inputValue: val }); this.triggerEvent('change', val); },
  },
});
