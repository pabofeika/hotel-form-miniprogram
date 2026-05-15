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
        // 主页模版选择：添加图片和描述
        if (field.field_key === 'homepage_template') {
          const imageMap = { 'template_1': '/images/template-1.png', 'template_2': '/images/template-2.png', 'template_3': '/images/template-3.png' };
          const descMap = { 'template_1': '经典布局，适合大多数酒店', 'template_2': '简约风格，适合精品酒店', 'template_3': '现代风格，适合高端酒店' };
          options = options.map(o => ({
            ...o,
            image: imageMap[o.value] || '/images/template-default.png',
            desc: descMap[o.value] || '',
          }));
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
