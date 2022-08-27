const express = require("express");
const morgan = require("morgan");
const _ = require("lodash");
const chalk = require("chalk");

const router = express.Router();
const cardSchema = require("../validators/card");
const CardModel = require("../models/card");
const UserModel = require("../models/user");
const checkToken = require("./../middleware/checkToken");

router.use(morgan("tiny"));

router.get("/showAll", AllCards); //part 7

async function AllCards(req, res) {
  try {
    const cardModel = await CardModel.find({});
    res.status(200).send(cardModel);
  } catch (error) {
    console.log(chalk.red("Sending Error 400: " + error));
    res.status(400).send(error);
  }
}

router.get("/getAllBizCards/:userId", getBizCardsWithId); //  get all cards of specific user

async function getBizCardsWithId(req, res) {
  if (!req.admin) {
    res.status(400).send("you are not admin");
    return;
  }
  try {
    const cardWithId = await CardModel.find({ user_id: req.params.userId });

    res.status(200).send(cardWithId);
  } catch (err) {
    console.log(
      chalk.red("Sending Error 400, The card with the given ID was not found")
    );
    res.status(400).send(err);
  }
}

router.get("/show/:cardId", getCardsByCardId); //part 8

async function getCardsByCardId(req, res) {
  let card = await CardModel.findOne({ _id: req.params.cardId });
  if (!card) {
    return res
      .status(404)
      .send("The card ID=" + req.params.cardId + " was not found.");
  }
  return res.status(200).send(card);
}

router.get("/showAllMyCards", checkToken, getAllMyCards); //part 9

async function getAllMyCards(req, res) {
  const user_Id = req.uid;
  try {
    if (!req.biz) {
      res.status(400).send("you are not business user");
      console.log(chalk.red("Sending Error 400: " + error));
      return;
    }
    const cardUId = await CardModel.find({ user_id: user_Id });
    res.status(200).send(cardUId);
    console.log(chalk.green("your cards"));
  } catch (err) {
    res.status(400).send(err);
  }
}

router.post("/createCard", checkToken, createCard); //part 10
async function createCard(req, res) {
  console.log(chalk.blue(`Data received from POST method:`));
  console.log(req.body);
  try {
    if (!req.biz) {
      res.status(400).send("you are not business user");
      return;
    }
    const { error } = cardSchema.newCard.validate(req.body);
    if (error) {
      console.log(chalk.red("Sending Error 400: " + error));
      res.status(400).send(error);
    }
    let card = new CardModel({
      bizName: req.body.bizName,
      bizDescription: req.body.bizDescription,
      bizAddress: req.body.bizAddress,
      bizPhone: req.body.bizPhone,
      bizImage: req.body.bizImage
        ? req.body.bizImage
        : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
      bizNumber: await CardModel.generateBizNumber(CardModel),
      user_id: req.uid,
      creator_id: req.uid,
      createdAt: new Date(),
      likes: [],
    });
    post = await card.save();
    chalk.green("Sending Status 200, Card saved to Database successfully...");
    res.status(200).send(post);
  } catch (err) {
    res.status(500).send(err);
  }
}

router.put("/update/:cardId", checkToken, update); //part 11

async function update(req, res) {
  try {
    if (!req.biz) {
      res.status(400).send("you are not business");
      return;
    }

    const { error } = cardSchema.newCard.validate(req.body);
    if (error) {
      res.status(400).send(error);
      console.log(error);
    }

    let editCard = await CardModel.findOneAndUpdate(
      { _id: req.params.cardId, user_id: req.userId },
      req.body
    );
    if (!editCard)
      return res.status(404).send("The card with the given ID was not found.");

    const filter = {
      _id: req.params.cardId,
      user_id: req.userId,
    };

    let cardByFilter = await CardModel.find(filter);
    if (!cardByFilter) return res.status(400).send("user do not have a card.");
    res.send(cardByFilter);
  } catch (err) {
    res.status(500).send(err);
  }
}

router.delete("/delete/:cardId", checkToken, deleteCard); // part 12
async function deleteCard(req, res) {
  if (req.biz || req.admin) {
    console.log(chalk.green("Business user Administrator deletes a card"));
    console.log(chalk.blue("biz " + req.biz));
    console.log(chalk.blue("Admin " + req.admin));

    try {
      const cardModel = await CardModel.findById(req.params.cardId);
      if (!cardModel) {
        console.log(chalk.green("No card found"));
        res.status(404).send("No card found");
        return;
      }
      const status = await CardModel.deleteOne({ _id: cardModel._id });
      console.log(
        chalk.bgGreenBright(
          `Document with _id: '${cardModel._id}' was deleted successfully !!!`
        )
      );

      res.status(200).send(status);
    } catch (error) {
      console.log(chalk.red("Sending Error 500: " + error));
      res.status(500).send(error);
    }
  } else {
    console.log(chalk.red(`A user cannot delete a card`));
    res.status(400).send("A user cannot delete a card");
  }
}
router.patch("/likes/:cardId", checkToken, likes);
//part 13
async function likes(req, res) {
  try {
    const { error } = cardSchema.validateLikesPayload(req.body);
    if (error) {
      console.log(chalk.red(`error`));
      res.status(400).send(error.details[0].message);
      return;
    }
    const findCard = await CardModel.findOne({
      _id: req.params.cardId,
    });
    if (!findCard) {
      console.log(chalk.red("Card not found"));
      res.status(404).send("Card id=" + req.params.cardId + " not found");
      return;
    }
    const idArr = req.body.likes;

    let userArr = await UserModel.find({ _id: idArr });
    if (!(userArr.length == idArr.length)) {
      console.log(
        chalk.red(`${idArr.length - userArr.length} user ids not found`)
      );
      res.status(400).send("{likes:[...]} must contain only user ids");
      return;
    }

    findCard.likes = req.body.likes;
    await findCard.save();
    res.status(200).send(findCard);
  } catch (err) {
    res.status(400).send(err);
    return;
  }
}

module.exports = router;
