// *********************************************************************************
// api-routes.js - this file offers a set of routes for displaying and saving data to the db
// *********************************************************************************

// Dependencies
// =============================================================

// Requiring our Todo model
var db = require("../models");
var passport = require("../config/passport");

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
      // console.log(dbufo)
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
      // console.log(dbufo)
      res.json(dbufo);
    });
  });

  app.get("/api/ufo/sightings/get_rating/:id", function (req, res) {
    // console.log("*****************************");
    // console.log("get_rating data");
    // console.log(req.body);
    var rating = {}
    db.log_rating.count({
      where: {
        ufoId: req.params.id,
        rating: "like"
      }
    }).then(function (result) {
      rating.likes = result;
      // console.log(result);
      // console.log("*****************************");
      db.log_rating.count({
        where: {
          ufoId: req.params.id,
          rating: "dislike"
        }
      }).then(function (result) {
        rating.dislikes = result;
        // console.log(result);
        // console.log("*****************************");
        // console.log(rating);
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
        profileurl: req.file
      })
      .then(function () {
        res.redirect(307, "/api/login");
      })
      .catch(function (err) {
        // console.log(db.User);
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
      // console.log("=============")
      // console.log("Data")
      // console.log(data);
      // console.log("=============")
      if (data === null) {
        // console.log("=============")
        // console.log("No Rating");
        // console.log("=============")
        if (req.body.rating === "like") {
          // console.log("=============")
          // console.log("like")
          // console.log("=============")
          db.log_rating.create({
            userName: req.body.userName,
            rating: req.body.rating,
            ufoId: req.params.id
          }).then(function (dblogratings) {
            return res.json(dblogratings);
          });
        } else {
          // console.log("=============")
          // console.log("dislike")
          // console.log("=============")
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
        // console.log("=============")
        // console.log("Denied");
        // console.log(code);
        // console.log("=============")
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