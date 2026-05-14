const { createApp, ref, reactive, computed, onMounted, watch, h } = Vue;
const apiUrl = '/api/v1/admin';

// Global auth helpers
function adminToken() { return localStorage.getItem('admin_token') || ''; }
function adminInfo() { return JSON.parse(localStorage.getItem('admin_info') || '{}'); }

const app = createApp({
  data() {
    return {
      currentPage: 'login',
      pageParams: {},
      loginForm: { username: '', password: '' },
      loginRules: {
        username: [{ required: true, message: '请输入用户名' }],
        password: [{ required: true, message: '请输入密码' }],
      },
      loginLoading: false,
      adminInfo: adminInfo(),
    };
  },
  created() {
    if (localStorage.getItem('admin_token')) this.currentPage = 'dashboard';
  },
  methods: {
    async handleLogin() {
      this.loginLoading = true;
      try {
        const data = await api.post('/auth/login', this.loginForm);
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_info', JSON.stringify(data.admin));
        this.adminInfo = data.admin;
        this.currentPage = 'dashboard';
      } catch (err) {
        ElementPlus.ElMessage.error(err.message);
      } finally { this.loginLoading = false; }
    },
    navigate(idx) { this.currentPage = idx; this.pageParams = {}; },
    openTemplateEditor(id) { this.pageParams = { templateId: id }; this.currentPage = 'template-edit'; },
    openStepEditor(tid, sid) { this.pageParams = { templateId: tid, stepId: sid }; this.currentPage = 'step-edit'; },
    handleLogout() {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_info');
      this.currentPage = 'login';
    },
  },
});

// Register all Element Plus icons
for (const key in ElementPlusIconsVue) app.component(key, ElementPlusIconsVue[key]);
app.use(ElementPlus);

// Register page components
app.component('dashboard-page', window.DashboardPage || { template: '<div>Dashboard</div>' });
app.component('records-page', window.RecordsPage || { template: '<div>Records</div>' });
app.component('record-detail-page', window.RecordDetailPage || { template: '<div>Detail</div>' });
app.component('template-list-page', window.TemplateListPage || { template: '<div>Templates</div>' });
app.component('template-edit-page', window.TemplateEditPage || { template: '<div>Edit</div>' });
app.component('step-edit-page', window.StepEditPage || { template: '<div>Steps</div>' });
app.component('settings-page', window.SettingsPage || { template: '<div>Settings</div>' });

app.mount('#app');
