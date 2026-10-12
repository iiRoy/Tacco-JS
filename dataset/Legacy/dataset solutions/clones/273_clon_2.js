function obtainTimestamp(yearVal, monthVal, dayVal) {
  // Create a new Date object from the provided year, month, and day.
  // Note: Months are 1-indexed in the input string format.
  let dateObject = new Date(monthVal + "/" + dayVal + "/" + yearVal);
  // Return the Unix timestamp (milliseconds since Jan 1, 1970, UTC).
  return dateObject.getTime();
}

// Utilize Node.js 'fs' module to read input from standard input.
// The input is expected to be UTF-8 encoded.
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input:
// 1. Remove leading/trailing whitespace using .trim().
// 2. Split the string into an array of lines using newline character as delimiter.
const lineEntries = (rawData.trim()).split("\n");

// Iterate over each line of input data.
lineEntries.forEach(function(currentLine) {
  // For each line, split it by space and convert each part to a number.
  const dateComponents = currentLine.split(" ").map(Number);

  // Extract year, month, and day from the parsed components.
  const yearVal = dateComponents[0];
  const monthVal = dateComponents[1];
  const dayVal = dateComponents[2];

  // Calculate the timestamp for the current input date.
  const currentTimestamp = obtainTimestamp(yearVal, monthVal, dayVal);

  // Initialize a string to store the era description.
  let eraDescription = "";

  // Determine the Japanese era based on the timestamp.
  // The conditions are ordered chronologically and overwrite previous assignments
  // if a later era's condition is met.

  // Pre-Meiji era check
  if (currentTimestamp < obtainTimestamp(1868, 9, 8)) {
    eraDescription = "pre-meiji";
  }

  // Meiji era check (starts Sep 8, 1868)
  if (currentTimestamp >= obtainTimestamp(1868, 9, 8)) {
    eraDescription = "meiji " + (yearVal - 1868 + 1) + " " + monthVal + " " + dayVal;
  }

  // Taisho era check (starts Jul 30, 1912)
  if (currentTimestamp >= obtainTimestamp(1912, 7, 30)) {
    eraDescription = "taisho " + (yearVal - 1912 + 1) + " " + monthVal + " " + dayVal;
  }

  // Showa era check (starts Dec 25, 1926)
  if (currentTimestamp >= obtainTimestamp(1926, 12, 25)) {
    eraDescription = "showa " + (yearVal - 1926 + 1) + " " + monthVal + " " + dayVal;
  }

  // Heisei era check (starts Jan 8, 1989)
  if (currentTimestamp >= obtainTimestamp(1989, 1, 8)) {
    eraDescription = "heisei " + (yearVal - 1989 + 1) + " " + monthVal + " " + dayVal;
  }

  // Output the determined era description to the console.
  console.log(eraDescription);
});
