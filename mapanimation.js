/* global variabnles */
const markersContainer = [];
const popupContainer = [];
let activeBuses = 0;
const token = 'pk.eyJ1IjoieWhlbW1pIiwiYSI6ImNrb2w2aDRwNjA2MGkyb3A1ODhzM3RyZHgifQ.uGKJZFT8crOrtNOD6W8B5Q'

/**
 * @param  {string} container: id of container to hold map
 * @param  {array} center: longitude and latitude of starting location
 * @param  {string} token: mapbox token
 * @param  {string} style: mapbox style
 * @param  {int} zoom: zoom for mapbox map
 */
const createMap = (container, center, token,
        style = 'mapbox://styles/mapbox/streets-v11',
        zoom = 12) => {

        mapboxgl.accessToken = token;

        let map = new mapboxgl.Map({
            container,
            style,
            center,
            zoom
        });

        return map;
    }
    /**
     * @param  {DOM element} customMarker: a custom placeholkder for the marker sign
     * @param  {object} map: the mapbox map
     * @param  {array} where: longitude and latitude
     * @return {object} returns a mapbox marker
     */
const createMarker = (customMarker, map, where) => {
        let myMarker = new mapboxgl.Marker(customMarker)
            .setLngLat(where)
            .addTo(map)
        return myMarker;
    }
    /**
     * @param  {object} map: the mapbox map
     * @param  {array} where: latitude and longitude
     * @param  {string} text='bus', popup displayed text
     * @return {object} returns a mapbox popup
     */
const addPopUp = (map, where, text = 'bus') => {
    let popup = new mapboxgl.Popup({ closeOnClick: false })
        .setLngLat(where)
        .setHTML(`<span>${text}</span>`)
        .addTo(map);
    return popup;
}


// creates a custom marker, whic is the fontawesome's bus icon
const createCustomMarker = () => {

    let id = "marker-" + Date.now();

    const markerIcon = document.createElement('i')

    markerIcon.classList.add('fas', 'fa-bus', 'custom-marker');

    markerIcon.id = id;

    return markerIcon;
}

/**
 * @param  {string} url: MNTA data url
 * @return {object} longitudes, latitudes and ids of buses
 */
const getData = async(url) => {

    let data = await fetch(url);
    let json = await data.json();
    let length = json.data.length;

    let arrLong = []
    let busIds = []

    for (let i = 0; i < length; i++) {
        arrLong.push([
            json.data[i].attributes.longitude,
            json.data[i].attributes.latitude
        ])
        busIds.push(json.data[i].id)
    }
    let ret = Promise.resolve(arrLong);
    return { "longlat": arrLong, 'ids': busIds };

}

const run = async() => {

    let json = getData('https://api-v3.mbta.com/vehicles?filter[route]=1&include=trip');

    json.then((info) => {

        data = info['longlat'];
        ids = info['ids']

        if (activeBuses == 0) {
            activeBuses = data.length;
            for (let i = 0; i < data.length; i++) {

                let customMarker = createCustomMarker();
                markersContainer.push(createMarker(customMarker, map, data[i]));
                popupContainer.push(addPopUp(map, data[i], ids[i]))
                    // addPopUp(map, latlong, 'bus')
            }
        }

        for (let i = 0; i < markersContainer.length; i++) {
            console.log(data[i])
            popupContainer[i].setLngLat(data[i])
            markersContainer[i].setLngLat(data[i]);
        }

    })

    setTimeout(run, 20000);
}

const map = createMap('map', [-71.101, 42.358], token);

run();