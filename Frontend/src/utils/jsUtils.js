export function formatDate(date) {
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();

  if (month < 10) {
    month = '0' + month;
  }
  if (day < 10) {
    day = '0' + day;
  }
  return year + '-' + month + '-' + day;
}

export function getCompanyWebsite(website) {
  if (!website.startsWith('http://') && !website.startsWith('https://'))
    return 'http://' + website;
  return website;
}
