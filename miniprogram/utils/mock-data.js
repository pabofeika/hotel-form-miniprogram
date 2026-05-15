/**
 * 本地内置的默认表单数据
 * 当 API 请求超时时作为后备数据使用
 */
const defaultFormTemplate = {
  "id": 1,
  "title": "创维商用智慧酒店创建配置表",
  "description": "用于酒店创建时收集配置信息",
  "status": "published",
  "version": "1.0",
  "steps": [
    {
      "id": 1, "step_number": 1, "title": "酒店基本信息", "description": "请输入酒店的基本信息",
      "fields": [
        {"id":1,"step_id":1,"field_key":"hotel_name","label":"酒店名称","field_type":"text","is_required":1,"placeholder":"请输入酒店名称","help_text":"","sort_order":1},
        {"id":2,"step_id":1,"field_key":"hotel_address","label":"酒店详细地址","field_type":"text","is_required":1,"placeholder":"请输入酒店详细地址","help_text":"","sort_order":2}
      ]
    },
    {
      "id": 2, "step_number": 2, "title": "主页与收银配置", "description": "选择酒店主页类型和相关配置",
      "fields": [
        {"id":3,"step_id":2,"field_key":"homepage_type","label":"酒店主页选择","field_type":"select","is_required":1,"placeholder":"请选择酒店主页类型","options":[{"label":"创维智慧酒店主页","value":"skyworth_hotel"},{"label":"创维智慧沐足主页","value":"skyworth_foot"},{"label":"第三方主页","value":"third_party"},{"label":"酷开主页","value":"coocaa"}],"conditions":null,"sort_order":1},
        {"id":4,"step_id":2,"field_key":"foot_bath_pos","label":"足浴收银系统","field_type":"select","is_required":1,"placeholder":"请选择足浴收银系统","options":[{"label":"机机乐","value":"jijile"},{"label":"智荟宝","value":"zhihuibao"},{"label":"其他厂商","value":"other"},{"label":"无需收银系统","value":"none"}],"conditions":{"logic":"and","rules":[{"field":"homepage_type","operator":"eq","value":"skyworth_foot"}]},"sort_order":2},
        {"id":5,"step_id":2,"field_key":"other_pos_name","label":"其他收银SaaS厂商名称","field_type":"text","is_required":1,"placeholder":"请输入收银SaaS厂商名称","help_text":"关乎设备上支持展示技师信息及刷卡上钟状态","conditions":{"logic":"and","rules":[{"field":"foot_bath_pos","operator":"eq","value":"other"}]},"sort_order":3},
        {"id":6,"step_id":2,"field_key":"third_party_app","label":"第三方主页应用","field_type":"file","is_required":1,"placeholder":"请上传第三方主页应用","conditions":{"logic":"and","rules":[{"field":"homepage_type","operator":"eq","value":"third_party"}]},"sort_order":4}
      ]
    },
    {
      "id": 3, "step_number": 3, "title": "客控与核心功能", "description": "配置客控系统、数字人、点播、直播等功能",
      "fields": [
        {"id":7,"step_id":3,"field_key":"homepage_template","label":"主页模版选择","field_type":"select","is_required":1,"options":[{"label":"模版一","value":"template_1"},{"label":"模版二","value":"template_2"},{"label":"模版三","value":"template_3"}],"conditions":{"logic":"and","rules":[{"field":"homepage_type","operator":"in","value":["skyworth_hotel","skyworth_foot"]}]},"sort_order":1},
        {"id":8,"step_id":3,"field_key":"room_control_type","label":"客控类型选择","field_type":"select","is_required":1,"options":[{"label":"无客控","value":"none"},{"label":"第三方客控（需要对接）","value":"third_party"},{"label":"创维自研客控","value":"skyworth_self"}],"conditions":{"logic":"and","rules":[{"field":"homepage_type","operator":"in","value":["skyworth_hotel","skyworth_foot"]}]},"sort_order":2},
        {"id":9,"step_id":3,"field_key":"third_party_rc_name","label":"第三方客控名称","field_type":"text","is_required":1,"placeholder":"请输入第三方客控名称","conditions":{"logic":"and","rules":[{"field":"room_control_type","operator":"eq","value":"third_party"}]},"sort_order":3},
        {"id":10,"step_id":3,"field_key":"skyworth_rc_series","label":"创维自研客控系列","field_type":"select","is_required":1,"options":[{"label":"S系列","value":"s_series"},{"label":"D系列","value":"d_series"},{"label":"V系列","value":"v_series"}],"conditions":{"logic":"and","rules":[{"field":"room_control_type","operator":"eq","value":"skyworth_self"}]},"sort_order":4},
        {"id":11,"step_id":3,"field_key":"use_digital_human","label":"是否使用创维数字人","field_type":"select","is_required":0,"options":[{"label":"使用","value":"yes"},{"label":"不使用","value":"no"}],"sort_order":5},
        {"id":12,"step_id":3,"field_key":"vod_method","label":"酒店点播方式","field_type":"select","is_required":1,"options":[{"label":"极光TV-商用版本","value":"aurora_tv"},{"label":"其他点播应用","value":"other"},{"label":"无点播","value":"none"}],"help_text":"建议使用极光TV商用版本","conditions":{"logic":"and","rules":[{"field":"homepage_type","operator":"in","value":["skyworth_hotel","skyworth_foot"]}]},"sort_order":6},
        {"id":13,"step_id":3,"field_key":"other_vod_app","label":"其他点播应用","field_type":"file","is_required":1,"conditions":{"logic":"and","rules":[{"field":"vod_method","operator":"eq","value":"other"}]},"sort_order":7},
        {"id":14,"step_id":3,"field_key":"live_tv_method","label":"酒店直播方式","field_type":"select","is_required":1,"options":[{"label":"机顶盒（需支持CEC）","value":"set_top_box"},{"label":"直播服务器","value":"live_server"},{"label":"软终端（直播APP）","value":"soft_terminal"},{"label":"数字信号（同轴）","value":"digital_coax"}],"help_text":"因三大运营商直播管控较严，请根据实际情况选择","conditions":{"logic":"and","rules":[{"field":"homepage_type","operator":"in","value":["skyworth_hotel","skyworth_foot"]}]},"sort_order":8},
        {"id":15,"step_id":3,"field_key":"soft_terminal_app","label":"软终端直播应用","field_type":"file","is_required":1,"conditions":{"logic":"and","rules":[{"field":"live_tv_method","operator":"eq","value":"soft_terminal"}]},"sort_order":9}
      ]
    },
    {
      "id": 4, "step_number": 4, "title": "酒店系统与服务对接", "description": "PMS、洗衣、机器人、商城等系统对接",
      "fields": [
        {"id":16,"step_id":4,"field_key":"call_front_desk","label":"电视呼叫前台功能","field_type":"select","is_required":1,"options":[{"label":"云端方案","value":"cloud"},{"label":"局域网方案","value":"lan"},{"label":"无打电话需求","value":"none"}],"conditions":{"logic":"and","rules":[{"field":"homepage_type","operator":"in","value":["skyworth_hotel","skyworth_foot","third_party"]}]},"sort_order":1},
        {"id":17,"step_id":4,"field_key":"has_pms","label":"是否有PMS（酒店管理系统）","field_type":"select","is_required":1,"options":[{"label":"有","value":"yes"},{"label":"无","value":"no"}],"conditions":{"logic":"and","rules":[{"field":"homepage_type","operator":"eq","value":"skyworth_hotel"}]},"sort_order":2},
        {"id":18,"step_id":4,"field_key":"pms_vendor","label":"PMS供应商名称","field_type":"text","is_required":1,"placeholder":"请输入PMS供应商","conditions":{"logic":"and","rules":[{"field":"has_pms","operator":"eq","value":"yes"}]},"sort_order":3},
        {"id":19,"step_id":4,"field_key":"self_invoice","label":"是否使用自助开票","field_type":"select","is_required":0,"options":[{"label":"是","value":"yes"},{"label":"否","value":"no"}],"conditions":{"logic":"and","rules":[{"field":"homepage_type","operator":"eq","value":"skyworth_hotel"},{"field":"has_pms","operator":"eq","value":"yes"}]},"sort_order":4},
        {"id":20,"step_id":4,"field_key":"self_laundry","label":"是否有自助洗衣","field_type":"select","is_required":0,"options":[{"label":"创维洗衣机","value":"skyworth"},{"label":"TCL洗衣机","value":"tcl"},{"label":"LG洗衣机","value":"lg"},{"label":"其他洗衣机","value":"other"},{"label":"无洗衣机需求","value":"none"}],"conditions":{"logic":"and","rules":[{"field":"homepage_type","operator":"eq","value":"skyworth_hotel"}]},"sort_order":5},
        {"id":21,"step_id":4,"field_key":"other_laundry_brand","label":"其他洗衣机品牌","field_type":"text","is_required":1,"placeholder":"请输入洗衣机品牌","conditions":{"logic":"and","rules":[{"field":"self_laundry","operator":"eq","value":"other"}]},"sort_order":6},
        {"id":22,"step_id":4,"field_key":"hotel_robots","label":"酒店机器人","field_type":"multi_select","is_required":0,"options":[{"label":"送物机器人","value":"delivery"},{"label":"炒菜机器人","value":"cooking"},{"label":"巡检机器人","value":"patrol"},{"label":"垃圾回收机器人","value":"trash"},{"label":"扫地机器人","value":"sweeping"},{"label":"无机器人需求","value":"none"}],"conditions":{"logic":"and","rules":[{"field":"homepage_type","operator":"eq","value":"skyworth_hotel"}]},"sort_order":7},
        {"id":23,"step_id":4,"field_key":"online_mall","label":"线上商城","field_type":"select","is_required":0,"options":[{"label":"智慧主页-商城","value":"smart_mall"},{"label":"第三方商城","value":"third_party"},{"label":"不使用","value":"none"}],"help_text":"电视下单需要同步采购打印机","conditions":{"logic":"and","rules":[{"field":"homepage_type","operator":"eq","value":"skyworth_hotel"}]},"sort_order":8}
      ]
    },
    {
      "id": 5, "step_number": 5, "title": "最终确认", "description": "设备数量、交付信息和补充需求",
      "fields": [
        {"id":24,"step_id":5,"field_key":"device_count","label":"酒店设备数量","field_type":"number","is_required":1,"placeholder":"请输入整数","help_text":"请务必填写需要刷机数量","sort_order":1},
        {"id":25,"step_id":5,"field_key":"delivery_email","label":"刷机码交付人邮箱","field_type":"email","is_required":1,"placeholder":"请输入正确邮箱","help_text":"为方便交付给您刷机码","sort_order":2},
        {"id":26,"step_id":5,"field_key":"delivery_contact","label":"刷机码交付业务员","field_type":"text","is_required":1,"placeholder":"请输入创维业务人员名称","sort_order":3},
        {"id":27,"step_id":5,"field_key":"additional_notes","label":"其他信息补充","field_type":"textarea","is_required":0,"placeholder":"以上需求以外，请在这里输入详细需求","sort_order":4}
      ]
    }
  ]
};

module.exports = { defaultFormTemplate };
