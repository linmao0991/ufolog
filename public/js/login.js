var uploadTimer;
$(document).ready(function() {
    //var uploadTimer;
    // Getting references to our form and input
    var loginForm = $("form.login");
    var usernameInput = $("input#login-username-input");
    var passwordInput = $("input#login-password-input");
  
  // When the form is submitted, we validate there's an email and password entered
  loginForm.on("submit", function(event) {
      var selector = this;
      event.preventDefault();
      $("#loadingSpinner").find("input, button").prop("disabled",true);
      $("#loadingSpinner").find("button.btn").contents().filter(function(){
        return this.nodeType === 3;
        }).remove();
      $("#loadingSpinner").find("button.btn").append("Logging in...");
      $("#loadingSpinner").modal("toggle");
      uploadTimer = setTimeout(function(){
        $(selector).find("input, button").prop("disabled",false);
        $("#loadingSpinner").modal("toggle");
        alert("Logging in canceled, took too long!");
        }, 30000);
      var userData = {
        userName: usernameInput.val().trim(),
        password: passwordInput.val().trim()
      };
      usernameInput.val("");
      passwordInput.val("");
      loginUser(userData.userName, userData.password);
    });
  
     // loginUser does a post to our "api/login" route and if successful, redirects us the the members page
    function loginUser(userName, password) {
      $.post("/api/login", {
        userName: userName,
        password: password
      })
        .then(function(data) {
          window.location.replace("/profile");
        })
        // If there's an error, log the error
        .catch(handleLoginErr);
    }
    function handleLoginErr(err) {
      clearTimeout(uploadTimer);
      alert("Username or Password is incorrect");
      $("#loadingSpinner").modal("toggle");
      $("#loadingSpinner").find("input, button").prop("disabled",false);
      $("#alert2 .msg").text("Username or Password is incorrect");
      $("#alert2").fadeIn(500);
    }
  });