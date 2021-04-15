import { dataPath } from "./utils.js";

const width = 800;
const height = 600;
const margin = 50;

//creating SVG
let svg = d3.select("#vis1")
    .append("svg")
    .attr("width", width)
    .attr("height", height)

//creating scales
var xScale = d3.scaleBand()
    .range([margin, width - 30])
    .padding(0.2);
var yScale = d3.scaleLinear()
    .range([height - margin, 0]);

//appending X axis
let xAxis = svg.append("g")
    .attr("transform", "translate(0, " + (height - margin) + ")")
    .call(d3.axisBottom(xScale))
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-0.8em")
    .attr("dy", "-0.8em")
    .attr("transform", "rotate(-90)");

//appending Y axis
let yAxis = svg.append("g")
    .attr("transform", "translate(" + margin + ",0)")

const rowConverter = function (d) {
    //function to split the year from the date in date_added column
    let date_added_year = d.date_added;
    let datum = date_added_year.split(", ");

    return {
        type: d.type,
        country: d.country,
        date_added: datum[1],
    }
}

//function that creates the main visualization
const makeVisBar = function (type) {
    d3.csv(dataPath, rowConverter)
        .then(function (data) {

            //function to calculate number of tv shows added over the years
            const countTV = () => {
                let tempData = data;
                let totalTV = tempData.filter(el => el.type === "TV Show").filter(el => el.date_added !== undefined)
                    .reduce((obj, el) => {
                        obj.hasOwnProperty(el.date_added) ? obj[el.date_added] += 1 : obj[el.date_added] = 1;
                        return obj
                    }, {})
                let years = [2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021]
                let addMissingValues = value => {
                    if (totalTV.hasOwnProperty(value)) {
                        console.log(value)
                    }
                    else {
                        totalTV[value] = 0
                    }
                }
                years.forEach(addMissingValues)

                return totalTV

            }

            //function to calculate number of movies added over the years
            const countMovie = () => {
                let tempData = data;
                let totalMovie = tempData.filter(el => el.type === "Movie").filter(el => el.date_added !== undefined)
                    .reduce((obj, el) => {
                        obj.hasOwnProperty(el.date_added) ? obj[el.date_added] += 1 : obj[el.date_added] = 1;
                        return obj
                    }, {})
                let years = [2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021]
                let addMissingValues = value => {
                    if (totalMovie.hasOwnProperty(value)) {
                        console.log(value)
                    }
                    else {
                        totalMovie[value] = 0
                    }
                }
                years.forEach(addMissingValues)
                return totalMovie
            }

            let count;
            let keys = [];
            let values = [];

            if (type === "TV Show") {
                count = countTV()
            }
            else if (type === "Movie") {
                count = countMovie()
            }

            //separating keys (the years) from values (based on button click?)
            for (let k in count) keys.push(parseInt(k));
            for (let k in count) {
                values.push(count[k]);
            }

            console.log(keys)
            console.log(values)

            xScale.domain([2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021]);
            yScale.domain([0, d3.max(values, function (d) { return d; })]);

            // Update the X axis
            xAxis.call(d3.axisBottom(xScale))

            // Update the Y axis
            yAxis.transition().duration(1000).call(d3.axisLeft(yScale));

            //creating bars
            svg.selectAll(".bar")
                .data(values)
                .enter()
                .append("rect")
                .attr("class", "bar")
                // .transition()
                // .duration(500)
                .attr("x", function (d, i) {
                    return i * 50 + 60;
                })
                .attr("width", xScale.bandwidth())
                //.attr("y", function (d) { return yScale(d); })
                .attr("y", function (d) { return yScale(0); })
                .attr("height", function (d) { return height - margin - yScale(0); })
                .attr("fill", "#E50914");

            //adding animation for each bar
            svg.selectAll("rect")
                .data(values)
                .transition()
                .duration(800)
                .attr("y", function (d) { return yScale(d); })
                .attr("height", function (d) { return height - margin - yScale(d); })
                .delay(function (d, i) { console.log(i); return (i * 100) })

            //tooltip details
            let tooltip = d3.select('body')
                .append('div')
                .attr('class', 'd3-tooltip')
                .style('position', 'absolute')
                .style('z-index', '10')
                .style('visibility', 'hidden')
                .style('padding', '10px')
                .style('background', 'rgba(0,0,0,0.6)')
                .style('border-radius', '4px')
                .style('color', '#fff')
                .text('a simple tooltip');


            //adding tooltips
            svg.selectAll('rect')
                .data(values)
                .on('mouseover', function (d, i) {
                    tooltip
                        .text("Value: " + d)
                        .style('visibility', 'visible');
                })

            svg.selectAll("rect")
                .on('mousemove', function () {
                    tooltip
                        .style('top', d3.event.pageY - 10 + 'px')
                        .style('left', d3.event.pageX + 10 + 'px');
                })

            svg.selectAll('rect')
                .on('mouseout', function () {
                    tooltip.text(``).style('visibility', 'hidden');
                })


        })
}

function makeToggleButton() {
    const toggleButton = document.createElement('button')
    toggleButton.innerText = 'Toggle'
    document.getElementById('bar-controller').appendChild(toggleButton);
    return toggleButton;
}

const toggleButton = makeToggleButton();
let showType = "Movie"

toggleButton.onclick = () => {
    showType = showType === "Movie" ? "TV Show" : "Movie"
    makeVisBar(showType);
}

makeVisBar(showType);

