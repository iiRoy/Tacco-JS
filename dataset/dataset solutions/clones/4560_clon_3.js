const MONTH_GROUP_THIRTY_ONE = 1; // Denotes months with 31 days
const MONTH_GROUP_THIRTY = 2;   // Denotes months with 30 days
const MONTH_GROUP_FEBRUARY = 3; // Denotes February (special case for days)

/**
 * Categorizes a given month number based on its typical number of days.
 * This function handles validation for the month number range.
 *
 * @param {number} monthNumericalIdentifier - The numerical representation of a month (1-12).
 * @returns {number | null} A category identifier (1, 2, or 3) if valid, otherwise null.
 */
function classifyCalendarMonth(monthNumericalIdentifier) {
  // Introduce a guard clause for invalid month numbers
  if (monthNumericalIdentifier < 1 || monthNumericalIdentifier > 12) {
    // Optionally, could throw an error here instead of logging and returning null
    console.error(`Validation Error: Month number ${monthNumericalIdentifier} is outside the valid range (1-12).`);
    return null;
  }

  // Rewrite the conditional logic using a switch statement for different month groups
  switch (monthNumericalIdentifier) {
    case 1: // January
    case 3: // March
    case 5: // May
    case 7: // July
    case 8: // August
    case 10: // October
    case 12: // December
      return MONTH_GROUP_THIRTY_ONE; // These months generally have 31 days
    case 4: // April
    case 6: // June
    case 9: // September
    case 11: // November
      return MONTH_GROUP_THIRTY;     // These months generally have 30 days
    case 2: // February
      return MONTH_GROUP_FEBRUARY;  // February is a unique case (28 or 29 days)
    default:
      // This default case should theoretically not be reached due to the initial validation
      console.error(`Unexpected Error: Unhandled month number ${monthNumericalIdentifier}.`);
      return null;
  }
}

/**
 * The primary function to process input, compare two month numbers,
 * and determine if they belong to the same "day-count" category.
 *
 * @param {string} receivedRawText - The input string, expected to contain two space-separated integers.
 */
function processMonthComparison(receivedRawText) {
  // Trim any leading or trailing whitespace from the raw input
  const cleanedInput = receivedRawText.trim();

  // Split the cleaned input into individual string components
  const inputComponents = cleanedInput.split(' ');

  // Add a validation step: ensure exactly two components were provided
  if (inputComponents.length !== 2) {
    console.error("Input Format Error: Expected two space-separated numbers.");
    return; // Terminate execution for malformed input
  }

  // Parse the first number from the input components
  const firstParsedMonth = parseInt(inputComponents[0], 10);
  // Parse the second number from the input components
  const secondParsedMonth = parseInt(inputComponents[1], 10);

  // Add validation: check if parsing resulted in valid numbers
  if (isNaN(firstParsedMonth) || isNaN(secondParsedMonth)) {
    console.error("Parsing Error: One or both input values could not be converted to valid integers.");
    return;
  }

  // Determine the category for the first month using the helper function
  const firstMonthCategory = classifyCalendarMonth(firstParsedMonth);
  // Determine the category for the second month using the helper function
  const secondMonthCategory = classifyCalendarMonth(secondParsedMonth);

  // If either month category could not be determined (due to invalid month number), exit
  if (firstMonthCategory === null || secondMonthCategory === null) {
    return;
  }

  // Compare the determined categories and store the result message in a variable
  const finalOutcomeMessage = (firstMonthCategory === secondMonthCategory) ? "Yes" : "No";

  // Output the comparison result
  console.log(finalOutcomeMessage);
}

// --- Program Execution Start ---
// This block reads input from standard input (e.g., '/dev/stdin' on Linux/macOS, or specific file on Windows)
// and passes it to the main processing function.
try {
  const fileSystemModule = require('fs');
  const standardInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
  processMonthComparison(standardInputContent);
} catch (executionError) {
  // Add a robust error handling mechanism for file reading or other execution failures
  console.error("Application Execution Error:", executionError.message);
  // Optionally, provide more specific guidance based on error type
  if (executionError.code === 'ENOENT') {
    console.error("Hint: Ensure the '/dev/stdin' file exists or input is piped correctly.");
  }
}