// This script processes numerical data from standard input to calculate standard deviation.

(function(rawDataStream) { // Enclosing anonymous function for scope encapsulation.
  // Split the entire input stream into an array of individual lines for sequential processing.
  var lineSegments = rawDataStream.split('\n');

  // Begin an indefinite processing loop for multiple data sets.
  while (true) {
    // Extract the first line from the segment queue, treating it as the count of elements for the current data set.
    var itemCount = Number(lineSegments.shift());

    // If the element count is zero, it signifies the end of input; terminate execution.
    if (itemCount === 0) {
      return; // Exit the function, as no more data sets are available.
    }

    // Retrieve the next line, split it by spaces into string parts, and then convert each part into a number.
    // The 'itemCount' parameter for split is retained to match the original structure, though its effect
    // on the 'split' method's behavior with typical input might be negligible here.
    var numericValues = lineSegments.shift().split(' ', itemCount).map(Number);

    // Compute and display the standard deviation for the current set of numeric values.
    console.log(calcStdDev(numericValues));
  }

  // The Immediately Invoked Function Expression (IIFE) is executed with the content
  // read from standard input using Node.js's file system module.
})(require('fs').readFileSync('/dev/stdin', 'utf8'));


// --- Helper Functions for Statistical Calculations ---

/**
 * Computes the arithmetic mean (average) of a collection of numbers.
 * This function sums all elements and divides by the total count of elements.
 * @param {Array<number>} valueList - An array of numerical values for which to compute the mean.
 * @returns {number} The calculated mean value.
 */
function calculateAverage(valueList) {
    // Utilize the Array.prototype.reduce method to accumulate the sum of all elements,
    // then divide this total sum by the number of elements in the array.
    return valueList.reduce(function(accumulator, currentValue) {
        return accumulator + currentValue; // Summing up elements.
    }) / valueList.length; // Dividing by the count to get the average.
}

/**
 * Determines the variance of a set of numerical observations.
 * Variance measures how far a set of numbers is spread out from their average value.
 * It is the average of the squared differences from the mean.
 * @param {Array<number>} valueList - An array of numerical values for which to determine the variance.
 * @returns {number} The calculated variance value.
 */
function determineDispersion(valueList) {
    // First, compute the mean of the data set, as variance is calculated relative to the mean.
    var avgValue = calculateAverage(valueList);
    var dispersionSum = 0; // Initialize a variable to accumulate the sum of squared differences.

    // Iterate through each data point in the collection.
    valueList.forEach(function(elementItem) {
        // For each element, calculate its difference from the mean, square it,
        // and add it to the dispersionSum, scaled by the total number of elements.
        dispersionSum += Math.pow(elementItem - avgValue, 2) / valueList.length;
    });

    return dispersionSum; // Return the total computed variance.
}

/**
 * Calculates the standard deviation of a given array of numbers.
 * Standard deviation is the square root of the variance, providing a measure
 * of the typical distance between data points and the mean in the original units.
 * @param {Array<number>} valueList - An array of numerical values for which to calculate the standard deviation.
 * @returns {number} The calculated standard deviation value.
 */
function calcStdDev(valueList) {
    // Obtain the variance of the data set using the helper function,
    // and then compute its square root to get the standard deviation.
    return Math.sqrt(determineDispersion(valueList));
}