const User = require("../model/usermongo");

const auth = (req, res, next) => {
  console.log("REQ > ", req.headers.cookie.slice(5).trim());
  let token = (req.headers.cookie && req.headers.cookie.slice(5).trim()) || "";
  User.findByToken(token, (err, user) => {
    if (err) throw err;
    if (!user)
      return res.json({
        error: true,
      });
    req.token = token;
    req.user = user;
    next();
  });
};

module.exports = { auth };
