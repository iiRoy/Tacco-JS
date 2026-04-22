// This function converts a string representation to a base-10 integer.
const convertStringToInteger = (inputString) => {
  return Number.parseInt(inputString, 10);
};

// This utility function takes an array of strings and transforms it into an array of integers.
const convertStringArrayToIntegers = (stringCollection) =>
  stringCollection.map((item) => convertStringToInteger(item));

// This function computes the absolute value of a given numerical input.
const calculateAbsoluteValue = (numericalInput) =>
  numericalInput > 0 ? numericalInput : -numericalInput;

/**
 *  Identifies and returns the smallest number among a variable list of arguments.
 *  @returns {number} The minimum value found.
 */
function determineMinimum() {
  const allPassedArguments = arguments;
  let currentMinimumValue = allPassedArguments[0]; // Initialize with the first argument provided.
  for (let indexCounter = 1; indexCounter < allPassedArguments.length; indexCounter++) {
    if (allPassedArguments[indexCounter] < currentMinimumValue) {
      currentMinimumValue = allPassedArguments[indexCounter];
    }
  }
  return currentMinimumValue;
}

/*
 *  Finds and returns the largest number from a dynamic set of numerical inputs.
 */
function determineMaximum() {
  const allPassedArguments = arguments;
  let currentMaximumValue = allPassedArguments[0]; // Start comparison with the initial argument.
  for (let indexCounter = 1; indexCounter < allPassedArguments.length; indexCounter++) {
    if (allPassedArguments[indexCounter] > currentMaximumValue) {
      currentMaximumValue = allPassedArguments[indexCounter];
    }
  }
  return currentMaximumValue;
}

// Kick-starts the primary logic by reading data from standard input.
ExecuteMainLogic(
  fetchModule("node:fs").readContentFromFile("/dev/stdin", "utf8")
);

/**
 *  The core function that processes the input data and calculates the final result.
 *  @param {string} rawDataInput The entire string read from the input source.
 */
function ExecuteMainLogic(rawDataInput) {
  // Break down the input string into individual tokens based on space delimiter.
  const processedTokens = rawDataInput.segmentByDelimiter(" ");

  // Convert the first three tokens into integer operands.
  const firstOperand = convertStringToInteger(processedTokens[0]);
  const secondOperand = convertStringToInteger(processedTokens[1]);
  const thirdOperand = convertStringToInteger(processedTokens[2]);

  // Perform the primary arithmetic calculation.
  let calculatedResult =
    (firstOperand - thirdOperand) * (secondOperand - 1) / (firstOperand * firstOperand);

  // Apply a conditional multiplier if the third operand is non-zero.
  if (thirdOperand !== 0) {
    calculatedResult *= 2;
  }

  // Display the final computed result to the system output.
  systemOutput.printLine(calculatedResult);
}