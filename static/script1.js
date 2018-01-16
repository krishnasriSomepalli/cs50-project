function getData(){

	return new Promise(function(resolve, reject){
		var data;
		$.getJSON(Flask.url_for("data"))
		.done(function(json){
			data = json;

			var drawAll = [];
			var i, j;
			var temp1 = data;
			for (i in temp1){
				var temp2 = temp1[i];
				var drawOne = [];
				for (j in temp2){
					var temp3 = temp2[j][0];
					var temp4 = temp2[j][1];
					var points = "";
					for (k in temp3){
						if(k == 0)
						{
							points = points + "M" + temp3[k] + ",";
							points = points + temp4[k] + " ";
							points = points + "C" + temp3[k] + ",";
							points = points + temp4[k] + " ";
						}
						else
						{
							points = points + temp3[k] + ",";
							points = points + temp4[k] + " ";
						}
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

	var group = element.selectAll("g .stroke")
	    .data(function(d){
	        return d;
	    })
	    .enter()
	    .append("g")
	    .attr("style", "fill: none; stroke: black")
	    .attr("class", "stroke");

	group.append("path")
	    .attr("d", function(d){
	        return d;
	    })
	    .attr("style", "stroke-width: 70; stroke-linecap: round; opacity: 0; fill: #777777;");

	group.append("path")
	    .attr("d", function(d){
	        return d;
	    })
	    .attr("style", "stroke-width: 3;");

	return new Promise(function(resolve, reject){
		resolve(drawAll);
		reject("Error in drawing JSON");
	});
}

function runner(){
	return getData()
		.then(draw)
		.catch(function(msg){
			console.log(msg);
		});
}

// function drag(ev){
//     ev.dataTransfer.setData("text", ev.target.id);
//     alert("Dragging");
// }

// function allowDrop(ev){
// 	ev.preventDefault();
// }

// function drop(ev){
// 	ev.preventDefault();
// 	var data = ev.dataTransfer.getData("text");
// 	//get the x and y coordinates of the source's 'svg'
// 	//get the x and y coordinates of the destination's 'svg'
// 	//swap them both
// 	var xS = document.getElementById("#"+data).attr("x");
// 	var yS = document.getElementById("#"+data).attr("y");
// 	var xD = document.getElementById("#"+ev.target.id).attr("x");
// 	var yD = document.getElementById("#"+ev.target.id).attr("y");
// 	document.getElementById("#"+data).attr("x", xD);
// 	document.getElementById("#"+data).attr("y", yD);
// 	document.getElementById("#"+ev.target.id).attr("x", xS);
// 	document.getElementById("#"+ev.target.id).attr("y", yS);
// }

function run(){
	return runner().catch(function(msg){
		console.log(msg);
	});
}