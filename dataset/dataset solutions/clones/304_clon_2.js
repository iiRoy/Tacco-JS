function isLeapYear(yearVal) {
  // A year is a leap year if it is divisible by 4,
  // unless it is divisible by 100 but not by 400.
  if (yearVal % 4 !== 0) {
    return false; // Not divisible by 4, so not a leap year.
  }
  if (yearVal % 400 === 0) {
    return true; // Divisible by 400, so it is a leap year.
  }
  if (yearVal % 100 === 0) {
    return false; // Divisible by 100 but not by 400, so not a leap year.
  }
  return true; // Divisible by 4 but not by 100, so it is a leap year.
}

const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const lineData = rawData.trim().split('\n');

// Iterate through each line of input data.
for (let idx = 0; idx < lineData.length; idx++) {
  // If the current line is "0 0", it signifies the end of input.
  if (lineData[idx] === '0 0') {
    break;
  }

  // Print an empty line as a separator between outputs for different test cases,
  // but not before the very first output.
  if (idx !== 0) {
    console.log('');
  }

  // Split the current line to get the start and end years.
  const yearRangeParts = lineData[idx].split(' ');
  const startYear = Number(yearRangeParts[0]); // Convert the first part to a number.
  const endYear = Number(yearRangeParts[1]);   // Convert the second part to a number.

  const leapYearsFound = []; // Array to store all leap years found within the current range.

  // Loop through each year from the start year to the end year (inclusive).
  for (let currentYear = startYear; currentYear <= endYear; currentYear++) {
    // Check if the current year is a leap year using our helper function.
    if (isLeapYear(currentYear)) {
      leapYearsFound.push(currentYear); // Add it to our list if it is.
    }
  }

  // If no leap years were found in the given range, print "NA".
  if (leapYearsFound.length === 0) {
    console.log('NA');
  } else {
    // Otherwise, print each found leap year on a new line.
    leapYearsFound.forEach(function(singleYear) {
      console.log(singleYear);
    });
  }
}
