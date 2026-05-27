const fileSystemModule = require('fs');

const stdinFd = process.stdin.fd;
const fileStats = fileSystemModule.fstatSync(stdinFd);
const fileContentLength = fileStats.size;

const inputBuffer = Buffer.alloc(fileContentLength);
const actualBytesRead = fileSystemModule.readSync(stdinFd, inputBuffer, 0, fileContentLength, 0);
const inputLinesArray = inputBuffer.toString('utf8', 0, actualBytesRead).split('\n');

let maxAllowedJump;
let numPoints;
let currentLineIndex = 0;

function initialize2DArray(rows, cols, initialValue) {
  const newArray = Array.from({ length: rows }, () => Array(cols).fill(initialValue));
  return newArray;
}

function computeShortestPaths(adjacencyGraph, sourceNode) {
  const numGraphNodes = adjacencyGraph.length;
  const distanceValues = new Array(numGraphNodes).fill(Infinity);
  const isVisited = new Array(numGraphNodes).fill(false);

  distanceValues[sourceNode] = 0;

  while (true) {
    let currentNode = -1;
    
    // Find the unvisited node with the smallest distance
    for (let nodeIdx = 0; nodeIdx < numGraphNodes; nodeIdx++) {
      if (!isVisited[nodeIdx] && (currentNode === -1 || distanceValues[currentNode] > distanceValues[nodeIdx])) {
        currentNode = nodeIdx;
      }
    }

    if (currentNode === -1) {
      break; // All reachable nodes visited or no path found
    }

    isVisited[currentNode] = true;

    for (let neighborNode = 0; neighborNode < numGraphNodes; neighborNode++) {
      const pathThroughCurrent = distanceValues[currentNode] + adjacencyGraph[currentNode][neighborNode];
      if (pathThroughCurrent < distanceValues[neighborNode]) {
        distanceValues[neighborNode] = pathThroughCurrent;
      }
    }
  }
  return distanceValues;
}

function determineOverallReachability(maxAllowedJump, numPoints, pointDistances) {
    const graphSize = numPoints + 2;
    const adjacencyGraph = initialize2DArray(graphSize, graphSize, Infinity);

    for (let outerIdx = 0; outerIdx <= numPoints; outerIdx++) {
        for (let jumpOffset = maxAllowedJump - 1; jumpOffset >= 0; jumpOffset--) {
            let currentIntermediatePos = outerIdx + jumpOffset;
            let distanceToAdd = 0;

            // Check if currentIntermediatePos is within the defined bounds of pointDistances array
            if (currentIntermediatePos >= 0 && currentIntermediatePos <= numPoints + 1) {
                distanceToAdd = pointDistances[currentIntermediatePos];
            }
            // If currentIntermediatePos is outside [0, numPoints+1], distanceToAdd remains 0,
            // which correctly reflects the original logic's `(i + j < n + 1 ? d[i + j] : 0)`
            // because d[n+1] is 0 and for indices > n+1, 0 is used.

            let potentialTarget = currentIntermediatePos + distanceToAdd;

            // Ensure target is within graph bounds [0, numPoints + 1]
            const calculatedTargetIndex = Math.min(Math.max(potentialTarget, 0), numPoints + 1);

            if (calculatedTargetIndex !== outerIdx) {
                adjacencyGraph[outerIdx][calculatedTargetIndex] = 1;
            }
        }       
    }

    const initialPathDistances = computeShortestPaths(adjacencyGraph, 0);

    // Guard clause: If the end node is not reachable from the start, return false immediately.
    if (initialPathDistances[numPoints + 1] === Infinity) {
        return false;
    }

    // Verify reachability for all intermediate points
    for (let checkPoint = 1; checkPoint <= numPoints; checkPoint++) {
        if (initialPathDistances[checkPoint] < Infinity) {
            const intermediateDistances = computeShortestPaths(adjacencyGraph, checkPoint);
            if (intermediateDistances[numPoints + 1] === Infinity) {
                return false;
            }
        }
    }
    return true;
}

// Helper function to parse the next integer from the input lines array
const getNextInt = () => parseInt(inputLinesArray[currentLineIndex++], 10);

while ((maxAllowedJump = getNextInt()) !== 0) {
    const pointDistancesArray = [];
    numPoints = getNextInt();
    
    pointDistancesArray[0] = 0;
    pointDistancesArray[numPoints + 1] = 0; // Explicitly set boundary values as per problem definition

    for (let k = 1; k <= numPoints; k++) {
        pointDistancesArray[k] = getNextInt();
    }
    console.log(determineOverallReachability(maxAllowedJump, numPoints, pointDistancesArray) ? 'OK' : 'NG');
}
