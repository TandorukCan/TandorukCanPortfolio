$(document).ready(function () {
  // Call the function to load the personnel table when the page loads
  loadPersonnelTable();

  $("#searchInp").on("keyup", function () {
    // your code
  });

  $("#refreshBtn").click(function () {
    if ($("#personnelBtn").hasClass("active")) {
      // Refresh personnel table
      console.log("you are in personnel");
      loadPersonnelTable();
    } else {
      if ($("#departmentsBtn").hasClass("active")) {
        console.log("you are in departments");
        loadDepartmentsTable();
        // Refresh department table
      } else {
        // Refresh location table
        console.log("you are in locations");
        loadLocationsTable();
      }
    }
  });

  $("#filterBtn").click(function () {
    // Open a modal of your own design that allows the user to apply a filter to the personnel table on either department or location
  });

  $("#addBtn").click(function () {
    // Replicate the logic of the refresh button click to open the add modal for the table that is currently on display
    if ($("#personnelBtn").hasClass("active")) {
      // Refresh personnel table
      console.log("you are adding in personnel");
    } else {
      if ($("#departmentsBtn").hasClass("active")) {
        console.log("you are adding in departments");
        // Refresh department table
      } else {
        // Refresh location table
        console.log("you are adding in locations");
      }
    }
  });

  $("#personnelBtn").click(function () {
    // Call function to refresh personnel table
    $("#addBtn").attr("data-bs-target", "#editPersonnelModal");
    console.log("you clicked on personnel tab");
    loadPersonnelTable();
  });

  $("#departmentsBtn").click(function () {
    // Call function to refresh department table\
    $("#addBtn").attr("data-bs-target", "#editDepartmentModal");
    console.log("you clicked on departments tab");
    loadDepartmentsTable();
  });

  $("#locationsBtn").click(function () {
    // Call function to refresh location table
    $("#addBtn").attr("data-bs-target", "#editLocationModal");
    console.log("you clicked on locations tab");
    loadLocationsTable();
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
          console.log($(e.relatedTarget).attr("data-id"));
          var resultCode = result.status.code;

          if (resultCode == 200) {
            // Update the hidden input with the employee id so that
            // it can be referenced when the form is submitted
            console.log(result);

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
          console.log(result);
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
      console.log("inserted personnel data");
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
      console.log("pretending to edit department data");
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
      console.log("pretending to insert department data");
      //above code will me commented in once insertDepartment.php is checked and made sure to be working
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
        console.log($(e.relatedTarget).attr("data-id"));
        var resultCode = result.status.code;

        if (resultCode == 200) {
          // Update the hidden input with the employee id so that
          // it can be referenced when the form is submitted
          console.log(result);

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

    console.log("i'm in adding mode");
  }
});

function loadPersonnelTable() {
  $.ajax({
    url: "./libs/php/getAll.php",
    type: "GET",
    dataType: "json",
    success: function (result) {
      console.log(result);
      var resultCode = result.status.code;

      if (resultCode == 200) {
        // Update the hidden input with the employee id so that
        // it can be referenced when the form is submitted

        // Clear any existing rows in the table body
        $("#personnelTableBody").empty();

        $.each(result.data, function (index, person) {
          $("#personnelTableBody").append(`
        <tr>
          <td class="align-middle text-nowrap">${person.lastName}, ${person.firstName}</td>
          <td class="align-middle text-nowrap d-md-table-cell">${person.department}</td>
          <td class="align-middle text-nowrap d-md-table-cell">${person.location}</td>
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
              data-bs-toggle="modal"
              data-bs-target="#deletePersonnelModal"
              data-id="${person.id}"
            >
              <i class="fa-solid fa-trash fa-fw"></i>
            </button>
          </td>
        </tr>
      `);
        });
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

function loadDepartmentsTable() {
  $.ajax({
    url: "./libs/php/getAllDepartments.php",
    type: "GET",
    dataType: "json",
    success: function (result) {
      console.log(result);
      var resultCode = result.status.code;

      if (resultCode == 200) {
        // Update the hidden input with the employee id so that
        // it can be referenced when the form is submitted

        // Clear any existing rows in the table body
        $("#departmentTableBody").empty();

        $.each(result.data, function (index, department) {
          $("#departmentTableBody").append(`
            <tr>
            <td class="align-middle text-nowrap">${department.name}</td>
            <td class="align-middle text-nowrap d-md-table-cell">${department.locationName}</td>
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
                class="btn btn-primary btn-sm deleteDepartmentBtn"
                data-id="${department.id}"
              >
                <i class="fa-solid fa-trash fa-fw"></i>
              </button>
            </td>
          </tr>
        `);
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
  $.ajax({
    url: "./libs/php/getAllLocations.php",
    type: "GET",
    dataType: "json",
    success: function (result) {
      console.log(result);
      var resultCode = result.status.code;

      if (resultCode == 200) {
        // Update the hidden input with the employee id so that
        // it can be referenced when the form is submitted

        // Clear any existing rows in the table body
        $("#locationTableBody").empty();

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
                class="btn btn-primary btn-sm deleteDepartmentBtn"
                data-id="${location.id}"
              >
                <i class="fa-solid fa-trash fa-fw"></i>
              </button>
            </td>
          </tr>
        `);
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
