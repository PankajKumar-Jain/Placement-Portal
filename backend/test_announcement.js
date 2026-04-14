require("dotenv").config();
const mongoose = require("mongoose");
const UserModel = require("./models/User");
const jwt = require("jsonwebtoken");
const http = require("http");

async function testAnnouncement() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected ✅");

    // Login as admin
    const user = await UserModel.findOne({ email: "admin@gmail.com" });
    if (!user) {
      console.log("Admin user not found");
      return;
    }

    const isMatch = await user.comparePassword("admin1234");
    if (!isMatch) {
      console.log("Password doesn't match");
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log("JWT Token generated successfully");

    // Test simple JSON request first
    const data = JSON.stringify({
      noticeTitle: "Test Announcement",
      noticeBody: "This is a test announcement for all students",
      targetType: "all"
    });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/notice',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        console.log('Response status:', res.statusCode);
        console.log('Response body:', body);
        process.exit(0);
      });
    });

    req.on('error', (e) => {
      console.error('Error:', e.message);
      process.exit(1);
    });

    req.write(data);
    req.end();

  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

testAnnouncement();