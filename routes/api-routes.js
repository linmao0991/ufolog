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
};