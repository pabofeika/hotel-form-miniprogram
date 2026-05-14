window.DashboardPage = {
  template: `
    <div>
      <div class="page-card"><h2 class="page-title">统计看板</h2></div>
      <div class="stat-cards">
        <div class="stat-card"><div class="stat-num" style="color:#1a73e8">{{stats.total_users}}</div><div class="stat-label">用户总数</div></div>
        <div class="stat-card"><div class="stat-num" style="color:#43a047">{{stats.total_records}}</div><div class="stat-label">提交总数</div></div>
        <div class="stat-card"><div class="stat-num" style="color:#e65100">{{stats.pending_records}}</div><div class="stat-label">待处理</div></div>
        <div class="stat-card"><div class="stat-num" style="color:#7b1fa2">{{stats.feedback_today}}</div><div class="stat-label">今日反馈</div></div>
      </div>
      <div class="page-card">
        <h3 style="margin-bottom:16px">最近提交</h3>
        <el-table :data="recentRecords" style="width:100%" v-loading="loading">
          <el-table-column prop="record_sn" label="流水号" width="180" />
          <el-table-column prop="openid" label="用户" width="200" />
          <el-table-column prop="status" label="状态" width="120">
            <template #default="{row}"><el-tag :type="statusType(row.status)">{{statusLabel(row.status)}}</el-tag></template>
          </el-table-column>
          <el-table-column prop="created_at" label="提交时间" />
        </el-table>
      </div>
    </div>
  `,
  data() { return { stats: { total_users: 0, total_records: 0, pending_records: 0, feedback_today: 0 }, recentRecords: [], loading: true }; },
  async mounted() {
    try {
      const data = await api.get('/dashboard');
      this.stats = data.stats;
      this.recentRecords = data.recent_records || [];
    } catch (e) { ElementPlus.ElMessage.error(e.message); }
    finally { this.loading = false; }
  },
  methods: {
    statusType(s) { return { draft: 'info', submitted: 'primary', reviewing: 'warning', approved: 'success', rejected: 'danger' }[s] || 'info'; },
    statusLabel(s) { return { draft: '草稿', submitted: '已提交', reviewing: '审核中', approved: '已通过', rejected: '已驳回' }[s] || s; },
  },
};
