$(document).ready(function () {
  // Call the function to load the personnel table when the page loads
  loadPersonnelTable();
  loadLocationsTable();
  loadDepartmentsTable();

  $("input[name='filter']").change(function () {
    // Check if the "Select All" radio button is selected
    if ($("#selectAll").is(":checked")) {
      // Disable the input field
      $("#inputField").prop("disabled", true);
      $("#inputField").html("");
      $("#filterButton").removeClass("locationButton");
      $("#filterButton").removeClass("departmentButton");
      // console.log("Selected filter: none");
    } else if ($("#departments").is(":checked")) {
      // Enable the input field when other radio buttons are selected
      $("#inputField").prop("disabled", false);
      $("#filterButton").removeClass("locationButton");
      $("#filterButton").addClass("departmentButton");
      // add available departments as <options> to the <select> with the id of inputField
      addDepartmentsToFilter();
      // console.log("Selected filter: departments");
    } else {
      // Enable the input field when other radio buttons are selected
      $("#inputField").prop("disabled", false);
      $("#filterButton").removeClass("departmentButton");
      $("#filterButton").addClass("locationButton");
      // add available locations as as <options> to the <select> with the id of inputField
      addLocationsToFilter();
      // console.log("Selected filter: locations");
    }
    // var selectedValue = $("input[name='filter']:checked").val();
    // console.log("Selected filter: " + selectedValue);
  });

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
            // console.log(response);
          } else {
            alert("Error: " + response.status.description);
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          alert("AJAX error: " + textStatus + " - " + errorThrown);
        },
      });
    } else {
      // Clear the table if search term is empty
      loadPersonnelTable(); // Assuming you have a function to load the full table
    }
  }, 1000); // 1000ms delay

  $("#searchInp").on("keyup", function () {
    // Show the loader
    $("#personnelLoader").show();

    // Call the debounced search function
    debouncedSearch();
  });

  $("#refreshBtn").click(function () {
    if ($("#personnelBtn").hasClass("active")) {
      // Refresh personnel table
      // console.log("you are in personnel");
      loadPersonnelTable();
    } else {
      if ($("#departmentsBtn").hasClass("active")) {
        // console.log("you are in departments");
        loadDepartmentsTable();
        // Refresh department table
      } else {
        // Refresh location table
        // console.log("you are in locations");
        loadLocationsTable();
      }
    }
  });

  $("#filterBtn").click(function () {
    // Open a modal of your own design that allows the user to apply a filter to the personnel table on either department or location
    // console.log("filter modal is shown");
  });

  $("#addBtn").click(function () {
    // Replicate the logic of the refresh button click to open the add modal for the table that is currently on display
    if ($("#personnelBtn").hasClass("active")) {
      // Refresh personnel table
      // console.log("you are adding in personnel");
    } else {
      if ($("#departmentsBtn").hasClass("active")) {
        // console.log("you are adding in departments");
        // Refresh department table
      } else {
        // Refresh location table
        // console.log("you are adding in locations");
      }
    }
  });

  $("#personnelBtn").click(function () {
    // Call function to refresh personnel table
    $("#addBtn").attr("data-bs-target", "#editPersonnelModal");
    $("#filterBtn").show();
    $("#searchInp").show();
    // $("#filterBtn").attr("data-bs-target", "#filterPersonnelModal");
    // console.log("you clicked on personnel tab");
    // loadPersonnelTable(); // i figured doing this only once at the beginning is enough, therefore i placed it there. Might revert back if needed.
  });

  $("#departmentsBtn").click(function () {
    // Call function to refresh department table\
    $("#addBtn").attr("data-bs-target", "#editDepartmentModal");
    $("#filterBtn").hide();
    $("#searchInp").hide();
    $("#searchInp").val("");
    // $("#filterBtn").attr("data-bs-target", "#filterDepartmentModal");
    // console.log("you clicked on departments tab");
    // loadDepartmentsTable(); // i figured doing this only once at the beginning is enough, therefore i placed it there. Might revert back if needed.
  });

  $("#locationsBtn").click(function () {
    // Call function to refresh location table
    $("#addBtn").attr("data-bs-target", "#editLocationModal");
    $("#filterBtn").hide();
    $("#searchInp").hide();
    $("#searchInp").val("");
    // $("#filterBtn").attr("data-bs-target", "#filterPersonnelModal");
    // console.log("you clicked on locations tab");
    // loadLocationsTable(); // i figured doing this only once at the beginning is enough, therefore i placed it there. Might revert back if needed.
  });

  $("#editPersonnelModal").on("show.bs.modal", function (e) {
    if ($(e.relatedTarget).attr("data-id")) {
      $("#personnelTitle").text("Edit personnel");
      $.ajax({
        url: "./libs/php/getPersonnelByID.php",
        type: "POST",
        dataType: "json",
        data: {
          // Retrieve the data-id attribute from the calling button
          // see https://getbootstrap.com/docs/5.0/components/modal/#varying-modal-content
          // for the non-jQuery JavaScript alternative
          id: $(e.relatedTarget).attr("data-id"),
        },
        success: function (result) {
          // console.log($(e.relatedTarget).attr("data-id"));
          var resultCode = result.status.code;

          if (resultCode == 200) {
            // Update the hidden input with the employee id so that
            // it can be referenced when the form is submitted
            // console.log(result);

            $("#editPersonnelEmployeeID").val(result.data.personnel[0].id);

            $("#editPersonnelFirstName").val(
              result.data.personnel[0].firstName
            );
            $("#editPersonnelLastName").val(result.data.personnel[0].lastName);
            $("#editPersonnelJobTitle").val(result.data.personnel[0].jobTitle);
            $("#editPersonnelEmailAddress").val(result.data.personnel[0].email);

            $("#editPersonnelDepartment").html("");

            $.each(result.data.department, function () {
              $("#editPersonnelDepartment").append(
                $("<option>", {
                  value: this.id,
                  text: this.name,
                })
              );
            });

            $("#editPersonnelDepartment").val(
              result.data.personnel[0].departmentID
            );
          } else {
            $("#editPersonnelModal .modal-title").text("Error retrieving data");
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          $("#editPersonnelModal .modal-title").text(
            `Error retrieving data: ${errorThrown}`
          );
        },
      });
    } else {
      $("#personnelTitle").text("Add personnel");
      $("#editPersonnelEmployeeID").val("");
      $("#editPersonnelFirstName").val("");
      $("#editPersonnelLastName").val("");
      $("#editPersonnelJobTitle").val("");
      $("#editPersonnelEmailAddress").val("");
      $("#editPersonnelDepartment").html("");
      // will do an ajax request to retrieve all departments
      $.ajax({
        url: "./libs/php/getAllDepartments.php",
        type: "GET",
        dataType: "json",
        success: function (result) {
          // console.log(result);
          var resultCode = result.status.code;

          if (resultCode == 200) {
            $.each(result.data, function () {
              $("#editPersonnelDepartment").append(
                $("<option>", {
                  value: this.id,
                  text: this.name,
                })
              );
            });
          } else {
            $("#editPersonnelModal .modal-title").text("Error retrieving data");
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          $("#editPersonnelModal .modal-title").text(
            `Error retrieving data: ${errorThrown}`
          );
        },
      });
    }
  });

  // Executes when the form button with type="submit" is clicked

  $("#editPersonnelForm").on("submit", function (e) {
    // Executes when the form button with type="submit" is clicked
    // stop the default browser behviour
    e.preventDefault();

    // Gather form data into an object
    if ($("#editPersonnelEmployeeID").val()) {
      var formData = {
        id: $("#editPersonnelEmployeeID").val(),
        firstName: $("#editPersonnelFirstName").val(),
        lastName: $("#editPersonnelLastName").val(),
        jobTitle: $("#editPersonnelJobTitle").val(),
        email: $("#editPersonnelEmailAddress").val(),
        departmentID: $("#editPersonnelDepartment").val(),
      };

      // AJAX call to save form data

      $.ajax({
        url: "./libs/php/updatePersonnel.php", // PHP file to handle updating
        type: "POST",
        dataType: "json",
        data: formData,
        success: function (response) {
          if (response.status.code == 200) {
            // Success message or logic (e.g., closing the modal and refreshing the personnel list)
            alert("Personnel information updated successfully.");
            $("#editPersonnelModal").modal("hide");
            // Optionally refresh the table data
            loadPersonnelTable();
          } else {
            // Handle error response
            alert("Error: " + response.status.message);
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          // Handle AJAX error
          alert("AJAX error: " + textStatus + " - " + errorThrown);
        },
      });
    } else {
      var formData = {
        firstName: $("#editPersonnelFirstName").val(),
        lastName: $("#editPersonnelLastName").val(),
        jobTitle: $("#editPersonnelJobTitle").val(),
        email: $("#editPersonnelEmailAddress").val(),
        departmentID: $("#editPersonnelDepartment").val(),
      };

      $.ajax({
        url: "./libs/php/insertPersonnel.php",
        type: "POST",
        dataType: "json",
        data: formData,
        success: function (response) {
          if (response.status.code == 200) {
            // Success message or logic (e.g., closing the modal and refreshing the personnel list)
            $("#editPersonnelModal").modal("hide");
            alert("Personnel information added successfully.");
            // Optionally refresh the table data
            loadPersonnelTable();
          } else {
            // Handle error response
            alert("Error: " + response.status.message);
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          // Handle AJAX error
          alert("AJAX error: " + textStatus + " - " + errorThrown);
        },
      });
      // console.log("inserted personnel data");
    }
  });

  $("#editDepartmentForm").on("submit", function (e) {
    // Executes when the form button with type="submit" is clicked
    // stop the default browser behviour
    e.preventDefault();

    // Gather form data into an object

    if ($("#editDepartmentID").val()) {
      var formData = {
        id: $("#editDepartmentID").val(),
        name: $("#editDepartmentName").val(),
        locationID: $("#editLocation").val(),
      };
      // AJAX call to save form data
      $.ajax({
        url: "./libs/php/updateDepartment.php",
        type: "POST",
        dataType: "json",
        data: formData,
        success: function (response) {
          if (response.status.code == 200) {
            // Success message or logic (e.g., closing the modal and refreshing the personnel list)
            $("#editDepartmentModal").modal("hide");
            alert("Department information updated successfully.");
            // Optionally refresh the table data
            loadDepartmentsTable();
            loadPersonnelTable();
          } else {
            // Handle error response
            alert("Error: " + response.status.message);
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          // Handle AJAX error
          alert("AJAX error: " + textStatus + " - " + errorThrown);
        },
      });
      //above code will me commented in once updateDepartment.php is created
    } else {
      var formData = {
        name: $("#editDepartmentName").val(),
        locationID: $("#editLocation").val(),
      };

      $.ajax({
        url: "./libs/php/insertDepartment.php",
        type: "POST",
        dataType: "json",
        data: formData,
        success: function (response) {
          if (response.status.code == 200) {
            // Success message or logic (e.g., closing the modal and refreshing the personnel list)
            $("#editDepartmentModal").modal("hide");
            alert("Department information added successfully.");
            // Optionally refresh the table data
            loadDepartmentsTable();
          } else {
            // Handle error response
            alert("Error: " + response.status.message);
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          // Handle AJAX error
          alert("AJAX error: " + textStatus + " - " + errorThrown);
        },
      });
      //above code will me commented in once insertDepartment.php is checked and made sure to be working
    }
  });

  $("#editLocationForm").on("submit", function (e) {
    // Executes when the form button with type="submit" is clicked
    // stop the default browser behviour
    e.preventDefault();

    // Gather form data into an object

    if ($("#editLocationID").val()) {
      var formData = {
        id: $("#editLocationID").val(),
        name: $("#editLocationName").val(),
      };
      // AJAX call to save form data
      $.ajax({
        url: "./libs/php/updateLocation.php",
        type: "POST",
        dataType: "json",
        data: formData,
        success: function (response) {
          if (response.status.code == 200) {
            // Success message or logic (e.g., closing the modal and refreshing the personnel list)
            $("#editLocationModal").modal("hide");
            alert("Location information updated successfully.");
            // Optionally refresh the table data
            loadLocationsTable();
            loadDepartmentsTable();
            loadPersonnelTable();
          } else {
            // Handle error response
            alert("Error: " + response.status.message);
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          // Handle AJAX error
          alert("AJAX error: " + textStatus + " - " + errorThrown);
        },
      });
      // console.log("editing location data");
    } else {
      var formData = {
        name: $("#editLocationName").val(),
      };

      $.ajax({
        url: "./libs/php/insertLocation.php",
        type: "POST",
        dataType: "json",
        data: formData,
        success: function (response) {
          if (response.status.code == 200) {
            // Success message or logic (e.g., closing the modal and refreshing the personnel list)
            $("#editLocationModal").modal("hide");
            alert("Location information added successfully.");
            // Optionally refresh the table data
            loadLocationsTable();
          } else {
            // Handle error response
            alert("Error: " + response.status.message);
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          // Handle AJAX error
          alert("AJAX error: " + textStatus + " - " + errorThrown);
        },
      });
      // console.log("inserted location data");
    }
  });

  $(document).on("click", "#deletePersonnelButton", function () {
    // Confirm deletion
    var confirmDelete = confirm(
      "Are you sure you want to delete this personnel?"
    );

    if (confirmDelete) {
      // console.log("you clicked on delete personnel");
      // Get the personnel ID from the data-id attribute
      var personnelId = $(this).data("id");
      // console.log(personnelId);
      // Proceed with AJAX call to delete personnel
      $.ajax({
        url: "./libs/php/deletePersonnelByID.php",
        type: "POST",
        dataType: "json",
        data: { id: personnelId }, // Send personnel ID to be deleted
        success: function (response) {
          if (response.status.code == 200) {
            alert("Personnel deleted successfully.");
            // Optionally refresh personnel list or update the UI
            loadPersonnelTable();
          } else {
            alert("Error: " + response.status.message);
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          alert("AJAX error: " + textStatus + " - " + errorThrown);
        },
      });
    }
  });

  $(document).on("click", "#deleteDepartmentButton", function () {
    // Confirm deletion
    var confirmDelete = confirm(
      "Are you sure you want to delete this department?"
    );

    if (confirmDelete) {
      // console.log("you clicked on delete department");
      // Get the personnel ID from the data-id attribute
      var departmentId = $(this).data("id");
      // console.log(departmentId);
      // Proceed with AJAX call to delete department
      $.ajax({
        url: "./libs/php/deleteDepartmentByID.php", // Replace with the correct PHP file
        type: "POST",
        dataType: "json",
        data: { id: departmentId }, // Send personnel ID to be deleted
        success: function (response) {
          if (response.status.code == 200) {
            loadDepartmentsTable();
            loadPersonnelTable();
            alert("Department deleted successfully.");
            // Optionally refresh personnel list or update the UI
          } else {
            alert("Error: " + response.status.message);
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          alert("AJAX error: " + textStatus + " - " + errorThrown);
        },
      });
    }
  });

  $(document).on("click", "#deleteLocationButton", function () {
    // Confirm deletion
    var confirmDelete = confirm(
      "Are you sure you want to delete this location?"
    );

    if (confirmDelete) {
      // console.log("you clicked on delete location");
      // Get the personnel ID from the data-id attribute
      var locationId = $(this).data("id");
      // console.log(locationId);
      // Proceed with AJAX call to delete location
      $.ajax({
        url: "./libs/php/deleteLocationByID.php", // Replace with the correct PHP file
        type: "POST",
        dataType: "json",
        data: { id: locationId }, // Send personnel ID to be deleted
        success: function (response) {
          if (response.status.code == 200) {
            alert("Location deleted successfully.");
            // Optionally refresh personnel list or update the UI
            loadLocationsTable();
            loadDepartmentsTable();
            loadPersonnelTable();
          } else {
            alert("Error: " + response.status.message);
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          alert("AJAX error: " + textStatus + " - " + errorThrown);
        },
      });
    }
  });

  $(document).on("click", "#filterButton", function () {
    var filterValue = $("#inputField option:selected").text();
    if ($("#filterButton").hasClass("departmentButton")) {
      // console.log("department filter is on");
      filterTable(filterValue, "department");
    } else if ($("#filterButton").hasClass("locationButton")) {
      filterTable(filterValue, "location");
      // console.log("location filter is on");
    } else {
      filterTable(filterValue, "showEverything");
      // console.log("no filter is on");
    }
  });
});

$("#editDepartmentModal").on("show.bs.modal", function (e) {
  // getAllLocations.php is called to populate location select
  $.ajax({
    url: "./libs/php/getAllLocations.php",
    type: "GET",
    dataType: "json",
    success: function (result2) {
      var resultCode = result2.status.code;

      if (resultCode == 200) {
        $("#editLocation").html("");
        $.each(result2.data, function () {
          $("#editLocation").append(
            $("<option>", {
              value: this.id,
              text: this.name,
            })
          );
        });
      } else {
        $("#editDepartmentModal .modal-title").text("Error retrieving data");
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      $("#editDepartmentModal .modal-title").text(
        `Error retrieving data: ${errorThrown}`
      );
    },
  });

  if ($(e.relatedTarget).attr("data-id")) {
    $("#departmentTitle").text("Edit department");
    $.ajax({
      url: "./libs/php/getDepartmentByID.php",
      type: "POST",
      dataType: "json",
      data: {
        id: $(e.relatedTarget).attr("data-id"),
      },
      success: function (result) {
        var resultCode = result.status.code;

        if (resultCode == 200) {
          // Update the hidden input with the employee id so that
          // it can be referenced when the form is submitted
          $("#editDepartmentID").val(result.data[0].id);
          $("#editDepartmentName").val(result.data[0].name);
          $("#editLocation").val(result.data[0].locationID);
        } else {
          $("#editDepartmentModal .modal-title").text("Error retrieving data");
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        $("#editDepartmentModal .modal-title").text(
          `Error retrieving data: ${errorThrown}`
        );
      },
    });
  } else {
    $("#departmentTitle").text("Add department");
    $("#editDepartmentID").val("");
    $("#editDepartmentName").val("");
  }
});

$("#editLocationModal").on("show.bs.modal", function (e) {
  if ($(e.relatedTarget).attr("data-id")) {
    $("#locationTitle").text("Edit location");
    $.ajax({
      url: "./libs/php/getLocationByID.php",
      type: "POST",
      dataType: "json",
      data: {
        // Retrieve the data-id attribute from the calling button
        // see https://getbootstrap.com/docs/5.0/components/modal/#varying-modal-content
        // for the non-jQuery JavaScript alternative
        id: $(e.relatedTarget).attr("data-id"),
      },
      success: function (result) {
        // console.log($(e.relatedTarget).attr("data-id"));
        var resultCode = result.status.code;

        if (resultCode == 200) {
          // Update the hidden input with the employee id so that
          // it can be referenced when the form is submitted
          // console.log(result);

          $("#editLocationID").val(result.data[0].id);
          $("#editLocationName").val(result.data[0].name);
        } else {
          $("#editLocationModal .modal-title").text("Error retrieving data");
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        $("#editDepartmentModal .modal-title").text(
          `Error retrieving data: ${errorThrown}`
        );
      },
    });
  } else {
    $("#locationTitle").text("Add location");
    $("#editLocationName").val("");
    $("#editLocationID").val("");

    // console.log("i'm in adding mode");
  }
});

function populateTable(data) {
  // console.log(data);
  $.each(data, function (index, person) {
    $("#personnelTableBody").append(`
    <tr>
      <td class="align-middle text-nowrap">${
        person.lastName
      }, ${person.firstName}</td>
      <td class="align-middle text-nowrap d-md-table-cell">${
        person.jobTitle
      }</td>
      <td class="align-middle text-nowrap d-md-table-cell">${
        person.department ? person.department : "has not been assigned"
      }</td>
      <td class="align-middle text-nowrap d-md-table-cell"> ${
        person.location ? person.location : "has not been assigned"
      }</td>
      <td class="align-middle text-nowrap d-md-table-cell">${person.email}</td>
      <td class="text-end text-nowrap">
        <button
          type="button"
          class="btn btn-primary btn-sm"
          data-bs-toggle="modal"
          data-bs-target="#editPersonnelModal"
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
  $("#personnelTableBody")
    .empty()
    .append(`<div id="personnelLoader" style="display: none;"></div>`);

  if (!$("#mainLoader").is(":visible")) {
    $("#personnelLoader").show();
  }

  if (searchTerm) {
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
          if ($("#mainLoader").is(":visible")) {
            $("#mainLoader").hide();
          } else {
            $("#personnelLoader").hide();
          }
        } else {
          console.log("ERROR");
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        $("#editPersonnelModal .modal-title").text(
          `Error retrieving data: ${errorThrown}`
        );
      },
    });
  }
}

function loadDepartmentsTable() {
  // Clear any existing rows in the table body and add a loader
  $("#departmentTableBody").empty().append(`<div id="departmentLoader"></div>`);
  $.ajax({
    url: "./libs/php/getAllDepartments.php",
    type: "GET",
    dataType: "json",
    success: function (result) {
      // console.log(result);
      var resultCode = result.status.code;

      if (resultCode == 200) {
        // Update the hidden input with the employee id so that
        // it can be referenced when the form is submitted
        $.each(result.data, function (index, department) {
          $("#departmentTableBody").append(`
            <tr>
            <td class="align-middle text-nowrap">${department.name}</td>
            <td class="align-middle text-nowrap d-md-table-cell">${
              department.locationName
                ? department.locationName
                : "has not been assigned"
            }</td>
            <td class="align-middle text-end text-nowrap">
              <button
                type="button"
                class="btn btn-primary btn-sm"
                data-bs-toggle="modal"
                data-bs-target="#editDepartmentModal"
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
          $("#departmentLoader").hide();
        });
      } else {
        console.log("ERROR");
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      //an error modal will be created in the future and the next two lines will be replaced with a code to make the modal appear
      $("#editDepartmentModal .modal-title").text(
        `Error retrieving data: ${errorThrown}`
      );
    },
  });
}

function loadLocationsTable() {
  // Clear any existing rows in the table body and add a loader
  $("#locationTableBody").empty().append(`<div id="locationLoader"></div>`);
  $.ajax({
    url: "./libs/php/getAllLocations.php",
    type: "GET",
    dataType: "json",
    success: function (result) {
      // console.log(result);
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
                data-bs-target="#editLocationModal"
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
          $("#locationLoader").hide();
        });
      } else {
        console.log("ERROR");
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      //an error modal will be created in the future and the next two lines will be replaced with a code to make the modal appear
      $("#editLocationModal .modal-title").text(
        `Error retrieving data: ${errorThrown}`
      );
    },
  });
}

function addLocationsToFilter() {
  $.ajax({
    url: "./libs/php/getAllLocations.php",
    type: "GET",
    dataType: "json",
    success: function (result) {
      var resultCode = result.status.code;

      if (resultCode == 200) {
        $("#inputField").html("");
        $.each(result.data, function () {
          $("#inputField").append(
            $("<option>", {
              value: this.id,
              text: this.name,
            })
          );
        });
      } else {
        $("#filterModal .modal-title").text("Error retrieving data");
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      $("#filterModal .modal-title").text(
        `Error retrieving data: ${errorThrown}`
      );
    },
  });
}

function addDepartmentsToFilter() {
  $.ajax({
    url: "./libs/php/getAllDepartments.php",
    type: "GET",
    dataType: "json",
    success: function (result) {
      var resultCode = result.status.code;

      if (resultCode == 200) {
        $("#inputField").html("");
        $.each(result.data, function () {
          $("#inputField").append(
            $("<option>", {
              value: this.id,
              text: this.name,
            })
          );
        });
      } else {
        $("#filterModal .modal-title").text("Error retrieving data");
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      $("#filterModal .modal-title").text(
        `Error retrieving data: ${errorThrown}`
      );
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

function debounce(func, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}
