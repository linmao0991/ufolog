// *********************************************************************************
// api-routes.js - this file offers a set of routes for displaying and saving data to the db
// *********************************************************************************

// Dependencies
// =============================================================

// Requiring our Todo model
require('dotenv').config();
var db = require("../models");
var passport = require("../config/passport");
var formidable = require('formidable');
var path = require('path');
var fs = require('fs');
var readChunk = require('read-chunk');
var fileType = require('file-type');
var aws = require('aws-sdk');
aws.config.region = "us-east-2";
var Bucket_Name = process.env.S3_BUCKET;
var User_Key = process.env.AWS_ACCESS_KEY;
var Secret_Key = process.env.AWS_SECRET_ACCESS_KEY;
// Routes
// =============================================================
module.exports = function (app) {

  // GET route for getting all of the ufo sightings
  app.get("/api/ufo/sightings", function (req, res) {
    db.ufo.findAll({})
      .then(function (dbufo) {
        res.json(dbufo);
      });
  });

  // GET route for getting all logs where ID equal parameter
  app.get("/api/ufo/sightings/:id", function (req, res) {
    db.ufo.findAll({
      where: {
        id: req.params.id
      },
      include: [db.log_rating]
    }).then(function (dbufo) {
      res.json(dbufo);
    });
  });

  // GET route for getting all logs where ID equal parameter
  app.get("/api/ufo/sightings/byuser/:id", function (req, res) {
    db.ufo.findAll({
      where: {
        UserId: req.params.id
      },
      include: [db.log_rating]
    }).then(function (dbufo) {
      res.json(dbufo);
    });
  });

  app.get("/api/ufo/sightings/get_rating/:id", function (req, res) {
    var rating = {}
    db.log_rating.count({
      where: {
        ufoId: req.params.id,
        rating: "like"
      }
    }).then(function (result) {
      rating.likes = result;
      db.log_rating.count({
        where: {
          ufoId: req.params.id,
          rating: "dislike"
        }
      }).then(function (result) {
        rating.dislikes = result;
        res.json(rating);
      });
    });
  });

  // Account Get/Post Routes
  // Using the passport.authenticate middleware with our local strategy.
  // If the user has valid login credentials, send them to the members page.
  // Otherwise the user will be sent an error
  app.post("/api/login", passport.authenticate("local"), function (req, res) {
    res.json(req.user);
  });

  // Route for signing up a user. The user's password is automatically hashed and stored securely thanks to
  // how we configured our Sequelize User Model. If the user is created successfully, proceed to log the user in,
  // otherwise send back an error
  app.post("/api/signup", function (req, res) {
    db.User.create({
        userName: req.body.userName,
        password: req.body.password,
        aboutMe: req.body.aboutMe,
        profileurl: req.body.profileurl
      })
      .then(function () {
        res.redirect(307, "/api/login");
      })
      .catch(function (err) {
        res.status(401).json(err);
      });
  });

  // Route for logging user out
  app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
  });

  // Route for getting some data about our user to be used client side
  app.get("/api/user_data", function (req, res) {
    if (!req.user) {
      // The user is not logged in, send back an empty object
      res.json({});
    } else {
      // Otherwise send back the user's email and id
      // Sending back a password, even a hashed password, isn't a good idea
      db.User.findOne({
        where: {
          id: req.user.id
        }
      }).then(function (data) {
        res.json({
          userName: req.user.userName,
          id: req.user.id,
          profileurl: data.profileurl,
          aboutMe: data.aboutMe
        });
      });
    }
  });

  app.post("/api/sighting/log/rating/:id", function (req, res) {
    db.log_rating.findOne({
      where: {
        ufoId: req.params.id,
        userName: req.body.userName
      }
    }).then(function (data) {
      if (data === null) {
        if (req.body.rating === "like") {
          db.log_rating.create({
            userName: req.body.userName,
            rating: req.body.rating,
            ufoId: req.params.id
          }).then(function (dblogratings) {
            return res.json(dblogratings);
          });
        } else {
          db.log_rating.create({
            userName: req.body.userName,
            rating: req.body.rating,
            ufoId: req.params.id
          }).then(function (dblogratings) {
            return res.json(dblogratings);
          });
        }
      } else {
        var code = {
          code: "Denied",
          reason: "Already rated log"
        }
        return res.json(code);
      }
    })
  });

  // Post route for loging a new sighting
  app.post("/api/sighting/log", function (req, res) {
    db.ufo.create(req.body).then(function (dbUfo) {
      res.json(dbUfo);
    });
  });

  //Upload Profile Image. Local host works, does not work with Github
  // app.post("/profileImg/upload", function (req, res){
  //   var photos = [];
  //   var form = new formidable.IncomingForm();
  //   // Upload directory for the images
  //   form.uploadDir = "public/imgs/";
  //   // Keep file extensions
  //   form.keepExtensions = true;
  //   // Sets formibale to only accept single files.
  //   form.multiples = false;
  //   // Invoked when a file has finished uploading.
  //   form.on("file", function ( name, file){
  //     //Only allow one file
  //     if (photos.length === 1) {
  //       fs.unlink(file.path);
  //       return true;
  //     }
  //     // Read a chunk of the file.
  //     var buffer = null;
  //     // Get the file type using the buffer read using read-chunk
  //     var type = null;
  //     var filename = "";

  //     buffer = readChunk.sync(file.path, 0, 262);
  //     type = fileType(buffer);

  //     //Checks file extensions
  //     if (type !== null && (type.ext === 'png' || type.ext === 'jpg' || type.ext === 'jpeg')){
  //       // Assign new file name
  //       filename = Date.now() + '-' + file.name;

  //       // Move the file with the new file name
  //       fs.rename(file.path, "public/imgs/profile/" + filename, function(err){
  //         if (err) throw err;
  //       } );

  //       photos.push({
  //         status: true,
  //         filename: filename,
  //         type: type.ext,
  //         publicPath: "../imgs/profile/" + filename
  //       });
  //     }else{
  //       photos.push({
  //         status: false,
  //         filename: file.name,
  //         message: 'Invalid file type'
  //       });
  //       fs.unlink(file.path);
  //     }
  //   });

  //   form.on('error', function(err) {
  //     console.log('Error occurred during processing - ' + err);
  //   });

  //   // Invoked when all the fields have been processed.
  //   form.on('end', function() {
  //     console.log('All the request fields have been processed.');
  //   });

  //   // Parse the incoming form fields.
  //   form.parse(req, function (err, fields, files) {
  //     res.status(200).json(photos);
  //   });
  // });

  // //Upload Log Image. Local host works, does not work with Github
  // app.post("/logImg/upload", function (req, res){
  //   var photos = [];
  //   var form = new formidable.IncomingForm();
  //   // Upload directory for the images
  //   form.uploadDir = "public/imgs/";
  //   // Keep file extensions
  //   form.keepExtensions = true;
  //   // Sets formibale to only accept single files.
  //   form.multiples = false;
  //   // Invoked when a file has finished uploading.
  //   form.on("file", function ( name, file){
  //     //Only allow one file
  //     if (photos.length === 1) {
  //       fs.unlink(file.path);
  //       return true;
  //     }
  //     // Read a chunk of the file.
  //     var buffer = null;
  //     // Get the file type using the buffer read using read-chunk
  //     var type = null;
  //     var filename = "";

  //     buffer = readChunk.sync(file.path, 0, 262);
  //     type = fileType(buffer);

  //     //Checks file extensions
  //     if (type !== null && (type.ext === 'png' || type.ext === 'jpg' || type.ext === 'jpeg')){
  //       // Assign new file name
  //       filename = Date.now() + '-' + file.name;
  //       // Move the file with the new file name
  //       fs.rename(file.path, "public/imgs/log/" + filename, function(err){
  //         if (err) throw err;
  //       } );

  //       photos.push({
  //         status: true,
  //         filename: filename,
  //         type: type.ext,
  //         publicPath: "../imgs/log/" + filename
  //       });
  //     }else{
  //       photos.push({
  //         status: false,
  //         filename: file.name,
  //         message: 'Invalid file type'
  //       });
  //       fs.unlink(file.path);
  //     }
  //   });
  //   form.on('error', function(err) {
  //     console.log('Error occurred during processing - ' + err);
  //   });
  //   // Invoked when all the fields have been processed.
  //   form.on('end', function() {
  //     console.log('All the request fields have been processed.');
  //   });
  //   // Parse the incoming form fields.
  //   form.parse(req, function (err, fields, files) {
  //     res.status(200).json(photos);
  //   });
  // });

  app.get('/sign-s3', function(req, res) {
    var s3 = new aws.S3({
      accessKeyId: User_Key,
      secretAccessKey: Secret_Key,
    });

    var fileName = req.query['file-name'];
    var fileType = req.query['file-type'];
    var uniqueName = Date.now()+"-"+fileName;
    var s3Params = {
      Bucket: Bucket_Name,
      Key: uniqueName,
      Expires: 60,
      ContentType: fileType,
      ACL: 'public-read'
    };

    s3.getSignedUrl('putObject', s3Params, function(err, data) {
      if(err){
        console.log(err);
        return res.end();
      }
      var returnData = {
        signedRequest: data,
        url: "https://"+Bucket_Name+".s3.amazonaws.com/"+uniqueName
      };
      res.write(JSON.stringify(returnData));
      res.end();
    });
  });

  app.delete("/api/sighting/log/delete/:id", function (req, res) {
    db.ufo.destroy({
      where: {
        id: req.params.id
      }
    }).then(function (dbufo) {
      res.json(dbufo);
    });
  });

};