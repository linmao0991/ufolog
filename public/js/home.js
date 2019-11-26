$(document).ready(function () {

    var loggedin = false;
    var user_Name = "";
    getAllLogs();
    userInfo();
      // Display user info
    function userInfo() {
        $.get("/api/user_data", function(data) {
        }).then(function(data) {
            if( typeof data.userName !== "undefined"){
                loggedin = true;
                user_Name = data.userName;
                console.log(user_Name);
                console.log(loggedin);
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
    $("#manualLocation").on("click", function(event){
        event.preventDefault()
        $("#coordinate_modal").modal("toggle");
    })

    // Manual coordinate submission
    $("form.coordinate").on("submit", function (event){
        event.preventDefault();
        var mylat = $("#manual_lat").val().trim();
        var mylng = $("#manual_lng").val().trim();
        $("#mylat").text(mylat);
        $("#mylng").text(mylng);
        $("#coordinate_modal").modal("toggle");
    })

    // Sighting log form submission
    $("form.sightinglog").on("submit", function(event){
        event.preventDefault();
        var logData = {};
        $.get("/api/user_data", function(err, res){
            console.log(res);
        }).then(function(data){
            console.log("Creating log object")
            //Creating log data object
            logData.userName = data.userName;
            logData.title = $("#log_title").val().trim();
            logData.description = $("#log_description").val();
            logData.category = "UFO";
            logData.image = $("#log_image").val().trim();
            if(isNaN(parseFloat($("#mylat").text()))  || isNaN(parseFloat($("#mylng").text())) ){
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(function(position){
                    logData.coordinatesLat = position.coords.latitude;
                    logData.coordinatesLng = position.coords.longitude;
                    });
                }else{
                    alert("Geolocation is not supported by this browser.");
                }
            };
            logData.coordinatesLat = parseFloat($("#mylat").text());
            logData.coordinatesLng =  parseFloat($("#mylng").text());
            logData.likes = 0;
            logData.dislikes = 0;
            logData.UserId = data.id;
            console.log(logData);
            //Post new sighting log with logData object
            submitLog(logData);
            $("form.sightinglog, form.coordinate").trigger("reset");
            $("#mylat,#mylng").text("");
            $("#logging_modal").modal("toggle");
        });
    });

    //Get coordinates button
    //**Add a loading animation while getting coordinates
    $("#getlocation").on("click", function(event){
        $("#mylat").text("");
        $("#mylng").text("");
        event.preventDefault();
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position){
                $("#mylat").text(position.coords.latitude);
                $("#mylng").text(position.coords.longitude);
                $("#manual_lat").val(position.coords.latitude);
                $("#manual_lng").val(position.coords.longitude);
            });
          } else { 
            alert("Geolocation is not supported by this browser.");
          }
    });

    //Submit new log function
    function submitLog(logData){
        console.log("submtting");
        $.post("/api/sighting/log", logData, function() {
            alert("Sighting Logged");
        }).then(function(res){
            createLogCard(res);
        });
    }

    //Get all logs **Not finished need fuctinal data in sql to pull logs.
    function getAllLogs(){
        $.get("/api/ufo/sightings", function(data){
            for ( var i = 0; i < data.length; i++){
                createLogCard(data[i]);
            }
        });
    }

    //Like button function
    $(document).on("click","button.likebutton",function(){
        if (!loggedin){
            alert("Please log in to rate log");
        }else{
            $(this).prop('disabled', true);
            var button = this;
            var logID = $(button).attr("data-logid")
            var ratingData = {
                userName: user_Name,
                id: $(button).attr("data-logid"),
                rating: "like"
            }
            updateRating(ratingData).then(function(success){
                console.log(success);  
                if( success.code !== "Denied"){
                    $.get("/api/ufo/sightings/get_rating/"+logID,function(data){

                    }).then(function(response){
                        console.log(response)
                        $("#likelog"+logID).text(response.likes);
                    });
                    $(button).prop('disabled', false);
                }else{
                    alert(success.code+" : "+success.reason);
                }
            });
        }
    });

    //DisLike button function
    $(document).on("click","button.dislikebutton",function(){
        if (!loggedin){
            alert("Please log in to rate log");
        }else{
            $(this).prop('disabled', true);
            var button = this;
            var ratingData = {
                userName: user_Name,
                id: $(button).attr("data-logid"),
                rating: "dislike"
            }
            updateRating(ratingData).then(function(success){
                console.log(success);
                var data = success[0];
                var logDislikes = function (){
                    for ( var i = 0; i < data.log_ratings.length; i++){
                        var count = 0;
                        if (data.log_ratings[i].rating === "dislike"){
                            count++
                        }
                    }
                    return count;
                }
                $("#dislikelog"+data.id).text(logDislikes);
                $(button).prop('disabled', false);
            });
        }
    });

    // Promise function to update rating and return ratings value
    function updateRating(data){
        var ratingData = data;
        return new Promise(function(reslove, reject){
            $.post("/api/sighting/log/rating/"+ratingData.id, ratingData, function(res){
            }).then(function(data){
                // $.get("/api/ufo/sightings/"+ratingData.id, function(data){
                // }).then(function(res){
                //     //console.log(res);
                //     return reslove(res);
                // });
                return reslove(data);
            });
        });
    }

    //Log Card creation function
    function createLogCard(Data){
        //Create Card Div
        var cardDiv = $("<div>").addClass("card m-2");
        //Creating row with no gutters
        var rowDiv = $("<div>").addClass("row no-gutters");
        //Creating Image div
        var imgDiv = $("<div>").addClass("col-lg-4");
            var img = $("<img>").addClass("card-img").attr({"src":Data.image,"alt":"UFO Image"});
            imgDiv.append(img);

        //Create card content div
        var mainDiv = $("<div>").addClass("col-lg-8");
            var headerDiv = $("<div>").addClass("card-header border rounded").html("<h5>"+Data.title+"</h5");
            var bodyDiv = $("<div>").addClass("card-body").html("<p>"+Data.description+"</p>");
            var divFooter = $("<div>").addClass("card-footer").attr("id","ufolog"+Data.id);
                //Like Button
                var likeButton = $("<button>").addClass("btn likebutton").attr("data-logid",Data.id);
                likeButton.append("<i class='far fa-thumbs-up'></i>");
                //Dislike Button
                var dislikeButton = $("<button>").addClass("btn dislikebutton").attr("data-logid",Data.id);
                dislikeButton.append("<i class='far fa-thumbs-down'></i>");
                //Log Data
                var footerData = $("<p>").addClass("float-right").html("<span>"+moment(Data.createdAt).format("MMM D ,YYYY h:mm A")+"</span>-<span>"+Data.userName+"</span>")
            //Append to footer
            divFooter.append(likeButton, "<span id='likelog"+Data.id+"'>"+Data.likes+"</span>", dislikeButton, "<span id='dislikelog"+Data.id+"'> "+Data.dislikes+"</span>", footerData);
            //Append all content to mainDiv
            mainDiv.append(headerDiv, bodyDiv, divFooter);
        //Append to row with no gutters
        rowDiv.append(imgDiv, mainDiv);
        //Append to card Div
        cardDiv.append(rowDiv);
        //Append to html page
        $("#log_display").append(cardDiv);
    };

    $.get("/api/user_data", function(data){
        // console.log(data);
    }).then(function(data){
        // If logged out, display login & signup buttons
        if(data.userName == null){
            $("#login").css("display", "inherit");
            $("#signup").css("display", "inherit");
            $("#signout").css("display", "none");
            $("#profile").css("display", "none");
            $("#log_sighting").css("display", "none");
        }
        // If logged in, display signout & profile buttons
        else{
            $("#login").css("display", "none");
            $("#signup").css("display", "none");
            $("#signout").css("display", "inherit");
            $("#profile").css("display", "inherit");
            $("#log_sighting").css("display", "inherit");
        }
    });
});