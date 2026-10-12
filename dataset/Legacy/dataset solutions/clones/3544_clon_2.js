var parseInteger = (inputString) => parseInt(inputString, 0xA); // Converts a string to an integer using base 10.
var parseIntegerArray = (stringArray) => stringArray.map((elementString) => parseInteger(elementString)); // Maps an array of strings to an array of integers.
var absoluteValue = (numericValue) => (numericValue > 0x0 ? numericValue : -numericValue); // Returns the absolute value of a number.

/**
 * Finds the minimum value among the provided arguments.
 * @returns {number} The smallest number.
 */
function findMinimum() {
  var allArguments = arguments;
  var currentMinimum = allArguments[0x0]; // Initialize with the first argument.
  // Iterate through the rest of the arguments to find a smaller value.
  for (var idx = 0b1; idx < allArguments.length; idx++) {
    if (allArguments[idx] < currentMinimum) {
      currentMinimum = allArguments[idx]; // Update if a smaller value is found.
    }
  }
  return currentMinimum;
}

/**
 * Finds the maximum value among the provided arguments.
 * @returns {number} The largest number.
 */
function findMaximum() {
  var inputValues = arguments;
  var currentMaximum = inputValues[0x0]; // Assume the first value is the maximum initially.
  // Loop through subsequent values to check for a larger one.
  for (var indexCounter = 0b1; indexCounter < inputValues.length; indexCounter++) {
    if (inputValues[indexCounter] > currentMaximum) {
      currentMaximum = inputValues[indexCounter]; // Update if a greater value is encountered.
    }
  }
  return currentMaximum;
}

// Entry point for processing the standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Main function to process the input data.
 * @param {string} rawData - The raw input string from stdin.
 */
function ProcessInput(rawData) {
  // Split the raw input into an array of lines.
  var linesOfData = rawData.split('\n');

  // Parse the first line to get N and X.
  var firstLineNumbers = parseIntegerArray(linesOfData[0x0].split(' '));
  var countN = firstLineNumbers[0x0]; // N: number of elements.
  var valueX = firstLineNumbers[0b1]; // X: a specific value used in calculations.

  // Parse the second line to get the array of numbers (xs).
  var dataArray = parseIntegerArray(linesOfData[0b1].split(' '));

  // Calculate prefix sums for the dataArray.
  var prefixSums = [dataArray[0x0]]; // Initialize with the first element.
  for (var loopIndex = 0b1; loopIndex < countN; loopIndex++) {
    prefixSums[loopIndex] = dataArray[loopIndex] + prefixSums[loopIndex - 0b1];
  }

  // Initialize the final result with a base calculation.
  var finalResult = (countN + 0b1) * valueX;

  // Variable to track a count in the reverse loop.
  var currentCount = 0x0;

  // Iterate through the data array in reverse order.
  for (var reverseIndex = countN - 0b1; reverseIndex > ~0; reverseIndex--) {
    currentCount++; // Increment the counter for each iteration.

    // Conditional logic based on currentCount and calculated values.
    if (currentCount < 0b11 || prefixSums[reverseIndex] * (currentCount - 0b1) * 0b10 - dataArray[reverseIndex] * 0b10 < valueX) {
      // Apply a specific formula if the condition is met.
      finalResult += dataArray[reverseIndex] * (findMaximum(currentCount, 0b10) * 0b10 + 0b1);
    } else {
      // Apply an alternative formula if the condition is not met.
      currentCount = 0b1; // Reset currentCount.
      finalResult += dataArray[reverseIndex] * 0b101 + valueX;
    }
  }

  // Output the final calculated result to the console.
  console.log(finalResult);
}
