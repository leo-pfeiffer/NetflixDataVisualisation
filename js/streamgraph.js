import {dataPath, dataSplit, getUniqueGenres} from "./utils.js";

const margin = 50
const width = 750
const height = 450

const makeVis = function() {

    d3.csv(dataPath)
        .then(function(data) {

            // convert the comma separated fields into arrays
            data = dataSplit(data)

            // Get the unique genres of the data set which will serve as keys (categories) for the streamgraph
            let genres = getUniqueGenres(data)

            // extract year and genres
            data = data.map(el => {
                return {year: new Date(el.date_added).getFullYear(), genres: el.listed_in}
            }).filter(el => !isNaN(el.year) && el.year >= startYear);

            // get all years in the data set
            let allYears = data.reduce((a, b) => a.includes(b.year) ? a : a.concat(b.year), []).sort()

            // transform the data into a format that can be stacked by d3.stack()
            // result: {2008: {year: 2008, drama: 4, horror: 5, action: 8}, 2009: {year: 2009, drama: 2, ...}, ...}
            let preppedData = allYears.reduce((obj, y) => {
                obj[y] = {year: y}
                genres.forEach((g) => obj[y][g] = 0)
                return obj;
            }, {})

            // count the genre frequency per year and update the values in preppedData
            Object.entries(data).forEach((obj) => {
                obj[1].genres.forEach((genre) => {
                    preppedData[obj[1].year][genre] += 1
                })
            })

            // convert back into an array
            preppedData = Object.entries(preppedData).map(el => el[1])

            // stack the data
            let stackedData = d3.stack().offset(d3.stackOffsetSilhouette).keys(genres)(preppedData)

            let svg = d3.select("#streamgraph")
                .append("svg")
                .attr("width", width + margin)
                .attr("height", height + margin)
                .append("g")
                .attr("transform", "translate(0, 0)");

            const yearExtent = d3.extent(data, (d) => d.year)

            // Add X axis
            let x = d3.scaleLinear().domain(yearExtent).range([ 0, width - parseInt(margin / 2) ]);
            let xAxis = d3.axisBottom(x);

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(" + parseInt(margin / 2) + ", " + height + ")")
                .call(xAxis.tickSize(-height).tickFormat(d3.format(".4i")))
                .select(".domain").remove()

            // Customization
            svg.selectAll(".tick line").attr("stroke", "#b8b8b8")

            // total entry count per year
            let counts = preppedData.map(e => Object.values(e).slice(1)).map(el => el.reduce((a, b) => a + b, 0))
            // maximum count
            let countMax = counts.reduce((a, b) => b > a ? b : a, 0)

            // Add Y axis
            let y = d3.scaleLinear().domain([-countMax, countMax]).range([ height+150, -150 ]);

            // color palette
            let color = d3.scaleOrdinal()
                .domain(genres)
                .range(d3.schemeDark2);

            // create a tooltip
            let Tooltip = svg
                .append("text")
                .attr("x", 0)
                .attr("y", 40)
                .style("opacity", 0)
                .style("fill", "white")
                .style("font-size", 40)
                .style("font-size", 40)

            // Three function that change the tooltip when user hover / move / leave a cell
            let mouseover = function(d) {
                Tooltip.style("opacity", 1)
                d3.selectAll(".myArea").style("opacity", .2)
                d3.select(this)
                    .style("stroke", "black")
                    .style("opacity", 1)
            }

            let mousemove = function(d,i) {
                let grp = `${genres[i]}`
                Tooltip.text(grp)
            }

            let mouseleave = function(d) {
                Tooltip.style("opacity", 0)
                d3.selectAll(".myArea").style("opacity", 1).style("stroke", "none")
            }

            // Area generator
            let area = d3.area()
                .x(function(d) { return x(d.data.year) + parseInt(margin / 2); })
                .y0(function(d) { return y(d[0]); })
                .y1(function(d) { return y(d[1]); })

            // Show the areas
            svg.selectAll("mylayers")
                .data(stackedData)
                .enter()
                .append("path")
                .attr("class", "myArea")
                .style("fill", function(d) { return color(d.key); })
                .attr("d", area)
                .on("mouseover", mouseover)
                .on("mousemove", mousemove)
                .on("mouseleave", mouseleave)
        })
}

// todo start year
let startYear = 2015

const yearDisplay = document.getElementById('streamgraph-year');
const timeSlider = document.getElementById('streamgraph-time-slider');

timeSlider.onchange = () => {
    startYear = parseInt(timeSlider.value);
    // todo streamgraph should not be redrawn but updated
    // makeVis()
    yearDisplay.innerText = startYear
}

makeVis();