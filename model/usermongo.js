const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstname: {
    type: String,
    required: true,
    trim: true,
  },
  lastname: {
    type: String,
    required: true,
    trim: true,
  },
  empid: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  organization: {
    type: String,
    required: true,
    trim: true,
  },
  token: {
    type: String,
  },
});

UserSchema.pre("save", function (next) {
  var user = this;
  bcrypt.hash(user.password, 10, function (err, hash) {
    console.log("hash > ", hash);
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  });
});

UserSchema.methods.comparepassword = function (password, cb) {
  console.log("PW > ", password, this.password);
  bcrypt.compare(password, this.password, function (err, isMatch) {
    if (err) cb(err);
    cb(null, isMatch);
  });
};

UserSchema.methods.generateToken = function (cb) {
  var user = this;
  var token = jwt.sign(user._id.toHexString(), "abcdefgh");
  user.token = token;
  user.save(function (err, user) {
    if (err) return cb(err);
    cb(null, user);
  });
};

UserSchema.statics.findByToken = function (token, cb) {
  var user = this;
  jwt.verify(token, "abcdefgh", function (err, decode) {
    user.findOne({ _id: decode, token: token }, function (err, user) {
      if (err) return cb(err);
      cb(null, user);
    });
  });
};
UserSchema.plugin(aggregatePaginate);
var User = mongoose.model("User", UserSchema);
module.exports = User;
