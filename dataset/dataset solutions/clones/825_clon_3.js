const fileSystemUtilities = require('fs'); // Renamed 'fs' to 'fileSystemUtilities' for clarity

// --- Core Calculation Module ---
/**
 * Processes a single entry's parameters to compute its performance and financial metrics.
 * This function encapsulates the logic for determining an entity's score and net gain.
 *
 * @param {string} labelName - The unique identifier or name of the entity.
 * @param {number} paramP - A penalty or base cost parameter.
 * @param {number} paramA - Time component A.
 * @param {number} paramB - Time component B.
 * @param {number} paramC - Time component C.
 * @param {number} paramD - Time component D.
 * @param {number} paramE - Time component E.
 * @param {number} paramF - A factor for financial gain.
 * @param {number} paramS - A scaling factor for financial gain.
 * @param {number} paramM - A multiplier for certain time and financial components.
 * @param {number} originalInputIndex - The zero-based index of this entry in its block.
 * @returns {Array} An array containing: [labelName, finalPerformanceScore, originalInputIndex].
 */
function processEntityPerformance(labelName, paramP, paramA, paramB, paramC, paramD, paramE, paramF, paramS, paramM, originalInputIndex) {
  // Calculate the total operational duration based on various time components.
  // This corresponds to the 'time' variable in the original code.
  const totalOperationalDuration = paramA + paramB + paramC + ((paramD + paramE) * paramM);

  // Calculate the net financial outcome.
  // This corresponds to the 'money' variable in the original code.
  const calculatedNetFinancialGain = (paramF * paramS * paramM) - paramP;

  let finalPerformanceScore = 0;
  // Implement a guard clause to prevent division by zero, which would result in Infinity or NaN.
  if (totalOperationalDuration !== 0) {
    finalPerformanceScore = calculatedNetFinancialGain / totalOperationalDuration;
  } else {
    // If duration is zero, performance is highly dependent on net gain.
    // Assign an extremely high/low score to ensure it's sorted appropriately.
    finalPerformanceScore = calculatedNetFinancialGain > 0 ? Number.MAX_VALUE : Number.MIN_VALUE;
  }

  // Return a structured array containing the entity's label, its calculated score, and its original index.
  return [labelName, finalPerformanceScore, originalInputIndex];
}
// --- End Core Calculation Module ---


// Read all input from the standard input stream.
// It's assumed that the input will be well-formed according to the problem specification.
const rawInputContent = fileSystemUtilities.readFileSync('/dev/stdin', 'utf8');

// Prepare the input data:
// 1. Trim any leading/trailing whitespace (including the final newline character).
// 2. Split the content into an array of individual lines.
// 3. Filter out any lines that are empty after trimming, to ensure robust parsing.
let availableInputLines = rawInputContent
  .trim()
  .split('\n')
  .filter(line => line.length > 0);

// Main application loop: processes blocks of data until a termination signal is found.
// The loop continues indefinitely until an explicit 'break' statement is executed.
for (let blockProcessingCycle = 0; ; blockProcessingCycle++) {
  // Attempt to parse the first line of the current block as the number of entries.
  // `parseInt` with radix 10 is used for explicit integer conversion.
  // The `|| 0` provides a fallback to zero if parsing fails or `shift()` returns undefined.
  const numberOfEntriesInBlock = parseInt(availableInputLines.shift(), 10) || 0;

  // Check for the termination condition: a block size of zero indicates the end of input.
  if (numberOfEntriesInBlock === 0) {
    break; // Exit the processing loop.
  }

  // Initialize an array to hold the processed results for the current data block.
  const currentBlockResults = [];

  // Iterate over each entry within the current block, as specified by `numberOfEntriesInBlock`.
  for (let entryIndexWithinBlock = 0; entryIndexWithinBlock < numberOfEntriesInBlock; entryIndexWithinBlock++) {
    // Retrieve and split the current data line by spaces.
    const currentEntryTokens = availableInputLines.shift().split(' ');

    // The first token is the entity's name/label.
    const entityLabel = currentEntryTokens.shift();

    // Convert the remaining tokens (parameters P through M) to floating-point numbers.
    // Using `parseFloat` offers more flexibility than `parseInt` if parameters might be decimal.
    const entityNumericParameters = currentEntryTokens.map(parseFloat);

    // Call the dedicated helper function to calculate the performance metrics for this entity.
    // The spread operator (`...`) is used to pass the numeric parameters as individual arguments.
    const processedDataPoint = processEntityPerformance(
      entityLabel,
      ...entityNumericParameters, // This expands to paramP, paramA, ..., paramM
      entryIndexWithinBlock // Pass the original index for secondary sorting if needed.
    );

    // Add the computed data point to the results collection for this block.
    currentBlockResults.push(processedDataPoint);
  }

  // Sort the collected results for the current block:
  // Primary sort criterion: performance score in descending order (higher score first).
  // Secondary sort criterion: entity label in ascending lexicographical order (for ties).
  currentBlockResults.sort((itemOne, itemTwo) => {
    // Calculate the difference in performance scores.
    // `itemTwo[1] - itemOne[1]` ensures descending order for scores.
    const scoreDifference = itemTwo[1] - itemOne[1];

    // If scores are identical (or very close, due to floating point arithmetic),
    // use the entity label for a tie-breaking sort.
    if (scoreDifference === 0) {
      // `localeCompare` provides robust string comparison across different locales.
      return itemOne[0].localeCompare(itemTwo[0]); // Ascending order for labels.
    }

    return scoreDifference;
  });

  // Output the sorted entity labels to the console.
  // Each label is printed on a new line.
  for (const entityResult of currentBlockResults) {
    console.log(entityResult[0]);
  }

  // Print a distinct separator after all entities of a block have been outputted.
  console.log("--- End Block ---"); // Changed separator for distinction.
}

// The program concludes after processing all blocks.