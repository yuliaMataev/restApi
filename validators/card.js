const Joi = require("joi");

module.exports.newCard = Joi.object({
  bizName: Joi.string().required().min(2).max(100),
  bizDescription: Joi.string(),
  bizAddress: Joi.string(),
  bizPhone: Joi.string().required().min(13).max(14),
  bizImage: Joi.string(),
});

module.exports.validateLikesPayload = function (data) {
  const schema = Joi.object({
    likes: Joi.array().min(1).required(),
  });

  return schema.validate(data);
};
