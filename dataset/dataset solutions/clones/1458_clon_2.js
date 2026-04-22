// This module handles processing of numerical input data from standard input.
function processInputData(inputRows) {
  // Loop indefinitely until a termination condition is met.
  for (let rowCounter = 0;;) {
    // Parse the number of elements for the current data set.
    // The 'rowCounter' is incremented after accessing 'inputRows'.
    const numberOfElements = Number.parseInt(inputRows[rowCounter++], 10);

    // If the number of elements is zero, it signals the end of input.
    if (numberOfElements === 0) {
      break; // Exit the processing loop.
    }

    // Process the line containing numerical values.
    // Split by whitespace and convert each part to a floating-point number.
    const numericalValues = inputRows[rowCounter++].split(/\s+/).map(Number.parseFloat);

    // Calculate the arithmetic mean of the numerical values.
    // The 'reduce' method sums all values, then divides by the total count.
    const meanValue = numericalValues.reduce((total, val) => total + val, 0) / numericalValues.length;

    // Determine the variance of the data set.
    // This measures how far a set of numbers is spread out from their average value.
    const dispersion = numericalValues.reduce((totalSum, currentValue) => {
      // For each value, calculate the squared difference from the mean.
      return totalSum + Math.pow(currentValue - meanValue, 2);
    }, 0) / numericalValues.length;

    // Compute the standard deviation, which is the square root of the variance.
    // It provides a measure of the amount of variation or dispersion of a set of values.
    const stdDev = Math.sqrt(dispersion);

    // Output the calculated standard deviation, formatted to six decimal places.
    console.log(stdDev.toFixed(6));
  }
}

// Array to store incoming data chunks from standard input.
const dataSegments = [];

// Event listener for incoming data.
// Each received chunk is pushed into the 'dataSegments' array.
process.stdin.on('data', (segment) => {
  dataSegments.push(segment);
});

// Event listener for the end of standard input.
// Once all data is received, it's joined, split into lines, and processed.
process.stdin.on('end', () => {
  // Join all data segments and split them into an array of lines.
  const processedRows = dataSegments.join('').split('\n');
  // Call the main processing function with the prepared data.
  processInputData(processedRows);
});