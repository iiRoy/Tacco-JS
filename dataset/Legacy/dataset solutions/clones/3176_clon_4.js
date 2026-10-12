function calculateMinimumCost(targetX, targetY, targetZ, segments, segmentCount) {
  let minimumOverallCost = Infinity;
  const totalCombinations = Math.pow(4, segmentCount);

  for (let combinationIndex = 0; combinationIndex < totalCombinations; combinationIndex++) {
    let currentX = 0;
    let currentY = 0;
    let currentZ = 0;
    let segmentAssignmentCost = 0;

    for (let segmentIndex = 0; segmentIndex < segmentCount; segmentIndex++) {
      const currentSegmentLength = segments[segmentIndex];
      const assignmentChoice = (combinationIndex >> (2 * segmentIndex)) & 3;

      switch (assignmentChoice) {
        case 1:
          currentX += currentSegmentLength;
          segmentAssignmentCost += 10;
          break;
        case 2:
          currentY += currentSegmentLength;
          segmentAssignmentCost += 10;
          break;
        case 3:
          currentZ += currentSegmentLength;
          segmentAssignmentCost += 10;
          break;
      }
    }

    const finalCombinationCost = segmentAssignmentCost +
                                 Math.abs(targetX - currentX) +
                                 Math.abs(targetY - currentY) +
                                 Math.abs(targetZ - currentZ);

    minimumOverallCost = Math.min(minimumOverallCost, finalCombinationCost);
  }

  return minimumOverallCost;
}

function processInputAndOutput(inputData) {
  const dataLines = inputData.split('\n');
  const firstLineParts = dataLines[0].split(' ').map(val => parseInt(val, 10));

  const pieceCount = firstLineParts[0];
  const targetX = firstLineParts[1];
  const targetY = firstLineParts[2];
  const targetZ = firstLineParts[3];

  const segmentLengths = dataLines.slice(1, 1 + pieceCount).map(val => parseInt(val, 10));

  const initialResult = calculateMinimumCost(targetX, targetY, targetZ, segmentLengths, pieceCount);
  console.log(initialResult - 30);
}

processInputAndOutput(require('fs').readFileSync('/dev/stdin', 'utf8'));
