/**
 * This module processes structured input data to calculate a cumulative score
 * based on a set of numeric values and an operational budget.
 * It identifies and scores individual elements and pairs of elements
 * in a specific, prioritized manner.
 */
function processInputData(rawDataSet) {
  // --- Input Validation and Parsing ---
  // Ensure the raw input data array has the expected number of lines.
  if (!Array.isArray(rawDataSet) || rawDataSet.length < 2) {
    console.error("Data processing failed: Insufficient input lines. Expected at least two.");
    return; // Exit if input is malformed.
  }

  // Destructure the input lines for clarity.
  const [configurationLine, valueListLine] = rawDataSet;

  // Parse the operational parameters (N and M) from the first line.
  const configParameters = configurationLine.split(" ");

  // Convert string parameters to numbers. N represents the total count of items,
  // M represents the available operations budget.
  let totalItemCount = Number(configParameters[0]); // Corresponds to 'N' in original
  let availableBudgetUnits = Number(configParameters[1]); // Corresponds to 'M' in original

  // Validate that the parsed parameters are valid positive numbers.
  if (isNaN(totalItemCount) || isNaN(availableBudgetUnits) || totalItemCount < 0 || availableBudgetUnits < 0) {
    console.error("Data parsing error: Invalid numeric values for item count or budget units.");
    return;
  }

  // Parse the list of values from the second line.
  // Convert each string value to a number, filter out any non-numeric results,
  // and then sort the resulting array in descending order to prioritize larger values.
  const processedValuesDescending = valueListLine
    .split(" ")
    .map(numericString => Number(numericString)) // Convert all parts to numbers.
    .filter(validNumber => !isNaN(validNumber)) // Remove any non-numeric entries.
    .sort((a, b) => b - a); // Sort in descending order.

  // Initialize the variable to accumulate the final calculated score.
  let finalCalculatedScore = 0; // Corresponds to 'ans' in original

  // A boolean flag to manage early exits from nested loops, replacing 'break label'.
  let budgetDepletedFlag = false;

  // --- Core Scoring Logic ---
  // Iterate through each value in the sorted list.
  for (let primaryIndex = 0; primaryIndex < totalItemCount; ++primaryIndex) {
    // Check if the budget has been exhausted in a previous iteration or inner loop.
    if (budgetDepletedFlag) {
      break; // Terminate outer loop if budget is gone.
    }

    const currentPrimaryValue = processedValuesDescending[primaryIndex];

    // First operation type: Score the current individual element.
    // This operation consumes 1 budget unit and adds double the element's value to the score.
    const individualElementScore = currentPrimaryValue * 2;
    finalCalculatedScore += individualElementScore;
    availableBudgetUnits -= 1; // Decrement budget by 1.

    // Check if budget is depleted after the individual element scoring.
    if (availableBudgetUnits <= 0) {
      budgetDepletedFlag = true;
      continue; // Continue to the next outer loop iteration to check budgetDepletedFlag at the start.
    }

    // Second operation type: Score pairs involving the current element and subsequent elements.
    // This operation consumes 2 budget units per pair.
    for (let secondaryIndex = primaryIndex + 1; secondaryIndex < totalItemCount; ++secondaryIndex) {
      // Check if budget has been exhausted during previous inner loop iterations.
      if (budgetDepletedFlag) {
        break; // Terminate inner loop if budget is gone.
      }

      const currentSecondaryValue = processedValuesDescending[secondaryIndex];
      const sumOfCurrentPair = currentPrimaryValue + currentSecondaryValue;

      // Determine the multiplier for the pair score.
      // If only 1 budget unit remains, the multiplier is 1. Otherwise, it's 2.
      // This replicates the `Math.min(2, M)` behavior of the original code.
      const pairScoreMultiplier = Math.min(2, availableBudgetUnits);

      // Add the calculated score for this pair to the total.
      finalCalculatedScore += sumOfCurrentPair * pairScoreMultiplier;

      // This operation always consumes 2 budget units, regardless of the multiplier applied to the score.
      availableBudgetUnits -= 2;

      // Check if budget is depleted after scoring the pair.
      if (availableBudgetUnits <= 0) {
        budgetDepletedFlag = true;
        break; // Terminate inner loop.
      }
    }
  }

  // --- Output Result ---
  // Display the final calculated score to the console.
  console.log(finalCalculatedScore);
}

// --- Application Entry Point (Environment Specific) ---
// This section handles reading input from standard input (/dev/stdin)
// and passes it to the main processing function.
const fileSystemInterface = require('fs'); // Import Node.js File System module.
const standardInputFilePath = '/dev/stdin'; // Define the path for standard input.

try {
  // Read the entire content of the standard input file synchronously.
  const rawInputContentString = fileSystemInterface.readFileSync(standardInputFilePath, 'utf8');
  // Split the content by newline characters to get an array of input lines.
  const inputLinesArray = rawInputContentString.split("\n");
  // Invoke the main processing function with the prepared input.
  processInputData(inputLinesArray);
} catch (ioError) {
  // Catch and report any errors that occur during file reading.
  console.error(`Error reading input from ${standardInputFilePath}:`, ioError.message);
  // Optionally, provide default behavior or further error handling here.
}