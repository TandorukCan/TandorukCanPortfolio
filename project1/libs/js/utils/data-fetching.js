import {
  hideElement,
  showElement,
  updateElements,
  updateIcons,
  setContinentClass,
  initialToUpperCase,
} from "../utils/utility";

const fetchGetOptions = {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
};

const camelToFlat = (camel) => {
  const flatCase = camel.replace(/([a-z])([A-Z])/g, "$1 $2");

  return flatCase.toLowerCase();
};

const formatDate = (date) => {
  let time = null;
  let transformedDate = "";

  // Split the date into its components (year, month, day and time)
  let [year, month, day] = date.split("-");
  if (day.length > 2) {
    [day, time] = day.split(" ");
  }
  // Rearrange the components to the desired format "YYYY-DD-MM"
  if (time) {
    transformedDate = `${year}-${day}-${month} ${time}`;
  } else {
    transformedDate = `${year}-${day}-${month}`;
  }
  return transformedDate;
};

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

export const retrieveNews = (articles) => {
  try {
    const newsList = document.getElementById("newsList");
    newsList.innerHTML = "";

    // Populate the table with news articles
    articles.forEach((article) => {
      if (article.image_url !== null && article.description !== null) {
        const table = document.createElement("table");
        table.classList.add("table", "table-borderless", "mb-0");

        // Limit the description to 100 characters, adding "..." if it's longer
        const truncatedDescription =
          article.description.length > 250
            ? article.description.substring(0, 250) + "..."
            : article.description;

        table.innerHTML = `
        <tr><td><h3>${article.title}</h3></td></tr>
        <tr><td><img width="100%" class="img-fluid rounded" src="${article.image_url}" alt=""></td></tr>
        <tr><td><a class="fs-6 text-black" href="${article.link}">${truncatedDescription}</a></td></tr>
        <tr><td><blockquote class="fblockquote">
        <p class="fw-light fs-6 mb-1">${article.source_name}</p>
      </blockquote></td></tr>
        `;

        newsList.appendChild(table);
        // Add the <hr> element after the table
        const hr = document.createElement("hr");
        newsList.appendChild(hr);
      }
    });
    document.getElementById("newsLoader").classList.add("fadeOut");
  } catch (error) {
    console.log(error.message);
  }
};

export const retrieveCovidStats = (stats) => {
  const covidList = document.getElementById("covidList");
  covidList.innerHTML = "";
  try {
    for (let i = 0; i < Object.keys(stats).length; i++) {
      if (
        Object.keys(stats)[i] !== "country" &&
        Object.keys(stats)[i] !== "countryInfo"
      ) {
        if (Object.keys(stats)[i] === "updated") {
          var milliseconds = stats[Object.keys(stats)[i]];
          var date = new Date(milliseconds);
          stats[Object.keys(stats)[i]] = Date.parse(date).toString(
            "ddd, dS MMM yy, HH:mm:ss tt"
          );
        }
        const tr = document.createElement("tr");
        const td = camelToFlat(initialToUpperCase(Object.keys(stats)[i]));

        tr.innerHTML = `
          <td>${td[0].toUpperCase() + td.slice(1)}</td>
          <td>${
            isNaN(stats[Object.keys(stats)[i]])
              ? stats[Object.keys(stats)[i]]
              : parseInt(stats[Object.keys(stats)[i]]).toLocaleString()
          }</td>

      `;
        covidList.appendChild(tr);
      }
    }
    document.getElementById("covidLoader").classList.add("fadeOut");
  } catch (error) {
    console.log(error.message);
  }
};

export const retrieveOverview = (json) => {
  hideElement("flag");

  try {
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
    document.getElementById("overviewLoader").classList.add("fadeOut");
  } catch (error) {
    console.log(error.message);
  }
};

export const retrieveWeather = (json) => {
  try {
    const date = formatDate(json.location.localtime);
    const description = json.current.condition.text;
    const todayIcon = json.current.condition.icon;
    const temperature = json.current.temp_c;
    const todayMinTemp = json.forecast.forecastday[0].day.mintemp_c;
    const todayMaxTemp = json.forecast.forecastday[0].day.maxtemp_c;
    const capital =
      "Weather Forecast For " +
      json.location.name +
      ", " +
      json.location.country;
    const day1Date = formatDate(json.forecast.forecastday[1].date);
    const day2Date = formatDate(json.forecast.forecastday[2].date);
    const day1MaxTemp = json.forecast.forecastday[1].day.maxtemp_c;
    const day2MaxTemp = json.forecast.forecastday[2].day.maxtemp_c;
    const day1MinTemp = json.forecast.forecastday[1].day.mintemp_c;
    const day2MinTemp = json.forecast.forecastday[2].day.mintemp_c;
    const day1Icon = json.forecast.forecastday[1].day.condition.icon;
    const day2Icon = json.forecast.forecastday[2].day.condition.icon;
    const day1AvgTemp = json.forecast.forecastday[1].day.avgtemp_c;
    const day2AvgTemp = json.forecast.forecastday[2].day.avgtemp_c;

    const elementsToUpdate = [
      {
        id: "todaysDate",
        value: Date.parse(date).toString("HH:mm ddd, dS MMM"),
      },
      {
        id: "day1Date",
        value: Date.parse(day1Date).toString("ddd, dS MMM"),
      },
      {
        id: "day2Date",
        value: Date.parse(day2Date).toString("ddd, dS MMM"),
      },
      { id: "todayConditions", value: description },
      { id: "todayMinTemp", value: todayMinTemp },
      { id: "todayMaxTemp", value: todayMaxTemp },
      { id: "day1MaxTemp", value: day1MaxTemp },
      { id: "day2MaxTemp", value: day2MaxTemp },
      { id: "day1MinTemp", value: day1MinTemp },
      { id: "day2MinTemp", value: day2MinTemp },
      { id: "day1AvgTemp", value: day1AvgTemp },
      { id: "day2AvgTemp", value: day2AvgTemp },
      { id: "temperature", value: temperature },
      { id: "weatherModalLabel", value: capital },
    ];

    const iconsToUpdate = [
      { id: "todayIcon", value: todayIcon },
      { id: "day1Icon", value: day1Icon },
      { id: "day2Icon", value: day2Icon },
    ];

    updateElements(elementsToUpdate);
    updateIcons(iconsToUpdate);

    document.getElementById("weatherloader").classList.add("fadeOut");
  } catch (error) {
    console.log(error.message);
  }
};

export const retrieveWiki = async (country) => {
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
    document.getElementById("wikiLoader").classList.add("fadeOut");
  } catch (error) {
    console.log(error.message);
  }
};

export async function retrieveCountryCode(latitude, longitude) {
  const url = `libs/php/retrieveCountryCode.php?lat=${encodeURIComponent(
    latitude
  )}&lng=${encodeURIComponent(longitude)}`;

  try {
    const response = await fetch(url, fetchGetOptions);
    const json = await response.json();
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    return {
      countryCode: json.countryCode,
    };
  } catch (error) {
    console.log(error.message);
  }
}

export async function getLocationCoordinates(countryCode) {
  try {
    const response = await fetch(
      `libs/php/retrieveCountryBorders.php?countryCode=${encodeURIComponent(
        countryCode
      )}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(error.message);
  }
}

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
        1 / parseFloat(data.conversion_rates[currency])
      ).toFixed(3)} $`;
    })
    .catch((error) => {
      console.log(error);
    });
};
