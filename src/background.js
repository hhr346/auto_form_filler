// 后台脚本 - 处理扩展消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'autoFill') {
    // 执行自动填充
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'autoFill' }, (response) => {
        sendResponse(response);
      });
    });
    return true; // 保持消息通道开放
  }
  
  if (request.action === 'getFormData') {
    chrome.storage.local.get(['formData'], (result) => {
      sendResponse(result.formData);
    });
    return true;
  }
  
  if (request.action === 'saveFormData') {
    chrome.storage.local.set({ formData: request.data }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});
