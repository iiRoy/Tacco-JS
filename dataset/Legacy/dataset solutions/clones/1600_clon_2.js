'use strict';

// This function determines if three given side lengths can form a valid triangle.
// It also checks if all three sides are distinct.
function checkTriangleValidity(sideLengths) {
  // Sort the lengths in descending order to easily check the triangle inequality.
  // The largest side must be less than the sum of the other two.
  // For a non-degenerate triangle, the sum of any two sides must be greater than the third.
  // If sorted descending (s1 >= s2 >= s3), then s1 < s2 + s3 is the only condition needed.
  // The other two (s2 < s1 + s3 and s3 < s1 + s2) are automatically true.
  sideLengths.sort((valA, valB) => valB - valA);

  // Check triangle inequality (largest side < sum of other two)
  // And ensure all three sides have different lengths.
  return sideLengths[0] - sideLengths[1] < sideLengths[2] &&
         sideLengths[0] !== sideLengths[1] &&
         sideLengths[1] !== sideLengths[2];
}

// The primary function to process the input data and calculate the result.
function processInputData(rawData) {
  // Split the raw input string into an array of lines.
  const parsedLines = rawData.split("\n");

  // The first line contains the total number of elements.
  const totalElements = Number(parsedLines[0]);

  // The second line contains space-separated numbers, convert them to an array of numbers.
  const numericValues = parsedLines[1].split(' ').map(Number);

  // Initialize a counter for valid triangles found.
  let validTriangleCount = 0;

  // Iterate through all possible combinations of three distinct indices (a, b, c)
  // such that a < b < c to avoid duplicate combinations and self-selection.
  for (let idxA = 0; idxA < totalElements; idxA++) {
    for (let idxB = idxA + 1; idxB < totalElements; idxB++) {
      for (let idxC = idxB + 1; idxC < totalElements; idxC++) {
        // If the three side lengths form a valid and distinct-sided triangle, increment the counter.
        if (checkTriangleValidity([numericValues[idxA], numericValues[idxB], numericValues[idxC]])) {
          validTriangleCount++;
        }
      }
    }
  }

  // Output the final count of valid triangles to the console.
  console.log(validTriangleCount);
}

// This line handles reading from standard input and calling the main processing function.
// It should not be modified.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
