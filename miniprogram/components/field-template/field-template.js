Component({
  properties: { options: { type: Array, value: [] }, value: { type: null, value: '' } },
  data: { currentValue: '' },
  observers: { value(v) { this.setData({ currentValue: v || '' }); } },
  methods: {
    onChange(e) {
      const val = e.detail.value;
      this.setData({ currentValue: val });
      this.triggerEvent('change', val);
    },
  },
});
