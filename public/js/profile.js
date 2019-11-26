// Profile JS
$(document).ready(function () {

  // Display user info
  function userInfo() {
    $.get("/api/user_data", function(data) {
    }).then(function(data) {
        $("profile-description").text(data.description);
    });
    $.get("/api/user_data", function (data) {  
    }).then(function(data) {
          console.log(data);
          $(".profile-name").text(data.userName);
      });
  };

userInfo();
});