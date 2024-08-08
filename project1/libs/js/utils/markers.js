let markerClusters = {};

const uniIcon = L.icon({
  iconUrl: "./libs/css/markers/university.png",
  iconSize: [35, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const parkIcon = L.icon({
  iconUrl: "./libs/css/markers/park.png",
  iconSize: [35, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const museumIcon = L.icon({
  iconUrl: "./libs/css/markers/museum.png",
  iconSize: [35, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const amusementIcon = L.icon({
  iconUrl: "./libs/css/markers/amusement.png",
  iconSize: [35, 41],
  iconAnchor: [0, 41],
  popupAnchor: [1, -34],
});

const stateIcon = L.icon({
  iconUrl: "./libs/css/markers/b/state2.png",
  iconSize: [35, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const zooIcon = L.icon({
  iconUrl: "./libs/css/markers/zoo.png",
  iconSize: [35, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const capitalIcon = L.icon({
  iconUrl: "./libs/css/markers/capital.png",
  iconSize: [35, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const fetchUniData = async (countryCode) => {
  return fetchData("unis", countryCode);
};

const fetchParkData = async (countryCode) => {
  return fetchData("parks", countryCode);
};

const fetchMuseumData = async (countryCode) => {
  return fetchData("museums", countryCode);
};

const fetchAmusementData = async (countryCode) => {
  return fetchData("amusement", countryCode);
};

const fetchStateData = async (countryCode) => {
  return fetchData("states", countryCode);
};

const fetchZooData = async (countryCode) => {
  return fetchData("zoos", countryCode);
};

const fetchCapitalData = async (countryCode) => {
  return fetchData("capital", countryCode);
};

const fetchData = async (queryType, countryCode) => {
  try {
    const response = await fetch(
      `libs/php/retrieveMarkers.php?countryCode=${encodeURIComponent(
        countryCode
      )}&queryType=${queryType}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Fetch Error:", error);
    throw error;
  }
};

const fetchMarkerData = async (layerControl, countryCode, map) => {
  try {
    const [
      capitalData,
      uniData,
      parkData,
      museumData,
      amusementData,
      stateData,
      zooData,
    ] = await Promise.all([
      fetchCapitalData(countryCode),
      fetchUniData(countryCode),
      fetchParkData(countryCode),
      fetchMuseumData(countryCode),
      fetchAmusementData(countryCode),
      fetchStateData(countryCode),
      fetchZooData(countryCode),
    ]);

    // Adding markers to the map with clustering
    addMarkersToCluster(
      layerControl,
      capitalData,
      "Capital City",
      capitalIcon,
      map,
      true
    );
    addMarkersToCluster(layerControl, stateData, "States", stateIcon, map);
    addMarkersToCluster(layerControl, uniData, "Universities", uniIcon, map);
    addMarkersToCluster(layerControl, parkData, "Parks", parkIcon, map);
    addMarkersToCluster(layerControl, museumData, "Museums", museumIcon, map);
    addMarkersToCluster(
      layerControl,
      amusementData,
      "Amusement Parks",
      amusementIcon,
      map
    );
    addMarkersToCluster(layerControl, zooData, "Zoos", zooIcon, map);
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
  isCapital
) => {
  if (markerClusters[layerName]) {
    markerClusters[layerName].clearLayers();
    layerControl.removeLayer(markerClusters[layerName]);
  }

  const markersArray = data.map((place) =>
    L.marker([place.lat, place.lng], { icon: icon }).bindPopup(
      place.fcode === "PPLC" || place.fcode === "ADM1"
        ? `${place.name}`
        : `${place.name}, ${place.adminName1}`
    )
  );
  const markerClusterGroup = L.markerClusterGroup();
  markerClusterGroup.addLayers(markersArray);

  layerControl.addOverlay(markerClusterGroup, layerName);
  if (isCapital) {
    markerClusterGroup.addTo(map);
  }

  markerClusters[layerName] = markerClusterGroup;
};

export default fetchMarkerData;
