// *********************************************************************************
// api-routes.js - this file offers a set of routes for displaying and saving data to the db
// *********************************************************************************

// Dependencies
// =============================================================

// Requiring our Todo model
var db = require("../models");

// Routes
// =============================================================
module.exports = function(app) {

    // GET route for getting all of the ufo sightings
    app.get("/api/ufo/", function(req, res) {
      db.ufo.findAll({})
        .then(function(dbufo) {
          res.json(dbufo);
        });
    });

    // Post route for user sign up
    app.post("/api/signup", function(req, res) {
      db.User.create(req.body).then(function(dbUser) {
        res.json(dbUser);
      });
    });

    // Post route for loging a new sighting
    app.post("/api/sighting/log", function(req, res) {
      db.ufo.create(req.body).then(function(dbUfo) {
        res.json(dbUfo);
      });
    });

    // Post route for like/dislike updating for log.
    app.post("/api/sighting/log/rating/:id", function(req, res) {
      if (req.body.rating === "like"){
        db.ufo.update(
          {
            like : req.body.points
          },
          {
            where: {
              id: req.params.id
            }
          },
          ).then(function(dbufo) {
          res.json(dbufo);
        });
      }else{
        db.ufo.update(
          {
            dislike : req.body.points
          },
          {
            where: {
              id: req.params.id
            }
          },
          ).then(function(dbufo) {
          res.json(dbufo);
        });
      }
    });

    // Post route for deleting log
    app.delete("/apy/sighting/log/delete/:id", function (req, res) {
      db.ufo.destroy({
        where: {
          id: req.params.id
        }
      }).then(function(dbufo){
        res.json(dbufo);
      });
    });
};
