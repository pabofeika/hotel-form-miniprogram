window.StepEditPage = {
  template: `
    <div>
      <div class="page-card">
        <div class="page-header">
          <h2 class="page-title">字段管理</h2>
          <el-button @click="$emit('back')">返回步骤</el-button>
        </div>
        <p style="margin-bottom:16px;color:#666">步骤: {{step.title || ''}}</p>
        <el-button type="primary" @click="showFieldDialog(null)" style="margin-bottom:16px">+ 添加字段</el-button>
        <el-table :data="fields" v-loading="loading">
          <el-table-column type="index" label="#" width="50" />
          <el-table-column prop="field_key" label="标识" width="120" />
          <el-table-column prop="label" label="字段名称" width="180" />
          <el-table-column label="类型" width="100">
            <template #default="{row}"><el-tag size="small">{{row.field_type}}</el-tag></template>
          </el-table-column>
          <el-table-column label="必填" width="60">
            <template #default="{row}">{{row.is_required ? '✅' : '❌'}}</template>
          </el-table-column>
          <el-table-column label="条件" width="100">
            <template #default="{row}">
              <el-tag v-if="row.conditions" type="warning" size="small">有条件</el-tag>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="160" fixed="right">
            <template #default="{row}">
              <el-button size="small" @click="showFieldDialog(row)">编辑</el-button>
              <el-button type="danger" size="small" @click="delField(row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- Field Edit Dialog -->
      <el-dialog v-model="dialogVisible" :title="editingField ? '编辑字段' : '添加字段'" width="700px">
        <el-form label-width="120px" v-if="dialogVisible">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="字段标识" required>
                <el-input v-model="fieldForm.field_key" placeholder="如 hotel_name" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="字段名称" required>
                <el-input v-model="fieldForm.label" placeholder="如 酒店名称" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="字段类型" required>
                <el-select v-model="fieldForm.field_type" style="width:100%">
                  <el-option label="文本(text)" value="text" />
                  <el-option label="多行文本(textarea)" value="textarea" />
                  <el-option label="数字(number)" value="number" />
                  <el-option label="邮箱(email)" value="email" />
                  <el-option label="单选(select)" value="select" />
                  <el-option label="多选(multi_select)" value="multi_select" />
                  <el-option label="文件(file)" value="file" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="必填">
                <el-switch v-model="fieldForm.is_required" :active-value="1" :inactive-value="0" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="占位提示">
            <el-input v-model="fieldForm.placeholder" placeholder="如 请输入酒店名称" />
          </el-form-item>
          <el-form-item label="帮助说明">
            <el-input v-model="fieldForm.help_text" type="textarea" :rows="2" placeholder="显示在字段下方的提示信息" />
          </el-form-item>

          <!-- Options editor (for select/multi_select) -->
          <el-form-item label="选项列表" v-if="fieldForm.field_type==='select'||fieldForm.field_type==='multi_select'">
            <div v-for="(opt, i) in fieldForm.options" :key="i" style="display:flex;gap:8px;margin-bottom:8px">
              <el-input v-model="opt.label" placeholder="显示名" style="flex:1" />
              <el-input v-model="opt.value" placeholder="值" style="flex:1" />
              <el-button type="danger" size="small" @click="fieldForm.options.splice(i,1)">×</el-button>
            </div>
            <el-button size="small" @click="fieldForm.options.push({label:'',value:''})">+ 添加选项</el-button>
          </el-form-item>

          <!-- Condition Editor -->
          <el-form-item label="显示条件">
            <el-switch v-model="hasCondition" active-text="有条件" inactive-text="无条件" />
          </el-form-item>
          <div v-if="hasCondition" class="condition-group">
            <el-form-item label="逻辑关系">
              <el-radio-group v-model="conditionForm.logic">
                <el-radio value="and">且 (AND)</el-radio>
                <el-radio value="or">或 (OR)</el-radio>
              </el-radio-group>
            </el-form-item>
            <div v-for="(rule, i) in conditionForm.rules" :key="i" style="display:flex;gap:8px;margin-bottom:8px;align-items:center">
              <el-input v-model="rule.field" placeholder="字段标识" style="width:150px" />
              <el-select v-model="rule.operator" style="width:120px">
                <el-option label="等于" value="eq" />
                <el-option label="不等于" value="neq" />
                <el-option label="包含于" value="in" />
                <el-option label="不包含" value="not_in" />
              </el-select>
              <el-input v-model="rule.value" :placeholder="'值(多个用,分隔)'" style="flex:1" />
              <el-button type="danger" size="small" @click="conditionForm.rules.splice(i,1)">×</el-button>
            </div>
            <el-button size="small" @click="conditionForm.rules.push({field:'',operator:'eq',value:''})">+ 条件</el-button>
          </div>

          <!-- Validation -->
          <el-form-item label="校验规则">
            <el-row :gutter="12">
              <el-col :span="8"><el-input v-model="validationForm.maxLength" placeholder="最大字符数" type="number" /></el-col>
              <el-col :span="8"><el-input v-model="validationForm.min" placeholder="最小值(number)" type="number" /></el-col>
              <el-col :span="8">
                <el-select v-model="validationForm.pattern" placeholder="格式" clearable>
                  <el-option label="邮箱" value="email" />
                </el-select>
              </el-col>
            </el-row>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="dialogVisible=false">取消</el-button>
          <el-button type="primary" @click="saveField">保存</el-button>
        </template>
      </el-dialog>
    </div>
  `,
  props: ['templateId', 'stepId'],
  data() {
    return {
      step: {}, fields: [], loading: true,
      dialogVisible: false, editingField: false,
      fieldForm: { field_key: '', label: '', field_type: 'text', is_required: 0, placeholder: '', help_text: '', options: [], validation: null, conditions: null },
      hasCondition: false,
      conditionForm: { logic: 'and', rules: [] },
      validationForm: { maxLength: '', min: '', pattern: '' },
    };
  },
  mounted() {
    this.loadStep();
    this.loadFields();
  },
  methods: {
    async loadStep() {
      try {
        const data = await api.get('/form-templates/' + this.templateId);
        this.step = (data.steps || []).find(s => s.id == this.stepId) || {};
      } catch (e) {}
    },
    async loadFields() {
      this.loading = true;
      try {
        const data = await api.get('/form-templates/' + this.templateId);
        const step = (data.steps || []).find(s => s.id == this.stepId);
        this.fields = step ? step.fields || [] : [];
      } catch (e) { ElementPlus.ElMessage.error(e.message); }
      finally { this.loading = false; }
    },
    showFieldDialog(field) {
      if (field) {
        let options = field.options || [];
        if (typeof options === 'string') { try { options = JSON.parse(options); } catch(e) { options = []; } }
        let conditions = null, hasCond = false, condForm = { logic: 'and', rules: [] };
        if (field.conditions) {
          try {
            conditions = typeof field.conditions === 'string' ? JSON.parse(field.conditions) : field.conditions;
            hasCond = true; condForm = conditions;
          } catch(e) {}
        }
        let validation = {};
        if (field.validation) {
          try { validation = typeof field.validation === 'string' ? JSON.parse(field.validation) : field.validation; } catch(e) {}
        }
        this.fieldForm = { ...field, options: Array.isArray(options) ? options : [] };
        this.hasCondition = hasCond;
        this.conditionForm = condForm;
        this.validationForm = { maxLength: validation.maxLength || '', min: validation.min || '', pattern: validation.pattern || '' };
        this.editingField = true;
      } else {
        this.fieldForm = { field_key: '', label: '', field_type: 'text', is_required: 0, placeholder: '', help_text: '', options: [], validation: null, conditions: null };
        this.hasCondition = false;
        this.conditionForm = { logic: 'and', rules: [] };
        this.validationForm = { maxLength: '', min: '', pattern: '' };
        this.editingField = false;
      }
      this.dialogVisible = true;
    },
    async saveField() {
      const payload = { ...this.fieldForm };
      // Build conditions
      if (this.hasCondition && this.conditionForm.rules.length > 0) {
        payload.conditions = this.conditionForm;
      } else {
        payload.conditions = null;
      }
      // Build validation
      const v = {};
      if (this.validationForm.maxLength) v.maxLength = parseInt(this.validationForm.maxLength);
      if (this.validationForm.min) v.min = parseInt(this.validationForm.min);
      if (this.validationForm.pattern) v.pattern = this.validationForm.pattern;
      payload.validation = Object.keys(v).length > 0 ? v : null;

      try {
        if (this.editingField) {
          await api.put('/form-templates/' + this.templateId + '/fields/' + this.fieldForm.id, payload);
        } else {
          await api.post('/form-templates/' + this.templateId + '/steps/' + this.stepId + '/fields', payload);
        }
        ElementPlus.ElMessage.success('字段已保存');
        this.dialogVisible = false;
        this.loadFields();
      } catch (e) { ElementPlus.ElMessage.error(e.message); }
    },
    async delField(fieldId) {
      try {
        await api.del('/form-templates/' + this.templateId + '/fields/' + fieldId);
        this.fields = this.fields.filter(f => f.id !== fieldId);
        ElementPlus.ElMessage.success('已删除');
      } catch (e) { ElementPlus.ElMessage.error(e.message); }
    },
  },
};
