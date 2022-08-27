const express = require("express");
const bcrypt = require("bcrypt");
const morgan = require("morgan");
const _ = require("lodash");
const chalk = require("chalk");
const jwt = require("jsonwebtoken");
const router = express.Router();
const userSchema = require("../validators/user");
const UserModel = require("../models/user");
const CardModel = require("../models/card");
const checkToken = require("./../middleware/checkToken");

const saltRounds = 10;

const returnUserKeys = ["_id", "email", "name", "biz", "admin", "createdAt"];

router.use(morgan("tiny"));

router.post("/create", createRequest);

async function createRequest(req, res) {
  console.log(chalk.blue(`Data received from POST method`));
  console.log(req.body);

  const { error, value } = userSchema.newUser.validate(req.body);

  const user = value;

  if (error) {
    console.log(chalk.red("Sending Error 400: " + error));
    res.status(400).send(error);
  } else {
    try {
      const result = await UserModel.find({ email: user.email });
      if (result.length > 0) {
        console.log(chalk.red("Sending Error 400: " + error));
        res.status(400).send("User already exists");
      } else {
        try {
          const savedUser = await saveUser(user);
          res.status(201).send(savedUser);
        } catch (error) {
          console.log(chalk.red("Sending Error 400: " + error));
          res.status(400).send(error);
        }
      }
    } catch (error) {
      console.log(chalk.red("Sending Error 400: " + error));
      res.status(400).send(error);
    }
  }
}

function saveUser(user) {
  return new Promise(async (resolve, reject) => {
    try {
      user.password = await bcrypt.hash(user.password, saltRounds);
      console.log(chalk.magenta("Your Password: " + user.password));
      const savedUser = await new UserModel(user).save();
      resolve(_.pick(savedUser, returnUserKeys));
    } catch (error) {
      reject(error);
    }
  });
}

router.post("/auth", login);

async function login(req, res) {
  console.log(`Data received from POST method`);
  console.log(req.body);

  const { error, value } = userSchema.auth.validate(req.body);

  const user = value;
  if (error) {
    console.log(chalk.red("Sending Error 400: " + error));
    res.status(400).send(error);
  } else {
    try {
      const userModel = await UserModel.findOne({ email: user.email });
      if (!userModel) {
        console.log(chalk.red("Sending Error 400: " + error));
        res.status(400).send("Username or password wrong");
        return;
      }
      const isAuth = await userModel.checkPassword(user.password);
      if (!isAuth) {
        console.log(chalk.red("Sending Status 400 with Password Wrong"));
        res.status(400).send("Username or password wrong");
        return;
      }
      console.log(chalk.green("Sending Status 200 with Password OK"));
      res.status(200).send({ token: userModel.getToken() });
    } catch (error) {
      console.log(chalk.red("Sending Error 400: " + error));
      res.status(400).send(error);
    }
  }
}

router.get("/me", checkToken, me);
router.post("/me", checkToken, me);

async function me(req, res) {
  const userId = req.uid;
  try {
    const user = await UserModel.findById(userId);

    console.log(chalk.green("Sending Status 200 with Token OK and Data:"));
    console.log(chalk.blue(user));
    res.status(200).send(_.pick(user, returnUserKeys));
  } catch (err) {
    console.log(chalk.red("Sending Error 400: " + error));
    res.status(400).send("User not exists try to login again");
  }
}

router.get("/show", checkToken, AllUsers);

async function AllUsers(req, res) {
  if (req.admin) {
    try {
      const userModel = await UserModel.find({});
      if (userModel.length == 0) {
        console.log(chalk.red("user not found"));
        res.status(200).send("user not found");
        return;
      }
      res.status(200).send(userModel);
    } catch (error) {
      console.log(chalk.red("Sending Error 400: " + error));
      res.status(400).send(error);
    }
  } else {
    console.log(chalk.red(`Need administrator conviction`));
    res.status(400).send("Need administrator conviction");
  }
}

router.post("/decryptToken", (req, res) => {
  try {
    var decoded = jwt.verify(req.body.token, process.env.JWT_PASSWORD);
    res.status(200).send(decoded);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
    return;
  }
});
router.get("/getAllBizCards/:id", getBizCardsWithId);

async function getBizCardsWithId(req, res) {
  try {
    const cardWithId = await CardModel.find({
      creator_id: req.params.id,
    });
    res.status(200).send(cardWithId);
  } catch (err) {
    res.status(400).send(err);
  }
}

module.exports = router;
