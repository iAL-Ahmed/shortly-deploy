var mongoose = require('mongoose');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');



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
});

UserSchema.methods.comparePassword = function(attemptedPassword, callback) {
    bcrypt.compare(attemptedPassword, this.password, function(err, isMatch) {
      callback(isMatch);
    });
  }

UserSchema.pre('save', function (next) {
  var user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) {
    return next();
  }

    // hash the password along with our new salt
  bcrypt.hash(user.password, null, null , function(err, hash) {
    if (err) {
      return next(err);
    }

    // override the cleartext password with the hashed one
    user.password = hash;
    next();
  });

});

var User = mongoose.model('users', UserSchema);

var LinkSchema = new mongoose.Schema({
   visits: Number,
   link: String,
   title: String,
   code: String,
   base_url: String,
   url: String
  });

var createSha = function(url) {
  var shasum = crypto.createHash('sha1');
  shasum.update(url);
  return shasum.digest('hex').slice(0, 5);
};

LinkSchema.pre('save', function(next){
  var code = createSha(this.url);
  this.code = code;
  next();
});

var Link = mongoose.model('links', LinkSchema);


//reference the angular user.model
mongoose.connect('mongodb://localhost/norum'); ///decide on url

