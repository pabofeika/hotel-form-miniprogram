window.TemplateEditPage = {
  template: `
    <div>
      <div class="page-card">
        <div class="page-header">
          <h2 class="page-title">编辑模板</h2>
          <el-button @click="$emit('back')">返回</el-button>
        </div>
        <el-form label-width="100px" v-if="template.id">
          <el-form-item label="模板名称">
            <el-input v-model="template.title" style="width:400px" />
          </el-form-item>
          <el-form-item label="描述">
            <el-input v-model="template.description" type="textarea" :rows="2" style="width:400px" />
          </el-form-item>
          <el-form-item label="版本">
            <el-tag>{{template.version}}</el-tag>
            <el-tag v-if="template.status==='published'" type="success" style="margin-left:8px">已发布</el-tag>
            <el-tag v-else-if="template.status==='draft'" type="info" style="margin-left:8px">草稿</el-tag>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveTemplate">保存</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="page-card">
        <div class="page-header">
          <h3>步骤管理</h3>
          <el-button type="primary" size="small" @click="addStep">+ 添加步骤</el-button>
        </div>
        <el-collapse v-model="activeStep">
          <el-collapse-item v-for="(step, idx) in steps" :key="step.id" :name="step.id">
            <template #title>
              <span style="font-weight:600">Step {{step.step_number}}: {{step.title}}</span>
            </template>
            <el-form label-width="100px">
              <el-form-item label="步骤标题">
                <el-input v-model="step.title" style="width:300px" />
              </el-form-item>
              <el-form-item label="描述">
                <el-input v-model="step.description" type="textarea" :rows="2" style="width:300px" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" size="small" @click="updateStep(step)">保存步骤</el-button>
                <el-button type="primary" size="small" @click="$emit('edit-step', template.id, step.id)">管理字段</el-button>
                <el-button type="danger" size="small" @click="deleteStep(step)">删除步骤</el-button>
              </el-form-item>
            </el-form>
            <!-- Field summary -->
            <el-table :data="step.fields || []" size="small" style="margin-top:8px">
              <el-table-column prop="field_key" label="标识" width="120" />
              <el-table-column prop="label" label="字段名" width="150" />
              <el-table-column prop="field_type" label="类型" width="100">
                <template #default="{row}"><el-tag size="small">{{row.field_type}}</el-tag></template>
              </el-table-column>
              <el-table-column label="必填" width="60">
                <template #default="{row}">{{row.is_required ? '✅' : '❌'}}</template>
              </el-table-column>
              <el-table-column prop="conditions" label="条件">
                <template #default="{row}">{{row.conditions ? '⚠️ 有条件' : ''}}</template>
              </el-table-column>
              <el-table-column label="操作" width="100">
                <template #default="{row}">
                  <el-button size="small" @click="$emit('edit-step', template.id, step.id)">编辑</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>
  `,
  props: ['templateId'],
  data() { return { template: {}, steps: [], activeStep: [] }; },
  mounted() { this.load(); },
  methods: {
    async load() {
      try {
        const data = await api.get('/form-templates/' + this.templateId);
        this.template = data;
        this.steps = data.steps || [];
      } catch (e) { ElementPlus.ElMessage.error(e.message); }
    },
    async saveTemplate() {
      try {
        await api.put('/form-templates/' + this.templateId, { title: this.template.title, description: this.template.description });
        ElementPlus.ElMessage.success('保存成功');
      } catch (e) { ElementPlus.ElMessage.error(e.message); }
    },
    async addStep() {
      try {
        const step = await api.post('/form-templates/' + this.templateId + '/steps', { title: '新步骤', description: '' });
        this.steps.push({ ...step, fields: [] });
        this.activeStep = [step.id];
        ElementPlus.ElMessage.success('步骤已添加');
      } catch (e) { ElementPlus.ElMessage.error(e.message); }
    },
    async updateStep(step) {
      try {
        await api.put('/form-templates/' + this.templateId + '/steps/' + step.id, { title: step.title, description: step.description });
        ElementPlus.ElMessage.success('步骤已更新');
      } catch (e) { ElementPlus.ElMessage.error(e.message); }
    },
    async deleteStep(step) {
      try {
        await ElementPlus.ElMessageBox.confirm('删除步骤将同时删除步骤内的所有字段，确定？');
        await api.del('/form-templates/' + this.templateId + '/steps/' + step.id);
        this.steps = this.steps.filter(s => s.id !== step.id);
        ElementPlus.ElMessage.success('已删除');
      } catch (e) { /* cancelled */ }
    },
  },
};
