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
    const rowId = $(this).find(".deletePersonnelBtn").data("id");
    // Skip this iteration if the rowId matches the provided id
    if (rowId == id) {
      return true; // Continue to the next iteration
    }

    // Check if the email matches the provided parameter
    if (emailCell === email.trim()) {
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
    const rowId = $(this).find(".deleteDepartmentBtn").data("id");
    // Skip this iteration if the rowId matches the provided id
    if (rowId == id) {
      return true; // Continue to the next iteration
    }

    // Check if the email matches the provided parameter
    if (departmentName === department.trim()) {
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
    const rowId = $(this).find(".deleteLocationBtn").data("id");
    // Skip this iteration if the rowId matches the provided id
    if (rowId == id) {
      return true; // Continue to the next iteration
    }

    // Check if the email matches the provided parameter
    if (locationName === location.trim()) {
      isDuplicate = true;
      return false; // Break out of the loop
    }
  });

  return isDuplicate;
}

export {
  checkForDuplicateEmailForInsertion,
  checkForDuplicateEmailForUpdate,
  checkDuplicateDepartmentForInsertion,
  checkDuplicateDepartmentForUpdate,
  checkDuplicateLocationForInsertion,
  checkDuplicateLocationForUpdate,
};
