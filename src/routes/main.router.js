const express = require("express");
const {
  checkNotAuthenticated,
  checkAuthenticated,
} = require("../middlewares/auth");
const mainRouter = express.Router();

mainRouter.get("/", checkAuthenticated, (req, res, next) => {
  res.render("index");
});

mainRouter.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("auth/login");
});

mainRouter.get("/signup", checkNotAuthenticated, (req, res) => {
  res.render("auth/signup");
});

module.exports = mainRouter;
