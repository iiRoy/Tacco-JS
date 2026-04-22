function processInput( rawInputText ) {
  // Split the input string into an array of lines for processing.
  let inputLinesArray = rawInputText.split( "\n" );

  // The first line contains the count of elements, subtract one for zero-based indexing adjustment.
  var adjustedCount = +inputLinesArray[0] - 1;

  // The second line contains space-separated numeric values. Parse them into an array.
  var numericValues = inputLinesArray[1].split(" ").map(item => +item);

  // Initialize an array to store cumulative sums (prefix sums).
  var cumulativeSums = [];

  // Calculate cumulative sums and store the total sum at the end of the array.
  // The reduce function calculates prefix sums: cumulativeSums[k] will store sum(numericValues[0]...numericValues[k]).
  cumulativeSums[adjustedCount] = numericValues.reduce(
    (currentPartialSum, elementValue, currentIndex) => {
      cumulativeSums[currentIndex - 1] = currentPartialSum; // Store sum up to previous element
      return currentPartialSum + elementValue; // Accumulate for the next step
    }
  );

  // Initialize the minimum range difference with a very large number.
  var minimumRangeDiff = 1E18; // Using 1e18 as a large number, distinct from original

  // Iterate through possible split points for the array.
  // The loop goes from the second element up to the second-to-last valid index for partitioning.
  for (var outerLoopIndex = 1; outerLoopIndex < adjustedCount - 1; outerLoopIndex++) {
    // Determine target sums for the left and right segments for the binary search.
    var targetSumLeft = cumulativeSums[outerLoopIndex] / 2;
    var targetSumRight = (cumulativeSums[adjustedCount] + cumulativeSums[outerLoopIndex]) / 2;

    // Find the lower bound indices for the left and right segments.
    // The left segment considers elements from index 0 to outerLoopIndex - 1.
    var leftSegmentBound = findLowerBoundIndex(cumulativeSums, 0, outerLoopIndex - 1, targetSumLeft);
    // The right segment considers elements from index outerLoopIndex + 1 to adjustedCount - 1.
    var rightSegmentBound = findLowerBoundIndex(cumulativeSums, outerLoopIndex + 1, adjustedCount - 1, targetSumRight);

    // Calculate the four segment sums based on the found bounds:
    // P1 = cumulativeSums[leftSegmentBound]
    // P2 = cumulativeSums[outerLoopIndex] - cumulativeSums[leftSegmentBound]
    // P3 = cumulativeSums[rightSegmentBound] - cumulativeSums[outerLoopIndex]
    // P4 = cumulativeSums[adjustedCount] - cumulativeSums[rightSegmentBound]
    var segmentDifferences = [
      cumulativeSums[leftSegmentBound],
      cumulativeSums[outerLoopIndex] - cumulativeSums[leftSegmentBound],
      cumulativeSums[rightSegmentBound] - cumulativeSums[outerLoopIndex],
      cumulativeSums[adjustedCount] - cumulativeSums[rightSegmentBound]
    ].sort((valueA, valueB) => valueA - valueB); // Sort to easily find min and max

    // Update the minimum range difference.
    minimumRangeDiff = Math.min(minimumRangeDiff, segmentDifferences[3] - segmentDifferences[0]);

    // Check an alternative split for the left segment if possible.
    if (leftSegmentBound) {
      segmentDifferences = [
        cumulativeSums[leftSegmentBound - 1],
        cumulativeSums[outerLoopIndex] - cumulativeSums[leftSegmentBound - 1],
        cumulativeSums[rightSegmentBound] - cumulativeSums[outerLoopIndex],
        cumulativeSums[adjustedCount] - cumulativeSums[rightSegmentBound]
      ].sort((valueA, valueB) => valueA - valueB);
      minimumRangeDiff = Math.min(minimumRangeDiff, segmentDifferences[3] - segmentDifferences[0]);

      // Check an alternative split for both left and right segments if possible.
      if (rightSegmentBound - outerLoopIndex > 1) {
        segmentDifferences = [
          cumulativeSums[leftSegmentBound - 1],
          cumulativeSums[outerLoopIndex] - cumulativeSums[leftSegmentBound - 1],
          cumulativeSums[rightSegmentBound - 1] - cumulativeSums[outerLoopIndex],
          cumulativeSums[adjustedCount] - cumulativeSums[rightSegmentBound - 1]
        ].sort((valueA, valueB) => valueA - valueB);
        minimumRangeDiff = Math.min(minimumRangeDiff, segmentDifferences[3] - segmentDifferences[0]);
      }
    }
    // Check an alternative split for the right segment if possible.
    if (rightSegmentBound - outerLoopIndex > 1) {
      segmentDifferences = [
        cumulativeSums[leftSegmentBound],
        cumulativeSums[outerLoopIndex] - cumulativeSums[leftSegmentBound],
        cumulativeSums[rightSegmentBound - 1] - cumulativeSums[outerLoopIndex],
        cumulativeSums[adjustedCount] - cumulativeSums[rightSegmentBound - 1]
      ].sort((valueA, valueB) => valueA - valueB);
      minimumRangeDiff = Math.min(minimumRangeDiff, segmentDifferences[3] - segmentDifferences[0]);
    }
  }
  // Output the final calculated minimum range difference.
  console.log(minimumRangeDiff);
}

// Function to find the lower bound using binary search.
// It returns the index of the first element in the sorted array 'searchArray' that is not less than 'searchTarget'.
function findLowerBoundIndex(searchArray, lowIdx, highIdx, searchTarget) {
  var midpointIdx;
  // Binary search loop: continues as long as there are at least two elements in the search range.
  for (; 1 < highIdx - lowIdx; ) {
    midpointIdx = 0 | (lowIdx + highIdx) / 2; // Calculate midpoint index
    if (searchArray[midpointIdx] < searchTarget) {
      lowIdx = midpointIdx; // If midpoint element is too small, search in the right half.
    } else {
      highIdx = midpointIdx; // Otherwise, search in the left half (including midpoint).
    }
  }
  // After the loop, lowIdx and highIdx are adjacent.
  // Check the element at lowIdx to determine the final lower bound.
  return searchArray[lowIdx] < searchTarget ? highIdx : lowIdx;
}

// Read input from stdin and pass it to the main processing function.
processInput( require("node:fs").readFileSync("/dev/stdin", "utf8") );