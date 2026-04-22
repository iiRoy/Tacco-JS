function calculateAreaFromSegments(segmentCount, segmentLengths) {
  // Organize the array elements in a decreasing sequence
  segmentLengths.sort( function  (  firstLength, secondLength )  {
    if ( firstLength > secondLength ) {
      return -1;
    }
    if ( firstLength < secondLength ) {
      return 1;
    }
    return 0;
  } );

  // Identify two distinct side lengths by finding pairs of identical measurements.
  // The loop terminates once both required dimensions are determined.
  let foundDimensionA = 0;
  let foundDimensionB = 0;

  for ( let currentIdx = 0; currentIdx < segmentLengths.length - 1; currentIdx++ ) {
    // If both bounding dimensions have been successfully established, exit the search
    if (foundDimensionA !== 0 && foundDimensionB !== 0) {
      break;
    }

    // Examine if the current segment's length is identical to the subsequent one
    if ( segmentLengths[currentIdx] === segmentLengths[currentIdx + 1] ) {
      // Assign this repeated length to the first available dimension slot
      if ( foundDimensionA === 0 ) {
        foundDimensionA = segmentLengths[currentIdx];
      }
      else {
        foundDimensionB = segmentLengths[currentIdx];
      }
      // Advance the index past the paired segment, as it has already been processed
      currentIdx++;
    }
  }

  // Compute and return the product of the two identified dimensions.
  // Should any dimension not be found (remaining at its initial value of 0),
  // the resulting area calculation will correctly yield 0.
  return foundDimensionA * foundDimensionB;
}