function ProcessData(rawData) {
  // This function processes raw input to calculate an aggregated value
  // based on a set of rules for selecting and summing combinations.

  // --- Input Pre-processing and Validation ---

  // Ensure input data is not empty or malformed
  if (!rawData || typeof rawData !== 'string' || rawData.trim().length === 0) {
    console.error("Error: Input data is empty or invalid. Please provide a non-empty string.");
    return; // Exit if input is invalid
  }

  // Split the raw input string into individual lines
  const inputLines = rawData.trim().split('\n');

  // Verify that we have at least two lines of input data
  if (inputLines.length < 2) {
    console.error("Error: Insufficient input lines. Expected at least two lines.");
    return; // Exit if input is incomplete
  }

  // Helper function to safely parse numeric values
  const safelyParseNumber = (numericString) => {
    const parsedValue = Number(numericString);
    if (isNaN(parsedValue)) {
      throw new Error(`Invalid numeric format encountered: '${numericString}'.`);
    }
    return parsedValue;
  };

  // Extract primary configuration parameters from the first line
  const configurationParts = inputLines[0].split(' ');
  if (configurationParts.length < 2) {
      console.error("Error: First line must contain two space-separated numbers (elementCount and selectionLimit).");
      return;
  }

  let elementCount; // Represents 'N' in the original problem
  let selectionLimit; // Represents 'M' in the original problem
  try {
      elementCount = safelyParseNumber(configurationParts[0]);
      selectionLimit = safelyParseNumber(configurationParts[1]);
  } catch (parseError) {
      console.error(`Error parsing configuration values: ${parseError.message}`);
      return;
  }

  // Validate the extracted configuration values
  if (elementCount <= 0) {
    console.error("Error: 'elementCount' must be a positive integer.");
    return;
  }
  if (selectionLimit <= 0) {
    console.error("Error: 'selectionLimit' must be a positive integer.");
    return;
  }

  // Extract the array of base values from the second line
  let baseValues; // Represents 'power' in the original problem
  try {
      baseValues = inputLines[1].split(' ').map(safelyParseNumber);
  } catch (parseError) {
      console.error(`Error parsing base values array: ${parseError.message}`);
      return;
  }

  // Ensure the number of base values matches the element count
  if (baseValues.length !== elementCount) {
      console.error(`Warning: Mismatch between 'elementCount' (${elementCount}) and actual number of base values provided (${baseValues.length}).`);
      // Depending on requirements, this could be a fatal error or a warning.
      // For now, we'll proceed but it's noted.
  }

  // --- Combination Generation ---

  // This array will store objects, each representing a unique pair combination
  // and its calculated score, along with a flag indicating if it's a self-pair.
  const scoreAndPairDetails = [];

  // Iterate through all unique pairs (i, j) where j <= i
  // This generates combinations (power[i] + power[j])
  for (let outerIndex = 0; outerIndex < elementCount; outerIndex++) {
    for (let innerIndex = 0; innerIndex <= outerIndex; innerIndex++) {
      const combinedScore = baseValues[outerIndex] + baseValues[innerIndex];
      const isSelfPair = (outerIndex === innerIndex); // True if it's a 'diagonal' element

      scoreAndPairDetails.push({
        value: combinedScore,
        isSelf: isSelfPair
      });
    }
  }

  // --- Main Selection and Aggregation Loop ---

  let totalAggregatedValue = 0; // Accumulator for the final sum
  let selectionsPerformed = 0; // Counter for how many selections have been made

  // Constant for the multiplication factor when a non-self-pair is selected
  const NON_SELF_PAIR_MULTIPLIER = 2;

  // Continue selecting until the limit is reached or no combinations are left
  while (selectionsPerformed < selectionLimit && scoreAndPairDetails.length > 0) {
    let currentHighestScore = -Infinity;
    let indexOfHighestScore = -1;

    // Find the combination with the highest score in the current list
    // This is a linear scan, as `splice` modifies indices.
    for (let k = 0; k < scoreAndPairDetails.length; k++) {
      if (scoreAndPairDetails[k].value > currentHighestScore) {
        currentHighestScore = scoreAndPairDetails[k].value;
        indexOfHighestScore = k;
      }
    }

    // If no valid score was found (shouldn't happen if array isn't empty)
    if (indexOfHighestScore === -1) {
      console.error("Internal error: Could not find highest score in combinationDetails. Exiting loop.");
      break;
    }

    const bestCombination = scoreAndPairDetails[indexOfHighestScore];
    let selectionsToIncrement = 1; // Default increment for the selection counter

    // Apply the specific rules for adding to the total aggregated value
    // Rule: If it's a self-pair OR if this is the very last selection allowed
    if (bestCombination.isSelf || (selectionsPerformed + 1) === selectionLimit) {
      totalAggregatedValue += bestCombination.value;
      selectionsToIncrement = 1;
    } else { // Otherwise, if it's a non-self-pair and not the last selection
      totalAggregatedValue += NON_SELF_PAIR_MULTIPLIER * bestCombination.value;
      selectionsToIncrement = 2;
    }

    // Update the count of selections made
    selectionsPerformed += selectionsToIncrement;

    // Remove the selected combination to prevent re-selection
    scoreAndPairDetails.splice(indexOfHighestScore, 1);
  }

  // Output the final calculated aggregated value
  console.log(totalAggregatedValue);
}

// --- Standard Input/Output Handling (External Interface) ---
// This section typically remains consistent across problem solutions.
// It reads from standard input and calls the main processing function.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));