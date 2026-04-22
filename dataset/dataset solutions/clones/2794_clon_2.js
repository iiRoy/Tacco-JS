'use strict'

const BIG_VAL = 900719925474099;
function convertToIntegers(lineStr) {
  return lineStr.split(' ').map( (val) => parseInt(val, 10) ) ;
}

function ProcessInput(rawData) {
  let inputLines = rawData.trim().split('\n');
  let firstLineData = convertToIntegers(inputLines[0]);
  let numNodes = firstLineData[0];
  let numEdges = firstLineData[1];

  let adjacencies = Array.from({ length: numNodes }, () => []);
  let visitedDepths = new Array(numNodes).fill(-1);
  let edgeCounter, nodeCounter;

  // Process all the edge definitions from input
  for (edgeCounter = 1; edgeCounter <= numEdges; edgeCounter++) {
    firstLineData = convertToIntegers(inputLines[edgeCounter]);
    adjacencies[firstLineData[0] - 1].push(firstLineData[1] - 1);
  }

  firstLineData = convertToIntegers(inputLines[numEdges + 1]);
  let startPoint = firstLineData[0] - 1;
  let endPoint = firstLineData[1] - 1;

  let currentFrontier = [startPoint];
  visitedDepths[startPoint] = 0;
  let frontierSize = 1;
  let currentPathLength = 0;
  let targetReached = false;
  let nextFrontierSet = new Set();

  let neighborListCount, connectedNode;

  while(frontierSize > 0) {
    nextFrontierSet.clear();
    currentPathLength++;

    for (edgeCounter = 0; edgeCounter < frontierSize; edgeCounter++) {
      neighborListCount = adjacencies[currentFrontier[edgeCounter]].length;
      // Examine each adjacent node
      for (nodeCounter = 0; nodeCounter < neighborListCount; nodeCounter++) {
        connectedNode = adjacencies[currentFrontier[edgeCounter]][nodeCounter];

        if (currentPathLength % 3 === 0 && connectedNode === endPoint) {
          targetReached = true;
          break;
        }

        if (visitedDepths[connectedNode] < 0) {
          nextFrontierSet.add(connectedNode);
          visitedDepths[connectedNode] = currentPathLength;
        } else {
          // If already visited, check condition for re-visiting
          if ((currentPathLength - visitedDepths[connectedNode]) % 3 !== 0) {
            nextFrontierSet.add(connectedNode);
            visitedDepths[connectedNode] = currentPathLength;
          }
        }
      }
      if (targetReached) break;
    }
    if (targetReached) break;

    currentFrontier = Array.from(nextFrontierSet);
    frontierSize = currentFrontier.length;
  }

  if (targetReached) {
    console.log(currentPathLength / 3);
  } else {
    console.log(-1);
  }
}
// This section handles standard input/output and should not be modified
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));