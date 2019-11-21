$(document).ready(function () {

    // Logging In
    $("#signup").on("click", function (event) {
        event.preventDefault();
        $("#results-modal").modal("toggle");
        $("#signout").css("display", "inherit")
    });

});