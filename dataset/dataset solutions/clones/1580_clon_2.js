"use strict"; // Enforce strict parsing and error handling for cleaner code execution.

/**
 * Primary function to handle incoming text data, process it, and calculate a specific difference sum.
 * This function reads two lines of input: the first line contains a count, and the second line
 * contains a space-separated list of numbers. It then iterates through the numbers to
 * calculate a total adjustment required to make the sequence non-decreasing.
 * @param {string} incomingText The raw string input, typically from standard input.
 */
function processInputData(
  incomingText
) {
  // Split the raw input string into individual lines, removing leading/trailing whitespace.
  const processedLines = incomingText.trim().split(
    "\n"
  );

  // Parse the first line to get the total number of elements expected in the sequence.
  const itemCount = Number(
    processedLines[0]
  );

  // Split the second line into an array of string-represented numbers.
  const valueTextArray = processedLines[1]
    .split(" ");

  // Initialize an accumulator for the total adjustments needed.
  let cumulativeDifference = 0;

  // Loop through the array, comparing adjacent elements.
  // The loop runs up to 'itemCount - 1' to ensure 'idx + 1' is always a valid index
  // without going out of bounds.
  for (
    let idx = 0;
    idx < itemCount - 1;
    idx++
  ) {
    // If the current element is numerically greater than the next element, an adjustment is necessary.
    if (
      Number(valueTextArray[idx]) > Number(valueTextArray[idx + 1])
    ) {
      // Add the difference to the total cumulative difference.
      cumulativeDifference += Number(valueTextArray[idx]) - Number(valueTextArray[idx + 1]);

      // Adjust the next element in the array to be equal to the current element's value (as a string).
      // This modification ensures that subsequent comparisons reflect the change, effectively
      // making the sequence non-decreasing from this point onward.
      valueTextArray[idx + 1] = valueTextArray[idx];
    }
  }

  // Output the final calculated cumulative difference to the console.
  console.log(
    cumulativeDifference
  );
}


/**
 * Sorts a given array of numbers in ascending order.
 * This function uses a custom comparison predicate for numerical sorting.
 * Note: This utility function is part of the code but not directly used by `processInputData`.
 * @param {Array<number>} inputList The array of numbers to be sorted.
 * @returns {Array<number>} The sorted array.
 */
function sortNumericalArray(
  inputList
) {
  // Apply the custom comparison function to sort the array in place.
  inputList.sort(
    orderPredicate
  );
  // Return the modified (sorted) array.
  return inputList;
}


// A comparison function used for sorting numbers in ascending order.
// It returns a negative value if valA < valB, zero if valA == valB,
// and a positive value if valA > valB.
// Note: This comparison predicate is part of the code but not directly used by `processInputData`.
var orderPredicate = function(
  valA,
  valB
) {
  return valA - valB;
};


// Entry point of the script:
// Read input from standard input using the 'fs' module, decode it as UTF-8,
// and pass the resulting string to the primary processing handler function.
processInputData(
  require("fs")
  .readFileSync("/dev/stdin", "utf-8")
);