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
    "continentName",
    "exchangeRate",
  ]);
};

export const resetWeatherData = () => {
  resetInnertext([
    "date",
    "time_zone",
    "description",
    "temperature",
    "feels_like",
    "humidity",
    "wind_direction",
    "wind_speed",
    // "summary",
  ]);
};

export const resetWikiData = () => {
  resetInnertext(["wikiTitle", "wikiSummary", "wikiLink", "wikiImage"]);
};

export const resetNewsData = () => {
  const newsList = document.getElementById("newsList");
  newsList.innerHTML = "";
  const headerRow = document.createElement("tr");
  headerRow.innerHTML = `
          <th>Title</th>
          <th>Author</th>
          <th>Date</th>
      `;
  newsList.appendChild(headerRow);
};

export const resetAllFields = () => {
  resetOverview();
  resetWeatherData();
  resetWikiData();
  resetNewsData();
};
