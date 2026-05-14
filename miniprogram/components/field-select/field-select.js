Component({
  properties: {
    label: { type: String, value: '' },
    required: { type: [Boolean, Number], value: false },
    placeholder: { type: String, value: '请选择' },
    options: { type: Array, value: [] },
    value: { type: String, value: '' },
  },

  data: {
    optionLabels: [],
    optionValues: [],
    selectedIndex: -1,
    selectedLabel: '',
  },

  observers: {
    'options, value': function (opts, val) {
      const labels = (opts || []).map(o => o.label || o);
      const values = (opts || []).map(o => o.value || o);
      const idx = values.indexOf(val);
      this.setData({
        optionLabels: labels,
        optionValues: values,
        selectedIndex: idx,
        selectedLabel: idx >= 0 ? labels[idx] : '',
      });
    },
  },

  methods: {
    onPickerChange(e) {
      const idx = e.detail.value;
      const val = this.data.optionValues[idx];
      this.setData({ selectedIndex: idx, selectedLabel: this.data.optionLabels[idx] });
      this.triggerEvent('change', val);
    },
  },
});
