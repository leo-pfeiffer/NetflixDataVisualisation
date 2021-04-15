import { dataPath } from "./utils.js";

const width = 800;
const height = 600;
const margin = 50;

// const makeVis = function () {

//     d3.csv(dataPath)
//         .then(function (data) {

//             const groupedData = d3.nest()
//                 .key((d) => {
//                     return d.type;
//                 })
//                 .key((d) => {
//                     return new Date(d.date_added);
//                 })
//                 .rollup((v) => {
//                     return v.length;
//                 })
//                 .entries(data);

//             const yearExtent = d3.extent(data, (d) => {
//                 return new Date(d.date_added);
//             })

//             const xScale = d3.scaleTime().domain(yearExtent).range([0, width])

//             const valueCount = new Array();
//             groupedData.forEach((d) => {
//                 (d.values).forEach((e) => {
//                     if (isNaN(e.value)) console.log('Oopsie', e.value)
//                     valueCount.push(e.value);
//                 })
//             })

//             const countExtent = d3.extent(valueCount, (d) => { return parseInt(d) })
//             const yScale = d3.scaleLinear().domain(countExtent).range([height, 0]);

//             const xAxis = d3.axisBottom(xScale);
//             const yAxis = d3.axisLeft(yScale);

//             let svg = d3.select("#vis1")        //creates an SVG element in the body
//                 .append("svg")
//                 .attr("width", width + margin)
//                 .attr("height", height + margin);

//             svg.append("g")
//                 .attr("class", "x axis")
//                 .attr("transform", "translate(" + margin + ", " + height + ")")
//                 .call(xAxis.tickFormat(d3.timeFormat("%y-%m-%d")))
//                 .selectAll("text")
//                 .style("text-anchor", "end")
//                 .attr("dx", "-0.8em")
//                 .attr("dy", "0.15em")
//                 .attr("transform", "rotate(-65)");

//             svg.append("g")
//                 .attr("class", "y axis")
//                 .attr("transform", "translate(" + margin + ", " + 0 + ")")
//                 .call(yAxis)

//             const lineGenerator = d3.line()
//                 .x(function (d) {
//                     return margin + xScale(new Date(d.key));
//                 })
//                 .y(function (d) {
//                     return yScale(parseInt(d.value));
//                 })

//             const shows = groupedData[0];

//             shows.values = shows.values.sort(function (a, b) {
//                 return new Date(a.key) - new Date(b.key);
//             });

//             const movies = groupedData[1];

//             movies.values = movies.values.sort(function (a, b) {
//                 return new Date(a.key) - new Date(b.key);
//             });

//             // console.log(JSON.stringify(shows))
//             // console.log(JSON.stringify(movies))

//             svg.append("path")
//                 .datum(shows.values)
//                 .attr("class", "line shows")
//                 .attr("d", lineGenerator);

//             svg.append("path")
//                 .datum(movies.values)
//                 .attr("class", "line movies")
//                 .attr("d", lineGenerator);
//         })
// }

//makeVis();

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

                // for year in [2008, 2009, ...]: if totalTV has own property `year`, do nothing else set totalTV[year] = 0

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

            xScale.domain([2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021]);
            yScale.domain([0, d3.max(values, function (d) { return d; })]);


            //creating bars
            svg.selectAll(".bar")
                .data(values)
                .enter()
                .append("rect")
                .attr("class", "bar")
                .transition()
                .duration(500)
                .attr("x", function (d, i) {
                    return i * 50 + 60;
                })
                .attr("width", xScale.bandwidth())
                .attr("y", function (d) { return yScale(d); })
                .attr("height", function (d) { return height - margin - yScale(d); })
                .attr("fill", "#E50914");

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

            //appending X axis
            svg.append("g")
                .attr("transform", "translate(0, " + (height - margin) + ")")
                .call(d3.axisBottom(xScale))
                .selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-0.8em")
                .attr("dy", "-0.8em")
                .attr("transform", "rotate(-90)");

            //appending Y axis
            svg.append("g")
                .attr("transform", "translate(" + margin + ",0)")
                .call(d3.axisLeft(yScale));

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
    document.getElementById('vis1').getElementsByTagName('svg')[0].remove()
    makeVisBar(showType);
}

makeVisBar(showType);

