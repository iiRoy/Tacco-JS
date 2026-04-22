"use strict"

/*
 * This script processes a collection of numerical vectors
 * to count pairs of vectors whose Euclidean distance is an integer.
 */
function processInputData(rawDataString) {
  // Split the raw input into individual line fragments
  const lineFragments = rawDataString.trim().split("\n");

  // Extract the first line to get the number of vectors and dimensions
  const initialParameters = lineFragments.shift().split(' ').map(Number);

  // Store the total number of vectors
  const vectorCount = initialParameters[0];

  // Store the dimensionality of each vector
  const dimensionSize = initialParameters[1];

  // Convert remaining line fragments into arrays of numbers (numerical vectors)
  const numericalVectors = lineFragments.map(lineText => lineText.split(' ').map(Number));

  // Initialize a counter for pairs with integer Euclidean distances
  let integerDistanceCount = 0;

  // Iterate through each vector using an outer loop
  for (let idxA = 0; idxA < vectorCount; idxA++) {
    // Iterate through each vector again using an inner loop, starting from idxA
    for (let idxB = idxA; idxB < vectorCount; idxB++) {
      // Skip comparison if it's the same vector
      if (idxA === idxB) {
        continue;
      }

      // Get the first vector for comparison
      const vectorA = numericalVectors[idxA];

      // Get the second vector for comparison
      const vectorB = numericalVectors[idxB];

      // Initialize sum of squared differences for distance calculation
      let sumOfSquaredDifferences = 0;

      // Calculate the sum of squared differences across all dimensions
      for (let dimIdx = 0; dimIdx < dimensionSize; dimIdx++) {
        // Calculate the absolute difference between coordinates
        const coordinateDifference = Math.abs(vectorA[dimIdx] - vectorB[dimIdx]);

        // Add the square of the difference to the running sum
        sumOfSquaredDifferences += coordinateDifference * coordinateDifference;
      }

      // Calculate the Euclidean distance
      const euclideanDistance = Math.sqrt(sumOfSquaredDifferences);

      // Check if the calculated distance is an integer
      // (by checking if its string representation contains a decimal point)
      if (!(String(euclideanDistance).includes('.'))) {
        integerDistanceCount++; // Increment counter if it's an integer
      }
    }
  }

  // Output the final count of vector pairs with integer distances
  console.log(integerDistanceCount);
}

// Read input from standard input and pass it to the processing function
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));