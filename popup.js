var getSelectedTab = (tab) => {
  var tabId = tab.id;
  var sendMessage = (messageObj) => chrome.tabs.sendMessage(tabId, messageObj);
  document.getElementById('clear-data').addEventListener('click', () => sendMessage({ action: 'CLEAR' }));
}
chrome.tabs.getSelected(null, getSelectedTab);