const mongoose = require("mongoose");
const _ = require("lodash");
const Joi = require("joi");

const cardSchema = mongoose.Schema({
  bizName: { type: String, required: true, minlength: 2, maxlength: 255 },
  bizDescription: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 1050,
  },
  bizAddress: { type: String, required: true, minlength: 2, maxlength: 255 },
  bizPhone: { type: String, required: true, minlength: 7, maxlength: 15 },
  bizImage: { type: String, required: true, minlength: 11, maxlength: 1025 },
  creator_id: { type: String },

  user_id: { type: String },
  bizNumber: {
    type: Number,
    required: true,
    minlength: 3,
    maxlength: 9999999999999,
    unique: true,
  },
  createdAt: { type: Date },
  likes: { type: Array },
});

const Card = mongoose.model("Card", cardSchema);

async function generateBizNumber(Card) {
  while (true) {
    let randomNumber = _.random(1000, 999999);
    let card = await Card.findOne({ bizNumber: randomNumber });
    if (!card) return String(randomNumber);
  }
}

Card.generateBizNumber = generateBizNumber;
module.exports = Card;
