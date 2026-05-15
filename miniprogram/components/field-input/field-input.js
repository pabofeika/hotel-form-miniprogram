Component({
  properties: {
    label: { type: String, value: '' },
    required: { type: null, value: false },
    placeholder: { type: String, value: '请输入' },
    value: { type: String, value: '' },
  },
  data: { inputValue: '' },
  attached() {
    // Initialize from property on component creation
    this.setData({ inputValue: this.properties.value || '' });
  },
  observers: {
    'value'(v) {
      // Only update from parent if user isn't actively typing
      if (v !== this.data.inputValue) {
        this.setData({ inputValue: v || '' });
      }
    },
  },
  methods: {
    onInput(e) {
      const val = e.detail.value;
      this.setData({ inputValue: val });
      this.triggerEvent('change', val);
    },
  },
});
