function processData (rawData) {
  // Split the raw input string into an array of lines
  let parsedData = rawData.split('\n');

  // Parse the first line to get the number of items for each array and the target value
  const [countA, countB, targetValue] = parsedData[0].split(' ').map(Number);

  // Calculate prefix sums for the first set of numbers
  // This helps in quickly finding the sum of elements up to a certain index
  const prefixSumsA = parsedData[1].split(' ').map(Number).reduce((accumulatedSums, currentElement) => {
    // If it's the first element, just add it
    if (accumulatedSums.length === 0) {
      return [currentElement];
    } else {
      // Otherwise, add it to the previous prefix sum
      return [...accumulatedSums, currentElement + accumulatedSums[accumulatedSums.length - 1]];
    }
  }, []);

  // Calculate prefix sums for the second set of numbers
  // Similar logic as above
  const prefixSumsB = parsedData[2].split(' ').map(Number).reduce((accumulatedSums, currentElement) => {
    if (accumulatedSums.length === 0) {
      return [currentElement];
    } else {
      return [...accumulatedSums, currentElement + accumulatedSums[accumulatedSums.length - 1]];
    }
  }, []);

  // Find the maximum index in prefixSumsA that does not exceed the targetValue
  const maxIndexA = findCeilingIndex(prefixSumsA, targetValue);

  // Initialize the overall maximum number of items that can be chosen
  let overallMax = 0;

  // Iterate through possible selections from the first array
  for (let idxA = 0; idxA <= maxIndexA; ++idxA) {
    // Determine the sum from the first array for the current number of elements
    // If idxA is 0, no elements are taken, so sum is 0
    const currentSumA = (idxA === 0) ? 0 : prefixSumsA[idxA - 1];

    // Find the maximum index in prefixSumsB such that its sum,
    // when combined with currentSumA, does not exceed targetValue
    const maxIndexB = findCeilingIndex(prefixSumsB, targetValue - currentSumA);

    // If the current combination of indices yields a greater total count, update overallMax
    if (maxIndexB + idxA > overallMax) {
      overallMax = maxIndexB + idxA;
    }
  }

  // Output the final maximum count
  console.log(overallMax);
}

// This function performs a binary search to find the "ceiling" index.
// It returns the index of the first element in valueArray that is strictly greater than limitValue.
// If all elements are less than or equal to limitValue, it returns valueArray.length.
function findCeilingIndex (valueArray, limitValue) {
  let startIndex = 0; // Represents the lower bound of the search range
  let endIndex = valueArray.length; // Represents the upper bound of the search range (exclusive)

  // Continue searching while the bounds have not converged
  while (startIndex !== endIndex) {
    // Calculate the middle index, using bitwise OR 0 for integer flooring
    let midIndex = ((startIndex + endIndex) / 2) | 0;

    // If the element at midIndex is greater than the limitValue,
    // it means the ceiling index might be midIndex or to its left
    if (limitValue < valueArray[midIndex]) {
      endIndex = midIndex;
    } else {
      // If the element at midIndex is less than or equal to limitValue,
      // the ceiling index must be to its right
      startIndex = midIndex + 1;
    }
  }

  // startIndex now holds the index of the first element greater than limitValue,
  // or valueArray.length if all elements are less than or equal to limitValue.
  return startIndex;
}

// Read input from stdin, process it, and execute the main logic
processData(require('fs').readFileSync('/dev/stdin', 'utf8').trim());