require('../app/model.js');
var mongoose = require('mongoose');
var User = mongoose.model('users');
var Link = mongoose.model('links');

var request = require('request');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var Q = require('q');
var jwt = require('jwt-simple');


var db = require('../app/config');
//var Link = require('../app/models/link');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function(){
    res.redirect('/login');
  });
};

exports.fetchLinks = function (req, res, next) {
  // Links.reset().fetch().then(function(links) {
  //   res.send(200, links.models);
  // })
  // var findAll = Q.nbind(Link.find, Link);

  Link.find(function (err, links) {
    if(err) {
      console.log(err);
    }
    else{
      res.send(200, links);
    }
  });
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  Link.findOne({ url: uri }, function(found) {
    if (found) {
      res.send(200, found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        var link = new Link({
          url: uri,
          title: title,
          base_url: req.headers.origin
        });

        link.save(function(newLink) {
          Links.add(newLink);
          res.send(200, newLink);
        });
      });
    }
  });
};


exports.loginUser = function (req, res, next) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({ username: username }, function(err, user) {
      if (!user) {
        res.redirect('/login');
      } else {
        user.comparePassword(password, function(match) {
          if (match) {
            util.createSession(req, res, user);
          } else {
            res.redirect('/login');
          }
        })
      }
  });

    // var username = req.body.username,
    //     password = req.body.password;

    // var findUser = Q.nbind(User.user.findOne, User);
    // findUser({username: username})
    //   .then(function (user) {
    //     if (!user) {
    //       next(new Error('User does not exist'));
    //     } else {
    //       return user.comparePasswords(password)
    //         .then(function(foundUser) {
    //           if (foundUser) {
    //             var token = jwt.encode(user, 'secret');
    //             res.json({token: token});
    //           } else {
    //             return next(new Error('No user'));
    //           }
    //         });
    //     }
    //   })
    //   .fail(function (error) {
    //     next(error);
    //   });
};

exports.signupUser = function (req, res, next) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({ username: username }, function(err, user) {
      if (!user) {
        var newUser = new User({
          username: username,
          password: password
        });
        newUser.save(function(err, newUser) {
            util.createSession(req, res, newUser);
            User.add(newUser);
          });
      } else {
        console.log('Account already exists');
        res.redirect('/signup');
      }
    })
};

exports.navToLink = function (req, res, next, code) {
  Link.findOne({ code: req.params[0] }, function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      link.set({ visits: link.get('visits') + 1 })
        .save(function() {
          return res.redirect(link.get('url'));
        });
    }
  });

  // Link.findOne({code: code}, function (link) {
  //       if (link) {
  //         req.navLink = link;
  //         next();
  //       } else {
  //         next(new Error('Link not added yet'));
  //       }
  //     })
  //     .fail(function (error) {
  //       next(error);
  //     });

    // var link = req.navLink;
    // link.visits++;
    // link.save(function (err, savedLink) {
    //   if (err) {
    //     next(err);
    //     res.redirect('/')
    //   } else {
    //     res.redirect(savedLink.url);
    //   }
    // });
};
