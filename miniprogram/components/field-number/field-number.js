Component({
  properties: {
    label: { type: String, value: '' },
    required: { type: null, value: false },
    placeholder: { type: String, value: '请输入数字' },
    value: { type: null, value: '' },
  },
  data: { inputValue: '' },
  observers: { value(v) { this.setData({ inputValue: v !== undefined && v !== null ? String(v) : '' }); } },
  methods: {
    onInput(e) { const val = e.detail.value; this.setData({ inputValue: val }); this.triggerEvent('change', val); },
  },
});
