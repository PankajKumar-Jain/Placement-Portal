/* DIRECT OPTIONS - ARRAY BASED */

export const getStudentJobFilters = [
  { text: 'open', value: 'open' },
  { text: 'applied', value: 'applied' },
  { text: 'shortlisted', value: 'shortlisted' },
  { text: 'hired', value: 'hired' },
  { text: 'rejected', value: 'rejected' },
];

export const getCompanyJobFilters = [
  { text: 'open', value: 'open' },
  { text: 'expired', value: 'expired' },
];

/* PREPARED OPTIONS - FUNCTIONS BASED */

export function getCourseOptions(courses) {
  const options = [{ text: 'Select Course', value: '-1' }];
  for (let id in courses) {
    options.push({ text: courses[id].courseName, value: id });
  }
  return options;
}

export function getDepartmentOptions(depts) {
  const options = [];
  for (let dept of depts) {
    options.push({ text: dept.departmentName, value: dept.departmentId });
  }
  return options;
}

export function getBatchOptions(batches) {
  const options = [];
  for (let batch of batches) {
    options.push({ text: batch.batchYear, value: batch.batchId });
  }
  return options;
}
