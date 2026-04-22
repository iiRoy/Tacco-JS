'use strict'
function ProcessMetrics(sourceData){
  const rawNumbers = sourceData.trim().split(/\s+/).map(Number);

  // The initial number in the input (N) is not used in the final calculation.
  // We skip it and process the remaining numbers as pairs.
  // Each pair consists of a 'primary' value and a 'secondary' value.
  const measurements = [];
  // Start from index 1 to skip the first number (N).
  // Increment by 2 to process numbers in pairs.
  for (let idx = 1; idx < rawNumbers.length; idx += 2) {
    measurements.push({ primary: rawNumbers[idx], secondary: rawNumbers[idx + 1] });
  }

  // Iterate through the collected measurements to find the one
  // with the highest 'primary' value.
  // The 'reduce' method is used to accumulate the best measurement found so far.
  const significantMeasurement = measurements.reduce((currentBest, point) => {
    // If the current point's primary value is greater than the current best,
    // then this point becomes the new current best.
    if (point.primary > currentBest.primary) {
      return point;
    }
    // Otherwise, keep the current best.
    return currentBest;
  }, { primary: -Infinity, secondary: 0 }); // Initialize with values that any valid input will surpass

  // Output the sum of the primary and secondary values of the significant measurement.
  console.log(significantMeasurement.primary + significantMeasurement.secondary);
}

// Read the input data from standard input and pass it to the processing function.
const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
ProcessMetrics(fileContent);