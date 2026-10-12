// This function processes raw string data to determine a specific condition.
// It expects a multi-line string where the first line is a number (N)
// and the second line is a space-separated list of N numbers.
function processInput(rawData) {
  // Split the entire input string into an array of lines.
  let lineSegments = rawData.split("\n");

  // Parse the first line to get the count of elements.
  let countElements = Number(lineSegments[0]);

  // Split the second line by spaces to get an array of numeric strings.
  let numericStrings = lineSegments[1].split(" ");

  // Initialize variables to track the maximum value and the total sum.
  let greatestValue = 0;
  let totalSum = 0;

  // Iterate through the array of numeric strings using a loop counter.
  for (let idx = 0; idx < countElements; idx++) {
    // Check if the current element, converted to a number, is greater than the current maximum.
    if (greatestValue < Number(numericStrings[idx])) {
      // If it is, update the maximum value.
      greatestValue = Number(numericStrings[idx]);
    }
    // Add the current element, converted to a number, to the running total sum.
    totalSum += Number(numericStrings[idx]);
  }

  // After iterating through all elements, evaluate the condition.
  // The condition checks if the greatest value is less than the sum of all other values.
  // The sum of all other values is calculated as (totalSum - greatestValue).
  if (greatestValue < (totalSum - greatestValue)) {
    console.log("Yes"); // If the condition holds true, print "Yes".
  } else {
    console.log("No"); // Otherwise, print "No".
  }
}

// The program starts by reading the entire content of standard input.
// It uses Node.js's 'fs' module to synchronously read the file '/dev/stdin'
// and decodes it as a 'utf8' string. This string is then passed to the
// 'processInput' function for further processing.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
