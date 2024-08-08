// the basis of this file has been taken from the following url: https://codepen.io/itcareerswitch/pen/QWVrEdJ/8b40d6264700edb85b66a0ee03a2bc2a
// it has then been adjusted to work with Bootsrap 5, so changes has been made, such as removing the jquery requests.
// ---------------------------------------------------------
// GLOBAL DECLARATIONS
// ---------------------------------------------------------

import {
  resetWeatherData,
  resetCityData,
  resetAllFields,
} from "./utils/data-processing.js";

import { hideElement, showElement } from "./utils/utility.js";

import {
  retrieveFlag,
  retrieveGeoInfo,
  retrieveWeatherInfo,
  retrieveCities,
  retrieveWiki,
  retrieveStates,
  retrieveOverview,
  getLocationCoordinates,
  countryCodeToGeonameId,
  retrieveNews,
  retrieveCovidStats,
} from "./utils/data-fetching.js";

import fetchMarkerData from "./utils/markers.js";

let map;
let latitude;
let longitude;
const countrySelect = document.getElementById("countrySelect");
const stateSelect = document.getElementById("stateSelect");
const citySelect = document.getElementById("citySelect");
let countryCoordinates;

let geojsonLayer;
const overlayMaps = {};

let countryCode;
let countryId;

let currentStateName;
let currentSiso2;

let currentCityName;

let modal; // will be removed if necessary
let isInfoModalHidden = false;

// Logic start here

const setupInterface = (countryCode) => {
  retrieveFlag(countryCode);
  drawCountryBorder(countryCode); //drawing users country by calling drawCountryBorder function.
  retrieveOverview(countryCode);
  retrieveNews(countryCode);
  retrieveCovidStats(countryCode);
};

const resetCurrentLocation = () => {
  currentCityName = "";
  currentStateName = "";
};

const createCountryDropdown = async (iso2) => {
  let countryArray = []; // Array to store country names for sorting
  let countriesObject = {}; // Object to map country names to ISO codes
  let selectedCountry;

  try {
    const response = await fetch("libs/php/retrieveCountryBorders.php");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const countries = data.data.features;

    // Populate the countryArray and countriesObject
    countries.forEach((country) => {
      countryArray.push(country.properties.name);
      countriesObject[country.properties.name] = country.properties.iso_a2;
    });

    // Sort country names alphabetically
    countryArray.sort();

    // Populate the dropdown with sorted country names
    countryArray.forEach((country) => {
      if (countriesObject[country] === iso2) {
        selectedCountry = country;
      }
      const option = document.createElement("option");
      option.value = `${countriesObject[country]}, ${country}`;
      option.text = country;
      if (countriesObject[country] === iso2) {
        option.selected = true;
      }
      countrySelect.appendChild(option);
    });
    return selectedCountry;
  } catch (error) {
    console.error("Fetch Error:", error);
    let errorMessage = "An error occurred while fetching country information.";
    if (error.message.includes("400")) {
      errorMessage = "Bad request. Please check your input parameters.";
    } else if (error.message.includes("500")) {
      errorMessage = "Internal server error. Please try again later.";
    }
    alert(errorMessage);
  }
};

//creating a promise for geolocation API because it takes some time to get the data from the user
const getLocationPromise = () => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
};

async function drawCountryBorder(countryCode) {
  try {
    if (geojsonLayer) {
      geojsonLayer.clearLayers();
    }
    countryCoordinates = await getLocationCoordinates(countryCode);

    // drawing the country borders based on the coordinates received
    geojsonLayer = L.geoJSON(countryCoordinates).addTo(map);
    map.flyToBounds(geojsonLayer.getBounds(), { duration: 2 }); //trying this instead of map.flyTo
  } catch (error) {
    console.error(error.message);
  }
}

// tile layers

let streets = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}",
  {
    attribution:
      "Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC",
    maxZoom: 12,
  }
);

let satellite = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
    maxZoom: 18,
  }
);

let basemaps = {
  Streets: streets,
  Satellite: satellite,
};

// buttons
const infoBtn = L.easyButton("fa-info fa-xl", (btn, map) => {
  const modalElement = document.getElementById("exampleModal");
  modal = new bootstrap.Modal(modalElement); //removed const, made it global to test. revert back if not used
  modal.show();
});

const weatherBtn = L.easyButton("fa-umbrella fa-xl", (btn, map) => {
  const modalElement = document.getElementById("weatherModal");
  modal = new bootstrap.Modal(modalElement); //removed const, made it global to test. revert back if not used
  modal.show();
});

const wikiBtn = L.easyButton("fa-brands fa-wikipedia-w fa-xl", (btn, map) => {
  const modalElement = document.getElementById("wikiModal");
  modal = new bootstrap.Modal(modalElement); //removed const, made it global to test. revert back if not used
  modal.show();
});

const newsBtn = L.easyButton("fa-solid fa-newspaper fa-xl", (btn, map) => {
  const modalElement = document.getElementById("newsModal");
  modal = new bootstrap.Modal(modalElement); //removed const, made it global to test. revert back if not used
  modal.show();
});

const covidBtn = L.easyButton("fa-solid fa-virus-covid fa-xl", (btn, map) => {
  const modalElement = document.getElementById("covidModal");
  modal = new bootstrap.Modal(modalElement); //removed const, made it global to test. revert back if not used
  modal.show();
});
// ---------------------------------------------------------
// EVENT HANDLERS
// ---------------------------------------------------------

// initialise and add controls once DOM is ready

document.addEventListener("DOMContentLoaded", async () => {
  showElement("mainLoader");
  await getLocationPromise()
    .then((res) => {
      // If promise get resolved
      const { coords } = res;
      console.log(
        `User's location is: ${coords.latitude}, ${coords.longitude}`
      ); //will be removed in production
      latitude = coords.latitude;
      longitude = coords.longitude;
    })
    .catch((error) => {
      // If promise get rejected
      console.log(`User denied the request for geolocation.: ${error}`); //will be removed in production
      latitude = 54.5;
      longitude = -4;
    });

  map = L.map("map", {
    layers: [streets],
  });
  const layerControl = L.control.layers(basemaps, overlayMaps).addTo(map);

  infoBtn.addTo(map);
  weatherBtn.addTo(map);
  wikiBtn.addTo(map);
  newsBtn.addTo(map);
  covidBtn.addTo(map);
  map.setView(L.latLng(latitude, longitude), 5);
  // getting the country code of the country that relates to the user's geolocation
  const data = await retrieveGeoInfo(latitude, longitude); // setting up the global location variables to find the country, state and the city that the user is in when they login
  if (data) {
    currentCityName = data.cityName;
    currentSiso2 = data.stateCode;
    countryCode = data.countryCode;
    countryId = data.countryId;
  }
  const selectedCountry = await createCountryDropdown(countryCode);
  if (selectedCountry) {
    retrieveWiki(selectedCountry);
  }
  hideElement("mainLoader");
  setupInterface(countryCode);
  await retrieveStates(countryId, currentStateName, currentSiso2);
  await retrieveCities(countryCode, currentSiso2, citySelect, currentCityName);
  retrieveWeatherInfo(latitude, longitude);

  //added a marker to let the user know of their current location
  let marker = L.marker([latitude, longitude], 500).addTo(map);
  marker.bindPopup("This is your location");
  fetchMarkerData(layerControl, countryCode, map);

  async function onMapClick(e) {
    const data = await retrieveGeoInfo(e.latlng.lat, e.latlng.lng);
    // setting up the global location variables to find the country, state and the city that the user is in when they login
    if (data) {
      const clickedCountryCode = data.countryCode;
      if (clickedCountryCode === countryCode) {
        console.log(
          "Clicked within the current country boundaries. Skipping data retrieval."
        );
        return; // Skip the data retrieval if within the same country
      }

      currentCityName = data.cityName;
      currentSiso2 = data.stateCode;
      countryCode = data.countryCode;
      countryId = data.countryId;
    }
    resetAllFields();
    hideElement("mainLoader");
    setupInterface(countryCode);
    await retrieveStates(countryId, currentStateName);
    const selectedCountry = await createCountryDropdown(countryCode);
    if (selectedCountry) {
      retrieveWiki(selectedCountry);
    }
    fetchMarkerData(layerControl, countryCode, map);
  }

  map.on("click", onMapClick);

  const infoScreen = document.getElementsByClassName("modal-content shadow")[0];
  infoScreen.addEventListener("click", () => {
    isInfoModalHidden = !isInfoModalHidden;
    if (isInfoModalHidden) {
      console.log("you clicked on the modal!"); // will be removed during production
    }
  });

  const exampleModal = document.getElementById("exampleModal");
  exampleModal.addEventListener("click", () => {
    isInfoModalHidden = !isInfoModalHidden;
    if (isInfoModalHidden) {
      modal.hide();
      console.log("you clicked outside!"); // will be removed during production
    }
    isInfoModalHidden = false;
  });

  const weatherScreen = document.getElementsByClassName(
    "modal-content shadow"
  )[1];
  weatherScreen.addEventListener("click", () => {
    isInfoModalHidden = !isInfoModalHidden;
    if (isInfoModalHidden) {
      console.log("you clicked on the modal!"); // will be removed during production
    }
  });

  const weatherModal = document.getElementById("weatherModal");
  weatherModal.addEventListener("click", () => {
    isInfoModalHidden = !isInfoModalHidden;
    if (isInfoModalHidden) {
      modal.hide();
      console.log("you clicked outside!"); // will be removed during production
    }
    isInfoModalHidden = false;
  });

  const wikiScreen = document.getElementsByClassName("modal-content shadow")[2];
  wikiScreen.addEventListener("click", () => {
    isInfoModalHidden = !isInfoModalHidden;
    if (isInfoModalHidden) {
      console.log("you clicked on the modal!"); // will be removed during production
    }
  });

  const wikiModal = document.getElementById("wikiModal");
  wikiModal.addEventListener("click", () => {
    isInfoModalHidden = !isInfoModalHidden;
    if (isInfoModalHidden) {
      modal.hide();
      console.log("you clicked outside!"); // will be removed during production
    }
    isInfoModalHidden = false;
  });

  const newsScreen = document.getElementsByClassName("modal-content shadow")[3];
  newsScreen.addEventListener("click", () => {
    isInfoModalHidden = !isInfoModalHidden;
    if (isInfoModalHidden) {
      console.log("you clicked on the modal!"); // will be removed during production
    }
  });

  const newsModal = document.getElementById("newsModal");
  newsModal.addEventListener("click", () => {
    isInfoModalHidden = !isInfoModalHidden;
    if (isInfoModalHidden) {
      modal.hide();
      console.log("you clicked outside!"); // will be removed during production
    }
    isInfoModalHidden = false;
  });

  const covidScreen = document.getElementsByClassName(
    "modal-content shadow"
  )[4];
  covidScreen.addEventListener("click", () => {
    isInfoModalHidden = !isInfoModalHidden;
    if (isInfoModalHidden) {
      console.log("you clicked on the modal!"); // will be removed during production
    }
  });

  const covidModal = document.getElementById("covidModal");
  covidModal.addEventListener("click", () => {
    isInfoModalHidden = !isInfoModalHidden;
    if (isInfoModalHidden) {
      modal.hide();
      console.log("you clicked outside!"); // will be removed during production
    }
    isInfoModalHidden = false;
  });

  countrySelect.addEventListener("change", async (e) => {
    resetCurrentLocation();
    if (countrySelect.value !== "") {
      const countryArray = e.target.value.split(", ");
      countryCode = countryArray[0];
      const countryId = await countryCodeToGeonameId(countryCode);
      const selectedCountry = countryArray[1];
      resetAllFields();
      setupInterface(countryCode);
      await retrieveStates(countryId, currentStateName);
      retrieveWiki(selectedCountry);
      fetchMarkerData(layerControl, countryCode, map);
    }
  });

  stateSelect.addEventListener("change", async (e) => {
    const coordArray = e.target.value.split(", ");
    const siso2 = coordArray[0];
    const lat = coordArray[1];
    const long = coordArray[2];
    resetCurrentLocation();
    resetWeatherData();
    resetCityData();
    const isoData = await retrieveCities(
      countryCode,
      siso2,
      citySelect,
      currentCityName
    );
    if (isoData) {
      retrieveWeatherInfo(lat, long);
    }
  });

  citySelect.addEventListener("change", (e) => {
    const coordArray = e.target.value.split(",");
    const lat = parseFloat(coordArray[0]);
    const long = parseFloat(coordArray[1]);
    resetWeatherData();
    retrieveWeatherInfo(lat, long);
  });
});
