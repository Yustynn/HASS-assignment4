let width = 1000, height = 600;

let svg = d3.select("svg")
    .attr("viewBox", "0 0 " + width + " " + height)

// Load external data and boot
Promise.all([d3.json("data/sgmap.json"), d3.csv("data/population2021.csv")]).then(data => {

console.log(data[0]);
console.log(data[1]);

// Map and projection
var projection = d3.geoMercator()
    .center([103.851959, 1.290270])
    .fitExtent([[20, 20], [980, 580]], data[0]);

let geopath = d3.geoPath().projection(projection);

svg.append("g")
    .attr("id", "districts")
    .selectAll("path")
    .data(data[0].features)
    .enter()
    .append("path")
    .attr("d", geopath)
    .attr("fill", "black");
})
