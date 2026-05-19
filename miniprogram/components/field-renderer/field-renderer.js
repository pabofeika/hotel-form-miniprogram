Component({
  properties: {
    field: { type: Object, value: {} },
    value: { type: null, value: '' },
    formValues: { type: Object, value: {} },
  },

  data: {
    parsedOptions: [],
  },

  observers: {
    'field, formValues'(field, formValues) {
      if (field.options) {
        let options = field.options;
        if (typeof options === 'string') {
          try { options = JSON.parse(options); } catch (e) { options = []; }
        }

        // 主页模版选择：根据 homepage_type 过滤 + 添加图片和描述
        if (field.field_key === 'homepage_template') {
          const imageMap = {
            'template_1': '/images/template-1-hd.jpg', 'template_2': '/images/template-2-hd.jpg',
            'template_3': '/images/template-3-hd.jpg', 'template_4': '/images/template-4-hd.jpg',
            'template_5': '/images/template-5-hd.jpg', 'template_6': '/images/template-6-hd.jpg',
            'template_7': '/images/template-7-hd.jpg',
          };
          const thumbMap = {
            'template_1': '/images/template-1.jpg', 'template_2': '/images/template-2.jpg',
            'template_3': '/images/template-3.jpg', 'template_4': '/images/template-4.jpg',
            'template_5': '/images/template-5.jpg', 'template_6': '/images/template-6.jpg',
            'template_7': '/images/template-7.jpg',
          };
          const descMap = {
            'template_1': '经典布局，适合大多数酒店', 'template_2': '简约风格，适合精品酒店',
            'template_3': '现代风格，适合高端酒店', 'template_4': '商务风格，适合会议型酒店',
            'template_5': '轻奢风格，适合设计型酒店', 'template_6': '家庭风格，适合公寓式酒店',
            'template_7': '生态风格，适合度假型酒店',
          };

          // 根据 homepage_type 过滤模版
          const hpType = (formValues && formValues.homepage_type) || '';
          let allowedValues = [];
          if (hpType === 'skyworth_foot') {
            allowedValues = ['template_7'];
          } else {
            allowedValues = ['template_1', 'template_2', 'template_3', 'template_4', 'template_5', 'template_6'];
          }
          options = options
            .filter(o => allowedValues.includes(o.value))
            .map(o => ({
              ...o,
              image: imageMap[o.value],
              thumb: thumbMap[o.value] || '',
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
