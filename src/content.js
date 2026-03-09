// 默认表单字段配置
const DEFAULT_FIELDS = [
  {
    id: 'name',
    label: '姓名',
    type: 'text',
    placeholder: '请输入姓名',
    value: '',
    keywords: ['姓名', 'name', 'username', 'realname', '真实姓名']
  },
  {
    id: 'gender',
    label: '性别',
    type: 'select',
    options: ['男', '女'],
    value: '',
    keywords: ['性别', 'gender', 'sex']
  },
  {
    id: 'birthday',
    label: '出生日期',
    type: 'date',
    value: '',
    keywords: ['出生', '生日', 'birth', 'birthday', 'date of birth']
  },
  {
    id: 'id_card',
    label: '身份证号',
    type: 'text',
    placeholder: '请输入身份证号',
    value: '',
    keywords: ['身份证', 'identity', 'id card', '证件号码']
  },
  {
    id: 'phone',
    label: '手机号码',
    type: 'tel',
    placeholder: '请输入手机号码',
    value: '',
    keywords: ['手机', '电话', 'phone', 'mobile', 'tel', 'contact']
  },
  {
    id: 'email',
    label: '邮箱',
    type: 'email',
    placeholder: '请输入邮箱地址',
    value: '',
    keywords: ['邮箱', 'email', 'mail', 'e-mail']
  },
  {
    id: 'education',
    label: '学历',
    type: 'select',
    options: ['高中', '大专', '本科', '硕士', '博士'],
    value: '',
    keywords: ['学历', '教育', 'education', 'degree']
  },
  {
    id: 'emergency_name',
    label: '紧急联系人姓名',
    type: 'text',
    placeholder: '请输入紧急联系人姓名',
    value: '',
    keywords: ['紧急联系人', 'emergency', 'contact person']
  },
  {
    id: 'emergency_phone',
    label: '紧急联系人电话',
    type: 'tel',
    placeholder: '请输入紧急联系人电话',
    value: '',
    keywords: ['紧急电话', 'emergency phone', 'contact phone']
  },
  {
    id: 'address',
    label: '住址',
    type: 'text',
    placeholder: '请输入住址',
    value: '',
    keywords: ['住址', '地址', 'address', 'location']
  }
];

// 保存表单数据
async function saveFormData(formData) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ formData }, resolve);
  });
}

// 获取表单数据
async function getFormData() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['formData'], (result) => {
      resolve(result.formData || DEFAULT_FIELDS);
    });
  });
}

// 智能匹配表单字段
function matchField(label, keywords) {
  if (!label) return false;
  const lowerLabel = label.toLowerCase();
  return keywords.some(keyword => lowerLabel.includes(keyword.toLowerCase()));
}

// 自动填充表单
async function autoFillForm() {
  const formData = await getFormData();
  const fields = document.querySelectorAll('input, select, textarea');
  
  let filledCount = 0;
  
  fields.forEach(field => {
    const label = findLabelForField(field);
    
    formData.forEach(fieldData => {
      if (matchField(label, fieldData.keywords) && fieldData.value) {
        fillField(field, fieldData.value);
        filledCount++;
      }
    });
  });
  
  return filledCount;
}

// 查找字段关联的 label
function findLabelForField(field) {
  // 方法 1: 查找 for 属性匹配的 label
  if (field.id) {
    const label = document.querySelector(`label[for="${field.id}"]`);
    if (label) return label.textContent;
  }
  
  // 方法 2: 查找包裹的 label
  const parentLabel = field.closest('label');
  if (parentLabel) return parentLabel.textContent;
  
  // 方法 3: 查找相邻的 label
  const sibling = field.previousElementSibling;
  if (sibling && sibling.tagName === 'LABEL') {
    return sibling.textContent;
  }
  
  // 方法 4: 查找 placeholder
  if (field.placeholder) {
    return field.placeholder;
  }
  
  // 方法 5: 查找 name 属性
  if (field.name) {
    return field.name;
  }
  
  return '';
}

// 填充字段值
function fillField(field, value) {
  try {
    // 根据字段类型填充
    if (field.tagName === 'SELECT') {
      // 下拉选择框 - 尝试匹配选项
      for (let option of field.options) {
        if (option.text.includes(value) || option.value.includes(value)) {
          field.value = option.value;
          field.dispatchEvent(new Event('change', { bubbles: true }));
          return true;
        }
      }
    } else if (field.type === 'checkbox' || field.type === 'radio') {
      // 复选框/单选框
      field.checked = true;
      field.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    } else {
      // 文本输入框
      let finalValue = value;
      
      // 特殊处理：日期格式转换 (yyyy-mm-dd → yyyy/mm/dd)
      if (field.type === 'date' || field.id.includes('birth') || field.name.includes('birth')) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
          finalValue = value.replace(/-/g, '/');
        }
      }
      
      field.value = finalValue;
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }
  } catch (e) {
    console.error('填充字段失败:', e);
    return false;
  }
  return false;
}

// 导出函数供 popup 使用
window.autoFillForm = autoFillForm;
window.getFormData = getFormData;
window.saveFormData = saveFormData;
