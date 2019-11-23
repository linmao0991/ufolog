$(document).ready(function () {

    getAllLogs();
    // Logging In
    $("#signup").on("click", function (event) {
        event.preventDefault();
        $("#results-modal").modal("toggle");
        $("#signout").css("display", "inherit")
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
            logData.userName = //Need account log in to finish this portion
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
            console.log(logData);
            //Post new sighting log with logData object
            submitLog(logData);
            $("form.sightinglog, form.coordinate").trigger("reset");
            $("#mylat,#mylng").text("");
            $("#logging_modal").modal("toggle");
        });
    });

    //Get coordinates button
    $("#getlocation").on("click", function(event){
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

    //Dislike button function    
    $(".likebutton").on("click", function(){
        var logID = $(this).attr("data-logid").val();
        var ratingData = {
            rating: "like"
        }
        $.ajax({
            method: "PUT",
            url: "/api/sighting/log/rating/"+logID,
            data: ratingData
        }).then(function(res){
            //Maybe Reload Page?
            $.get("api/ufo/sightings/"+logID, function(data){
                $(this).children(".fa-thumbs-up").text(data.likes);
            });
        });
    });

    //Like button function
    $(".dislikebutton").on("click", function(){
        var logID = $(this).attr("data-logid").val();
        var ratingData = {
            rating: "dislike"
        }
        $.ajax({
            method: "PUT",
            url: "/api/sighting/log/rating/"+logID,
            data: ratingData
        }).then(function(res){
            //Maybe Reload Page?
            $.get("api/ufo/sightings/"+logID, function(data){
                $(this).children(".fa-thumbs-down").text(data.likes);
            });
        });
    });

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
            var divFooter = $("<div>").addClass("card-footer")
                //Like Button
                var likeButton = $("<button>").addClass("btn likebutton").attr("data-logid",Data.id)
                likeButton.html("<i class='far fa-thumbs-up'></i>"+Data.likes+"</i>");
                //Dislike Button
                var dislikeButton = $("<button>").addClass("btn dislikebutton").attr("data-logid",Data.id)
                dislikeButton.html("<i class='far fa-thumbs-down'></i>"+Data.dislikes+"</i>");
                //Log Data
                var footerData = $("<p>").addClass("float-right").html("Posted:<span>"+Data.createdAt+"</span>  By: <span>"+userName+"</span>")
            //Append to footer
            divFooter.append(likeButton, dislikeButton, footerData);
            //Append all content to mainDiv
            mainDiv.append(headerDiv, bodyDiv, divFooter)

        //Append to row with no gutters
        rowDiv.append(imgDiv, mainDiv);
        //Append to card Div
        cardDiv.append(rowDiv);
        //Append to html page
        $("#log_display").apped(cardDiv);
    };
});