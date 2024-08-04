export const hideElement = (element) => {
  document.getElementById(element).style.display = "none";
};

export const showElement = (element) => {
  document.getElementById(element).style.display = "block";
};

export const updateElements = (elements) => {
  elements.forEach((element) => {
    document.getElementById(element.id).innerText = element.value;
  });
};

export const setContinentClass = (continentName) => {
  if (continentName === "Asia") {
    document.getElementById("contClass").className =
      "fa-solid fa-xl text-success fa-earth-asia";
  } else if (continentName === "Europe") {
    document.getElementById("contClass").className =
      "fa-solid fa-xl text-success fa-earth-europe";
  } else if (
    continentName === "North America" ||
    continentName === "South America"
  ) {
    document.getElementById("contClass").className =
      "fa-solid fa-xl text-success fa-earth-americas";
  } else if (continentName === "Africa") {
    document.getElementById("contClass").className =
      "fa-solid fa-xl text-success fa-earth-africa";
  } else if (continentName === "Oceania") {
    document.getElementById("contClass").className =
      "fa-solid fa-xl text-success fa-earth-oceania";
  } else {
    document.getElementById("contClass").className =
      "fa-solid fa-xl text-success fa-globe";
  }
};
