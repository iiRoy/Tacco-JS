// This module contains functions designed to process numerical input
// and compute an optimal operation count based on a specific set of rules.
// It is structured to handle parsing, validation, and various conditional calculations.

/**
 * Utility function to safely parse a string containing space-separated numbers
 * into an array of integers. It includes robust validation checks.
 *
 * @param {string} rawInputText - The original input string, e.g., "10 20 30".
 * @returns {number[]} An array populated with the parsed integer values.
 * @throws {Error} If the input is not a valid string, contains non-numeric segments,
 *                 or does not provide exactly three numbers.
 */
const parseInputNumbers = (rawInputText) => {
  // Input validation: Ensure the raw text is a non-empty string.
  if (typeof rawInputText !== 'string' || rawInputText.trim().length === 0) {
    throw new Error('Input data must be a non-empty string for parsing.');
  }

  // Split the string by one or more whitespace characters.
  const stringComponents = rawInputText.trim().split(/\s+/);

  // Attempt to convert each component to a number.
  const numericalComponents = stringComponents.map(component => {
    const parsedNumber = Number(component); // Using Number() is often preferred over parseInt for general conversion
    if (isNaN(parsedNumber)) {
      // Throw an error if any component cannot be converted to a number.
      throw new Error(`Invalid numeric component detected: "${component}".`);
    }
    return parsedNumber;
  });

  // Ensure exactly three numbers were provided as per problem requirements.
  const expectedNumberCount = 3;
  if (numericalComponents.length !== expectedNumberCount) {
    throw new Error(`Expected exactly ${expectedNumberCount} numbers, but found ${numericalComponents.length}.`);
  }

  return numericalComponents;
};

/**
 * Computes the specific cost (number of operations) required to equalize
 * a single value to a target, based on a particular rule set. This rule
 * applies when two values are already at the target magnitude.
 *
 * The rule is: if the difference is even, cost is diff/2.
 * If the difference is odd, cost is floor(diff/2) + 2.
 *
 * @param {number} magnitudeDifference - The positive difference between the target and the current value.
 * @returns {number} The calculated cost in operations.
 * @throws {Error} If the magnitudeDifference is negative.
 */
const calculateDisparityCost = (magnitudeDifference) => {
  // Pre-condition check for non-negative difference.
  if (magnitudeDifference < 0) {
    throw new Error("Magnitude difference for cost calculation must not be negative.");
  }

  const isDifferenceEven = (magnitudeDifference % 2 === 0);
  let baseOperationCost = Math.floor(magnitudeDifference / 2);
  let additionalOperationCost = isDifferenceEven ? 0 : 2; // Add 2 if difference is odd

  return baseOperationCost + additionalOperationCost;
};


/**
 * The primary function that analyzes three input numbers and determines
 * the minimum number of operations to make them all equal, following
 * a specific set of operational rules.
 *
 * @param {string} rawInputStringData - A string containing three space-separated integers.
 * @returns {number} The computed minimum operations, or -1 if input processing fails.
 */
function computeMinimumEqualizationSteps(rawInputStringData) {
  let numericalComponents;
  try {
    numericalComponents = parseInputNumbers(rawInputStringData);
  } catch (parsingError) {
    // Log the error and return a sentinel value to indicate failure.
    console.error(`Input data parsing failed: ${parsingError.message}`);
    return -1;
  }

  let [valueOne, valueTwo, valueThree] = numericalComponents;

  // Optional: Add a check to ensure all numbers are indeed integers if not guaranteed by context.
  // (Number() conversion handles floats, but problem context usually implies integers.)
  if (!Number.isInteger(valueOne) || !Number.isInteger(valueTwo) || !Number.isInteger(valueThree)) {
      console.warn("Non-integer values encountered. Calculations may yield unexpected results.");
      // Depending on strictness, one might throw an error or round values here.
  }

  // Scenario 1: All values are already identical.
  // Original code's `A === B === C` is a common JS mistake, evaluating `(A===B) === C`.
  // Corrected to explicit logical AND.
  if (valueOne === valueTwo && valueTwo === valueThree) {
    return 0; // No operations needed if all are equal.
  }

  // Identify the extreme values among the three.
  const currentValuesArray = [valueOne, valueTwo, valueThree];
  const maximumValue = Math.max(...currentValuesArray);
  const minimumValue = Math.min(...currentValuesArray);

  // Scenario 2: Two values are equal to the maximum value.
  // Corrected the `===` chaining for accurate boolean logic.
  const twoValuesAreMax = (valueOne === valueTwo && valueTwo === maximumValue) ||
                          (valueTwo === valueThree && valueThree === maximumValue) ||
                          (valueThree === valueOne && valueOne === maximumValue);

  if (twoValuesAreMax) {
    // In this case, the single minimum value needs to be brought up to the maximum.
    // The specific `calculateDisparityCost` function applies here.
    return calculateDisparityCost(maximumValue - minimumValue);
  }

  // Scenario 3: Two values are equal to the minimum value.
  // Corrected the `===` chaining for accurate boolean logic.
  const twoValuesAreMin = (valueOne === valueTwo && valueTwo === minimumValue) ||
                          (valueTwo === valueThree && valueThree === minimumValue) ||
                          (valueThree === valueOne && valueOne === minimumValue);

  if (twoValuesAreMin) {
    // Here, the two minimum values need to be brought up to the maximum.
    // Each increment operation costs 1.
    return maximumValue - minimumValue;
  }

  // Scenario 4: General case where values are distinct, or not covered by above.
  // This implies one min, one mid, and one max value.
  // A robust way to find the middle value is by sorting the array.
  const orderedValues = [...currentValuesArray].sort((a, b) => a - b); // Creates a sorted copy.
  const middleValue = orderedValues[1]; // The middle element after sorting.

  // Calculate the difference between the middle and maximum values.
  let deltaMiddleToMax = maximumValue - middleValue;
  // Calculate the difference between the minimum and middle values.
  let deltaMinToMiddle = middleValue - minimumValue;

  // The total operations are a sum:
  // - Operations to bring the middle value up to the maximum (each costs 1).
  // - Operations to bring the minimum value up to the middle value (using the specific cost function).
  return deltaMiddleToMax + calculateDisparityCost(deltaMinToMiddle);
}

/**
 * Main entry point for the application. It reads input from standard input,
 * processes it using the core logic, and prints the result to standard output.
 *
 * @param {string} stdInputContent - The raw string content read from /dev/stdin.
 */
function executeApplication(stdInputContent) {
  // Trim any leading/trailing whitespace, including newlines, from the input.
  const cleanedInputData = stdInputContent.trim();
  const finalResult = computeMinimumEqualizationSteps(cleanedInputData);

  // Check the sentinel value to determine if computation was successful.
  if (finalResult !== -1) {
    console.log(finalResult);
  } else {
    // If computeMinimumEqualizationSteps returned -1, an error occurred.
    // A more specific error message might have already been logged by the helper functions.
    // This could also be an opportunity to exit with a non-zero status code.
    // process.exit(1); // Example of exiting on error in Node.js
  }
}

// This block acts as the script's execution entry point when run directly.
// It handles file system interaction specific to competitive programming environments
// that use /dev/stdin for input.
try {
  // Dynamically require the 'fs' (file system) module, common in Node.js environments.
  const fileSystemUtility = require('fs');
  // Synchronously read the entire content of /dev/stdin as a UTF-8 string.
  const dataFromStdin = fileSystemUtility.readFileSync('/dev/stdin', 'utf8');
  // Pass the read data to the main application execution function.
  executeApplication(dataFromStdin);
} catch (initializationError) {
  // Catch any errors that occur during file reading or initial setup.
  console.error(`Application startup or input reading failed: ${initializationError.message}`);
  // If running in a Node.js environment, a non-zero exit code indicates an error.
  // process.exit(1);
}