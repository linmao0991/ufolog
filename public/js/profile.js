// Profile JS
$(document).ready(function () {

  var loggedin = false;
  var user_Name = "";
  //var formData = new FormData();

  // Display user info
  function userInfo() {
    $.get("/api/user_data", function (data) {}).then(function (data) {
      if (data.userName !== "" || !data.userName === null) {
        loggedin = true;
        user_Name = data.userName;
        console.log(data);
        $("#profile-description").text(data.aboutMe);
        $(".profile-name").text(data.userName);
        $("img#profileImg").attr("src", data.profileurl)
        getAllLogs(data.id)
      } else {
        alert("Error: Not Logged in!");
        //Add code to redirect to home page.
      }
    });
  };

  // Log Sighting Button
  $("#log_sighting").on("click", function (event) {
    event.preventDefault();
    $("#logging_modal").modal("toggle");
  });

  // Manual coordinate on click button
  $("#manualLocation").on("click", function (event) {
    event.preventDefault()
    $("#coordinate_modal").modal("toggle");
  });

  // Manual coordinate submission
  $("form.coordinate").on("submit", function (event) {
    event.preventDefault();
    var mylat = $("#manual_lat").val().trim();
    var mylng = $("#manual_lng").val().trim();
    $("#mylat").text(mylat);
    $("#mylng").text(mylng);
    $("#coordinate_modal").modal("toggle");
  });

  // $("#logImg").on("change", function () {
  //   var files = $("#logImg").get(0).files;
  //   var file = files[0];
  //   formData.append("photo", file, file.name);
  //   console.log(formData);
  // });

  // // Sighting log form submission
  // $("form.sightinglog").on("submit", function (event) {
  //   event.preventDefault();
  //   var logData = {};
  //   $.get("/api/user_data", function (err, res) {}).then(function (data) {
  //     // console.log(data);
  //     //Creating log data object
  //     logData.rating = {
  //       likes: 0,
  //       dislikes: 0
  //     };
  //     logData.userName = data.userName;
  //     logData.UserId = data.id;
  //     logData.title = $("#log_title").val().trim();
  //     logData.description = $("#log_description").val();
  //     logData.category = "UFO";
  //     // logData.UserId = data.id;
  //     // console.log($("#mylat").text());
  //     if ($("#mylat").text() === "" || $("#mylng").text() === "") {
  //       $("#mylat").parent().addClass("border border-danger")
  //       $("#mylng").parent().addClass("border border-danger")
  //       alert('Please enter coordinates.');
  //     } else {
  //       logData.coordinatesLat = parseFloat($("#mylat").text());
  //       logData.coordinatesLng = parseFloat($("#mylng").text());
  //       $("form.sightinglog, form.coordinate").trigger("reset");
  //       $("#mylat,#mylng").text("");
  //       $("#logging_modal").modal("toggle");
  //       console.log("Line 223");
  //       uploadLogPhoto(formData).then(function (success) {
  //         logData.image = success[0].publicPath;
  //         console.log(logData.image);
  //         submitLog(logData);
  //       });
  //     };
  //   });
  // });

  //Get coordinates button
  //**Add a loading animation while getting coordinates
  // $("#getlocation").on("click", function (event) {
  //   $("#mylat").text("");
  //   $("#mylng").text("");
  //   event.preventDefault();
  //   if (navigator.geolocation) {
  //     navigator.geolocation.getCurrentPosition(function (position) {
  //       $("#mylat").text(position.coords.latitude);
  //       $("#mylng").text(position.coords.longitude);
  //       $("#manual_lat").val(position.coords.latitude);
  //       $("#manual_lng").val(position.coords.longitude);
  //     });
  //   } else {
  //     alert("Geolocation is not supported by this browser.");
  //   }
  // });

  // function uploadLogPhoto(fileData) {
  //   console.log("Upload Log Photo")
  //   return new Promise(function (reslove, reject) {
  //     $.ajax({
  //       url: "/logImg/upload",
  //       data: fileData,
  //       contentType: false,
  //       processData: false,
  //       method: "POST",
  //       success: function (data) {
  //         return reslove(data)
  //       }
  //     });
  //   });
  // }

  //Submit new log function
  // function submitLog(logData) {
  //   console.log("submtting");
  //   var data = [];
  //   var rating = {
  //     likes: 0,
  //     dislikes: 0
  //   }
  //   $.post("/api/sighting/log", logData, function () {
  //     alert("Sighting Logged");
  //   }).then(function (res) {
  //     //sets data to res object
  //     data = res;
  //     //insert new rating object into data object
  //     data.rating = rating;
  //     createLogCard(data);
  //   });
  // }


  //Get all logs
  function getAllLogs(dataID) {
    $.get("/api/ufo/sightings/byuser/" + dataID, function (res) {

    }).then(function (data) {
      for (var i = 0; i < data.length; i++) {
        var logData = data[i];
        console.log(logData);
        getRating(logData).then(function (success) {
          console.log(logData);
        });
      }
    });
  }

  //Get likes and dislikes for a single log
  function getRating(data) {
    var logData = data
    return new Promise(function (reslove, reject) {
      $.get("/api/ufo/sightings/get_rating/" + data.id, function (res) {
        return reslove(res);
      }).then(function (response) {
        //inserts response likes/dislikes object into single log data object
        logData.rating = response;
        console.log(logData);
        createLogCard(logData);
      });
    });
  }

  //Like button function
  $(document).on("click", "button.likebutton", function () {
    //checks if user is logged in
    if (!loggedin) {
      alert("Please log in to rate log");
    } else {
      $(this).prop('disabled', true);
      var button = this;
      var logID = $(button).attr("data-logid")
      var ratingData = {
        userName: user_Name,
        id: $(button).attr("data-logid"),
        rating: "like"
      }
      updateRating(ratingData).then(function (success) {
        console.log(success);
        $("#likelog" + logID).text(success.likes);
        $(button).prop('disabled', false);
      }).catch(function (error) {
        alert(error.code + " : " + error.reason);
      });
    }
  });

  //DisLike button function
  $(document).on("click", "button.dislikebutton", function () {
    //checks if user is logged in
    if (!loggedin) {
      alert("Please log in to rate log");
    } else {
      $(this).prop('disabled', true);
      var button = this;
      var logID = $(button).attr("data-logid")
      var ratingData = {
        userName: user_Name,
        id: $(button).attr("data-logid"),
        rating: "dislike"
      }
      updateRating(ratingData).then(function (success) {
        $("#dislikelog" + logID).text(success.dislikes);
        $(button).prop('disabled', false);
      }).catch(function (error) {
        alert(error.code + " : " + error.reason);
      });
    }
  });

  // Promise function to update rating and return ratings value
  function updateRating(data) {
    var ratingData = data;
    return new Promise(function (reslove, reject) {
      $.post("/api/sighting/log/rating/" + ratingData.id, ratingData, function (res) {}).then(function (response) {
        if (response.code !== "Denied") {
          $.get("/api/ufo/sightings/get_rating/" + ratingData.id, function (data) {}).then(function (response) {
            return reslove(response)
          });
        } else {
          return reject(response);
        }
      });
    });
  }

  //Log Card creation function
  function createLogCard(Data) {
    // console.log("======Create Card=========")
    // console.log(Data)
    //Create Card Div
    var cardDiv = $("<div>").addClass("card m-2 logCard");
    //Creating row with no gutters
    var rowDiv = $("<div>").addClass("row no-gutters");
    //Creating Image div
    var imgDiv = $("<div>").addClass("col-lg-4 d-flex align-items-center justify-content-center p-2");
    var img = $("<img>").addClass("card-img").attr({
      "src": Data.image,
      "alt": "UFO Image"
    });
    imgDiv.append(img);

    //Create card content div
    var mainDiv = $("<div>").addClass("col-lg-8");
    var headerDiv = $("<div>").addClass("card-header border-success border rounded").html("<h5>" + Data.title + "</h5");
    var bodyDiv = $("<div>").addClass("card-body").html("<p>" + Data.description + "</p>");
    var divFooter = $("<div>").addClass("card-footer").attr("id", "ufolog" + Data.id);
    //Like Button
    var likeButton = $("<button>").addClass("btn rateBtn likebutton").attr("data-logid", Data.id);
    likeButton.append("<i class='far fa-thumbs-up'></i>");
    //Dislike Button
    var dislikeButton = $("<button>").addClass("btn rateBtn dislikebutton").attr("data-logid", Data.id);
    dislikeButton.append("<i class='far fa-thumbs-down'></i>");
    //Log Data
    var footerData = $("<p>").addClass("float-right").html("<span>" + moment(Data.createdAt).format("MMM D, YYYY h:mm A ") + "</span>-<span> " + Data.userName + "</span>")
    //Append to footer
    divFooter.append(likeButton, "<span id='likelog" + Data.id + "'>" + Data.rating.likes + "</span>", dislikeButton, "<span id='dislikelog" + Data.id + "'> " + Data.rating.dislikes + "</span>", footerData);
    //Append all content to mainDiv
    mainDiv.append(headerDiv, bodyDiv, divFooter);
    //Append to row with no gutters
    rowDiv.append(imgDiv, mainDiv);
    //Append to card Div
    cardDiv.append(rowDiv);
    //Append to html page
    $("#log_display").prepend(cardDiv);
  };

  $.get("/api/user_data", function (data) {
    // console.log(data);
  }).then(function (data) {
    // If logged out, display login & signup buttons
    if (data.userName == null) {
      $("#login").css("display", "inherit");
      $("#signup").css("display", "inherit");
      $("#signout").css("display", "none");
      $("#profile").css("display", "none");
      $("#log_sighting").css("display", "none");
    }
    // If logged in, display signout & profile buttons
    else {
      $("#login").css("display", "none");
      $("#signup").css("display", "none");
      $("#signout").css("display", "inherit");
      $("#profile").css("display", "none");
      $("#log_sighting").css("display", "none");
    }
  });

  userInfo();
});