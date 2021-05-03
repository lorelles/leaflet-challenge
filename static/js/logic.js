
// Store our API endpoint inside queryUrl
// const queryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2018-01-11&endtime=" +
//     "2018-01-12&maxlongitude=-69.52148437&minlongitude=-123.83789062&maxlatitude=48.74894534&minlatitude=25.16517337";
// const queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Perform a GET request to the query URL
// d3.json(queryUrl).then(data => {
//     console.log(data);
//     console.log(d3.extent(data.features.map(d => d.geometry.coordinates)))
//     console.log(d3.extent(data.features.map(d => d.geometry.coordinates[2])))

//     // Once we get a response, send the data.features object to the createFeatures function
//     createFeatures(data.features);
// });

function createFeatures(earthquakeData, platedata) {

    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h4>" + "Magnitude/Location:  " + feature.properties.title +
            "</h4><hr><p>" + "Day/Time:  " + new Date(feature.properties.time) + "</p><hr><p>" + "Depth:  " + feature.geometry.coordinates + "</p>");
    }
  

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    const earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        style: function(feature) {
            // console.log(feature.geometry.coordinates[2]);
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
        pointToLayer: (feature, latlng) => {
            return new L.Circle(latlng, {
                radius: feature.properties.mag * 50000,
                stroke: true         
            });
        }
    });

    const mags = L.geoJSON(platedata, {
        onEachFeature: onEachFeature,

        // pointToLayer: (feature, latlng) => {
        //     return new L.Circle(latlng, {
        //         radius: feature.properties.mag * 50000,
        //         fillColor: "red",
        //         stroke: false
        //     });
        // }
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
        id: "mapbox/light-v9",
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


    // // adding style fuction for markers from Leafletjs.com
    // function style(feature) {
    //     return {
    //         fillColor: getColor(feature.geometry.coordinates[2]),
    //         weight: 2,
    //         opacity: 1,
    //         color: 'white',
    //         dashArray: '3',
    //         fillOpacity: 0.7
    //     };
    // }

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


//  NOTE FOR STEP 2
// /  You can use the javascript Promise.all function to make two d3.json calls,
// /  and your then function will not run until all data has been retreived.
// /
// / ----------------------------------------
Promise.all(
    [
        d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"),
        d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json")
    ]
  ).then( ([data, platedata]) => {
    createFeatures(data.features, platedata.features);
       console.log("earthquakes", data)
       console.log("tectonic plates", platedata)

    }).catch(e => console.warn(e));

// / ----------------------------------------

