function processInput(rawData) {
  // Extract the total number of items from the first line of raw data.
  const itemCount = Number(rawData[0]);

  // Initialize an array to hold parsed coordinate pairs for each item.
  let coordinatePairs = [];
  // Iterate through the input lines, starting from the second line,
  // to populate the coordinatePairs array by parsing string coordinates into numbers.
  for (let currentLineIndex = 1; currentLineIndex <= itemCount; currentLineIndex++) {
    coordinatePairs.push(
      rawData[currentLineIndex].split(" ").map(strVal => Number(strVal))
    );
  }

  // Create an object to cache calculated distances between all unique pairs of points.
  let distanceCache = {};
  // Use nested loops to calculate and store the Euclidean distances for every unique pair of points.
  for (let firstPointIdx = 0; firstPointIdx < itemCount; firstPointIdx++) {
    for (let secondPointIdx = firstPointIdx + 1; secondPointIdx < itemCount; secondPointIdx++) {
      // Calculate the distance between the two current points.
      const currentDistance = calculateEuclideanDistance(
        coordinatePairs[firstPointIdx],
        coordinatePairs[secondPointIdx]
      );
      // Store the distance symmetrically in the cache using string keys (e.g., "0_1" and "1_0" map to the same value).
      distanceCache[`${secondPointIdx}_${firstPointIdx}`] = currentDistance;
      distanceCache[`${firstPointIdx}_${secondPointIdx}`] = currentDistance;
    }
  }

  // Generate all possible permutations of point indices (0 to itemCount-1).
  const allPermutations = generateAllPermutations(itemCount);

  // Initialize a variable to accumulate the sum of path lengths for all generated permutations.
  let totalPathLength = 0;
  // Iterate through each generated permutation to compute its total path length.
  for (let pathCounter = 0; pathCounter < allPermutations.length; pathCounter++) {
    totalPathLength += computePathDistance(distanceCache, allPermutations[pathCounter]);
  }

  // Output the average path length by dividing the total accumulated sum by the number of permutations.
  console.log(totalPathLength / allPermutations.length);
}

function computePathDistance(cachedDistances, pathSequence) {
  // Initialize a variable to store the sum of segment lengths for the current path.
  let currentPathSum = 0;
  // Iterate through the path sequence, starting from the second element,
  // to sum up distances between consecutive points in the sequence.
  for (let stepIndex = 1; stepIndex < pathSequence.length; stepIndex++) {
    const prevPoint = pathSequence[stepIndex - 1];
    const currPoint = pathSequence[stepIndex];
    // Retrieve the pre-calculated distance from the cache using a concatenated key.
    currentPathSum += cachedDistances[`${prevPoint}_${currPoint}`];
  }
  return currentPathSum; // Return the total length for this specific path.
}

function calculateEuclideanDistance(point1, point2) {
  // Calculate the difference in x-coordinates between the two points.
  const deltaX = point1[0] - point2[0];
  // Calculate the difference in y-coordinates between the two points.
  const deltaY = point1[1] - point2[1];
  // Apply the Euclidean distance formula: sqrt((deltaX)^2 + (deltaY)^2).
  return Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
}

function generateAllPermutations(itemCount) {
  // Initialize an array to store all permutations generated.
  let permutationList = [];
  // Base case for the recursion: if only one item, return a list containing a single permutation [0].
  if (itemCount === 1) {
    return [[0]];
  }

  // Recursively generate all permutations for (itemCount - 1) items.
  const previousPermutations = generateAllPermutations(itemCount - 1);

  // For each possible insertion position and each permutation from the previous step,
  // insert the new item to create new permutations.
  for (let insertionIndex = 0; insertionIndex < itemCount; insertionIndex++) {
    for (let prevPermIndex = 0; prevPermIndex < previousPermutations.length; prevPermIndex++) {
      // Create a shallow copy of the previous permutation to avoid modifying the original array.
      let tempPermutation = previousPermutations[prevPermIndex].slice();
      // Insert the new item (which is itemCount - 1, representing the next point index)
      // at the current insertion index within the temporary permutation.
      tempPermutation.splice(insertionIndex, 0, itemCount - 1);
      // Add the newly formed permutation to the main list.
      permutationList.push(tempPermutation);
    }
  }
  return permutationList; // Return the complete list of all possible permutations.
}

// Execute the main processing function with data read from standard input.
// The input is read as a UTF-8 string, then split by newline characters into an array of strings.
processInput(
  require('fs').readFileSync('/dev/stdin', 'utf8').split('\n')
);