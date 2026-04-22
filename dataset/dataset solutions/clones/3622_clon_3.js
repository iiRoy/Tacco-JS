/*
 * This module is designed to process an incoming text string,
 * extract a specific numeric value from it, and subsequently
 * determine if this extracted value can be precisely formed
 * by a particular linear combination of two integer coefficients.
 *
 * The defined linear combination is represented by the formula:
 * (FIRST_FACTOR_MULTIPLIER * coefficientA) + (SECOND_FACTOR_MULTIPLIER * coefficientB).
 *
 * The ranges for the coefficients are fixed:
 * - 'coefficientA' varies from 0 up to and including 25.
 * - 'coefficientB' varies from 0 up to and including 15.
 */
function analyzeInputData(rawTextContent) {
  // Defensive check: Ensure that some content was actually provided.
  // If the input is null, undefined, or an empty string, we report an error.
  if (!rawTextContent || rawTextContent.length === 0) {
    console.error("Error: The provided input content was either empty or invalid.");
    return; // Terminate execution if input is not usable.
  }

  // Step 1: Pre-process the raw input string.
  // Remove any superfluous whitespace from the beginning and end of the string.
  // This ensures that parsing operations are performed on clean data.
  const cleanInputString = rawTextContent.trim();

  // Additional validation: Check if the string became empty after trimming.
  // This can happen if the original input only contained whitespace.
  if (cleanInputString.length === 0) {
    console.error("Error: Input content became empty after whitespace removal.");
    return;
  }

  // Step 2: Extract the primary numeric value from the cleaned input string.
  // We assume the first sequence of non-whitespace characters represents our target number.
  // Using a regex-based split ensures robustness against various whitespace patterns.
  const parsedTokens = cleanInputString.split(/\s+/);
  const numericalStringFragment = parsedTokens[0];

  // Convert the extracted string fragment into an integer.
  // Number.parseInt is used for explicit type conversion and radix specification.
  const desiredSumValue = Number.parseInt(numericalStringFragment, 10);

  // Step 3: Validate the successfully parsed numeric value.
  // Confirm that the conversion resulted in a valid, finite integer.
  if (Number.isNaN(desiredSumValue) || !Number.isInteger(desiredSumValue)) {
    console.error(`Error: Failed to parse a valid integer from the token "${numericalStringFragment}".`);
    return;
  }

  // Define the fixed multipliers (coefficients) for our sum calculation.
  // These are constant values as per the problem's mathematical definition.
  const FIRST_FACTOR_MULTIPLIER = 4;
  const SECOND_FACTOR_MULTIPLIER = 7;

  // Initialize a collection to store all possible outcomes of the linear combination.
  // A Set is chosen for its efficient O(1) average-time complexity for value lookups,
  // and it automatically handles the uniqueness of stored sums.
  const generatedPossibleSums = new Set();

  // Step 4: Populate the 'generatedPossibleSums' Set by iterating through all valid coefficient ranges.
  // The first coefficient (related to FIRST_FACTOR_MULTIPLIER) iterates from 0 up to 25.
  for (let coefficientA = 0; coefficientA < 26; ++coefficientA) {
    // The second coefficient (related to SECOND_FACTOR_MULTIPLIER) iterates from 0 up to 15.
    for (let coefficientB = 0; coefficientB < 16; ++coefficientB) {
      // Compute the sum for the current pair of coefficients.
      const currentCombinationResult = (FIRST_FACTOR_MULTIPLIER * coefficientA) + (SECOND_FACTOR_MULTIPLIER * coefficientB);
      // Add the computed sum to our collection. Duplicates are ignored by the Set.
      generatedPossibleSums.add(currentCombinationResult);
    }
  }

  // Step 5: Check if the 'desiredSumValue' is present within the collection of 'generatedPossibleSums'.
  // The 'has' method of the Set provides an optimized way to perform this check.
  const canAchieveDesiredSum = generatedPossibleSums.has(desiredSumValue);

  // Step 6: Output the final determination to the console.
  // The output format is "Yes" or "No" as specified by the problem.
  if (canAchieveDesiredSum) {
    console.log("Yes");
  } else {
    console.log("No");
  }
}

// This is the primary execution block for the script.
// It reads the entire content from standard input (typically '/dev/stdin' in Unix-like systems)
// as a UTF-8 encoded string and then passes it to our 'analyzeInputData' function for processing.
analyzeInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));