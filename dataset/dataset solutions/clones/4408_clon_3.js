function determineRectangleSurface(dimensionsCollection) {
  // Input validation: Ensure the provided collection is a proper array
  // and contains enough elements to potentially form a rectangle.
  // A rectangle requires at least two pairs of equal-length segments,
  // meaning a minimum of four segments in total.
  if (!Array.isArray(dimensionsCollection) || dimensionsCollection.length < 4) {
    // If the input is invalid or insufficient, a rectangle cannot be formed.
    return 0;
  }

  // Organize the array of dimensions by sorting them in descending order.
  // This strategy groups identical lengths together, simplifying pair identification.
  dimensionsCollection.sort((firstValue, secondValue) => {
    // A custom comparison function to achieve descending order.
    // Returns -1 if firstValue should come before secondValue (i.e., firstValue is larger),
    // 1 if firstValue should come after secondValue (i.e., firstValue is smaller),
    // and 0 if they are equal (order doesn't matter for equal elements).
    if (firstValue > secondValue) {
      return -1;
    }
    if (firstValue < secondValue) {
      return 1;
    }
    return 0;
  });

  // Initialize an array to store the two unique lengths that will form the rectangle's sides.
  // We need to find two distinct pairs of segments.
  const identifiedSideLengths = [];
  let currentScanIndex = 0; // Pointer to traverse the sorted dimensions array.

  // Loop through the sorted dimensions until two distinct side lengths are found,
  // or until the end of the array is reached (minus one, as we check pairs).
  while (currentScanIndex < dimensionsCollection.length - 1) {
    const segmentOne = dimensionsCollection[currentScanIndex];
    const segmentTwo = dimensionsCollection[currentScanIndex + 1];

    // Check if the current segment and the next segment have identical lengths.
    if (segmentOne === segmentTwo) {
      // If a pair is identified, its length is a potential side of the rectangle.
      identifiedSideLengths.push(segmentOne);
      // Advance the pointer by two positions, as both segments in the pair have been used.
      currentScanIndex += 2;
    } else {
      // If no pair is found with the current segment, move to the next segment.
      currentScanIndex++;
    }

    // If two distinct side lengths have already been identified,
    // there's no need to continue scanning the rest of the array.
    if (identifiedSideLengths.length === 2) {
      // Break out of the loop early as the required dimensions are determined.
      break;
    }
  }

  // After the scan, evaluate whether two valid side lengths were found.
  if (identifiedSideLengths.length === 2) {
    // If two lengths are present, calculate the area by multiplying them.
    // This represents the surface area of the rectangle formed by these two pairs.
    const calculatedArea = identifiedSideLengths[0] * identifiedSideLengths[1];
    return calculatedArea;
  } else {
    // If insufficient pairs were identified (less than two),
    // it implies a rectangle cannot be fully formed from the given dimensions.
    return 0;
  }
}