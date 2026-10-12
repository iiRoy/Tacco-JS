function ProcessInput(rawData) {
  // Clean up the raw input string and parse it into a structured array.
  // Each line is split by space, then the whole input is split by newline.
  rawData = rawData.trim().split("\n").map(function(linePart) {
    return linePart.split(" ");
  });

  // Extract the total number of elements from the first line, first item.
  let countElements = parseInt(rawData[0][0], 10);

  // Parse the second line of input into an array of integers.
  // This array 'valueArray' will be used globally by the recursive function.
  valueArray = rawData[1].map(elementStr => parseInt(elementStr, 10));

  // Initialize a 2D array (memoization table) for dynamic programming.
  // It's sized N x N, with each inner array initially empty.
  memoTable = Array.from({
    length: countElements
  }, () => []);

  // Call the main recursive function with the full range and print its result.
  console.log(CalculateOptimalValue(0, countElements - 1));
}

// Global variables for the array of values and the memoization table.
// These are accessed by the recursive function.
let valueArray;
let memoTable;

/**
 * Recursively calculates the optimal value for a given sub-interval [startIndex, endIndex].
 * This function uses dynamic programming with memoization to avoid redundant calculations.
 *
 * @param {number} startIndex - The starting index of the current sub-interval.
 * @param {number} endIndex - The ending index of the current sub-interval.
 * @returns {number} The calculated optimal value for the sub-interval.
 */
function CalculateOptimalValue(startIndex, endIndex) {
  // Check if the result for this sub-interval is already memoized.
  if (memoTable[startIndex][endIndex] != null) {
    return memoTable[startIndex][endIndex];
  }

  // Base case: If the interval contains exactly two elements.
  if (endIndex === startIndex + 1) {
    memoTable[startIndex][endIndex] = Math.abs(valueArray[startIndex] - valueArray[endIndex]);
    return memoTable[startIndex][endIndex];
  }

  // Base case: If the interval contains a single element.
  if (endIndex === startIndex) {
    memoTable[startIndex][endIndex] = valueArray[startIndex];
    return memoTable[startIndex][endIndex];
  }

  // Recursive step: Consider two options for the current player.
  // Option A: Player picks the element at startIndex.
  // The opponent then plays on the remaining interval [startIndex + 1, endIndex].
  let optionA = valueArray[startIndex] - CalculateOptimalValue(startIndex + 1, endIndex);

  // Option B: Player picks the element at endIndex.
  // The opponent then plays on the remaining interval [startIndex, endIndex - 1].
  let optionB = valueArray[endIndex] - CalculateOptimalValue(startIndex, endIndex - 1);

  // The current player chooses the option that maximizes their score.
  memoTable[startIndex][endIndex] = Math.max(optionA, optionB);

  // Return the memoized result.
  return memoTable[startIndex][endIndex];
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
