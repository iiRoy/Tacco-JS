/*
 * This script processes a collection of positive integers to identify and count
 * specific "eligible" numbers based on a unique set of criteria.
 *
 * An eligible number is defined as:
 * 1. It has not been marked as a multiple of a smaller number already processed in the sorted sequence.
 * 2. If duplicate numbers are present in the input, only the first occurrence of a distinct value
 *    that meets criterion (1) is considered for incrementing the final count.
 *
 * The process involves:
 * - Reading and parsing input data, including initial validation.
 * - Sorting the numbers in ascending order.
 * - Determining the maximum value to correctly size a boolean tracking array.
 * - Iterating through the sorted numbers, marking all multiples of a number if it hasn't
 *   been marked already.
 * - Incrementing a counter only when a number is a unique candidate (not marked as a multiple
 *   and not an immediate duplicate in the sorted list).
 */
console.log((inputDataString => {
  // --- Input Acquisition and Initial Verification ---
  const dataLines = inputDataString.trim().split('\n');

  // Validate the minimal input structure.
  if (dataLines.length < 2) {
    console.error('ERROR: Input data is incomplete. Expected at least two lines for problem parameters.');
    return '0';
  }

  // Helper function to parse a string line into an array of integers.
  const parseNumericSequence = (lineText) => lineText.split(' ').map(token => Number.parseInt(token, 10));

  const initialParameters = parseNumericSequence(dataLines[0]);
  if (initialParameters.length === 0) {
    console.error('ERROR: First line (expected number count) is empty or invalid.');
    return '0';
  }
  let expectedTotalElements = initialParameters[0]; // Renamed 'N' to 'expectedTotalElements'

  let numericValuesCollection = parseNumericSequence(dataLines[1]); // Renamed 'A' to 'numericValuesCollection'

  // --- Data Cleaning and Adjustment ---
  // Filter out any non-positive numbers as they typically don't fit the problem's mathematical context.
  numericValuesCollection = numericValuesCollection.filter(val => val > 0);

  // Adjust the expected count if the actual parsed and filtered collection differs.
  if (numericValuesCollection.length === 0) {
      console.warn('WARNING: All numbers were non-positive or input was empty after filtering. No elements to process.');
      return '0';
  }
  if (numericValuesCollection.length !== expectedTotalElements) {
      console.warn(`WARNING: Initial parameter indicated ${expectedTotalElements} numbers, but actual filtered collection has ${numericValuesCollection.length}. Adjusting processing count.`);
      expectedTotalElements = numericValuesCollection.length;
  }

  // --- Pre-computation and Data Structure Initialization ---
  // Sort the collection in ascending order for efficient processing.
  numericValuesCollection.sort((elementA, elementB) => elementA - elementB);

  // Determine the highest value in the collection to set the bounds for our tracking array.
  // Using Math.max for a structural variation, though for extremely large arrays, a manual loop might be more robust.
  const highestValueInSet = Math.max(...numericValuesCollection); // Renamed 'MAX' to 'highestValueInSet'

  // Initialize a boolean array to mark numbers that are multiples of other numbers in the set.
  // Renamed 'ex' to 'markedAsMultipleTracker' and used 'new Array()' syntax.
  const markedAsMultipleTracker = new Array(highestValueInSet + 1).fill(false);

  let finalEligibleCount = 0; // Renamed 'count' to 'finalEligibleCount'

  // --- Core Algorithm Execution ---
  // Iterate through each number in the sorted collection.
  for (let currentItemIndex = 0; currentItemIndex < expectedTotalElements; ++currentItemIndex) {
    const currentNumericValue = numericValuesCollection[currentItemIndex]; // Introduced helper variable

    // If the current number has already been marked as a multiple of a smaller number, skip it.
    if (markedAsMultipleTracker[currentNumericValue]) {
      continue;
    }

    // If not marked, this number is a candidate. Mark all its multiples up to the highest value in the set.
    // Rewriting the inner loop using a 'do...while(true)' structure with explicit break.
    let currentFactor = 1;
    let computedMultiple;
    do {
      computedMultiple = currentNumericValue * currentFactor;
      if (computedMultiple > highestValueInSet) {
        break; // Stop if we exceed the maximum value in our tracking array.
      }
      markedAsMultipleTracker[computedMultiple] = true;
      currentFactor++;
    } while (true);

    // This condition handles duplicates: increment count only if the current number is
    // distinct from the next number in the sorted list, or if it's the last element.
    const isLastElementInCollection = (currentItemIndex === expectedTotalElements - 1);
    const isDifferentFromNextElement = isLastElementInCollection || (currentNumericValue !== numericValuesCollection[currentItemIndex + 1]);

    if (isDifferentFromNextElement) {
      finalEligibleCount++;
    }
  }

  // --- Result Formulation ---
  // Convert the final count to a string for output.
  return String(finalEligibleCount);
})(require('fs').readFileSync('/dev/stdin', 'utf8')));