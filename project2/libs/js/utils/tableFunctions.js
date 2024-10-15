import { handleError, showError } from "./helperFunctions.js";

function populatePersonnelTable(data) {
  var frag = document.createDocumentFragment();

  data.forEach(function (item, index) {
    var row = document.createElement("tr");

    var name = document.createElement("td");
    var firstName = document.createTextNode(item.firstName);
    var lastName = document.createTextNode(item.lastName);
    var comma = document.createTextNode(", ");
    name.append(lastName);
    name.append(comma);
    name.append(firstName);
    name.setAttribute("class", "align-middle text-wrap d-md-table-cell");
    row.append(name);

    var jobTitle = document.createElement("td");
    var jobText = document.createTextNode(item.jobTitle);
    jobTitle.setAttribute(
      "class",
      "align-middle text-nowrap d-lg-table-cell d-none"
    );
    jobTitle.append(jobText);

    row.append(jobTitle);

    var department = document.createElement("td");
    var departmentText = document.createTextNode(item.department);
    department.append(departmentText);
    department.setAttribute("class", "align-middle text-wrap d-md-table-cell");

    row.append(department);

    var location = document.createElement("td");
    var locationText = document.createTextNode(item.location);
    location.setAttribute("class", "align-middle text-wrap d-md-table-cell");
    location.append(locationText);

    row.append(location);

    var email = document.createElement("td");
    var emailText = document.createTextNode(item.email);
    email.setAttribute(
      "class",
      "align-middle text-nowrap d-lg-table-cell d-none"
    );
    email.append(emailText);

    row.append(email);

    var buttonContainer = document.createElement("td");
    buttonContainer.setAttribute(
      "class",
      "align-middle text-wrap d-md-table-cell"
    );

    var edtBtn = document.createElement("button");
    edtBtn.setAttribute("type", "button");
    edtBtn.setAttribute("class", "btn btn-primary btn-sm");
    edtBtn.setAttribute("data-bs-toggle", "modal");
    edtBtn.setAttribute("data-bs-target", "#editPersonnelModal");
    edtBtn.setAttribute("data-id", item.id);

    var edtIcon = document.createElement("i");
    edtIcon.setAttribute("class", "fa-solid fa-pencil fa-fw");
    edtBtn.append(edtIcon);

    var dltBtn = document.createElement("button");
    dltBtn.setAttribute("type", "button");
    dltBtn.setAttribute("class", "btn btn-primary btn-sm deletePersonnelBtn");
    dltBtn.setAttribute("data-bs-toggle", "modal");
    dltBtn.setAttribute("data-bs-target", "#deletePersonnelModal");
    dltBtn.setAttribute("data-id", item.id);

    var dltIcon = document.createElement("i");
    dltIcon.setAttribute("class", "fa-solid fa-trash fa-fw");
    dltBtn.append(dltIcon);

    buttonContainer.append(edtBtn);
    buttonContainer.append(dltBtn);

    row.append(buttonContainer);

    frag.append(row);
  });

  $("#personnelTableBody").append(frag);
  $("#personnelLoader").hide();
}

function populateDepartmentTable(data) {
  var frag = document.createDocumentFragment();
  data.forEach(function (item, index) {
    var row = document.createElement("tr");

    var department = document.createElement("td");
    var departmentName = document.createTextNode(item.name);
    department.append(departmentName);
    department.setAttribute("class", "align-middle text-wrap");
    row.append(department);

    var location = document.createElement("td");
    var locationName = document.createTextNode(item.locationName);
    location.setAttribute("class", "align-middle text-wrap d-md-table-cell");
    location.append(locationName);
    row.append(location);

    var buttonContainer = document.createElement("td");
    buttonContainer.setAttribute("class", "align-middle text-end text-nowrap");

    var edtBtn = document.createElement("button");
    edtBtn.setAttribute("type", "button");
    edtBtn.setAttribute("class", "btn btn-primary btn-sm");
    edtBtn.setAttribute("data-bs-toggle", "modal");
    edtBtn.setAttribute("data-bs-target", "#editDepartmentModal");
    edtBtn.setAttribute("data-id", item.id);

    var edtIcon = document.createElement("i");
    edtIcon.setAttribute("class", "fa-solid fa-pencil fa-fw");
    edtBtn.append(edtIcon);

    var dltBtn = document.createElement("button");
    dltBtn.setAttribute("type", "button");
    dltBtn.setAttribute("class", "btn btn-primary btn-sm deleteDepartmentBtn");
    dltBtn.setAttribute("data-id", item.id);

    var dltIcon = document.createElement("i");
    dltIcon.setAttribute("class", "fa-solid fa-trash fa-fw");
    dltBtn.append(dltIcon);

    buttonContainer.append(edtBtn);
    buttonContainer.append(dltBtn);

    row.append(buttonContainer);

    frag.append(row);
  });
  $("#departmentTableBody").append(frag);
  $("#departmentLoader").hide();
}

function populateLocationTable(data) {
  var frag = document.createDocumentFragment();

  data.forEach(function (item, index) {
    var row = document.createElement("tr");

    var location = document.createElement("td");
    var locationName = document.createTextNode(item.name);
    location.append(locationName);
    location.setAttribute("class", "align-middle text-nowrap");
    row.append(location);

    var buttonContainer = document.createElement("td");
    buttonContainer.setAttribute("class", "align-middle text-end text-nowrap");

    var edtBtn = document.createElement("button");
    edtBtn.setAttribute("type", "button");
    edtBtn.setAttribute("class", "btn btn-primary btn-sm");
    edtBtn.setAttribute("data-bs-toggle", "modal");
    edtBtn.setAttribute("data-bs-target", "#editLocationModal");
    edtBtn.setAttribute("data-id", item.id);

    var edtIcon = document.createElement("i");
    edtIcon.setAttribute("class", "fa-solid fa-pencil fa-fw");
    edtBtn.append(edtIcon);

    var dltBtn = document.createElement("button");
    dltBtn.setAttribute("type", "button");
    dltBtn.setAttribute("class", "btn btn-primary btn-sm deleteLocationBtn");
    dltBtn.setAttribute("data-id", item.id);

    var dltIcon = document.createElement("i");
    dltIcon.setAttribute("class", "fa-solid fa-trash fa-fw");
    dltBtn.append(dltIcon);

    buttonContainer.append(edtBtn);
    buttonContainer.append(dltBtn);

    row.append(buttonContainer);

    frag.append(row);
  });

  $("#locationTableBody").append(frag);
  $("#locationLoader").hide();
}

function loadDepartmentsTable(searchData) {
  // Clear any existing rows in the table body and add a loader
  if (searchData === "refresh") {
    $("#searchInp").val("");
  }
  $("#departmentTableBody").empty().append(`<div id="departmentLoader"></div>`);

  if (searchData !== "refresh") {
    // table will be populated based on search term
    populateDepartmentTable(searchData);
  } else {
    $.ajax({
      url: "./libs/php/getAll.php",
      type: "GET",
      dataType: "json",
      data: {
        entityType: "department", // Specify the type as 'department' for reading
      },
      success: function (result) {
        var resultCode = result.status.code;

        if (resultCode == 200) {
          // Update the hidden input with the employee id so that
          // it can be referenced when the form is submitted
          populateDepartmentTable(result.data);
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
}

function loadLocationsTable(searchData) {
  // Clear any existing rows in the table body and add a loader
  if (searchData === "refresh") {
    $("#searchInp").val("");
  }
  $("#locationTableBody").empty().append(`<div id="locationLoader"></div>`);

  if (searchData !== "refresh") {
    // table will be populated based on search term
    populateLocationTable(searchData);
  } else {
    $.ajax({
      url: "./libs/php/getAll.php",
      type: "GET",
      dataType: "json",
      data: {
        entityType: "location", // Specify the type as 'location' for reading
      },
      success: function (result) {
        var resultCode = result.status.code;

        if (resultCode == 200) {
          // Update the hidden input with the employee id so that
          // it can be referenced when the form is submitted
          populateLocationTable(result.data);
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
}

//write a code to reset the fields in filter modal when it's class is equal to "modal fade" instead of "modal fade show"
function filterTable(input, option) {
  // If the location is "Select All", show all rows
  $("#personnelTableBody")
    .empty()
    .append(`<div id="personnelLoader" style="display: none;"></div>`);
  $("#personnelLoader").show();
  // var searchTerm = $("#searchInp").val().trim();
  let data = {
    txt: $("#searchInp").val().trim(),
    filter: option, // 'all', 'department', or 'location'
    input: input,
  };

  $.ajax({
    url: "./libs/php/searchInPersonnel.php",
    type: "GET",
    dataType: "json",
    data: data,
    success: function (response) {
      if (response.status.code == 200) {
        // Update the table with the search results
        populatePersonnelTable(response.data.found);
      } else {
        // Show error modal with message
        showError(response.status.message);
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      showError(textStatus, errorThrown);
    },
  });
}

export {
  loadDepartmentsTable,
  loadLocationsTable,
  filterTable,
  populatePersonnelTable,
};
