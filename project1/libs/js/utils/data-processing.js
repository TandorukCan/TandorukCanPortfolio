export const resetInnertext = (elements) => {
  elements.forEach((element) => {
    document.getElementById(element).innerText = "";
  });
};

export const resetOverview = () => {
  resetInnertext([
    "currencyCode",
    "population",
    "countryName",
    "capital",
    "countryCode",
    "areaInSqKm",
    "language",
    "north",
    "east",
    "south",
    "west",
    "continentName",
    "exchangeRate",
  ]);
};

export const resetWeatherData = () => {
  resetInnertext([
    "date",
    "time_zone",
    "units",
    "description",
    "temperature",
    "feels_like",
    "humidity",
    "wind_direction",
    "wind_speed",
    "summary",
  ]);
};

export const resetWikiData = () => {
  resetInnertext(["wikiTitle", "wikiSummary", "wikiLink", "wikiImage"]);
};

export const resetStateData = () => {
  stateSelect.replaceChildren();
  stateSelect.appendChild(document.createElement("option")).textContent =
    "Choose A State";
};

export const resetCityData = () => {
  citySelect.replaceChildren();
  citySelect.appendChild(document.createElement("option")).textContent =
    "Choose A City";
  citySelect.classList.remove("btn-disable");
};

export const resetAllFields = () => {
  resetOverview();
  resetWeatherData();
  resetStateData();
  resetCityData();
  resetWikiData();
};
