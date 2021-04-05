import {dataPath, geoDataPath} from "./utils.js";

const width = 800;
const height = 600;
const margin = 100;

function makeCheckBox() {
    const mapTimeCheckbox = document.createElement('input')
    mapTimeCheckbox.setAttribute('type', 'checkbox')
    document.getElementById('map-controller').appendChild(mapTimeCheckbox);
    return mapTimeCheckbox;
}

function makeSlider() {
    const mapTimeSlider = document.createElement('input')
    mapTimeSlider.setAttribute('type', 'range')
    mapTimeSlider.setAttribute('disabled', 'true')
    mapTimeSlider.setAttribute('min', '2008')
    mapTimeSlider.setAttribute('max', '2020')
    mapTimeSlider.setAttribute('class', 'slider')
    document.getElementById('map-controller').appendChild(mapTimeSlider);
    return mapTimeSlider;
}

function makeYearDisplay() {
    const yearDisplay = document.createElement('p')
    yearDisplay.style.fontWeight = 'bold'
    yearDisplay.innerText = 'All years'
    document.getElementById('map-controller').appendChild(yearDisplay);
    return yearDisplay;
}

function makeGenreSelectBox() {
    const genreSelectBox = document.createElement('select')
    genreSelectBox.setAttribute('multiple', 'true')
    document.getElementById('map-controller').appendChild(genreSelectBox);
    return genreSelectBox;
}

function makeVis([geoData, data]) {

    let selectedYear = null;
    let selectedGenres = null;

    // Transform the list like elements of each object in the data into an array of elements
    data = data.map(el => {
        el.country = el.country.split(', ');
        el.director = el.director.split(', ');
        el.cast = el.cast.split(', ');
        el.listed_in = el.listed_in.split(', ');
        return el;
    })

    // Create the map
    const map = L.map('map').setView([28.0339, 1.6596], 2);

    // Add tile layers
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="href://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

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

    CartoDB_PositronNoLabels.addTo(map)
    Stamen_TonerHybrid.addTo(map)

    // Create an array that contains all countries from the dataset (unique)
    let uniqueCountries = data
        // create array of country names
        .map(el => el.country).reduce((a, b) => a.concat(b))
        // reduce to unique values and exclude "NA"
        .filter((v, i, self) => self.indexOf(v) === i).filter(el => el !== "NA")

    let uniqueGenres = data
        // create array of genres
        .map(el => el.listed_in).reduce((a, b) => a.concat(b))
        // reduce to unique values and exclude "NA"
        .filter((v, i, self) => self.indexOf(v) === i).filter(el => el !== "NA")

    // Movie and Show count for all countries in a give year
    const countPerCountryPerFilter = function() {
        let tempData = data;

        // filter entries of the current year
        if (selectedYear !== null) tempData = tempData.filter(el => new Date(el.date_added).getFullYear() === selectedYear)

        // filter entries that contain at least one of the selected genres
        if (selectedGenres !== null) tempData = tempData.filter(el => {
            return [selectedGenres, el.listed_in].reduce((a, b) => a.filter(c => b.includes(c))).length > 0;
        })

        return tempData
            .reduce((obj, el) => {
                el.country.forEach((d) => {obj.hasOwnProperty(d) ? obj[d] += 1 : obj[d] = 1})
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

        uniqueCountries.forEach((d) => {

            // if the country is not present in the given year
            if (!(countData.hasOwnProperty(d))) return

            // Add the circle
            let circle = L.circle(coordinates[d], {
                color: 'black',
                fillColor: 'black',
                fillOpacity: 0.4,
                radius: 500 * countData[d]
            })
            circle.addTo(circleLayer)

            // Add the popup
            let popUp = L.popup();
            circle.on("mouseover", (e) => {
                popUp.setLatLng(e.latlng)
                    .setContent(`${d}: ${countData[d]}`)
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
const mapTimeCheckBox = makeCheckBox();
const mapTimeSlider = makeSlider()
const yearDisplay = makeYearDisplay();
const genreSelectBox = makeGenreSelectBox();

// Require the datasets
let dataPromises = [
    d3.csv(geoDataPath),
    d3.csv(dataPath)
]

// Resolve promises before making the visualisation
Promise.all(dataPromises).then(makeVis);