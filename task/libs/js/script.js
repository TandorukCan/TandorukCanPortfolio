$(window).on("load", function () {
  if ($("#preloader").length) {
    $("#preloader")
      .delay(1000)
      .fadeOut("slow", function () {
        $(this).remove();
      });
  }
});
$("#btnRun").click(function () {
  $("#divResults2").hide();
  $("#divResults3").hide();
  $("#resultsHeader").hide();
  $("#word").val("");
  $("#lattitude").val("");
  $("#longitude").val("");
  if ($("#selCountry").val() === "") {
    alert("Please Select A Country!");
    return;
  }
  if ($("#streetname").val() === "") {
    alert("Please Enter A Street Name!");
    event.stopPropagation();
    return;
  }
  $("#resultsHeader").fadeIn(1000).css("display", "flex");
  $("#divResults").fadeIn(1000).css("display", "flex");

  $.ajax({
    url: "libs/php/streetNameLookup.php",
    type: "POST",
    dataType: "json",
    data: {
      country: $("#selCountry").val(),
      street: $("#streetname").val(),
    },
    success: function (result) {
      if (result.status.name == "ok") {
        $("#countryCode").html(result["data"][0]["countryCode"]);
        $("#postalCode").html(result["data"][0]["postalcode"]);
        $("#streetName").html(result["data"][0]["street"]);
        $("#adminName1").html(result["data"][0]["adminName1"]);
        $("#adminName2").html(result["data"][0]["adminName2"]);
        $("#lng").html(result["data"][0]["lng"]);
        $("#lat").html(result["data"][0]["lat"]);
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log("AJAX Error (Street Name Lookup):", textStatus, errorThrown);
      var errorMessage = "An error occurred while fetching street information.";
      if (jqXHR.status) {
        if (jqXHR.status === 400) {
          errorMessage = "Bad request. Please check your input parameters.";
        } else if (jqXHR.status === 500) {
          errorMessage = "Internal server error. Please try again later.";
        }
      }
      alert(errorMessage);
    },
  });
});

$("#btnRun2").click(function () {
  $("#divResults").hide();
  $("#divResults3").hide();
  $("#resultsHeader").hide();
  $("#streetname").val("");
  $("#lattitude").val("");
  $("#longitude").val("");
  $("#selCountry").val("");
  if ($("#word").val() === "") {
    alert("Please Enter A Place Name!");
    return;
  }

  $("#resultsHeader").fadeIn(1000).css("display", "flex");
  $("#divResults2").fadeIn(1000).css("display", "flex");

  $.ajax({
    url: "libs/php/wikipediaSearch.php",
    type: "POST",
    dataType: "json",
    data: {
      word: $("#word").val(),
    },
    success: function (result) {
      if (result.status.name == "ok") {
        $("#summary").html(result["data"][0]["summary"]);
        $("#countryCode2").html(result["data"][0]["countryCode"]);
        $("#title").html(result["data"][0]["title"]);
        $("#feature").html(result["data"][0]["feature"]);
        $("#wikipediaUrl").html(result["data"][0]["wikipediaUrl"]);
        $("#lng2").html(result["data"][0]["lng"]);
        $("#lat2").html(result["data"][0]["lat"]);
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log("AJAX Error (Wikipedia Search):", textStatus, errorThrown);
      var errorMessage = "An error occurred while fetching street information.";
      if (jqXHR.status) {
        if (jqXHR.status === 400) {
          errorMessage = "Bad request. Please check your input parameters.";
        } else if (jqXHR.status === 500) {
          errorMessage = "Internal server error. Please try again later.";
        }
      }
      alert(errorMessage);
    },
  });
});

$("#btnRun3").click(function () {
  $("#divResults").hide();
  $("#divResults2").hide();
  $("#resultsHeader").hide();
  $("#streetname").val("");
  $("#word").val("");
  $("#selCountry").val("");
  if ($("#lattitude").val() === "" || $("#longitude").val() === "") {
    alert("Please Enter Both Coordinates!");
    return;
  }
  $("#resultsHeader").fadeIn(1000).css("display", "flex");
  $("#divResults3").fadeIn(1000).css("display", "flex");

  $.ajax({
    url: "libs/php/findNearbyPlaceName.php",
    type: "POST",
    dataType: "json",
    data: {
      lat: $("#lattitude").val(),
      lng: $("#longitude").val(),
    },
    success: function (result) {
      if (result.status.name == "ok") {
        $("#toponymName").html(result["data"][0]["toponymName"]);
        $("#countryName").html(result["data"][0]["countryName"]);
        $("#state").html(result["data"][0]["adminName1"]);
        $("#distance").html(result["data"][0]["distance"]);
        $("#lng3").html(result["data"][0]["lng"]);
        $("#lat3").html(result["data"][0]["lat"]);
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log("AJAX Error (Find Nearby Place):", textStatus, errorThrown);
      var errorMessage = "An error occurred while fetching street information.";
      if (jqXHR.status) {
        if (jqXHR.status === 400) {
          errorMessage = "Bad request. Please check your input parameters.";
        } else if (jqXHR.status === 500) {
          errorMessage = "Internal server error. Please try again later.";
        }
      }
      alert(errorMessage);
    },
  });
});
