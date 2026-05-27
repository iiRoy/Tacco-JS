function ProcessInput(rawData) {
  // Split the raw input string into lines
  rawData = rawData.split("\n");

  // Parse the first line to get the array length, then subtract one
  let arrayLengthMinusOne = +rawData[0] - 1;

  // Parse the second line, split by space, and convert elements to numbers
  const initialValues = rawData[1].split(" ").map(val => +val);

  // Initialize an array to store prefix sums
  const prefixSums = [];

  // Calculate prefix sums and store them in the 'prefixSums' array.
  // The final total sum is stored at the 'arrayLengthMinusOne' index.
  prefixSums[arrayLengthMinusOne] = initialValues.reduce((currentSum, elementValue, elementIndex) => {
    // Store the accumulated sum at the previous index
    prefixSums[elementIndex - 1] = currentSum;
    // Return the new accumulated sum
    return currentSum + elementValue;
  });

  // Initialize the minimum difference with a very large number
  let minDifference = 9e15; // Using scientific notation for a large number

  // Iterate through possible split points for the second segment
  // The loop runs from the second element up to the third-to-last element
  for (let idx = 1; idx < arrayLengthMinusOne - 1; ++idx) {
    // Calculate target sums for the left and right lower bound searches
    // Using unsigned right shift (>>> 1) for integer division by 2
    const targetLeftSum = (prefixSums[idx] + 1) >>> 1;
    const targetRightSum = (prefixSums[arrayLengthMinusOne] + prefixSums[idx] + 1) >>> 1;

    // Find the lower bound indices for the first and third segments
    const leftBoundIdx = findLowerBound(prefixSums, 0, idx - 1, targetLeftSum);
    const rightBoundIdx = findLowerBound(prefixSums, idx + 1, arrayLengthMinusOne - 1, targetRightSum);

    // Calculate the four segment sums based on current split points
    // and sort them to easily find min and max
    let currentSegments = [
      prefixSums[leftBoundIdx],
      prefixSums[idx] - prefixSums[leftBoundIdx],
      prefixSums[rightBoundIdx] - prefixSums[idx],
      prefixSums[arrayLengthMinusOne] - prefixSums[rightBoundIdx]
    ].sort((valA, valB) => valA - valB);

    // Update the overall minimum difference
    minDifference = Math.min(minDifference, currentSegments[3] - currentSegments[0]);

    // Check an alternative split for the first segment if 'leftBoundIdx' is not the first element
    if (leftBoundIdx) {
      currentSegments = [
        prefixSums[leftBoundIdx - 1],
        prefixSums[idx] - prefixSums[leftBoundIdx - 1],
        prefixSums[rightBoundIdx] - prefixSums[idx],
        prefixSums[arrayLengthMinusOne] - prefixSums[rightBoundIdx]
      ].sort((valA, valB) => valA - valB);
      minDifference = Math.min(minDifference, currentSegments[3] - currentSegments[0]);

      // Check an alternative split for the third segment if it's not adjacent to the second
      if (rightBoundIdx - idx > 1) {
        currentSegments = [
          prefixSums[leftBoundIdx - 1],
          prefixSums[idx] - prefixSums[leftBoundIdx - 1],
          prefixSums[rightBoundIdx - 1] - prefixSums[idx],
          prefixSums[arrayLengthMinusOne] - prefixSums[rightBoundIdx - 1]
        ].sort((valA, valB) => valA - valB);
        minDifference = Math.min(minDifference, currentSegments[3] - currentSegments[0]);
      }
    }

    // Check an alternative split for the third segment if it's not adjacent to the second
    // (This condition is outside the 'if(leftBoundIdx)' block to cover cases where leftBoundIdx is 0)
    if (rightBoundIdx - idx > 1) {
      currentSegments = [
        prefixSums[leftBoundIdx],
        prefixSums[idx] - prefixSums[leftBoundIdx],
        prefixSums[rightBoundIdx - 1] - prefixSums[idx],
        prefixSums[arrayLengthMinusOne] - prefixSums[rightBoundIdx - 1]
      ].sort((valA, valB) => valA - valB);
      minDifference = Math.min(minDifference, currentSegments[3] - currentSegments[0]);
    }
  }

  // Output the final minimum difference
  console.log(minDifference);
}

// Function to find the lower bound of a target value in a sorted array segment
function findLowerBound(dataArray, startIndex, endIndex, targetValue) {
  let midIndex;
  // Binary search loop
  for (; 1 < endIndex - startIndex;) {
    midIndex = Math.floor((startIndex + endIndex) / 2); // Calculate middle index
    if (dataArray[midIndex] < targetValue) {
      startIndex = midIndex; // Target is in the right half
    } else {
      endIndex = midIndex; // Target is in the left half or at mid
    }
  }
  // Return the appropriate index based on the final comparison
  return dataArray[startIndex] < targetValue ? endIndex : startIndex;
}

// Read input from stdin and pass it to the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
