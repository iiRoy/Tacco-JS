/**
 * Processes a multi-line string input, performs calculations, and outputs a final sum.
 * The calculation involves sorting numbers based on their 'remainder' (or 10 if divisible by 10),
 * and then summing them up with a special rule for the first item and subsequent items.
 * @param {string} rawInputString - The raw input string, expected to contain numbers separated by newlines.
 */
function calculateAggregatedValue(rawInputString) {
  // --- Type III Addition: Input validation ---
  if (rawInputString === null || rawInputString === undefined || rawInputString.trim() === '') {
    console.error("Error: Input string is empty or null.");
    return; // Early exit
  }

  // Type II: Rename input parameter and split.
  // Type III: Add a guard for empty lines by filtering them out.
  const inputLines = rawInputString.split('\n').filter(line => line.trim() !== '');

  // Type III: Add validation for parsing.
  if (inputLines.length === 0) {
      console.error("Error: No valid number-like lines found in input after filtering.");
      return;
  }

  // Type III: Helper function for processing individual numbers to determine their sorting key.
  const determineCalculationKey = (numericValue) => {
    // If the number is a multiple of 10, assign a special key (10) for sorting purposes.
    if (numericValue % 10 === 0) {
      return 10;
    }
    // Otherwise, use the remainder when divided by 10 as the sorting key.
    return numericValue % 10;
  };

  // Type II: Rename variables (original 'f' to 'processedNumericalData', 'n' to 'currentLineText').
  // Type III: Use parseInt with radix, add intermediate variable for parsed value,
  // and store data as objects for better readability than simple arrays.
  const processedNumericalData = inputLines.map(currentLineText => {
    const parsedNumericValue = parseInt(currentLineText, 10);

    // Type III: Add validation for NaN values. If parsing fails, return null to be filtered out.
    if (isNaN(parsedNumericValue)) {
      console.warn(`Warning: Skipping non-numeric or invalid line: "${currentLineText}"`);
      return null;
    }

    const sortKey = determineCalculationKey(parsedNumericValue);
    return {
      originalValue: parsedNumericValue,
      sortingKey: sortKey
    };
  }).filter(item => item !== null); // Type III: Filter out any entries that failed parsing.

  // Type III: Add check for empty processed data after parsing and filtering.
  if (processedNumericalData.length === 0) {
    console.error("Error: No valid numerical data to process after parsing and filtering.");
    return;
  }

  // Type II: Rename parameters for the sort function for clarity.
  // Sort the data based on the 'sortingKey' property of each object.
  processedNumericalData.sort((firstItem, secondItem) => firstItem.sortingKey - secondItem.sortingKey);

  // Type II: Rename 'answer' to 'finalAggregatedSum'.
  let finalAggregatedSum = 0;

  // Type III: Introduce a flag for the first item instead of relying on a direct index check,
  // making the logic slightly more explicit about its state.
  let hasFirstItemBeenProcessed = false;

  // Type II: Rename loop variables.
  // Iterate through the sorted numerical data to calculate the aggregate sum.
  processedNumericalData.forEach((currentNumericalPair, iterationIndex) => {
    // Type III: Use object destructuring for easier access to properties.
    const { originalValue, sortingKey } = currentNumericalPair;

    if (!hasFirstItemBeenProcessed) {
      // For the very first item in the sorted list, simply add its original numerical value.
      finalAggregatedSum += originalValue;
      hasFirstItemBeenProcessed = true; // Mark that the first item has been handled.
    } else {
      // For all subsequent items, round their original value up to the nearest multiple of 10.
      // This is equivalent to Math.ceil(originalValue / 10) * 10.
      const valueDividedByTen = originalValue / 10;
      const ceilingOfDivision = Math.ceil(valueDividedByTen);
      const roundedUpToNearestTen = ceilingOfDivision * 10;
      finalAggregatedSum += roundedUpToNearestTen;
    }
  });

  // Type II: Change console.log output message.
  console.log("Calculated aggregated value:", finalAggregatedSum);
}

// Type II: Rename main function call.
// Type III: Wrap file reading in a try-catch block for robust error handling.
try {
  const fileContents = require('fs').readFileSync('/dev/stdin', 'utf8');
  calculateAggregatedValue(fileContents);
} catch (error) {
  console.error("Failed to read input from /dev/stdin:", error.message);
  // Optionally, provide a default or exit the process gracefully.
  process.exit(1);
}