const web_name = "buy_houseprice_tw";
const extensionID = "mkcilniegejnlgmabdcoiglhekaekfeh";

function getShowHiddenIDList(data) {

    var output = [];
    for (var i = 0; i < data.length; i++){
        console.log(data[i]);
        var urlRegex = /(https?:\/\/buy.houseprice.tw[^ ][^"]*)/;
        var match_url = data[i].outerHTML.match(urlRegex);
        if(match_url){
            var id = match_url[1].substring(match_url[1].lastIndexOf("\/") + 1);
            if(id != null)
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
        var tgt_div = document.querySelectorAll('a[href="' + tgt_url + '"]')[0].parentNode.parentNode.parentNode;
        if (val)
            tgt_div.style.display = 'flex';
        else
            tgt_div.style.display = 'none';
    });
    
}

function doHidden(data){

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

function showFunc(tgt){

    doShow([tgt.parentNode.parentNode]);
}

function showAllFunc() {

    doShow(document.getElementsByClassName("object_con_box list_con")[0].children);
}

function doShow(data) {

    var show_hidden_dict = setShowHiddenTargets(getShowHiddenIDList(data), true);
    console.log(show_hidden_dict);
    setShowHiddenUI(show_hidden_dict, true);
}

function hiddenFunc(tgt) {

    doHidden([tgt.parentNode.parentNode]);
}

function hiddenAllFunc() {

    doHidden(document.getElementsByClassName("object_con_box list_con")[0].children);
}

function addHiddenBtn(){
    var data = document.getElementsByClassName("object_con_box list_con")[0].children;
    for (var j = 0; j < data.length; j++) {
        var tgt_element = data[j].lastElementChild;
        if (tgt_element.innerHTML.indexOf('<button class="' + web_name + '-hidden-btn"') === -1 && tgt_element.innerHTML.indexOf('price_wrap') != -1)
            tgt_element.innerHTML = '<button class="' + web_name + '-hidden-btn" type="button" onclick="hiddenFunc(this)">Hidden</button>' + tgt_element.innerHTML;
    }
}

window.onload = function () {

    // add extend panel
    if (document.getElementsByClassName("search_box_wrap")[0].innerHTML.indexOf(web_name+"-ext-panel") === -1) {

        document.getElementsByClassName("search_box_wrap")[0].innerHTML += 
        '<div id="' + web_name + '"-ext-panel">'+
        '  <button id="' + web_name + '-show-all" type="button" onclick="showAllFunc()">Show All</button>'+
        '  <button id="' + web_name + '-hidden-all" type="button" onclick="hiddenAllFunc()">Hidden All</button>'+
        '</div>';
    }

    // add hidden button for every target
    addHiddenBtn(); // prevent observer not detect
    var target = document.querySelectorAll(".object_con_box.list_con");
    for (var i = 0; i < target.length; i++) {
        const observer = new MutationObserver(function (event) {
            addHiddenBtn();
        });

        // Start observing the target node for configured mutations
        observer.observe(target[i], { attributes: true, childList: true, subtree: true });
    }
    // ----------------
};