const User = require("../models/User");
const jwt = require("jsonwebtoken");

// handle errors
const handleErrors = (error) => {
  console.log(error.message, error.code);
  let errorsVal = { email: "", password: "" };

  // handle duplicate error
  if (error.code === 11000) {
    errorsVal.email = "This email is already taken";
    return errorsVal;
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
    console.log(error);
    res.status(400).json({ errors });
  }
};

module.exports.login_post = async (req, res) => {
  const { email, password } = req.body;

  // console.log(email, password);
  // res.send("user login");
  try {
    const user = await User.login(email, password);
    res.status(200).json({ user: user._id });
  } catch (error) {
     res.status(400).json({});
  }
};
