function ProcessInput(inputString) {
  // A large prime number for modulo operations
  const primeModulus = 1000000007;

  // Parse the raw input into a matrix of integers
  const parsedData = ConvertToIntegerMatrix(SplitInputLines(inputString));

  // Generate all combinations (patterns) based on the first line of input
  const combinations = GenerateCombinations(parsedData[0][0], parsedData[0][1]);

  let totalResult = 0; // Accumulator for the final sum

  // Iterate through each generated combination
  for (let idx = 0; idx < combinations.length; idx++) {
    // Calculate the difference between max and min for the current combination
    // and add it to the total, applying modulo
    totalResult = (totalResult + CalculateMinMaxDifference(parsedData[1], combinations[idx])) % primeModulus;
  }

  // Output the final computed sum to standard output
  console.log(totalResult);
}

/**
 * Calculates the difference between the maximum and minimum values
 * in a given array, based on a set of indices (pattern).
 * @param {number[]} valueArray - The array of numbers to search within.
 * @param {number[]} indices - An array of 1-based indices to pick elements from valueArray.
 * @returns {number} The difference between the maximum and minimum selected values.
 */
function CalculateMinMaxDifference(valueArray, indices) {
  // Initialize minimum and maximum with the first element specified by the pattern
  let minimumValue = valueArray[indices[0] - 1];
  let maximumValue = valueArray[indices[0] - 1];

  // Iterate through the rest of the indices in the pattern
  for (let jdx = 1; jdx < indices.length; jdx++) {
    // Update minimum if a smaller value is found
    minimumValue = Math.min(minimumValue, valueArray[indices[jdx] - 1]);
    // Update maximum if a larger value is found (note: original code had Math.max(mi, arr[pat[i]-1]), which is likely a typo and should be Math.max(ma, arr[pat[i]-1]))
    // Preserving original behavior for Type II, even if it's a potential bug.
    maximumValue = Math.max(minimumValue, valueArray[indices[jdx] - 1]);
  }
  // Return the difference
  return (maximumValue - minimumValue);
}

/**
 * Splits the raw input string into lines and then each line into space-separated strings.
 * @param {string} rawData - The entire input string.
 * @returns {string[][]} A 2D array where each inner array represents a line of space-separated strings.
 */
function SplitInputLines(rawData) {
  // Split the input string by newline characters
  const lines = rawData.split("\n");
  const lineSplitData = []; // Array to hold processed lines

  // Iterate over each line
  for (let kdx = 0; kdx < lines.length; kdx++) {
    // Split each line by spaces and store it
    lineSplitData[kdx] = lines[kdx].split(" ");
  }
  return lineSplitData;
}

/**
 * Converts a 2D array of strings into a 2D array of integers.
 * @param {string[][]} stringMatrix - The 2D array of strings.
 * @returns {number[][]} The 2D array with all elements parsed as integers.
 */
function ConvertToIntegerMatrix(stringMatrix) {
  const integerMatrix = []; // Resulting 2D array of integers

  // Iterate through rows
  for (let ldx = 0; ldx < stringMatrix.length; ldx++) {
    integerMatrix[ldx] = []; // Initialize current row
    // Iterate through columns in the current row
    for (let mdx = 0; mdx < stringMatrix[ldx].length; mdx++) {
      // Parse each string element to an integer
      integerMatrix[ldx][mdx] = parseInt(stringMatrix[ldx][mdx]);
    }
  }
  return integerMatrix;
}

/**
 * Generates all unique combinations of 'selectionSize' numbers chosen from 1 to 'upperBound'.
 * This is a combination generator without repetition.
 * @param {number} upperBound - The maximum number in the range (1 to upperBound).
 * @param {number} selectionSize - The number of elements to choose for each combination.
 * @returns {number[][]} A 2D array containing all generated combinations.
 */
function GenerateCombinations(upperBound, selectionSize) {
  const allCombinations = []; // Stores all generated combinations
  const currentCombination = []; // Represents the combination currently being built

  // Initialize the first combination: [1, 2, ..., selectionSize]
  for (let ndx = 1; ndx <= selectionSize; ndx++) {
    currentCombination[currentCombination.length] = ndx;
  }

  // Loop to generate subsequent combinations
  for (;;) {
    // Add a copy of the current combination to the results
    allCombinations[allCombinations.length] = currentCombination.concat();

    let pivotIndex = currentCombination.length - 1; // Start checking from the rightmost element

    // Find the rightmost element that can be incremented
    for (let pdx = currentCombination.length - 1; pdx >= 0; pdx--) {
      // If the current element is not at its maximum possible value for its position
      if (currentCombination[pdx] !== upperBound - (currentCombination.length - pdx - 1)) {
        break; // Found an element to increment
      } else {
        pivotIndex = pdx - 1; // Move pivot to the left
      }
    }

    // If a pivot element was found (i.e., not all elements are at their max)
    if (pivotIndex >= 0) {
      const baseValue = currentCombination[pivotIndex]; // Value of the pivot element
      // Increment the pivot element and subsequent elements
      for (let qdx = 0; qdx < currentCombination.length - pivotIndex; qdx++) {
        currentCombination[pivotIndex + qdx] = baseValue + qdx + 1;
      }
    } else {
      // No pivot found, all combinations generated
      break;
    }
  }
  return allCombinations;
}


// The following line is for standard input/output handling and should not be modified.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
