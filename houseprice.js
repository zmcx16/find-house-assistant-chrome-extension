window.onload = function () {
    if (document.getElementsByClassName("search_box_wrap")[0].innerHTML.indexOf("house-hidden-ext-panel") === -1) {
        document.getElementsByClassName("search_box_wrap")[0].innerHTML += '<div id="house-hidden-ext-panel"><button id="house-hidden-show-all" type="button"">Show All</button><button id="house-hidden-hidden-all" type="button"">Hidden All</button></div>';
    }

    console.log(localStorage["xxx"]);
    localStorage["xxx"] = "yyy"; 
    console.log(localStorage["xxx"]);
};