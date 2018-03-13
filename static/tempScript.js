function getData(){

	return new Promise(function(resolve, reject){
		var data;
		var parameters = {
			category: document.getElementById('theme').value
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
	return runner().catch(function(msg){
		console.log(msg);
	});
}

function typeAhead(){
	$('#theme').typeahead({
		highlight: false,
		hint: false,
		minlength: 1
	},
	{
		display: function(suggestion){
			return suggestion.name;
		},
		source: suggest,
		templates: {
			suggestion: Handlebars.compile(
				"<div style='background-color: #ffffff; width: 100%;'>"+
				"{{name}}"+
				"</div>"
			)
		}
	});

	$('#theme').focus();

	// getting called multiple times, but resolved error...check through the console log
	$('#theme').on("typeahead:selected", function(eventObject, suggestion, name) {
		console.log(suggestion.name);
		document.getElementById('theme').value = suggestion.name;
        go();
        $('#theme').blur();
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
	var svgData = document.getElementById('canvas').outerHTML;
	var svgBlob = new Blob([svgData], {type:"image/svg+xml;charset=utf-8"});
	var svgUrl = URL.createObjectURL(svgBlob);
	var btn = document.getElementById('downloader');
	btn.href = svgUrl;
	btn.download = 'doodle.svg';
}