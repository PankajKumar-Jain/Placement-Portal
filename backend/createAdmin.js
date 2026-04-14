require('dotenv').config();
const mongoose = require('mongoose');
const UserModel = require('./models/User');

const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'admin1234'; // Change this to your desired password
const ADMIN_NAME = 'Admin';

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected ✅');

    const existing = await UserModel.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      console.log(`Admin already exists with email: ${ADMIN_EMAIL}`);
      process.exit(0);
    }

    await UserModel.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'admin',
    });

    console.log(`✅ Admin created successfully!`);
    console.log(`   Email   : ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createAdmin();
