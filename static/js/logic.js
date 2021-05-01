// // Function to determine marker size based on population
// function markerSize(mag) {
//     // return population / 40;
//     return Math.sqrt(mag) * 100;
// }


// Store our API endpoint inside queryUrl
const queryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2018-01-11&endtime=" +
    "2018-01-12&maxlongitude=-69.52148437&minlongitude=-123.83789062&maxlatitude=48.74894534&minlatitude=25.16517337";

// Perform a GET request to the query URL
d3.json(queryUrl).then(data => {
    console.log(data);
    console.log(d3.extent(data.features.map(d => d.geometry.coordinates)))
    console.log(d3.extent(data.features.map(d => d.geometry.coordinates[2])))
    // let depth = data.features.map(d => d.geometry.coordinates[2])
    // console.log(depth)

    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
    // });

    function createFeatures(earthquakeData) {

        // Define a function we want to run once for each feature in the features array
        // Give each feature a popup describing the place and time of the earthquake
        function onEachFeature(feature, layer) {
            layer.bindPopup("<h4>" + "Magnitude/Location:  " + feature.properties.title +
                "</h4><hr><p>" + "Day/Time:  " + new Date(feature.properties.time) + "</p><hr><p>" + "Depth:  " + feature.geometry.coordinates + "</p>");
            // console.log(feature.geometry.coordinates[2]);

            // let depth = feature.geometry.coordinates[2]
        }

        // console.log(feature.properties)

        function markerStyle(feature) {
            let colorMarker;
            // let depth =;

            let depth = feature.geometry.coordinates[2];
            // console.log(feature.geometry.coordinates[2]);
            // console.log(depth); 

            if (depth > "90") colorMarker = "#800026";
            else if (depth > "70") colorMarker = "#E31A1C";
            else if (depth > "50") colorMarker = "#FC4E2A";
            else if (depth > "30") colorMarker = "#FD8D3C";
            else if (depth > "10") colorMarker = "#FED976";
            else if (depth > "-10") colorMarker = "#FFEDA0";
            else colorMarker = "#000000";

            return {
                "color": colorMarker,
                "weight": 5
            };
        }

        // Create a GeoJSON layer containing the features array on the earthquakeData object
        // Run the onEachFeature function once for each piece of data in the array
        const earthquakes = L.geoJSON(earthquakeData, {
            onEachFeature: onEachFeature,
            pointToLayer: (feature, latlng) => {
                return new L.Circle(latlng, {
                    radius: feature.properties.mag * 50000,
                    // fillColor: "red",
                    fillColor: markerStyle(feature),
                    stroke: false
                });
            }
        });

        const mags = L.geoJSON(earthquakeData, {
            onEachFeature: onEachFeature,
            pointToLayer: (feature, latlng) => {
                return new L.Circle(latlng, {
                    // radius: earthquakeData, 
                    // radius: markerSize(feature.properties.mag),
                    radius: feature.properties.mag * 50000,
                    fillColor: "red",
                    stroke: false
                });
            }
        });

        // Sending our earthquakes layer to the createMap function
        createMap(earthquakes, mags);
    }

    function createMap(earthquakes, mags) {

        // Define satelite map and street map layers
        const satmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
            attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
            tileSize: 512,
            maxZoom: 18,
            zoomOffset: -1,
            id: "mapbox/satellite-v9",
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
            "Street": streetmap
        };

        // Create overlay object to hold our overlay layer
        const overlayMaps = {
            Earthquakes: earthquakes,
            Magnitudes: mags
        };

        // Create our map, giving it the satmap and earthquakes layers to display on load
        const myMap = L.map("map", {
            center: [
                37.09, -95.71
            ],
            zoom: 4,
            layers: [satmap, earthquakes]
        });

        // Create a layer control, add our overlay layers to it
        // Pass in our baseMaps and overlayMaps
        L.control.layers(baseMaps, overlayMaps, {
            collapsed: false
        }).addTo(myMap);

        function getColor(d) {
            return d > 90 ? '#800026' :
                d > 70 ? '#E31A1C' :
                    d > 50 ? '#FC4E2A' :
                        d > 30 ? '#FD8D3C' :
                            d > 10 ? '#FED976' :
                                d > -10 ? '#FFEDA0' :
                                    '#FFEDA0';
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

});

/* NOTE FOR STEP 2
/  You can use the javascript Promise.all function to make two d3.json calls,
/  and your then function will not run until all data has been retreived.
/
/ ----------------------------------------
/  Promise.all(
/    [
/        d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"),
/        d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json")
/    ]
/  ).then( ([data,platedata]) => {
/
/        console.log("earthquakes", data)
/        console.log("tectonic plates", platedata)
/
/    }).catch(e => console.warn(e));
/
/ ----------------------------------------*/

