// the basis of this file has been taken from the following url: https://codepen.io/itcareerswitch/pen/QWVrEdJ/8b40d6264700edb85b66a0ee03a2bc2a
// it has then been adjusted to work with Bootsrap 5, so changes has been made, such as removing the jquery requests.
// ---------------------------------------------------------
// GLOBAL DECLARATIONS
// ---------------------------------------------------------

// import { resetAllFields } from "./utils/data-processing.js";

// import { hideElement, showElement } from "./utils/utility.js";

import {
  retrieveFlag,
  retrieveNews,
  retrieveCovidStats,
  retrieveOverview,
  retrieveWeather,
  retrieveCountryCode,
  retrieveWiki,
  getLocationCoordinates,
} from "./utils/data-fetching.js";

import fetchMarkerData from "./utils/markers.js";

let hasTouchScreen = false;
let isOpen = false;
let map;
let latitude;
let longitude;
const countrySelect = document.getElementById("countrySelect");
let countryFeatures;

let geojsonLayer;
const overlayMaps = {};

let countryCode;
let modal; // will be removed if necessary
let isInfoModalHidden = false;

// Functions start here

const closeWhenClickedOutsideModal = (modalName, modalNumber) => {
  const screen = document.getElementsByClassName("modal-content shadow")[
    modalNumber
  ];
  screen.addEventListener("click", () => {
    isInfoModalHidden = !isInfoModalHidden;
    if (isInfoModalHidden) {
      // console.log("you clicked on the modal!"); // will be removed during production
    }
  });

  const exampleModal = document.getElementById(modalName);
  exampleModal.addEventListener("click", () => {
    isInfoModalHidden = !isInfoModalHidden;
    if (isInfoModalHidden) {
      modal.hide();
      // console.log("you clicked outside!"); // will be removed during production
    }
    isInfoModalHidden = false;
  });
};

const setupInterface = async (countryCode, layerControl, map, fly) => {
  try {
    await drawCountryBorder(countryCode, layerControl, map, fly); // Drawing user's country by calling drawCountryBorder function
    const response = await fetch(
      `libs/php/retrieveModals.php?country=${countryCode}`
    );
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const data = await response.json();

    retrieveFlag(countryCode);
    // console.log(data.data.news); // Access news articles
    retrieveNews(data.data.news);
    retrieveCovidStats(data.data.covidStats);
    retrieveOverview(data.data.overview);
    // console.log(data.data.weather); // Access weather data
    retrieveWeather(data.data.weather);

    document.getElementById("mainLoader").classList.add("fadeOut");
  } catch (error) {
    console.error("Error:", error);
  }
};

const createCountryDropdown = async (iso2) => {
  let selectedCountry;

  try {
    const response = await fetch("libs/php/retrieveCountryBorders.php");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const countries = data.data;
    // Populate the dropdown with sorted country names
    countries.forEach((country) => {
      if (country.iso_a2 === iso2) {
        selectedCountry = country.name;
      }
      const option = document.createElement("option");
      option.value = `${country.iso_a2}, ${country.name}`;
      option.text = country.name;
      if (country.iso_a2 === iso2) {
        option.selected = true;
      }
      countrySelect.appendChild(option);
    });
    return selectedCountry;
  } catch (error) {
    console.error("Fetch Error:", error);
    const errorMessage = document.getElementById("errorMessage");
    if (error.message.includes("400")) {
      errorMessage.textContent =
        "Bad request. Please check your input parameters.";
    } else if (error.message.includes("500")) {
      errorMessage.textContent =
        "Internal server error. Please try again later.";
    } else {
      errorMessage.textContent =
        "An error occurred while fetching country information.";
    }

    const errorModalElement = document.getElementById("errorModal");
    const errorModal = new bootstrap.Modal(errorModalElement);
    errorModal.show();
  }
};

//creating a promise for geolocation API because it takes some time to get the data from the user
const getLocationPromise = () => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve(position); // Successfully retrieved position
      },
      (error) => {
        console.error(`Geolocation error: ${error.message}`);
        reject(error); // Handle geolocation error
      },
      {
        timeout: 10000, // Optional: Set a timeout (in milliseconds)
        maximumAge: 60000, // Optional: Use cached position for up to 1 minute
        enableHighAccuracy: true, // Optional: Request high-accuracy position
      }
    );
  });
};

async function drawCountryBorder(countryCode, layerControl, map, fly) {
  try {
    if (geojsonLayer) {
      geojsonLayer.clearLayers();
    }
    countryFeatures = await getLocationCoordinates(countryCode);
    // drawing the country borders based on the coordinates received
    geojsonLayer = L.geoJSON(countryFeatures, {
      fillColor: "#fff",
      color: "#000",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.3,
    });

    if (fly) {
      map.eachLayer((layer) => {
        if (layer !== streets && layer !== satellite) {
          map.removeLayer(layer);
        }
      });
      document.getElementById("wikiLoader").classList.remove("fadeOut");
      map.flyToBounds(geojsonLayer.getBounds(), { duration: 2.5 }); //trying this instead of map.flyTo
      await fetchMarkerData(layerControl, countryCode, map);
      geojsonLayer.addTo(map);
    } else {
      map.fitBounds(geojsonLayer.getBounds());
      await fetchMarkerData(layerControl, countryCode, map);
      geojsonLayer.addTo(map);
    }
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

const createModalButton = (iconClass, modalId) => {
  return L.easyButton(iconClass, (btn, map) => {
    const modalElement = document.getElementById(modalId);
    modal = new bootstrap.Modal(modalElement);
    modal.show();
  });
};

const infoBtn = createModalButton("fa-info fa-xl", "infoModal");
const weatherBtn = createModalButton("fa-umbrella fa-xl", "weatherModal");
const wikiBtn = createModalButton(
  "fa-brands fa-wikipedia-w fa-xl",
  "wikiModal"
);
const newsBtn = createModalButton("fa-solid fa-newspaper fa-xl", "newsModal");
const covidBtn = createModalButton(
  "fa-solid fa-virus-covid fa-xl",
  "covidModal"
);
// ---------------------------------------------------------
// EVENT HANDLERS
// ---------------------------------------------------------

// initialise and add controls once DOM is ready

document.addEventListener("DOMContentLoaded", async () => {
  // seeing if the user has a touchscreen device
  if ("maxTouchPoints" in navigator) {
    hasTouchScreen = navigator.maxTouchPoints > 0;
  } else if ("msMaxTouchPoints" in navigator) {
    hasTouchScreen = navigator.msMaxTouchPoints > 0;
  } else {
    var mQ = window.matchMedia && matchMedia("(pointer:coarse)");
    if (mQ && mQ.media === "(pointer:coarse)") {
      hasTouchScreen = !!mQ.matches;
    } else if ("orientation" in window) {
      hasTouchScreen = true; // deprecated, but good fallback
    } else {
      // Only as a last resort, fall back to user agent sniffing
      var UA = navigator.userAgent;
      hasTouchScreen =
        /\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(UA) ||
        /\b(Android|Windows Phone|iPad|iPod)\b/i.test(UA);
    }
  }

  // showElement("mainLoader");
  try {
    const res = await getLocationPromise();
    const { coords } = res;
    // console.log(`User's location is: ${coords.latitude}, ${coords.longitude}`); //will be removed in production
    latitude = coords.latitude;
    longitude = coords.longitude;
  } catch (error) {
    console.log(`Geolocation error: ${error.message}`); // Log the specific error message
    latitude = 54.5; // Default latitude
    longitude = -4; // Default longitude
  }

  map = L.map("map", {
    layers: [streets],
  });
  const layerControl = L.control.layers(basemaps, overlayMaps).addTo(map);

  infoBtn.addTo(map);
  weatherBtn.addTo(map);
  newsBtn.addTo(map);
  covidBtn.addTo(map);
  wikiBtn.addTo(map);
  map.setView(L.latLng(latitude, longitude), 5);
  // getting the country code of the country that relates to the user's geolocation
  const data = await retrieveCountryCode(latitude, longitude); // setting up the global location variables to find the country, state and the city that the user is in when they login
  if (data) {
    countryCode = data.countryCode;
  }
  setupInterface(countryCode, layerControl, map);
  const selectedCountry = await createCountryDropdown(countryCode);
  if (selectedCountry) {
    retrieveWiki(selectedCountry);
  }

  const leafletRight = document.querySelector("div.leaflet-right");
  leafletRight.addEventListener("click", function () {
    isOpen = true;
  });

  closeWhenClickedOutsideModal("infoModal", 0);
  closeWhenClickedOutsideModal("weatherModal", 1);
  closeWhenClickedOutsideModal("wikiModal", 2);
  closeWhenClickedOutsideModal("newsModal", 3);
  closeWhenClickedOutsideModal("covidModal", 4);

  map.on("click", async (e) => {
    document.getElementById("newsLoader").classList.remove("fadeOut");
    document.getElementById("covidLoader").classList.remove("fadeOut");
    document.getElementById("overviewLoader").classList.remove("fadeOut");
    document.getElementById("weatherloader").classList.remove("fadeOut");
    document.getElementById("wikiLoader").classList.remove("fadeOut");
    const data = await retrieveCountryCode(e.latlng.lat, e.latlng.lng);
    // setting up the global location variables to find the country, state and the city that the user is in when they login
    if (data) {
      const clickedCountryCode = data.countryCode;
      if (clickedCountryCode === countryCode) {
        // console.log(
        //   "Clicked within the current country boundaries. Skipping data retrieval."
        // );
        return; // Skip the data retrieval if within the same country
      }

      if (hasTouchScreen && isOpen) {
        // console.log("Leaflet controls open, closing it first");
        isOpen = false;
        return;
      }
      countryCode = data.countryCode;
    }
    setupInterface(countryCode, layerControl, map, true);
    const selectedCountry = await createCountryDropdown(countryCode);
    if (selectedCountry) {
      retrieveWiki(selectedCountry);
    }
  });

  countrySelect.addEventListener("change", async (e) => {
    document.getElementById("mainLoader").classList.remove("fadeOut");
    if (countrySelect.value !== "") {
      const countryArray = e.target.value.split(", ");
      countryCode = countryArray[0];
      const selectedCountry = countryArray[1];
      retrieveWiki(selectedCountry);
      setupInterface(countryCode, layerControl, map);
    }
  });
});
