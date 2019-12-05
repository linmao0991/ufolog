$(document).ready(function () {
  // Getting references to our form and input
  var signUpForm = $("form.signup");
  var usernameInput = $("input#signup-username-input");
  var passwordInput = $("input#signup-password-input");
  var aboutMeInput = $("input#signup-aboutMe-input");
  //**Code below this is used for uploading to local storage */
  //var formData = new FormData();

  // Profile Image on Sign Up
  $("#profileImg").on("change", function(){
    var files = document.getElementById("profileImg").files;
    var file = files[0];
    getSignedRequest(file);
    //**Code below this is used for uploading to local storage */
    //formData.append("photo", file, file.name);
  });

  function getSignedRequest(file){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', `/sign-s3?file-name=${file.name}&file-type=${file.type}`);
    xhr.onreadystatechange = () => {
      if(xhr.readyState === 4){
        if(xhr.status === 200){
          var response = JSON.parse(xhr.responseText);
          uploadFile(file, response.signedRequest, response.url);
        }
        else{
          alert('Could not get signed URL.');
        }
      }
    };
    xhr.send();
  }

  function uploadFile(file, signedRequest, url){
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', signedRequest);
    xhr.onreadystatechange = () => {
      if(xhr.readyState === 4){
        if(xhr.status === 200){
          document.getElementById('preview').src = url;
          //document.getElementById('avatar-url').value = url;
        }
        else{
          alert('Could not upload file.');
        }
      }
    };
    xhr.send(file);
  }
  

  // When the signup button is clicked, we validate the email and password are not blank
  signUpForm.on("submit", function (event) {
    event.preventDefault();
      var userData = {
      userName: usernameInput.val().trim(),
      password: passwordInput.val().trim(),
      aboutMe: aboutMeInput.val().trim(),
      profileurl: $("#preview").attr("src")
    };

    if (!userData.userName || !userData.password) {
      return;
    }
      signUpUser(userData.userName, userData.password,userData.profileurl, userData.aboutMe);
      usernameInput.val("");
      passwordInput.val("");
      aboutMeInput.val("");
      $("#preview").attr("src","");
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

  //** Function to save image to local folder, does not work with GitHub */
  // function uploadPhoto(fileData){
  //   return new Promise(function (reslove, reject) {
  //     $.ajax({
  //       url: "/profileImg/upload",
  //       data: fileData,
  //       contentType: false,
  //       processData: false,
  //       method: "POST",
  //       success: function(data){
  //         return reslove(data)
  //       }
  //     });
  //   });
  // }
});