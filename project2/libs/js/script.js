import {
  loadPersonnelTable,
  loadDepartmentsTable,
  loadLocationsTable,
  filterTable,
} from "./utils/tableFunctions.js";

import {
  checkForDuplicateEmailForInsertion,
  checkForDuplicateEmailForUpdate,
  checkDuplicateDepartmentForInsertion,
  checkDuplicateDepartmentForUpdate,
  checkDuplicateLocationForInsertion,
  checkDuplicateLocationForUpdate,
} from "./utils/duplicateChecking.js";

import {
  capitalizeFirstLetter,
  debouncedSearch,
  handleError,
  showError,
  populateSelect,
} from "./utils/helperFunctions.js";

$(document).ready(function () {
  // Call the function to load the personnel table when the page loads
  loadPersonnelTable("refresh");

  populateSelect(
    "./libs/php/getAll.php",
    "#filterPersonnelByDepartment",
    "#filterPersonnelModal",
    "department"
  );

  populateSelect(
    "./libs/php/getAll.php",
    "#filterPersonnelByLocation",
    "#filterPersonnelModal",
    "location"
  );

  $("#searchInp").on("keyup", function () {
    if ($("#personnelBtn").hasClass("active")) {
      // Show the loader
      $("#personnelLoader").show();
      // Call the debounced search function
      debouncedSearch("./libs/php/searchInPersonnel.php", loadPersonnelTable);
    } else if ($("#departmentsBtn").hasClass("active")) {
      // Show the loader
      $("#departmentLoader").show();
      debouncedSearch(
        "./libs/php/searchInDepartments.php",
        loadDepartmentsTable
      );
    } else {
      // Show the loader
      $("#locationLoader").show();
      debouncedSearch("./libs/php/searchInLocations.php", loadLocationsTable);
    }
  });

  $("#refreshBtn").click(function () {
    if ($("#personnelBtn").hasClass("active")) {
      // Refresh personnel table
      loadPersonnelTable("refresh");
    } else {
      if ($("#departmentsBtn").hasClass("active")) {
        loadDepartmentsTable("refresh");
        // Refresh department table
      } else {
        // Refresh location table
        loadLocationsTable("refresh");
      }
    }
  });

  $("#addBtn").click(function () {
    if ($("#locationsBtn").hasClass("active")) {
      // Opem Add location modal
      $("#addLocationModal").modal("show");
      $("#addLocationName").val("");
    }
  });

  $("#personnelBtn").click(function () {
    // Call function to refresh personnel table
    $("#addBtn").attr("data-bs-toggle", "modal");
    $("#addBtn").attr("data-bs-target", "#addPersonnelModal");
    $("#filterBtn").prop("disabled", false);
    loadPersonnelTable("refresh");
  });

  $("#departmentsBtn").click(function () {
    // Call function to refresh department table\
    $("#addBtn").attr("data-bs-toggle", "modal");
    $("#addBtn").attr("data-bs-target", "#addDepartmentModal");
    $("#filterBtn").prop("disabled", true);
    loadDepartmentsTable("refresh");
  });

  $("#locationsBtn").click(function () {
    // Call function to refresh location table
    $("#addBtn").removeAttr("data-bs-target");
    $("#addBtn").removeAttr("data-bs-toggle");
    $("#filterBtn").prop("disabled", true);
    loadLocationsTable("refresh");
  });

  $("#editPersonnelModal").on("show.bs.modal", function (e) {
    $.ajax({
      url: "./libs/php/getByID.php",
      type: "POST",
      dataType: "json",
      data: {
        id: $(e.relatedTarget).attr("data-id"),
        entity: "personnel", // Added 'entity' to specify personnel
      },
      success: function (result) {
        var resultCode = result.status.code;

        if (resultCode == 200) {
          // Update the hidden input with the employee id so that
          // it can be referenced when the form is submitted
          $("#personnelEmployeeID").val(result.data.personnel[0].id);

          $("#editPersonnelFirstName").val(result.data.personnel[0].firstName);
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
          let departmentIdExists = false;
          $.each(result.data.department, function () {
            if (this.id == result.data.personnel[0].departmentID) {
              departmentIdExists = true;
              return;
            }
          });
          if (departmentIdExists) {
            $("#editPersonnelDepartment").val(
              result.data.personnel[0].departmentID
            );
          }
        } else {
          handleError("#editPersonnelModal");
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        handleError("#editPersonnelModal", errorThrown);
      },
    });
  });

  // Executes when the form button with type="submit" is clicked
  $("#editPersonnelForm").on("submit", function (e) {
    // Executes when the form button with type="submit" is clicked
    e.preventDefault(); // stop the default browser behviour
    // Gather form data into an object
    var formData = {
      updateType: "personnel", // Specify the type as 'personnel' for update
      id: $("#personnelEmployeeID").val(),
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
      $("#errorModal .modal-body").text(
        "A user with this email address already exists. No changes have been saved."
      );
      $("#editPersonnelModal").modal("hide");
      $("#errorModal").modal("show");
      return;
    }

    // AJAX call to save form data

    $.ajax({
      url: "./libs/php/update.php", // PHP file to handle updating
      type: "POST",
      dataType: "json",
      data: formData,
      success: function (response) {
        if (response.status.code == 200) {
          $("#editPersonnelModal").modal("hide");
          // loadPersonnelTable();
          $("#successModal .modal-body").text(
            "Personnel information updated successfully."
          );
          $("#successModal").modal("show");
          loadPersonnelTable("refresh");
          // Optionally refresh personnel list or update the UI
        } else {
          // Show error modal with message
          showError(response.status.description);
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        showError(textStatus, errorThrown);
      },
    });
  });

  $("#addPersonnelModal").on("show.bs.modal", function () {
    $("#addPersonnelEmployeeID").val("");
    $("#addPersonnelFirstName").val("");
    $("#addPersonnelLastName").val("");
    $("#addPersonnelJobTitle").val("");
    $("#addPersonnelEmailAddress").val("");
    // will do an ajax request to retrieve all departments
    populateSelect(
      "./libs/php/getAll.php",
      "#addPersonnelDepartment",
      "#addPersonnelModal",
      "department"
    );
  });

  $("#addPersonnelForm").on("submit", function (e) {
    e.preventDefault();
    var formData = {
      type: "personnel", // Specify the type as 'personnel' for insertion
      firstName: capitalizeFirstLetter(
        $("#addPersonnelFirstName").val().trim().toLowerCase()
      ), // Trimming, converting to lowercase, then capitalizing the first letter
      lastName: capitalizeFirstLetter(
        $("#addPersonnelLastName").val().trim().toLowerCase()
      ),
      jobTitle: capitalizeFirstLetter(
        $("#addPersonnelJobTitle").val().trim().toLowerCase()
      ),
      email: $("#addPersonnelEmailAddress").val().trim().toLowerCase(),
      departmentID: $("#addPersonnelDepartment").val(),
    };

    if (checkForDuplicateEmailForInsertion(formData.email)) {
      $("#errorModal .modal-body").text(
        "A user with this email address already exists. No changes have been saved."
      );
      $("#addPersonnelModal").modal("hide");
      $("#errorModal").modal("show");
      return;
    }

    $.ajax({
      url: "./libs/php/insert.php",
      type: "POST",
      dataType: "json",
      data: formData,
      success: function (response) {
        if (response.status.code == 200) {
          $("#addPersonnelModal").modal("hide");
          $("#searchInp").val("");
          $("#successModal .modal-body").text(
            "Personnel information added successfully."
          );
          $("#successModal").modal("show");
          loadPersonnelTable("refresh");
          // Optionally refresh personnel list or update the UI
        } else {
          // Show error modal with message
          showError(response.status.description);
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        showError(textStatus, errorThrown);
      },
    });
  });

  $("#editDepartmentModal").on("show.bs.modal", function (e) {
    // getAll.php is called to populate location select
    $("#editDepartmentTitle").text("Edit department");
    $.ajax({
      url: "./libs/php/getByID.php",
      type: "POST",
      dataType: "json",
      data: {
        id: $(e.relatedTarget).attr("data-id"),
        entity: "department", // Added 'entity' to specify department
      },
      success: function (result) {
        var resultCode = result.status.code;

        if (resultCode == 200) {
          // Ensure result.data.department exists and is not an array
          var departmentData =
            result.data.department[0] || result.data.department;

          // Update the hidden input with the department id so that
          // it can be referenced when the form is submitted
          $("#departmentID").val(departmentData.id);
          $("#editDepartmentName").val(departmentData.name);

          populateSelect(
            "./libs/php/getAll.php",
            "#editDepartmentLocation",
            "#editDepartmentModal",
            "location",
            departmentData.locationID
          );
        } else {
          handleError("#editDepartmentModal");
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        handleError("#editDepartmentModal", errorThrown);
      },
    });
  });

  $("#editDepartmentForm").on("submit", function (e) {
    // Executes when the form button with type="submit" is clicked
    // stop the default browser behviour
    e.preventDefault();
    // Gather form data into an object
    var formData = {
      updateType: "department", // Specify the type as 'department' for update,
      id: $("#departmentID").val(),
      name: capitalizeFirstLetter(
        $("#editDepartmentName").val().trim().toLowerCase()
      ),
      locationID: $("#editDepartmentLocation").val(),
    };

    if (checkDuplicateDepartmentForUpdate(formData.name, formData.id)) {
      $("#errorModal .modal-body").text(
        "A department with this name already exists. No changes have been saved."
      );
      $("#editDepartmentModal").modal("hide");
      $("#errorModal").modal("show");
      return;
    }

    // AJAX call to save form data
    $.ajax({
      url: "./libs/php/update.php",
      type: "POST",
      dataType: "json",
      data: formData,
      success: function (response) {
        if (response.status.code == 200) {
          loadDepartmentsTable("refresh");
          $("#editDepartmentModal").modal("hide");
          $("#successModal .modal-body").text(
            "Department information updated successfully."
          );
          $("#successModal").modal("show");
          // Optionally refresh personnel list or update the UI
        } else {
          // Show error modal with message
          showError(response.status.description);
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        showError(textStatus, errorThrown);
      },
    });
  });

  $("#addDepartmentModal").on("show.bs.modal", function (e) {
    // getAll.php is called to populate location select
    $("#addDepartmentTitle").text("Add department");
    $("#addDepartmentName").val("");
    populateSelect(
      "./libs/php/getAll.php",
      "#addDepartmentLocation",
      "#addDepartmentModal",
      "location"
    );
  });

  $("#addDepartmentForm").on("submit", function (e) {
    // Executes when the form button with type="submit" is clicked
    // stop the default browser behviour
    e.preventDefault();

    // Gather form data into an object
    var formData = {
      type: "department", // Specify the type as 'department' for insertion
      name: capitalizeFirstLetter(
        $("#addDepartmentName").val().trim().toLowerCase()
      ),
      locationID: $("#addDepartmentLocation").val(),
    };

    if (checkDuplicateDepartmentForInsertion(formData.name)) {
      $("#errorModal .modal-body").text(
        "A department with this name already exists. No changes have been saved."
      );
      $("#addDepartmentModal").modal("hide");
      $("#errorModal").modal("show");
      return;
    }

    $.ajax({
      url: "./libs/php/insert.php",
      type: "POST",
      dataType: "json",
      data: formData,
      success: function (response) {
        if (response.status.code == 200) {
          $("#addDepartmentModal").modal("hide");
          loadDepartmentsTable("refresh");
          $("#successModal .modal-body").text(
            "Department information added successfully."
          );
          $("#successModal").modal("show");
          // Optionally refresh personnel list or update the UI
        } else {
          // Show error modal with message
          showError(response.status.description);
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        showError(textStatus, errorThrown);
      },
    });
  });

  $("#editLocationModal").on("show.bs.modal", function (e) {
    $.ajax({
      url: "./libs/php/getByID.php",
      type: "POST",
      dataType: "json",
      data: {
        id: $(e.relatedTarget).attr("data-id"),
        entity: "location", // Added 'entity' to specify location
      },
      success: function (result) {
        var resultCode = result.status.code;

        if (resultCode == 200) {
          // Ensure result.data.location exists and is not an array
          var locationData = result.data.location[0] || result.data.location;

          // Update the hidden input with the location id
          $("#locationID").val(locationData.id);
          $("#editLocationName").val(locationData.name);
        } else {
          handleError("#editLocationModal");
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        handleError("#editLocationModal", errorThrown);
      },
    });
  });

  $("#editLocationForm").on("submit", function (e) {
    // Executes when the form button with type="submit" is clicked
    // stop the default browser behviour
    e.preventDefault();

    // Gather form data into an object
    var formData = {
      updateType: "location", // Specify the type as 'location' for update,
      id: $("#locationID").val(),
      name: capitalizeFirstLetter(
        $("#editLocationName").val().trim().toLowerCase()
      ),
    };

    if (checkDuplicateLocationForUpdate(formData.name, formData.id)) {
      $("#errorModal .modal-body").text(
        "A location with this name already exists. No changes have been saved."
      );
      $("#editLocationModal").modal("hide");
      $("#errorModal").modal("show");
      return;
    }
    // AJAX call to save form data
    $.ajax({
      url: "./libs/php/update.php",
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
          loadLocationsTable("refresh");
        } else {
          // Show error modal with message
          showError(response.status.description);
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        showError(textStatus, errorThrown);
      },
    });
  });

  $("#addLocationForm").on("submit", function (e) {
    // Executes when the form button with type="submit" is clicked
    e.preventDefault(); // stop the default browser behviour
    // Gather form data into an object
    var formData = {
      type: "location", // Specify the type as 'location' for insertion
      name: capitalizeFirstLetter(
        $("#addLocationName").val().trim().toLowerCase()
      ),
    };

    if (checkDuplicateLocationForInsertion(formData.name)) {
      $("#errorModal .modal-body").text(
        "A location with this name already exists. No changes have been saved."
      );
      $("#addLocationModal").modal("hide");
      $("#errorModal").modal("show");
      return;
    }

    $.ajax({
      url: "./libs/php/insert.php",
      type: "POST",
      dataType: "json",
      data: formData,
      success: function (response) {
        if (response.status.code == 200) {
          $("#addLocationModal").modal("hide");
          $("#successModal .modal-body").text(
            "Location information added successfully."
          );
          $("#successModal").modal("show");
          // Optionally refresh personnel list or update the UI
          loadLocationsTable("refresh");
        } else {
          // Show error modal with message
          showError(response.status.description);
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        showError(textStatus, errorThrown);
      },
    });
  });

  $("#deletePersonnelModal").on("show.bs.modal", function (e) {
    $.ajax({
      url: "./libs/php/getIdForDeletion.php",
      type: "POST",
      dataType: "json",
      data: {
        id: $(e.relatedTarget).attr("data-id"),
        entity: "personnel", // Specify the type as 'personnel' for deletion
      },
      success: function (response) {
        if (response.status.code == 200) {
          $("#deleteEmployeeID").val(response.data.personnel[0].id);
          $("#areYouSurePersonnelName").text(
            `${response.data.personnel[0].firstName} ${response.data.personnel[0].lastName}`
          );
        } else {
          // Show error modal with message
          showError(response.status.description);
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        // Show error modal with AJAX error
        showError(textStatus, errorThrown);
      },
    });
  });

  // Handle the actual delete action when the modal's confirm button is clicked
  $("#deletePersonnelForm").on("submit", function (e) {
    e.preventDefault();

    // Proceed with AJAX call to delete personnel
    $.ajax({
      url: "./libs/php/delete.php",
      type: "POST",
      dataType: "json",
      data: {
        id: $("#deleteEmployeeID").val(),
        type: "personnel", // Specify the type as 'personnel' for deletion
      },
      success: function (response) {
        if (response.status.code == 200) {
          loadPersonnelTable("refresh");
        } else {
          // Show error modal with message
          showError(response.status.description);
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        // Show error modal with AJAX error
        showError(textStatus, errorThrown);
      },
    });

    // Hide the confirmation modal
    $("#deletePersonnelModal").modal("hide");
  });

  $("#departmentTableBody").on("click", ".deleteDepartmentBtn", function () {
    $.ajax({
      url: "./libs/php/getIdForDeletion.php",
      type: "POST",
      dataType: "json",
      data: {
        id: $(this).attr("data-id"),
        entity: "department", // Specify the type as 'personnel' for deletion
      },
      success: function (response) {
        if (response.status.code == 200) {
          if (response.data.department[0].personnelCount == 0) {
            $("#areYouSureDepartmentName").text(
              response.data.department[0].name
            );
            $("#deleteDepartmentID").val(response.data.department[0].id);
            $("#deleteDepartmentModal").modal("show");
          } else {
            $("#cantDeleteDeptName").text(response.data.department[0].name);
            $("#personnelCount").text(
              response.data.department[0].personnelCount
            );

            $("#cantDeleteDepartmentModal").modal("show");
          }
        } else {
          // Show error modal with message
          showError(response.status.description);
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        // Show error modal with AJAX error
        showError(textStatus, errorThrown);
      },
    });
  });

  $("#deleteDepartmentForm").on("submit", function (e) {
    e.preventDefault();
    // Proceed with AJAX call to delete department
    $.ajax({
      url: "./libs/php/delete.php", // Replace with the correct PHP file
      type: "POST",
      dataType: "json",
      data: {
        id: $("#deleteDepartmentID").val(), // Send department ID to be deleted
        type: "department", // Specify the type as 'department' for deletion
      },
      success: function (response) {
        if (response.status.code == 200) {
          loadDepartmentsTable("refresh");
        } else {
          // Show error modal with message
          showError(response.status.description);
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        showError(textStatus, errorThrown);
      },
    });
    $("#deleteDepartmentModal").modal("hide");
  });

  $("#locationTableBody").on("click", ".deleteLocationBtn", function () {
    $.ajax({
      url: "./libs/php/getIdForDeletion.php",
      type: "POST",
      dataType: "json",
      data: {
        id: $(this).attr("data-id"),
        entity: "location", // Specify the type as 'personnel' for deletion
      },
      success: function (response) {
        if (response.status.code == 200) {
          if (response.data.location[0].departmentCount == 0) {
            $("#areYouSureLocationName").text(
              `${response.data.location[0].name}`
            );
            $("#deleteLocationID").val(response.data.location[0].id);
            $("#deleteLocationModal").modal("show");
          } else {
            $("#cantDeleteLoctName").text(response.data.location[0].name);
            $("#departmentCount").text(
              response.data.location[0].departmentCount
            );
            $("#cantDeleteLocationModal").modal("show");
          }
        } else {
          // Show error modal with message
          showError(response.status.description);
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        // Show error modal with AJAX error
        showError(textStatus, errorThrown);
      },
    });
  });

  $("#deleteLocationForm").on("submit", function (e) {
    e.preventDefault();

    // Proceed with AJAX call to delete location
    $.ajax({
      url: "./libs/php/delete.php", // Replace with the correct PHP file
      type: "POST",
      dataType: "json",
      data: {
        id: $("#deleteLocationID").val(),
        type: "location", // Specify the type as 'location' for deletion
      },
      success: function (response) {
        if (response.status.code == 200) {
          loadLocationsTable("refresh");
        } else {
          // Show error modal with message
          showError(response.status.description);
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        showError(textStatus, errorThrown);
      },
    });
    $("#deleteLocationModal").modal("hide");
  });

  $("#filterPersonnelByDepartment").change(function () {
    filterTable("All", "showEverything");
    if (this.value > 0) {
      $("#filterPersonnelByLocation").val(0);

      // apply Filter
    }
    var filterText = $("#filterPersonnelByDepartment option:selected").text();
    if (filterText === "All") {
      filterTable(filterText, "showEverything");
    } else {
      filterTable(filterText, "department");
    }
  });

  $("#filterPersonnelByLocation").change(function () {
    filterTable("All", "showEverything");
    if (this.value > 0) {
      $("#filterPersonnelByDepartment").val(0);
    }
    var filterText = $("#filterPersonnelByLocation option:selected").text();
    if (filterText === "All") {
      filterTable(filterText, "showEverything");
    } else {
      filterTable(filterText, "location");
    }
  });
});
