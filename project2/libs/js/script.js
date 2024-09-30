import {
  loadPersonnelTable,
  loadDepartmentsTable,
  loadLocationsTable,
  filterTable,
  resetFilterTable,
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
    } else if ($("#departments").is(":checked")) {
      // Enable the input field when other radio buttons are selected
      $("#inputField").prop("disabled", false);
      $("#filterButton").removeClass("locationButton");
      $("#filterButton").addClass("departmentButton");
      // add available departments as <options> to the <select> with the id of inputField
      populateSelect(
        "./libs/php/getAll.php",
        "#inputField",
        "#filterModal",
        "department"
      );
    } else {
      // Enable the input field when other radio buttons are selected
      $("#inputField").prop("disabled", false);
      $("#filterButton").removeClass("departmentButton");
      $("#filterButton").addClass("locationButton");
      // add available locations as as <options> to the <select> with the id of inputField
      populateSelect(
        "./libs/php/getAll.php",
        "#inputField",
        "#filterModal",
        "location"
      );
    }
    // var selectedValue = $("input[name='filter']:checked").val();
    // console.log("Selected filter: " + selectedValue);
  });

  $("#searchInp").on("keyup", function () {
    // Show the loader
    $("#personnelLoader").show();
    resetFilterTable();
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

  $("#addBtn").click(function () {
    // Replicate the logic of the refresh button click to open the add modal for the table that is currently on display
    if ($("#personnelBtn").hasClass("active")) {
      // Refresh personnel table
      // console.log("you are adding in personnel");
    } else {
      if ($("#departmentsBtn").hasClass("active")) {
        // Refresh department table
        // console.log("you are adding in departments");
      } else {
        // Refresh location table
        // console.log("you are adding in locations");
      }
    }
  });

  $("#personnelBtn").click(function () {
    // Call function to refresh personnel table
    $("#addBtn").attr("data-bs-target", "#personnelModal");
    $("#filterBtn").show();
    $("#searchInp").show();
    // $("#filterBtn").attr("data-bs-target", "#filterPersonnelModal");// i will set these if i decide to make the filter modal dynamic and applicable to all different tabs
    // console.log("you clicked on personnel tab");
    // loadPersonnelTable(); // i figured doing this only once at the beginning is enough, therefore i placed it there. Might revert back if needed.
  });

  $("#departmentsBtn").click(function () {
    // Call function to refresh department table\
    $("#addBtn").attr("data-bs-target", "#departmentModal");
    $("#filterBtn").hide();
    $("#searchInp").hide();
    // $("#filterBtn").attr("data-bs-target", "#filterDepartmentModal");// i will set these if i decide to make the filter modal dynamic and applicable to all different tabs
    // console.log("you clicked on departments tab");
    // loadDepartmentsTable(); // i figured doing this only once at the beginning is enough, therefore i placed it there. Might revert back if needed.
  });

  $("#locationsBtn").click(function () {
    // Call function to refresh location table
    $("#addBtn").attr("data-bs-target", "#locationModal");
    $("#filterBtn").hide();
    $("#searchInp").hide();
    // $("#filterBtn").attr("data-bs-target", "#filterLocationModal");// i will set these if i decide to make the filter modal dynamic and applicable to all different tabs
    // console.log("you clicked on locations tab");
    // loadLocationsTable(); // i figured doing this only once at the beginning is enough, therefore i placed it there. Might revert back if needed.
  });

  $("#personnelModal").on("show.bs.modal", function (e) {
    if ($(e.relatedTarget).attr("data-id")) {
      $("#personnelEditLoader").show();
      $("#personnelTitle").text("Edit personnel");
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
            console.log(result.data);
            $("#personnelEmployeeID").val(result.data.personnel[0].id);

            $("#personnelFirstName").val(result.data.personnel[0].firstName);
            $("#personnelLastName").val(result.data.personnel[0].lastName);
            $("#personnelJobTitle").val(result.data.personnel[0].jobTitle);
            $("#personnelEmailAddress").val(result.data.personnel[0].email);
            $("#personnelDepartment").html("");

            $.each(result.data.department, function () {
              $("#personnelDepartment").append(
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
              $("#personnelDepartment").val(
                result.data.personnel[0].departmentID
              );
            }
            $("#personnelEditLoader").hide();
          } else {
            handleError("#personnelModal");
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          handleError("#personnelModal", errorThrown);
        },
      });
    } else {
      $("#personnelTitle").text("Add personnel");
      $("#personnelEmployeeID").val("");
      $("#personnelFirstName").val("");
      $("#personnelLastName").val("");
      $("#personnelJobTitle").val("");
      $("#personnelEmailAddress").val("");
      // will do an ajax request to retrieve all departments
      populateSelect(
        "./libs/php/getAll.php",
        "#personnelDepartment",
        "#personnelModal",
        "department"
      );
    }
  });

  // Executes when the form button with type="submit" is clicked

  $("#personnelForm").on("submit", function (e) {
    // Executes when the form button with type="submit" is clicked
    // stop the default browser behviour
    e.preventDefault();

    // Gather form data into an object
    if ($("#personnelEmployeeID").val()) {
      var formData = {
        updateType: "personnel", // Specify the type as 'personnel' for update
        id: $("#personnelEmployeeID").val(),
        firstName: capitalizeFirstLetter(
          $("#personnelFirstName").val().trim().toLowerCase()
        ), // Trimming, converting to lowercase, then capitalizing the first letter
        lastName: capitalizeFirstLetter(
          $("#personnelLastName").val().trim().toLowerCase()
        ),
        jobTitle: capitalizeFirstLetter(
          $("#personnelJobTitle").val().trim().toLowerCase()
        ),
        email: $("#personnelEmailAddress").val().trim().toLowerCase(),
        departmentID: $("#personnelDepartment").val(),
      };

      if (checkForDuplicateEmailForUpdate(formData.email, formData.id)) {
        $("#errorModal .modal-body").text(
          "A user with the same email already exists."
        );
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
            $("#personnelModal").modal("hide");
            loadPersonnelTable();
            $("#successModal .modal-body").text(
              "Personnel information updated successfully."
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
    } else {
      var formData = {
        type: "personnel", // Specify the type as 'personnel' for insertion
        firstName: capitalizeFirstLetter(
          $("#personnelFirstName").val().trim().toLowerCase()
        ), // Trimming, converting to lowercase, then capitalizing the first letter
        lastName: capitalizeFirstLetter(
          $("#personnelLastName").val().trim().toLowerCase()
        ),
        jobTitle: capitalizeFirstLetter(
          $("#personnelJobTitle").val().trim().toLowerCase()
        ),
        email: $("#personnelEmailAddress").val().trim().toLowerCase(),
        departmentID: $("#personnelDepartment").val(),
      };

      if (checkForDuplicateEmailForInsertion(formData.email)) {
        $("#errorModal .modal-body").text(
          "A user with the same email already exists."
        );
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
            $("#personnelModal").modal("hide");
            $("#searchInp").val("");
            resetFilterTable();
            loadPersonnelTable();
            $("#successModal .modal-body").text(
              "Personnel information added successfully."
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
    }
  });

  $("#departmentModal").on("show.bs.modal", function (e) {
    // getAll.php is called to populate location select

    if ($(e.relatedTarget).attr("data-id")) {
      $("#departmentTitle").text("Edit department");
      $("#departmentEditLoader").show();
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
            $("#departmentName").val(departmentData.name);

            populateSelect(
              "./libs/php/getAll.php",
              "#departmentLocation",
              "#departmentModal",
              "location",
              departmentData.locationID
            );
          } else {
            handleError("#departmentModal");
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          handleError("#departmentModal", errorThrown);
        },
      });
    } else {
      $("#departmentTitle").text("Add department");
      $("#departmentID").val("");
      $("#departmentName").val("");
      populateSelect(
        "./libs/php/getAll.php",
        "#departmentLocation",
        "#departmentModal",
        "location"
      );
    }
  });

  $("#departmentForm").on("submit", function (e) {
    // Executes when the form button with type="submit" is clicked
    // stop the default browser behviour
    e.preventDefault();

    // Gather form data into an object

    if ($("#departmentID").val()) {
      var formData = {
        updateType: "department", // Specify the type as 'department' for update,
        id: $("#departmentID").val(),
        name: capitalizeFirstLetter(
          $("#departmentName").val().trim().toLowerCase()
        ),
        locationID: $("#departmentLocation").val(),
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
        url: "./libs/php/update.php",
        type: "POST",
        dataType: "json",
        data: formData,
        success: function (response) {
          if (response.status.code == 200) {
            $("#departmentModal").modal("hide");
            $("#successModal .modal-body").text(
              "Department information updated successfully."
            );
            $("#successModal").modal("show");
            loadDepartmentsTable();
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
    } else {
      var formData = {
        type: "department", // Specify the type as 'department' for insertion
        name: capitalizeFirstLetter(
          $("#departmentName").val().trim().toLowerCase()
        ),
        locationID: $("#departmentLocation").val(),
      };

      if (checkDuplicateDepartmentForInsertion(formData.name)) {
        $("#errorModal .modal-body").text(
          "A department with the same name already exists."
        );
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
            $("#departmentModal").modal("hide");
            loadDepartmentsTable();
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
      //above code will me commented in once insertDepartment.php is checked and made sure to be working
    }
  });

  $("#locationModal").on("show.bs.modal", function (e) {
    if ($(e.relatedTarget).attr("data-id")) {
      $("#locationEditLoader").show();
      $("#locationTitle").text("Edit location");
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
            $("#locationName").val(locationData.name);
            $("#locationEditLoader").hide();
          } else {
            handleError("#locationModal");
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          handleError("#departmentModal", errorThrown);
        },
      });
    } else {
      $("#locationTitle").text("Add location");
      $("#locationName").val("");
      $("#locationID").val("");
    }
  });

  $("#locationForm").on("submit", function (e) {
    // Executes when the form button with type="submit" is clicked
    // stop the default browser behviour
    e.preventDefault();

    // Gather form data into an object

    if ($("#locationID").val()) {
      var formData = {
        updateType: "location", // Specify the type as 'location' for update,
        id: $("#locationID").val(),
        name: capitalizeFirstLetter(
          $("#locationName").val().trim().toLowerCase()
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
        url: "./libs/php/update.php",
        type: "POST",
        dataType: "json",
        data: formData,
        success: function (response) {
          if (response.status.code == 200) {
            $("#locationModal").modal("hide");
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
            showError(response.status.description);
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          showError(textStatus, errorThrown);
        },
      });
    } else {
      var formData = {
        type: "location", // Specify the type as 'location' for insertion
        name: capitalizeFirstLetter(
          $("#locationName").val().trim().toLowerCase()
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
        url: "./libs/php/insert.php",
        type: "POST",
        dataType: "json",
        data: formData,
        success: function (response) {
          if (response.status.code == 200) {
            $("#locationModal").modal("hide");
            $("#successModal .modal-body").text(
              "Location information added successfully."
            );
            $("#successModal").modal("show");
            // Optionally refresh personnel list or update the UI
            loadLocationsTable();
          } else {
            // Show error modal with message
            showError(response.status.description);
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          showError(textStatus, errorThrown);
        },
      });
    }
  });

  //
  $("#personnelTableBody").on("click", "#deletePersonnelButton", function () {
    // Get the personnel ID from the data-id attribute
    var personnelId = $(this).data("id");

    // Store personnelId globally so it can be accessed inside modal confirm
    $("#confirmDeletePersonnelBtn").data("id", personnelId);

    // Show the modal
    $("#confirmPersonnelModal").modal("show");
  });

  // Handle the actual delete action when the modal's confirm button is clicked
  $("#confirmPersonnelModal").on(
    "click",
    "#confirmDeletePersonnelBtn",
    function () {
      var personnelId = $(this).data("id"); // Retrieve the ID stored in the button

      // Proceed with AJAX call to delete personnel
      $.ajax({
        url: "./libs/php/delete.php",
        type: "POST",
        dataType: "json",
        data: {
          id: personnelId, // Send personnel ID to be deleted
          type: "personnel", // Specify the type as 'personnel' for deletion
        },
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
            showError(response.status.description);
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          // Show error modal with AJAX error
          showError(textStatus, errorThrown);
        },
      });

      // Hide the confirmation modal
      $("#confirmPersonnelModal").modal("hide");
    }
  );

  $("#departmentTableBody").on("click", "#deleteDepartmentButton", function () {
    // Get the personnel ID from the data-id attribute
    var departmentId = $(this).data("id");

    // Store personnelId globally so it can be accessed inside modal confirm
    $("#confirmDeleteDepartmentBtn").data("id", departmentId);

    // Show the modal
    $("#confirmDepartmentModal").modal("show");
  });

  $("#confirmDepartmentModal").on(
    "click",
    "#confirmDeleteDepartmentBtn",
    function () {
      // Confirm deletion
      // Get the personnel ID from the data-id attribute
      var departmentId = $(this).data("id");
      // Proceed with AJAX call to delete department
      $.ajax({
        url: "./libs/php/delete.php", // Replace with the correct PHP file
        type: "POST",
        dataType: "json",
        data: {
          id: departmentId, // Send department ID to be deleted
          type: "department", // Specify the type as 'department' for deletion
        },
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
            showError(response.status.description);
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          showError(textStatus, errorThrown);
        },
      });
      $("#confirmDepartmentModal").modal("hide");
    }
  );

  $("#locationTableBody").on("click", "#deleteLocationButton", function () {
    // Get the personnel ID from the data-id attribute
    var locationId = $(this).data("id");

    // Store personnelId globally so it can be accessed inside modal confirm
    $("#confirmDeleteLocationBtn").data("id", locationId);

    // Show the modal
    $("#confirmLocationModal").modal("show");
  });

  $("#confirmLocationModal").on(
    "click",
    "#confirmDeleteLocationBtn",
    function () {
      // Get the personnel ID from the data-id attribute
      var locationId = $(this).data("id");
      // Proceed with AJAX call to delete location
      $.ajax({
        url: "./libs/php/delete.php", // Replace with the correct PHP file
        type: "POST",
        dataType: "json",
        data: {
          id: locationId, // Send location ID to be deleted
          type: "location", // Specify the type as 'location' for deletion
        },
        success: function (response) {
          if (response.status.code == 200) {
            // Optionally refresh personnel list or update the UI
            $("#successModal .modal-body").text(
              "Location deleted successfully."
            );
            $("#successModal").modal("show");
            loadLocationsTable();
            loadDepartmentsTable("refresh");
            loadPersonnelTable("refresh");
          } else {
            // Show error modal with message
            showError(response.status.description);
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          showError(textStatus, errorThrown);
        },
      });
      $("#confirmLocationModal").modal("hide");
    }
  );

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
