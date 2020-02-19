var getSelectedTab = (tab) => {
  var tabId = tab.id;
  var sendMessage = (messageObj) => chrome.tabs.sendMessage(tabId, messageObj);
  document.getElementById('clear-data-btn').addEventListener('click', () => sendMessage({ action: 'CLEAR', data: { 'days': parseFloat(document.getElementById('clear-data-input').value) } }));
}
chrome.tabs.getSelected(null, getSelectedTab);