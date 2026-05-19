'use strict';

/**
 * Processes the raw input string to determine a specific condition.
 * @param {string} rawData - The complete input string, potentially multi-line.
 */
function ProcessInput(rawData) {
  // The first line of input is in lines[0], second in lines[1], etc.
  const lines = rawData.split("\n");

  // Parse numerical values from the first line
  const firstLineParts = lines[0].split(' ');
  const valX = Number(firstLineParts[0]);
  const valY = Number(firstLineParts[1]);
  const valZ = Number(firstLineParts[2]);

  // Evaluate the conditions based on the parsed values
  if (valZ - valX - valY <= 0) {
    console.log('No'); // Output 'No' if the first condition is met
  } else if (4 * valX * valY < (valZ - valX - valY) * (valZ - valX - valY)) {
    console.log('Yes'); // Output 'Yes' if the second condition is met
  } else {
    console.log('No'); // Otherwise, output 'No'
  }
}

// Do not modify the following section (handles standard input/output and calls the main processing function)
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
