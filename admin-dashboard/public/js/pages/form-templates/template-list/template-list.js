window.TemplateListPage = {
  template: `
    <div>
      <div class="page-card">
        <div class="page-header">
          <h2 class="page-title">表单模板管理</h2>
          <el-button type="primary" @click="createTemplate">新建模板</el-button>
        </div>
        <el-table :data="templates" v-loading="loading">
          <el-table-column prop="title" label="模板名称" min-width="200" />
          <el-table-column prop="version" label="版本" width="100" />
          <el-table-column label="状态" width="120">
            <template #default="{row}">
              <el-tag :type="row.status==='published'?'success':row.status==='draft'?'info':'warning'">
                {{row.status==='published'?'已发布':row.status==='draft'?'草稿':'已下架'}}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="record_count" label="提交数" width="100" />
          <el-table-column prop="updated_at" label="最近编辑" width="180" />
          <el-table-column label="操作" width="280" fixed="right">
            <template #default="{row}">
              <el-button type="primary" size="small" @click="$emit('edit', row.id)">编辑</el-button>
              <el-button v-if="row.status==='draft'" type="success" size="small" @click="publish(row)">发布</el-button>
              <el-button v-if="row.status==='published'" size="small" @click="unpublish(row)">下架</el-button>
              <el-button size="small" @click="clone(row.id)">克隆</el-button>
              <el-button v-if="row.status!=='published'" type="danger" size="small" @click="remove(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  `,
  data() { return { templates: [], loading: true }; },
  mounted() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.templates = await api.get('/form-templates'); }
      catch (e) { ElementPlus.ElMessage.error(e.message); }
      finally { this.loading = false; }
    },
    async createTemplate() {
      try {
        await api.post('/form-templates', { title: '新建表单模板' });
        ElementPlus.ElMessage.success('创建成功');
        this.load();
      } catch (e) { ElementPlus.ElMessage.error(e.message); }
    },
    async publish(row) {
      try {
        await api.put('/form-templates/' + row.id + '/publish');
        ElementPlus.ElMessage.success('已发布');
        this.load();
      } catch (e) { ElementPlus.ElMessage.error(e.message); }
    },
    async unpublish(row) {
      try {
        await api.put('/form-templates/' + row.id + '/unpublish');
        ElementPlus.ElMessage.success('已下架');
        this.load();
      } catch (e) { ElementPlus.ElMessage.error(e.message); }
    },
    async clone(id) {
      try {
        await api.post('/form-templates/' + id + '/clone');
        ElementPlus.ElMessage.success('克隆成功');
        this.load();
      } catch (e) { ElementPlus.ElMessage.error(e.message); }
    },
    async remove(row) {
      try {
        await ElementPlus.ElMessageBox.confirm('确定删除模板「' + row.title + '」？');
        await api.del('/form-templates/' + row.id);
        ElementPlus.ElMessage.success('已删除');
        this.load();
      } catch (e) { /* cancelled or error */ }
    },
  },
};
