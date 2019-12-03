$(document).ready(function() {
  
    // Getting references to our form and input
    var loginForm = $("form.login");
    var usernameInput = $("input#login-username-input");
    var passwordInput = $("input#login-password-input");
  
  // When the form is submitted, we validate there's an email and password entered
  loginForm.on("submit", function(event) {
      event.preventDefault();
      var userData = {
        userName: usernameInput.val().trim(),
        password: passwordInput.val().trim()
      };
  
      if (!userData.userName || !userData.password) {
        return;
      }
      // If we have an email and password, run the signUpUser function
      loginUser(userData.userName, userData.password);
      usernameInput.val("");
      passwordInput.val("");
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
        .catch(function(err){
            console.log(err);
        });
    }
  });