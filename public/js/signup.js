$(document).ready(function () {
  // Getting references to our form and input
  var signUpForm = $("form.signup");
  var usernameInput = $("input#signup-username-input");
  var passwordInput = $("input#signup-password-input");
  var aboutMeInput = $("input#signup-aboutMe-input");

    // Profile Image on Sign Up
    $("#signup-aboutMe-input").on("click",function (event) {
      var image = document.getElementById('output');
      image.src = $("#signup-profileurl-input").val();
    });

  // When the signup button is clicked, we validate the email and password are not blank
  signUpForm.on("submit", function (event) {
    event.preventDefault();
      var userData = {
      userName: usernameInput.val().trim(),
      password: passwordInput.val().trim(),
      aboutMe: aboutMeInput.val().trim()
    };

    if (!userData.userName || !userData.password) {
      return;
    }
    // If we have a username and password, run the signUpUser function
    signUpUser(userData.userName, userData.password, /*userData.profileurl,*/ userData.aboutMe);
    usernameInput.val("");
    passwordInput.val("");
    aboutMeInput.val("");
  });

  // Does a post to the signup route. If successful, we are redirected to the members page
  // Otherwise we log any errors
  function signUpUser(userName, password, /*profileurl,*/ aboutMe) {
    $.post("/api/signup", {
        userName: userName,
        password: password,
        // profileurl: image,
        aboutMe: aboutMe
      })
      .then(function (data) {
        window.location.replace("/");
      })
      // If there's an error, handle it by throwing up a bootstrap alert
      .catch(handleLoginErr);
  }

  function handleLoginErr(err) {
    $("#alert .msg").text(err.responseJSON.errors[0].message);
    console.log(err)
    $("#alert").fadeIn(500);
  }
});