/*
 * This program is designed to process a string containing three numerical inputs:
 * a starting boundary, an ending boundary, and an iteration count.
 * It then computes and displays a unique, sorted collection of numbers derived
 * from these inputs.
 */
function processNumericSequence(rawDataString) {
  // Parsing the raw input string into its constituent parts.
  // We use a regular expression for splitting to handle multiple spaces
  // and then filter out any empty strings that might result from splitting.
  const numericalParts = rawDataString.split(/\s+/).filter(Boolean);

  // A preliminary check to ensure all expected parameters are present.
  // If not, we log an error (or could throw an exception) and exit.
  if (numericalParts.length < 3) {
    console.error("Error: Insufficient data provided. Expected three numbers.");
    return;
  }

  // Convert the string parts into actual numbers.
  // Using the Number() constructor for type conversion, which handles various string formats.
  let lowerBound = Number(numericalParts[0]); // Corresponds to original 'a'
  let upperBound = Number(numericalParts[1]); // Corresponds to original 'b'
  let iterationAllowance = Number(numericalParts[2]); // Corresponds to original 'k'

  // Validate that the parsed values are indeed numbers.
  if (isNaN(lowerBound) || isNaN(upperBound) || isNaN(iterationAllowance)) {
    console.error("Error: One or more input values are not valid numbers.");
    return;
  }

  // Ensure the iteration allowance is not negative.
  // A negative allowance would imply no iterations, so we cap it at zero.
  if (iterationAllowance < 0) {
      iterationAllowance = 0;
  }

  // Initialize a Set to store the numbers. A Set automatically handles uniqueness,
  // which simplifies the logic compared to checking for existing elements in an array.
  const uniqueResultCollection = new Set(); // Replaces original 'arr'

  // --- Phase 1: Generate numbers starting from the lower bound ---
  // This loop adds numbers incrementally from 'lowerBound' for 'iterationAllowance' times,
  // but only if they do not exceed the 'upperBound'.
  for (let currentStep = 0; currentStep < iterationAllowance; currentStep++) {
    const valueFromStart = lowerBound + currentStep;
    if (valueFromStart <= upperBound) {
      uniqueResultCollection.add(valueFromStart);
    } else {
      // If the current value already exceeds the upper bound,
      // all subsequent values in this phase will also exceed it, so we can stop.
      break;
    }
  }

  // --- Phase 2: Generate numbers counting backwards from the upper bound ---
  // This loop adds numbers decrementally from 'upperBound' for 'iterationAllowance' times,
  // but only if they are not less than the 'lowerBound'.
  // The Set ensures that any duplicates from Phase 1 are not added again.
  for (let reverseStep = 0; reverseStep < iterationAllowance; reverseStep++) {
    const valueFromEnd = upperBound - reverseStep;
    if (valueFromEnd >= lowerBound) {
      uniqueResultCollection.add(valueFromEnd);
    } else {
      // If the current value is already below the lower bound,
      // all subsequent values in this phase will also be below it, so we can stop.
      break;
    }
  }

  // Convert the Set of unique numbers into an Array.
  // This is necessary because Sets are not directly sortable in the same way as Arrays.
  let finalSortedSequence = Array.from(uniqueResultCollection);

  // Sort the array numerically in ascending order.
  // The concise arrow function `(a, b) => a - b` is standard for numeric sorting.
  finalSortedSequence.sort((valA, valB) => valA - valB);

  // Output each number in the sorted sequence to the console, one per line.
  // Using forEach for iteration, which is a common pattern for array processing.
  finalSortedSequence.forEach(numberItem => {
    console.log(numberItem);
  });
}

// Standard boilerplate for reading input from stdin in a Node.js environment.
// The content is read as a UTF-8 string and then passed to our processing function.
const standardInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
processNumericSequence(standardInputContent);