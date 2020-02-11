chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.message === "activate_icon") {
        chrome.pageAction.show(sender.tab.id);
    }
});

var storage_data = { "data": {"buy_houseprice_tw":{}}};


chrome.storage.local.set({ "color": "red" }, function () {
    console.log("set");
    //string or array of string or object keys
    chrome.storage.local.get("color", function (items) {
        console.log("get");
        console.log(items);
    });
});

chrome.runtime.onMessageExternal.addListener(function (message, sender, sendResponse) {
    console.log(sender);
    console.log(message);

    sendResponse({ "ret": 0, "data": storage_data["data"]["buy_houseprice_tw"]});
});