Component({
  properties: {
    field: { type: Object, value: {} },
    value: { type: null, value: '' },
  },

  data: {
    parsedOptions: [],
  },

  observers: {
    field(field) {
      if (field.options) {
        let options = field.options;
        if (typeof options === 'string') {
          try { options = JSON.parse(options); } catch (e) { options = []; }
        }
        this.setData({ parsedOptions: options });
      }
    },
  },

  methods: {
    onChange(e) {
      this.triggerEvent('change', e.detail);
    },
  },
});
