// This script processes raw input data.
const ProcessData = function (rawData) {
  // Helper function to split a line into an array of strings.
  const parseStringArray = function (textLine) {
    let tokenList = textLine.replace(/(^\s+)|(\s+$)/g, "").split(" ");
    for (let idx = 0; idx < tokenList.length; ++idx) {
      tokenList[idx] = tokenList[idx]; // Retain as string, no conversion needed here.
    }
    return tokenList;
  };

  // Another utility function: splits a line into an array of numbers.
  const parseNumericArray = function (textLine) {
    let tokenList = textLine.replace(/(^\s+)|(\s+$)/g, "").split(" ");
    for (let idx = 0; idx < tokenList.length; ++idx) {
      tokenList[idx] = +tokenList[idx]; // Convert each part to a numeric type.
    }
    return tokenList;
  };

  // Function to determine the smaller of two numeric values.
  const findLesser = (firstVal, secondVal) => {
    return firstVal > secondVal ? secondVal : firstVal;
  };

  // Split the entire input string into individual lines based on newline characters.
  let inputLines = rawData.split("\n");

  // Process the first line to get configuration parameters.
  let firstParsedLine = parseNumericArray(inputLines[0]);
  let totalElements = firstParsedLine[0]; // The count of data points.
  let thresholdValue = firstParsedLine[1]; // A specific limit or divisor.

  // Parse the second line which contains the main sequence of numbers.
  let dataPoints = parseNumericArray(inputLines[1]);

  let peakDifference = 0; // Stores the largest difference found so far.
  let diffOccurrences = 0; // Counts how many times the peak difference has appeared.
  let currentMinimum = dataPoints[0]; // Tracks the lowest value encountered up to the current point.
  let currentMaximum = dataPoints[0]; // This variable is declared but not actively used in the core logic.

  // Handle the special case where there's only one element.
  if (totalElements === 1) {
    console.log("0");
  }
  // Iterate through each data point to find the maximum difference.
  for (let idx = 0; idx < totalElements; ++idx) {
    const currentPoint = dataPoints[idx]; // The value of the current data point.

    // Check if the current difference (currentPoint - currentMinimum) is greater than the recorded peak difference.
    if (currentPoint - currentMinimum > peakDifference) {
      peakDifference = currentPoint - currentMinimum; // Update the peak difference.
      diffOccurrences = 1; // Reset the count as a new maximum difference is found.
    }
    // If the current difference is equal to the peak difference, increment the count.
    else if (currentPoint - currentMinimum === peakDifference) {
      diffOccurrences++;
    }

    // Update the current minimum value if the current data point is smaller.
    currentMinimum = currentPoint < currentMinimum ? currentPoint : currentMinimum;
  }

  // Output the minimum of the count of peak differences and half of the threshold value (floored).
  console.log(findLesser(diffOccurrences, Math.floor(thresholdValue / 2)));
};

// Execute the main processing function by reading input from standard input.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));