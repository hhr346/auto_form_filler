// 默认字段配置
const DEFAULT_FIELDS = [
  { id: 'name', label: '姓名', type: 'text', value: '', keywords: ['姓名', 'name', 'username'] },
  { id: 'gender', label: '性别', type: 'select', options: ['男', '女'], value: '', keywords: ['性别', 'gender'] },
  { id: 'birthday', label: '出生日期', type: 'date', value: '', keywords: ['出生', '生日', 'birth'] },
  { id: 'id_card', label: '身份证号', type: 'text', value: '', keywords: ['身份证', 'identity'] },
  { id: 'phone', label: '手机号码', type: 'tel', value: '', keywords: ['手机', '电话', 'phone'] },
  { id: 'email', label: '邮箱', type: 'email', value: '', keywords: ['邮箱', 'email', 'mail'] },
  { id: 'education', label: '学历', type: 'select', options: ['高中', '大专', '本科', '硕士', '博士'], value: '', keywords: ['学历', 'education'] },
  { id: 'emergency_name', label: '紧急联系人', type: 'text', value: '', keywords: ['紧急', 'emergency'] },
  { id: 'emergency_phone', label: '紧急电话', type: 'tel', value: '', keywords: ['紧急电话', 'emergency phone'] },
  { id: 'address', label: '住址', type: 'text', value: '', keywords: ['住址', '地址', 'address'] }
];

let formData = [];

// 初始化
async function init() {
  // 加载保存的数据
  const result = await chrome.storage.local.get(['formData']);
  formData = result.formData || JSON.parse(JSON.stringify(DEFAULT_FIELDS));
  
  renderFieldList();
  setupEventListeners();
}

// 渲染字段列表
function renderFieldList() {
  const fieldList = document.getElementById('fieldList');
  fieldList.innerHTML = '';
  
  formData.forEach((field, index) => {
    const fieldItem = document.createElement('div');
    fieldItem.className = 'field-item';
    fieldItem.innerHTML = `
      <div style="flex: 2;">
        <div style="font-size: 12px; color: #666; margin-bottom: 4px;">${field.label}</div>
        ${renderInput(field, index)}
      </div>
      <div class="field-actions">
        ${index >= DEFAULT_FIELDS.length ? `<button class="btn-delete" onclick="deleteField(${index})">🗑</button>` : ''}
      </div>
    `;
    fieldList.appendChild(fieldItem);
  });
}

// 渲染输入框
function renderInput(field, index) {
  if (field.type === 'select') {
    const options = field.options.map(opt => 
      `<option value="${opt}" ${field.value === opt ? 'selected' : ''}>${opt}</option>`
    ).join('');
    return `<select onchange="updateField(${index}, 'value', this.value)">${options}</select>`;
  } else {
    return `<input type="${field.type}" placeholder="${field.placeholder || ''}" value="${field.value}" onchange="updateField(${index}, 'value', this.value)">`;
  }
}

// 更新字段值
window.updateField = function(index, key, value) {
  formData[index][key] = value;
};

// 删除字段
window.deleteField = function(index) {
  formData.splice(index, 1);
  renderFieldList();
};

// 添加自定义字段
function addField() {
  const label = prompt('字段名称（如：期望薪资）：');
  if (!label) return;
  
  const type = prompt('字段类型（text/select）：', 'text');
  if (!type) return;
  
  const keywords = prompt('匹配关键词（用逗号分隔，如：期望，薪资，salary）：');
  
  const newField = {
    id: `custom_${Date.now()}`,
    label,
    type,
    value: '',
    keywords: keywords ? keywords.split(',').map(k => k.trim()) : [label]
  };
  
  if (type === 'select') {
    const options = prompt('选项（用逗号分隔，如：5k,8k,10k）：');
    newField.options = options ? options.split(',').map(o => o.trim()) : ['选项 1', '选项 2'];
  }
  
  formData.push(newField);
  renderFieldList();
}

// 自动填充
async function autoFill() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'autoFill' });
    
    if (response && response.count > 0) {
      showStatus(`✅ 成功填充 ${response.count} 个字段`, 'success');
    } else {
      showStatus('⚠️ 未找到可填充的表单字段', 'error');
    }
  } catch (e) {
    showStatus('❌ 填充失败，请刷新页面后重试', 'error');
    console.error(e);
  }
}

// 保存数据
async function saveData() {
  try {
    await chrome.storage.local.set({ formData });
    showStatus('✅ 数据已保存', 'success');
  } catch (e) {
    showStatus('❌ 保存失败', 'error');
  }
}

// 显示状态
function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = `status ${type}`;
  
  setTimeout(() => {
    status.className = 'status';
  }, 3000);
}

// 设置事件监听
function setupEventListeners() {
  document.getElementById('autoFillBtn').addEventListener('click', autoFill);
  document.getElementById('saveBtn').addEventListener('click', saveData);
  document.getElementById('addFieldBtn').addEventListener('click', addField);
}

// 启动
init();
