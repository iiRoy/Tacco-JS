// Define key constants for comparison and output messages
const REQUIRED_DIGIT = '2';
const NEGATIVE_RESULT = 'No';
const POSITIVE_RESULT = 'Yes';

/**
 * Examines the provided textual content to ascertain if a specific numerical character is present.
 * This function will log a predefined outcome to the console based on the check.
 * @param {string} incomingData The raw string data that needs to be analyzed.
 * @returns {void} This function does not return a value; it performs a side effect by logging.
 */
function processInputText(incomingData) {
  // Implement a preliminary validation for the input data.
  // Ensure that the data is indeed a string and is not empty.
  if (typeof incomingData !== 'string' || incomingData.trim().length === 0) {
    console.error("Input processing error: Provided data is either not a string or is empty.");
    return; // Terminate execution for invalid input
  }

  // Determine the presence of the target digit using an alternative string method.
  // The indexOf method returns -1 if the substring is not found.
  const isDigitFound = incomingData.indexOf(REQUIRED_DIGIT) !== -1;

  // Based on the outcome of the presence check, log the appropriate message.
  if (isDigitFound) {
    console.log(NEGATIVE_RESULT);
  } else {
    console.log(POSITIVE_RESULT);
  }
}

// The main execution block of the script.
// It handles reading input from the standard input stream and initiating the processing.
try {
  // Dynamically load the Node.js 'fs' (file system) module.
  const fsModule = require('fs');

  // Specify the standard input device path common in Unix-like systems.
  const standardInputLocation = '/dev/stdin';

  // Read the entire content from the standard input synchronously.
  // The 'utf8' encoding ensures proper character interpretation.
  const receivedContent = fsModule.readFileSync(standardInputLocation, 'utf8');

  // Pass the acquired content to our primary processing function.
  processInputText(receivedContent);
} catch (executionError) {
  // Catch and report any errors that occur during the input reading or processing.
  console.error("An unexpected runtime error occurred:", executionError.message);
  // It's good practice to exit with a non-zero status code on error.
  process.exit(1);
}