/**
 * Check if a student meets the job's eligibility criteria
 * @param {Object} studentEducation - Student's education data
 * @param {Object} eligibilityCriteria - Job's eligibility criteria
 * @param {Object} studentPersonal - Student's personal data (for DOB)
 * @param {Object} student - Student user data (for backlogs)
 * @returns {Object} - { isEligible: boolean, reasons: [] }
 */
const checkAcademicEligibility = (
  studentEducation,
  eligibilityCriteria,
  studentPersonal = null,
  student = null
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

  // Check active backlogs
  if (eligibilityCriteria.maxActiveBacklogs !== undefined && eligibilityCriteria.maxActiveBacklogs !== null) {
    if (student && student.activeBacklogs > eligibilityCriteria.maxActiveBacklogs) {
      reasons.push(
        `Your active backlogs (${student.activeBacklogs}) exceed the allowed limit (${eligibilityCriteria.maxActiveBacklogs})`
      );
    }
  }

  // Check completed backlogs
  if (eligibilityCriteria.maxCompletedBacklogs !== undefined && eligibilityCriteria.maxCompletedBacklogs !== null) {
    if (student && student.completedBacklogs > eligibilityCriteria.maxCompletedBacklogs) {
      reasons.push(
        `Your completed backlogs (${student.completedBacklogs}) exceed the allowed limit (${eligibilityCriteria.maxCompletedBacklogs})`
      );
    }
  }

  // Check DOB / minimum age eligibility
  if (eligibilityCriteria.maxDOB) {
    if (!studentPersonal?.dateOfBirth) {
      reasons.push(
        'Your date of birth is missing. Please update your personal details to verify age eligibility.'
      );
    } else {
      const studentDOB = new Date(studentPersonal.dateOfBirth);
      const maxDOB = new Date(eligibilityCriteria.maxDOB);

      if (studentDOB > maxDOB) {
        const age = Math.floor((new Date() - studentDOB) / (365.25 * 24 * 60 * 60 * 1000));
        const requiredAge = Math.floor((new Date() - maxDOB) / (365.25 * 24 * 60 * 60 * 1000));
        reasons.push(
          `Your age (${age} years) is below the required minimum age of ${requiredAge} years.`
        );
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
