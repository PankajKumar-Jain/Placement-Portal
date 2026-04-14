const {
  EducationDataModel,
  CurrentScoreModel,
  PastScoreModel,
} = require('./EducationData');

module.exports.PersonalDataModel = require('./PersonalData');
module.exports.PlacementModel = require('./PlacementData');
module.exports.ExperienceModel = require('./ExperienceData');
module.exports.TrainingModel = require('./StudentTraining');

module.exports.EducationModel = EducationDataModel;
module.exports.CurrentScoreModel = CurrentScoreModel;
module.exports.PastScoreModel = PastScoreModel;
