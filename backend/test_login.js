require("dotenv").config();
const mongoose = require("mongoose");
const UserModel = require("./models/User");

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  const user = await UserModel.findOne({ email: "admin@gmail.com" });
  console.log("User:", user);
  if (user) {
    const isMatch = await user.comparePassword("admin1234");
    console.log("Password matches 'admin1234':", isMatch);
  }
  process.exit(0);
}
test();
