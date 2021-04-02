import {dataPath, geoDataPath, rowConverter} from "./utils.js";


const width = 800;
const height = 600;
const margin = 100;

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

    // Create an Object of the form {country1: [north, east], country2: [north, east], ...} for the countries
    //  in uniqueCountries
    let coordinates = geoData
        .filter(el => uniqueCountries.includes(el.country))
        .reduce((obj, el) => {
            obj[el.country] = [el.latitude, el.longitude]
            return obj
        }, {})

    // Add markers to map for the countries in the data set
    uniqueCountries.forEach((d) => {
        let circle = L.circle(coordinates[d], {
            color: 'black',
            fillColor: 'black',
            fillOpacity: 0.4,
            radius: 500
        })
        circle.addTo(map)

        let popUp = L.popup();
        circle.on("mouseover", (e) => {
            popUp.setLatLng(e.latlng)
                .setContent(d)
                .openOn(map);
        })

    })

}

let dataPromises = [
    d3.csv(geoDataPath),
    d3.csv(dataPath)
]

// Resolve promises before making the visualisation
Promise.all(dataPromises).then(makeVis);