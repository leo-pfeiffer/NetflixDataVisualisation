import {dataPath, dataSplit, geoDataPath, getUniqueCountries, getUniqueGenres} from "./utils.js";

function makeVis([geoData, data]) {

    let selectedYear = null;
    let selectedGenres = null;

    // Transform the list like elements of each object in the data into an array of elements
    data = dataSplit(data);

    // Create the map
    const map = L.map('map').setView([28.0339, 1.6596], 2);

    // Add tile layers
    const OSM = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="href://osm.org/copyright">OpenStreetMap</a> contributors'
    });

    const CartoDB_PositronNoLabels = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    });

    const Stamen_TonerHybrid = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-hybrid/{z}/{x}/{y}{r}.{ext}', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: 'abcd',
        minZoom: 0,
        maxZoom: 20,
        ext: 'png'
    });

    OSM.addTo(map);
    CartoDB_PositronNoLabels.addTo(map)
    Stamen_TonerHybrid.addTo(map)

    // Create an array that contains all countries from the dataset (unique)
    let uniqueCountries = getUniqueCountries(data)

    let uniqueGenres = getUniqueGenres(data)

    // Movie and Show count for all countries in a give year
    const countPerCountryPerFilter = function() {
        let tempData = data;

        // filter entries of the current year
        if (selectedYear !== null) tempData = tempData.filter(el => new Date(el.date_added).getFullYear() === selectedYear)

        // filter entries that contain at least one of the selected genres
        if (selectedGenres !== null) tempData = tempData.filter(el => {
            return [selectedGenres, el.listed_in].reduce((a, b) => a.filter(c => b.includes(c))).length > 0;
        })

        // Count shows and movies per country: {country1: {showCount: 1, movieCount: 2}, ...}
        return tempData
            .reduce((obj, el) => {
                if (el.type === "Movie") {
                    el.country.forEach((d) => {
                        if (obj.hasOwnProperty(d)) {
                            obj[d].hasOwnProperty("movieCount") ? obj[d]["movieCount"] += 1 : obj[d]["movieCount"] = 1
                        } else {
                            obj[d] = {"movieCount": 1, "showCount": 0}
                        }
                    })
                } else if (el.type === "TV Show") {
                    el.country.forEach((d) => {
                        if (obj.hasOwnProperty(d)) {
                            obj[d].hasOwnProperty("showCount") ? obj[d]["showCount"] += 1 : obj[d]["showCount"] = 1
                        } else {
                            obj[d] = {"showCount": 1, "movieCount": 0}
                        }
                    })
                }
                return obj
            }, {})
    }

    // Create an Object of the form {country1: [north, east], country2: [north, east], ...} for the countries
    //  in uniqueCountries
    let coordinates = geoData
        .filter(el => uniqueCountries.includes(el.country))
        .reduce((obj, el) => {
            obj[el.country] = [el.latitude, el.longitude]
            return obj
        }, {})

    // Create a feature group for the markers
    let circleLayer = L.featureGroup();

    // draw the markers and their descriptors on the map
    const drawCircles = function() {

        // Remove the previously added circles
        if (map.hasLayer(circleLayer)) {
            map.removeLayer(circleLayer)
        }

        // Set a new feature group
        circleLayer = L.featureGroup();

        // Get the correctly filtered data set
        let countData = countPerCountryPerFilter()
        if (Object.values(countData).length === 0) return

        let maxCount = Object.values(countData)
            .map(el => Math.max(el.movieCount, el.showCount))
            .reduce((a, b) => b > a ? b : a)

        uniqueCountries.forEach((d) => {

            // if the country is not present in the given year
            if (!(countData.hasOwnProperty(d))) return

            // Add the circle
            let circle = L.circle(coordinates[d], {
                color: 'black',
                fillColor: 'black',
                fillOpacity: 0.4,
                radius: 500 * (countData[d].movieCount + countData[d].showCount)
            })
            circle.addTo(circleLayer)

            // Add the popup
            let popUp = L.popup();

            let content = `<strong>${d}</strong><br>Movies: ${countData[d].movieCount}<br>Shows: ${countData[d].showCount}`

            circle.on("mouseover", (e) => {
                popUp.setLatLng(e.latlng)
                    .setContent(content)
                    .openOn(map);
            })
        })
        circleLayer.addTo(map);
    }

    // Setup the click behaviour of the time slider
    mapTimeSlider.onchange = () => {
        selectedYear = parseInt(mapTimeSlider.value);
        drawCircles()
        yearDisplay.innerText = mapTimeSlider.value
    }

    // Setup the click behaviour of the timeCheckBox
    mapTimeCheckBox.onclick = () => {
        if (mapTimeCheckBox.checked) {
            mapTimeSlider.disabled = false
            selectedYear = parseInt(mapTimeSlider.value);
            drawCircles()
            yearDisplay.innerText = mapTimeSlider.value
        } else {
            mapTimeSlider.disabled = true
            selectedYear = null;
            drawCircles()
            yearDisplay.innerText = "All years"
        }
    }

    uniqueGenres.forEach((g) => {
        let option = document.createElement('option')
        option.value = g
        option.innerText = g
        genreSelectBox.appendChild(option)
    })

    genreSelectBox.onchange = () => {
        const genres = Array.from(genreSelectBox.selectedOptions).map(el => el.value)
        console.log(genres)
        selectedGenres = genres
        drawCircles()
    }

    // draw circles
    drawCircles()

}

// make controller elements
const mapTimeCheckBox = document.getElementById('map-time-checkbox');
const mapTimeSlider = document.getElementById('map-time-slider');
const yearDisplay = document.getElementById('map-year-display');
const genreSelectBox = document.getElementById('map-genre-select')

// Require the datasets
let dataPromises = [
    d3.csv(geoDataPath),
    d3.csv(dataPath)
]

// Resolve promises before making the visualisation
Promise.all(dataPromises).then(makeVis);