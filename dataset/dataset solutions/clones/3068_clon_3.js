function processInputValues(rawInputString) {
  // This function takes a raw string input, processes it,
  // performs a custom sort on a subset of numerical values,
  // and then computes a final aggregated sum based on specific rules.

  // Step 1: Parse the raw input string into individual lines.
  // Each line is expected to represent a numerical value.
  const inputLines = rawInputString.split('\n');

  // Helper function to robustly convert a string segment to an integer.
  // This includes trimming whitespace and handling potential non-numeric inputs.
  const convertToValidatedInteger = (textSegment) => {
    const numericValue = parseInt(textSegment.trim(), 10);
    // If conversion results in NaN, we can choose to return 0,
    // throw an error, or filter it out. For this problem, we'll
    // assume valid input for the core logic, defaulting to 0 for safety.
    return isNaN(numericValue) ? 0 : numericValue;
  };

  // Step 2: Transform the input lines into an array of validated numbers.
  // We use a filter to exclude any entries that might have become 0 due to invalid parsing,
  // although for the specific problem, input is guaranteed to be numbers.
  const numericalDataPoints = inputLines
    .map(lineContent => convertToValidatedInteger(lineContent))
    .filter(val => typeof val === 'number'); // Ensure it's a number after parsing.

  // Step 3: Extract the primary sequence of values for further processing.
  // The original problem focuses on the first five numbers.
  const requiredDataLength = 5;
  let primaryValueSequence = numericalDataPoints.slice(0, requiredDataLength);

  // If the input provided fewer than 'requiredDataLength' values,
  // we pad the sequence with zeros to meet the expected length.
  // This is an additional robust handling mechanism (Type III change).
  while (primaryValueSequence.length < requiredDataLength) {
    primaryValueSequence.push(0);
  }

  // Step 4: Define a custom comparison function for sorting.
  // This function determines the sorting order based on the "effective" last digit.
  const compareByEffectiveLastDigitDescending = (valueA, valueB) => {
    // Calculate the last digit for both numbers.
    let lastDigitOfA = valueA % 10;
    let lastDigitOfB = valueB % 10;

    // Apply the special rule: if a last digit is 0, treat it as 10 for comparison.
    // This effectively places numbers ending in 0 at the "end" when sorting descending by last digit.
    const effectiveLastDigitOfA = (lastDigitOfA === 0) ? 10 : lastDigitOfA;
    const effectiveLastDigitOfB = (lastDigitOfB === 0) ? 10 : lastDigitOfB;

    // Sort in descending order based on these effective last digits.
    return effectiveLastDigitOfB - effectiveLastDigitOfA;
  };

  // Step 5: Sort the primary value sequence using the custom comparison logic.
  primaryValueSequence.sort(compareByEffectiveLastDigitDescending);

  // Step 6: Initialize the accumulator for the final computed total.
  let cumulativeTotal = 0;

  // Cache the index of the last element for efficient conditional logic within the loop.
  const lastItemPosition = primaryValueSequence.length - 1;

  // Step 7: Iterate through the sorted sequence to calculate the cumulative total.
  // The calculation rule differs for the last element versus all other elements.
  for (let currentPosition = 0; currentPosition < primaryValueSequence.length; currentPosition++) {
    const currentNumericalValue = primaryValueSequence[currentPosition];

    // Determine the value to be added to the sum based on position.
    if (currentPosition === lastItemPosition) {
      // For the very last element in the sorted sequence, add its original value directly.
      cumulativeTotal += currentNumericalValue;
    } else {
      // For all other elements, calculate a "rounded up to nearest ten" value.
      // This is an equivalent way to express Math.ceil(x / 10) * 10
      let roundedUpToMultipleOfTen;
      if (currentNumericalValue % 10 === 0) {
        // If the number is already a multiple of 10, it stays the same.
        roundedUpToMultipleOfTen = currentNumericalValue;
      } else {
        // Otherwise, round up to the next multiple of 10.
        roundedUpToMultipleOfTen = (Math.floor(currentNumericalValue / 10) + 1) * 10;
      }
      cumulativeTotal += roundedUpToMultipleOfTen;
    }
  }

  // Step 8: Output the final computed total.
  // Adding a descriptive label to the output for clarity.
  console.log(`Final Calculated Aggregate: ${cumulativeTotal}`);
}

// --- Program Execution Entry Point ---

// Read all content from standard input (e.g., from a file piped to stdin).
// The content is expected to be UTF-8 encoded.
const stdInputContentString = require('fs').readFileSync('/dev/stdin', 'utf8');

// Invoke the main processing function with the content read from standard input.
processInputValues(stdInputContentString);