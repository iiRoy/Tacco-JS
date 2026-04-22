function ProcessInputData(rawDataString) {
  // Split the raw input string into an array of individual lines.
  let inputLines = rawDataString.split("\n");

  // Validate and potentially remove a trailing empty line, which can occur
  // when reading files, especially on Unix-like systems.
  if (inputLines.length > 0 && inputLines[inputLines.length - 1].trim() === '') {
    inputLines.pop();
  }

  // The first line contains the total number of coordinate pairs.
  // Convert it to a number using Number() for explicit type conversion.
  const totalPointCount = Number(inputLines.shift());

  // Initialize a mutable array to store parsed point objects.
  let initialPointCollection = [];

  // Iterate through the remaining lines to parse each coordinate pair.
  for (let pointIndex = 0; pointIndex < totalPointCount; pointIndex++) {
    const lineOfCoords = inputLines[pointIndex];

    // Basic input validation: ensure the line is not empty or undefined.
    if (!lineOfCoords || lineOfCoords.trim() === '') {
      // This is a Type III addition: a guard clause for malformed input.
      console.warn(`Warning: Skipping malformed line at index ${pointIndex}.`);
      continue;
    }

    const coordinateStrings = lineOfCoords.split(' ');
    // Parse x and y values as integers, specifying base 10 for safety.
    const xCoordValue = parseInt(coordinateStrings[0], 10);
    const yCoordValue = parseInt(coordinateStrings[1], 10);

    // Store the coordinates as an object with descriptive keys.
    initialPointCollection.push({
      xValue: xCoordValue,
      yValue: yCoordValue
    });
  }

  // Sort the collection of points. The primary sort key is xValue,
  // and the secondary sort key is yValue for points with identical xValues.
  const orderedPoints = initialPointCollection.sort((pointAlpha, pointBeta) => {
    // If xValues are different, sort by xValue.
    if (pointAlpha.xValue !== pointBeta.xValue) {
      return pointAlpha.xValue - pointBeta.xValue;
    }
    // If xValues are the same, sort by yValue.
    return pointAlpha.yValue - pointBeta.yValue;
  });

  // --- Phase 1: Determine the frequency of all possible displacement vectors ---
  // A dictionary (object) to store counts of each unique displacement vector.
  // The key will be a string like "deltaX,deltaY".
  let displacementVectorFrequencies = {};

  // Iterate through all unique pairs of points to calculate their displacement vectors.
  // This is an O(N^2) operation.
  for (let firstPointIdx = 0; firstPointIdx < totalPointCount; firstPointIdx++) {
    for (let secondPointIdx = 0; secondPointIdx < totalPointCount; secondPointIdx++) {
      // Points must be distinct to form a displacement vector.
      if (firstPointIdx === secondPointIdx) {
        continue;
      }

      const currentPointA = orderedPoints[firstPointIdx];
      const currentPointB = orderedPoints[secondPointIdx];

      // Calculate the difference in x and y coordinates.
      const deltaXComponent = currentPointA.xValue - currentPointB.xValue;
      const deltaYComponent = currentPointA.yValue - currentPointB.yValue;

      // Construct a unique string key for this specific vector.
      const vectorKey = `${deltaXComponent},${deltaYComponent}`;

      // Increment the count for this vector. If it's the first time seeing it, initialize to 1.
      displacementVectorFrequencies[vectorKey] = (displacementVectorFrequencies[vectorKey] || 0) + 1;
    }
  }

  // --- Phase 2: Identify the most frequent displacement vector ---
  let highestFrequencyEncountered = 0;
  let keyOfMostFrequentVector = "0,0"; // Default value, will be updated.

  // Retrieve all unique vector keys from the frequency map.
  const allKnownVectorKeys = Object.keys(displacementVectorFrequencies);

  // Iterate over these keys to find which vector appeared most often.
  for (const currentVectorKey of allKnownVectorKeys) {
    const currentVectorFrequency = displacementVectorFrequencies[currentVectorKey];

    // If the current vector's frequency surpasses the highest recorded, update.
    if (currentVectorFrequency > highestFrequencyEncountered) {
      highestFrequencyEncountered = currentVectorFrequency;
      keyOfMostFrequentVector = currentVectorKey;
    }
  }

  // Parse the components (dx, dy) of the most frequent vector from its string key.
  const [dominantDxString, dominantDyString] = keyOfMostFrequentVector.split(',');
  const dominantDxValue = Number(dominantDxString);
  const dominantDyValue = Number(dominantDyString);

  // --- Phase 3: Count the number of 'sets' of points ---
  // A 'set' is defined by points that are related by integer multiples of the most frequent vector.
  let totalNumberOfDistinctSets = 0;
  // Create a mutable copy of the ordered points to modify during processing.
  let mutablePointsToProcess = [...orderedPoints];

  // Helper function to determine if a difference is a valid multiple of a step.
  // This is a Type III addition for code clarity and modularity.
  const isDifferenceAMultiple = (difference, step) => {
    // If the step is zero, the difference must also be zero for it to be a "multiple".
    // Otherwise, perform a standard modulo check.
    return (step === 0) ? (difference === 0) : (difference % step === 0);
  };

  // Continue as long as there are points remaining to be grouped into sets.
  while (mutablePointsToProcess.length > 0) {
    // Take the first point from the remaining collection as the origin for a new set.
    const currentSetOriginPoint = mutablePointsToProcess.shift();
    // Increment the counter for distinct sets found.
    totalNumberOfDistinctSets++;

    // Iterate through the rest of the points to find others belonging to this set.
    // We use a traditional for loop with manual index management due to `splice` operations.
    for (let pointIterator = 0; pointIterator < mutablePointsToProcess.length; /* pointIterator adjusted manually */ ) {
      const candidatePointForSet = mutablePointsToProcess[pointIterator];

      // Calculate the displacement from the current set origin to the candidate point.
      const xDifferenceFromOrigin = candidatePointForSet.xValue - currentSetOriginPoint.xValue;
      const yDifferenceFromOrigin = candidatePointForSet.yValue - currentSetOriginPoint.yValue;

      // Check if this displacement is an integer multiple of the dominant vector.
      const isXComponentAligned = isDifferenceAMultiple(xDifferenceFromOrigin, dominantDxValue);
      const isYComponentAligned = isDifferenceAMultiple(yDifferenceFromOrigin, dominantDyValue);

      if (isXComponentAligned && isYComponentAligned) {
        // If both components align, this candidate point belongs to the current set.
        // Remove it from the collection of points still to be processed.
        mutablePointsToProcess.splice(pointIterator, 1);
        // Crucially, decrement the iterator because the array has shifted,
        // and the next element is now at the current `pointIterator` position.
      } else {
        // If not aligned, this point does not belong to the current set; move to the next.
        pointIterator++;
      }
    }
  }

  // Output the final calculated number of distinct sets.
  console.log(totalNumberOfDistinctSets);
}

// Standard boilerplate for reading input in competitive programming environments.
// This part is typically kept as-is as it interacts with the execution environment.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));