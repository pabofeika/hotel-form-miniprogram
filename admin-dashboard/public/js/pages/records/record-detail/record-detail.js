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

        <div v-if="loading" style="text-align:center;padding:40px;color:#999">加载中...</div>
        <div v-else-if="loadError" style="text-align:center;padding:40px;color:red">{{loadError}}</div>

        <template v-if="!loading && !loadError">
          <el-descriptions :column="2" border v-if="record.id">
            <el-descriptions-item label="流水号">{{record.record_sn}}</el-descriptions-item>
            <el-descriptions-item label="用户">{{record.openid || '--'}}</el-descriptions-item>
            <el-descriptions-item label="表单">{{record.form_title}} (v{{record.version}})</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="statusType(record.status)">{{statusLabel(record.status)}}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="提交时间">{{record.created_at}}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{record.updated_at}}</el-descriptions-item>
          </el-descriptions>

          <div v-if="formSteps.length === 0" style="text-align:center;padding:40px;color:#999">暂无字段数据</div>

          <div class="page-card" v-for="step in formSteps" :key="step.id">
            <h3 style="margin-bottom:12px;color:#1a73e8">Step {{step.step_number}}: {{step.title}}</h3>
            <el-descriptions :column="1" border>
              <el-descriptions-item v-for="f in step.fields" :key="f.field_key || f.id" :label="f.label || f.field_key">
                <span style="white-space:pre-wrap">{{ getFieldValue(f) }}</span>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </template>
      </div>

      <div class="page-card" v-if="!loading && !loadError">
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
  data() {
    return {
      record: {},
      formSteps: [],
      feedbacks: [],
      feedbackContent: '',
      fbLoading: false,
      loading: true,
      loadError: '',
    };
  },
  mounted() {
    console.log('[admin] RecordDetail mounted, recordId:', this.recordId);
    this.load();
  },
  methods: {
    async load() {
      this.loading = true;
      this.loadError = '';
      try {
        console.log('[admin] Loading record:', this.recordId);
        const data = await api.get('/records/' + this.recordId);
        console.log('[admin] API response:', {
          record: data.record ? data.record.record_sn : 'null',
          steps: (data.steps || []).length,
          fields: (data.fields || []).length,
          values: (data.values || []).length,
        });

        this.record = data.record || {};
        this.feedbacks = data.feedbacks || [];

        // 按 field_key 映射值
        const valueMap = {};
        (data.values || []).forEach(v => {
          const key = (v.field && v.field.field_key) || v.field_key;
          if (key) {
            let val = v.value;
            try { val = JSON.parse(val); } catch (e) {}
            valueMap[key] = val;
          }
        });
        console.log('[admin] valueMap keys:', Object.keys(valueMap));

        // 构建步骤字段
        this.formSteps = (data.steps || []).map(s => ({
          ...s,
          fields: (data.fields || [])
            .filter(f => String(f.step_id) === String(s.id))
            .map(f => ({
              ...f,
              _value: valueMap[f.field_key] !== undefined ? valueMap[f.field_key] : null,
            })),
        }));
        console.log('[admin] formSteps built:', this.formSteps.length, 'steps');
      } catch (e) {
        console.error('[admin] Load error:', e);
        this.loadError = e.message || '加载失败';
        ElementPlus.ElMessage.error('加载详情失败: ' + (e.message || ''));
      } finally {
        this.loading = false;
      }
    },
    getFieldValue(field) {
      const val = field._value;
      if (val === undefined || val === null || val === '') return '未填写';
      if (field.field_type === 'multi_select') {
        let arr = val;
        if (typeof val === 'string') { try { arr = JSON.parse(val); } catch (e) { arr = [val]; } }
        if (!Array.isArray(arr)) arr = [arr];
        const opts = typeof field.options === 'string' ? JSON.parse(field.options || '[]') : (field.options || []);
        return arr.map(v => { const o = opts.find(o => String(o.value) === String(v)); return o ? o.label : v; }).join(', ');
      }
      if (field.field_type === 'select') {
        const opts = typeof field.options === 'string' ? JSON.parse(field.options || '[]') : (field.options || []);
        const o = opts.find(o => String(o.value) === String(val));
        return o ? o.label : val;
      }
      return val;
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
