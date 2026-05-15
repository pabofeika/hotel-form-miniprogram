Component({
  properties: {
    label: { type: String, value: '' },
    required: { type: null, value: false },
    options: { type: Array, value: [] },
    value: { type: Array, value: [] },
  },

  methods: {
    isSelected(val) {
      return (this.data.value || []).includes(val);
    },

    toggleOption(e) {
      const val = e.currentTarget.dataset.value;
      let arr = [...(this.data.value || [])];

      if (val === 'none' || val.includes('无')) {
        arr = [val];
      } else {
        const idx = arr.indexOf(val);
        if (idx >= 0) arr.splice(idx, 1);
        else arr = arr.filter(v => v !== 'none' && !v.includes('无'));
        arr.push(val);
      }

      this.triggerEvent('change', arr);
    },
  },
});
