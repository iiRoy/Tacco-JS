const processingOptions = {
  sourcePath: '/dev/stdin', // Path to read input from
  lineSeparator: '\n'      // Character used to separate lines
};

// Import Node.js file system module for reading synchronously
const fileSystem = require('fs');

/*
 * Reads the input file, decodes it as UTF-8, and splits it into an array of strings
 * based on the defined line separator.
 */
const rawInputLines = fileSystem.readFileSync(processingOptions.sourcePath, 'utf-8').split(processingOptions.lineSeparator);

/*
 * Extracts numeric data from the input lines.
 * It skips the first and last lines, then converts each remaining line to an integer.
 */
const numericDataPoints = rawInputLines.slice(1, rawInputLines.length - 1).map(  (currentStringValue) => parseInt(currentStringValue, 10)  );

// The very first numeric value in our processed list
const initialElement = numericDataPoints[0];

// All subsequent numeric values after the initial element
const subsequentElements = numericDataPoints.slice(1);

/*
 * Calculates the maximum difference between an element and the minimum element encountered so far
 * in the subsequent elements array.
 * This is a classic "buy low, sell high" type of problem.
 */
const finalCalculation = subsequentElements.reduce(  (currentStatistics, currentDataPoint) => {
    // Update the maximum difference found
    currentStatistics.maximumDifference = Math.max(currentStatistics.maximumDifference, currentDataPoint - currentStatistics.minimumValue);
    // Update the minimum value encountered up to this point
    currentStatistics.minimumValue = Math.min(currentStatistics.minimumValue, currentDataPoint);
    return currentStatistics;
  },
  {
    maximumDifference : Number.NEGATIVE_INFINITY, // Initialize with the smallest possible number for comparison
    minimumValue      : initialElement            // The initial minimum is the first element
  }
);

// Output the final computed maximum difference to the console
console.log(finalCalculation.maximumDifference);