$(document).ready(function() {
	if(localStorage.getItem("previous") == "index" || localStorage.getItem("previous") == "customize" || localStorage.getItem("previous") == "basic")
		localStorage.removeItem("categories");
	localStorage.setItem("previous", "basic");
    go();
})

function go() {
    if(localStorage.getItem("categories")!=null && localStorage.getItem("categories")!="")
    	run();
    else if(document.getElementById('theme').value !== "")
        run();
}

function getData() {

	return new Promise(function(resolve, reject){
		var data;
		var categories = [];
		if(localStorage.getItem("categories")!=null && localStorage.getItem("categories")!="")
			categories = JSON.parse(localStorage.getItem("categories"));
		else {
			categories.push(document.getElementById("theme").value);
			localStorage.setItem("categories", JSON.stringify(categories));
		}
		var parameters = {
			categories: JSON.stringify(categories)
		};
		$.getJSON(Flask.url_for("data"), parameters)
		.done(function(json){
			data = json;
			var drawAll = [];
			var i, j, k;
			var temp1 = data;
			localStorage.setItem("data", JSON.stringify(json));
			for (i in temp1){
				var temp2 = temp1[i];
				var drawOne = [];
				for (j in temp2){
					var temp3 = temp2[j][0];
					var temp4 = temp2[j][1];
					var len = temp3.length;
					var points = [];
					for(k = 0; k < len; k++)
					{
						var point = [];
						point.push(temp3[k]);
						point.push(temp4[k]);
						points.push(point);
					}
					drawOne.push(points);
				}
				drawAll.push(drawOne);
			}
			resolve(drawAll);
			reject("Error in fetching JSON");
		});
	});
}

function draw(drawAll){
	document.getElementById("loading").style.display = "none";
	var width = 4000;
	var height = 2000;
	var spacing = 300;
	var initial = -280;
	var x = initial;
	var temp = initial;
	var y = 0;
	var id = 0;
	var elements = d3.select("#canvas");

	$('.element').remove();
	var element = elements.selectAll("svg .element")
		.data(drawAll)
		.enter()
		.append("svg")
			.attr("class", "element")
			.attr("id", function(){
				return id++;
			})
			.attr("x", function(){
				if(x + spacing > width)
					x = initial;
				x = x + spacing;
				return x;
			})
			.attr("y", function(){
				if(temp + spacing > width)
				{
					temp = initial;
					y = y + spacing;
				}
				temp = temp + spacing;
				return y;
			});

	element.selectAll("path")
		.data(function(d){
			return d;
		})
		.enter()
		.append("path")
	    .attr("d", function(d){
	    	var lineGenerator = d3.line().curve(d3.curveCatmullRom.alpha(1));
	    	var pathData = lineGenerator(d);
	        return pathData;
	    })
	    .attr("style", "stroke-width: 2; stroke-linecap: round; fill: none; stroke: black;");
}

function runner(){
	return getData()
		.then(function(drawAll){
			draw(drawAll);
		})
		.catch(function(msg){
			console.log(msg);
		});
}

function run(){
	document.getElementById("loading").style.display = "block";
	return runner().catch(function(msg){
		console.log(msg);
	});
}

function suggest(query, syncResults, asyncResults){
	var parameters = {
        q: query
    };
    $.getJSON(Flask.url_for("suggest"), parameters)
    .done(function(data, textStatus, jqXHR) {
        asyncResults(data);
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
        console.log(errorThrown.toString());
        asyncResults([]);
    });
}

function downloader(){
	var svgData = document.getElementById('canvas').outerHTML;					// outerHTML gives the required element and all its children
	svgData = '<?xml version="1.0" encoding="utf-8" standalone="yes"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">' + svgData;
	var svgBlob = new Blob([svgData], {type:"image/svg+xml;charset=utf-8"});
	var svgUrl = URL.createObjectURL(svgBlob);									// this method creates a new URL for the resource passed in the argument and its lifetime is tied to the documet in the window on which it was created
	var btn = document.getElementById('downloader');
	btn.href = svgUrl;															// href holds the URL from where the resource should be downloaded

	var categories = JSON.parse(localStorage.getItem("categories"));
	var name = categories[0];
	for(i=1; i<categories.length; i++)
		name = name+"_"+categories[i];
	name = name+".svg";
	btn.download = name;				// downloads the content at the URL given by svgUrl with the rvalue as the new filename
	btn.click();
}

function customize() {
	if(document.getElementById("canvas").children.length > 0)
		window.open("/customize", "_self");
	else
		window.open("#", "_self");
}

function randomize() {
	var fileNo = Math.floor(Math.random()*5) + 1;
	var category = [];
	category.push("random"+fileNo);
	localStorage.setItem("categories", JSON.stringify(category));
	go();
}

$('#theme').typeahead({
	highlight: false,
	hint: false,
	minlength: 1
},
{
	displayKey: function(suggestion){
		return suggestion.name;
	},
	source: suggest,
	templates: {
		suggestion: Handlebars.compile(
			"<div style='background-color: #fff; width: 775px; padding-left:12px; padding-top:4px; padding-bottom:4px; border-bottom:1px solid #ddd; font-size:16px;'>"+
			"{{name}}"+
			"</div>"
		)
	}
});

$('#theme').on("typeahead:selected", function(eventObject, suggestion, name) {
	localStorage.removeItem("categories");
    go();
    $('#theme').blur();
});