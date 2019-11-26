$(document).ready(function () {

    getAllLogs();
    // Logging In
    $("#signup").on("click", function (event) {
        event.preventDefault();
        $("#results-modal-signup").modal("toggle");
    });

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

    // Sighting log form submission **Not Finished need account log in to retrive userName and userID association.
    $("form.sightinglog").on("submit", function(event){
        var logData = {};
        $.get("/api/user_data", function(err, res){
            
        }).then(function(data){
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
        $.post("/api/sighting/log", logData, function() {
            alert("Sighting Logged");
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
        var logID = $(this).attr("data-logid");
        var ratingData = {
            rating: "like"
        }
        $.ajax({
            method: "PUT",
            url: "/api/sighting/log/rating/"+logID,
            data: ratingData
        }).then(function(res){
            //Maybe Reload Page?
            $.get("/api/ufo/sightings/"+logID, function(data){
                $(this).children("i.fa-thumbs-up").text(data.likes);
            });
        });
    });

    //Like button function
    $(document).on("click","button.dislikebutton",function(){
        var logID = $(this).attr("data-logid");
        var ratingData = {
            rating: "dislike"
        }
        $.ajax({
            method: "PUT",
            url: "/api/sighting/log/rating/"+logID,
            data: ratingData
        }).then(function(res){
            //Maybe Reload Page?
            $.get("/api/ufo/sightings/"+logID, function(data){
                $(this).children("i.fa-thumbs-down").text(data.dislikes);
            });
        });
    });

    //Log Card creation function
    function createLogCard(Data){
        //Create Card Div
        var cardDiv = $("<div>").addClass("card m-2 logCard");
        //Creating row with no gutters
        var rowDiv = $("<div>").addClass("row no-gutters");
        //Creating Image div
        var imgDiv = $("<div>").addClass("col-lg-4");
            var img = $("<img>").addClass("card-img").attr({"src":Data.image,"alt":"UFO Image"});
            imgDiv.append(img);

        //Create card content div
        var mainDiv = $("<div>").addClass("col-lg-8");
            var headerDiv = $("<div>").addClass("card-header border-success border rounded").html("<h5>"+Data.title+"</h5");
            var bodyDiv = $("<div>").addClass("card-body").html("<p>"+Data.description+"</p>");
            var divFooter = $("<div>").addClass("card-footer");
                //Like Button
                var likeButton = $("<button>").addClass("btn rateBtn likebutton").attr("data-logid",Data.id);
                likeButton.html("<i class='far fa-thumbs-up'></i>"+Data.likes+"</i>");
                //Dislike Button
                var dislikeButton = $("<button>").addClass("btn rateBtn dislikebutton").attr("data-logid",Data.id);
                dislikeButton.html("<i class='far fa-thumbs-down'></i>"+Data.dislikes+"</i>");
                //Log Data
                var footerData = $("<p>").addClass("float-right").html("Posted:<span>"+Data.createdAt+"</span>  By: <span class='user'>"+Data.userName+"</span>")
            //Append to footer
            divFooter.append(likeButton, dislikeButton, footerData);
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