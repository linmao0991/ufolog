var uploadTimer;
$(document).ready(function() {
    //var uploadTimer;
    // Getting references to our form and input
    var loginForm = $("form.login");
    var usernameInput = stripTags($("input#login-username-input"));
    var passwordInput = $("input#login-password-input");
  
  // When the form is submitted, we validate there's an email and password entered
  loginForm.on("submit", function(event) {
    event.preventDefault();
      $("#alert2").removeClass("alert-danger").addClass("alert-info");
      $("#alert2 .msg").text("Logging in...");
      $("#alert2").fadeIn(500);
      var selector = this;
      $(selector).find("input, button").prop("disabled",true);
      uploadTimer = setTimeout(function(){
        $(selector).find("input, button").prop("disabled",false);
        alert("Logging in canceled, took too long!");
        }, 30000);
      var userData = {
        userName: usernameInput.val().trim(),
        password: passwordInput.val().trim()
      };
      usernameInput.val("");
      passwordInput.val("");
      loginUser(userData.userName, userData.password).then(function(error){
        $(selector).find("input, button").prop("disabled",false);
        clearTimeout(uploadTimer);
        $("#alert2").removeClass("alert-info").addClass("alert-danger");
        $("#alert2 .msg").text(error);
      });
    });
  
    function stripTags(data){
      if(!data){
        var newData = data.replace(/</g, "&lt;");
        return newData;
      }
    }

     // loginUser does a post to our "api/login" route and if successful, redirects us the the members page
    function loginUser(userName, password) {
      return new Promise(function (reslove, reject){
        $.post("/api/login", {
          userName: userName,
          password: password
        })
          .then(function(data) {
            window.location.replace("/profile");
          })
          // If there's an error, log the error
          .catch(function(){
            //handleLoginErr()
            return reslove("Username or Password is incorrect");
          });
      });
    }
  });