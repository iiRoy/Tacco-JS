const POSITIVE_INFINITY = Infinity;

var fileSystemModule = require('fs');
var fileSize = fileSystemModule.fstatSync(process.stdin.fd).size;
var dataBuffer = Buffer.alloc(fileSize);
var actualBytesRead = fileSystemModule.readSync(process.stdin.fd, dataBuffer, 0, fileSize, 0);
var inputLines = dataBuffer.toString('utf8', 0, actualBytesRead).split('\n');

var maxJumpDistance, numNodes;

const parseNumericLine = (linesArray) => parseInt(linesArray.shift(), 10);

const clampValue = (valueToClamp, minBoundary, maxBoundary) => {
    const clampedMin = Math.max(valueToClamp, minBoundary);
    return Math.min(clampedMin, maxBoundary);
};

function createInitializedGraphMatrix(graphDimension) {
  const newMatrix = [];
  for (let rowIndex = 0; rowIndex < graphDimension; rowIndex++) {
    newMatrix[rowIndex] = [];
    for (let colIndex = 0; colIndex < graphDimension; colIndex++) {
      newMatrix[rowIndex][colIndex] = (rowIndex === colIndex) ? 0 : POSITIVE_INFINITY;
    }
  }
  return newMatrix;
}

function calculateAllPairsShortestPaths(distMatrix) {
  const matrixSize = distMatrix.length;
  for (let intermediateNodeIndex = 0; intermediateNodeIndex < matrixSize; intermediateNodeIndex++) {
    for (let sourceNodeIndex = 0; sourceNodeIndex < matrixSize; sourceNodeIndex++) {
      for (let destNodeIndex = 0; destNodeIndex < matrixSize; destNodeIndex++) {
        const pathThroughIntermediate = distMatrix[sourceNodeIndex][intermediateNodeIndex] + distMatrix[intermediateNodeIndex][destNodeIndex];
        if (distMatrix[sourceNodeIndex][destNodeIndex] > pathThroughIntermediate) {
          distMatrix[sourceNodeIndex][destNodeIndex] = pathThroughIntermediate;
        }
      }
    }
  }
  return distMatrix;
}

function verifyPathExistence(maxJumpDist, totalNodes, nodeOffsetValues) {
    const effectiveGraphSize = totalNodes + 2;
    const finalDestinationNodeIndex = totalNodes + 1;
    let graphAdjacency = createInitializedGraphMatrix(effectiveGraphSize);
    
    for (let currentPoint = 0; currentPoint <= totalNodes; currentPoint++) {
        for (let jumpStep = 0; jumpStep < maxJumpDist; jumpStep++) {
            const potentialIntermediatePoint = currentPoint + jumpStep;
            const offsetAtIntermediate = (potentialIntermediatePoint < finalDestinationNodeIndex) ? nodeOffsetValues[potentialIntermediatePoint] : 0;
            
            let targetPoint = currentPoint + jumpStep + offsetAtIntermediate;

            targetPoint = clampValue(targetPoint, 0, finalDestinationNodeIndex);
            
            if(targetPoint !== currentPoint) {
                graphAdjacency[currentPoint][targetPoint] = 1;
            }
        }       
    }

    calculateAllPairsShortestPaths(graphAdjacency);

    for (let checkNode = 0; checkNode <= totalNodes; checkNode++) {
      const isReachableFromStart = graphAdjacency[0][checkNode] < POSITIVE_INFINITY;
      const canReachFinalDestination = graphAdjacency[checkNode][finalDestinationNodeIndex] < POSITIVE_INFINITY;
      
      if(isReachableFromStart && !canReachFinalDestination) {
        return false;
      }
    }
    return true;
}

while ((maxJumpDistance = parseNumericLine(inputLines)) !== 0) {
    let nodeOffsetArray = [];
    numNodes = parseNumericLine(inputLines);
    
    nodeOffsetArray[0] = 0;
    nodeOffsetArray[numNodes + 1] = 0; 
    
    for (let counter = 1; counter <= numNodes; counter++) {
        nodeOffsetArray[counter] = parseNumericLine(inputLines);
    }
    
    const resultStatus = verifyPathExistence(maxJumpDistance, numNodes, nodeOffsetArray) ? 'OK' : 'NG';
    console.log(resultStatus);
}
