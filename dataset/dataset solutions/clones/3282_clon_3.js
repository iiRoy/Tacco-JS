/**
 * @file This script processes a list of numbers, categorizing them based on two predefined thresholds,
 *       and then determines the size of the smallest category.
 *
 * This implementation includes robust input validation, improved variable naming,
 * and structural modifications to serve as a Type III code clone.
 */

/**
 * Main routine for processing and categorizing numerical data.
 * It reads configuration and a list of values from a multi-line string input,
 * then sorts the values into three distinct groups based on two thresholds.
 * Finally, it outputs the count of elements in the smallest group.
 *
 * @param {string} rawPayload The complete input string, typically from stdin or a file.
 *                            Expected format:
 *                            Line 1: N (total number of elements to process)
 *                            Line 2: A B (two threshold values)
 *                            Line 3: P1 P2 ... PN (N space-separated numerical elements)
 */
function ProcessInputData(rawPayload) {
  // Input validation: Ensure the payload is a non-empty string.
  if (typeof rawPayload !== 'string' || rawPayload.trim().length === 0) {
    console.error("Error: Received an invalid or empty input payload.");
    return; // Terminate execution if input is bad.
  }

  // Split the entire input string into individual lines for structured access.
  const dataLines = rawPayload.split("\n");

  // Basic check for the expected number of input lines.
  if (dataLines.length < 3) {
    console.error("Error: Insufficient data lines provided. Expected at least 3 lines for N, A/B, and P values.");
    return;
  }

  // Parse the total count of elements from the first line.
  // Using `Number()` for type conversion and `trim()` to handle potential whitespace.
  let elementCount = Number(dataLines[0].trim());
  if (isNaN(elementCount) || elementCount < 0) {
    console.error(`Error: Invalid element count '${dataLines[0].trim()}'. Must be a non-negative number.`);
    return;
  }

  // Extract and parse the two threshold values (A and B) from the second line.
  // Map each string part to a Number.
  const parsedThresholds = dataLines[1].split(" ").map(s => Number(s.trim()));

  // Validate that two valid numbers were successfully parsed for thresholds.
  if (parsedThresholds.length < 2 || parsedThresholds.some(isNaN)) {
    console.error(`Error: Invalid threshold values in line '${dataLines[1]}'. Expected two numbers.`);
    return;
  }

  let lowerBoundary = parsedThresholds[0];
  let upperBoundary = parsedThresholds[1];

  // Defensive programming: Ensure the lower boundary is indeed less than or equal to the upper boundary.
  // If they are swapped in the input, correct their order to maintain logical consistency for categorization.
  if (lowerBoundary > upperBoundary) {
    console.warn(`Warning: Lower boundary (${lowerBoundary}) was greater than upper boundary (${upperBoundary}). Swapping values for consistent processing.`);
    // Using array destructuring for an elegant swap.
    [lowerBoundary, upperBoundary] = [upperBoundary, lowerBoundary];
  }

  // Initialize arrays to hold numbers falling into each category.
  // Using `const` for array references as they won't be reassigned, only their contents modified.
  const groupOneMembers = [];   // Elements <= lowerBoundary
  const groupTwoMembers = [];   // Elements > lowerBoundary AND <= upperBoundary
  const groupThreeMembers = []; // Elements > upperBoundary

  // Retrieve the string containing all the item values from the third line.
  const itemValueStrings = dataLines[2].split(" ");

  // Iterate over the item values, parsing and categorizing each one.
  // Using `forEach` loop for a functional iteration style, and `slice` to respect `elementCount`.
  itemValueStrings.slice(0, elementCount).forEach((itemText, currentIndex) => {
    const currentNumericValue = Number(itemText.trim());

    // Validation for each individual numeric item.
    if (isNaN(currentNumericValue)) {
      console.warn(`Warning: Skipping non-numeric item '${itemText}' at index ${currentIndex}.`);
      return; // Skip to the next item if the current one is not a valid number.
    }

    // Apply the categorization logic based on the boundaries.
    if (currentNumericValue <= lowerBoundary) {
      groupOneMembers.push(currentNumericValue);
    } else if (currentNumericValue <= upperBoundary) { // This implies currentNumericValue > lowerBoundary
      groupTwoMembers.push(currentNumericValue);
    } else { // This implies currentNumericValue > upperBoundary
      groupThreeMembers.push(currentNumericValue);
    }
  });

  // Calculate the final metric: the minimum size among the three categorized groups.
  // Store intermediate lengths for clarity.
  const countGroupOne = groupOneMembers.length;
  const countGroupTwo = groupTwoMembers.length;
  const countGroupThree = groupThreeMembers.length;

  const smallestGroupSize = Math.min(countGroupOne, countGroupTwo, countGroupThree);

  // Output the computed result to the console.
  console.log(smallestGroupSize);
}

// --- Auxiliary Functions and Execution Environment Setup ---

/**
 * Debugging function for web browser environments.
 * It attempts to read input from a DOM element with ID "input"
 * and passes it to the primary processing function.
 */
function initiateDebuggingProcess() {
  const inputElement = document.getElementById("input");
  if (inputElement && typeof inputElement.value === 'string') {
    ProcessInputData(inputElement.value);
  } else {
    console.error("Debug Error: Could not find element 'input' or its value is not a string.");
  }
}

// Standard execution block for Node.js environments, typically used in competitive programming.
// Reads input from /dev/stdin and passes it to the main processing function.
if (typeof require !== 'undefined' && require.main === module) {
  try {
    const fileSystem = require("fs");
    const stdInputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
    ProcessInputData(stdInputContent);
  } catch (executionError) {
    console.error("Fatal Error: Failed to read from standard input (/dev/stdin).", executionError.message);
    // Exit with an error code for automated systems.
    process.exit(1);
  }
}