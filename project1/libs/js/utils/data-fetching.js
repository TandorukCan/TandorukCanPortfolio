import {
  hideElement,
  showElement,
  updateElements,
  setContinentClass,
  initialToUpperCase,
} from "../utils/utility";

const fetchGetOptions = {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
};

export async function getLocationCoordinates(countryCode) {
  const url = "libs/countryBorders.geo.json";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const countries = await response.json();
    const selectedCountry = countries.features.filter((country) => {
      return country.properties.iso_a2 === countryCode;
    });
    return selectedCountry;
  } catch (error) {
    console.error(error.message);
  }
}

export const retrieveFlag = (iso2) => {
  if (iso2 === "XK") {
    document.getElementById("flag").src =
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Flag_of_Kosovo.svg/90px-Flag_of_Kosovo.svg.png";
    return;
  } else if (iso2 === "CY-TCC") {
    document.getElementById("flag").src =
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Flag_of_the_Turkish_Republic_of_Northern_Cyprus.svg/90px-Flag_of_the_Turkish_Republic_of_Northern_Cyprus.svg.png";
    return;
  } else if (iso2 === "SOA") {
    document.getElementById("flag").src =
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Flag_of_Somaliland.svg/128px-Flag_of_Somaliland.svg.png";
    return;
  }

  document.getElementById(
    "flag"
  ).src = `https://flagsapi.com/${iso2}/flat/64.png`;
};

export const setExchangeRate = (currency) => {
  fetch(`libs/php/retrieveExchangeRate.php`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      document.getElementById("exchangeRate").innerText = `${(
        1 / parseFloat(data.rates[currency])
      ).toFixed(3)} $`;
    })
    .catch((error) => {
      console.log(error);
    });
};

export async function retrieveGeoInfo(latitude, longitude) {
  const url = `libs/php/retrieveWeatherReverseGeo.php?lat=${encodeURIComponent(
    latitude
  )}&lon=${encodeURIComponent(longitude)}`;

  const url2 = `libs/php/findNearbyPlaceName.php?lat=${encodeURIComponent(
    latitude
  )}&lng=${encodeURIComponent(longitude)}`;

  try {
    const response = await fetch(url, fetchGetOptions);
    const json = await response.json();
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const response2 = await fetch(url2, fetchGetOptions);
    const json2 = await response2.json();
    if (!response2.ok) {
      throw new Error(`Response status: ${response2.status}`);
    }
    return {
      cityName: json.name,
      stateCode: json2.adminCode1,
      countryCode: json2.countryCode,
      countryId: json2.countryId,
    };
  } catch (error) {
    console.log(error.message);
  }
}

export const retrieveWeatherInfo = async (lat, lon) => {
  if (lat === undefined || lon === undefined) {
    return;
  }

  const url = `libs/php/retrieveWeatherInfo.php?lat=${encodeURIComponent(
    lat
  )}&lon=${encodeURIComponent(lon)}`;

  const url2 = `libs/php/retrieveWeatherSummary.php?lat=${encodeURIComponent(
    lat
  )}&lon=${encodeURIComponent(lon)}`;

  try {
    showElement("preloader");
    const response = await fetch(url, fetchGetOptions);
    const response2 = await fetch(url2, fetchGetOptions);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    if (!response2.ok) {
      throw new Error(`Response status: ${response2.status}`);
    }
    const json = await response.json();
    const json2 = await response2.json();
    hideElement("preloader");

    const date = json2.date;
    const time_zone = "GMT " + json2.tz;
    const units = json2.units;
    const description = json.weather[0].description;
    const temperature = json.main.temp + " °";
    const feels_like = json.main.feels_like + " °";
    const humidity = "% " + json.main.humidity;
    const wind_direction = json.wind.deg + " °";
    const wind_speed = json.wind.speed + " meter/sec";
    const summary = json2.weather_overview;

    const elementsToUpdate = [
      { id: "date", value: date },
      { id: "time_zone", value: time_zone },
      { id: "units", value: units },
      { id: "description", value: description },
      { id: "temperature", value: temperature },
      { id: "feels_like", value: feels_like },
      { id: "humidity", value: humidity },
      { id: "wind_direction", value: wind_direction },
      { id: "wind_speed", value: wind_speed },
      { id: "summary", value: summary },
    ];

    updateElements(elementsToUpdate);

    return json;
  } catch (error) {
    console.log(error.message);
  }
};

export const retrieveCities = async (iso2, siso2, element, cityname) => {
  //last parameter is optional, for when the geodata is retrieved for the first time
  showElement("preloader");
  element.classList.add("btn-disable");
  try {
    const response = await fetch(
      `libs/php/retrieveCities.php?iso2=${encodeURIComponent(
        iso2
      )}&siso2=${encodeURIComponent(siso2)}`,
      fetchGetOptions
    );
    const cities = await response.json();
    element.classList.remove("btn-disable");
    if (cities.length === 0) {
      console.log("no city available");
      element.replaceChildren();
      element.innerHTML = `<option value="">No City Available</option>`;
      element.classList.add("btn-disable");
      return {
        iso2: iso2,
        siso2: siso2,
      };
      // retrieveStateGeoLocation(iso2, siso2);
    } else {
      cities.forEach((city) => {
        hideElement("preloader");
        const option = document.createElement("option");
        option.value = `${city.latitude}, ${city.longitude}, ${city.name}`;
        option.textContent = city.name;
        if (city.name == cityname) {
          option.selected = true;
        }
        element.appendChild(option);
      });
    }
  } catch (error) {
    console.error(error.message);
  }
};

export const retrieveWiki = async (country) => {
  hideElement("wikiLink");
  hideElement("wikiImage");
  showElement("wikiLoader");

  const url = `libs/php/wikipediaSearch.php?country=${encodeURIComponent(
    country
  )}`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();
    showElement("wikiLink");
    showElement("wikiImage");
    hideElement("wikiLoader");
    const detailsArray = json;
    const selectedDetail = detailsArray.filter((detail) => {
      return detail.title === country;
    });
    document.getElementById("wikiSummary").innerText =
      selectedDetail[0].summary;

    document.getElementById("wikiLink").href =
      "https://" + selectedDetail[0].wikipediaUrl;

    document.getElementById("wikiLink").innerText =
      "This will take you to the wikipedia page of the selected country";

    if (country === "Kosovo") {
      document.getElementById("wikiImage").src =
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Qendra_historike_e_Prizrenitaa.jpg/220px-Qendra_historike_e_Prizrenitaa.jpg";
    } else if (country === "Somaliland") {
      document.getElementById("wikiImage").src =
        "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Naasa_Hablood_-_Virgin%27s_Breast_Mountain%2C_Hargeisa%2C_Somalilanad.jpg/220px-Naasa_Hablood_-_Virgin%27s_Breast_Mountain%2C_Hargeisa%2C_Somalilanad.jpg";
    } else {
      document.getElementById("wikiImage").src = selectedDetail[0].thumbnailImg;
    }
    document.getElementById("wikiTitle").innerText = selectedDetail[0].title;
  } catch (error) {
    console.log(error.message);
  }
};

export const retrieveNews = async (country) => {
  showElement("newsLoader");

  const url = `libs/php/retrieveNews.php?country=${encodeURIComponent(
    country
  )}`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const articles = await response.json();
    hideElement("newsLoader");
    const newsList = document.getElementById("newsList");

    if (newsList.children.length === 0) {
      // Create a table header
      const headerRow = document.createElement("tr");
      headerRow.innerHTML = `
            <th>Title</th>
            <th>Author</th>
            <th>Date</th>
        `;
      newsList.appendChild(headerRow);
    }

    // Populate the table with news articles
    articles.forEach((article) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
          <td class="text-left"><a href="${article.url}" target="_blank">${
        article.title
      }</a></td>
          <td>${article.author || "Unknown"}</td>
          <td>${new Date(article.publishedAt).toLocaleDateString()}</td>
      `;
      newsList.appendChild(tr);
    });
  } catch (error) {
    console.log(error.message);
  }
};

export const retrieveCovidStats = async (country) => {
  showElement("covidLoader");
  const covidList = document.getElementById("covidList");
  covidList.innerHTML = "";

  const url = `libs/php/retrieveCovidStats.php?country=${encodeURIComponent(
    country
  )}`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const stats = await response.json();
    hideElement("covidLoader");
    for (let i = 0; i < Object.keys(stats).length; i++) {
      if (
        Object.keys(stats)[i] !== "country" &&
        Object.keys(stats)[i] !== "countryInfo"
      ) {
        if (Object.keys(stats)[i] === "updated") {
          var milliseconds = stats[Object.keys(stats)[i]];
          var date = new Date(milliseconds);
          stats[Object.keys(stats)[i]] = date.toString();
        }
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${initialToUpperCase(Object.keys(stats)[i])}</td>
          <td>${
            isNaN(stats[Object.keys(stats)[i]])
              ? stats[Object.keys(stats)[i]]
              : parseInt(stats[Object.keys(stats)[i]]).toLocaleString()
          }</td>

      `;
        covidList.appendChild(tr);
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

export async function retrieveStates(countryId, currentStateName, ciso2) {
  //last parameter is optional, for when the geodata is retrieved for the first time
  showElement("preloader");
  stateSelect.classList.add("btn-disable");

  try {
    const response = await fetch(
      `libs/php/children.php?geonameId=${encodeURIComponent(countryId)}`,
      fetchGetOptions
    );
    const states = await response.json();
    hideElement("preloader");
    stateSelect.classList.remove("btn-disable");

    const selectedState = states.filter((state) => {
      return state.adminCode1 === ciso2;
    });

    if (selectedState.length !== 0) {
      currentStateName = selectedState[0].adminName1;
    }

    let statesArray = []; // creating a state names array to be sorted alphabetically
    let statesObject = {}; // creating an object to match state names and state codes

    states.forEach((state) => {
      statesArray.push(state.adminName1);
      statesObject[state.adminName1] =
        state.adminCode1 + ", " + state.lat + ", " + state.lng;
    });
    statesArray.sort();
    statesArray.forEach((state) => {
      const option = document.createElement("option");
      option.value = `${statesObject[state]}`;
      option.textContent = state;
      if (state === currentStateName) {
        option.selected = true;
      }
      stateSelect.appendChild(option);
    });

    return statesObject; // Ensure this is returned
  } catch (error) {
    console.log("error", error);
    hideElement("preloader");
    stateSelect.classList.remove("btn-disable");
    return {}; // Return an empty object in case of error
  }
}

export const retrieveOverview = async (countryCode) => {
  showElement("overviewLoader");
  hideElement("flag");

  const url = `libs/php/retrieveOverview.php?country=${encodeURIComponent(
    countryCode
  )}`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const json = await response.json();
    hideElement("overviewLoader");
    showElement("flag");

    const {
      currencyCode,
      population,
      countryName,
      capital,
      countryCode,
      areaInSqKm,
      continentName,
    } = json;

    let languages = json.languages;
    setExchangeRate(currencyCode);

    if (languages.includes(",")) {
      languages = json.languages.substring(0, json.languages.indexOf(","));
    }
    const languageNames = new Intl.DisplayNames(["en"], {
      type: "language",
    });

    const language = languageNames.of(languages);
    // .substring(0, languageNames.of(lang).indexOf(" "));

    const elementsToUpdate = [
      { id: "currencyCode", value: currencyCode },
      {
        id: "population",
        value: parseInt(population).toLocaleString(),
      },
      { id: "countryName", value: countryName },
      { id: "capital", value: capital },
      { id: "countryCode", value: countryCode },
      {
        id: "areaInSqKm",
        value: parseFloat(areaInSqKm).toLocaleString() + " km²",
      },
      { id: "language", value: language },
      { id: "continentName", value: continentName },
    ];

    updateElements(elementsToUpdate);
    setContinentClass(continentName);

    return json;
  } catch (error) {
    console.log(error.message);
  }
};

export const countryCodeToGeonameId = async (countryCode) => {
  const url = `libs/php/retrieveOverview.php?country=${encodeURIComponent(
    countryCode
  )}`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const json = await response.json();
    console.log(json);
    const { geonameId } = json;
    return geonameId;
    //return capital for later use
  } catch (error) {
    console.log(error.message);
  }
};
