var map;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 39.4993,
            lng: -95.6944
        },
        zoom: 4.5,
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
    var uploadTimer;
    //**Variabel below used for local file upload, wont work with GitHub*/
    // var formData = new FormData();
    // Display user info
    function userInfo() {
        $.get("/api/user_data", function (data) {}).then(function (data) {
            //Sets user as logged in if true
            if (typeof data.userName !== "undefined" && typeof data.userName !== null) {
                loggedin = true;
                user_Name = data.userName;
            }
        });
    };

    //Function to hide menu options based on logged in or out.
    $.get("/api/user_data", function (data) {
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
        //$("#logging_modal").modal("toggle");
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
        var mylat = stripTags($("#manual_lat").val().trim());
        var mylng = stripTags($("#manual_lng").val().trim());
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
        var loadingInfo = ["Uploading...", true, "skip"];
        toggleLoading(loadingInfo)
        uploadTimer = setTimeout(function(){
            loadingInfo = ["Upload Failed", false, "wait"];
            toggleLoading(loadingInfo)
            }, 60000);
        var xhr = new XMLHttpRequest();
        xhr.open('GET', `/sign-s3?file-name=${file.name}&file-type=${file.type}`);
        xhr.onreadystatechange = () => {
            if(xhr.readyState === 4){
                if(xhr.status === 200){
                    var response = JSON.parse(xhr.responseText);
                    uploadFile(file, response.signedRequest, response.url);
                }
                else{
                    clearTimeout(uploadTimer);
                    loadingInfo = ["Upload Failed", false, "wait"];
                    toggleLoading(loadingInfo)
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
            clearTimeout(uploadTimer);
            document.getElementById('ufo-preview').src = url;
            loadingInfo = ["Upload Complete", false, "wait"];
            toggleLoading(loadingInfo)
        }
        else{
            clearTimeout(uploadTimer);
            loadingInfo = ["Upload Failed", false, "wait"];
            toggleLoading(loadingInfo)
        }
        }
    };
    xhr.send(file);
    }

    // Sighting log form submission
    $("form.sightinglog").on("submit", function (event) {
        event.preventDefault();
        var loadingInfo = ["Submitting Log...", true, "skip"];
        toggleLoading(loadingInfo);
        uploadTimer = setTimeout(function(){
            loadingInfo = ["Submission Failed", false, "wait"];
            toggleLoading(loadingInfo);
            }, 60000);
        var logData = {};
        $.get("/api/user_data", function (err, res) {}).then(function (data) {
            //Creating log data object
            logData.rating = {
                likes: 0,
                dislikes: 0
            };
            logData.userName = data.userName;
            logData.UserId = data.id;
            logData.title =  stripTags($("#log_title").val().trim());
            logData.description = stripTags($("#log_description").val());
            logData.category = "UFO";
            logData.image = stripTags($("#ufo-preview").attr("src"));
            if ($("#mylat").text() === "" || $("#mylng").text() === "") {
                clearTimeout(uploadTimer);
                $("#mylat").parent().addClass("border border-danger")
                $("#mylng").parent().addClass("border border-danger")
                alert('Please enter coordinates.');
                $("#loadingSpinner").find("input, button, textarea").prop("disabled", false);
            } else {
                logData.coordinatesLat = parseFloat($("#mylat").text());
                logData.coordinatesLng = parseFloat($("#mylng").text());
                $("form.sightinglog, form.coordinate").trigger("reset");
                $("#mylat,#mylng").text("");
                $("#logging_modal").modal("toggle");
                submitLog(logData);
            };
        });
    });

    function stripTags(data){
        console.log(data);
        var newData = data.replace(/</g, "&lt;");
        return newData;
    }

    //Get coordinates button
    //**Add a loading animation while getting coordinates
    $("#getlocation").on("click", function (event) {
        event.preventDefault();
        var loadingInfo = ["Locating...",true,"skip"];
        toggleLoading(loadingInfo);
        uploadTimer = setTimeout(function(){
            loadingInfo =  ["Can't find location!",false,"wait"]
            toggleLoading(loadingInfo);
        }, 30000);
        $("#mylat").text("");
        $("#mylng").text("");
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                clearTimeout(uploadTimer);
                $("#mylat").text(position.coords.latitude);
                $("#mylng").text(position.coords.longitude);
                $("#manual_lat").val(position.coords.latitude);
                $("#manual_lng").val(position.coords.longitude);
                //$("#loadingSpinner").modal("toggle");
            });
            loadingInfo =  ["Found You!",false,"wait"]
            toggleLoading(loadingInfo);
        } else {
            clearTimeout(uploadTimer);
            loadingInfo =  ["Geolocation is not supported by this browser.",false,"wait"]
            toggleLoading(loadingInfo);
        }
    });
    
    //**Function for Uploading photos to local folder, does not work on GitHub */
    // function uploadLogPhoto(fileData){
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
        var data = [];
        var rating = {
            likes: 0,
            dislikes: 0
        }
        $.post("/api/sighting/log", logData, function () {
            var loadingInfo = ["Log Sumbitted!", false, "wait"];
            toggleLoading(loadingInfo);
        }).then(function (res) {
            clearTimeout(uploadTimer);
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
            let getRatingsArray = []
            for (var i = 0; i < data.length; i++) {
                var logData = data[i];
                getRatingsArray.push(getRating(logData))
            }
            Promise.all(getRatingsArray).then( results => {
                console.log(results)
                results.forEach( result => {
                    console.log(result)
                    createLogCard(result)
                })
            })
        });
    }

    //Get likes and dislikes for a single log
    function getRating(data) {
        return new Promise(function (reslove, reject) {
            var logData = data
            $.get("/api/ufo/sightings/get_rating/" + data.id, function (res) {
                var marker = new google.maps.Marker({
                    position: {
                        lat: logData.coordinatesLat,
                        lng: logData.coordinatesLng
                    },
                    map: map,
                    label: ""+logData.id,
                    title: logData.userName
                });
                marker.setMap(map);
                var content =   '<div class="row no-gutters p-2 bg-dark border rounded">'+
                                    '<div class="col-lg-4 d-flex align-items-center justify-content-center p-2">'+
                                        '<img class="card-img" src="'+logData.image+'" alt="UFO Image">'+
                                        '</div>'+
                                    '<div class="col-lg-8">'+
                                        '<div class="card-header border-success border rounded">'+
                                            '<h6>'+logData.title+'</h5>'+
                                        '</div>'+
                                        '<div class="card-body">'+
                                            '<p>'+logData.description+'</p>'+
                                        '</div>'+
                                        '<div class="card-footer" id="ufolog'+logData.id+'">'+
                                            '<button class="btn rateBtn likebutton" data-logid="'+logData.id+'"><i class="far fa-thumbs-up" aria-hidden="true"></i></button><span id="likelog'+logData.id+'">'+res.likes+'</span>'+
                                            '<button class="btn rateBtn dislikebutton" data-logid="'+logData.id+'"><i class="far fa-thumbs-down" aria-hidden="true"></i>'+
                                            '</button><span id="dislikelog'+logData.id+'">'+res.dislikes+'</span><p class="float-right"><span>'+moment(logData.createdAt).format("MMM D, YYYY h:mm A")+'</span>-<span class="btn btn-link profilebtn" data-userid="'+logData.UserId+'">'+logData.userName+'</span></p>'+
                                        '</div>'+
                                    '</div>'+
                                    '</div>'+
                                '</div>';
                var infowindow = new google.maps.InfoWindow();
                google.maps.event.addListener(marker,'click', (function(marker,content,infowindow){ 
                    return function() {
                       infowindow.setContent(content);
                       infowindow.open(map,marker);
                    };
                })(marker,content,infowindow));
            }).then(function (response) {
                //inserts response likes/dislikes object into single log data object
                logData.rating = response;
                //createLogCard(logData);
                return reslove(logData);
            });
        });
    }

    //Like button function
    $(document).on("click", "button.likebutton", function () {
        var rate = "like";
        var button = this;
        var checkUserTimer;
        var msg = ["Verifying User...",true,"skip"];
        toggleLoading(msg);
        $.get("/api/user_data", function (data) {}).then(function (data) {
            //Sets user as logged in if true
            if (typeof data.userName !== "undefined" && typeof data.userName !== null) {
                var ratingData = {
                    userName: data.userName,
                    id: $(button).attr("data-logid"),
                    rating: rate
                }
                clearTimeout(checkUserTimer);
                updateRating(ratingData).then(function (success) {
                    $("#"+ratingData.rating+"log" + ratingData.id).text(success.likes);
                    loadingInfo = ["Log Rated!", false, "wait"];
                    toggleLoading(loadingInfo)
                }).catch(function (error) {
                    alert(error.code + " : " + error.reason);
                    $("#loadingSpinner").modal("toggle");
                });
            }else{
                clearTimeout(checkUserTimer);
                loadingInfo = ["Log in to "+rate+"!", false, "wait"];
                toggleLoading(loadingInfo)
            }
        });
        checkUserTimer = setTimeout(function(){
            loadingInfo = ["No Response...", false, "wait"];
            toggleLoading(loadingInfo)
        },10000);
        //checks if user is logged in
    });

    //DisLike button function
    $(document).on("click", "button.dislikebutton", function () {
        var rate = "dislike";
        var button = this;
        var checkUserTimer;
        var msg = ["Verifying User...",true,"skip"];
        toggleLoading(msg);
        $.get("/api/user_data", function (data) {}).then(function (data) {
            //Sets user as logged in if true
            if (typeof data.userName !== "undefined" && typeof data.userName !== null) {
                var ratingData = {
                    userName: data.userName,
                    id: $(button).attr("data-logid"),
                    rating: rate
                }
                clearTimeout(checkUserTimer);
                updateRating(ratingData).then(function (success) {
                    $("#"+ratingData.rating+"log" + ratingData.id).text(success.likes);
                    loadingInfo = ["Log Rated!", false, "wait"];
                    toggleLoading(loadingInfo)
                }).catch(function (error) {
                    alert(error.code + " : " + error.reason);
                    $("#loadingSpinner").modal("toggle");
                });
            }else{
                clearTimeout(checkUserTimer);
                loadingInfo = ["Log in to "+rate+"!", false, "wait"];
                toggleLoading(loadingInfo)
            }
        });
        checkUserTimer = setTimeout(function(){
            loadingInfo = ["No Response...", false, "wait"];
            toggleLoading(loadingInfo)
        },10000);
        //checks if user is logged in
    });

    function toggleLoading(info){
        $("#loadingSpinner").modal({backdrop: 'static', keyboard: false})
        $("#loadingSpinner").find("button").prop("disabled", info[1]);
        $("#loadingSpinner").find("button.btn").contents().filter(function(){
            return this.nodeType === 3;
            }).remove();
        $("#loadingSpinner").find("button.btn").append(info[0])
        if(info[2] !== "wait"){
            $("#loadingSpinner").modal("toggle");
        }else{
            $("#loadingSpinner").find("button").removeClass("btn-dark").addClass("btn-warning");
        }
    }

    $(document).on("click","#loadingSpinner", function(){
        $("#loadingSpinner").modal("toggle");
        $("#loadingSpinner").find("button").removeClass("btn-warning").addClass("btn-dark");
    })

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
                    console.log("updateRating error");
                    return reject(response);
                }
            });
        });
    }

    //Log Card creation function
    function createLogCard(Data) {
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
        var headerDiv = $("<div>").addClass("card-header border-success border rounded").html("<h5>"+Data.title+"</h5");
        var bodyDiv = $("<div>").addClass("card-body").html("<p>"+Data.description+"</p>");
        var divFooter = $("<div>").addClass("card-footer").attr("id","ufolog"+Data.id);
            //Like Button
        var likeButton = $("<button>").addClass("btn rateBtn likebutton").attr("data-logid",Data.id).append("<i class='far fa-thumbs-up'></i>");
            //Dislike Button
        var dislikeButton = $("<button>").addClass("btn rateBtn dislikebutton").attr("data-logid",Data.id).append("<i class='far fa-thumbs-down'></i>");
            //Log Data
        var footerData = $("<p>").addClass("float-right").html("<span>"+moment(Data.createdAt).format("MMM D, YYYY h:mm A")+"</span>-<span class='btn btn-link profilebtn' data-userId = '"+Data.UserId+"'>"+Data.userName+"</span>")
        //Append to footer
        divFooter.append([likeButton,"<span id='likelog"+Data.id+"'>"+Data.rating.likes+"</span>",'&nbsp;', dislikeButton, "<span id='dislikelog"+Data.id+"'> "+Data.rating.dislikes+"</span>", footerData]);
        //Append all content to mainDiv
        mainDiv.append(headerDiv, bodyDiv, divFooter);
        //Append to row with no gutters
        rowDiv.append(imgDiv, mainDiv);
        //Append to card Div
        cardDiv.append(rowDiv);
        //Append to html page
        $("#log_display").prepend(cardDiv);
    };

// Displays user info when name is clicked on card
$(document).on("click","span.profilebtn",function(event){  
    event.preventDefault();
    $("#userphoto").find("img").remove();
    $("#username").text(""); 
    $("#userinfo").text("");
    $("#results-modal-profile").modal("toggle");
    var profileID = $(this).attr("data-UserId");
    console.log(profileID);
    $.get("/api/ufo/Users/"+profileID, function (data) {
     }).then(function (data) {
       var profileName = data.userName;
       var profileBio = data.aboutMe;
       var profileUrl = data.profileurl;
       var imgEle = $('<img>').attr({
            'src': profileUrl,
            'alt': profileName+"'s photo",
            'title': profileName+"'s photo",
            'width': 250
            }).addClass("modalImg")

       $("#username").text(profileName);
       $("#userinfo").text(profileBio);
        $('#userphoto').append(imgEle)
     });
   });

    getAllLogs()
    userInfo();
});