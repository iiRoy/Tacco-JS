const fileSystemHandler = require('fs'); // Core module for file system operations.

// Constants defining the reward structure.
const primaryThresholdValue = 500; // The base quantity for the larger reward tier.
const primaryRewardMultiplier = 1000; // Points awarded per primary threshold block.
const secondaryThresholdValue = 5;   // The base quantity for the smaller reward tier.
const secondaryRewardMultiplier = 5;     // Points awarded per secondary threshold block.

/**
 * Calculates a point score based on a given numerical input,
 * utilizing a two-tiered reward system.
 *
 * @param {number} inputQuantity - The integer value representing the total quantity.
 * @returns {number} The aggregate score derived from the input.
 */
function computeAggregateScore(inputQuantity) {
  // Input validation: Ensure the quantity is a non-negative integer.
  if (typeof inputQuantity !== 'number' || !Number.isInteger(inputQuantity) || inputQuantity < 0) {
    console.error("Invalid input detected for score computation. Expected a non-negative integer, got:", inputQuantity);
    // In a production scenario, one might throw an error or handle it differently.
    // For this clone, we'll return zero for invalid inputs, indicating no score.
    return 0;
  }

  let runningTotalPoints = 0; // Accumulator for the final score.

  // --- First Tier Calculation: Major Reward Blocks ---
  // Determine how many full blocks of the primary threshold are contained in the input.
  const fullPrimaryBlocks = Math.floor(inputQuantity / primaryThresholdValue);

  // Add the points corresponding to these major blocks to the total.
  runningTotalPoints += fullPrimaryBlocks * primaryRewardMultiplier;

  // --- Second Tier Calculation: Minor Reward Blocks from Remainder ---
  // Calculate the remaining quantity after all primary blocks have been accounted for.
  const remainingUnits = inputQuantity % primaryThresholdValue;

  // From the remaining units, calculate the portion that forms full secondary blocks.
  // This effectively "rounds down" the remaining units to the nearest multiple of the secondary threshold.
  // For example, if remainingUnits is 12 and secondaryThresholdValue is 5,
  // then (12 % 5) is 2, so 12 - 2 = 10 eligible units.
  const eligibleSecondaryUnits = remainingUnits - (remainingUnits % secondaryThresholdValue);

  // Add the points from these eligible secondary units.
  // Since secondaryRewardMultiplier (5) equals secondaryThresholdValue (5),
  // the calculation simplifies: (eligibleSecondaryUnits / secondaryThresholdValue) * secondaryRewardMultiplier
  // becomes simply eligibleSecondaryUnits.
  runningTotalPoints += eligibleSecondaryUnits;

  return runningTotalPoints;
}

// --- Program Execution Entry Point ---
try {
  // Retrieve raw input content from the standard input stream.
  // .trim() is used to remove any leading/trailing whitespace, including newlines,
  // ensuring clean parsing for integer conversion.
  const rawDataFromStdin = fileSystemHandler.readFileSync('/dev/stdin', 'utf8').trim();

  // Attempt to convert the raw string input into a base-10 integer.
  const processedNumericInput = parseInt(rawDataFromStdin, 10);

  // Validate if the parsing was successful.
  if (isNaN(processedNumericInput)) {
    console.error("Error: Input could not be converted to a valid number. Received:", rawDataFromStdin);
    process.exit(1); // Exit with a non-zero code to indicate an error.
  }

  // Compute the final score using our specialized function.
  const finalComputedScore = computeAggregateScore(processedNumericInput);

  // Output the calculated score to the console (standard output).
  console.log(finalComputedScore);

} catch (processingError) {
  // Catch and report any errors that occur during file system operations or other stages.
  console.error("A critical error occurred during input processing or calculation:", processingError.message);
  process.exit(1); // Terminate the process due to an unrecoverable error.
}