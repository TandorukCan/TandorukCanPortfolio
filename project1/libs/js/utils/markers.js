let layerGroups = {};

const uniIcon = L.icon({
  iconUrl: "./libs/css/markers/university.png",
  iconSize: [35, 41], // size of the icon
  iconAnchor: [12, 41], // point of the icon which will correspond to marker's location
  popupAnchor: [1, -34], // point from which the popup should open relative to the iconAnchor
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

    // Example of adding markers to the map
    addMarkersToMap(
      layerControl,
      capitalData,
      "Capital City",
      capitalIcon,
      map,
      true
    );
    addMarkersToMap(layerControl, stateData, "States", stateIcon, map);
    addMarkersToMap(layerControl, uniData, "Universities", uniIcon, map);
    addMarkersToMap(layerControl, parkData, "Parks", parkIcon, map);
    addMarkersToMap(layerControl, museumData, "Museums", museumIcon, map);
    addMarkersToMap(
      layerControl,
      amusementData,
      "Amusement Parks",
      amusementIcon,
      map
    );
    addMarkersToMap(layerControl, zooData, "Zoos", zooIcon, map);
  } catch (error) {
    console.error("Error fetching all data:", error);
  }
};

const addMarkersToMap = (
  layerControl,
  data,
  layerName,
  icon,
  map,
  isCapital
) => {
  if (layerGroups[layerName]) {
    layerGroups[layerName].clearLayers();
    layerControl.removeLayer(layerGroups[layerName]);
  }

  const markersArray = data.map((place) =>
    L.marker([place.lat, place.lng], { icon: icon }).bindPopup(
      place.fcode === "PPLC" || place.fcode === "ADM1"
        ? `${place.name}`
        : `${place.name}, ${place.adminName1}`
    )
  );
  const layerGroup = L.layerGroup(markersArray);
  layerControl.addOverlay(layerGroup, layerName);
  if (isCapital) {
    layerGroup.addTo(map);
  }

  layerGroups[layerName] = layerGroup;
};

export default fetchMarkerData;
