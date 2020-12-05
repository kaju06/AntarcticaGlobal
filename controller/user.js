const joi = require("joi");
const validateReq = require("../middleware/validaterequest");
const User = require("../model/usermongo");

exports.registerSchema = (req, res, next) => {
  const schema = joi.object({
    firstname: joi.string().required(),
    lastname: joi.string().required(),
    email: joi.string().required(),
    password: joi.string().required(),
    empid: joi.string().required(),
    organization: joi.string().required(),
  });
  validateReq(req, next, schema);
};

exports.register = async (req, res, next) => {
  const password = req.body.password;
  let data = {
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    password: password,
    empid: req.body.empid,
    organization: req.body.organization,
  };
  const newuser = new User(data);

  User.findOne({ email: newuser.email }, function (err, user) {
    if (user)
      return res.status(400).json({ auth: false, message: "this email id already exits!" });
    newuser.save((err, doc) => {
      if (err) {
        console.log(err);
        return res.status(400).json({ success: false, message: err });
      }
      res.status(200).json({
        succes: true,
        user: doc,
      });
    });
  });
};

exports.loginSchema = (req, res, next) => {
  const schema = joi.object({
    email: joi.string().required(),
    password: joi.string().required(),
  });
  validateReq(req, next, schema);
};

exports.login = (req, res, next) => {
  let token = (req.headers.cookie && req.headers.cookie.slice(5).trim()) || "";
  if (token && token.length) {
    User.findByToken(token, (err, user) => {
      if (err) return res(err);
      if (user)
        return res.status(400).json({
          error: true,
          message: "You are already logged in!",
        });
    });
  } else {
    User.findOne({ email: req.body.email }, async function (err, user) {
      if (!user)
        return res.json({
          isAuth: false,
          message: "Authentication failed! Email not found!",
        });
      user.comparepassword(req.body.password, (err, isMatch) => {
        if (!isMatch)
          return res.json({
            isAuth: false,
            message: "Password doesn't match!",
          });
        user.generateToken((err, user) => {
          if (err) return res.status(400).send(err);
          res.cookie("auth", user.token).json({
            isAuth: true,
            id: user._id,
            email: user.email,
          });
        });
      });
    });
  }
};

exports.getUsers = async (req, res, next) => {
  let aggregate_options = [];
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 5;
  const options = {
    page,
    limit,
    collation: { locale: "en" },
    customLabels: {
      totalDocs: "totalResults",
      docs: "users",
    },
  };
  let match = {};
  if (req.query.q) match.name = { $regex: req.query.q, $options: "i" };
    let sortOrder =
      req.query.sort_order && req.query.sort_order === "desc" ? 1 : -1;
  aggregate_options.push({ $match: match });
  const userAggregate = User.aggregate(aggregate_options).sort({
    firstname: sortOrder,
    lastname: sortOrder,
    email: sortOrder,
    empid: sortOrder,
    organization: sortOrder,
  });
  const result = await User.aggregatePaginate(userAggregate, options);
  res.status(200).json(result);
};