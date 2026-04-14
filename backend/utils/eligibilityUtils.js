/**
 * Check if a student meets the job's eligibility criteria
 * @param {Object} studentEducation - Student's education data
 * @param {Object} eligibilityCriteria - Job's eligibility criteria
 * @returns {Object} - { isEligible: boolean, reasons: [] }
 */
const checkAcademicEligibility = (
  studentEducation,
  eligibilityCriteria
) => {
  const reasons = [];

  if (!eligibilityCriteria || Object.keys(eligibilityCriteria).length === 0) {
    return { isEligible: true, reasons: [] };
  }

  if (!studentEducation) {
    return {
      isEligible: false,
      reasons: ['Your education details are incomplete. Please complete your profile.'],
    };
  }

  // Check 10th percentage
  if (eligibilityCriteria.tenthPercentage) {
    if (!studentEducation?.highschool?.score) {
      reasons.push(
        `Your 10th marks data is missing. Required: ${eligibilityCriteria.tenthPercentage}%`
      );
    } else if (studentEducation.highschool.score < eligibilityCriteria.tenthPercentage) {
      reasons.push(
        `Your 10th mark (${studentEducation.highschool.score}%) is below the required ${eligibilityCriteria.tenthPercentage}%`
      );
    }
  }

  // Check 12th percentage
  if (eligibilityCriteria.twelfthPercentage) {
    if (!studentEducation?.intermediate?.score) {
      reasons.push(
        `Your 12th marks data is missing. Required: ${eligibilityCriteria.twelfthPercentage}%`
      );
    } else if (
      studentEducation.intermediate.score <
      eligibilityCriteria.twelfthPercentage
    ) {
      reasons.push(
        `Your 12th mark (${studentEducation.intermediate.score}%) is below the required ${eligibilityCriteria.twelfthPercentage}%`
      );
    }
  }

  // Check diploma percentage (only if student is lateral entry)
  if (eligibilityCriteria.diplomaPercentage) {
    if (studentEducation?.isLateralEntry) {
      if (!studentEducation?.diploma?.score) {
        reasons.push(
          `Your Diploma marks data is missing. Required: ${eligibilityCriteria.diplomaPercentage}%`
        );
      } else if (studentEducation.diploma.score < eligibilityCriteria.diplomaPercentage) {
        reasons.push(
          `Your Diploma mark (${studentEducation.diploma.score}%) is below the required ${eligibilityCriteria.diplomaPercentage}%`
        );
      }
    }
  }

  // Check graduation percentage/CGPA
  if (eligibilityCriteria.graduationPercentage || eligibilityCriteria.graduationCGPA) {
    if (!studentEducation?.graduation?.aggregateGPA) {
      if (eligibilityCriteria.graduationPercentage) {
        reasons.push(
          `Your graduation percentage data is missing. Required: ${eligibilityCriteria.graduationPercentage}%`
        );
      }
      if (eligibilityCriteria.graduationCGPA) {
        reasons.push(
          `Your graduation CGPA data is missing. Required: ${eligibilityCriteria.graduationCGPA}`
        );
      }
    } else {
      const graduation = studentEducation.graduation;

      if (eligibilityCriteria.graduationPercentage) {
        // Convert CGPA to percentage (assuming CGPA out of 10, percentage = CGPA * 10)
        const graduationPercentage = graduation.aggregateGPA * 10;
        if (
          graduationPercentage <
          eligibilityCriteria.graduationPercentage
        ) {
          reasons.push(
            `Your graduation percentage (${graduationPercentage.toFixed(2)}%) is below the required ${eligibilityCriteria.graduationPercentage}%`
          );
        }
      }

      if (eligibilityCriteria.graduationCGPA) {
        if (graduation.aggregateGPA < eligibilityCriteria.graduationCGPA) {
          reasons.push(
            `Your graduation CGPA (${graduation.aggregateGPA.toFixed(2)}) is below the required ${eligibilityCriteria.graduationCGPA}`
          );
        }
      }
    }
  }

  return {
    isEligible: reasons.length === 0,
    reasons,
  };
};

module.exports = {
  checkAcademicEligibility,
};
