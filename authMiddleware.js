const jwt = require("jsonwebtoken");
const User = require("../models/User");

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;

  //do this if token exists and is verified
  if (token) {
    jwt.verify(token, "red devils secret", (error, decodedToken) => {
      if (error) {
        console.log(error.message);
        res.redirect("/login");
      } else {
        console.log(decodedToken);
        next();
      }
    });
  } else {
    res.redirect("/login");
  }
};

const userCheck = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, "red devils secret", async (error, decodedToken) => {
      if (error) {
        console.log(error.message);
        res.locals.user = null;
      } else {
        console.log(decodedToken);
        let user = await User.findById(decodedToken.id);
        res.locals.user = user;
        next();
      }
    });
  } else {
    res.locals.user = null;
    next();
  }
};

module.exports = { requireAuth, userCheck };
