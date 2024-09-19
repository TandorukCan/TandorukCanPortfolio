$(document).ready(function () {
  // Call the function to load the personnel table when the page loads
  loadPersonnelTable("refresh");
  loadLocationsTable("refresh");
  loadDepartmentsTable("refresh");

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
            // Show error modal with message
            $("#errorModal .modal-body").text(
              "Error: " + response.status.message
            );
            $("#errorModal").modal("show");
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          $("#errorModal .modal-body").text(
            "AJAX error: " + textStatus + " - " + errorThrown
          );
          $("#errorModal").modal("show");
        },
      });
    } else {
      // Clear the table if search term is empty
      loadPersonnelTable("refresh"); // Assuming you have a function to load the full table
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
      loadPersonnelTable("refresh");
    } else {
      if ($("#departmentsBtn").hasClass("active")) {
        // console.log("you are in departments");
        loadDepartmentsTable("refresh");
        // Refresh department table
      } else {
        // Refresh location table
        // console.log("you are in locations");
        loadLocationsTable("refresh");
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
        firstName: capitalizeFirstLetter(
          $("#editPersonnelFirstName").val().trim().toLowerCase()
        ), // Trimming, converting to lowercase, then capitalizing the first letter
        lastName: capitalizeFirstLetter(
          $("#editPersonnelLastName").val().trim().toLowerCase()
        ),
        jobTitle: capitalizeFirstLetter(
          $("#editPersonnelJobTitle").val().trim().toLowerCase()
        ),
        email: $("#editPersonnelEmailAddress").val().trim().toLowerCase(),
        departmentID: $("#editPersonnelDepartment").val(),
      };

      if (checkForDuplicateEmailForUpdate(formData.email, formData.id)) {
        console.log(formData.id);
        $("#errorModal .modal-body").text(
          "A user with the same email already exists."
        );
        $("#errorModal").modal("show");
        return;
      }

      // AJAX call to save form data

      $.ajax({
        url: "./libs/php/updatePersonnel.php", // PHP file to handle updating
        type: "POST",
        dataType: "json",
        data: formData,
        success: function (response) {
          if (response.status.code == 200) {
            $("#editPersonnelModal").modal("hide");
            loadPersonnelTable();
            $("#successModal .modal-body").text(
              "Personnel information updated successfully."
            );
            $("#successModal").modal("show");
            // Optionally refresh personnel list or update the UI
          } else {
            // Show error modal with message
            $("#errorModal .modal-body").text(
              "Error: " + response.status.message
            );
            $("#errorModal").modal("show");
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          $("#errorModal .modal-body").text(
            "AJAX error: " + textStatus + " - " + errorThrown
          );
          $("#errorModal").modal("show");
        },
      });
    } else {
      var formData = {
        firstName: capitalizeFirstLetter(
          $("#editPersonnelFirstName").val().trim().toLowerCase()
        ), // Trimming, converting to lowercase, then capitalizing the first letter
        lastName: capitalizeFirstLetter(
          $("#editPersonnelLastName").val().trim().toLowerCase()
        ),
        jobTitle: capitalizeFirstLetter(
          $("#editPersonnelJobTitle").val().trim().toLowerCase()
        ),
        email: $("#editPersonnelEmailAddress").val().trim().toLowerCase(),
        departmentID: $("#editPersonnelDepartment").val(),
      };

      if (checkForDuplicateEmailForInsertion(formData.email)) {
        $("#errorModal .modal-body").text(
          "A user with the same email already exists."
        );
        $("#errorModal").modal("show");
        return;
      }

      $.ajax({
        url: "./libs/php/insertPersonnel.php",
        type: "POST",
        dataType: "json",
        data: formData,
        success: function (response) {
          if (response.status.code == 200) {
            $("#editPersonnelModal").modal("hide");
            loadPersonnelTable();
            $("#successModal .modal-body").text(
              "Personnel information added successfully."
            );
            $("#successModal").modal("show");
            // Optionally refresh personnel list or update the UI
          } else {
            // Show error modal with message
            $("#errorModal .modal-body").text(
              "Error: " + response.status.message
            );
            $("#errorModal").modal("show");
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          $("#errorModal .modal-body").text(
            "AJAX error: " + textStatus + " - " + errorThrown
          );
          $("#errorModal").modal("show");
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
        name: capitalizeFirstLetter(
          $("#editDepartmentName").val().trim().toLowerCase()
        ),
        locationID: $("#editLocation").val(),
      };

      if (checkDuplicateDepartmentForUpdate(formData.name, formData.id)) {
        $("#errorModal .modal-body").text(
          "A department with the same name already exists."
        );
        $("#errorModal").modal("show");
        return;
      }

      // AJAX call to save form data
      $.ajax({
        url: "./libs/php/updateDepartment.php",
        type: "POST",
        dataType: "json",
        data: formData,
        success: function (response) {
          if (response.status.code == 200) {
            $("#editDepartmentModal").modal("hide");
            $("#successModal .modal-body").text(
              "Department information updated successfully."
            );
            $("#successModal").modal("show");
            loadDepartmentsTable();
            loadPersonnelTable("refresh");
            // Optionally refresh personnel list or update the UI
          } else {
            // Show error modal with message
            $("#errorModal .modal-body").text(
              "Error: " + response.status.message
            );
            $("#errorModal").modal("show");
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          $("#errorModal .modal-body").text(
            "AJAX error: " + textStatus + " - " + errorThrown
          );
          $("#errorModal").modal("show");
        },
      });
    } else {
      var formData = {
        name: capitalizeFirstLetter(
          $("#editDepartmentName").val().trim().toLowerCase()
        ),
        locationID: $("#editLocation").val(),
      };

      if (checkDuplicateDepartmentForInsertion(formData.name)) {
        $("#errorModal .modal-body").text(
          "A department with the same name already exists."
        );
        $("#errorModal").modal("show");
        return;
      }

      $.ajax({
        url: "./libs/php/insertDepartment.php",
        type: "POST",
        dataType: "json",
        data: formData,
        success: function (response) {
          if (response.status.code == 200) {
            $("#editDepartmentModal").modal("hide");
            loadDepartmentsTable();
            $("#successModal .modal-body").text(
              "Department information added successfully."
            );
            $("#successModal").modal("show");
            // Optionally refresh personnel list or update the UI
          } else {
            // Show error modal with message
            $("#errorModal .modal-body").text(
              "Error: " + response.status.message
            );
            $("#errorModal").modal("show");
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          $("#errorModal .modal-body").text(
            "AJAX error: " + textStatus + " - " + errorThrown
          );
          $("#errorModal").modal("show");
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
        name: capitalizeFirstLetter(
          $("#editLocationName").val().trim().toLowerCase()
        ),
      };

      if (checkDuplicateLocationForUpdate(formData.name, formData.id)) {
        $("#errorModal .modal-body").text(
          "A location with the same name already exists."
        );
        $("#errorModal").modal("show");
        return;
      }
      // AJAX call to save form data
      $.ajax({
        url: "./libs/php/updateLocation.php",
        type: "POST",
        dataType: "json",
        data: formData,
        success: function (response) {
          if (response.status.code == 200) {
            $("#editLocationModal").modal("hide");
            $("#successModal .modal-body").text(
              "Location information updated successfully."
            );
            $("#successModal").modal("show");
            loadLocationsTable();
            loadDepartmentsTable("refresh");
            loadPersonnelTable("refresh");
            // Optionally refresh personnel list or update the UI
          } else {
            // Show error modal with message
            $("#errorModal .modal-body").text(
              "Error: " + response.status.message
            );
            $("#errorModal").modal("show");
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          $("#errorModal .modal-body").text(
            "AJAX error: " + textStatus + " - " + errorThrown
          );
          $("#errorModal").modal("show");
        },
      });
      // console.log("editing location data");
    } else {
      var formData = {
        name: capitalizeFirstLetter(
          $("#editLocationName").val().trim().toLowerCase()
        ),
      };

      if (checkDuplicateLocationForInsertion(formData.name)) {
        $("#errorModal .modal-body").text(
          "A location with the same name already exists."
        );
        $("#errorModal").modal("show");
        return;
      }

      $.ajax({
        url: "./libs/php/insertLocation.php",
        type: "POST",
        dataType: "json",
        data: formData,
        success: function (response) {
          if (response.status.code == 200) {
            $("#editLocationModal").modal("hide");
            $("#successModal .modal-body").text(
              "Location information added successfully."
            );
            $("#successModal").modal("show");
            // Optionally refresh personnel list or update the UI
            loadLocationsTable();
          } else {
            // Show error modal with message
            $("#errorModal .modal-body").text(
              "Error: " + response.status.message
            );
            $("#errorModal").modal("show");
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          $("#errorModal .modal-body").text(
            "AJAX error: " + textStatus + " - " + errorThrown
          );
          $("#errorModal").modal("show");
        },
      });
      // console.log("inserted location data");
    }
  });

  //
  $(document).on("click", "#deletePersonnelButton", function () {
    // Get the personnel ID from the data-id attribute
    var personnelId = $(this).data("id");

    // Store personnelId globally so it can be accessed inside modal confirm
    $("#confirmDeletePersonnelBtn").data("id", personnelId);

    // Show the modal
    $("#confirmPersonnelModal").modal("show");
  });

  // Handle the actual delete action when the modal's confirm button is clicked
  $(document).on("click", "#confirmDeletePersonnelBtn", function () {
    var personnelId = $(this).data("id"); // Retrieve the ID stored in the button

    // Proceed with AJAX call to delete personnel
    $.ajax({
      url: "./libs/php/deletePersonnelByID.php",
      type: "POST",
      dataType: "json",
      data: { id: personnelId }, // Send personnel ID to be deleted
      success: function (response) {
        if (response.status.code == 200) {
          $("#successModal .modal-body").text(
            "Personnel deleted successfully."
          );
          loadPersonnelTable();
          $("#successModal").modal("show");
          // Optionally refresh personnel list or update the UI
        } else {
          // Show error modal with message
          $("#errorModal .modal-body").text(
            "Error: " + response.status.message
          );
          $("#errorModal").modal("show");
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        // Show error modal with AJAX error
        $("#errorModal .modal-body").text(
          "AJAX error: " + textStatus + " - " + errorThrown
        );
        $("#errorModal").modal("show");
      },
    });

    // Hide the confirmation modal
    $("#confirmPersonnelModal").modal("hide");
  });

  $(document).on("click", "#deleteDepartmentButton", function () {
    // Get the personnel ID from the data-id attribute
    var departmentId = $(this).data("id");

    // Store personnelId globally so it can be accessed inside modal confirm
    $("#confirmDeleteDepartmentBtn").data("id", departmentId);

    // Show the modal
    $("#confirmDepartmentModal").modal("show");
  });

  $(document).on("click", "#confirmDeleteDepartmentBtn", function () {
    // Confirm deletion
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
          $("#successModal .modal-body").text(
            "Department deleted successfully."
          );
          $("#successModal").modal("show");
          loadDepartmentsTable();
          loadPersonnelTable("refresh");
          // Optionally refresh personnel list or update the UI
        } else {
          // Show error modal with message
          $("#errorModal .modal-body").text(
            "Error: " + response.status.message
          );
          $("#errorModal").modal("show");
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        $("#errorModal .modal-body").text(
          "AJAX error: " + textStatus + " - " + errorThrown
        );
        $("#errorModal").modal("show");
      },
    });
    $("#confirmDepartmentModal").modal("hide");
  });

  $(document).on("click", "#deleteLocationButton", function () {
    // Get the personnel ID from the data-id attribute
    var locationId = $(this).data("id");

    // Store personnelId globally so it can be accessed inside modal confirm
    $("#confirmDeleteLocationBtn").data("id", locationId);

    // Show the modal
    $("#confirmLocationModal").modal("show");
  });

  $(document).on("click", "#confirmDeleteLocationBtn", function () {
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
          // Optionally refresh personnel list or update the UI
          $("#successModal .modal-body").text("Location deleted successfully.");
          $("#successModal").modal("show");
          loadLocationsTable();
          loadDepartmentsTable("refresh");
          loadPersonnelTable("refresh");
        } else {
          // Show error modal with message
          $("#errorModal .modal-body").text(
            "Error: " + response.status.message
          );
          $("#errorModal").modal("show");
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        $("#errorModal .modal-body").text(
          "AJAX error: " + textStatus + " - " + errorThrown
        );
        $("#errorModal").modal("show");
      },
    });
    $("#confirmLocationModal").modal("hide");
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

function capitalizeFirstLetter(inputString) {
  return inputString
    .split(" ") // Split the string into an array of words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
    .join(" "); // Join the array back into a string
}

function checkForDuplicateEmailForInsertion(email) {
  let isDuplicate = false;

  $("#personnelTableBody tr").each(function () {
    var cellEmail = $(this).find("td").eq(4).text().trim(); // 5th column (0-based index is 4)
    if (cellEmail === email) {
      isDuplicate = true;
      return false; // Breaks out of the loop
    }
  });

  return isDuplicate;
}

function checkForDuplicateEmailForUpdate(email, id) {
  let isDuplicate = false;

  // Loop through each row in the table
  $("#personnelTableBody tr").each(function () {
    // Get the email from the 5th <td> (index 4 in zero-based index)
    const emailCell = $(this).find("td").eq(4).text().trim();

    // Get the data-id from the delete button in this row
    const rowId = $(this).find("#deletePersonnelButton").data("id");
    // Skip this iteration if the rowId matches the provided id
    if (rowId == id) {
      return true; // Continue to the next iteration
    }

    // Check if the email matches the provided parameter
    if (emailCell === email.trim()) {
      // console.log("A user with the same email already exists");
      isDuplicate = true;
      return false; // Break out of the loop
    }
  });

  return isDuplicate;
}

function checkDuplicateDepartmentForInsertion(department) {
  let isDuplicate = false;

  $("#departmentTableBody tr").each(function () {
    var departmentName = $(this).find("td").eq(0).text().trim(); // 5th column (0-based index is 4)
    if (departmentName === department) {
      isDuplicate = true;
      return false; // Breaks out of the loop
    }
  });

  return isDuplicate;
}

function checkDuplicateDepartmentForUpdate(department, id) {
  let isDuplicate = false;

  // Loop through each row in the table
  $("#departmentTableBody tr").each(function () {
    // Get the email from the 5th <td> (index 4 in zero-based index)
    const departmentName = $(this).find("td").eq(0).text().trim();

    // Get the data-id from the delete button in this row
    const rowId = $(this).find("#deleteDepartmentButton").data("id");
    // Skip this iteration if the rowId matches the provided id
    if (rowId == id) {
      return true; // Continue to the next iteration
    }

    // Check if the email matches the provided parameter
    if (departmentName === department.trim()) {
      // console.log("A department with the same name already exists");
      isDuplicate = true;
      return false; // Break out of the loop
    }
  });

  return isDuplicate;
}

function checkDuplicateLocationForInsertion(location) {
  let isDuplicate = false;

  $("#locationTableBody tr").each(function () {
    var locationName = $(this).find("td").eq(0).text().trim(); // 5th column (0-based index is 4)
    if (locationName === location) {
      isDuplicate = location;
      return false; // Breaks out of the loop
    }
  });

  return isDuplicate;
}

function checkDuplicateLocationForUpdate(location, id) {
  let isDuplicate = false;

  // Loop through each row in the table
  $("#locationTableBody tr").each(function () {
    // Get the email from the 5th <td> (index 4 in zero-based index)
    const locationName = $(this).find("td").eq(0).text().trim();

    // Get the data-id from the delete button in this row
    const rowId = $(this).find("#deletePersonnelButton").data("id");
    // Skip this iteration if the rowId matches the provided id
    if (rowId == id) {
      return true; // Continue to the next iteration
    }

    // Check if the email matches the provided parameter
    if (locationName === location.trim()) {
      // console.log("A location with the same email already exists");
      isDuplicate = true;
      return false; // Break out of the loop
    }
  });

  return isDuplicate;
}

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
  if (searchTerm || searchTerm === "refresh") {
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
          $("#errorModal .modal-body").text(
            "Error: " + result.status.description
          );
          $("#errorModal").modal("show");
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
          if (refresh) {
            $("#departmentLoader").hide();
          } else {
            $("#crudLoader").hide();
          }
        });
      } else {
        // Show error modal with message
        $("#errorModal .modal-body").text(
          "Error: " + result.status.description
        );
        $("#errorModal").modal("show");
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
          if (refresh) {
            $("#locationLoader").hide();
          } else {
            $("#crudLoader").hide();
          }
        });
      } else {
        // Show error modal with message
        $("#errorModal .modal-body").text(
          "Error: " + result.status.description
        );
        $("#errorModal").modal("show");
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
