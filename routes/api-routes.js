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

  // GET route for getting all logs by user ID
  app.get("/api/ufo/sightings/:id", function (req, res) {
    db.ufo.findAll({
      where: {
        id: req.params.id
      }
    }).then(function (dbufo) {
      res.json(dbufo);
    });
  });

  // Account Get/Post Routes
  // Using the passport.authenticate middleware with our local strategy.
  // If the user has valid login credentials, send them to the members page.
  // Otherwise the user will be sent an error
  app.post("/api/login", passport.authenticate("local"), function(req, res) {
    res.json(req.user);
  });

  // Route for signing up a user. The user's password is automatically hashed and stored securely thanks to
  // how we configured our Sequelize User Model. If the user is created successfully, proceed to log the user in,
  // otherwise send back an error
  app.post("/api/signup", function(req, res) {
    db.User.create({
      userName: req.body.userName,
      password: req.body.password,
      aboutMe: req.body.aboutMe
    })
      .then(function() {
        res.redirect(307, "/api/login");
      })
      .catch(function(err) {
        console.log(db.User);
        res.status(401).json(err);
      });
  });

  // Route for logging user out
  app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
  });

  // Route for getting some data about our user to be used client side
  app.get("/api/user_data", function(req, res) {
    if (!req.user) {
      // The user is not logged in, send back an empty object
      res.json({});
    } else {
      // Otherwise send back the user's email and id
      // Sending back a password, even a hashed password, isn't a good idea
      res.json({
        userName: req.user.userName,
        id: req.user.id
      });
    }
  });

  // Post route for like/dislike updating for log.
  app.put("/api/sighting/log/rating/:id", function (req, res) {
    if (req.body.rating === "like") {
      db.ufo.findOne({
        where: {
          id: req.params.id
        }
      },).then(function (dbufo) {
        dbufo.increment("likes");
        res.json(dbufo);
      });
    } else {
      db.ufo.findOne({
        where: {
          id: req.params.id
        }
      }, ).then(function (dbufo) {
        dbufo.increment("dislikes");
        res.json(dbufo);
      });
    }
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