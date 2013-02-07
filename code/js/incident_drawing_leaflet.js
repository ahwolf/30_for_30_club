var w = 960;
var h = 800;
var padding = 40;

// change what you would like data to equal for different geo projections
var data = geography;
console.log(data);
// calculate the max and min of all the property values
var dollars = d3.extent(data.features, function(feature){
    return feature.properties['Miles run'];
});

// Render using d3
var color_scale = d3.scale.linear()
    .domain(dollars)
    .range(['white','red']);

// Copied from http://bost.ocks.org/mike/leaflet/ to draw a map using
// leaflet tiles, kinda excited to see this work
var map = new L.Map("map", {
    center: [41.836084,-87.63073],
    zoom: 4
})
    .addLayer(new L.TileLayer("http://{s}.tile.cloudmade.com/1101a43d23aa4bdba2652a34de0dcf62/998/256/{z}/{x}/{y}.png"));

var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
    grades = [0, 50, 100, 150,200,250],
    labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
        '<i style="background:' + color_scale(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(map);

var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (title) {
    if (title){
	this._div.innerHTML = title;
    }
    else{
	this._div.innerHTML = '<h4>State information</h4>Hover over a state';
    }
};

info.addTo(map);



var svg = d3.select(map.getPanes().overlayPane).append("svg");
var g = svg.append("g").attr("class", "leaflet-zoom-hide");

function project(x) {
    var point = map.latLngToLayerPoint(new L.LatLng(x[1], x[0]));
    return [point.x, point.y];
}

var path = d3.geo.path().projection(project);
var bounds = d3.geo.bounds(data);

var feature = g.selectAll("path")
    .data(data.features)
    .enter().append("path");

reset();
map.on("viewreset", reset);

function reset(){
    var bottomLeft = project(bounds[0]),
    topRight = project(bounds[1]);
    svg.attr("width", topRight[0] - bottomLeft[0])
	.attr("height", bottomLeft[1] - topRight[1])
	.style("margin-left", bottomLeft[0] + "px")
	.style("margin-top", topRight[1] + "px");

    g.attr("transform", "translate(" + -bottomLeft[0] + "," 
	   + -topRight[1] + ")");
    feature.attr('fill', function(d){
	if (d.properties['Miles run'] === 0){
	    return "rgba(0,0,0,0)";
	}
	else{
	    return color_scale(d.properties['Miles run']);
	}
    })
	.attr('class',function (d){
	    if (d.properties['Miles run'] === 0){
		return "no_path";
	    }
	    else{
		return "normal_path"
	    }
	})
	.attr("d", path)
	.on("mouseover", function (d){
	    var title_text = "<h4>" + d.properties.name + "</h4>";
	    _.each(d.properties, function(value, key){
		var output = "";
		if (key === 'Contributors'){
		    _.each(value, function(key,name){
			output += name.split(" ")[0] + ", ";
		    });
		    if (output.length > 0){
			output = output.substring(0,output.length-2);
		    }
		}
		else{
		    output = value;
		}   
		title_text += "<p>" + key + ": " + 
		    output + "</p>";
	    });
	    var pos = $(this).offset();
	    
	    d3.select(this)
		.attr("class", function (d){
		    if (d.properties['Miles run'] === 0){
			return "no_path";
		    }
		    else{
			// $("#tooltip").html(title_text)
			//     .css({top: pos.top + 20, left: pos.left + 40})
			//     .show();
			info.update(title_text)
			return "hover_path"
		    }
		});
	})
	
	.on("mouseout", function(d){
	    // $("#tooltip").hide();
	    info.update();
	    d3.select(this)
		.attr("class",function (d){
		    if (d.properties['Miles run'] === 0){
			return "no_path";
		    }
		    else{
			return "normal_path"
		    }
		})
		.attr("fill",function(d){
		    if (d.properties['Miles run'] === 0){
			return "rgba(0,0,0,0)";
		    }
		    else{
			return color_scale(d.properties['Miles run']);
		    }
		});
	});   
}


function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}