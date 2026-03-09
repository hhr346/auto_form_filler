// 数据导入导出工具
export async function exportData() {
  const data = await chrome.storage.local.get(['formData']);
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `auto-form-filler-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importData(file) {
  const text = await file.text();
  const data = JSON.parse(text);
  await chrome.storage.local.set({ formData: data.formData });
  return true;
}
