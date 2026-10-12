// This script processes input data to calculate a specific metric.
function ProcessInput(sourceData) {
  // Helper function to parse a line into an array of strings.
  const extractWords = function(textRow) {
    // Remove leading/trailing whitespace and split by space.
    let tokenList = textRow.trim().split(" ");
    // Iterate through elements (no-op, self-assignment).
    for (let idx = 0; idx < tokenList.length; ++idx) {
      tokenList[idx] = tokenList[idx];
    }
    return tokenList;
  };

  // Helper function to parse a line into an array of numbers.
  const extractNumbers = function(textRow) {
    // Remove leading/trailing whitespace and split by space.
    let numericList = textRow.trim().split(" ");
    // Convert each string token to a number.
    for (let idx = 0; idx < numericList.length; ++idx) {
      numericList[idx] = +numericList[idx];
    }
    return numericList;
  };

  // Helper function to determine the smaller of two numbers.
  const determineSmaller = function(firstNum, secondNum) {
    return firstNum > secondNum ? secondNum : firstNum;
  };

  // Split the entire input string into individual lines.
  let dataLines = sourceData.split("\n");

  // Parse the first line for initial parameters.
  let initialParams = extractNumbers(dataLines[0]);
  let totalElements = initialParams[0]; // Represents 'n' from original.
  let thresholdValue = initialParams[1]; // Represents 't' from original.

  // Parse the second line for the sequence of values.
  let dataPoints = extractNumbers(dataLines[1]);

  let maxProfit = 0; // Stores the maximum profit found.
  let profitOccurrences = 0; // Counts how many times the max profit occurs.
  let lowestValue = dataPoints[0]; // Tracks the minimum value encountered so far.
  let highestValue = dataPoints[0]; // Tracks the maximum value encountered so far (declared but not used in logic).

  // Iterate through the data points to find the maximum profit and its frequency.
  for (let iterator = 0; iterator < totalElements; ++iterator) {
    let elementValue = dataPoints[iterator];

    // Check if current profit (elementValue - lowestValue) is greater than maxProfit.
    if (elementValue - lowestValue > maxProfit) {
      maxProfit = elementValue - lowestValue; // Update maxProfit.
      profitOccurrences = 1; // Reset count as a new max profit is found.
    }
    // Check if current profit is equal to the current maxProfit.
    else if (elementValue - lowestValue === maxProfit) {
      profitOccurrences++; // Increment count if profit matches maxProfit.
    }

    // Update the lowest value encountered so far.
    lowestValue = elementValue < lowestValue ? elementValue : lowestValue;
  }

  // Output the minimum of profitOccurrences and floor(thresholdValue / 2).
  console.log(determineSmaller(profitOccurrences, Math.floor(thresholdValue / 2)));
}

// Do not modify the following line (reads input from stdin and calls the main processing function).
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
