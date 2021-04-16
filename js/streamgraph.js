/**
 * Attribution:
 * Streamgraph adapted from here: https://www.d3-graph-gallery.com/streamgraph
 * Transition was adapted from here: https://observablehq.com/@d3/streamgraph-transitions
 * */

import {dataPath, dataSplit, getUniqueGenres} from "./utils.js";

const margin = 50
const width = 750
const height = 450

let startYear = 2015

// Get the HTML elements from the DOM
const yearDisplay = document.getElementById('streamgraph-year');
const timeSlider = document.getElementById('streamgraph-time-slider');

// Add function to time slider that displays the currently selected starting year
timeSlider.onchange = () => {
    startYear = parseInt(timeSlider.value);
    yearDisplay.innerText = startYear;
    update()
}

/**
 * Put the data into the correct format used whenever the stream graph is updated.
 * */
function wrangleData(data) {

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

    // stack the data for the stream graph
    let stackedData = d3.stack().offset(d3.stackOffsetExpand).keys(genres)(preppedData)

    // update the year extent
    let yearExtent = d3.extent(data, (d) => d.year)

    return {
        yearExtent: yearExtent,
        genres: genres,
        stackedData: stackedData
    }
}


let svg = d3.select("#streamgraph")
    .append("svg")
    .attr("width", width + margin)
    .attr("height", height + margin)
    .append("g")
    .attr("transform", "translate(0, 0)");

// define the x axis
let x = d3.scaleLinear()
let xAxis = d3.axisBottom(x);

// define the y axis
let y = d3.scaleLinear().domain([0, 1]).range([height, 0]);

// define colors
let color = d3.scaleOrdinal()

// create a tooltip
let Tooltip = svg
    .append("text")
    // have to swap x and y due to rotation
    .attr("x", -height)
    .attr("y", 30)
    .style("opacity", 0)
    .style("fill", "white")
    .style("font-size", 40)
    .style("font-size", 40)
    .attr("transform", "rotate(-90)");

// Three function that change the tooltip when user hover / move / leave a cell
let mouseover = function(d) {
    Tooltip.style("opacity", 1)
    d3.selectAll(".myArea").style("opacity", .3)
    d3.select(this)
        .style("stroke", "black")
        .style("opacity", 1)
}

// instantiate mousemove
let mousemove;

let mouseleave = function(d) {
    Tooltip.style("opacity", 0)
    d3.selectAll(".myArea").style("opacity", 1).style("stroke", "none")
}

// Area generator
let area = d3.area()
    .x(function(d) { return x(d.data.year) + margin; })
    .y0(function(d) { return y(d[0]); })
    .y1(function(d) { return y(d[1]); })


// Initially draw the graph
d3.csv(dataPath)
    .then(function(data) {

        // data wrangling
        let dataObj = wrangleData(data);

        // Update x domain
        x.domain(dataObj.yearExtent).range([ 0, width - parseInt(margin / 2) ]);

        // color palette
        color.domain(dataObj.genres).range(d3.schemeDark2);

        // append x axis
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(" + margin + ", " + height + ")")
            .call(xAxis.tickSize(-height).tickFormat(d3.format(".4i")))
            .select(".domain").remove()

        // Customization
        svg.selectAll(".tick line").attr("stroke", "#b8b8b8")

        // Add genres to the mousemove
        mousemove = function(d,i) {
            let grp = `${dataObj.genres[i]}`
            Tooltip.text(grp)
        }

        // Show the areas
        svg.selectAll("mylayers")
            .data(dataObj.stackedData)
            .enter()
            .append("path")
            .attr("class", "myArea")
            .style("fill", function(d) { return color(d.key); })
            .attr("d", area)
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
    })


/**
 * Function to update the graph whenever the starting year is changed.
 * */
function update() {

    d3.csv(dataPath)
        .then(function(data) {

            // data wrangling
            let dataObj = wrangleData(data);

            // Update x domain
            x.domain(dataObj.yearExtent).range([ 0, width - parseInt(margin / 2) ]);

            // color palette
            color.domain(dataObj.genres).range(d3.schemeDark2);

            svg = d3.select("#streamgraph").transition();

            // append x axis
            svg.select(".x.axis")
                .duration(500)
                .call(xAxis.tickSize(-height).tickFormat(d3.format(".4i")))
                .select(".domain").remove()

            // Customization
            svg.selectAll(".tick line").attr("stroke", "#b8b8b8")

            // Add genres to the mousemove
            mousemove = function(d,i) {
                let grp = `${dataObj.genres[i]}`
                Tooltip.text(grp)
            }

            // Show the areas
            d3.selectAll(".myArea")
                .data(dataObj.stackedData)
                .transition()
                .duration(0)
                .attr("d", area)
        })
}
