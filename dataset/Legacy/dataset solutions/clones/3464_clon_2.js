var parseInteger = (inputString) => parseInt(inputString, 10);

var parseIntegerArray = (inputArray) => inputArray.map((element) => parseInteger(element));

var absoluteValue = (numberValue) => (numberValue > 0 ? numberValue : -numberValue);

function findMinimum() {
  var argumentList = arguments;
  var currentValue = argumentList[0];
  for (var idx = 1; idx < argumentList.length; idx++) {
    if (argumentList[idx] < currentValue) {
      currentValue = argumentList[idx];
    }
  }
  return currentValue;
}

function findMaximum() {
  var argumentList = arguments;
  var currentValue = argumentList[0];
  for (var idx = 1; idx < argumentList.length; idx++) {
    if (argumentList[idx] > currentValue) {
      currentValue = argumentList[idx];
    }
  }
  return currentValue;
}

function greatestCommonDivisor() {
  var argumentList = arguments;
  var currentValue = argumentList[0];
  // Helper function for GCD of two numbers
  var gcdRecursiveHelper = (numA, numB) => (numB ? gcdRecursiveHelper(numB, numA % numB) : numA);
  for (var idx = 1; idx < argumentList.length; idx++) {
    currentValue = gcdRecursiveHelper(currentValue, argumentList[idx]);
  }
  return currentValue;
}

// Entry point for processing standard input
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

function ProcessInput(rawData) {
  // Split the raw input string into an array of lines
  var lineData = rawData.split('\n');

  // Parse the first line as the count of items
  var itemCount = parseInteger(lineData[0]);

  // Initialize an array to store numeric values
  var numericValues = [];

  // Populate the numericValues array from subsequent input lines
  for (var idx = 0; idx < itemCount; idx++) {
    numericValues[idx] = parseInteger(lineData[idx + 1]);
  }

  // Sort the array of numeric values in ascending order
  numericValues.sort((valA, valB) => valA - valB);

  var firstSum = 0;
  var secondSum = 0;

  // Conditional logic based on whether itemCount is even or odd
  if (itemCount % 2 === 0) {
    // Case for an even number of items
    for (var idx = 0; idx < itemCount; idx++) {
      firstSum += idx >= itemCount / 2 ? 2 * numericValues[idx] : -2 * numericValues[idx];
    }
    firstSum += numericValues[itemCount / 2 - 1] - numericValues[itemCount / 2];
  } else {
    // Case for an odd number of items
    for (var idx = 0; idx < itemCount; idx++) {
      firstSum += idx >= (itemCount - 1) / 2 ? 2 * numericValues[idx] : -2 * numericValues[idx];
      secondSum += idx > (itemCount - 1) / 2 ? 2 * numericValues[idx] : -2 * numericValues[idx];
    }
    firstSum -= numericValues[(itemCount - 1) / 2] + numericValues[(itemCount + 1) / 2];
    secondSum += numericValues[(itemCount - 1) / 2] + numericValues[(itemCount - 3) / 2];
  }

  // Determine the maximum of the two calculated sums
  var finalResult = findMaximum(firstSum, secondSum);

  // Output the final result to the console
  console.log(finalResult);

  // Return a success code
  return 0;
}
