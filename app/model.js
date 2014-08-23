var mongoose = require('mongoose');
var crypto = require('crypto');


mongoose.connect('mongodb://localhost/norum'); ///decide on url

var UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },
  salt: String
});

//reference the angular user.model
