const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const lineData = fileContent.split('\n');
let lineIndex = 0;

const getNextNumericValue = () => Number.parseInt(lineData[lineIndex++], 10);

function createAdjacencyList(nodeCount) {
  return Array.from({ length: nodeCount }, () => []);
}

function computeDistancesBFS(graphStructure, initialNode) {
  const pathDistances = Array(graphStructure.length).fill(Infinity);
  const processingQueue = [];

  pathDistances[initialNode] = 0;
  processingQueue.push(initialNode);

  let queueHead = 0;
  while (queueHead < processingQueue.length) {
    const currentNode = processingQueue[queueHead++];
    for (const adjacentNode of graphStructure[currentNode]) {
      if (pathDistances[adjacentNode] === Infinity) {
        pathDistances[adjacentNode] = pathDistances[currentNode] + 1;
        processingQueue.push(adjacentNode);
      }
    }
  }
  return pathDistances;
}

function evaluateConnectivity(jumpLimit, intermediateNodeCount, displacementValues) {
  const totalGraphNodes = intermediateNodeCount + 2;
  const graphRepresentation = createAdjacencyList(totalGraphNodes);

  for (let sourceNode = 0; sourceNode <= intermediateNodeCount; ++sourceNode) {
    for (let jumpMagnitude = 0; jumpMagnitude < jumpLimit; ++jumpMagnitude) {
      const rawDestination = sourceNode + jumpMagnitude + (sourceNode + jumpMagnitude < intermediateNodeCount + 1 ? displacementValues[sourceNode + jumpMagnitude] : 0);
      const clampedDestination = Math.min(Math.max(rawDestination, 0), intermediateNodeCount + 1);
      if (clampedDestination !== sourceNode) {
        graphRepresentation[sourceNode].push(clampedDestination);
      }
    }
  }

  const distancesFromStart = computeDistancesBFS(graphRepresentation, 0);
  if (distancesFromStart[intermediateNodeCount + 1] === Infinity) {
    return false;
  }

  for (let midNode = 1; midNode <= intermediateNodeCount; ++midNode) {
    if (distancesFromStart[midNode] < Infinity) {
      const distancesFromMid = computeDistancesBFS(graphRepresentation, midNode);
      if (distancesFromMid[intermediateNodeCount + 1] === Infinity) {
        return false;
      }
    }
  }
  return true;
}

let currentJumpLimit;
while ((currentJumpLimit = getNextNumericValue()) !== 0) {
  const currentIntermediateNodeCount = getNextNumericValue();
  const currentDisplacementValues = Array(currentIntermediateNodeCount + 2).fill(0);
  for (let k = 1; k <= currentIntermediateNodeCount; ++k) {
    currentDisplacementValues[k] = getNextNumericValue();
  }
  console.log(evaluateConnectivity(currentJumpLimit, currentIntermediateNodeCount, currentDisplacementValues) ? 'OK' : 'NG');
}
