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
  });

  $("#personnelBtn").click(function () {
    // Call function to refresh personnel table
  });

  $("#departmentsBtn").click(function () {
    // Call function to refresh department table
    console.log("you clicked on departments tab");
    loadDepartmentsTable();
  });

  $("#locationsBtn").click(function () {
    // Call function to refresh location table
    console.log("you clicked on locations tab");
    loadLocationsTable();
  });

  $("#editPersonnelModal").on("show.bs.modal", function (e) {
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

          $("#editPersonnelDepartment").val(
            result.data.personnel[0].departmentID
          );
        } else {
          $("#editPersonnelModal .modal-title").replaceWith(
            "Error retrieving data"
          );
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        $("#editPersonnelModal .modal-title").replaceWith(
          "Error retrieving data"
        );
      },
    });
  });

  // Executes when the form button with type="submit" is clicked

  $("#editPersonnelForm").on("submit", function (e) {
    // Executes when the form button with type="submit" is clicked
    // stop the default browser behviour

    e.preventDefault();

    // AJAX call to save form data
  });
});

$("#editDepartmentModal").on("show.bs.modal", function (e) {
  $.ajax({
    url: "./libs/php/getDepartmentByID.php",
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

        $("#editDepartmentID").val(result.data[0].id);

        $("#editDepartmentName").val(result.data[0].name);
        $("#editLocationId").val(result.data[0].locationName);

        // to be edited accordingly

        // $("#editPersonnelDepartment").html("");

        // $.each(result.data.department, function () {
        //   $("#editPersonnelDepartment").append(
        //     $("<option>", {
        //       value: this.id,
        //       text: this.name,
        //     })
        //   );
        // });

        // $("#editPersonnelDepartment").val(
        //   result.data.personnel[0].departmentID
        // );
      } else {
        $("#editDepartmentModal .modal-title").replaceWith(
          "Error retrieving data"
        );
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      $("#editDepartmentModal .modal-title").replaceWith(
        "Error retrieving data"
      );
    },
  });
});

$("#editLocationModal").on("show.bs.modal", function (e) {
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
        $("#editLocationModal .modal-title").replaceWith(
          "Error retrieving data"
        );
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      $("#editLocationModal .modal-title").replaceWith("Error retrieving data");
    },
  });
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
        // console.log(result.data[0]);

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

        // $("#editPersonnelDepartment").val(
        //   result.data.personnel[0].departmentID
        // );
      } else {
        // $("#editPersonnelModal .modal-title").replaceWith(
        //   "Error retrieving data"
        // );
        console.log("ERROR");
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      $("#editPersonnelModal .modal-title").replaceWith(
        "Error retrieving data"
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
        // console.log(result.data[0]);

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

        // $("#editPersonnelDepartment").val(
        //   result.data.personnel[0].departmentID
        // );
      } else {
        // $("#editPersonnelModal .modal-title").replaceWith(
        //   "Error retrieving data"
        // );
        console.log("ERROR");
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      $("#editPersonnelModal .modal-title").replaceWith(
        "Error retrieving data"
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
        // console.log(result.data[0]);

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

        // $("#editPersonnelDepartment").val(
        //   result.data.personnel[0].departmentID
        // );
      } else {
        // $("#editPersonnelModal .modal-title").replaceWith(
        //   "Error retrieving data"
        // );
        console.log("ERROR");
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      $("#editPersonnelModal .modal-title").replaceWith(
        "Error retrieving data"
      );
    },
  });
}
