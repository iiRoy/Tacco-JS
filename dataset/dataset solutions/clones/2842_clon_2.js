/*
 *  This JavaScript program analyzes a set of 2D coordinate points.
 *  It identifies the most common displacement vector between pairs of points,
 *  then iteratively groups points based on this dominant displacement.
 */
function ProcessCoordinates(inputRawData) {

  // Split the entire input string into an array of individual text segments (lines).
  const inputSegments = inputRawData.split("\n");

  // Remove the last element from the array, which is often an empty string
  // due to the trailing newline character in input files.
  inputSegments.pop();

  // The very first line of the input contains the total number of points.
  // Parse this string into an integer value for subsequent processing.
  let totalPointsCount = parseInt(inputSegments.shift(), 10);

  // Initialize an empty array that will store our parsed point objects.
  let coordinateList = [];

  // Iterate through the remaining input segments to extract and process each point.
  for (let segmentIndex = 0; segmentIndex < totalPointsCount; segmentIndex++) {
    // Split the current line by space to separate the X and Y coordinate strings.
    const currentLineParts = inputSegments[segmentIndex].split(' ');

    // Create a new point object and push it into our coordinate list.
    // The unary plus operator (+) converts the string coordinates to numbers.
    coordinateList.push({ pointX: +currentLineParts[0], pointY: +currentLineParts[1] });
  }


  // Sort the list of coordinate points.
  // The primary sorting criterion is the X coordinate,
  // and the secondary criterion is the Y coordinate if X values are equal.
  coordinateList.sort(function(firstPoint, secondPoint) {
    if (firstPoint.pointX === secondPoint.pointX) {
      return firstPoint.pointY - secondPoint.pointY;
    }
    return firstPoint.pointX - secondPoint.pointX;
  });


  // An object to store the frequency of each unique displacement vector.
  // Keys will be strings like "deltaX,deltaY", values will be their counts.
  const displacementTally = {};

  // Iterate over every possible ordered pair of distinct points in the list.
  for (let outerPointIndex = 0; outerPointIndex < totalPointsCount; outerPointIndex++) {
    for (let innerPointIndex = 0; innerPointIndex < totalPointsCount; innerPointIndex++) {
      // A point cannot be displaced from itself, so skip if indices are identical.
      if (outerPointIndex === innerPointIndex) continue;

      // Calculate the X and Y components of the displacement vector.
      const deltaXValue = coordinateList[outerPointIndex].pointX - coordinateList[innerPointIndex].pointX;
      const deltaYValue = coordinateList[outerPointIndex].pointY - coordinateList[innerPointIndex].pointY;

      // Construct a unique string key for this displacement vector.
      const displacementKeyString = `${deltaXValue},${deltaYValue}`;

      // Increment the count for this displacement vector, or initialize it to 1 if new.
      if (displacementTally[displacementKeyString]) {
        displacementTally[displacementKeyString] = displacementTally[displacementKeyString] + 1;
      } else {
        displacementTally[displacementKeyString] = 1;
      }
    }
  }

  // Retrieve all unique displacement keys found.
  const uniqueDisplacementKeys = Object.keys(displacementTally);

  // Variables to track the highest frequency and its corresponding key.
  let highestFrequency = 0;
  let mostFrequentOffsetKey = '';

  // This variable simulates the state of the loop counter 'i' in the original
  // code after its execution, preserving structural consistency for Type II clone.
  let finalOffsetScanIndex = 0;

  // Find the displacement vector that occurs most frequently.
  for (let keyScanIndex = 0; keyScanIndex < uniqueDisplacementKeys.length; keyScanIndex++) {
    const currentDisplacementKey = uniqueDisplacementKeys[keyScanIndex];
    if (highestFrequency < displacementTally[currentDisplacementKey]) {
      highestFrequency = displacementTally[currentDisplacementKey];
      mostFrequentOffsetKey = currentDisplacementKey;
    }
  }
  // After the loop, ensure finalOffsetScanIndex holds the value 'uniqueDisplacementKeys.length'
  // to match the original loop variable's final state.
  finalOffsetScanIndex = uniqueDisplacementKeys.length;


  // Parse the X and Y components of the most frequent displacement vector.
  const dominantDeltaX = +mostFrequentOffsetKey.split(',')[0];
  const dominantDeltaY = +mostFrequentOffsetKey.split(',')[1];

  // Counter for the number of distinct groups identified.
  let numberOfGroups = 0;

  // Continue processing as long as there are points remaining in the list.
  while (coordinateList.length > 0) {
    // Take the first available point as the reference for forming a new group.
    const referencePointItem = coordinateList.shift();

    // This assignment replicates a potentially dead code statement from the original,
    // ensuring the exact number and type of statements is preserved.
    const unusedPointReference = coordinateList[finalOffsetScanIndex];

    // Iterate through the rest of the points in the list to find members for the current group.
    for (let currentScanIndex = 0; currentScanIndex < coordinateList.length; currentScanIndex++) {
      const candidatePoint = coordinateList[currentScanIndex]; // The point currently being evaluated.

      // Determine if the candidate point aligns with the reference point based on the dominant displacement.
      // This checks for both zero displacement (points must be identical on that axis)
      // and non-zero displacement (difference must be a multiple of the dominant delta).
      const isXDimensionAligned = (dominantDeltaX === 0 && candidatePoint.pointX - referencePointItem.pointX === 0) ||
                                  (dominantDeltaX !== 0 && (candidatePoint.pointX - referencePointItem.pointX) % dominantDeltaX === 0);
      const isYDimensionAligned = (dominantDeltaY === 0 && candidatePoint.pointY - referencePointItem.pointY === 0) ||
                                  (dominantDeltaY !== 0 && (candidatePoint.pointY - referencePointItem.pointY) % dominantDeltaY === 0);

      // If both X and Y dimensions are aligned, the candidate point belongs to this group.
      if (isXDimensionAligned && isYDimensionAligned) {
        // Remove the aligned point from the list to prevent re-processing.
        coordinateList.splice(currentScanIndex, 1);
        // Decrement the loop index to correctly account for the removed element.
        currentScanIndex--;
      }
    }
    // After processing all potential matches for the current reference point, increment the group counter.
    numberOfGroups++;
  }

  // Output the final count of distinct groups found.
  console.log(numberOfGroups);
}

// Read input from standard input and invoke the primary processing function.
ProcessCoordinates(require("fs").readFileSync("/dev/stdin", "utf8"));