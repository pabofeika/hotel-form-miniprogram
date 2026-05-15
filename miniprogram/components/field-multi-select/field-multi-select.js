Component({
  properties: {
    label: { type: null, value: '' },
    required: { type: null, value: false },
    options: { type: Array, value: [] },
    value: { type: null, value: [] },
  },

  data: {
    selected: [],
    tick: 0,
  },

  observers: {
    value(v) {
      const arr = Array.isArray(v) ? v : (v ? [v] : []);
      this.setData({ selected: arr, tick: this.data.tick + 1 });
    },
  },

  methods: {
    isSelected(val) {
      return this.data.selected.includes(val);
    },

    toggleOption(e) {
      const val = e.currentTarget.dataset.value;
      let arr = [...this.data.selected];

      if (val === 'none' || (typeof val === 'string' && val.includes('无'))) {
        arr = [val];
      } else {
        const idx = arr.indexOf(val);
        if (idx >= 0) {
          arr.splice(idx, 1);
        } else {
          arr = arr.filter(v => v !== 'none' && (typeof v !== 'string' || !v.includes('无')));
          arr.push(val);
        }
      }

      this.setData({ selected: arr });
      this.triggerEvent('change', arr);
    },
  },
});
