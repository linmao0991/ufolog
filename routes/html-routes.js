// *********************************************************************************
// html-routes.js - this file offers a set of routes for sending users to the various html pages
// *********************************************************************************

// Dependencies
// =============================================================
var path = require("path");

// Routes
// =============================================================
module.exports = function(app) {

    // Each of the below routes just handles the HTML page that the user gets sent to.
  
    // index route loads index.html
    app.get("/", function(req, res) {
      res.sendFile(path.join(__dirname, "../public/html/index.html"));
    });

    // account_setup route loads account_setup.html
    app.get("/account_setup", function(req, res) {
      res.sendFile(path.join(__dirname, "../public/html/account_setup.html"));
    });
  
    // home route loads home.html
    app.get("/home", function(req, res) {
      res.sendFile(path.join(__dirname, "../public/html/home.html"));
    });

    // profile route loads profile.html
    app.get("/profile", function(req, res) {
      res.sendFile(path.join(__dirname, "../public/html/profile.html"));
    });
  
  };