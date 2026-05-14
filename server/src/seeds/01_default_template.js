const bcrypt = require('bcryptjs');

/**
 * Seed data:
 * 1. Default admin account (admin / admin123)
 * 2. Hotel configuration form template with 5 steps and 27 fields
 */
exports.seed = async function (knex) {
  // Clean existing data
  await knex('form_fields').del();
  await knex('form_steps').del();
  await knex('form_templates').del();
  await knex('admins').del();

  // ---- 1. Create admin accounts ----
  const adminHash = await bcrypt.hash('admin123', 10);
  await knex('admins').insert([
    { username: 'admin', password_hash: adminHash, role: 'superadmin' },
    { username: 'manager', password_hash: await bcrypt.hash('manager123', 10), role: 'admin' },
  ]);

  // ---- 2. Create form template ----
  const [templateId] = await knex('form_templates').insert({
    title: '创维商用智慧酒店创建配置表',
    description: '用于酒店创建时收集配置信息，包含酒店基本信息、主页配置、客控系统、功能对接等',
    status: 'published',
    version: '1.0',
    created_at: new Date(),
    updated_at: new Date(),
  });

  // ---- 3. Create 5 steps ----
  const steps = [
    { step_number: 1, title: '酒店基本信息', description: '请输入酒店的基本信息' },
    { step_number: 2, title: '主页与收银配置', description: '选择酒店主页类型和相关配置' },
    { step_number: 3, title: '客控与核心功能', description: '配置客控系统、数字人、点播、直播等功能' },
    { step_number: 4, title: '酒店系统与服务对接', description: 'PMS、洗衣、机器人、商城等系统对接' },
    { step_number: 5, title: '最终确认', description: '设备数量、交付信息和补充需求' },
  ];

  const stepIds = [];
  for (const step of steps) {
    const [id] = await knex('form_steps').insert({
      template_id: templateId,
      step_number: step.step_number,
      title: step.title,
      description: step.description,
    });
    stepIds.push(id);
  }

  // ---- 4. Create 27 fields ----
  const fields = [
    // === Step 1: 酒店基本信息 ===
    {
      step_index: 0, field_key: 'hotel_name', label: '酒店名称', field_type: 'text',
      is_required: true, placeholder: '请输入酒店名称', help_text: '',
      validation: JSON.stringify({ maxLength: 100 }),
      sort_order: 1,
    },
    {
      step_index: 0, field_key: 'hotel_address', label: '酒店详细地址', field_type: 'text',
      is_required: true, placeholder: '请输入酒店详细地址', help_text: '',
      validation: JSON.stringify({ maxLength: 200 }),
      sort_order: 2,
    },

    // === Step 2: 主页与收银配置 ===
    {
      step_index: 1, field_key: 'homepage_type', label: '酒店主页选择', field_type: 'select',
      is_required: true, placeholder: '请选择酒店主页类型', help_text: '',
      options: JSON.stringify([
        { label: '创维智慧酒店主页', value: 'skyworth_hotel' },
        { label: '创维智慧沐足主页', value: 'skyworth_foot' },
        { label: '第三方主页', value: 'third_party' },
        { label: '酷开主页', value: 'coocaa' },
      ]),
      sort_order: 1,
    },
    {
      step_index: 1, field_key: 'foot_bath_pos', label: '足浴收银系统', field_type: 'select',
      is_required: true, placeholder: '请选择足浴收银系统', help_text: '',
      options: JSON.stringify([
        { label: '机机乐', value: 'jijile' },
        { label: '智荟宝', value: 'zhihuibao' },
        { label: '其他厂商（需要提供收银SaaS厂商名称）', value: 'other' },
        { label: '无需收银系统', value: 'none' },
      ]),
      conditions: JSON.stringify({
        logic: 'and',
        rules: [{ field: 'homepage_type', operator: 'eq', value: 'skyworth_foot' }],
      }),
      sort_order: 2,
    },
    {
      step_index: 1, field_key: 'other_pos_name', label: '其他收银SaaS厂商名称', field_type: 'text',
      is_required: true, placeholder: '请输入收银SaaS厂商名称', help_text: '关乎设备上支持展示技师信息及刷卡上钟状态，需要提前告知其他厂商名称，同时厂商愿意进行对接。',
      conditions: JSON.stringify({
        logic: 'and',
        rules: [{ field: 'foot_bath_pos', operator: 'eq', value: 'other' }],
      }),
      sort_order: 3,
    },
    {
      step_index: 1, field_key: 'third_party_app', label: '第三方主页应用', field_type: 'file',
      is_required: true, placeholder: '请上传第三方主页应用', help_text: '',
      conditions: JSON.stringify({
        logic: 'and',
        rules: [{ field: 'homepage_type', operator: 'eq', value: 'third_party' }],
      }),
      sort_order: 4,
    },

    // === Step 3: 客控与核心功能 ===
    {
      step_index: 2, field_key: 'homepage_template', label: '主页模版选择', field_type: 'select',
      is_required: true, placeholder: '请根据显示模版进行选择', help_text: '',
      options: JSON.stringify([
        { label: '模版一', value: 'template_1' },
        { label: '模版二', value: 'template_2' },
        { label: '模版三', value: 'template_3' },
      ]),
      conditions: JSON.stringify({
        logic: 'and',
        rules: [{ field: 'homepage_type', operator: 'in', value: ['skyworth_hotel', 'skyworth_foot'] }],
      }),
      sort_order: 1,
    },
    {
      step_index: 2, field_key: 'room_control_type', label: '客控类型选择', field_type: 'select',
      is_required: true, placeholder: '请选择客控类型', help_text: '',
      options: JSON.stringify([
        { label: '无客控', value: 'none' },
        { label: '第三方客控（需要对接）', value: 'third_party' },
        { label: '创维自研客控', value: 'skyworth_self' },
      ]),
      conditions: JSON.stringify({
        logic: 'and',
        rules: [{ field: 'homepage_type', operator: 'in', value: ['skyworth_hotel', 'skyworth_foot'] }],
      }),
      sort_order: 2,
    },
    {
      step_index: 2, field_key: 'third_party_rc_name', label: '第三方客控名称', field_type: 'text',
      is_required: true, placeholder: '请输入第三方客控名称', help_text: '',
      conditions: JSON.stringify({
        logic: 'and',
        rules: [{ field: 'room_control_type', operator: 'eq', value: 'third_party' }],
      }),
      sort_order: 3,
    },
    {
      step_index: 2, field_key: 'skyworth_rc_series', label: '创维自研客控系列', field_type: 'select',
      is_required: true, placeholder: '请选自研客控系列，酒店仅只能使用一个系列客控设备', help_text: '',
      options: JSON.stringify([
        { label: 'S系列', value: 's_series' },
        { label: 'D系列', value: 'd_series' },
        { label: 'V系列', value: 'v_series' },
      ]),
      conditions: JSON.stringify({
        logic: 'and',
        rules: [{ field: 'room_control_type', operator: 'eq', value: 'skyworth_self' }],
      }),
      sort_order: 4,
    },
    {
      step_index: 2, field_key: 'use_digital_human', label: '是否使用创维数字人', field_type: 'select',
      is_required: false, placeholder: '开通数字人需要单独收费', help_text: '',
      options: JSON.stringify([
        { label: '使用', value: 'yes' },
        { label: '不使用', value: 'no' },
      ]),
      conditions: JSON.stringify({
        logic: 'or',
        rules: [
          { field: 'homepage_type', operator: 'in', value: ['skyworth_hotel', 'skyworth_foot'] },
          { field: 'room_control_type', operator: 'neq', value: 'none' },
        ],
      }),
      sort_order: 5,
    },
    {
      step_index: 2, field_key: 'vod_method', label: '酒店点播方式', field_type: 'select',
      is_required: true, placeholder: '点播会影响私密投屏问题', help_text: '建议使用创维合作方的极光TV商用版本。确保酒店场景使用不会误投至其他房间。',
      options: JSON.stringify([
        { label: '极光TV-商用版本', value: 'aurora_tv' },
        { label: '其他点播应用（创建酒店前需要提供对应App）', value: 'other' },
        { label: '无点播', value: 'none' },
      ]),
      conditions: JSON.stringify({
        logic: 'and',
        rules: [{ field: 'homepage_type', operator: 'in', value: ['skyworth_hotel', 'skyworth_foot'] }],
      }),
      sort_order: 6,
    },
    {
      step_index: 2, field_key: 'other_vod_app', label: '其他点播应用', field_type: 'file',
      is_required: true, placeholder: '请上传其他点播应用APK', help_text: '如果当时无法提供，请后续尽快提供，否则会影响酒店点播功能正常使用。',
      conditions: JSON.stringify({
        logic: 'and',
        rules: [{ field: 'vod_method', operator: 'eq', value: 'other' }],
      }),
      sort_order: 7,
    },
    {
      step_index: 2, field_key: 'live_tv_method', label: '酒店直播方式', field_type: 'select',
      is_required: true, placeholder: '请根据当地实际情况选择直播类型', help_text: '因三大运营商针对直播管控比较严，请根据当地实际情况选择。',
      options: JSON.stringify([
        { label: '机顶盒（需要支持CEC功能）', value: 'set_top_box' },
        { label: '直播服务器（小前端）', value: 'live_server' },
        { label: '软终端（直播APP）', value: 'soft_terminal' },
        { label: '数字信号（同轴）', value: 'digital_coax' },
      ]),
      conditions: JSON.stringify({
        logic: 'and',
        rules: [{ field: 'homepage_type', operator: 'in', value: ['skyworth_hotel', 'skyworth_foot'] }],
      }),
      sort_order: 8,
    },
    {
      step_index: 2, field_key: 'soft_terminal_app', label: '软终端直播应用', field_type: 'file',
      is_required: true, placeholder: '请上传软终端直播应用', help_text: '如不提供会导致默认酒店系统跳转HDMI信号源。请尽快提供。',
      conditions: JSON.stringify({
        logic: 'and',
        rules: [{ field: 'live_tv_method', operator: 'eq', value: 'soft_terminal' }],
      }),
      sort_order: 9,
    },

    // === Step 4: 系统与服务对接 ===
    {
      step_index: 3, field_key: 'call_front_desk', label: '电视呼叫前台功能', field_type: 'select',
      is_required: true, placeholder: '请选择呼叫前台方式', help_text: '',
      options: JSON.stringify([
        { label: '云端方案（按设备端收费）', value: 'cloud' },
        { label: '局域网方案（需要直播服务器）', value: 'lan' },
        { label: '无打电话需求', value: 'none' },
      ]),
      conditions: JSON.stringify({
        logic: 'and',
        rules: [{ field: 'homepage_type', operator: 'in', value: ['skyworth_hotel', 'skyworth_foot', 'third_party'] }],
      }),
      sort_order: 1,
    },
    {
      step_index: 3, field_key: 'has_pms', label: '是否有PMS（酒店管理系统）', field_type: 'select',
      is_required: true, placeholder: '可在酒店主页显示入住人姓名或其他PMS拉通功能', help_text: '',
      options: JSON.stringify([
        { label: '有', value: 'yes' },
        { label: '无', value: 'no' },
      ]),
      conditions: JSON.stringify({
        logic: 'and',
        rules: [{ field: 'homepage_type', operator: 'eq', value: 'skyworth_hotel' }],
      }),
      sort_order: 2,
    },
    {
      step_index: 3, field_key: 'pms_vendor', label: 'PMS供应商名称', field_type: 'text',
      is_required: true, placeholder: '请输入PMS供应商', help_text: '请根据实际酒店部署的酒管系统，提前告知使用PMS供应商。如没有适配的需要提前适配。已经适配的PMS代理商需要提供对应酒店信息进行拉通。',
      conditions: JSON.stringify({
        logic: 'and',
        rules: [{ field: 'has_pms', operator: 'eq', value: 'yes' }],
      }),
      sort_order: 3,
    },
    {
      step_index: 3, field_key: 'self_invoice', label: '是否使用自助开票', field_type: 'select',
      is_required: false, placeholder: '开票需要提供对应二维码', help_text: '',
      options: JSON.stringify([
        { label: '是', value: 'yes' },
        { label: '否', value: 'no' },
      ]),
      conditions: JSON.stringify({
        logic: 'and',
        rules: [
          { field: 'homepage_type', operator: 'eq', value: 'skyworth_hotel' },
          { field: 'has_pms', operator: 'eq', value: 'yes' },
        ],
      }),
      sort_order: 4,
    },
    {
      step_index: 3, field_key: 'self_laundry', label: '是否有自助洗衣', field_type: 'select',
      is_required: false, placeholder: '实际酒店是否部署洗衣机', help_text: '',
      options: JSON.stringify([
        { label: '创维洗衣机', value: 'skyworth' },
        { label: 'TCL洗衣机（需要提供对应对接信息）', value: 'tcl' },
        { label: 'LG洗衣机（需要提供对应对接信息）', value: 'lg' },
        { label: '其他洗衣机', value: 'other' },
        { label: '无洗衣机需求', value: 'none' },
      ]),
      conditions: JSON.stringify({
        logic: 'and',
        rules: [{ field: 'homepage_type', operator: 'eq', value: 'skyworth_hotel' }],
      }),
      sort_order: 5,
    },
    {
      step_index: 3, field_key: 'other_laundry_brand', label: '其他洗衣机品牌', field_type: 'text',
      is_required: true, placeholder: '请输入洗衣机品牌', help_text: '需要明确酒店洗衣机是否含有线上实时获取洗衣机状态或预约功能。如普通洗衣机将不进行对接，仅在酒店页面上显示洗衣机位置信息。是智能洗衣机需要提前拉第三方品牌进行对接。',
      conditions: JSON.stringify({
        logic: 'and',
        rules: [{ field: 'self_laundry', operator: 'eq', value: 'other' }],
      }),
      sort_order: 6,
    },
    {
      step_index: 3, field_key: 'hotel_robots', label: '酒店机器人', field_type: 'multi_select',
      is_required: false, placeholder: '需要提前对接酒店机器人信息', help_text: '',
      options: JSON.stringify([
        { label: '送物机器人', value: 'delivery' },
        { label: '炒菜机器人', value: 'cooking' },
        { label: '巡检机器人', value: 'patrol' },
        { label: '垃圾回收机器人', value: 'trash' },
        { label: '扫地机器人（带自清洗）', value: 'sweeping' },
        { label: '无机器人需求', value: 'none' },
      ]),
      conditions: JSON.stringify({
        logic: 'and',
        rules: [{ field: 'homepage_type', operator: 'eq', value: 'skyworth_hotel' }],
      }),
      sort_order: 7,
    },
    {
      step_index: 3, field_key: 'online_mall', label: '线上商城', field_type: 'multi_select',
      is_required: false, placeholder: '智慧主页含商城功能', help_text: '电视下单需要同步采购打印机',
      options: JSON.stringify([
        { label: '智慧主页-商城（需要配合硬件打印机）', value: 'smart_mall' },
        { label: '第三方商城（提供二维码进行处理）', value: 'third_party' },
        { label: '不使用', value: 'none' },
      ]),
      conditions: JSON.stringify({
        logic: 'and',
        rules: [{ field: 'homepage_type', operator: 'eq', value: 'skyworth_hotel' }],
      }),
      sort_order: 8,
    },

    // === Step 5: 最终确认 ===
    {
      step_index: 4, field_key: 'device_count', label: '酒店设备数量', field_type: 'number',
      is_required: true, placeholder: '请输入整数', help_text: '请务必填写需要刷机数量，以确保后续设备维护方便。',
      validation: JSON.stringify({ min: 1, integer: true }),
      sort_order: 1,
    },
    {
      step_index: 4, field_key: 'delivery_email', label: '刷机码交付人邮箱', field_type: 'email',
      is_required: true, placeholder: '请输入正确邮箱', help_text: '请仔细填写内容，为方便交付给您刷机码方式',
      validation: JSON.stringify({ pattern: 'email' }),
      sort_order: 2,
    },
    {
      step_index: 4, field_key: 'delivery_contact', label: '刷机码交付业务员', field_type: 'text',
      is_required: true, placeholder: '请输入创维业务人员名称', help_text: '',
      sort_order: 3,
    },
    {
      step_index: 4, field_key: 'additional_notes', label: '其他信息补充', field_type: 'textarea',
      is_required: false, placeholder: '以上需求以外，请在这里输入详细需求', help_text: '',
      validation: JSON.stringify({ maxLength: 500 }),
      sort_order: 4,
    },
  ];

  // Insert fields with correct step_id
  const fieldInserts = fields.map(f => ({
    step_id: stepIds[f.step_index],
    field_key: f.field_key,
    label: f.label,
    field_type: f.field_type,
    is_required: f.is_required ? 1 : 0,
    placeholder: f.placeholder || '',
    help_text: f.help_text || '',
    options: f.options || null,
    validation: f.validation || null,
    conditions: f.conditions || null,
    sort_order: f.sort_order,
  }));

  await knex('form_fields').insert(fieldInserts);
};
