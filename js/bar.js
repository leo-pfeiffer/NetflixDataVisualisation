import { dataPath } from "./utils.js";

//setting svg dimensions
const width = 800;
const height = 500;
const margin = 50;

//creating SVG
let svg = d3.select("#bar-chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)

//creating scales
let xScale = d3.scaleBand()
    .range([margin, width - 30])
    .padding(0.2);
let yScale = d3.scaleLinear()
    .range([height - margin, 0]);

//appending X axis
let xAxis = svg.append("g")
    .attr("transform", "translate(0, " + (height - margin) + ")")
    .call(d3.axisBottom(xScale))

//appending Y axis
let yAxis = svg.append("g")
    .attr("transform", "translate(" + margin + ",0)")

//function to split the year from the date in date_added column
const rowConverter = function (d) {
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
                //checking for missing values
                let addMissingValues = value => {
                    if (totalTV.hasOwnProperty(value)) {
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
                //checking for missing values
                let addMissingValues = value => {
                    if (totalMovie.hasOwnProperty(value)) {
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

            //checking the value of the parameter that 
            //was passed to call appropriate function
            if (type === "TV Show") {
                count = countTV()
            }
            else if (type === "Movie") {
                count = countMovie()
            }

            //separating keys (the years) from values
            for (let k in count) keys.push(parseInt(k));
            for (let k in count) {
                values.push(count[k]);
            }

            //setting the domain
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
                .transition()
                .duration(500)
                .attr("x", function (d, i) {
                    return i * 50 + 60;
                })
                .attr("width", xScale.bandwidth())
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
                .delay(function (d, i) { return (i * 100); })

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

const toggleButton = document.getElementById('bar-toggle-btn');
const descriptionText = document.getElementById('bar-chart-descriptor')
let showType = "Movie" //setting initial value to 'Movies'

//functionality to create the graph based on user input
toggleButton.onclick = () => {
    showType = showType === "Movie" ? "TV Show" : "Movie"
    if (showType === "TV Show") {
        toggleButton.innerText = 'Show movie data'
        descriptionText.innerText = 'Count of TV shows'
    }
    else {
        toggleButton.innerText = 'Show TV show data'
        descriptionText.innerText = 'Count of movies'
    }
    makeVisBar(showType);
}

makeVisBar(showType);
