"use strict";

/**
 * Processes raw input data to compute a specific maximum value.
 * This function implements a sliding window algorithm to determine the highest sum
 * based on a dynamically derived window size and a sequence of numerical data points.
 *
 * @param {string[]} rawData - An array of strings, where each string represents a line from the input source.
 */
function processInput(rawData) {
  // The first line of input contains parameters. We split it by space
  // and extract the second element, which defines the window size.
  let parameters = rawData[0].split(" ");
  let windowSize = parseInt(parameters[1], 10); // Convert the string representation to an integer.

  // The second line of input contains the data points. We split it by space
  // and convert each resulting string segment into a number.
  let dataPoints = rawData[1].split(" ").map(Number);

  // Initialize a variable to keep track of the largest sum encountered across all windows.
  let overallMaximum = 0;

  // The outer loop iterates through the `dataPoints` array, defining the end
  // of each sliding window. The loop starts at `windowSize - 1` to ensure
  // that the very first window has the correct number of elements.
  for (let outerIndex = windowSize - 1; outerIndex < dataPoints.length; outerIndex++) {
    // Initialize the sum for the current window being evaluated.
    let currentWindowSum = 0;

    // The first inner loop iterates backward from the `outerIndex` to cover
    // all elements within the current `windowSize`.
    for (let innerIndex = 0; innerIndex < windowSize; innerIndex++) {
      // Retrieve the specific data point for the current position within the window.
      // `outerIndex - innerIndex` effectively moves from the end of the window towards its beginning.
      let currentDataPoint = dataPoints[outerIndex - innerIndex];

      // The second inner loop performs a specific calculation for the `currentDataPoint`.
      // It sums `counter / currentDataPoint` for `counter` values from 1 up to `currentDataPoint`.
      for (let counter = 1; counter <= currentDataPoint; counter++) {
        currentWindowSum += counter / currentDataPoint;
      }
    }

    // After calculating the sum for the current window, compare it with the
    // `overallMaximum` found so far. If the current window's sum is greater,
    // update `overallMaximum`.
    if (currentWindowSum > overallMaximum) {
      overallMaximum = currentWindowSum;
    }
  }

  // Output the final calculated overall maximum value to the console.
  console.log(overallMaximum);
}

// This block handles reading input from standard input, processing it,
// and then invoking the main processing function.
// The input is read as a UTF-8 string, leading/trailing whitespace is removed,
// and then it's split into an array of strings based on newline characters.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
