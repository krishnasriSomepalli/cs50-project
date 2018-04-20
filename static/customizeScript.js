$(document).ready(function() {
	if(localStorage.getItem("previous") == "index" || localStorage.getItem("previous") == "multiple")
		localStorage.removeItem("categories");
	localStorage.setItem("previous", "customize");
})


var drawAll = [];
var id = 0;
var width = 10000;
var spacing = 300;
var selected = false;
var selection = null;
var track = 1199; // we have 1200 elements with us in total and only a little over 1000 are visible in the canvas. The remaining can be used to replace the elements that the user doesn't like

$('html').click(function(event) {
	if($(event.target).hasClass('buttonInd'))
    	selected = true;
    else if(!$(event.target).hasClass('box'))
       selected = false;
    else
    	selected = true;
    if(selected == false)
		showBox(event.target.parentNode.getAttribute('id'));
});

function getData(){
	return new Promise(function(resolve, reject){
		var data = JSON.parse(localStorage.getItem("data"));
		var i, j, k;
		var temp1 = data;
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
		resolve();
		reject("Error in fetching JSON");
	});
}

function draw(spacing = 300){
	document.getElementById("loading").style.display = "none";
	spacing = parseInt(spacing);
	var height = 2000;
	var initial = -280;
	var x = initial;
	var temp = initial;
	var y = 0;
	id = 0;
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
				var n = 5+spacing;
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
			})
			.call(d3.drag()
		        .on("start", function(d){
		        		d3.select(this).raise();
		        })
		        .on("drag", function(d){
		        	d3.select(this)
					    .attr("x", d.x = d3.event.x)
					    .attr("y", d.y = d3.event.y);
		        })
		        .on("end", function(d){
	}));

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

	// Thicker, invisible borders to make it easier to drag elements around
	element.selectAll("path .dragBy")
		.data(function(d){
			return d;
		})
		.enter()
		.append("path")
		.attr("class", "dragBy")
	    .attr("d", function(d){
	    	var lineGenerator = d3.line().curve(d3.curveCatmullRom.alpha(1));
	    	var pathData = lineGenerator(d);
	        return pathData;
	    })
	    .attr("style", "stroke-width: 80; stroke-linecap: round; fill: #D0D0D0; stroke: #D0D0D0; opacity:0;");

	d3.selectAll(".element")
		.append("rect")
			.attr("width", function(){
				return spacing;
			})
			.attr("height", function(){
				return spacing;
			})
			.attr("class", "box")
			.attr("onclick", "selected = true; showBox(event.target.parentNode.getAttribute('id'));")
			.attr("style", "stroke-width:3; stroke:rgb(255,255,255); fill:rgb(255,255,255); fill-opacity:0;");
}

function run(){
	document.getElementById("loading").style.display = "block";
	return getData()
		.then(function(drawAll){
			draw(drawAll);
		})
		.catch(function(msg){
		console.log(msg);
	});
}

function changeSpacing(event){
	spacing = event.target.value;
	draw(spacing);
}

function sizing(event){
	var size = event.target.value;
	document.getElementById('canvas').setAttribute("viewBox", "0 0 " + size + " 600");
}

function showBox(id){
	if(selected == true)
	{
		var svg = document.getElementById(id);
		var svgbox = svg.lastElementChild;
		d3.selectAll('.box').attr("style", "stroke-width:0; stroke:rgb(255,255,255); fill:rgb(255,255,255); fill-opacity:0;");
		svgbox.setAttribute("style", "stroke-width:0; stroke:rgb(255,255,255); fill:rgb(220,220,220); fill-opacity:0.4; ");
		$('#copy').css("visibility", "visible");
		$('#delete').css("visibility", "visible");
		$('#loadanother').css("visibility", "visible");
		selection = svg;
	}
	else
	{
		d3.selectAll('.box').attr("style", "stroke-width:0; stroke:rgb(255,255,255); fill:rgb(255,255,255); fill-opacity:0;");
		//hide or better to disable?
		$('#copy').css("visibility", "hidden");
		$('#delete').css("visibility", "hidden");
		$('#loadanother').css("visibility", "hidden");
		selection = null;
	}
}

function copyElement(){
	$(selection).clone()
		.attr("x", "0")
		.attr("y", "0")
		.attr("id", id)
		.appendTo('#canvas');
	selected = true;
	showBox(id);
	id++;
}

function deleteElement(){
	$(selection).remove();
	selected = false;
	showBox(selection.getAttribute("id"));
}

function loadElement(){
	var id = $(selection).attr('id');
	var x = $(selection).attr('x');
	var y = $(selection).attr('y');
	$('#'+track).clone()
		.attr('x', x)
		.attr('y', y)
		.attr('id', '1200')
		.appendTo('#canvas');
	$(selection).remove();
	$('#1200').attr('id', id);
	track--;
	selected = true;
	showBox(id);
}

function downloader(){
	var svgData = document.getElementById('canvas').outerHTML;					// outerHTML gives the required element and all its children
	svgData = '<?xml version="1.0" encoding="utf-8" standalone="yes"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">' + svgData;
	var svgBlob = new Blob([svgData], {type:"image/svg+xml;charset=utf-8"});
	var svgUrl = URL.createObjectURL(svgBlob);									// this method creates a new URL for the resource passed in the argument and its lifetime is tied to the document in the window on which it was created
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