const extensionID = "mkcilniegejnlgmabdcoiglhekaekfeh";

var storage_data = { 'show_hidden': {}, 'filter_address': '', 'bookmark':{} };

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

    initWithDom();

    if (Object.keys(stor_data).length > 0) {
      console.log(stor_data)
      storage_data = {...stor_data["data"]};
    }

    // update UI
    $('#filter-address-input')[0].value = storage_data['filter_address'];
    setUI();

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


    // prevent observer not detect
    updateUIContentChange(); 

    // detect content change
    //$("body").on('DOMSubtreeModified', ".object_con_box.list_con", function () {
      window.setTimeout((() => updateUIContentChange()), 3000);
      
    //});



    // save filter address
    $('#save-filter-address-btn').click(function () {
      storage_data['filter_address'] = $('#filter-address-input')[0].value;
      saveStorage();
      setUI();
    });

    // reset Extend Panel
    $('.pagger_box li').click(function () {
      resetExtendPanel(); 
    });
    $('.pagger_box a').click(function () {
      resetExtendPanel();
    });
  }
}

function resetExtendPanel(){

  $('#hidden-detail')[0].innerHTML = "";
}

// local function 
function saveStorage() {

  chrome.storage.local.set({ "data": storage_data }, function () {
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

  for (var i = 0; i < data_list.length; i++) {
    storage_data['show_hidden'][data_list[i]] = {
      display: val,
      last_time: new Date().toLocaleString()
    };
  }
}

function setFilterAddressUI(){

  $(".title_list > .sub_tit").each((index, value) =>{
    var filter_addr = storage_data['filter_address'];
    var tgt_addr = value.innerText;
    if (filter_addr){
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
    if (tgt_obj){
      var tgt_div = tgt_obj.parent().parent().parent()[0];
      if (!tgt_div || !tgt_div || !$('#show-' + key)[0]){
        // do nothing
      }
      else if (storage_data['show_hidden'][key].display){
        tgt_div.style.display = 'flex';
        $('#show-' + key)[0].style.display = 'none';
      }
      else{
        tgt_div.style.display = 'none';
        $('#show-' + key)[0].style.display = 'grid';
      }
    }
  });

}

function setUI(){
  setShowHiddenUI();
  setFilterAddressUI();
}

function doShow(data) {

  setShowHiddenTargets(getShowHiddenIDList(data), true);
  setUI();
  saveStorage();
}

function showAll() {

  doShow($(".object_con_box.list_con")[0].children);
}

function doHidden(data) {

  setShowHiddenTargets(getShowHiddenIDList(data), false);
  setUI();
  saveStorage();
}

function hiddenAll() {

  doHidden($(".object_con_box.list_con")[0].children);
}

function updateUIContentChange() {

  var data = $(".object_con_box.list_con")[0].children;
  for (var j = 0; j < data.length; j++) {
    var tgt_element = data[j].children[1];
    if (tgt_element != null && tgt_element.innerHTML.indexOf('div class="icon-text-btn"') === -1 && tgt_element.innerHTML.indexOf('title_list') != -1){
      
      // show button
      var obj_desc1, obj_desc2, obj_desc3;
      try { obj_desc1 = data[j].children[1].children[0].children[0].innerText; } catch (e) { console.log(e); };
      try { obj_desc2 = data[j].children[1].children[1].children[1].innerText; } catch (e) { console.log(e); };
      try { obj_desc3 = data[j].children[2].children[1].innerText; } catch (e) { console.log(e); };
      var id = getID(data[j]);
      $('#hidden-detail')[0].innerHTML += '<div class="show-item" id="show-' + id + '" style="display:none;"><button class="show-btn" type="button">Show</button><div>' + obj_desc1 + '</div><div>' + obj_desc2 + '</div><div>' + obj_desc3 + '</div></div>';

      // hidden button
      tgt_element.style.position = 'relative';
      tgt_element.innerHTML = 
        '<div class="icon-text-btn star-btn" id="star-' + id + '" >' + 
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">'+
            '<path id="star-icon-' + id + '-0" d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z" style="fill: gold;"/>'+
            '<path id="star-icon-' + id + '-1" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" style="fill: gold; display:none;"/>' + 
          '</svg>' + 
          '<div class="text-label">追蹤</div>' + 
        '</div>' + 
        '<div class="icon-text-btn hidden-btn" id="hidden-' + id + '" >' + 
          '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="24" height="24" viewBox="0 0 24 24">'+
            '<path d="M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.08L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.74,7.13 11.35,7 12,7Z" />'+
          '</svg>' + 
          '<div class="text-label">隱藏</div>' + 
        '</div>' + 
        tgt_element.innerHTML;

    }
  }

  setUI();

  $('.hidden-btn').unbind("click");
  $('.hidden-btn').click(function () {
    doHidden([$(this).parent().parent()[0]]);
  });

  $('.show-btn').unbind("click");
  $('.show-btn').click(function () {
    var show_item = $(this).parent()[0];
    doShow([$('#hidden-' + show_item.id.replace('show-','')).parent().parent()[0]]);
  });

  $('.star-btn').unbind("click");
  $('.star-btn').click(function () {
    $('#star-icon-' + $(this)[0].id.replace('star-', '') + '-0').css('display', 'none');
    $('#star-icon-' + $(this)[0].id.replace('star-', '') + '-1').css('display', 'block');
  });
}

window.onload = function () {
  init();
};