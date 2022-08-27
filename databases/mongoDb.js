const mongoose = require("mongoose");
/* const chalk = require("chalk");
const dataBase = "restApi";

setTimeout(() => {
  mongoose
    .connect("mongodb://localhost/restApi")
    .then(() => console.log("connecting to mongodb!"))
    .catch((err) => console.error("Could not connect to mongodb", err));
}, 10000); */

mongoose
  .connect("mongodb://localhost/restApi")
  .then(() => console.log("connecting to mongodb!"))
  .catch((err) => console.error("Could not connect to mongodb", err));

exports.modules = mongoose;
