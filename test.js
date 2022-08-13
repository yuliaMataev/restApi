const bcrypt = require("bcrypt");
async function pass() {
  const saltRounds = 5;
  const password = "123456";
  try {
    encryptedPassword = await bcrypt.hash(password, saltRounds);
    console.log(encryptedPassword);
  } catch (err) {
    console.log("Error: ", err);
  }
  let result = await bcrypt.compare(
    password,
    "$2b$05$qV5YnhFT6hLJGF6GzWgUvemShpnzJvLzBZk2zQRs4dflt3NCalsi6"
  );

  console.log(result);
  result = await bcrypt.compare(
    password,
    "$2b$05$goJHQ6FxaK.XKeT215FRMu8VCbwL7qxVJXAFNkFaApoKU2/rf.mmO"
  );
  console.log(result);
  result = await bcrypt.compare(
    password,
    "$2b$05$UcFzTsm4sFltIQ0UQltpWuyss/HRaZDiE5iCUUxq0nfjrpg.zVZzK"
  );
  console.log(result);
}

pass();
