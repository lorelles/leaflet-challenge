# leaflet-challenge

![image](https://user-images.githubusercontent.com/74384017/116838245-8a573000-ab82-11eb-9665-d3469f72e9df.png)

This project utilizes leaflet within html and Javascript in order to visualize earthquake data obtained from the United States Geological Survey (USGS). The maps in this project present earthquakes and tectonic plates based on their longitude and latitude. The size of the data markers represents the magnitude of the earthquake, and the color coordinates with the depth, following the legend key. There is a popup menu that provides additional data when the marker is clicked. The tectonic plates (Displayed in orange) and earthquake data can be clicked on and off to be displayed independently within the control box in the upper right of the map. There are three different map views to choose from: Satelite, Greyscale, and Street view.

To view the webpage, create a config.js file with your personal Mapbox API and add to the "js" file within the "static" folder, then load index.html on your local IDE. The Javascipt for Leaflet is located within "static/js/logic.js." The styling is located in "static/styles.css/css."

The tectonic plate data was originally published in the paper _An updated digital model of plate boundaries_ by Peter Bird, and located on GitGub at: https://github.com/fraxen/tectonicplates, and made available under the Open Data Commons Attribution License: http://opendatacommons.org/licenses/by/1.0/. 