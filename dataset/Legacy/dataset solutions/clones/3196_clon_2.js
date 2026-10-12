var parseInteger = (inputString) => parseInt(inputString, 10);

var parseIntegerArray = (inputArray) => inputArray.map((item) => parseInteger(item));

var absoluteValue = (numericValue) => (numericValue > 0 ? numericValue : -numericValue);

function findMinimum() {
  var argumentList = arguments;
  var currentValue = argumentList[0];
  for (var loopIndex = 1; loopIndex < argumentList.length; loopIndex++) {
    if (argumentList[loopIndex] < currentValue) {
      currentValue = argumentList[loopIndex];
    }
  }
  return currentValue;
}

function findMaximum() {
  var argumentList = arguments;
  var currentValue = argumentList[0];
  for (var loopIndex = 1; loopIndex < argumentList.length; loopIndex++) {
    if (argumentList[loopIndex] > currentValue) {
      currentValue = argumentList[loopIndex];
    }
  }
  return currentValue;
}

function greatestCommonDivisor() {
  var argumentList = arguments;
  var currentValue = argumentList[0];
  // Helper function for GCD calculation
  var recursiveGcd = (valA, valB) => (valB ? recursiveGcd(valB, valA % valB) : valA);
  for (var loopIndex = 1; loopIndex < argumentList.length; loopIndex++) {
    currentValue = recursiveGcd(currentValue, argumentList[loopIndex]);
  }
  return currentValue;
}

// Entry point for processing input
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

function ProcessInput(rawData) {
  // Parse the raw input into a 2D array of integers
  var parsedData = rawData
    .split("\n")
    .map((lineContent) => parseIntegerArray(lineContent.split(" ")));

  // Extract N and M from the first line
  var targetSum = parsedData[0][0];
  var numElements = parsedData[0][1];

  // Get the available digits and sort them in descending order
  var sortedDigits = parsedData[1].sort((valA, valB) => valB - valA);

  // Define the cost (number of segments) for each digit (0-9)
  var digitCosts = [0, 2, 5, 5, 4, 5, 6, 3, 7, 6];

  // Initialize an array to store unique available digits and their costs
  var availableDigits = [];

  var currentDigit, remainderValue, unusedVar; // Declare temporary variables

  // Populate availableDigits with unique digits and their costs
  for (var idx = 0; idx < numElements; idx++) {
    currentDigit = sortedDigits[idx];
    // Check if a digit with the same cost is already added to avoid duplicates based on cost
    if (availableDigits.find((elementItem) => elementItem[1] === digitCosts[currentDigit]) === undefined) {
      availableDigits.push([currentDigit, digitCosts[currentDigit]]);
    }
  }

  // Sort availableDigits by cost in ascending order
  availableDigits.sort((valA, valB) => valA[1] - valB[1]);

  // Initialize an array to store the intermediate result (digit, count)
  var intermediateResult = [];

  // Start with the cheapest digit
  intermediateResult[0] = [availableDigits[0][0], Math.floor(targetSum / availableDigits[0][1])];
  targetSum %= availableDigits[0][1]; // Update remaining target sum

  var listLength = availableDigits.length;

  // Greedily try to replace digits with more expensive ones to maximize the number

  while (targetSum !== 0) {
    targetSum += availableDigits[0][1]; // Add back the cost of one cheapest digit
    intermediateResult[0][1]--; // Decrease count of the cheapest digit

    currentDigit = 10; // Placeholder for best replacement digit index
    remainderValue = 10; // Placeholder for best remainder

    // Find the best digit to replace with
    for (var idx = 1; idx < listLength; idx++) {
      if (targetSum % availableDigits[idx][1] < remainderValue) {
        currentDigit = idx;
        remainderValue = targetSum % availableDigits[idx][1];
      }
    }

    // If a better replacement is found (remainderValue < 10 means a valid replacement)
    if (remainderValue < 10) {
      intermediateResult.push([availableDigits[currentDigit][0], Math.floor(targetSum / availableDigits[currentDigit][1])]);
      targetSum = remainderValue; // Update remaining target sum
    }
  }

  // Sort the intermediate result by digit value in descending order
  intermediateResult.sort((valA, valB) => valB[0] - valA[0]);

  var finalOutputString = "";

  listLength = intermediateResult.length;
  // Construct the final output string
  for (var idx = 0; idx < listLength; idx++) {
    finalOutputString += String(intermediateResult[idx][0]).repeat(intermediateResult[idx][1]);
  }

  // Print the result to console
  console.log(finalOutputString);

  return 0; // Indicate successful execution
}
