const [WIDTH, HEIGHT] = [1200, 700]

const state = {}

function setupSvg() {
    state['svg'] = d3.select("svg")
        .attr("viewBox", "0 0 " + WIDTH + " " + HEIGHT)
        .attr('width', WIDTH)
        .attr('height', HEIGHT)
    
    state['legend'] = state['svg'].append('g').classed('legend-container', true)
}

async function loadData() {
    const [mapData, popData] = await Promise.all([d3.json("data/sgmap.json"), d3.csv("data/population2021.csv")])
    state['mapData'] = mapData
    state['subzoneToPopMap'] = {}
    for (const { Subzone, Population } of popData) {
        state['subzoneToPopMap'][Subzone.toLowerCase()] = +Population
    }

    console.log('mapData', mapData);
    console.log('popData', popData);
    console.log('subzoneToPopMap', state['subzoneToPopMap']);
}

function featureToPop(feature) {
    return state['subzoneToPopMap'][feature.properties['Subzone Name'].toLowerCase()] || -1
}

async function main() {
    setupSvg()
    await loadData()

    // Map and projection
    var projection = d3.geoMercator()
        .center([103.851959, 1.290270])
        .fitExtent([[20, 20], [980, 580]], state['mapData']);

    let geopath = d3.geoPath().projection(projection);

    const vals = Object.values(state.subzoneToPopMap)
    const scale = d3.scaleSequential(d3.interpolatePiYG).domain([d3.min(vals), d3.max(vals)])
    const tooltip = d3.select('#tooltip')

    state['svg'].append("g")
        .attr("id", "districts")
        .selectAll("path")
        .data(state['mapData'].features)
        .enter()
        .append("path")
        .attr("d", geopath)
        .attr("fill", f => {
            const val = featureToPop(f)
            if (val == -1) return 'black'
            return scale(val)
        })
        .on("mouseover", function(e, f) {		
            const pop = featureToPop(f)
            tooltip
                .style('opacity', 1)
                .style("left", (e.pageX) + "px")		
                .style("top", (e.pageY - 28) + "px")
                .text(`Population: ${pop == -1 ? "(unknown)" : pop}`)
            })					
        .on("mouseout", function() {		
            tooltip.style('opacity', 0)
        });


}

main()