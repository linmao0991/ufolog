$(document).ready(function () {

    // Logging In
    $("#signup").on("click", function (event) {
        event.preventDefault();
        $("#results-modal-signup").modal("toggle");
    });

    $("#login").on("click", function (event) {
        event.preventDefault();
        $("#results-modal-login").modal("toggle");
    });

    // Hiding/Displaying homepage nav buttons depending on if signed in or not
    $.get("/api/user_data", function(data){
        // console.log(data);
    }).then(function(data){
        // If logged out, display login & signup buttons
        if(data.userName == null){
            $("#login").css("display", "inherit");
            $("#signup").css("display", "inherit");
            $("#signout").css("display", "none");
            $("#profile").css("display", "none");
        }
        // If logged in, display signout & profile buttons
        else{
            $("#login").css("display", "none");
            $("#signup").css("display", "none");
            $("#signout").css("display", "inherit");
            $("#profile").css("display", "inherit");
        }

    }
);

});