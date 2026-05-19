function ProcessInput(rawData) {
  // This function processes the provided raw input data.
  const inputLines = rawData.split('\n');
  const commandSequence = inputLines[0];
  const targetCoordinatesStr = inputLines[1].split(' ');

  const moveSegments = commandSequence.split('T');

  const finalTarget = [Number(targetCoordinatesStr[0]), Number(targetCoordinatesStr[1])];

  const horizontalSteps = [];
  const verticalSteps = [];

  // Separate movement lengths into horizontal and vertical components.
  for (let idx = 0; idx < moveSegments.length; idx++) {
    if (idx % 2 === 0) {
      horizontalSteps.push(moveSegments[idx].length);
    } else {
      verticalSteps.push(moveSegments[idx].length);
    }
  }

  const possibleXPositions = [];
  const possibleYPositions = [];
  let canReachX = false;
  let canReachY = false;

  // Calculate all possible X positions after each horizontal movement segment.
  xPathFinder: for (let segmentIndex = 0; segmentIndex < horizontalSteps.length; segmentIndex++) {
    possibleXPositions[segmentIndex] = [];
    if (segmentIndex === 0) {
      possibleXPositions[segmentIndex].push(horizontalSteps[segmentIndex]);
      if (horizontalSteps.length === 1 && horizontalSteps[0] === finalTarget[0]) {
        canReachX = true;
      }
    } else if (segmentIndex === horizontalSteps.length - 1) {
      // For the last segment, check if any path leads to the target X coordinate.
      for (let prevPosIndex = 0; prevPosIndex < possibleXPositions[segmentIndex - 1].length; prevPosIndex++) {
        if (possibleXPositions[segmentIndex - 1][prevPosIndex] + horizontalSteps[segmentIndex] === finalTarget[0] ||
            possibleXPositions[segmentIndex - 1][prevPosIndex] - horizontalSteps[segmentIndex] === finalTarget[0]) {
          canReachX = true;
          break xPathFinder; // Exit the outer loop once target is found.
        }
      }
    } else {
      // For intermediate segments, generate new possible positions.
      for (let prevPosIndex = 0; prevPosIndex < possibleXPositions[segmentIndex - 1].length; prevPosIndex++) {
        possibleXPositions[segmentIndex].push(possibleXPositions[segmentIndex - 1][prevPosIndex] + horizontalSteps[segmentIndex]);
        if (horizontalSteps[segmentIndex] !== 0) {
          possibleXPositions[segmentIndex].push(possibleXPositions[segmentIndex - 1][prevPosIndex] - horizontalSteps[segmentIndex]);
        }
      }
    }
  }

  // Calculate all possible Y positions after each vertical movement segment.
  yPathFinder: for (let segmentIndex = 0; segmentIndex < verticalSteps.length; segmentIndex++) {
    possibleYPositions[segmentIndex] = [];
    if (segmentIndex === 0) {
      possibleYPositions[segmentIndex].push(verticalSteps[segmentIndex]);
      if (verticalSteps.length === 1 && verticalSteps[0] === finalTarget[1]) {
        canReachY = true;
      }
    } else if (segmentIndex === verticalSteps.length - 1) {
      // For the last segment, check if any path leads to the target Y coordinate.
      for (let prevPosIndex = 0; prevPosIndex < possibleYPositions[segmentIndex - 1].length; prevPosIndex++) {
        if (possibleYPositions[segmentIndex - 1][prevPosIndex] + verticalSteps[segmentIndex] === finalTarget[1] ||
            possibleYPositions[segmentIndex - 1][prevPosIndex] - verticalSteps[segmentIndex] === finalTarget[0]) { // Original bug preserved: should be finalTarget[1]
          canReachY = true;
          break yPathFinder; // Exit the outer loop once target is found.
        }
      }
    } else {
      // For intermediate segments, generate new possible positions.
      for (let prevPosIndex = 0; prevPosIndex < possibleYPositions[segmentIndex - 1].length; prevPosIndex++) {
        possibleYPositions[segmentIndex].push(possibleYPositions[segmentIndex - 1][prevPosIndex] + verticalSteps[segmentIndex]);
        if (verticalSteps[segmentIndex] !== 0) {
          possibleYPositions[segmentIndex].push(possibleYPositions[segmentIndex - 1][prevPosIndex] - verticalSteps[segmentIndex]);
        }
      }
    }
  }

  // Output the result based on reachability flags.
  if (canReachX && canReachY) {
    console.log('Yes');
  } else {
    console.log('No');
  }
}

// The following line handles standard input/output and invokes the main processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
