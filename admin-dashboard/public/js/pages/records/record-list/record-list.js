window.RecordsPage = {
  template: `
    <div>
      <div class="page-card">
        <div class="page-header">
          <h2 class="page-title">提交记录</h2>
          <div>
            <el-select v-model="statusFilter" placeholder="状态筛选" clearable style="width:140px;margin-right:12px" @change="load">
              <el-option label="全部" value="" />
              <el-option label="草稿" value="draft" />
              <el-option label="已提交" value="submitted" />
              <el-option label="审核中" value="reviewing" />
              <el-option label="已通过" value="approved" />
              <el-option label="已驳回" value="rejected" />
            </el-select>
            <el-input v-model="keyword" placeholder="搜索流水号" style="width:200px" clearable @change="load" />
          </div>
        </div>
        <el-table :data="records" v-loading="loading" @row-click="viewDetail" style="cursor:pointer">
          <el-table-column prop="record_sn" label="流水号" width="180" />
          <el-table-column prop="openid" label="用户" width="180" />
          <el-table-column prop="form_title" label="表单" />
          <el-table-column prop="status" label="状态" width="120">
            <template #default="{row}"><el-tag :type="statusType(row.status)">{{statusLabel(row.status)}}</el-tag></template>
          </el-table-column>
          <el-table-column prop="created_at" label="提交时间" width="180" />
          <el-table-column label="操作" width="120">
            <template #default="{row}">
              <el-button type="primary" size="small" @click.stop="goDetail(row.id)">详情</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination v-if="total > 0" background layout="prev,pager,next" :total="total" :page-size="20" @current-change="onPageChange" style="margin-top:16px;text-align:center" />
      </div>
    </div>
  `,
  data() { return { records: [], loading: true, statusFilter: '', keyword: '', page: 1, total: 0 }; },
  mounted() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try {
        const params = new URLSearchParams({ page: this.page, page_size: 20 });
        if (this.statusFilter) params.set('status', this.statusFilter);
        if (this.keyword) params.set('keyword', this.keyword);
        const data = await api.get('/records?' + params.toString());
        this.records = data.records;
        this.total = data.pagination.total;
      } catch (e) { ElementPlus.ElMessage.error(e.message); }
      finally { this.loading = false; }
    },
    onPageChange(p) { this.page = p; this.load(); },
    goDetail(id) { this.$parent.$parent.currentPage = 'record-detail'; this.$parent.$parent.pageParams = { recordId: id }; },
    viewDetail(row) { this.goDetail(row.id); },
    statusType(s) { return { draft: 'info', submitted: 'primary', reviewing: 'warning', approved: 'success', rejected: 'danger' }[s] || 'info'; },
    statusLabel(s) { return { draft: '草稿', submitted: '已提交', reviewing: '审核中', approved: '已通过', rejected: '已驳回' }[s] || s; },
  },
};
