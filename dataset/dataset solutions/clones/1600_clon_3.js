'use strict';

// This helper function evaluates if three given side lengths can form a valid, distinct-sided (scalene) triangle.
function assessTriangleDistinctness(dimensions) {
  // Initial validation: ensure input is an array containing exactly three numeric values.
  if (!Array.isArray(dimensions) || dimensions.length !== 3 || dimensions.some(val => typeof val !== 'number' || isNaN(val))) {
    // If the input is malformed, it cannot represent a valid triangle.
    return false;
  }

  // Create a local, mutable copy of the dimensions to avoid modifying the original array reference.
  const currentSides = [...dimensions];

  // Sort the side lengths in ascending order. This simplifies subsequent checks.
  // For example, the smallest side will be at index 0, the largest at index 2.
  currentSides.sort((s1, s2) => s1 - s2);

  // Assign sorted values to descriptive variables for improved readability.
  const sideA = currentSides[0]; // Represents the shortest side
  const sideB = currentSides[1]; // Represents the middle side
  const sideC = currentSides[2]; // Represents the longest side

  // Guard clause: Triangle sides must have positive lengths.
  // Since the array is sorted, checking the smallest side (sideA) is sufficient.
  if (sideA <= 0) {
    return false;
  }

  // Condition 1: Verify the triangle inequality theorem.
  // The sum of the lengths of any two sides of a triangle must be greater than the length of the third side.
  // With sides sorted (A <= B <= C), only A + B > C needs to be explicitly checked.
  // (A + C > B and B + C > A are implicitly true if A, B, C are positive and A+B > C).
  const satisfiesTriangleInequality = (sideA + sideB > sideC);

  // Condition 2: Ensure all three sides have distinct lengths (for a scalene triangle).
  // This means no two sides can be equal.
  const areSidesDistinct = (sideA !== sideB && sideB !== sideC && sideA !== sideC);

  // A triangle is considered valid and distinct if both conditions are met.
  return satisfiesTriangleInequality && areSidesDistinct;
}

// This function orchestrates the input processing and triangle counting.
function processInputData(rawDataString) {
  // This routine parses input lines, extracts numerical data, and counts valid scalene triangles.

  // Split the raw input string by newline characters, handling both Windows (\r\n) and Unix (\n) line endings.
  // Filter out any empty lines that might result from extra newlines in the input.
  const parsedLines = rawDataString.split(/\r?\n/).filter(line => line.trim() !== '');

  // Input validation: Ensure at least two lines of data are present.
  if (parsedLines.length < 2) {
    console.error("Error: Insufficient input data provided. Expected at least two lines for processing.");
    return; // Terminate execution if input is incomplete.
  }

  // Extract and parse the total count of elements from the first line.
  const totalElementsString = parsedLines[0];
  const totalElements = parseInt(totalElementsString, 10);

  // Input validation: Confirm that the parsed totalElements is a positive integer.
  if (isNaN(totalElements) || totalElements <= 0) {
    console.error(`Error: Invalid number of elements specified in the first line: "${totalElementsString}". A positive integer is required.`);
    return; // Terminate execution for invalid 'N'.
  }

  // Extract and parse the space-separated numeric values from the second line.
  // Use parseFloat for robustness and filter out any resulting NaN values.
  const numericValuesString = parsedLines[1];
  const numericValues = numericValuesString.split(' ').map(val => parseFloat(val)).filter(val => !isNaN(val));

  // Input validation: Check if the actual count of numeric values matches the declared totalElements.
  if (numericValues.length !== totalElements) {
    console.error(`Error: Mismatch between declared element count (${totalElements}) and actual provided values (${numericValues.length}).`);
    return; // Terminate execution for data count mismatch.
  }

  // Initialize a counter for valid distinct triangles found.
  let distinctTriangleCount = 0;

  // Employ triple nested loops to iterate through all unique combinations of three distinct indices (i, j, k).
  // This ensures that each set of three sides is considered only once, without repetition or self-selection.
  for (let idx1 = 0; idx1 < totalElements; ++idx1) {
    for (let idx2 = idx1 + 1; idx2 < totalElements; ++idx2) {
      for (let idx3 = idx2 + 1; idx3 < totalElements; ++idx3) {
        // Construct a temporary array with the side lengths for the current combination.
        const currentTriangleSides = [numericValues[idx1], numericValues[idx2], numericValues[idx3]];

        // Invoke the helper function to determine if these sides form a valid, distinct-sided triangle.
        if (assessTriangleDistinctness(currentTriangleSides)) {
          distinctTriangleCount++; // Increment the counter if the conditions are met.
        }
      }
    }
  }

  // Output the final tally of valid distinct triangles in a descriptive format.
  console.log(`Total count of valid distinct-sided triangles found: ${distinctTriangleCount}`);
}

// Standard boilerplate for reading input from stdin and invoking the main processing function.
// This section should typically remain untouched as per problem instructions.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));