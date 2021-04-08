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
const makeVisBar = function () {
    d3.csv(dataPath, rowConverter)
        .then(function (data) {

            //buttons for changing values
            // let bt1 = document.createElement('button');
            // bt1.id = "tv"
            // let vis1_div = document.getElementById("vis1");
            // vis1_div.appendChild(bt1)

            // let bt2 = document.createElement('button');
            // bt2.id = "movie"
            // vis1_div.appendChild(bt2)

            //separating the years from the rest of the JSON
            const all_years = [];
            for (let i = 0; i < data.length; i++) {
                all_years.push(data[i].date_added)
            }

            //function to calculate number of tv shows added over the years
            const countTV = () => {
                let tempData = data;
                let total_TV = {}
                let all_years_edited = [];
                all_years_edited = all_years.filter(el => el !== undefined)
                total_TV = tempData.filter(el => el.type === "TV Show")
                    .reduce((obj) => {
                        all_years_edited.forEach((d) => { obj.hasOwnProperty(d) ? obj[d] += 1 : obj[d] = 1 })
                        return obj
                    }, {})
                return total_TV
            }

            //function to calculate number of movies added over the years
            const countMovie = () => {
                let tempData = data;
                let total_Movie = {}
                let all_years_edited = [];
                all_years_edited = all_years.filter(el => el !== undefined)
                total_Movie = tempData.filter(el => el.type === "Movie")
                    .reduce((obj) => {
                        all_years_edited.forEach((d) => { obj.hasOwnProperty(d) ? obj[d] += 1 : obj[d] = 1 })
                        return obj
                    }, {})
                return total_Movie
            }

            //separating keys (the years) from values (based on button click?)
            let countTv = countTV()
            let count_Movie = countMovie()
            let keys = [];
            let values = [];
            for (let k in count_Movie) keys.push(parseInt(k));
            for (let k in count_Movie) {
                values.push(count_Movie[k]);
            }

            // if (document.getElementById('movie').clicked == true) {
            //     for (let k in count_Movie) keys.push(parseInt(k));
            //     for (let k in count_Movie) {
            //         values.push(count_Movie[k]);
            //     }
            // }
            // else {
            //     for (let k in countTv) keys.push(parseInt(k));
            //     for (let k in countTv) {
            //         values.push(countTv[k]);
            //     }
            // }
            console.log(keys)
            console.log(values)

            //creating SVG
            let svg = d3.select("#vis1")
                .append("svg")
                .attr("width", width)
                .attr("height", height)

            let bar = svg.selectAll("g")
                .data(values)
                .enter()
                .append("g")
                .attr("transform", function (d, i) {
                    return "translate(" + i * 10 + ",0)";
                });

            //finding min and max values
            let countExtent = d3.extent(values, function (d) {
                return parseFloat(d);
            })

            //creating a scale for chart
            let scale = d3.scaleLinear()
                .range([50, 500])
                .domain(countExtent);

            //creating bars
            bar.append("rect")
                .transition()
                .duration(1000)
                .attr("margin", margin)
                .attr("width", 15)
                .attr("height", function (d) {
                    return scale(d);
                })
                .attr('x', function (d, i) {
                    return i * 10;
                })
                .attr('y', function (d) {
                    return (400 - scale(d));
                })
                .attr("fill", "#E50914")

            // Add scales to axis
            //X axis
            let x = d3.scaleBand()
                .range([0, 300])
                .domain([8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21])
            // .rangeRoundBands([0, 300], .2);
            // .paddingInner(0.8)
            // .padding(0.2);
            svg.append("g")
                .attr("transform", "translate(0,400)")
                .call(d3.axisBottom(x).ticks(14))

            //Y axis
            let y = d3.scaleLinear()
                .domain([0, d3.max(values)])
                .range([height - 200, 40]);
            svg.append("g")
                .attr("class", "myYaxis")
                .call(d3.axisLeft(y));


        })
}

makeVisBar()