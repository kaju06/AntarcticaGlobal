const express = require("express");
const { required } = require("joi");
const router = express.Router();
const { auth } = require("../middleware/auth");
const user = require("../controller/user");
router.post("/register", user.registerSchema, user.register);
router.post("/login", user.loginSchema, user.login);
router.get("/userlist", auth, user.getUsers);

module.exports = router;