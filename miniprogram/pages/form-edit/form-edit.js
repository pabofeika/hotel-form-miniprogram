const api = require('../../utils/api');
const cache = require('../../utils/cache');
const { evaluateConditions } = require('../../utils/condition-engine');
const { validateForm } = require('../../utils/validator');
const { preventDoubleTap } = require('../../utils/navigate');
const theme = require('../../utils/theme');

Page({
  data: {
    loading: true,
    formId: null,
    theme: 'light',
    template: null,
    steps: [],
    currentStep: 1,
    totalSteps: 0,
    currentStepData: {},
    visibleFields: [],
    formValues: {},
    fieldErrors: {},
    hasUnsavedChanges: false,
  },

  onLoad(options) {
    console.log('[form-edit] onLoad, formId:', options.formId);
    this.setData({ theme: theme.getTheme() });
    const formId = parseInt(options.formId);
    const resume = options.resume === 'true';

    this.setData({ formId });

    // 登录模块已注释（小程序无需登录）
    // this.ensureLogin().then(() => {
    //   this.loadFormTemplate(formId, resume);
    // });
    this.loadFormTemplate(formId, resume);
  },

  onShow() {
    const t = theme.getTheme();
    this.setData({ theme: t });
    theme.syncTabBar(t);
  },

  onUnload() { console.log('[form-edit] onUnload'); },

  // ensureLogin() 已注释（小程序无需登录）
  // async ensureLogin() {
  //   const app = getApp();
  //   if (!app.globalData.token) {
  //     await app.login();
  //   }
  // },

  async loadFormTemplate(formId, resume) {
    try {
      // Try cache first
      let template = cache.getCachedFormStructure(formId);
      if (!template) {
        template = await api.get(`/forms/${formId}`);
        cache.cacheFormStructure(formId, template);
      }

      const steps = template.steps
        .filter(s => {
          // 检查步骤级条件
          if (!s.conditions) return true;
          let cond = s.conditions;
          if (typeof cond === 'string') { try { cond = JSON.parse(cond); } catch (e) { return true; } }
          return evaluateConditions(cond, this.data.formValues);
        })
        .map((s, i) => ({
          ...s,
          index: i + 1,
        }));

      this.setData({
        template,
        steps,
        totalSteps: steps.length,
        currentStepData: steps[0] || {},
      });

      // Check for draft
      if (resume) {
        const draft = cache.getFormDraft(formId);
        if (draft) {
          this.setData({
            formValues: draft.data.formValues || {},
            currentStep: draft.currentStep || 1,
          });
          // Update current step data
          const step = steps.find(s => s.step_number === this.data.currentStep);
          if (step) {
            this.setData({ currentStepData: step });
          }
        }
      }

      // Render fields for current step
      this.renderCurrentFields();

      this.setData({ loading: false });
    } catch (err) {
      wx.showToast({ title: err.message || '加载失败', icon: 'none' });
      this.setData({ loading: false });
    }
  },

  renderCurrentFields() {
    const { currentStep, formValues } = this.data;

    // 重新过滤步骤（步骤级条件可能已变化）
    const allSteps = this.data.template ? this.data.template.steps : [];
    const filteredSteps = allSteps
      .filter(s => {
        if (!s.conditions) return true;
        let cond = s.conditions;
        if (typeof cond === 'string') { try { cond = JSON.parse(cond); } catch (e) { return true; } }
        return evaluateConditions(cond, formValues);
      })
      .map((s, i) => ({ ...s, index: i + 1 }));

    // 如果当前步骤被隐藏了，后退到前一步
    let targetStep = currentStep;
    if (targetStep > filteredSteps.length) {
      targetStep = filteredSteps.length;
    }

    const step = filteredSteps[targetStep - 1];
    if (!step || !step.fields) {
      this.setData({ visibleFields: [], steps: filteredSteps, totalSteps: filteredSteps.length });
      return;
    }

    // Filter fields based on conditions
    const visibleFields = step.fields.filter(field => {
      let conditionsObj = null;
      if (typeof field.conditions === 'string') {
        try { conditionsObj = JSON.parse(field.conditions); }
        catch (e) { conditionsObj = null; }
      } else {
        conditionsObj = field.conditions;
      }

      if (conditionsObj) {
        return evaluateConditions(conditionsObj, formValues);
      }
      return true;
    });

    this.setData({
      visibleFields,
      steps: filteredSteps,
      totalSteps: filteredSteps.length,
      currentStep: targetStep,
      currentStepData: filteredSteps[targetStep - 1] || {},
    });
  },

  onFieldChange(e) {
    // data-field-key → dataset.fieldKey（驼峰）
    const field_key = e.currentTarget.dataset.fieldKey;
    const value = e.detail;

    if (!field_key) {
      console.warn('onFieldChange: field_key is missing');
      return;
    }

    this.setData({
      ['formValues.' + field_key]: value,
      ['fieldErrors.' + field_key]: '',
      hasUnsavedChanges: true,
    });

    const changedField = this.findFieldDef(field_key);
    // 只有 select(单选) 才重新计算条件联动；multi_select 不联动，避免重绘
    if (changedField && changedField.field_type === 'select') {
      this.renderCurrentFields();
    }
  },

  findFieldDef(fieldKey) {
    for (const step of this.data.steps) {
      if (step.fields) {
        const f = step.fields.find(f => f.field_key === fieldKey);
        if (f) return f;
      }
    }
    return null;
  },

  prevStep() {
    if (preventDoubleTap(this)) return;
    if (this.data.currentStep <= 1) return;
    const step = this.data.currentStep - 1;
    this.setData({ currentStep: step });
    const stepData = this.data.steps.find(s => s.step_number === step);
    this.setData({ currentStepData: stepData || {} });
    this.renderCurrentFields();
  },

  nextStep() {
    if (preventDoubleTap(this)) return;
    const { visibleFields, formValues, currentStep, totalSteps } = this.data;

    console.log('[form-edit] 点击下一步 step=' + currentStep, '字段数=' + (visibleFields || []).length, '已填值keys:', Object.keys(formValues));

    const result = validateForm(formValues, visibleFields, false);
    if (!result.valid) {
      const errors = {};
      result.errors.forEach(e => { errors[e.field] = e.message; });
      this.setData({ fieldErrors: errors });
      wx.showToast({ title: '请完善当前步骤', icon: 'none' });
      return;
    }

    if (currentStep < totalSteps) {
      const step = currentStep + 1;
      this.setData({
        currentStep: step,
        fieldErrors: {},
      });
      const stepData = this.data.steps.find(s => s.step_number === step);
      this.setData({ currentStepData: stepData || {} });
      this.renderCurrentFields();
    }
  },

  saveDraft() {
    const { formId, formValues, currentStep } = this.data;
    cache.saveFormDraft(formId, { formValues, currentStep });
    this.setData({ hasUnsavedChanges: false });
    wx.showToast({ title: '草稿已保存', icon: 'success' });
  },

  previewSubmit() {
    // Validate all visible fields in all steps
    const allFields = [];
    this.data.steps.forEach(step => {
      if (step.fields) {
        step.fields.forEach(f => {
          let conditionsObj = null;
          if (typeof f.conditions === 'string') {
            try { conditionsObj = JSON.parse(f.conditions); } catch (e) {}
          } else {
            conditionsObj = f.conditions;
          }
          if (!conditionsObj || evaluateConditions(conditionsObj, this.data.formValues)) {
            allFields.push(f);
          }
        });
      }
    });

    const result = validateForm(this.data.formValues, allFields, false);
    if (!result.valid) {
      const errors = {};
      result.errors.forEach(e => { errors[e.field] = e.message; });
      this.setData({ fieldErrors: errors });
      wx.showToast({ title: '请完善所有必填项', icon: 'none' });
      return;
    }

    // Clear draft and navigate to preview
    cache.clearDraft(this.data.formId);

    // 把所有步骤的字段打平，连同填写值一起传给预览页
    const previewFields = (this.data.steps || []).reduce((list, step) => {
      return list.concat(step.fields || []);
    }, []);

    wx.setStorageSync('form_preview_data', {
      formId: this.data.formId,
      formValues: this.data.formValues || {},
      fields: previewFields,
    });

    wx.navigateTo({
      url: '/pages/form-preview/form-preview',
    });
  },

  onHide() {
    // Auto-save draft when leaving
    if (this.data.hasUnsavedChanges) {
      this.saveDraft();
    }
  },

  toggleTheme() {
    theme.toggleTheme();
    const t = theme.getTheme();
    this.setData({ theme: t });
    theme.syncTabBar(t);
  },

  setTheme(t) {
    this.setData({ theme: t });
  },
});
