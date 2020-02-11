const web_name = "buy_houseprice_tw";
const extensionID = "mkcilniegejnlgmabdcoiglhekaekfeh";

function getShowHiddenIDList() {

    var data = document.getElementsByClassName("object_con_box list_con")[0].children;
    var output = [];
    for (var i = 0; i < data.length; i++){
        console.log(data[i]);
        var urlRegex = /(https?:\/\/buy.houseprice.tw[^ ]*)/;
        var match_url = data[i].outerHTML.match(urlRegex);
        if(match_url){
            var id = match_url[1].substring(match_url[1].lastIndexOf("\/") + 1);
            if(id != null)
                output.push(id);
        }
    }

    return output;
}

window.onload = function () {
    if (document.getElementsByClassName("search_box_wrap")[0].innerHTML.indexOf(web_name+"-ext-panel") === -1) {
        document.getElementsByClassName("search_box_wrap")[0].innerHTML += 
        '<div id="' + web_name + '"-ext-panel">'+
        '  <button id="' + web_name + '-show-all" type="button"">Show All</button>'+
        '  <button id="' + web_name + '-all" type="button"">Hidden All</button>'+
        '</div>';
    }

    document.getElementById(web_name + '-show-all').addEventListener("click", function () {

        var show_hidden_dict = {};
        var data_list = getShowHiddenIDList();
        for (var i = 0; i < data_list.length; i++) {
            show_hidden_dict[data_list[i]] = {
                hidden: false,
                last_time: new Date().toLocaleString()
            };
        }

        console.log(show_hidden_dict);

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
    });
};