window.RecordDetailPage = {
  template: `
    <div>
      <div class="page-card">
        <div class="page-header">
          <h2 class="page-title">记录详情 - {{record.record_sn || ''}}</h2>
          <div>
            <el-button @click="goBack">返回</el-button>
            <el-button type="primary" @click="updateStatus('approved')" :disabled="record.status==='approved'||record.status==='rejected'">通过</el-button>
            <el-button type="danger" @click="updateStatus('rejected')" :disabled="record.status==='approved'||record.status==='rejected'">驳回</el-button>
          </div>
        </div>
        <el-descriptions :column="2" border v-if="record.id">
          <el-descriptions-item label="流水号">{{record.record_sn}}</el-descriptions-item>
          <el-descriptions-item label="用户">{{record.openid}}</el-descriptions-item>
          <el-descriptions-item label="表单">{{record.form_title}} (v{{record.version}})</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="statusType(record.status)">{{statusLabel(record.status)}}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="提交时间">{{record.created_at}}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{record.updated_at}}</el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- Field Values -->
      <div class="page-card" v-for="step in formSteps" :key="step.id">
        <h3 style="margin-bottom:12px;color:#1a73e8">Step {{step.step_number}}: {{step.title}}</h3>
        <el-descriptions :column="1" border>
          <el-descriptions-item v-for="f in step.fields" :key="f.id" :label="f.label">
            {{getFieldValue(f)}}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- Feedback -->
      <div class="page-card">
        <h3 style="margin-bottom:16px">管理员反馈</h3>
        <el-timeline v-if="feedbacks.length">
          <el-timeline-item v-for="fb in feedbacks" :key="fb.id" :timestamp="fb.created_at">
            <p><strong>{{fb.admin_name}}:</strong> {{fb.content}}</p>
          </el-timeline-item>
        </el-timeline>
        <p v-else style="color:#999">暂无反馈</p>
        <el-divider />
        <el-input v-model="feedbackContent" type="textarea" :rows="3" placeholder="填写反馈内容..." style="margin-bottom:12px" />
        <el-button type="primary" @click="submitFeedback" :loading="fbLoading">提交反馈</el-button>
      </div>
    </div>
  `,
  props: ['recordId'],
  data() { return { record: {}, formSteps: [], feedbacks: [], feedbackContent: '', fbLoading: false }; },
  mounted() { this.load(); },
  methods: {
    async load() {
      try {
        const data = await api.get('/records/' + this.recordId);
        this.record = data.record;
        this.feedbacks = data.feedbacks || [];
        // Build form steps with values
        const valueMap = {};
        (data.values || []).forEach(v => { valueMap[v.field_id] = v.value; });
        this.formSteps = (data.steps || []).map(s => ({
          ...s,
          fields: (data.fields || []).filter(f => f.step_id === s.id).map(f => ({ ...f, _value: valueMap[f.id] })),
        }));
      } catch (e) { ElementPlus.ElMessage.error(e.message); }
    },
    getFieldValue(field) {
      if (!field._value) return '<span style="color:#999">未填写</span>';
      if (field.field_type === 'multi_select') {
        const opts = typeof field.options === 'string' ? JSON.parse(field.options || '[]') : (field.options || []);
        const vals = Array.isArray(field._value) ? field._value : JSON.parse(field._value || '[]');
        return vals.map(v => { const o = opts.find(o => o.value === v); return o ? o.label : v; }).join(', ');
      }
      if (field.field_type === 'select') {
        const opts = typeof field.options === 'string' ? JSON.parse(field.options || '[]') : (field.options || []);
        const o = opts.find(o => o.value === field._value);
        return o ? o.label : field._value;
      }
      return field._value;
    },
    async updateStatus(status) {
      try {
        await api.put('/records/' + this.recordId + '/status', { status });
        this.record.status = status;
        ElementPlus.ElMessage.success('状态已更新');
      } catch (e) { ElementPlus.ElMessage.error(e.message); }
    },
    async submitFeedback() {
      if (!this.feedbackContent.trim()) return ElementPlus.ElMessage.warning('请输入反馈内容');
      this.fbLoading = true;
      try {
        const fb = await api.post('/records/' + this.recordId + '/feedback', { content: this.feedbackContent });
        this.feedbacks.push({ ...fb, admin_name: adminInfo().username || '管理员' });
        this.feedbackContent = '';
        ElementPlus.ElMessage.success('反馈已提交');
      } catch (e) { ElementPlus.ElMessage.error(e.message); }
      finally { this.fbLoading = false; }
    },
    goBack() { this.$emit('back'); },
    statusType(s) { return { draft: 'info', submitted: 'primary', reviewing: 'warning', approved: 'success', rejected: 'danger' }[s] || 'info'; },
    statusLabel(s) { return { draft: '草稿', submitted: '已提交', reviewing: '审核中', approved: '已通过', rejected: '已驳回' }[s] || s; },
  },
};
