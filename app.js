require("dotenv").config();

const express = require("express");
const PORT = process.env.PORT || 3000;
const user = require("./routes/user");
const card = require("./routes/card");
require("./databases/mongoDb");
const cors = require("cors");
const chalk = require("chalk");
const checkConnection = require("./middleware/checkConnection");

const morgan = require("morgan");

const app = express();

app.use(checkConnection);
app.use(express.json());
app.use("/user", user);
app.use("/card", card);
app.use(morgan("tiny"));
app.use(cors());
app.listen(PORT, () => {
  console.log("Server is up on port " + PORT);
});
