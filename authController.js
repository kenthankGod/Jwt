const User = require("../models/User");
const jwt = require("jsonwebtoken");

// handle errors
const handleErrors = (error) => {
  console.log(error.message, error.code);
  let errorsVal = { email: "", password: "" };

  // handle duplicate error
  if (error.code === 11000) {
    errorsVal.email = "oops! email is already taken";
    return errorsVal;
  }

  // incorrect email
  if (error.message === "incorrect email") {
    errorsVal.email = "this email is not registered";
  }

  // incorrect password
  if (error.message === "incorrect password") {
    errorsVal.password = "this password is incorrect";
  }

  // error validation
  if (error.message.includes("user validation failed")) {
    Object.values(error.errors).forEach(({ properties }) => {
      errorsVal[properties.path] = properties.message;
    });
  }
  return errorsVal;
};
// we're crearting and signing our jwt here

// maxAge is the lifespan of this jwt, since cookies calculate in milliseconds,
// jwt calculates in seconds, therefore: 3*24*60*60 is equal to 3 days
// since cookie calculates in milliseconds we times maxAge by 1000 to get 3 days
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, "red devils secret", {
    expiresIn: maxAge,
  });
};

module.exports.signup_get = (req, res) => {
  res.render("signup");
};

module.exports.login_get = (req, res) => {
  res.render("login");
};

module.exports.signup_post = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.create({ email, password });
    const jToken = createToken(user._id);
    res.cookie("jwt", jToken, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(201).json({ user: user._id });
  } catch (error) {
    const errors = handleErrors(error);
    res.status(400).json({ errors });
    console.log(error);
  }
};

module.exports.login_post = async (req, res) => {
  const { email, password } = req.body;
  // we use the login function fromn the User schema
  try {
    const user = await User.login(email, password);
    const jToken = createToken(user._id);
    res.cookie("jwt", jToken, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ user: user._id });
  } catch (error) {
    const errors = handleErrors(error);
    res.status(400).json({ errors });
    console.log(errors);
  }
};

module.exports.logout_get = (req, res) => {
  res.cookie("jwt", " ", { maxAge: 1 });
  res.redirect("/");
};
