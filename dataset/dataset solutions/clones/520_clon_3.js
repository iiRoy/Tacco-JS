let inputBuffer = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(dataSegment) {
  inputBuffer += dataSegment;
});

process.stdin.on('end', function() {
  executeProblemSolver(inputBuffer.split('\n'));
});

function executeProblemSolver (inputLines) {
  let currentMaxJump;
  let numIntermediateNodes;
  let nodeValueArray;
  let lineIndex = 0;

  while (true) {
    currentMaxJump = Number(inputLines[lineIndex++]);
    if (currentMaxJump === 0) {
      break;
    }

    numIntermediateNodes = Number(inputLines[lineIndex++]);
    nodeValueArray = [];
    nodeValueArray[0] = 0; // Start node value
    nodeValueArray[numIntermediateNodes + 1] = 0; // End node value

    for (let k = 1; k <= numIntermediateNodes; k++) {
      nodeValueArray[k] = Number(inputLines[lineIndex++]);
    }

    const result = canReachAllNodes(currentMaxJump, numIntermediateNodes, nodeValueArray);
    console.log(result ? 'OK' : 'NG');
  }
}

function initializeAdjacencyMatrix(graphSize) {
  const adjMatrix = Array.from({ length: graphSize }, () => []);
  for (let rowIdx = 0; rowIdx < graphSize; rowIdx++) {
    for (let colIdx = 0; colIdx < graphSize; colIdx++) {
      adjMatrix[rowIdx][colIdx] = (rowIdx === colIdx) ? 0 : Infinity;
    }
  }
  return adjMatrix;
}

function calculateAllPairsShortestPaths(distMatrix) {
  const matrixDimension = distMatrix.length;
  for (let intermediateNode = 0; intermediateNode < matrixDimension; intermediateNode++) {
    for (let sourceNode = 0; sourceNode < matrixDimension; sourceNode++) {
      for (let destNode = 0; destNode < matrixDimension; destNode++) {
        const pathThroughIntermediate = distMatrix[sourceNode][intermediateNode] + distMatrix[intermediateNode][destNode];
        if (distMatrix[sourceNode][destNode] > pathThroughIntermediate) {
          distMatrix[sourceNode][destNode] = pathThroughIntermediate;
        }
      }
    }
  }
  return distMatrix;
}

function canReachAllNodes(maxAllowedJump, numPoints, pointValues) {
  const totalGraphSize = numPoints + 2;
  const finalNodeIndex = numPoints + 1;
  let graphRepresentation = initializeAdjacencyMatrix(totalGraphSize);

  // Helper function for clamping a value within a range
  const clampValue = (value, minVal, maxVal) => Math.min(Math.max(value, minVal), maxVal);

  for (let currentPoint = 0; currentPoint <= numPoints; currentPoint++) {
    for (let jumpDistance = 1; jumpDistance <= maxAllowedJump; jumpDistance++) {
      const potentialNextPoint = currentPoint + jumpDistance;
      let valueToAddFromPoint = 0;

      // Determine the value to add based on the potential next point
      // If potentialNextPoint is within the bounds of pointValues (0 to finalNodeIndex), use its value.
      // Otherwise, it's effectively 0 (as per original logic where d[n+1] is 0 and beyond is not considered).
      if (potentialNextPoint >= 0 && potentialNextPoint <= finalNodeIndex) {
        valueToAddFromPoint = pointValues[potentialNextPoint];
      }

      let calculatedNextPoint = potentialNextPoint + valueToAddFromPoint;
      calculatedNextPoint = clampValue(calculatedNextPoint, 0, finalNodeIndex);

      if (calculatedNextPoint !== currentPoint) {
        graphRepresentation[currentPoint][calculatedNextPoint] = 1;
      }
    }
  }

  calculateAllPairsShortestPaths(graphRepresentation);

  const startNode = 0;
  for (let checkPoint = 0; checkPoint <= numPoints; checkPoint++) {
    const isReachableFromStart = graphRepresentation[startNode][checkPoint] < Infinity;
    const canReachEndFromCheckPoint = graphRepresentation[checkPoint][finalNodeIndex] < Infinity;

    if (isReachableFromStart && !canReachEndFromCheckPoint) {
      return false;
    }
  }
  return true;
}
