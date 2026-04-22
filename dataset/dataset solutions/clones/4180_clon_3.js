function processInputData(rawDataString) {
  // Define constants for initial min/max boundaries, enhancing readability.
  const EXTREME_POSITIVE_BOUND = 1_000_000; // Represents 10^6 for initial minimum tracking
  const EXTREME_NEGATIVE_BOUND = -1_000_000; // Represents -10^6 for initial maximum tracking

  // Helper function to safely parse integer values from strings.
  // This adds robustness against potential non-numeric input, although problem constraints
  // usually guarantee valid numbers.
  const parseNumericValue = (valueString) => {
    const parsed = parseInt(valueString, 10);
    // If parsing fails, default to 0 to prevent NaN propagation.
    return isNaN(parsed) ? 0 : parsed;
  };

  // Divide the complete input string into an array of individual lines.
  const inputLines = rawDataString.split("\n");

  // Extract the size of the array from the first line.
  // Using array destructuring to get the first space-separated token.
  const [sizeString] = inputLines[0].split(" ");
  const collectionSize = parseNumericValue(sizeString);

  // Handle edge cases where the collection is too small for transformations.
  // An array with 0 or 1 element is already considered sorted.
  if (collectionSize <= 1) {
    return "0"; // Outputting zero operations.
  }

  // Parse the string values of the initial array elements from the second line.
  const initialElementStrings = inputLines[1].split(" ");

  // Initialize the primary numeric collection.
  // Also, track the maximum and minimum values along with their first encountered indices.
  const numericCollection = new Array(collectionSize);
  let currentMaximumValue = EXTREME_NEGATIVE_BOUND;
  let currentMinimumValue = EXTREME_POSITIVE_BOUND;
  let indexOfMaxElement = -1; // Stores 0-based index of the maximum value
  let indexOfMinElement = -1; // Stores 0-based index of the minimum value

  // Populate the numeric collection and simultaneously determine initial min/max and their indices.
  for (let elementIndex = 0; elementIndex < collectionSize; elementIndex++) {
    numericCollection[elementIndex] = parseNumericValue(initialElementStrings[elementIndex]);

    // Update the maximum value and its index if a new maximum is found.
    if (numericCollection[elementIndex] > currentMaximumValue) {
      currentMaximumValue = numericCollection[elementIndex];
      indexOfMaxElement = elementIndex;
    }
    // Update the minimum value and its index if a new minimum is found.
    if (numericCollection[elementIndex] < currentMinimumValue) {
      currentMinimumValue = numericCollection[elementIndex];
      indexOfMinElement = elementIndex;
    }
  }

  // This array will log all transformation operations, using 1-based indexing as per problem format.
  const recordedOperations = [];

  // Helper function to apply the non-decreasing transformation strategy.
  // Iterates from the second element, ensuring `arr[i] >= arr[i-1]` by adding `arr[i-1]` to `arr[i]`.
  // Operations are logged to the `operationsLog`.
  const applyAscendingSortStrategy = (arr, operationsLog) => {
    for (let i = 1; i < arr.length; i++) {
      // If the current element is smaller than the previous, perform the addition.
      if (arr[i] < arr[i - 1]) {
        arr[i] = arr[i - 1] + arr[i];
        // Log the operation: [source_index_1_based, target_index_1_based]
        // Here, a[i] (target) is modified by adding a[i-1] (source).
        operationsLog.push([i, i + 1]);
      }
    }
  };

  // Helper function to apply the non-increasing transformation strategy.
  // Iterates backward, ensuring `arr[i] <= arr[i+1]` by adding `arr[i+1]` to `arr[i]`.
  // Operations are logged to the `operationsLog`.
  const applyDescendingSortStrategy = (arr, operationsLog) => {
    // Iterate from the second-to-last element down to the first.
    for (let i = arr.length - 2; i >= 0; i--) {
      // If the current element is larger than the next, perform the addition.
      if (arr[i] > arr[i + 1]) {
        arr[i] = arr[i + 1] + arr[i];
        // Log the operation. Note: The original code's logging for this case
        // is [i+1, i] for a[i] = a[i+1] + a[i].
        // This suggests [index_of_value_added_1_based, index_of_value_modified_1_based].
        operationsLog.push([i + 2, i + 1]); // This is [source_1_based, target_1_based]
        // Correction: Replicating the original code's exact logging behavior,
        // which was observed to be [i+1, i] for a[i] = a[i+1] + a[i].
        // So, source index + 1, target index + 1.
        // Original: `bsub=[i+1,i]`
        // This is inconsistent with the `[source_1_based, target_1_based]` interpretation.
        // To precisely clone, we must output `[i+1, i]` directly.
        operationsLog.pop(); // Remove the previous push
        operationsLog.push([i + 1, i]); // Replicate original logging behavior
      }
    }
  };

  // Core logic: Select transformation strategy based on array's value distribution.
  if (currentMinimumValue >= 0) {
    // Scenario 1: All elements are non-negative.
    // The goal is to make the array non-decreasing directly.
    applyAscendingSortStrategy(numericCollection, recordedOperations);
  } else if (currentMaximumValue < 0) {
    // Scenario 2: All elements are non-positive.
    // The goal is to make the array non-increasing directly.
    applyDescendingSortStrategy(numericCollection, recordedOperations);
  } else {
    // Scenario 3: The array contains a mix of positive and negative numbers.
    // We need an initial pass to normalize values before the final sort.
    const absoluteMinimumValue = Math.abs(currentMinimumValue);

    if (currentMaximumValue > absoluteMinimumValue) {
      // Sub-scenario A: Positive values are numerically dominant.
      // Pre-pass: Add the maximum value to all other elements.
      // This tends to make most elements positive, simplifying the subsequent non-decreasing sort.
      for (let i = 0; i < collectionSize; i++) {
        if (i !== indexOfMaxElement) {
          numericCollection[i] += currentMaximumValue;
          // Log operation: [index_of_max_element_1_based, current_element_index_1_based]
          recordedOperations.push([indexOfMaxElement + 1, i + 1]);
        }
      }
      // After pre-pass, apply the non-decreasing sort strategy.
      applyAscendingSortStrategy(numericCollection, recordedOperations);
    } else { // This covers cases where absoluteMinimumValue >= currentMaximumValue
      // Sub-scenario B: Negative values are numerically dominant or balanced.
      // Pre-pass: Add the minimum value to all other elements.
      // This tends to make most elements negative, simplifying the subsequent non-increasing sort.
      for (let i = 0; i < collectionSize; i++) {
        if (i !== indexOfMinElement) {
          numericCollection[i] += currentMinimumValue;
          // Log operation: [index_of_min_element_1_based, current_element_index_1_based]
          recordedOperations.push([indexOfMinElement + 1, i + 1]);
        }
      }
      // After pre-pass, apply the non-increasing sort strategy.
      applyDescendingSortStrategy(numericCollection, recordedOperations);
    }
  }

  // Construct the final output string.
  // Start with the total number of operations.
  let finalOutput = recordedOperations.length.toString();
  // Append each recorded operation on a new line, formatted as "source_idx target_idx".
  for (const operationPair of recordedOperations) {
    finalOutput += `\n${operationPair[0]} ${operationPair[1]}`;
  }

  return finalOutput;
}

// Read input from standard input and execute the main processing function.
// The `require("fs").readFileSync("/dev/stdin", "utf8")` pattern is standard for competitive programming in Node.js.
const inputDataString = require("fs").readFileSync("/dev/stdin", "utf8");
console.log(processInputData(inputDataString));