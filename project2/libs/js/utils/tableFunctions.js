function populateTable(data) {
  $.each(data, function (index, person) {
    $("#personnelTableBody").append(`
      <tr>
        <td class="align-middle text-wrap d-md-table-cell">${
          person.lastName
        }, ${person.firstName}</td>
        <td class="align-middle text-nowrap d-lg-table-cell d-none">${
          person.jobTitle
        }</td>
        <td class="align-middle text-wrap d-md-table-cell">${
          person.department ? person.department : "has not been assigned"
        }</td>
        <td class="align-middle text-wrap d-md-table-cell"> ${
          person.location ? person.location : "has not been assigned"
        }</td>
        <td class="align-middle text-nowrap d-lg-table-cell d-none">${
          person.email
        }</td>
        <td class="align-middle text-wrap d-md-table-cell">
          <button
            type="button"
            class="btn btn-primary btn-sm"
            data-bs-toggle="modal"
            data-bs-target="#personnelModal"
            data-id="${person.id}"
          >
            <i class="fa-solid fa-pencil fa-fw"></i>
          </button>
          <button
            type="button"
            class="btn btn-primary btn-sm"
            id="deletePersonnelButton"
            data-id="${person.id}"
          >
            <i class="fa-solid fa-trash fa-fw"></i>
          </button>
        </td>
      </tr>
  `);
  });
}

function loadPersonnelTable(searchTerm) {
  if (searchTerm || searchTerm === "refresh") {
    if (searchTerm === "refresh") {
      $("#searchInp").val("");
      resetFilterTable();
    }
    $("#personnelTableBody")
      .empty()
      .append(`<div id="personnelLoader" style="display: none;"></div>`);

    if (!$("#mainLoader").is(":visible")) {
      $("#personnelLoader").show();
    }
  } else {
    $("#crudLoader").show();
    $("#personnelTableBody").empty();
  }

  if (searchTerm && searchTerm !== "refresh") {
    // table will be populated based on search term
    populateTable(searchTerm);
    $("#personnelLoader").hide();
  } else {
    $.ajax({
      url: "./libs/php/getAll.php",
      type: "GET",
      dataType: "json",
      success: function (result) {
        var resultCode = result.status.code;

        if (resultCode == 200) {
          // Update the hidden input with the employee id so that
          // it can be referenced when the form is submitted
          populateTable(result.data);
          if (searchTerm === "refresh") {
            if ($("#mainLoader").is(":visible")) {
              $("#mainLoader").hide();
            } else {
              $("#personnelLoader").hide();
            }
          } else {
            $("#crudLoader").hide();
          }
        } else {
          // Show error modal with message
          showError(result.status.description);
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        handleError("#personnelModal", errorThrown);
      },
    });
  }
}

function loadDepartmentsTable(refresh) {
  // Clear any existing rows in the table body and add a loader
  if (refresh) {
    $("#departmentTableBody")
      .empty()
      .append(`<div id="departmentLoader"></div>`);
  } else {
    $("#crudLoader").show();
    $("#departmentTableBody").empty();
  }

  $.ajax({
    url: "./libs/php/getAllDepartments.php",
    type: "GET",
    dataType: "json",
    success: function (result) {
      var resultCode = result.status.code;

      if (resultCode == 200) {
        // Update the hidden input with the employee id so that
        // it can be referenced when the form is submitted
        $.each(result.data, function (index, department) {
          $("#departmentTableBody").append(`
              <tr>
              <td class="align-middle text-wrap">${department.name}</td>
              <td class="align-middle text-wrap d-md-table-cell">${
                department.locationName
                  ? department.locationName
                  : "has not been assigned"
              }</td>
              <td class="align-middle text-end text-nowrap">
                <button
                  type="button"
                  class="btn btn-primary btn-sm"
                  data-bs-toggle="modal"
                  data-bs-target="#departmentModal"
                  data-id="${department.id}"
                >
                  <i class="fa-solid fa-pencil fa-fw"></i>
                </button>
                <button
                  type="button"
                  class="btn btn-primary btn-sm"
                  id="deleteDepartmentButton"
                  data-id="${department.id}"
                >
                  <i class="fa-solid fa-trash fa-fw"></i>
                </button>
              </td>
            </tr>
          `);
          if (refresh) {
            $("#departmentLoader").hide();
          } else {
            $("#crudLoader").hide();
          }
        });
      } else {
        // Show error modal with message
        showError(result.status.description);
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      handleError("#departmentModal", errorThrown);
    },
  });
}

function loadLocationsTable(refresh) {
  // Clear any existing rows in the table body and add a loader
  if (refresh) {
    $("#locationTableBody").empty().append(`<div id="locationLoader"></div>`);
  } else {
    $("#crudLoader").show();
    $("#locationTableBody").empty();
  }

  $.ajax({
    url: "./libs/php/getAllLocations.php",
    type: "GET",
    dataType: "json",
    success: function (result) {
      var resultCode = result.status.code;

      if (resultCode == 200) {
        // Update the hidden input with the employee id so that
        // it can be referenced when the form is submitted

        $.each(result.data, function (index, location) {
          $("#locationTableBody").append(`
              <tr>
              <td class="align-middle text-nowrap">${location.name}</td>
              <td class="align-middle text-end text-nowrap">
                <button
                  type="button"
                  class="btn btn-primary btn-sm"
                  data-bs-toggle="modal"
                  data-bs-target="#locationModal"
                  data-id="${location.id}"
                >
                  <i class="fa-solid fa-pencil fa-fw"></i>
                </button>
                <button
                  type="button"
                  class="btn btn-primary btn-sm"
                  id="deleteLocationButton"
                  data-id="${location.id}"
                >
                  <i class="fa-solid fa-trash fa-fw"></i>
                </button>
              </td>
            </tr>
          `);
          if (refresh) {
            $("#locationLoader").hide();
          } else {
            $("#crudLoader").hide();
          }
        });
      } else {
        // Show error modal with message
        showError(result.status.description);
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      handleError("#locationModal", errorThrown);
    },
  });
}

//write a code to reset the fields in filter modal when it's class is equal to "modal fade" instead of "modal fade show"
function filterTable(input, option) {
  $("#personnelTableBody tr").each(function () {
    // If the location is "Select All", show all rows
    if (option === "showEverything") {
      $(this).show();
    } else if (option === "location") {
      // Get the text of the third <td> (index 2)
      var rowLocation = $(this).find("td:eq(3)").text().trim();

      // Check if the location matches
      if (rowLocation === input) {
        // If it matches, show the row
        $(this).show();
      } else {
        // If it doesn't match, hide the row
        $(this).hide();
      }
    } else {
      // Get the text of the third <td> (index 2)
      var rowDepartment = $(this).find("td:eq(2)").text().trim();

      // Check if the location matches
      if (rowDepartment === input) {
        // If it matches, show the row
        $(this).show();
      } else {
        // If it doesn't match, hide the row
        $(this).hide();
      }
    }
  });
}

function resetFilterTable() {
  $("#inputField").prop("disabled", true);
  $("#inputField").html("");
  $("#filterButton").removeClass("locationButton");
  $("#filterButton").removeClass("departmentButton");
  // Uncheck all radio buttons
  $("input[name='filter']").prop("checked", false);
  // Check the "Select All" radio button
  $("#selectAll").prop("checked", true);
}

export {
  loadPersonnelTable,
  loadDepartmentsTable,
  loadLocationsTable,
  filterTable,
  resetFilterTable,
};
