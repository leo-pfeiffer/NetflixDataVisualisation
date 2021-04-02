import {dataPath} from "./utils.js";

(function() {

    const width = 800;					//specifies the width, height and margins of our SVG element
    const height = 600;
    const margin = 100;

    const makeVis = function () {

        const map = L.map('map').setView([28.0339, 1.6596], 2);

        //here we include a tile layer that specifies the visual look of our map
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
    }
    makeVis();
})();