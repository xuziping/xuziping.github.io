;(function(){
  function ensureToast(){
    var screen = document.querySelector('.screen') || document.body
    var t = document.getElementById('common-toast')
    if(!t){
      t = document.createElement('div')
      t.id = 'common-toast'
      t.className = 'fixed top-20 left-1/2 -translate-x-1/2 w-[360px] max-w-[calc(100%-24px)] hidden z-50 flex items-center gap-2 px-3 py-2 rounded-xl shadow'
      screen.appendChild(t)
      var icon = document.createElement('i')
      icon.className = 'fas fa-exclamation-circle'
      t.appendChild(icon)
      var span = document.createElement('span')
      span.id = 'common-toast-text'
      t.appendChild(span)
    }
    return t
  }

  function setVariant(t, variant){
    var base = 'bg-red-50 border border-red-200 text-red-800'
    if(variant==='ok') base = 'bg-green-50 border border-green-200 text-green-800'
    if(variant==='warn') base = 'bg-yellow-50 border border-yellow-200 text-yellow-800'
    t.className = 'fixed top-20 left-1/2 -translate-x-1/2 w-[360px] max-w-[calc(100%-24px)] z-50 flex items-center gap-2 px-3 py-2 rounded-xl shadow ' + base
  }

  var hideTimer

  window.toastShow = function(msg, variant){
    var t = ensureToast()
    setVariant(t, variant||'error')
    var s = document.getElementById('common-toast-text')
    if(s) s.textContent = msg || ''
    t.classList.remove('hidden')
    if(hideTimer) clearTimeout(hideTimer)
    hideTimer = setTimeout(function(){ t.classList.add('hidden') }, 3000)
  }

  window.toastHide = function(){
    var t = document.getElementById('common-toast')
    if(t) t.classList.add('hidden')
    if(hideTimer) clearTimeout(hideTimer)
  }

  window.scanOverlay = function(opts){
    var screen = document.querySelector('.screen') || document.body
    var ov = document.getElementById('scan-overlay')
    if(ov) ov.remove()
    ov = document.createElement('div')
    ov.id = 'scan-overlay'
    ov.style.position = 'fixed'
    ov.style.left = '0'
    ov.style.top = '0'
    ov.style.right = '0'
    ov.style.bottom = '0'
    ov.style.display = 'flex'
    ov.style.alignItems = 'center'
    ov.style.justifyContent = 'center'
    ov.style.background = 'rgba(0,0,0,0.35)'
    ov.style.zIndex = '60'
    var box = document.createElement('div')
    box.style.width = '240px'
    box.style.height = '240px'
    box.style.border = '2px dashed #22c55e'
    box.style.borderRadius = '16px'
    box.style.background = '#fff'
    box.style.display = 'flex'
    box.style.alignItems = 'center'
    box.style.justifyContent = 'center'
    box.style.fontSize = '12px'
    box.style.color = '#555'
    box.textContent = (opts && opts.text) || '模拟扫码中...'
    ov.appendChild(box)
    screen.appendChild(ov)
    var ms = (opts && opts.duration) || 3000
    setTimeout(function(){ ov.remove(); if(opts && typeof opts.onDone === 'function') opts.onDone() }, ms)
  }

  window.operatorNavbarMount = function(active){
    var container = document.getElementById('bottomNavContainer') || document.querySelector('.screen') || document.body
    var nav = document.getElementById('operator-navbar')
    if(nav) nav.remove()
    nav = document.createElement('div')
    nav.id = 'operator-navbar'
    nav.style.width = '100%'
    nav.style.height = '100%'
    nav.style.background = 'rgba(255,255,255,0.95)'
    nav.style.backdropFilter = 'blur(8px)'
    nav.style.borderTop = '1px solid #e5e7eb'

    var grid = document.createElement('div')
    grid.style.display = 'grid'
    grid.style.gridTemplateColumns = 'repeat(5,1fr)'
    grid.style.height = '100%'

    function link(href, icon, label, isActive){
      var a = document.createElement('a')
      a.href = href
      a.style.display = 'flex'
      a.style.flexDirection = 'column'
      a.style.alignItems = 'center'
      a.style.justifyContent = 'center'
      a.style.fontSize = '11px'
      a.style.color = isActive ? '#4f46e5' : '#666'

      var i = document.createElement('i')
      i.className = icon
      i.style.fontSize = '14px'
      a.appendChild(i)
      var d = document.createElement('div')
      d.textContent = label
      a.appendChild(d)
      return a
    }

    grid.appendChild(link('operator-home.html','fas fa-home','首页',active==='home'))
    grid.appendChild(link('operator-task-list.html','fas fa-list','任务',active==='tasks'))
    grid.appendChild(link('operator-ops.html','fas fa-briefcase','操作',active==='operate'))
    grid.appendChild(link('operator-notification-list.html','fas fa-bell','消息',active==='messages'))
    grid.appendChild(link('operator-profile.html','fas fa-user','我的',active==='profile'))

    nav.appendChild(grid)
    container.appendChild(nav)
  }
})()

;(function(){
  window.dispatcherNavbarMount = function(active){
    var container = document.getElementById('bottomNavContainer') || document.querySelector('.screen') || document.body
    var nav = document.getElementById('dispatcher-navbar')
    if(nav) nav.remove()
    nav = document.createElement('div')
    nav.id = 'dispatcher-navbar'
    nav.style.width = '100%'
    nav.style.height = '100%'
    nav.style.background = 'rgba(255,255,255,0.95)'
    nav.style.backdropFilter = 'blur(8px)'
    nav.style.borderTop = '1px solid #e5e7eb'

    var grid = document.createElement('div')
    grid.style.display = 'grid'
    grid.style.gridTemplateColumns = 'repeat(5,1fr)'
    grid.style.height = '100%'

    function link(href, icon, label, isActive){
      var a = document.createElement('a')
      a.href = href
      a.style.display = 'flex'
      a.style.flexDirection = 'column'
      a.style.alignItems = 'center'
      a.style.justifyContent = 'center'
      a.style.fontSize = '11px'
      a.style.color = isActive ? '#4f46e5' : '#666'
      var i = document.createElement('i')
      i.className = icon
      i.style.fontSize = '14px'
      a.appendChild(i)
      var d = document.createElement('div')
      d.textContent = label
      a.appendChild(d)
      return a
    }

    grid.appendChild(link('dispatcher-home.html','fas fa-home','首页',active==='home'))
    grid.appendChild(link('dispatcher-task-list.html','fas fa-list','任务',active==='tasks'))
    grid.appendChild(link('dispatcher-door-list.html','fas fa-cubes','库门',active==='operate'))
    grid.appendChild(link('dispatcher-notification-list.html','fas fa-bell','消息',active==='messages'))
    grid.appendChild(link('dispatcher-profile.html','fas fa-user','我的',active==='profile'))

    nav.appendChild(grid)
    container.appendChild(nav)
  }
})()

;(function(){
  window.directorNavbarMount = function(active){
    var container = document.getElementById('bottomNavContainer') || document.querySelector('.screen') || document.body
    var nav = document.getElementById('director-navbar')
    if(nav) nav.remove()
    nav = document.createElement('div')
    nav.id = 'director-navbar'
    nav.style.width = '100%'
    nav.style.height = '100%'
    nav.style.background = 'rgba(255,255,255,0.95)'
    nav.style.backdropFilter = 'blur(8px)'
    nav.style.borderTop = '1px solid #e5e7eb'

    var grid = document.createElement('div')
    grid.style.display = 'grid'
    grid.style.gridTemplateColumns = 'repeat(5,1fr)'
    grid.style.height = '100%'

    function link(href, icon, label, isActive){
      var a = document.createElement('a')
      a.href = href
      a.style.display = 'flex'
      a.style.flexDirection = 'column'
      a.style.alignItems = 'center'
      a.style.justifyContent = 'center'
      a.style.fontSize = '11px'
      a.style.color = isActive ? '#4f46e5' : '#666'
      var i = document.createElement('i')
      i.className = icon
      i.style.fontSize = '14px'
      a.appendChild(i)
      var d = document.createElement('div')
      d.textContent = label
      a.appendChild(d)
      return a
    }

    grid.appendChild(link('director-home.html','fas fa-home','首页',active==='home'))
    grid.appendChild(link('director-task-list.html','fas fa-list','任务',active==='tasks'))
    grid.appendChild(link('director-ops.html','fas fa-check-square','审批',active==='operate'))
    grid.appendChild(link('director-notification-list.html','fas fa-bell','消息',active==='messages'))
    grid.appendChild(link('director-profile.html','fas fa-user','我的',active==='profile'))

    nav.appendChild(grid)
    container.appendChild(nav)
  }
})()

;(function(){
  window.createSelectionPanel = function(opts){
    var id = opts.id || 'selectionPanel'
    var listId = id + '-list'
    var selectedValue = ''
    
    var div = document.createElement('div')
    div.id = id
    div.className = 'absolute left-[5px] right-[5px] bottom-[5px] translate-y-full transition-transform duration-200 bg-white border border-gray-200 rounded-2xl shadow-lg p-4 z-50 flex flex-col max-h-[80vh] hidden'
    
    div.innerHTML = `
        <div class="text-sm font-semibold text-gray-800 mb-3 flex-none">${opts.title || '请选择'}</div>
        <div id="${listId}" class="flex-1 overflow-y-auto min-h-0 border border-gray-100 rounded-lg mb-3"></div>
        <div class="grid grid-cols-2 gap-2 flex-none">
          <button id="${id}-confirm" class="px-3 py-2 text-sm rounded bg-indigo-600 text-white"><i class="fas fa-check mr-1"></i>${opts.confirmText || '确认'}</button>
          <button id="${id}-cancel" class="px-3 py-2 text-sm rounded bg-gray-100"><i class="fas fa-times mr-1"></i>取消</button>
        </div>
    `
    
    var listEl = div.querySelector('#' + listId)
    var btnConfirm = div.querySelector('#' + id + '-confirm')
    var btnCancel = div.querySelector('#' + id + '-cancel')
    
    btnConfirm.onclick = function(){
        if(opts.onConfirm) opts.onConfirm(selectedValue)
    }
    
    btnCancel.onclick = function(){
        closePanel()
        if(opts.onCancel) opts.onCancel()
    }
    
    function renderList(items){
        listEl.innerHTML = ''
        items.forEach(function(it){
            var row = document.createElement('div')
            row.className = 'p-3 border-b border-gray-50 last:border-0 cursor-pointer flex items-center justify-between group transition-colors ' + (it.value === selectedValue ? 'bg-indigo-50 text-indigo-700 selected' : 'hover:bg-gray-50 text-gray-700')
            row.innerHTML = `
                <span class="text-sm">${it.label}</span>
                <i class="fas fa-check text-indigo-600 ${it.value === selectedValue ? '' : 'hidden'}"></i>
            `
            row.onclick = function(){
                selectedValue = it.value
                // Re-render to update selection state
                renderList(items)
            }
            listEl.appendChild(row)
        })
    }
    
    function openPanel(items, initialValue){
        selectedValue = initialValue !== undefined ? initialValue : ''
        renderList(items)
        div.classList.remove('hidden')
        // Force reflow
        void div.offsetHeight
        div.style.transform = 'translateY(0)'
    }
    
    function closePanel(){
        div.style.transform = 'translateY(100%)'
        setTimeout(function(){ div.classList.add('hidden') }, 200)
    }
    
    // Mount
    var screen = document.querySelector('.screen') || document.body
    screen.appendChild(div)
    
    return {
        open: openPanel,
        close: closePanel
    }
  }

  window.formatDurationSmart = function(diffSeconds) {
      if (diffSeconds < 60) return diffSeconds + '秒';
      const diffMinutes = Math.floor(diffSeconds / 60);
      if (diffMinutes < 60) return diffMinutes + '分钟';
      const h = Math.floor(diffMinutes / 60);
      if (h < 24) return h + '小时';
      const d = Math.floor(h / 24);
      if (d < 7) return d + '天';
      const w = Math.floor(d / 7);
      if (w < 4) return w + '周';
      const m = Math.floor(d / 30);
      if (m < 12) return m + '个月';
      const y = Math.floor(m / 12);
      return y + '年';
  }
})()

;(function(){
  if(window.APP_DATA_FALLBACK) return
  window.APP_DATA_FALLBACK = {
    "inboundTasks": [
      {
        "id": "TN20240520011",
        "status": "pending",
        "prePlate": "沪A88888",
        "packType": "pallet",
        "wait": 12,
        "door": "-",
        "cargo": { "count": 20, "weight": 980, "volume": 8.3 },
        "ownerName": "华东电子",
        "ownerContact": "张三",
        "ownerPhone": "13900000001"
      },
      {
        "id": "TN20240520014",
        "status": "queue",
        "prePlate": "沪D23333",
        "packType": "pallet",
        "wait": 45,
        "door": "A-01",
        "cargo": { "count": 15, "weight": 800, "volume": 6.5 },
        "ownerName": "西部物流",
        "ownerContact": "赵六",
        "ownerPhone": "13900000004"
      },
      {
        "id": "TN20240520015",
        "status": "queue",
        "prePlate": "沪E45678",
        "packType": "loose",
        "wait": 30,
        "door": "B-01",
        "cargo": { "count": 50, "weight": 1200, "volume": 10.2 },
        "ownerName": "北部商贸",
        "ownerContact": "钱七",
        "ownerPhone": "13900000005"
      },
      {
        "id": "TN20240520012",
        "status": "completed",
        "prePlate": "沪B12345",
        "packType": "loose",
        "wait": 0,
        "door": "A-02",
        "cargo": { "count": 10, "weight": 500, "volume": 4.0 },
        "ownerName": "南方制造",
        "ownerContact": "李四",
        "ownerPhone": "13900000002"
      },
      {
        "id": "TN20240520013",
        "status": "cancelled",
        "prePlate": "沪C56789",
        "packType": null,
        "wait": 0,
        "door": "-",
        "cargo": { "count": 0, "weight": 0, "volume": 0 },
        "ownerName": "北方商贸",
        "ownerContact": "王五",
        "ownerPhone": "13900000003"
      }
    ],
    "doors": [
      { "id": "A-01", "status": "working", "queue": 3, "supportsOversize": true },
      { "id": "A-02", "status": "idle", "queue": 0, "supportsOversize": false },
      { "id": "B-01", "status": "paused", "queue": 4, "supportsOversize": true, "statusTimestamp": "2025-12-02T09:00:00" },
      { "id": "B-02", "status": "limited", "queue": 2, "supportsOversize": false, "statusTimestamp": "2025-12-02T08:35:00" },
      { "id": "C-01", "status": "working", "queue": 1, "supportsOversize": true }
    ],
    "packOptions": ["pallet", "loose", "oversize"],
    "operatorTasks": [
      { "id": "TN20240530001", "stage": "waiting_inbound_accept", "plate": "沪D23333", "door": null, "queue": null, "waiting_me": true, "type": "pallet", "category": "进仓", "created_at": "2024-05-30T08:50:00", "state_time": "2024-05-30T09:00:00" },
      { "id": "TN20240530002", "stage": "waiting_door_assign", "plate": "沪E45678", "door": null, "queue": null, "waiting_me": false, "type": "loose", "category": "进仓", "created_at": "2024-05-30T08:40:00", "state_time": "2024-05-30T08:55:00" },
      { "id": "TN20240530003", "stage": "waiting_call", "plate": "沪F88888", "door": "B-04", "queue": "排位 2", "waiting_me": false, "type": "pallet", "category": "进仓", "created_at": "2024-05-30T08:50:00", "state_time": "2024-05-30T09:20:00" },
      { "id": "TN20240530004", "stage": "waiting_unload", "plate": "沪G12999", "door": "A-02", "queue": "排位 1", "waiting_me": true, "type": "loose", "category": "进仓", "created_at": "2024-05-30T09:00:00", "state_time": "2024-05-30T09:10:00" },
      { "id": "TN20240530005", "stage": "supervision", "plate": "沪H77777", "door": "C-01", "queue": "排位 3", "waiting_me": false, "type": "oversize", "category": "进仓", "created_at": "2024-05-30T08:50:00", "state_time": "2024-05-30T09:40:00" },
      { "id": "TN20240530006", "stage": "completed", "plate": "沪J55555", "door": "A-01", "queue": null, "waiting_me": false, "type": "pallet", "category": "进仓", "created_at": "2024-05-30T08:50:00", "state_time": "2024-05-30T10:30:00" },
      { "id": "TN20240530008", "stage": "waiting_inbound_accept", "plate": "沪L99887", "door": null, "queue": null, "waiting_me": true, "type": "loose", "category": "进仓", "created_at": "2024-05-30T08:50:00", "state_time": "2024-05-30T08:55:00" },
      { "id": "TN20240530009", "stage": "waiting_call", "plate": "沪M55667", "door": "D-05", "queue": "排位 1", "waiting_me": false, "type": "pallet", "category": "进仓", "created_at": "2024-05-30T09:00:00", "state_time": "2024-05-30T09:10:00" },
      { "id": "TN20240530010", "stage": "waiting_door_assign", "plate": "沪N33221", "door": null, "queue": null, "waiting_me": false, "type": "loose", "category": "进仓", "created_at": "2024-05-30T08:45:00", "state_time": "2024-05-30T08:55:00" },
      { "id": "TN20240530011", "stage": "unloading", "plate": "沪P44556", "door": "A-03", "queue": "排位 2", "waiting_me": true, "type": "pallet", "category": "进仓", "created_at": "2024-05-30T08:50:00", "state_time": "2024-05-30T09:30:00" }
    ],
    "operatorTaskDetails": {
      "TN20240530001": { "id": "TN20240530001", "category": "进仓", "state": "待进仓", "assignees": { "operator": "操作员A", "dispatcher": "调度员B" }, "accept": { "plate": "沪D23333", "driver": "司机张三", "driverPhone": "13900001111", "customer": "客户A", "contact": "王五", "phone": "13900000000" }, "cargo": { "count": 24, "weight": 1280, "volume": 9.6 }, "doorInfo": { "door": "--", "queue": "--", "limit": "--" }, "unloadInfo": { "saved": 0, "done": 0 }, "forecast": { "trays": 10, "loose": 50 }, "special": { "hasOversize": "否", "guardMode": "-" }, "workflow": [ { "t": "08:50", "d": "创建任务" }, { "t": "09:00", "d": "待进仓受理" } ], "unloadRecords": [] },
      "TN20240530002": { "id": "TN20240530002", "category": "进仓", "state": "待分配库门", "assignees": { "operator": "操作员A", "dispatcher": "调度员B" }, "accept": { "plate": "沪E45678", "driver": "司机李四", "driverPhone": "13900002222", "customer": "客户B", "contact": "赵六", "phone": "13900000010" }, "cargo": { "count": 12, "weight": 620, "volume": 4.2 }, "doorInfo": { "door": "--", "queue": "--", "limit": "--" }, "unloadInfo": { "saved": 0, "done": 0 }, "forecast": { "trays": 6, "loose": 20 }, "special": { "hasOversize": "否", "guardMode": "-" }, "workflow": [ { "t": "08:40", "d": "创建任务" }, { "t": "08:55", "d": "待分配库门" } ], "unloadRecords": [] },
      "TN20240530003": { "id": "TN20240530003", "category": "进仓", "state": "待叫车", "assignees": { "operator": "操作员A", "dispatcher": "调度员B" }, "accept": { "plate": "沪F88888", "driver": "司机王五", "driverPhone": "13900003333", "customer": "客户C", "contact": "孙七", "phone": "13900000020" }, "cargo": { "count": 30, "weight": 1500, "volume": 10.5 }, "doorInfo": { "door": "B-04", "queue": "排位 2", "limit": "正常" }, "unloadInfo": { "saved": 0, "done": 0 }, "forecast": { "trays": 12, "loose": 40 }, "special": { "hasOversize": "否", "guardMode": "-" }, "workflow": [ { "t": "08:50", "d": "创建任务" }, { "t": "09:10", "d": "分配库门 B-04" }, { "t": "09:20", "d": "待叫车" } ], "unloadRecords": [] },
      "TN20240530004": { "id": "TN20240530004", "category": "进仓", "state": "待卸货", "assignees": { "operator": "操作员A", "dispatcher": "调度员B" }, "accept": { "plate": "沪G12999", "driver": "司机赵六", "driverPhone": "13900004444", "customer": "客户D", "contact": "周八", "phone": "13900000030" }, "cargo": { "count": 18, "weight": 900, "volume": 6.8 }, "doorInfo": { "door": "A-02", "queue": "排位 1", "limit": "正常" }, "unloadInfo": { "saved": 0, "done": 0 }, "forecast": { "trays": 8, "loose": 25 }, "special": { "hasOversize": "否", "guardMode": "-" }, "workflow": [ { "t": "09:00", "d": "车辆就位 A-02" }, { "t": "09:10", "d": "待卸货" } ], "unloadRecords": [] },
      "TN20240530005": { "id": "TN20240530005", "category": "进仓", "state": "监管介入", "assignees": { "operator": "操作员A", "dispatcher": "调度员B" }, "accept": { "plate": "沪H77777", "driver": "司机钱九", "driverPhone": "13900005555", "customer": "客户E", "contact": "吴十", "phone": "13900000040" }, "cargo": { "count": 22, "weight": 1100, "volume": 7.1 }, "doorInfo": { "door": "C-01", "queue": "排位 3", "limit": "正常" }, "unloadInfo": { "saved": 2, "done": 0 }, "forecast": { "trays": 10, "loose": 30 }, "special": { "hasOversize": "是", "guardMode": "-" }, "workflow": [ { "t": "08:50", "d": "创建任务" }, { "t": "09:00", "d": "进仓受理" }, { "t": "09:10", "d": "分配库门 C-01" }, { "t": "09:20", "d": "叫车完成" }, { "t": "09:30", "d": "开始卸货" }, { "t": "09:40", "d": "监管介入" } ], "unloadRecords": [ { "record_id": "R0501", "record_type": "tray", "tray_number": "TP1001", "status": "saved", "has_damage": false }, { "record_id": "R0502", "record_type": "loose", "goods": { "sku": "SKU-5001" }, "actual_quantity": 10, "actual_unit": "箱", "status": "saved", "has_damage": true } ] },
      "TN20240530006": { "id": "TN20240530006", "category": "进仓", "state": "进仓完成", "assignees": { "operator": "操作员A", "dispatcher": "调度员B" }, "accept": { "plate": "沪J55555", "driver": "司机郑一", "driverPhone": "13900006666", "customer": "客户F", "contact": "冯二", "phone": "13900000050" }, "cargo": { "count": 28, "weight": 1400, "volume": 9.2 }, "doorInfo": { "door": "A-01", "queue": "排位 1", "limit": "正常" }, "unloadInfo": { "saved": 3, "done": 3 }, "forecast": { "trays": 2, "loose": 1 }, "special": { "hasOversize": "否", "guardMode": "-" }, "workflow": [ { "t": "08:50", "d": "创建任务" }, { "t": "09:00", "d": "进仓受理" }, { "t": "09:10", "d": "分配库门 A-01" }, { "t": "09:20", "d": "叫车完成" }, { "t": "09:30", "d": "开始卸货" }, { "t": "10:10", "d": "完成卸货" }, { "t": "10:30", "d": "进仓完成" } ], "unloadRecords": [ { "record_id": "R0601", "record_type": "tray", "tray_number": "TP2001", "status": "done" }, { "record_id": "R0602", "record_type": "tray", "tray_number": "TP2002", "status": "done" }, { "record_id": "R0603", "record_type": "loose", "goods": { "sku": "SKU-6001" }, "actual_quantity": 25, "actual_unit": "箱", "status": "done" } ] },
      "TN20240530007": { "id": "TN20240530007", "category": "进仓", "state": "待卸货", "assignees": { "operator": "操作员A", "dispatcher": "调度员B" }, "accept": { "plate": "沪K11223", "driver": "司机冯二", "driverPhone": "13900007777", "customer": "客户G", "contact": "陈三", "phone": "13900000060" }, "cargo": { "count": 20, "weight": 1000, "volume": 7.5 }, "doorInfo": { "door": "B-02", "queue": "排位 4", "limit": "正常" }, "unloadInfo": { "saved": 0, "done": 0 }, "forecast": { "trays": 9, "loose": 22 }, "special": { "hasOversize": "否", "guardMode": "-" }, "workflow": [ { "t": "09:00", "d": "车辆就位 B-02" }, { "t": "09:10", "d": "待卸货" } ], "unloadRecords": [] },
      "TN20240530008": { "id": "TN20240530008", "category": "进仓", "state": "待进仓", "assignees": { "operator": "操作员A", "dispatcher": "调度员B" }, "accept": { "plate": "沪L99887", "driver": "司机陈三", "driverPhone": "13900008888", "customer": "客户H", "contact": "田四", "phone": "13900000070" }, "cargo": { "count": 10, "weight": 500, "volume": 3.5 }, "doorInfo": { "door": "--", "queue": "--", "limit": "--" }, "unloadInfo": { "saved": 0, "done": 0 }, "forecast": { "trays": 5, "loose": 12 }, "special": { "hasOversize": "否", "guardMode": "-" }, "workflow": [ { "t": "08:55", "d": "待进仓受理" } ], "unloadRecords": [] },
      "TN20240530009": { "id": "TN20240530009", "category": "进仓", "state": "待叫车", "assignees": { "operator": "操作员A", "dispatcher": "调度员B" }, "accept": { "plate": "沪M55667", "driver": "司机田四", "driverPhone": "13900009999", "customer": "客户I", "contact": "李四", "phone": "13900000080" }, "cargo": { "count": 16, "weight": 800, "volume": 5.6 }, "doorInfo": { "door": "D-05", "queue": "排位 1", "limit": "正常" }, "unloadInfo": { "saved": 0, "done": 0 }, "forecast": { "trays": 7, "loose": 18 }, "special": { "hasOversize": "否", "guardMode": "-" }, "workflow": [ { "t": "09:00", "d": "分配库门 D-05" }, { "t": "09:10", "d": "待叫车" } ], "unloadRecords": [] },
      "TN20240530010": { "id": "TN20240530010", "category": "进仓", "state": "待分配库门", "assignees": { "operator": "操作员A", "dispatcher": "调度员B" }, "accept": { "plate": "沪N33221", "driver": "司机王五", "driverPhone": "13900001112", "customer": "客户J", "contact": "高五", "phone": "13900000090" }, "cargo": { "count": 14, "weight": 700, "volume": 4.9 }, "doorInfo": { "door": "--", "queue": "--", "limit": "--" }, "unloadInfo": { "saved": 0, "done": 0 }, "forecast": { "trays": 6, "loose": 16 }, "special": { "hasOversize": "否", "guardMode": "-" }, "workflow": [ { "t": "08:45", "d": "创建任务" }, { "t": "08:55", "d": "待分配库门" } ], "unloadRecords": [] },
      "TN20240530011": { "id": "TN20240530011", "category": "进仓", "state": "卸货中", "assignees": { "operator": "操作员A", "dispatcher": "调度员B" }, "accept": { "plate": "沪P44556", "driver": "司机甲", "driverPhone": "13900001113", "customer": "客户K", "contact": "石六", "phone": "13900000100" }, "cargo": { "count": 26, "weight": 1300, "volume": 8.9 }, "doorInfo": { "door": "A-03", "queue": "排位 2", "limit": "正常" }, "unloadInfo": { "saved": 2, "done": 0 }, "forecast": { "trays": 8, "loose": 20 }, "special": { "hasOversize": "否", "guardMode": "-" }, "workflow": [ { "t": "08:50", "d": "创建任务" }, { "t": "09:00", "d": "进仓受理" }, { "t": "09:10", "d": "分配库门 A-03" }, { "t": "09:20", "d": "叫车完成" }, { "t": "09:30", "d": "开始卸货" } ], "unloadRecords": [ { "record_id": "R1101", "record_type": "tray", "tray_number": "TP3001", "status": "saved" }, { "record_id": "R1102", "record_type": "loose", "goods": { "sku": "SKU-7001" }, "actual_quantity": 12, "actual_unit": "箱", "status": "saved" } ] },
      "TN20240530012": { "id": "TN20240530012", "category": "进仓", "state": "卸货中", "assignees": { "operator": "操作员A", "dispatcher": "调度员B" }, "accept": { "plate": "沪Q77889", "driver": "司机乙", "driverPhone": "13900001114", "customer": "客户L", "contact": "杜七", "phone": "13900000110" }, "cargo": { "count": 18, "weight": 900, "volume": 6.4 }, "doorInfo": { "door": "B-05", "queue": "排位 1", "limit": "正常" }, "unloadInfo": { "saved": 3, "done": 1 }, "forecast": { "trays": 6, "loose": 15 }, "special": { "hasOversize": "否", "guardMode": "-" }, "workflow": [ { "t": "08:50", "d": "创建任务" }, { "t": "09:00", "d": "进仓受理" }, { "t": "09:10", "d": "分配库门 B-05" }, { "t": "09:20", "d": "叫车完成" }, { "t": "09:30", "d": "开始卸货" } ], "unloadRecords": [ { "record_id": "R1201", "record_type": "tray", "tray_number": "TP3101", "status": "done" }, { "record_id": "R1202", "record_type": "loose", "goods": { "sku": "SKU-7101" }, "actual_quantity": 8, "actual_unit": "箱", "status": "saved" }, { "record_id": "R1203", "record_type": "tray", "tray_number": "TP3102", "status": "saved" } ] }
    },
    "approvals": [
      { "id": "AP-1001", "type": "force_complete", "task_id": "TN20240530011", "apply_user": "张主管", "apply_time": "2024-05-30 10:35", "desc": "现场超时，申请强制完成", "status": "pending" },
      { "id": "AP-1002", "type": "pack_change", "task_id": "TN20240530001", "apply_user": "李经理", "apply_time": "2024-05-30 09:05", "desc": "将散货更改为整托以便堆码", "status": "approved", "payload": { "new_pack": "pallet" } },
      { "id": "AP-1003", "type": "call_resume", "task_id": "TN20240530009", "apply_user": "王主管", "apply_time": "2024-05-30 09:25", "desc": "恢复叫车，队列压力已缓解", "status": "pending", "payload": { "reason": "队列压力缓解" } },
      { "id": "AP-1004", "type": "door_assign_change", "task_id": "TN20240530002", "apply_user": "赵主管", "apply_time": "2024-05-30 09:00", "desc": "请求变更库门至 B-02", "status": "rejected", "payload": { "new_door": "B-02" } },
      { "id": "AP-1005", "type": "pause", "task_id": "TN20240530012", "apply_user": "钱主管", "apply_time": "2024-05-30 09:45", "desc": "卸货区域拥堵，申请暂停作业", "status": "pending", "payload": { "reason": "安全隐患" } },
      { "id": "AP-1006", "type": "queue_limit", "task_id": "TN20240530003", "apply_user": "孙主管", "apply_time": "2024-05-30 09:22", "desc": "限制每次叫车 1 辆并控制时长", "status": "approved", "payload": { "reason": "库门维修", "duration_min": 30 } },
      { "id": "AP-1007", "type": "resume", "task_id": "TN20240530004", "apply_user": "周主管", "apply_time": "2024-05-30 10:05", "desc": "维修完成，申请恢复作业", "status": "pending", "payload": { "note": "维修完成" } },
      { "id": "AP-1008", "type": "queue_unfreeze", "task_id": "TN20240530003", "apply_user": "吴主管", "apply_time": "2024-05-30 10:10", "desc": "系统恢复，解冻队列", "status": "approved", "payload": { "note": "系统已恢复" } },
      { "id": "AP-1009", "type": "oversize_call_unload", "task_id": "TN20240530005", "apply_user": "郑主管", "apply_time": "2024-05-30 09:50", "desc": "大件叫车并安排卸货，需监护", "status": "pending", "payload": { "guard_requirement": "视频监控", "schedule": "10:30" } },
      { "id": "AP-1010", "type": "issue", "task_id": "TN20240530011", "apply_user": "冯主管", "apply_time": "2024-05-30 10:20", "desc": "破损件处理审批", "status": "approved", "payload": { "decision": "按件赔偿", "note": "破损箱数 2" } },
      { "id": "AP-1011", "type": "force_complete", "task_id": "TN20240530006", "apply_user": "陈经理", "apply_time": "2024-05-30 10:40", "desc": "司机催促，申请强制完成", "status": "rejected", "payload": { "reason": "照片与记录不完整" } }
    ],
    "messages": {
      "operator": [
        { "id": "M20250101-01", "title": "任务 TN20240530004 已分配至 A-02", "body": "请前往库门 A-02 进行卸货。", "time": "2025-11-29T09:31:00", "read": false },
        { "id": "M20250101-02", "title": "库门 B-02 队列恢复正常", "body": "队列压力已缓解，恢复叫车。", "time": "2025-11-29T09:20:00", "read": true },
        { "id": "M20250101-03", "title": "照片补传成功 · TN20240530006", "body": "补传的现场照片已保存。", "time": "2025-11-29T09:05:00", "read": true }
      ],
      "dispatcher": [
        { "id": "DM20250101-01", "title": "暂停叫车 · 门位 A-01", "body": "安全隐患处理，暂时暂停叫车。", "time": "2025-11-29T09:12:00", "read": false },
        { "id": "DM20250101-02", "title": "队列压力缓解 · B-02", "body": "B-02 排队数据：2，建议恢复叫车。", "time": "2025-11-29T09:20:00", "read": true },
        { "id": "DM20250101-03", "title": "强制完成审批通过 · TN20240530006", "body": "审批通过，请更新任务状态。", "time": "2025-11-29T09:45:00", "read": true }
      ],
      "director": [
        { "id": "DR20250101-01", "title": "审批 AP-1001 待处理", "body": "现场超时，申请强制完成，请尽快审批。", "time": "2025-11-29T10:20:00", "read": false },
        { "id": "DR20250101-02", "title": "监护任务更新 · TN20240530005", "body": "需补充拍照与备注信息。", "time": "2025-11-29T09:05:00", "read": true }
      ]
    }
  }
})()
