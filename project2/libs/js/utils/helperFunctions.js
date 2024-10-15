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
const debouncedSearch = debounce(function (url, func, filter) {
  var searchTerm = $("#searchInp").val().trim();
  let data;
  if (filter) {
    data = {
      txt: $("#searchInp").val().trim(),
      filter: filter, // 'All', 'department', or 'location'
    };

    if (filter === "department") {
      data.input = $("#filterPersonnelByDepartment option:selected").text();
    } else if (filter === "location") {
      data.input = $("#filterPersonnelByLocation option:selected").text();
    }
  } else {
    data = {
      txt: $("#searchInp").val().trim(),
    };
  }
  // Get the search term

  $.ajax({
    url: url,
    type: "GET",
    dataType: "json",
    data: data,
    success: function (response) {
      if (response.status.code == 200) {
        // Update the table with the search results
        func(response.data.found);
      } else {
        // Show error modal with message
        showError(response.status.message);
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      showError(textStatus, errorThrown);
    },
  });
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
        if (
          selectId === "#filterPersonnelByLocation" ||
          selectId === "#filterPersonnelByDepartment"
        ) {
          $(selectId).append(
            $("<option>", {
              value: 0,
              text: "All",
            })
          );
        }
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
