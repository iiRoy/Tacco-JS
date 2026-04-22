function performSequenceTransformation(inputContent) {
  // Defensive check for input validity, a new fragment for robustness.
  if (!inputContent || typeof inputContent !== 'string' || inputContent.trim() === '') {
    return "0"; // Return an empty operation count for invalid input.
  }

  // Split the raw input string into individual lines.
  const inputLines = inputContent.split('\n');

  // Extract the number of elements from the first line.
  // Using Number() for parsing, which is a modern alternative to parseInt().
  const totalElements = Number(inputLines[0].split(' ')[0]);

  // Validate the extracted element count. Another new fragment.
  if (isNaN(totalElements) || totalElements <= 0) {
    return "0"; // Invalid or non-positive element count.
  }

  // Parse the second line, which contains the sequence of numbers.
  const stringNumericElements = inputLines[1].split(' ');
  // Initialize the mutable array for numeric data.
  let dataCollection = new Array(totalElements);

  // Initialize variables to track the maximum and minimum values encountered,
  // and their respective 0-based indices.
  let currentMaximumValue = -1000001; // Slightly more negative than -10^6
  let currentMinimumValue = 1000001;   // Slightly more positive than 10^6
  let indexOfMaximum = -1;
  let indexOfMinimum = -1;

  // Populate the data array and simultaneously find the initial min/max and their positions.
  for (let elementPos = 0; elementPos < totalElements; elementPos++) {
    const parsedNumericValue = Number(stringNumericElements[elementPos]);

    // Validate each parsed number. Another new fragment.
    if (isNaN(parsedNumericValue)) {
      return "0"; // Encountered a non-numeric value.
    }
    dataCollection[elementPos] = parsedNumericValue;

    // Update maximum value and its index if a larger value is found.
    if (dataCollection[elementPos] > currentMaximumValue) {
      currentMaximumValue = dataCollection[elementPos];
      indexOfMaximum = elementPos;
    }
    // Update minimum value and its index if a smaller value is found.
    if (dataCollection[elementPos] < currentMinimumValue) {
      currentMinimumValue = dataCollection[elementPos];
      indexOfMinimum = elementPos;
    }
  }

  // An array to store the sequence of transformation steps (operations).
  const transformationSteps = [];

  // Helper function to record an operation, converting 0-based indices to 1-based.
  // This is a new helper fragment.
  const recordTransformation = (sourceIndex0Based, targetIndex0Based) => {
    transformationSteps.push([sourceIndex0Based + 1, targetIndex0Based + 1]);
  };

  // --- Conditional Logic based on initial minimum and maximum values ---

  // Pre-calculate the absolute value of the minimum for cleaner comparisons.
  const absoluteMinimumMagnitude = Math.abs(currentMinimumValue);

  // Scenario 1: All numbers in the array are non-negative.
  if (currentMinimumValue >= 0) {
    // Iterate from the second element to the end.
    // If an element is smaller than its predecessor, add the predecessor to it.
    for (let j = 1; j < totalElements; j++) {
      if (dataCollection[j] < dataCollection[j - 1]) {
        recordTransformation(j - 1, j); // Source: previous element, Target: current element
        dataCollection[j] += dataCollection[j - 1]; // Perform the addition
      }
    }
  }
  // Scenario 2: All numbers in the array are negative.
  else if (currentMaximumValue < 0) {
    // Iterate from the second-to-last element down to the beginning.
    // If an element is larger than its successor, add the successor to it.
    for (let j = totalElements - 2; j >= 0; j--) {
      if (dataCollection[j] > dataCollection[j + 1]) {
        recordTransformation(j + 1, j); // Source: next element, Target: current element
        dataCollection[j] += dataCollection[j + 1]; // Perform the addition
      }
    }
  }
  // Scenario 3: Mixed signs, and the positive maximum value has a greater magnitude than the negative minimum.
  else if (currentMaximumValue > absoluteMinimumMagnitude) {
    // Phase 1: Propagate the maximum positive value throughout the array.
    // This aims to make all elements positive, setting up for a left-to-right sort.
    for (let j = 0; j < totalElements; j++) {
      if (j !== indexOfMaximum) { // Skip if current element is already the max.
        recordTransformation(indexOfMaximum, j); // Source: max element, Target: current element
        dataCollection[j] += currentMaximumValue; // Add the max value
      }
    }
    // Phase 2: Now that elements are likely positive (or at least less negative),
    // ensure non-decreasing order by iterating left to right.
    for (let j = 1; j < totalElements; j++) {
      if (dataCollection[j] < dataCollection[j - 1]) {
        recordTransformation(j - 1, j); // Source: previous element, Target: current element
        dataCollection[j] += dataCollection[j - 1]; // Perform the addition
      }
    }
  }
  // Scenario 4: Mixed signs, and the negative minimum value has a greater or equal magnitude than the positive maximum.
  else { // This covers the case where absoluteMinimumMagnitude >= currentMaximumValue
    // Phase 1: Propagate the minimum negative value throughout the array.
    // This aims to make all elements negative, setting up for a right-to-left sort.
    for (let j = 0; j < totalElements; j++) {
      if (j !== indexOfMinimum) { // Skip if current element is already the min.
        recordTransformation(indexOfMinimum, j); // Source: min element, Target: current element
        dataCollection[j] += currentMinimumValue; // Add the min value
      }
    }
    // Phase 2: Now that elements are likely negative,
    // ensure non-decreasing order by iterating right to left.
    for (let j = totalElements - 2; j >= 0; j--) {
      if (dataCollection[j] > dataCollection[j + 1]) {
        recordTransformation(j + 1, j); // Source: next element, Target: current element
        dataCollection[j] += dataCollection[j + 1]; // Perform the addition
      }
    }
  }

  // Construct the final output string.
  // The first line is the total number of recorded operations.
  let finalResultOutput = String(transformationSteps.length);
  // Append each operation on a new line.
  for (const operationPair of transformationSteps) {
    finalResultOutput += `\n${operationPair[0]} ${operationPair[1]}`;
  }

  return finalResultOutput;
}

// Standard entry point for competitive programming in JavaScript.
// Reads input from stdin, processes it, and prints the result to stdout.
const fileInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
const generatedOutput = performSequenceTransformation(fileInputContent);
console.log(generatedOutput);