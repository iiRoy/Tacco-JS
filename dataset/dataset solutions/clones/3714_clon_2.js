// This module handles the primary logic for processing a sequence of numbers
// to determine the minimum possible difference between the maximum and minimum
// sums of four distinct segments.
function ProcessInputData(rawInputText) {
  // Initially, the raw input string is split into an array of lines.
  let inputLinesArray = rawInputText.split("\n");

  // The very first line of input provides the total count of numeric items
  // that will be processed. It's parsed as an integer.
  const totalNumericItems = +inputLinesArray[0];

  // The second line contains the space-separated numerical values.
  // These are split, and each string value is converted into a number.
  const originalNumericSequence = inputLinesArray[1]
    .split(" ")
    .map(currentSeqValue => +currentSeqValue);

  // An array is initialized to store the cumulative sums (prefix sums)
  // of the original numeric sequence.
  let cumulativeSumsArray = [];

  // This complex reduce operation efficiently populates the cumulativeSumsArray.
  // It computes prefix sums such that cumulativeSumsArray[k] holds the sum
  // of originalNumericSequence[0] through originalNumericSequence[k].
  // The final accumulated sum (total sum of all elements) is stored at
  // the last index of the cumulativeSumsArray.
  cumulativeSumsArray[totalNumericItems - 1] = originalNumericSequence.reduce(
    (sumAccumulator, currentNumberValue, currentElementIndex) => {
      // Store the sum up to the *previous* element in the cumulative sums array.
      if (currentElementIndex > 0) { // Ensure index is valid
        cumulativeSumsArray[currentElementIndex - 1] = sumAccumulator;
      }
      // Update the accumulator with the current element's value.
      return sumAccumulator + currentNumberValue;
    }
  );
  // A small correction for the first element, as reduce starts accumulator with originalNumericSequence[0]
  // and loop from index 1.
  if (totalNumericItems > 0) {
    cumulativeSumsArray[0] = originalNumericSequence[0];
  }


  // Initialize the variable that will store the smallest difference found
  // between the maximum and minimum segment sums. It's set to a very large
  // number initially.
  let minimalSegmentDifference = Number.POSITIVE_INFINITY;

  // The core logic involves iterating through all possible "midpoint" indices.
  // These midpoints define the boundary between the second and third segments.
  // The loop ensures there are at least two elements both before and after
  // this midpoint, allowing for four non-empty segments.
  for (let midpointIndex = 2; midpointIndex < totalNumericItems - 1; midpointIndex++) {

    // Calculate target sum values for binary searching the optimal
    // first and third split points.
    // targetLeftSum: Aims to split the sum up to (midpointIndex - 1) into two equal halves.
    // targetRightSum: Aims to split the sum from midpointIndex to (totalNumericItems - 1) into two equal halves,
    //                 but calculated relative to the total sum and sum up to (midpointIndex - 1).
    const targetLeftSum = cumulativeSumsArray[midpointIndex - 1] / 2;
    const targetRightSum = (cumulativeSumsArray[totalNumericItems - 1] + cumulativeSumsArray[midpointIndex - 1]) / 2;

    // Utilize a binary search function to find the index for the first split point.
    // This index defines the boundary between the first and second segments.
    // The search range is from index 1 to (midpointIndex - 1).
    const leftBoundaryIndex = locateFirstGreaterOrEqual(cumulativeSumsArray, 1, midpointIndex - 1, targetLeftSum);

    // Similarly, find the index for the third split point.
    // This index defines the boundary between the third and fourth segments.
    // The search range is from (midpointIndex + 1) to (totalNumericItems - 1).
    const rightBoundaryIndex = locateFirstGreaterOrEqual(cumulativeSumsArray, midpointIndex + 1, totalNumericItems - 1, targetRightSum);

    // Calculate the sums of the four segments based on the current
    // midpointIndex and the found leftBoundaryIndex and rightBoundaryIndex.
    // Segment 1: cumulativeSumsArray[leftBoundaryIndex - 1]
    // Segment 2: (cumulativeSumsArray[midpointIndex - 1] - cumulativeSumsArray[leftBoundaryIndex - 1])
    // Segment 3: (cumulativeSumsArray[rightBoundaryIndex - 1] - cumulativeSumsArray[midpointIndex - 1])
    // Segment 4: (cumulativeSumsArray[totalNumericItems - 1] - cumulativeSumsArray[rightBoundaryIndex - 1])
    let fourSegmentValues = [
      cumulativeSumsArray[leftBoundaryIndex - 1],
      cumulativeSumsArray[midpointIndex - 1] - cumulativeSumsArray[leftBoundaryIndex - 1],
      cumulativeSumsArray[rightBoundaryIndex - 1] - cumulativeSumsArray[midpointIndex - 1],
      cumulativeSumsArray[totalNumericItems - 1] - cumulativeSumsArray[rightBoundaryIndex - 1]
    ];

    // Update the overall minimal difference if the current set of segments
    // yields a smaller (MaxSum - MinSum) value.
    minimalSegmentDifference = Math.min(minimalSegmentDifference, Math.max(...fourSegmentValues) - Math.min(...fourSegmentValues));

    // Explore a variation: If the first segment's boundary can be shifted one position to the right.
    if (midpointIndex - leftBoundaryIndex > 1) {
      fourSegmentValues = [
        cumulativeSumsArray[leftBoundaryIndex], // Shifted left segment end
        cumulativeSumsArray[midpointIndex - 1] - cumulativeSumsArray[leftBoundaryIndex],
        cumulativeSumsArray[rightBoundaryIndex - 1] - cumulativeSumsArray[midpointIndex - 1],
        cumulativeSumsArray[totalNumericItems - 1] - cumulativeSumsArray[rightBoundaryIndex - 1]
      ];
      minimalSegmentDifference = Math.min(minimalSegmentDifference, Math.max(...fourSegmentValues) - Math.min(...fourSegmentValues));

      // Further variation: If both the first and third segment boundaries can be shifted.
      if (totalNumericItems - rightBoundaryIndex > 1) {
        fourSegmentValues = [
          cumulativeSumsArray[leftBoundaryIndex],
          cumulativeSumsArray[midpointIndex - 1] - cumulativeSumsArray[leftBoundaryIndex],
          cumulativeSumsArray[rightBoundaryIndex] - cumulativeSumsArray[midpointIndex - 1], // Shifted right segment start
          cumulativeSumsArray[totalNumericItems - 1] - cumulativeSumsArray[rightBoundaryIndex]
        ];
        minimalSegmentDifference = Math.min(minimalSegmentDifference, Math.max(...fourSegmentValues) - Math.min(...fourSegmentValues));
      }
    }

    // Another variation: If only the third segment's boundary can be shifted one position to the right.
    // This condition is evaluated independently of the previous `if` block.
    if (totalNumericItems - rightBoundaryIndex > 1) {
      fourSegmentValues = [
        cumulativeSumsArray[leftBoundaryIndex - 1],
        cumulativeSumsArray[midpointIndex - 1] - cumulativeSumsArray[leftBoundaryIndex - 1],
        cumulativeSumsArray[rightBoundaryIndex] - cumulativeSumsArray[midpointIndex - 1], // Shifted right segment start
        cumulativeSumsArray[totalNumericItems - 1] - cumulativeSumsArray[rightBoundaryIndex]
      ];
      minimalSegmentDifference = Math.min(minimalSegmentDifference, Math.max(...fourSegmentValues) - Math.min(...fourSegmentValues));
    }
  }

  // Print the final calculated minimal difference to the console.
  console.log(minimalSegmentDifference);
}

// This function performs a binary search on a sorted array to find the
// index of the first element that is greater than or equal to a given target value.
// It searches within a specified range [searchStart, searchEnd].
// Returns: The index of the first element satisfying the condition, or searchEnd
//          if all elements in the range are smaller than the target.
function locateFirstGreaterOrEqual(searchableArray, searchStart, searchEnd, desiredValue) {
  let middleIndex;
  // The loop continues as long as there are at least two elements in the search range.
  while (1 < searchEnd - searchStart) {
    // Calculate the middle index using a bitwise OR for efficient integer division.
    middleIndex = 0 | (searchStart + searchEnd) / 2;
    // If the element at the middle index is less than the desired value,
    // it means the target must be in the upper half.
    if (searchableArray[middleIndex] < desiredValue) {
      searchStart = middleIndex;
    }
    // Otherwise, the target could be at or before the middle index.
    else {
      searchEnd = middleIndex;
    }
  }
  // After the loop, `searchStart` and `searchEnd` will be adjacent indices.
  // We check which of these two positions holds the lower bound.
  return searchableArray[searchStart] < desiredValue ? searchEnd : searchStart;
}

// The script reads the entire content from standard input (e.g., from a file or pipe),
// assuming UTF-8 encoding, and then passes this raw text to the main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));