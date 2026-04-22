// This script processes numerical input from standard input to determine a specific outcome.

// Import the necessary module for file system operations.
const fileSystemModule = require('fs');

// Define constants for the standard input path and data encoding.
const standardInputSource = '/dev/stdin';
const dataEncoding = 'utf8';

// --- Input Acquisition Phase ---
// Initialize a variable to hold the raw content read from the input source.
let rawInputContent = '';
try {
  // Attempt to synchronously read all data from the specified input source.
  rawInputContent = fileSystemModule.readFileSync(standardInputSource, dataEncoding);
} catch (readError) {
  // Log an error message if reading fails and terminate the process with an error code.
  console.error(`Critical Error: Could not read from ${standardInputSource}. Details: ${readError.message}`);
  process.exit(1); // Exit with a non-zero code to indicate failure.
}

// --- Data Preprocessing Phase ---
// Trim any leading/trailing whitespace from the raw content and split it into an array
// of string tokens based on spaces.
const stringTokensArray = rawInputContent.trim().split(' ');

// Implement a guard clause to ensure sufficient input values are provided.
const minimumRequiredTokens = 2;
if (stringTokensArray.length < minimumRequiredTokens) {
  console.error(`Validation Error: Insufficient numerical input provided. Expected at least ${minimumRequiredTokens} values, but received ${stringTokensArray.length}.`);
  process.exit(1);
}

// Convert the string tokens into an array of numbers.
// The Number constructor is used for explicit type coercion.
const numericValuesCollection = stringTokensArray.map(Number);

// Extract the first two relevant numerical values for the core logic.
const primaryValue = numericValuesCollection[0];
const secondaryValue = numericValuesCollection[1];

// --- Core Logic Evaluation Phase ---
/**
 * Determines a specific outcome ('Yes' or 'No') based on two input numbers.
 * The outcome is 'No' if either the primary or secondary value is numerically equal to 2.
 * Otherwise, the outcome is 'Yes'. It also handles cases where inputs might not be valid numbers.
 *
 * @returns {string} The computed outcome, which is either 'Yes' or 'No'.
 */
const determineOutcome = () => {
  // Define the specific numerical value against which we are checking.
  const criticalNumberTarget = 2;

  // Check if the primary value is a valid number and equals the critical target.
  const isPrimaryValueCritical = !isNaN(primaryValue) && primaryValue === criticalNumberTarget;

  // Check if the secondary value is a valid number and equals the critical target.
  const isSecondaryValueCritical = !isNaN(secondaryValue) && secondaryValue === criticalNumberTarget;

  // A boolean flag to concisely represent if the condition for 'No' is met.
  let conditionForNoIsTriggered = false;

  // The condition is met if either the primary or secondary value is critical.
  if (isPrimaryValueCritical || isSecondaryValueCritical) {
    conditionForNoIsTriggered = true;
  }

  // Return 'No' if the condition is triggered, otherwise return 'Yes'.
  return conditionForNoIsTriggered ? 'No' : 'Yes';
};

// --- Output Presentation Phase ---
// Execute the core logic function to obtain the final decision string.
const finalDecisionString = determineOutcome();

// Display the final result to the standard output using console.info.
console.info(finalDecisionString);