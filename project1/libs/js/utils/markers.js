let markerClusters = {};

const icons = {
  uni: L.ExtraMarkers.icon({
    prefix: "fa",
    icon: "fa-graduation-cap",
    markerColor: "pink",
    shape: "square",
  }),
  park: L.ExtraMarkers.icon({
    prefix: "fa",
    icon: "fa-tree",
    markerColor: "green",
    shape: "square",
  }),
  museum: L.ExtraMarkers.icon({
    prefix: "fa",
    icon: "fa-landmark",
    markerColor: "yellow",
    shape: "square",
  }),
  amusement: L.icon({
    iconUrl: "./libs/css/markers/amusement.png",
    iconSize: [35, 35],
    iconAnchor: [0, 41],
    popupAnchor: [1, -34],
  }),
  state: L.ExtraMarkers.icon({
    prefix: "fa",
    icon: "fa-city",
    markerColor: "blue", // Color for first admin division
    shape: "square",
  }),
  city: L.ExtraMarkers.icon({
    prefix: "fa",
    icon: "fa-city",
    markerColor: "cyan", // Color for second admin division
    shape: "square",
  }),
  zoo: L.ExtraMarkers.icon({
    prefix: "fa",
    icon: "fa-paw",
    markerColor: "orange",
    shape: "square",
  }),
  airport: L.ExtraMarkers.icon({
    prefix: "fa",
    icon: "fa-plane",
    markerColor: "red",
    shape: "square",
  }),
  capital: L.ExtraMarkers.icon({
    prefix: "fa",
    icon: "fa-landmark-flag",
    markerColor: "black",
    shape: "square",
  }),
};

const fetchAllMarkerData = async (countryCode) => {
  const queryTypes = [
    "unis",
    "parks",
    "museums",
    "amusement",
    "populatedPlaces",
    "zoos",
    "capital",
    "airports",
  ].join(",");

  try {
    const response = await fetch(
      `libs/php/retrieveMarkers.php?countryCode=${encodeURIComponent(
        countryCode
      )}&queryTypes=${queryTypes}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data; // Returning the data for all types
  } catch (error) {
    console.error("Fetch Error:", error);
    throw error;
  }
};

const fetchMarkerData = async (layerControl, countryCode, map) => {
  try {
    const markerData = await fetchAllMarkerData(countryCode);

    addMarkersToCluster(
      layerControl,
      markerData.capital,
      "Capital City",
      icons.capital,
      map,
      true
    );
    addMarkersToCluster(
      layerControl,
      markerData.airports,
      "Airports",
      icons.airport,
      map,
      true
    );
    addMarkersToCluster(
      layerControl,
      markerData.populatedPlaces,
      "Populated Places",
      null,
      map,
      true
    );
    addMarkersToCluster(
      layerControl,
      markerData.unis,
      "Universities",
      icons.uni,
      map
    );
    addMarkersToCluster(
      layerControl,
      markerData.parks,
      "Parks",
      icons.park,
      map
    );
    addMarkersToCluster(
      layerControl,
      markerData.museums,
      "Museums",
      icons.museum,
      map
    );
    addMarkersToCluster(
      layerControl,
      markerData.amusement,
      "Amusement Parks",
      icons.amusement,
      map
    );
    addMarkersToCluster(layerControl, markerData.zoos, "Zoos", icons.zoo, map);
  } catch (error) {
    console.error("Error fetching all data:", error);
  }
};

const addMarkersToCluster = (
  layerControl,
  data,
  layerName,
  icon,
  map,
  isImportant
) => {
  if (markerClusters[layerName]) {
    markerClusters[layerName].clearLayers();
    layerControl.removeLayer(markerClusters[layerName]);
  }

  const markersArray = data.map((place) => {
    if (layerName === "Populated Places") {
      icon = place.name === place.adminName1 ? icons.state : icons.city;
    }
    return L.marker([place.lat, place.lng], { icon: icon }).bindPopup(
      place.name === place.adminName1
        ? `${place.name}`
        : `${place.name}, ${place.adminName1}`
    );
  });

  const markerClusterGroup = L.markerClusterGroup({
    polygonOptions: {
      fillColor: "#fff",
      color: "#000",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.5,
    },
  });
  markerClusterGroup.addLayers(markersArray);

  layerControl.addOverlay(markerClusterGroup, layerName);
  if (isImportant) {
    markerClusterGroup.addTo(map);
  }

  markerClusters[layerName] = markerClusterGroup;
};

export default fetchMarkerData;
