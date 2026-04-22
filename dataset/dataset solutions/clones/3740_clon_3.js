// This function is designed to generate a specific sequence of numerical strings
// based on a provided iteration count. It simulates a counter that increments
// from 1 to 9, then resets to 1 while appending a '9' to a suffix string.
function processNumericalSequence(inputStringData) {
  // Attempt to parse the input string into a valid integer for the number of sequence elements.
  // Using Number() for explicit type conversion.
  const totalElementsToGenerate = Number(inputStringData);

  // Perform input validation: Ensure the parsed number is a positive integer.
  // If not, log an error and terminate the function gracefully.
  if (isNaN(totalElementsToGenerate) || !Number.isInteger(totalElementsToGenerate) || totalElementsToGenerate <= 0) {
    console.error("Error: Invalid or non-positive integer provided for sequence generation. Exiting.");
    return; // Exit early to prevent further execution with bad input.
  }

  // Initialize an array to hold all the string elements generated during the process.
  const generatedStringCollection = [];

  // Define constants for the sequence generation logic, enhancing readability and maintainability.
  const INITIAL_DIGIT_VALUE = 1;
  const DIGIT_RESET_THRESHOLD = 9;
  const SUFFIX_APPEND_CHARACTER = '9';

  // Initialize mutable state variables for the sequence generation.
  let currentLeadingNumericPart = INITIAL_DIGIT_VALUE; // Represents the digit from 1 to 9.
  let accumulatedSuffixString = ""; // Stores the string of '9's.

  // Loop through the specified number of times to produce each element of the sequence.
  for (let iterationIndex = 0; iterationIndex < totalElementsToGenerate; iterationIndex++) {
    // Construct the current sequence item using a template literal for clear string concatenation.
    const compositeSequenceItem = `${currentLeadingNumericPart}${accumulatedSuffixString}`;

    // Add the newly formed item to our collection.
    generatedStringCollection.push(compositeSequenceItem);

    // Apply the core logic for updating the numeric part and the suffix string for the next iteration.
    // If the current digit has reached the maximum allowed before resetting,
    // reset it and append a '9' to the suffix. Otherwise, just increment the digit.
    if (currentLeadingNumericPart === DIGIT_RESET_THRESHOLD) {
      currentLeadingNumericPart = INITIAL_DIGIT_VALUE; // Reset the digit to its starting value.
      accumulatedSuffixString += SUFFIX_APPEND_CHARACTER; // Extend the suffix.
    } else {
      currentLeadingNumericPart++; // Increment the digit for the subsequent sequence item.
    }
  }

  // Output the final generated sequence. Instead of a single join,
  // iterate and log each item individually for potentially larger datasets or different output needs.
  generatedStringCollection.forEach(item => {
    console.log(item);
  });
}

// Main execution block: Handles input reading and error management.
try {
  // Utilize Node.js 'fs' module to synchronously read data from standard input.
  // Ensure the input is treated as UTF-8 and any leading/trailing whitespace is removed.
  const rawInputContent = require("fs").readFileSync("/dev/stdin", "utf8").trim();

  // Invoke the primary sequence generation function with the cleaned input.
  processNumericalSequence(rawInputContent);
} catch (executionError) {
  // Catch and report any exceptions that occur during file reading or initial processing.
  console.error("An unexpected error occurred during program execution:", executionError.message);
}