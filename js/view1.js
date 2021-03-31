let dataPath = "data/netflix_titles.csv"

const width = 800;					//specifies the width, height and margins of our SVG element
const height = 600;
const margin = 100;

d3.csv(dataPath)
    .then(function(data) {

        const groupedData = d3.nest()
            .key((d) => {
                return d.type;
            })
            .key((d) => {
                return new Date(d.date_added);
            })
            .rollup((v) => {
                return v.length;
            })
            .entries(data)

        const yearExtent = d3.extent(data, (d) => {
            return new Date(d.date_added);
        })

        const xScale = d3.scaleTime().domain(yearExtent).range([0, width])

        const valueCount = new Array();
        groupedData.forEach((d) => {
            (d.values).forEach((e) => {
                if (isNaN(e.value)) console.log('Oopsie', e.value)
                valueCount.push(e.value);
            })
        })

        const countExtent = d3.extent(valueCount, (d) => {return parseInt(d)})
        const yScale = d3.scaleLinear().domain(countExtent).range([height, 0]);

        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);

        let svg = d3.select("#vis1")        //creates an SVG element in the body
            .append("svg")
            .attr("width", width + margin)
            .attr("height", height + margin);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(" + margin + ", " + height + ")")
            .call(xAxis.tickFormat(d3.timeFormat("%y-%m-%d")))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-0.8em")
            .attr("dy", "0.15em")
            .attr("transform", "rotate(-65)");

        svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + margin + ", " + 0 + ")")
            .call(yAxis)

        const lineGenerator = d3.line()
            .x(function(d) {
                return margin + xScale(new Date(d.key));
            })
            .y(function(d) {
                return yScale(parseInt(d.value));
            })

        const shows = groupedData[0];

        shows.values = shows.values.sort(function(a,b){
            return new Date(a.key) - new Date(b.key);
        });

        const movies = groupedData[1];

        movies.values = movies.values.sort(function(a,b){
            return new Date(a.key) - new Date(b.key);
        });

        console.log(JSON.stringify(shows))
        console.log(JSON.stringify(movies))

        svg.append("path")
            .datum(shows.values)
            .attr("class", "line shows")
            .attr("d", lineGenerator);

        svg.append("path")
            .datum(movies.values)
            .attr("class", "line movies")
            .attr("d", lineGenerator);
    })