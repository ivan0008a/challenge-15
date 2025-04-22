// Create base map layers
let street = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; OpenStreetMap contributors'
});

let dark = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
  attribution: '&copy; <a href="https://carto.com/">CartoDB</a>'
});

// Map 
let map = L.map("map", {
  center: [20, 0],
  zoom: 2,
  layers: [street]  // default 
});

// Create 
let earthquakes = new L.LayerGroup();
let tectonicPlates = new L.LayerGroup();

// Define
let baseMaps = {
  "Street Map": street,
  "Dark Map": dark
};

// Define 
let overlayMaps = {
  "Earthquakes": earthquakes,
  "Tectonic Plates": tectonicPlates
};

// Add layer 
L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(map);

// Fetch
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {

  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.geometry.coordinates[2]),
      color: "#000000",
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }

  function getColor(depth) {
    return depth > 90 ? "#ea2c2c" :
           depth > 70 ? "#ea822c" :
           depth > 50 ? "#ee9c00" :
           depth > 30 ? "#eecc00" :
           depth > 10 ? "#d4ee00" :
                        "#98ee00";
  }

  function getRadius(magnitude) {
    return magnitude === 0 ? 1 : magnitude * 4;
  }

  L.geoJson(data, {
    pointToLayer: (feature, latlng) => L.circleMarker(latlng),
    style: styleInfo,
    onEachFeature: function (feature, layer) {
      layer.bindPopup(
        `<strong>Magnitude:</strong> ${feature.properties.mag}<br>
         <strong>Location:</strong> ${feature.properties.place}<br>
         <strong>Depth:</strong> ${feature.geometry.coordinates[2]} km`
      );
    }
  }).addTo(earthquakes);

  earthquakes.addTo(map);

  // Legend setup
  let legend = L.control({ position: "bottomright" });

  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");
    let depths = [-10, 10, 30, 50, 70, 90];
    let colors = [
      "#98ee00", "#d4ee00", "#eecc00",
      "#ee9c00", "#ea822c", "#ea2c2c"
    ];

    for (let i = 0; i < depths.length; i++) {
      div.innerHTML +=
        `<i style="background:${colors[i]}"></i> ` +
        `${depths[i]}${depths[i + 1] ? `–${depths[i + 1]}<br>` : "+ km"}`;
    }

    return div;
  };

  legend.addTo(map);
});

// Fetch 
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (plateData) {
  L.geoJson(plateData, {
    color: "orange",
    weight: 2
  }).addTo(tectonicPlates);

  tectonicPlates.addTo(map);
});

