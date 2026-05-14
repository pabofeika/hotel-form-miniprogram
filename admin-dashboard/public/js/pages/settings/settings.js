window.SettingsPage = {
  template: `
    <div>
      <div class="page-card">
        <h2 class="page-title" style="margin-bottom:24px">系统设置</h2>
        <el-form label-width="120px">
          <el-form-item label="当前管理员">
            <el-tag>{{admin.username}}</el-tag>
            <el-tag type="info" style="margin-left:8px">{{admin.role}}</el-tag>
          </el-form-item>
          <el-form-item label="数据库状态">
            <el-tag type="success">已连接</el-tag>
          </el-form-item>
          <el-form-item label="微信配置">
            <el-tag :type="wxConfigured ? 'success' : 'danger'">{{wxConfigured ? '已配置' : '未配置'}}</el-tag>
            <p class="help-text">在 .env 文件中配置 WX_APPID 和 WX_APPSECRET</p>
          </el-form-item>
          <el-form-item label="API 地址">
            <el-tag>/api/v1</el-tag>
          </el-form-item>
        </el-form>
      </div>
    </div>
  `,
  data() {
    return { admin: adminInfo(), wxConfigured: true };
  },
};
