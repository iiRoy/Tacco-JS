/*
 * This module processes input data to calculate the minimum sum of squared differences.
 * It reads a series of numbers and finds an integer 'k' (between 1 and 100)
 * that minimizes the sum of (each_number - k)^2.
 */
function ProcessData(rawData)
{
  "use strict"; // Enforce strict parsing and error handling for cleaner code.

  // Split the entire input string into an array of individual lines.
  const linesArray = rawData.split("\n");

  // The first line (after shifting) is usually a count, but it's unused in this logic.
  const totalElements = parseInt(linesArray.shift(), 10); // Base 10 for parseInt is good practice.

  // The second line contains space-separated numbers, convert them to integers.
  const dataPoints = linesArray.shift().split(" ").map(strNum => parseInt(strNum, 10));
  
  // Initialize the variable to store the lowest sum of squared errors found so far.
  // Start with a very large number so any calculated sum will be smaller.
  let leastSquaredError = Infinity;

  // Iterate through possible target values from 1 to 100 (inclusive).
  for (let currentValue = 1; currentValue <= 100; currentValue++)
  {
    // For each data point, calculate the squared difference from the current target value.
    // Then, sum all these squared differences to get the total error for 'currentValue'.
    const currentErrorSum = dataPoints.map(pointVal => (pointVal - currentValue) * (pointVal - currentValue)).reduce((accumulator, currentSummand) => accumulator + currentSummand, 0);

    // Update the minimum error if the current sum is smaller.
    leastSquaredError = Math.min(leastSquaredError, currentErrorSum);
  }

  // Output the final calculated minimum sum of squared errors to the console.
  console.log(leastSquaredError);
}

// Do not modify the following section. It handles standard input/output.
// This part reads the entire standard input as a UTF-8 string and passes it to the main processing function.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));