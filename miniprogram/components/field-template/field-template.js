Component({
  properties: {
    options: { type: Array, value: [] },
    value: { type: null, value: '' },
  },

  data: { currentValue: '' },

  observers: {
    value(v) { this.setData({ currentValue: v || '' }); },
  },

  methods: {
    onSelect(e) {
      const val = e.currentTarget.dataset.value;
      this.setData({ currentValue: val });
      this.triggerEvent('change', val);
    },
  },
});
