import {dataPath, geoDataPath, rowConverter} from "./utils.js";


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



function makeVis([geoData, data]) {

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

    let uniqueCountries = data
        // create array of country names
        .map(el => el.country.split(', ')).reduce((a, b) => a.concat(b))
        // reduce to unique values and exclude "NA"
        .filter((v, i, self) => self.indexOf(v) === i).filter(el => el !== "NA")

    console.log()

    let dataCountryArrayed = data.map(el => {
        el.country = el.country.split(', ');
        return el;
    })

    let countPerCountry = dataCountryArrayed
        .reduce((obj, el) => {
            el.country.forEach((d) => {obj.hasOwnProperty(d) ? obj[d] += 1 : obj[d] = 1})
            return obj
        }, {})

    const countPerCountryPerYear = function(year) {
        return dataCountryArrayed
            .filter(el => new Date(el.date_added).getFullYear() === year)
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

    // Add markers to map for the countries in the data set

    let circleLayer = L.featureGroup();

    const drawMap = function(year=null) {

        if (map.hasLayer(circleLayer)) {
            map.removeLayer(circleLayer)
        }
        circleLayer = L.featureGroup();

        let countData = year === null ? countPerCountry : countPerCountryPerYear(year)

        uniqueCountries.forEach((d) => {

            if (!(countData.hasOwnProperty(d))) return

            let circle = L.circle(coordinates[d], {
                color: 'black',
                fillColor: 'black',
                fillOpacity: 0.4,
                radius: 500 * countData[d]
            })
            circle.addTo(circleLayer)

            let popUp = L.popup();
            circle.on("mouseover", (e) => {
                popUp.setLatLng(e.latlng)
                    .setContent(d)
                    .openOn(map);
            })
        })
        circleLayer.addTo(map);
    }

    // Create a basic time slider for the map
    mapTimeSlider.onchange = () => drawMap(parseInt(mapTimeSlider.value))
    mapTimeCheckBox.onclick = () => {
        if (mapTimeCheckBox.checked) {
            mapTimeSlider.disabled = false
            drawMap(parseInt(mapTimeSlider.value))
        } else {
            mapTimeSlider.disabled = true
            drawMap()
        }
    }

    drawMap()

}

const mapTimeCheckBox = makeCheckBox();
const mapTimeSlider = makeSlider()

let dataPromises = [
    d3.csv(geoDataPath),
    d3.csv(dataPath)
]

// Resolve promises before making the visualisation
Promise.all(dataPromises).then(makeVis);