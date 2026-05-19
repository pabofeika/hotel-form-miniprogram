Component({
  properties: {
    label: { type: null, value: '' },
    required: { type: null, value: false },
    options: { type: Array, value: [] },
    value: { type: null, value: [] },
  },

  data: {
    selected: [],
  },

  observers: {
    value(v) {
      this.setData({ selected: Array.isArray(v) ? v : (v ? [v] : []) });
    },
  },

  methods: {
    isSelected(val) {
      return this.data.selected.includes(val);
    },

    onChange(e) {
      const val = e.detail.value || [];
      this.setData({ selected: val });
      this.triggerEvent('change', val);
    },
  },
});
