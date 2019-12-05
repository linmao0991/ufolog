$(document).ready(function () {
  // Getting references to our form and input
  var signUpForm = $("form.signup");
  var usernameInput = $("input#signup-username-input");
  var passwordInput = $("input#signup-password-input");
  var aboutMeInput = $("input#signup-aboutMe-input");
  var formData = new FormData();
    // Profile Image on Sign Up

  $("#profileImg").on("change", function(){
    var files = $("#profileImg").get(0).files;
    var file = files[0];
    formData.append("photo", file, file.name);
    console.log(formData);
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
    uploadPhoto(formData).then(function(success){
      signUpUser(userData.userName, userData.password, success[0].publicPath, userData.aboutMe);
      usernameInput.val("");
      passwordInput.val("");
      aboutMeInput.val("");
      $("#profileImg").val("");
    });
  });

  // Does a post to the signup route. If successful, we are redirected to the members page
  // Otherwise we log any errors
  function signUpUser(userName, password, profileurl, aboutMe) {
    console.log(profileurl)
    $.post("/api/signup", {
        userName: userName,
        password: password,
        profileurl: profileurl,
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

  function uploadPhoto(fileData){
    return new Promise(function (reslove, reject) {
      $.ajax({
        url: "/profileImg/upload",
        data: fileData,
        contentType: false,
        processData: false,
        method: "POST",
        success: function(data){
          return reslove(data)
        }
      });
    });
  }
});