var map;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 41.4993,
            lng: -81.6944
        },
        zoom: 8,
        styles: [{
                elementType: 'geometry',
                stylers: [{
                    color: '#242f3e'
                }]
            },
            {
                elementType: 'labels.text.stroke',
                stylers: [{
                    color: '#242f3e'
                }]
            },
            {
                elementType: 'labels.text.fill',
                stylers: [{
                    color: '#746855'
                }]
            },
            {
                featureType: 'administrative.locality',
                elementType: 'labels.text.fill',
                stylers: [{
                    color: '#d59563'
                }]
            },
            {
                featureType: 'poi',
                elementType: 'labels.text.fill',
                stylers: [{
                    color: '#d59563'
                }]
            },
            {
                featureType: 'poi.park',
                elementType: 'geometry',
                stylers: [{
                    color: '#263c3f'
                }]
            },
            {
                featureType: 'poi.park',
                elementType: 'labels.text.fill',
                stylers: [{
                    color: '#6b9a76'
                }]
            },
            {
                featureType: 'road',
                elementType: 'geometry',
                stylers: [{
                    color: '#38414e'
                }]
            },
            {
                featureType: 'road',
                elementType: 'geometry.stroke',
                stylers: [{
                    color: '#212a37'
                }]
            },
            {
                featureType: 'road',
                elementType: 'labels.text.fill',
                stylers: [{
                    color: '#9ca5b3'
                }]
            },
            {
                featureType: 'road.highway',
                elementType: 'geometry',
                stylers: [{
                    color: '#746855'
                }]
            },
            {
                featureType: 'road.highway',
                elementType: 'geometry.stroke',
                stylers: [{
                    color: '#1f2835'
                }]
            },
            {
                featureType: 'road.highway',
                elementType: 'labels.text.fill',
                stylers: [{
                    color: '#f3d19c'
                }]
            },
            {
                featureType: 'transit',
                elementType: 'geometry',
                stylers: [{
                    color: '#2f3948'
                }]
            },
            {
                featureType: 'transit.station',
                elementType: 'labels.text.fill',
                stylers: [{
                    color: '#d59563'
                }]
            },
            {
                featureType: 'water',
                elementType: 'geometry',
                stylers: [{
                    color: '#17263c'
                }]
            },
            {
                featureType: 'water',
                elementType: 'labels.text.fill',
                stylers: [{
                    color: '#515c6d'
                }]
            },
            {
                featureType: 'water',
                elementType: 'labels.text.stroke',
                stylers: [{
                    color: '#17263c'
                }]
            }
        ]
    });
}

$(document).ready(function () {

    var loggedin = false;
    var user_Name = "";
    var formData = new FormData();

    // Display user info
    function userInfo() {
        $.get("/api/user_data", function (data) {}).then(function (data) {
            //Sets user as logged in if true
            if (typeof data.userName !== "undefined" || typeof data.userName !== null) {
                loggedin = true;
                user_Name = data.userName;
                // console.log(user_Name);
                // console.log(loggedin);
            }
        });
    };
    // Signing Up
    $("#signup").on("click", function (event) {
        event.preventDefault();
        $("#results-modal-signup").modal("toggle");
    });

    //Logging In
    $("#login").on("click", function (event) {
        event.preventDefault();
        $("#results-modal-login").modal("toggle");
    });

    // Log Sighting Button
    $("#log_sighting").on("click", function (event) {
        event.preventDefault();
        $("#logging_modal").modal("toggle");
    });

    // Manual coordinate on click button
    $("#manualLocation").on("click", function (event) {
        event.preventDefault()
        $("#coordinate_modal").modal("toggle");
    })

    // Manual coordinate submission
    $("form.coordinate").on("submit", function (event) {
        event.preventDefault();
        var mylat = $("#manual_lat").val().trim();
        var mylng = $("#manual_lng").val().trim();
        $("#mylat").text(mylat);
        $("#mylng").text(mylng);
        $("#coordinate_modal").modal("toggle");
    });

    $("#logImg").on("change", function(){
        var files = document.getElementById("logImg").files;
        var file = files[0];
        getSignedRequest(file);
        //**Code below this is used for uploading to local storage */
        //formData.append("photo", file, file.name);
    });

    function getSignedRequest(file){
        var xhr = new XMLHttpRequest();
        xhr.open('GET', `/sign-s3?file-name=${file.name}&file-type=${file.type}`);
        xhr.onreadystatechange = () => {
            if(xhr.readyState === 4){
            if(xhr.status === 200){
                var response = JSON.parse(xhr.responseText);
                uploadFile(file, response.signedRequest, response.url);
            }
            else{
                alert('Could not get signed URL.');
            }
            }
        };
        xhr.send();
    }
    
    function uploadFile(file, signedRequest, url){
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', signedRequest);
    xhr.onreadystatechange = () => {
        if(xhr.readyState === 4){
        if(xhr.status === 200){
            document.getElementById('ufo-preview').src = url;
            //document.getElementById('avatar-url').value = url;
        }
        else{
            alert('Could not upload file.');
        }
        }
    };
    xhr.send(file);
    }

    // Sighting log form submission
    $("form.sightinglog").on("submit", function (event) {
        event.preventDefault();
        var logData = {};
        $.get("/api/user_data", function (err, res) {}).then(function (data) {
            //Creating log data object
            logData.rating = {
                likes: 0,
                dislikes: 0
            };
            logData.userName = data.userName;
            logData.UserId = data.id;
            logData.title = $("#log_title").val().trim();
            logData.description = $("#log_description").val();
            logData.category = "UFO";
            logData.image = $("#ufo-preview").attr("src");
            if ($("#mylat").text() === "" || $("#mylng").text() === "") {
                $("#mylat").parent().addClass("border border-danger")
                $("#mylng").parent().addClass("border border-danger")
                alert('Please enter coordinates.');
            } else {
                logData.coordinatesLat = parseFloat($("#mylat").text());
                logData.coordinatesLng = parseFloat($("#mylng").text());
                $("form.sightinglog, form.coordinate").trigger("reset");
                $("#mylat,#mylng").text("");
                $("#logging_modal").modal("toggle");
                console.log("Line 223");
                console.log(logData.image);
                submitLog(logData);
            };
        });
    });

    //Get coordinates button
    //**Add a loading animation while getting coordinates
    $("#getlocation").on("click", function (event) {
        $("#mylat").text("");
        $("#mylng").text("");
        event.preventDefault();
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                $("#mylat").text(position.coords.latitude);
                $("#mylng").text(position.coords.longitude);
                $("#manual_lat").val(position.coords.latitude);
                $("#manual_lng").val(position.coords.longitude);
            });
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    });
    
    //**Function for Uploading photos to local folder, does not work on GitHub */
    // function uploadLogPhoto(fileData){
    //     console.log("Upload Log Photo")
    //     return new Promise(function (reslove, reject) {
    //       $.ajax({
    //         url: "/logImg/upload",
    //         data: fileData,
    //         contentType: false,
    //         processData: false,
    //         method: "POST",
    //         success: function(data){
    //           return reslove(data)
    //         }
    //       });
    //     });
    //   }

    //Submit new log function
    function submitLog(logData) {
        // console.log("submtting");
        var data = [];
        var rating = {
            likes: 0,
            dislikes: 0
        }
        $.post("/api/sighting/log", logData, function () {
            alert("Sighting Logged");
        }).then(function (res) {
            //sets data to res object
            data = res;
            //insert new rating object into data object
            data.rating = rating;
            createLogCard(data);
            location.reload();
        });
    }

    //Get all logs
    function getAllLogs() {
        $.get("/api/ufo/sightings", function (res) {}).then(function (data) {
            // console.log(data);
            for (var i = 0; i < data.length; i++) {
                var logData = data[i];
                // console.log(logData);
                var marker = new google.maps.Marker({
                    position: {
                        lat: logData.coordinatesLat,
                        lng: logData.coordinatesLng
                    },
                    map: map,
                    title: 'Sighting'
                });
                
                marker.setMap(map);

                getRating(logData).then(function (success) {
                    // console.log(logData);
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
                // console.log(logData);
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
                // console.log(success);  
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
        var imgDiv = $("<div>").addClass("col-lg-4");
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
            $("#profile").css("display", "inherit");
            $("#log_sighting").css("display", "inherit");
        }
    });

    getAllLogs()
    userInfo();
});