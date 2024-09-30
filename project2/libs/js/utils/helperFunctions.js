import { loadPersonnelTable } from "./tableFunctions.js";

function capitalizeFirstLetter(inputString) {
  return inputString
    .split(" ") // Split the string into an array of words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
    .join(" "); // Join the array back into a string
}

function debounce(func, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}

// Debounce the search function with a delay of 1000ms (1 second)
const debouncedSearch = debounce(function () {
  // Get the search term
  var searchTerm = $("#searchInp").val().trim();

  if (searchTerm.length > 0) {
    // Make AJAX request to searchAll.php
    $.ajax({
      url: "./libs/php/searchAll.php",
      type: "GET",
      dataType: "json",
      data: { txt: searchTerm },
      success: function (response) {
        if (response.status.code == 200) {
          // Update the table with the search results
          loadPersonnelTable(response.data.found);
        } else {
          // Show error modal with message
          showError(response.status.message);
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        showError(textStatus, errorThrown);
      },
    });
  } else {
    // Clear the table if search term is empty
    loadPersonnelTable("refresh"); // Assuming you have a function to load the full table
  }
}, 1500); // 1500ms delay

function handleError(modalTitle, errorThrown) {
  if (errorThrown) {
    $(`${modalTitle} .modal-title`).text(
      `Error retrieving data: ${errorThrown}`
    );
  } else {
    $(`${modalTitle} .modal-title`).text("Error retrieving data");
  }
}

function showError(textStatus, errorThrown) {
  if (errorThrown) {
    $("#errorModal .modal-body").text(
      "AJAX error: " + textStatus + " - " + errorThrown
    );
  } else {
    $("#errorModal .modal-body").text("Error: " + textStatus);
  }
  $("#errorModal").modal("show");
}

function populateSelect(url, selectId, errorModal, entityType, optionValue) {
  $.ajax({
    url: url,
    type: "GET",
    dataType: "json",
    data: {
      entityType: entityType, // Specify the type for reading
    },
    success: function (result) {
      var resultCode = result.status.code;
      if (resultCode == 200) {
        $(selectId).html("");
        $.each(result.data, function () {
          $(selectId).append(
            $("<option>", {
              value: this.id,
              text: this.name,
            })
          );
        });
        if (selectId === "#departmentLocation") {
          // optional 5th parameter
          let locationIdExists = false;
          $.each(result.data, function () {
            if (this.id == optionValue) {
              locationIdExists = true;
              return;
            }
          });
          if (locationIdExists) {
            $("#departmentLocation").val(optionValue);
          }
          $("#departmentEditLoader").hide();
        }
      } else {
        handleError(errorModal);
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      handleError(errorModal, errorThrown);
    },
  });
}

export {
  capitalizeFirstLetter,
  debouncedSearch,
  handleError,
  showError,
  populateSelect,
};
