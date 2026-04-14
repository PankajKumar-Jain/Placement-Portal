const mongoose = require('mongoose');
require('dotenv').config();
const UserModel = require('../models/User');
const { PlacementModel } = require('../models/student');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const placementCount = await PlacementModel.countDocuments();
    const placements = await PlacementModel.find().limit(5).lean();
    const userIds = placements.map((p) => p.studentId).filter(Boolean);
    const users = await UserModel.find({ _id: { $in: userIds } })
      .select('departmentName role')
      .lean();
    console.log('placementCount=', placementCount);
    console.log('sample placements=', JSON.stringify(placements, null, 2));
    console.log('sample users=', JSON.stringify(users, null, 2));
    const agg = await PlacementModel.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student',
        },
      },
      { $unwind: { path: '$student', preserveNullAndEmptyArrays: true } },
      { $group: { _id: '$student.departmentName', count: { $sum: 1 } } },
    ]);
    console.log('agg=', JSON.stringify(agg, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
})();