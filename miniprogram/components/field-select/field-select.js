Component({
  properties: {
    label: { type: null, value: '' },
    required: { type: null, value: false },
    placeholder: { type: String, value: '请选择' },
    options: { type: Array, value: [] },
    value: { type: null, value: '' },
  },

  data: {
    showPopup: false,
    currentValue: '',
    selectedLabel: '',
  },

  observers: {
    'options, value': function (opts, val) {
      this.setData({ currentValue: val || '' });
      if (opts && opts.length > 0) {
        const found = opts.find(o => o.value === val);
        this.setData({ selectedLabel: found ? found.label : '' });
      }
    },
  },

  methods: {
    showOptions() { this.setData({ showPopup: true }); },
    hideOptions() { this.setData({ showPopup: false }); },
    noop() {},

    selectOption(e) {
      const val = e.currentTarget.dataset.value;
      const found = this.data.options.find(o => o.value === val);
      this.setData({
        currentValue: val,
        selectedLabel: found ? found.label : '',
        showPopup: false,
      });
      this.triggerEvent('change', val);
    },
  },
});
