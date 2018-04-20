$(document).ready(function() {
    localStorage.setItem("previous", "multiple");
    localStorage.removeItem("categories");
    showCategories();
})

var selectedCategories = [];

function toggleSelection(target) {
    if(target.getAttribute("data-selected") == "false") {
        target.setAttribute("data-selected", "true");
        selectedCategories.push(target);
    }
    else {
        target.setAttribute("data-selected", "false");
        selectedCategories.splice(selectedCategories.indexOf(target), 1);
    }
}
function showCategories() {
    $.getJSON(Flask.url_for("categories"))
		.done(function(allCategories){
            for(categoryNo in allCategories) {
                var item = document.getElementById("categoryModel");
                item = item.cloneNode(true);
                item.innerHTML = allCategories[categoryNo];
                item.removeAttribute("id");
                document.getElementById("categoryModel").parentElement.appendChild(item);
            }
            document.getElementById("categoryModel").style.display = "none";
	});
}

function reset() {
    while(selectedCategories.length > 0) {
        toggleSelection(selectedCategories[0]);
    }
}

function create() {
    var i;
    categories = [];
    for(i in selectedCategories) {
        categories.push(selectedCategories[i].innerHTML);
    }
    localStorage.setItem("categories", JSON.stringify(categories));
    window.open("/basic", "_self");
}