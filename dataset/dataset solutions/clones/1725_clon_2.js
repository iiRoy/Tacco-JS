function processInputData(rawData) {
  // Divide the incoming raw text into separate lines.
  const inputLines = rawData.split('\n');

  // Extract numerical parameters from the initial line.
  const [countA, countB, targetSum] = inputLines[0].split(' ').map(Number);

  // Compute cumulative sums for the first sequence of numbers.
  // This creates an array where each element is the sum of all preceding elements plus itself.
  const cumulativeSumsA = inputLines[1].split(' ').map(Number).reduce((currentSums, itemValue) => {
    if (currentSums.length === 0) {
      return [itemValue]; // Initialize with the first value.
    } else {
      // Append the new cumulative sum.
      return [...currentSums, itemValue + currentSums[currentSums.length - 1]];
    }
  }, []); // Start with an empty array for accumulation.

  // Compute cumulative sums for the second sequence of numbers, following the same logic.
  const cumulativeSumsB = inputLines[2].split(' ').map(Number).reduce((currentSums, itemValue) => {
    if (currentSums.length === 0) {
      return [itemValue];
    } else {
      return [...currentSums, itemValue + currentSums[currentSums.length - 1]];
    }
  }, []);

  // Determine the maximum number of items from sequence A whose cumulative sum does not exceed targetSum.
  const maxItemsFromA = findCountOfElements(cumulativeSumsA, targetSum);

  let totalMaxItems = 0; // Variable to store the highest combined item count found.

  // Iterate through all possible valid counts of items taken from sequence A.
  for (let currentItemsA = 0; currentItemsA <= maxItemsFromA; currentItemsA++) {
    // Calculate the sum of items taken from sequence A.
    // If currentItemsA is 0, no items are taken, so the sum is 0.
    const sumOfCurrentItemsA = currentItemsA === 0 ? 0 : cumulativeSumsA[currentItemsA - 1];

    // Calculate the remaining sum allowed for sequence B.
    const remainingSumForB = targetSum - sumOfCurrentItemsA;

    // Determine the maximum number of items from sequence B that can be taken with the remaining sum.
    const maxItemsFromB = findCountOfElements(cumulativeSumsB, remainingSumForB);

    // If the current combination of items (from A + from B) is greater than the previously recorded maximum, update it.
    if (maxItemsFromB + currentItemsA > totalMaxItems) {
      totalMaxItems = maxItemsFromB + currentItemsA;
    }
  }

  // Display the final maximum count of combined items.
  console.log(totalMaxItems);
}

// This utility function performs a binary search on a sorted array of cumulative sums.
// It returns the count of elements (equivalent to the index + 1) whose cumulative sum
// is less than or equal to the provided limit.
function findCountOfElements(sumArray, sumLimit) {
  let lowerBound = 0; // Starting point for the search range.
  let upperBound = sumArray.length; // Ending point for the search range.

  // Continue binary search until the bounds meet.
  while (lowerBound !== upperBound) {
    // Calculate the middle index. Using bitwise OR 0 for efficient integer truncation.
    let middleIndex = ((lowerBound + upperBound) / 2) | 0;

    // If the cumulative sum at middleIndex exceeds the limit,
    // the desired count must be in the lower half.
    if (sumLimit < sumArray[middleIndex]) {
      upperBound = middleIndex;
    } else {
      // Otherwise, the sum at middleIndex is within the limit,
      // so we can potentially include it and search in the upper half.
      lowerBound = middleIndex + 1;
    }
  }

  // The lowerBound now represents the count of elements whose sum is less than or equal to sumLimit.
  return lowerBound;
}

// Read the entire content from standard input, remove leading/trailing whitespace,
// and then pass it to the primary processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8').trim());
