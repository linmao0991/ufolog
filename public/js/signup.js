
$(document).ready(function () {
  var uploadTimer;
  // Getting references to our form and input
  var signUpForm = $("form.signup");
  var usernameInput = $("input#signup-username-input");
  var passwordInput = $("input#signup-password-input");
  var aboutMeInput = $("textarea#signup-aboutMe-input");
  let profileImage;
  //**Code below this is used for uploading to local storage */
  //var formData = new FormData();

  // Profile Image on Sign Up
  $("#profileImg").on("change", function () {
    var files = document.getElementById("profileImg").files;
    var file = files[0];
    let reader = new FileReader()

    reader.onload = function(e) {
      profileImage = file
      $('#preview').attr('src',e.target.result )
    }

    reader.readAsDataURL(file);
    //getSignedRequest(file);
    //**Code below this is used for uploading to local storage */
    //formData.append("photo", file, file.name);
  });

  function getSignedRequest(file) {
    return new Promise((resolve, reject) => {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', "/sign-s3?file-name=" + file.name + "&file-type=" + file.type);
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            uploadFile(file, response.signedRequest, response.url)
            .then(result => {
              console.log(result)
              resolve(response.url)
            }).catch( err => {
              console.log(err)
              reject(err)
            })
          } else {
            reject('Failed: Could not upload image');
          }
        }
      };
      xhr.send();
    })
  }

  function uploadFile(file, signedRequest) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', signedRequest);
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            //document.getElementById('preview').src = url;
            resolve('Upload Complete')
          } else {
            reject('Failed: Could not upload image')
          }
        }
      };
      xhr.send(file);
    })
  }

  // When the signup button is clicked, we validate the email and password are not blank
 signUpForm.on("submit", async function (event) {
    event.preventDefault();
    $("#alertSignUp").removeClass("alert-danger").addClass("alert-info");
    $("#alertSignUp .msg").text("Signing up...");
    $("#alertSignUp").fadeIn(500);
    var selector = this;
    $(selector).find("input, button, textarea").prop("disabled", true);
    uploadTimer = setTimeout(function(){
      $(selector).find("input, button").prop("disabled",false);
      alert("Failed: Sign up timed out");
      }, 10000);
    await getSignedRequest(profileImage).then( imageUrl => {
      signUpUser(
        stripTags(usernameInput), 
        stripTags(passwordInput), 
        imageUrl, 
        stripTags(aboutMeInput),
      ).catch( err => {
        alert(err);
        $(selector).find("input, button, textarea").prop("disabled", true);
      });
    })
  });

  function stripTags(data){
    console.log(data.val().trim())
    if(data.val().trim() !== ''){
      return data.val().trim().replace(/</g, "&lt;");
    }
  }

  // Does a post to the signup route. If successful, we are redirected to the members page
  // Otherwise we log any errors
  function signUpUser(userName, password, profileurl, aboutMe) {
    return new Promise(function(resolve, reject){
      $.post("/api/signup", {
        userName: userName,
        password: password,
        profileurl: profileurl,
        aboutMe: aboutMe
      })
      .then(function (data) {
        usernameInput.val("");
        passwordInput.val("");
        aboutMeInput.val("");
        profileImage = null
        $("#preview").attr("src", "");
        window.location.replace("/");
      })
      // If there's an error, handle it by throwing up a bootstrap alert
      .catch(function(err){
        handleLoginErr(err.responseJSON.errors[0].message)
        reject();
      });
    })
  }

  function handleLoginErr(err) {
    clearTimeout(uploadTimer);
    $("#alertSignUp").removeClass("alert-info").addClass("alert-danger");
    $("#alertSignUp .msg").text(err);
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