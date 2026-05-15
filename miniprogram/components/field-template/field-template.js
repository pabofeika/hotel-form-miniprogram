Component({
  properties: {
    label: { type: null, value: '' },
    required: { type: null, value: false },
    value: { type: null, value: '' },
    options: { type: Array, value: [] },
  },

  data: {
    selectedValue: '',
  },

  observers: {
    value(v) {
      this.setData({ selectedValue: v || '' });
    },
  },

  methods: {
    onSelect(e) {
      const val = e.currentTarget.dataset.value;
      this.setData({ selectedValue: val });
      this.triggerEvent('change', val);
    },
  },
});
