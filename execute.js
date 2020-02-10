
const clearData = () => {
  localStorage["xxx"] = "";
  console.log('clear');
  console.log(localStorage["xxx"]);
};

const onMessage = (message) => {
  switch (message.action) {
    case 'CLEAR':
      clearData();
      break;
    default:
      break;
  }
}

chrome.runtime.onMessage.addListener(onMessage);


chrome.runtime.sendMessage({ "message": "activate_icon" });


var s = document.createElement('script');
s.src = chrome.extension.getURL("houseprice.js");
(document.head || document.documentElement).appendChild(s);
s.parentNode.removeChild(s);
