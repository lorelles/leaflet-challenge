// Define a function we want to run once for each feature in the features array
function createFeatures(data, platedata) {

    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h4>" + "Magnitude/Location:  " + feature.properties.title +
            "</h4><hr><p>" + "Day/Time:  " + new Date(feature.properties.time) + "</p><hr><p>" + "Depth:  " + feature.geometry.coordinates + "</p>");
    }

    // Create a GeoJSON layer containing the features array on the earthquake and tectonic objects
    // Run the onEachFeature function once for each piece of data in the earthquake data array
    const earthquakes = L.geoJSON(data, {
        onEachFeature: onEachFeature,
        style: function (feature) {
            // set color of marker based on depth (Leafletjs.com)
            var depth = feature.geometry.coordinates[2];
            if (depth >= 91) {
                return {
                    color: '#bd0026'
                };
            }
            else if (depth >= 71) {
                return {
                    color: '#e31a1c'
                };
            } else if (depth >= 51) {
                return {
                    color: '#fc4e2a'
                };
            } else if (depth >= 31) {
                return {
                    color: '#fd8d3c'
                };
            } else if (depth >= 11) {
                return {
                    color: '#feb24c'
                };
            } else if (depth >= -10) {
                return {
                    color: '#ffeda0'
                };
            } else {
                return {
                    color: '#969696'
                }
            }
        },
        // set marker size
        pointToLayer: (feature, latlng) => {
            return new L.Circle(latlng, {
                radius: Math.round(feature.properties.mag) * 50000,
                stroke: true
            });
        }
    });

    // Run the onEachFeature function once for each piece of data in the platedata array
    const plates = L.geoJSON(platedata, {
        onEachFeature: onEachFeature,
        color: "orange",
        weight: 2
    });

    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes, plates);
}

// Create the map with our layers
function createMap(earthquakes, plates) {

    // Define satelite, greyscale, and street map layers
    const satmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/satellite-v9",
        accessToken: API_KEY
    });

    const greyscale = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/light-v9",
        accessToken: API_KEY
    });

    const streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/streets-v11",
        accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    const baseMaps = {
        "Satelite": satmap,
        "Greyscale": greyscale,
        "Street": streetmap
    };

    // Create overlay object to hold our overlay layer
    const overlayMaps = {
        Earthquakes: earthquakes,
        "Tectonic Plates": plates
    };

    // Create our map, giving it the satmap, earthquakes, and plate layers to display on load
    const myMap = L.map("map", {
        center: [
            37.09, -95.71
        ],
        zoom: 2.5,
        layers: [satmap, earthquakes, plates]
    });

    // Create a layer control, add our overlay layers to it (Leafletjs.com)
    // Pass in our baseMaps and overlayMaps
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    function getColor(d) {
        return d >= 91 ? '#bd0026' :
            d >= 71 ? '#e31a1c' :
                d >= 51 ? '#fc4e2a' :
                    d >= 31 ? "#fd8d3c" :
                        d >= 11 ? '#feb24c' :
                            d >= -10 ? '#ffeda0' :
                                '#969696';
    }

    // Create a legend to display information about our map
    const legend = L.control({
        position: "bottomright"
    });

    // When the layer control is added, insert a div with the class of "legend"
    legend.onAdd = function (myMap) {
        const div = L.DomUtil.create("div", "legend"),
            depths = [-9, 11, 31, 51, 71, 91],
            labels = [];
        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < depths.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(depths[i] + 1) + '"></i> ' +
                depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
        }
        return div;
    };
    // Add the info legend to the map
    legend.addTo(myMap);
}

// for step 2 use the javascript Promise.all function to make two d3.json calls to retrieve all data before loading
Promise.all(
    [
        d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"),
        d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json")
    ]
).then(([data, platedata]) => {
    createFeatures(data.features, platedata.features);
    console.log("earthquakes", data)
    console.log("tectonic plates", platedata)

}).catch(e => console.warn(e));
