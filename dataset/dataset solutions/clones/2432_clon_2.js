function processInputAndCalculate(inputLines) {
  // Parse the number of points from the first line of input.
  const numberOfPoints = Number(inputLines[0]);

  // Initialize an array to store the coordinates of each point.
  const pointCoordinates = [];
  // Loop through the input lines to populate the point coordinates.
  for (let currentLineIndex = 1; currentLineIndex <= numberOfPoints; currentLineIndex++) {
    // Split each line by space, convert string parts to numbers, and add to the array.
    pointCoordinates.push(inputLines[currentLineIndex].split(" ").map(coordinateValue => Number(coordinateValue)));
  }

  // Create a map to cache distances between points to avoid redundant calculations.
  const distanceCache = {};
  // Calculate and store distances between all unique pairs of points.
  for (let firstPointIndex = 0; firstPointIndex < numberOfPoints; firstPointIndex++) {
    for (let secondPointIndex = firstPointIndex + 1; secondPointIndex < numberOfPoints; secondPointIndex++) {
      // Store distance for both (i,j) and (j,i) keys for easy lookup.
      distanceCache[secondPointIndex + "_" + firstPointIndex] = distanceCache[firstPointIndex + "_" + secondPointIndex] = calculateEuclideanDistance(pointCoordinates[firstPointIndex], pointCoordinates[secondPointIndex]);
    }
  }

  // Generate all possible permutations of point indices (paths).
  const allPossiblePaths = generateAllPermutations(numberOfPoints);
  // Initialize a variable to accumulate the total length of all paths.
  let totalPathLengthSum = 0;

  // Iterate through each generated path.
  for (let pathIndex = 0; pathIndex < allPossiblePaths.length; pathIndex++) {
    // Add the length of the current path to the total sum.
    totalPathLengthSum += computePathLength(distanceCache, allPossiblePaths[pathIndex]);
  }

  // Output the average path length, formatted to a reasonable precision.
  console.log(totalPathLengthSum / allPossiblePaths.length);
}

/**
 * Computes the total length of a given path sequence.
 * @param {Object.<string, number>} distMap A map containing pre-calculated distances between points.
 * @param {number[]} pathSequence An array representing the order of points in a path.
 * @returns {number} The total length of the path.
 */
function computePathLength(distMap, pathSequence) {
  let currentPathTotal = 0; // Accumulator for the path's length.
  // Iterate through the path, summing distances between consecutive points.
  for (let step = 1; step < pathSequence.length; step++) {
    // Retrieve distance from the cache using a concatenated key.
    currentPathTotal += distMap[pathSequence[step - 1] + "_" + pathSequence[step]];
  }
  return currentPathTotal;
}

/**
 * Calculates the Euclidean distance between two 2D points.
 * @param {number[]} pointOne An array [x1, y1] representing the first point.
 * @param {number[]} pointTwo An array [x2, y2] representing the second point.
 * @returns {number} The Euclidean distance between the two points.
 */
function calculateEuclideanDistance(pointOne, pointTwo) {
  // Calculate the difference in x-coordinates.
  const deltaX = pointOne[0] - pointTwo[0];
  // Calculate the difference in y-coordinates.
  const deltaY = pointOne[1] - pointTwo[1];
  // Apply the distance formula: sqrt((x2-x1)^2 + (y2-y1)^2).
  return Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
}

/**
 * Generates all possible permutations of indices from 0 to (count - 1).
 * This is a recursive function.
 * @param {number} count The number of elements to permute (e.g., if 3, permutes [0, 1, 2]).
 * @returns {number[][]} An array of arrays, where each inner array is a permutation.
 */
function generateAllPermutations(count) {
  const permutationResults = []; // Stores the generated permutations.

  // Base case: if only one element, return a list containing a single array with that element.
  if (count === 1) {
    return [[0]];
  }

  // Recursive step: get all permutations for (count - 1) elements.
  const previousPermutations = generateAllPermutations(count - 1);

  // For each permutation from the previous step, insert the new element (count - 1)
  // at every possible position.
  for (let insertPosition = 0; insertPosition < count; insertPosition++) {
    for (let prevPermIndex = 0; prevPermIndex < previousPermutations.length; prevPermIndex++) {
      // Create a copy of the previous permutation to avoid modifying the original.
      const temporaryPermutation = previousPermutations[prevPermIndex].slice();
      // Insert the new element (count - 1) at the current insert position.
      temporaryPermutation.splice(insertPosition, 0, count - 1);
      // Add the newly formed permutation to the results.
      permutationResults.push(temporaryPermutation);
    }
  }
  return permutationResults;
}

// Read input from stdin, decode as UTF-8, split by newlines, and pass to the main processing function.
processInputAndCalculate(require('fs').readFileSync('/dev/stdin', 'utf8').split("\n"));
