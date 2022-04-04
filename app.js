let width = 1000, height = 600;
const [WIDTH, HEIGHT] = [1000, 600]

const state = {}

function setupSvg() {
    state['svg'] = d3.select("svg")
        .attr("viewBox", "0 0 " + WIDTH + " " + HEIGHT)
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

function subzoneToPop(subzone) {
    return state['subzoneToPopMap'][subzone.toLowerCase()] || -1
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

    state['svg'].append("g")
        .attr("id", "districts")
        .selectAll("path")
        .data(state['mapData'].features)
        .enter()
        .append("path")
        .attr("d", geopath)
        .attr("fill", f => {
            const val = subzoneToPop(f.properties['Subzone Name'])
            return scale(val)
        });
}

main()