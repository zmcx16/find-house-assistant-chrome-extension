/*
const rotateEvent = () => {
  document.body.style.transform = 'rotate(180deg)';
};
const reset = () => {
  document.body.style.transform = '';
}

const onMessage = (message) => {
  switch (message.action) {
    case 'ROTATE':
      rotateEvent();
      break;
    case 'RESET':
      reset();
      break;
    default:
      break;
  }
}

chrome.runtime.onMessage.addListener(onMessage);
*/

var s = document.createElement('script');
s.src = chrome.extension.getURL("houseprice.js");
(document.head || document.documentElement).appendChild(s);
s.parentNode.removeChild(s);

/*
var style = document.createElement('link');
style.rel = 'stylesheet';
style.type = 'text/css';
style.href = chrome.extension.getURL('style.css');
  //(document.head || document.documentElement).appendChild(style);


$.ajax({
  url: style.href,
  async: true,
  success: function (data, textStatus, xhr) {
    console.log(data);
  },
  error: function (xhr, textStatus, errorThrown) {
    console.log(xhr);
    console.log(textStatus);
    console.log(errorThrown);
  },
  timeout: 10000
});
*/

/*
$(document).ready(function () {

  //var a = chrome.extension.getURL("style.css");
  //$("head")[0].innerHTML += '<link rel="stylesheet" type="text/css" href="' + a + '" >';

  if ($(".search_box_wrap")[0].innerHTML.indexOf("ext-panel")===-1){
    $(".search_box_wrap")[0].innerHTML += '<div id="ext-panel"><button id="show-all" type="button"">Show All</button><button id="hidden-all" type="button"">Hidden All</button></div>'

    //window.setTimeout((() => console.log("Hello!")), 1000);
  }

  //$("#show-all").css('color', 'red');

});
*/
/*
(function () {
  var element = document.createElement('script');
  element.type = "text/javascript";
  element.src = chrome.runtime.getURL("addBtn.js");;
  document.body.appendChild(element);
}());
*/
