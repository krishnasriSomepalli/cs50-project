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
				var temp2 = temp1[i]["drawing"];
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
	var height = 4000;
	var spacing = 256;
	var x = -256;
	var y = 0;
	var butterflies = d3.select("#canvas");

	butterflies.selectAll('g')
		.data(drawAll)
		.enter()
		.append('g')
			.attr("class", "butterfly")
			.attr("transform", function(d){
				if(x + spacing > width)
				{
					x = 0;
					y = y + spacing;
				}
				x = x + spacing;
				return "translate(" + x + "," + y + ")";
			})
		.selectAll('path')
		.data(function(d){
			return d;
		})
		.enter()
		.append('path')
		.attr("d", function(d) {
			return d;
		})
		.attr("style", "fill: none; stroke: black; stroke-width: 1;");

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

runner().catch(function(msg){
	console.log(msg);
});
