let rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input data from standard input
let lineBuffer = rawData.trim().split("\n"); // Split the raw input into an array of lines, removing leading/trailing whitespace

while (true) { // Begin an infinite loop to process multiple datasets
  let count = lineBuffer.shift() - 0; // Extract the first line, convert to a number, representing the count of elements
  // The '- 0' ensures explicit numeric conversion, even if 'Number()' is also an option.

  if (count === 0) { // Check if the count is zero, which signals the end of input
    break; // Exit the loop if the count is zero
  }

  // Extract the next line, split by space, and convert each part to a number
  let dataPoints = (lineBuffer.shift()).split(" ").map(Number);

  // Calculate the sum of all data points using the reduce method
  let totalSum = dataPoints.reduce(function(accumulator, currentNum) {
    return accumulator + currentNum;
  });

  let meanValue = totalSum / count; // Compute the arithmetic mean (average) of the data points

  let sumOfSquaredDiffs = 0; // Initialize a variable to accumulate the sum of squared differences

  // Iterate over each data point to calculate the sum of squared differences from the mean
  dataPoints.forEach(function(currentVal) {
    sumOfSquaredDiffs += Math.pow(currentVal - meanValue, 2); // Add the square of the difference to the accumulator
  });

  // Calculate the standard deviation: square root of (sum of squared differences / count)
  let stdDev = Math.sqrt(sumOfSquaredDiffs / count);

  // Output the calculated standard deviation, formatted to 8 decimal places
  console.log(stdDev.toFixed(8));
}
