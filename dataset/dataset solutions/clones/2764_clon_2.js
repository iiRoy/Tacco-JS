"use strict"

// This script calculates the number of pairs of vectors
// whose Euclidean distance is an integer.

const processCoordinates = inputDataString => {
  // Normalize the input string by trimming whitespace and splitting into individual lines.
  let processedLines = inputDataString.trim().split("\n");

  // Extract the number of vectors (N) and the number of dimensions (D) from the first line.
  const numberOfVectors = Number(processedLines[0].split(" ")[0]);
  const dimensions = Number(processedLines[0].split(" ")[1]);

  // Isolate the actual coordinate sets from the input, skipping the first line.
  const coordinateSets = processedLines.slice(1, numberOfVectors + 1);
  // Initialize a counter for pairs with integer Euclidean distances.
  let integerDistanceCount = 0;

  // Iterate through each vector to use as the first point in a pair.
  // The 'for...in' loop is used to iterate over array indices.
  for (let currentVectorIndex in coordinateSets) {
    // Parse the string coordinates of the current vector into an array of numbers.
    let currentVectorStrings = coordinateSets[currentVectorIndex].split(" ").map(coordString => Number(coordString));
    let currentVectorCoords = []; // Array to store numeric coordinates for the current vector.

    // Populate the currentVectorCoords array.
    for (let coordComponentIndex in currentVectorStrings) {
      currentVectorCoords.push(currentVectorStrings[coordComponentIndex]);
    }

    // Iterate through subsequent vectors to form pairs with the current vector.
    // This avoids duplicate pairs and comparing a vector with itself.
    for (let comparisonVectorIndex = Number(currentVectorIndex) + 1; comparisonVectorIndex < numberOfVectors; comparisonVectorIndex++) {
      // Parse the string coordinates of the comparison vector into an array of numbers.
      let comparisonVectorStrings = coordinateSets[comparisonVectorIndex].split(" ").map(coordString => Number(coordString));
      let comparisonVectorCoords = []; // Array to store numeric coordinates for the comparison vector.

      // Populate the comparisonVectorCoords array.
      for (let componentIndex in comparisonVectorStrings) {
        comparisonVectorCoords.push(comparisonVectorStrings[componentIndex]);
      }

      let euclideanDistanceSquaredSum = 0; // Accumulator for the sum of squared differences.

      // Calculate the sum of squared differences for each dimension.
      for (let dimIndex in comparisonVectorCoords) {
        euclideanDistanceSquaredSum += Math.abs(Math.pow(currentVectorCoords[dimIndex] - comparisonVectorCoords[dimIndex], 2));
      }

      // Calculate the final Euclidean distance by taking the square root.
      let finalEuclideanDistance = Math.sqrt(euclideanDistanceSquaredSum);

      // Check if the calculated distance is an integer (i.e., has no fractional part).
      if (0 === finalEuclideanDistance % 1) {
        integerDistanceCount++; // Increment the counter if it's an integer.
      }
    }
  }

  // Output the total count of pairs with integer Euclidean distances.
  console.log(integerDistanceCount);
};

// Read input from standard input, decode as UTF-8, and pass to the main processing function.
processCoordinates(require('fs').readFileSync('/dev/stdin', 'utf8'));