var GitHubStrategy = require('passport-github2').Strategy;
// var development = require('../config/env/development.js');
var passport = require("passport");
var User = require('../models/user.server.model.js');
var repo = require('../services/repo.server.service.js');

exports.githubStrategy = function() {
  passport.use(new GitHubStrategy({
      /* These variables are tied to our application's account.  By including them here, we gain access to the users we authenticate */
      clientID: process.env.githubClientID,
      clientSecret: process.env.githubClientSecret,
      callbackURL: process.env.githubCallbackUrl
    },
    function(accessToken, refreshToken, profile, done) {
      User.where({
          github_id: profile.id
      })
      .fetch()
      .then(function(user) {
        /* Check to see if user exists.  If user does not exist, create user */
        if (!user) {
          User.forge({
            github_id: profile.id,
            username: profile.username,
            name: profile.displayName,
            email: profile._json.email,
            token: accessToken
          }).save().then(function(newUser) {
            /* Create a new repo in the user's GitHub account */
            repo.addRepo(accessToken, profile.username);
            return done(null, newUser);
          });
        } else {
          return done(null, user);
        }
    }).catch(function(err) {
        console.log(err);
      });
  }));
};

/* Determines what data from the user object should be stored in the session result of serializeUser method is attached to the session as req.session.passport.user */
passport.serializeUser(function(user, done) {
  done(null, user);
});

/* Pass in key that is saved in req.session.passport.user -- this key is used to retrieve the user object attaches the user object to the request as req.user */
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


/* this function can be used if we choose to run sessions */

// exports.authenticate = function(req, res, next) {
//   if (req.isAuthenticated()) { return next(); }
//   res.redirect('/login');
// };
