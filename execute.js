const extensionID = "mkcilniegejnlgmabdcoiglhekaekfeh";

var storage_data = { 'show_hidden': {}, 'filter_address': '' };

const clearData = (data) => {
  storage_data = { 'show_hidden': {}, 'filter_address': '' };
  console.log('clear');
};

const onMessage = (message) => {
  switch (message.action) {
    case 'CLEAR':
      clearData(message.data);
      break;
    default:
      break;
  }
}

chrome.runtime.onMessage.addListener(onMessage);

chrome.runtime.sendMessage({ "message": "activate_icon" });


function init() {

  chrome.storage.local.get("data", function (stor_data) {
    if (stor_data) {
      console.log(stor_data)
      storage_data = stor_data;
    }
    console.log("load completed, do initWithDom");
    initWithDom();
    console.log("init completed.");
  });
}

function initWithDom(){

  // add extend panel
  if ($("#vue-container")[0].innerHTML.indexOf("ext-panel") === -1) {
    var ext_panel = '<div id="ext-panel">' +
      '  <div id="ext-panel-title">Extend Panel</div>' +
      '  <button id="show-all-btn" type="button">顯示所有</button>' +
      '  <button id="hidden-all-btn" type="button">隱藏所有</button>' +
      '  <a href="javascript:void(0);" id="show-detail-btn">展開</a>' +
      '  <span class="filter-address">去除地址關鍵字:</span><input type="text" id="filter-address-input" placeholder=" OO路;XX巷" name="filter-address-input">' +
      '  <button id="save-filter-address-btn" type="button">儲存</button>' +
      '  <div id="hidden-detail" style="display:none;"></div>' +
      '</div>';

    $('.search_box_wrap').after(ext_panel);

    $('#show-detail-btn').click(function () {
      if ($(this).hasClass('active')) {
        $(this).removeClass('active');
        $('#hidden-detail').css('display', 'none');
        $('#show-detail-btn')[0].innerText = '展開';
      }
      else {
        $(this).addClass('active');
        $('#hidden-detail').css('display', 'block');
        $('#show-detail-btn')[0].innerText = '隱藏';
      }
    });

    // add show-all & hidden-all
    $('#show-all-btn').click(function () {
      showAll();
    });

    // add hidden-all
    $('#hidden-all-btn').click(function () {
      hiddenAll();
    });

    // add hidden button for every target
    addHiddenShowBtn(); // prevent observer not detect
    $("body").on('DOMSubtreeModified', ".object_con_box.list_con", function () {
      addHiddenShowBtn();
    });

  }
}

// local function 
function saveStorage() {

  chrome.storage.local.set({ "data": stor_data }, function () {
    console.log("save completed");
  });
}

function getID(html_data){

  var urlRegex = /(https?:\/\/buy.houseprice.tw[^ ][^"]*)/;
  var match_url = html_data.outerHTML.match(urlRegex);
  if (match_url) {
    var id = match_url[1].substring(match_url[1].lastIndexOf("\/") + 1);
    if (id != null)
      return id;
  }

  return null;
}

function getShowHiddenIDList(data) {

  var output = [];
  for (var i = 0; i < data.length; i++) {
    console.log(data[i]);
    var id = getID(data[i]);
    if (id != null)
      output.push(id);
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
    if (val){
      tgt_div.style.display = 'flex';
      $('#show-' + key)[0].style.display = 'none';
    }
    else{
      tgt_div.style.display = 'none';
      $('#show-' + key)[0].style.display = 'grid';
    }
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
}

function hiddenAll() {

  doHidden($(".object_con_box.list_con")[0].children);
}

function addHiddenShowBtn() {
  var data = $(".object_con_box.list_con")[0].children;
  for (var j = 0; j < data.length; j++) {
    var tgt_element = data[j].children[1];
    if (tgt_element != null && tgt_element.innerHTML.indexOf('<button class="hidden-btn"') === -1 && tgt_element.innerHTML.indexOf('title_list') != -1){
      
      // show button
      var obj_desc1 = data[j].children[1].children[0].children[0].innerText;
      console.log(data[j].children[1].children[1]);
      var obj_desc2 = data[j].children[1].children[1].children[1].innerText;
      var obj_desc3 = data[j].children[2].children[1].innerText
      var id = getID(data[j]);
      $('#hidden-detail')[0].innerHTML += '<div class="show-item" id="show-' + id + '"><button class="show-btn" type="button">Show</button><div>' + obj_desc1 + '</div><div>' + obj_desc2 + '</div><div>' + obj_desc3 + '</div></div>';

      // hidden button
      tgt_element.style.position = 'relative';
      tgt_element.innerHTML = '<button class="hidden-btn" id="hidden-' + id + '" type="button">隱藏</button>' + tgt_element.innerHTML;

    }
  }

  $('.hidden-btn').unbind("click");
  $('.hidden-btn').click(function () {
    doHidden([$(this).parent().parent()[0]]);
  });

  $('.show-btn').unbind("click");
  $('.show-btn').click(function () {
    var show_item = $(this).parent()[0];
    doShow([$('#hidden-' + show_item.id.replace('show-','')).parent().parent()[0]]);
  });
}

window.onload = function () {
  initWithDom();
};
