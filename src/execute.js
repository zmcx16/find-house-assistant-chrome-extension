var storage_data = { 'show_hidden': {}, 'filter_address': '', 'bookmark': {} };
var text_dict = {
  addStar: '追蹤',
  cancelStar: '取消',
  showAll: '顯示所有',
  hiddenAll: '隱藏所有',
  show: '展開',
  hidden: '隱藏',
  filterAddrKeyword: '去除地址關鍵字:',
  save: '儲存',
  showStarList: '展開追蹤清單',
  hiddenStarList: '隱藏追蹤清單',
  display: '顯示',
  extendBoard: '擴充面板'
};

var ui_loading = false;

// popup message
const onMessage = (message) => {
  switch (message.action) {
    case 'CLEAR':
      clearData(message.data);
      break;
    default:
      break;
  }
};

chrome.runtime.onMessage.addListener(onMessage);
chrome.runtime.sendMessage({ "message": "activate_icon" });

function clearStorageData(dict_key, clear_time_length) {

  var del_list = [];
  var now = Math.floor(new Date().getTime() / 1000);

  Object.keys(storage_data[dict_key]).forEach(function (key) {
    if (now - storage_data[dict_key][key].last_time > clear_time_length) {
      del_list.push(key);
    }
  });

  for (var i = 0; i < del_list.length; i++) {
    delete storage_data[dict_key][del_list[i]];
  }
}

const clearData = (data) => {

  var clear_time_length = data.days * 86400;
  clearStorageData('show_hidden', clear_time_length);
  clearStorageData('bookmark', clear_time_length);

  saveStorage(function () {
    console.log('do clear');
    location.reload();
  });

};

// Dom event
window.onload = function () {
  window.setTimeout((() => {
    init();
  }), 1000);
};

// local function 
function init() {

  chrome.storage.local.get("data", function (stor_data) {

    initWithDom();

    if (Object.keys(stor_data).length > 0) {
      storage_data = { ...stor_data["data"] };
      if (!('show_hidden' in storage_data)){
        storage_data['show_hidden'] = {};
      }

      if (!('filter_address' in storage_data)){
        storage_data['filter_address'] = '';
      }

      if (!('bookmark' in storage_data)){
        storage_data['bookmark'] = {};
      }

      removeShowHiddenRedundantData();

      console.log(storage_data);
    }

    // update UI
    $('#filter-address-input')[0].value = storage_data['filter_address'];
    setCommonUI();

    console.log("init completed.");
  });
}

function initWithDom() {

  // add extend panel
  if ($("#vue-container")[0].innerHTML.indexOf("ext-panel") === -1) {
    var ext_panel =
      '<div id="ext-panel">' +
      '  <div id="ext-panel-title">' + text_dict.extendBoard + '</div>' +
      '  <button id="show-all-btn" type="button">' + text_dict.showAll + '</button>' +
      '  <button id="hidden-all-btn" type="button">' + text_dict.hiddenAll + '</button>' +
      '  <a href="javascript:void(0);" id="show-detail-btn" class="hyper-link">' + text_dict.show + '</a>' +
      '  <span class="filter-address">' + text_dict.filterAddrKeyword + '</span><input type="text" id="filter-address-input" placeholder=" OO路;XX巷" name="filter-address-input">' +
      '  <button id="save-filter-address-btn" type="button">' + text_dict.save + '</button>' +
      '  <a href="javascript:void(0);" id="star-detail-btn" class="hyper-link">' + text_dict.showStarList + '</a>' +
      '  <div id="star-detail" style="display:none;"></div>' +
      '  <div id="hidden-detail" style="display:none;"></div>' +
      '</div>';

    $('.search_box_wrap').after(ext_panel);

    $('#show-detail-btn').click(function () {
      if ($(this).hasClass('active')) {
        $(this).removeClass('active');
        $('#hidden-detail').css('display', 'none');
        $('#show-detail-btn')[0].innerText = text_dict.show;
      }
      else {
        $(this).addClass('active');
        $('#hidden-detail').css('display', 'block');
        $('#show-detail-btn')[0].innerText = text_dict.hidden;
      }
    });

    $('#star-detail-btn').click(function () {
      if ($(this).hasClass('active')) {
        $(this).removeClass('active');
        $('#star-detail').css('display', 'none');
        $('#star-detail-btn')[0].innerText = text_dict.showStarList;
      }
      else {
        $(this).addClass('active');
        $('#star-detail').css('display', 'block');
        $('#star-detail-btn')[0].innerText = text_dict.hiddenStarList;
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


    // prevent observer not detect
    updateUIContentChange();

    // detect content change
    $("body").on('DOMSubtreeModified', ".object_con_box.list_con", function () {
      if (ui_loading === false) {
        ui_loading = true;
        window.setTimeout((() => {
          updateUIContentChange();
          ui_loading = false;
        }), 300);
      }
    });
	$("body").on('DOMSubtreeModified', ".page_tab_detail.pull_left", function () {
      if (ui_loading === false) {
        ui_loading = true;
        window.setTimeout((() => {
          updateUIContentChange();
          ui_loading = false;
        }), 300);
      }
    });

    // save filter address
    $('#save-filter-address-btn').click(function () {
      storage_data['filter_address'] = $('#filter-address-input')[0].value;
      saveStorage(function () {
        console.log('do save filter address');
      });
      setCommonUI();
    });

    // reset Extend Panel
    $('li').click(function () {
      if ($(this).parent()[0].className === "page_wrap"){
        resetExtendPanel();
      }
    });
    $('a').click(function () {
      if ($(this).parent()[0].className === "pagger_box"){
        resetExtendPanel();
      }
    });
  }
}

function resetExtendPanel() {

  removeShowHiddenRedundantData();
  $('#hidden-detail')[0].innerHTML = "";
  $('#star-detail')[0].innerHTML = "";
}

function removeShowHiddenRedundantData() {

  var del_show_hidden_id_list = [];
  Object.keys(storage_data['show_hidden']).forEach(function (key) {
    if (storage_data['show_hidden'][key].display) {
      del_show_hidden_id_list.push(key);
    }
  });
  for (var i = 0; i < del_show_hidden_id_list.length; i++) {
    delete storage_data['show_hidden'][del_show_hidden_id_list[i]];
  }
}

function saveStorage(callback) {

  chrome.storage.local.set({ "data": storage_data }, function () {
    callback();
    console.log("save completed");
  });
}

function getID(html_data) {

  var urlRegex = /(https?:\/\/buy.houseprice.tw[^ ][^"]*)/;
  var match_url = html_data.outerHTML.match(urlRegex);
  if (match_url) {
    var id = match_url[1].substring(match_url[1].lastIndexOf("\/") + 1);
    if (id !== null && id !== undefined){
      return id;
    }
  }

  return null;
}

function getIDList(data) {

  var output = [];
  try {
    for (var i = 0; i < data.length; i++) {
      var id = getID(data[i]);
      if (id !== null && id !== undefined){
        output.push(id);
      }
    }
  }
  catch (e) {
    console.log(e);
  }

  return output;
}

function setShowHiddenTargets(data_list, val) {

  for (var i = 0; i < data_list.length; i++) {
    storage_data['show_hidden'][data_list[i]] = {
      display: val,
      last_time: Math.floor(new Date().getTime() / 1000)
    };
  }
}

function setFilterAddressUI() {

  $(".title_list > .sub_tit").each((index, value) => {
    var filter_addr = storage_data['filter_address'];
    var tgt_addr = value.innerText;
    if (filter_addr) {
      var address_filter_list = filter_addr.split(';');
      address_filter_list.forEach(function (element) {
        if (tgt_addr.indexOf(element) !== -1) {
          $(value).parent().parent().parent()[0].style.display = 'none';
        }
      });
    }
  });

}

function setShowHiddenUI() {

  Object.keys(storage_data['show_hidden']).forEach(function (key) {
    var tgt_url = "https://buy.houseprice.tw/house/" + key;
    var tgt_obj = $('a[href$="' + tgt_url + '"]');
    if (tgt_obj) {
      //var tgt_div = tgt_obj.parent().parent().parent()[0];
	  var tgt_div = tgt_obj.parent().parent()[0];
      if (!tgt_div || !$('#show-' + key)[0]) {
        // do nothing
      }
      else if (storage_data['show_hidden'][key].display) {
        tgt_div.style.display = 'flex';
        $('#show-' + key + '-item')[0].style.display = 'none';
      }
      else {
        tgt_div.style.display = 'none';
        $('#show-' + key + '-item')[0].style.display = 'grid';
      }
    }
  });
}

function setStarUI() {

  var base_link = "/house/";
  var star_list = [];
  $('#star-detail')[0].innerHTML = "";
  Object.keys(storage_data['bookmark']).forEach(function (key) {
    $('#star-detail')[0].innerHTML +=
      '<div class="star-item" id="star-' + key + '-item">' +
      '<div class="icon-text-btn unstar-btn" id="unstar-' + key + '" >' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">' +
      '<path id="unstar-icon-' + key + '-1" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" style="fill: gold;"/>' +
      '</svg>' +
      '<div class="text-label" id="unstar-' + key + '-btn-txt">' + text_dict.cancelStar + '</div>' +
      '</div>' +
      '<a href="' + base_link + key + '" target="_blank" class="hyper-link">' + storage_data['bookmark'][key].desc1 + '</a><a href="' + base_link + key + '" target="_blank" class="hyper-link">' + storage_data['bookmark'][key].desc2 + '</a><a href="' + base_link + key + '" target="_blank" class="hyper-link">' + storage_data['bookmark'][key].desc3 + '</a>' +
      '</div>';

    star_list.push(key);
  });

  $('.unstar-btn').unbind("click");
  $('.unstar-btn').click(function () {
    var unstar_btn = $(this)[0];
    doStar(unstar_btn.id.replace('unstar-', ''), false, false);
  });

  $(".star-btn").each((index, value) => {
    var id_key = $(value)[0].id.replace('star-', '');
    if (star_list.includes(id_key)) {
      $('#star-icon-' + id_key + '-0').css('display', 'none');
      $('#star-icon-' + id_key + '-1').css('display', 'block');
      $('#star-' + id_key + '-btn-txt')[0].textContent = text_dict.cancelStar;
    }
    else {
      $('#star-icon-' + id_key + '-1').css('display', 'none');
      $('#star-icon-' + id_key + '-0').css('display', 'block');
      $('#star-' + id_key + '-btn-txt')[0].textContent = text_dict.addStar;
    }
  });

}

function setCommonUI() {
  setShowHiddenUI();
  setFilterAddressUI();
  setStarUI();
  $('#ext-panel').css('display', 'block');
}

function doShow(data) {

  setShowHiddenTargets(getIDList(data), true);
  setCommonUI();
  saveStorage(function () {
    console.log('save show change');
  });
}

function showAll() {

  doShow($(".object_con_box.list_con")[0].children);
}

function doHidden(data) {

  setShowHiddenTargets(getIDList(data), false);
  setCommonUI();
  saveStorage(function () {
    console.log('save hidden change');
  });
}

function hiddenAll() {

  doHidden($(".object_con_box.list_con")[0].children);
}

function setStarTargets(data, val, isHtml) {

  var id;
  if (isHtml) {
    id = getIDList(data);
    var show_item_child = $('#show-' + id + '-item')[0].children;
    if (val) {
      if (!(id in storage_data['bookmark'])) {
        storage_data['bookmark'][id] = {
          desc1: show_item_child[1].innerText,
          desc2: show_item_child[2].innerText,
          desc3: show_item_child[3].innerText,
          last_time: Math.floor(new Date().getTime() / 1000)
        };
      }
    }
    else {
      delete storage_data['bookmark'][id];
    }
  }
  else {
    id = data;
    delete storage_data['bookmark'][id];
  }
}

function doStar(data, val, isHtml) {

  setStarTargets(data, val, isHtml);
  setStarUI();
  saveStorage(function () {
    console.log('save doStar change');
  });
}

function updateUIContentChange() {

  $('#hidden-detail')[0].innerHTML = "";
  var data = $(".object_con_box.list_con")[0].children;
  for (var j = 0; j < data.length; j++) {
    var tgt_element = data[j].children[1];
    var id = getID(data[j]);

    // hidden & star button
    if (tgt_element !== null && tgt_element !== undefined && tgt_element.innerHTML.indexOf('icon-text-btn') === -1 && tgt_element.innerHTML.indexOf('title_list') != -1) {

      tgt_element.style.position = 'relative';
      tgt_element.innerHTML =
        '<div class="icon-text-btn star-btn" id="star-' + id + '" >' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">' +
        '<path id="star-icon-' + id + '-0" d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z" style="fill: gold;"/>' +
        '<path id="star-icon-' + id + '-1" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" style="fill: gold;"/>' +
        '</svg>' +
        '<div class="text-label" id="star-' + id + '-btn-txt"></div>' +
        '</div>' +
        '<div class="icon-text-btn hidden-btn" id="hidden-' + id + '" >' +
        '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="24" height="24" viewBox="0 0 24 24">' +
        '<path d="M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.08L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.74,7.13 11.35,7 12,7Z" />' +
        '</svg>' +
        '<div class="text-label">' + text_dict.hidden + '</div>' +
        '</div>' +
        tgt_element.innerHTML;
    }

    // show button
    var obj_desc1, obj_desc2, obj_desc3;
    try { obj_desc1 = data[j].children[1].children[2].children[0].innerText; } catch (e) { console.log(e); }
    try { obj_desc2 = data[j].children[1].children[2].children[1].innerText; } catch (e) { console.log(e); }
    try { obj_desc3 = data[j].children[2].children[1].innerText; } catch (e) { console.log(e); }

    $('#hidden-detail')[0].innerHTML +=
      '<div class="show-item" id="show-' + id + '-item" style="display:none;">' +
      ' <div class="icon-text-btn show-btn" id="show-' + id + '" >' +
      '   <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="24" height="24" viewBox="0 0 24 24">' +
      '     <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />' +
      '   </svg>' +
      '   <div class="text-label">' + text_dict.display + '</div>' +
      ' </div>' +
      ' <div>' + obj_desc1 + '</div><div>' + obj_desc2 + '</div><div>' + obj_desc3 + '</div>' +
      '</div>';

  }

  setCommonUI();

  $('.hidden-btn').unbind("click");
  $('.hidden-btn').click(function () {
    doHidden([$(this).parent().parent()[0]]);
  });

  $('.show-btn').unbind("click");
  $('.show-btn').click(function () {
    var show_btn = $(this)[0];
    doShow([$('#hidden-' + show_btn.id.replace('show-', '')).parent().parent()[0]]);
  });

  $('.star-btn').unbind("click");
  $('.star-btn').click(function () {
    var id_key = $(this)[0].id.replace('star-', '');
    if ($('#star-' + id_key + '-btn-txt')[0].textContent === text_dict.cancelStar) {
      $('#star-' + id_key + '-btn-txt')[0].textContent = text_dict.addStar;
      doStar([$(this).parent().parent()[0]], false, true);
    }
    else {
      $('#star-' + id_key + '-btn-txt')[0].textContent = text_dict.cancelStar;
      doStar([$(this).parent().parent()[0]], true, true);
    }
  });
}