const extensionID = "mkcilniegejnlgmabdcoiglhekaekfeh";

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


function getShowHiddenIDList(data) {

  var output = [];
  for (var i = 0; i < data.length; i++) {
    console.log(data[i]);
    var urlRegex = /(https?:\/\/buy.houseprice.tw[^ ][^"]*)/;
    var match_url = data[i].outerHTML.match(urlRegex);
    if (match_url) {
      var id = match_url[1].substring(match_url[1].lastIndexOf("\/") + 1);
      if (id != null)
        output.push(id);
    }
  }

  return output;
}

function setShowHiddenTargets(data_list, val) {

  var show_hidden_dict = {};
  for (var i = 0; i < data_list.length; i++) {
    show_hidden_dict[data_list[i]] = {
      display: val,
      last_time: new Date().toLocaleString()
    };
  }

  return show_hidden_dict;
}

function setShowHiddenUI(show_hidden_dict, val) {

  Object.keys(show_hidden_dict).forEach(function (key) {
    var tgt_url = "https://buy.houseprice.tw/house/" + key;
    var tgt_div = $('a[href$="' + tgt_url + '"]').parent().parent().parent()[0];
    if (val)
      tgt_div.style.display = 'flex';
    else
      tgt_div.style.display = 'none';
  });

}

function doShow(data) {

  var show_hidden_dict = setShowHiddenTargets(getShowHiddenIDList(data), true);
  console.log(show_hidden_dict);
  setShowHiddenUI(show_hidden_dict, true);
}

function showAll() {

  doShow($(".object_con_box.list_con")[0].children);
}

function doHidden(data) {

  var show_hidden_dict = setShowHiddenTargets(getShowHiddenIDList(data), false);
  console.log(show_hidden_dict);
  setShowHiddenUI(show_hidden_dict, false);

  /*
  chrome.runtime.sendMessage(
      extensionID,
      {   name: web_name,
          data: {
              show_hidden: {
                  "id1":{
                      hidden: true,
                      last_time: new Date().toLocaleString()
                  }
              }
          }
      },
      function (response) {
          console.log(response);
      }
  );
  */
}

function hiddenAll() {

  doHidden($(".object_con_box.list_con")[0].children);
}

function addHiddenBtn() {
  var data = $(".object_con_box.list_con")[0].children;
  for (var j = 0; j < data.length; j++) {
    var tgt_element = data[j].lastElementChild;
    if (tgt_element.innerHTML.indexOf('<button class="hidden-btn"') === -1 && tgt_element.innerHTML.indexOf('price_wrap') != -1)
      tgt_element.innerHTML = '<button class="hidden-btn" type="button">Hidden</button>' + tgt_element.innerHTML;
  }

  $('.hidden-btn').unbind("click");
  $('.hidden-btn').click(function () {
    doHidden([$(this).parent().parent()[0]]);
  });
}

window.onload = function () {

  // add extend panel
  if ($(".search_box_wrap")[0].innerHTML.indexOf("ext-panel") === -1) {

    $(".search_box_wrap")[0].innerHTML +=
      '<div id="ext-panel">' +
      '  <button id="show-all-btn" type="button">Show All</button>' +
      '  <button id="hidden-all-btn" type="button">Hidden All</button>' +
      '</div>';

    // add show-all & hidden-all
    $('#show-all-btn').click(function () {
      showAll();
    });

    // add hidden-all
    $('#hidden-all-btn').click(function () {
      hiddenAll();
    });
  }

  // add hidden button for every target
  addHiddenBtn(); // prevent observer not detect
  $("body").on('DOMSubtreeModified', ".object_con_box.list_con", function () {
    addHiddenBtn();
  });

};