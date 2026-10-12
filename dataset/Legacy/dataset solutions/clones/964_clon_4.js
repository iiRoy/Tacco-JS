const appConfig = { input: '/dev/stdin', newline: '\n' };

const assert = require('assert');

const fileContent = require('fs').readFileSync(appConfig.input, 'ascii');
const inputLines = fileContent.trim().split(appConfig.newline);

const nodeCount = Number(inputLines.shift());

const nodeRegistry = new Map();
const adjacencyMatrix = new Map();

function establishEdge(graphMap, source, destination, weight) {
  if (!graphMap.has(source)) {
    graphMap.set(source, new Map());
  }
  graphMap.get(source).set(destination, weight);
}

for (const currentLine of inputLines) {
  const parsedSegment = currentLine.split(' ').map(Number);
  const sourceNodeId = parsedSegment[0];

  if (!nodeRegistry.has(sourceNodeId)) {
    nodeRegistry.set(sourceNodeId, {
      identifier: sourceNodeId,
      currentDistance: Number.POSITIVE_INFINITY,
      predecessor: null,
    });
  }

  for (let edgeIdx = 2; edgeIdx < parsedSegment.length; edgeIdx += 2) {
    const targetNodeId = parsedSegment[edgeIdx];
    const edgeWeight = parsedSegment[edgeIdx + 1];

    if (!nodeRegistry.has(targetNodeId)) {
      nodeRegistry.set(targetNodeId, {
        identifier: targetNodeId,
        currentDistance: Number.POSITIVE_INFINITY,
        predecessor: null,
      });
    }
    establishEdge(adjacencyMatrix, sourceNodeId, targetNodeId, edgeWeight);
  }
}

if (nodeRegistry.has(0)) {
  nodeRegistry.get(0).currentDistance = 0;
}

let priorityQueueBuckets = new Map();
let minDistanceKey = Number.POSITIVE_INFINITY;

function placeNodeInQueue(nodeIdentifier, distance) {
  if (!priorityQueueBuckets.has(distance)) {
    priorityQueueBuckets.set(distance, new Set());
  }
  priorityQueueBuckets.get(distance).add(nodeIdentifier);
  minDistanceKey = Math.min(minDistanceKey, distance);
}

function retrieveMinimumNode() {
  while (priorityQueueBuckets.size > 0) {
    while (
      !priorityQueueBuckets.has(minDistanceKey) ||
      priorityQueueBuckets.get(minDistanceKey).size === 0
    ) {
      minDistanceKey++;
      if (minDistanceKey > Number.MAX_SAFE_INTEGER || priorityQueueBuckets.size === 0) {
        return null;
      }
    }

    const extractedId = priorityQueueBuckets.get(minDistanceKey).values().next().value;
    priorityQueueBuckets.get(minDistanceKey).delete(extractedId);

    if (priorityQueueBuckets.get(minDistanceKey).size === 0) {
      priorityQueueBuckets.delete(minDistanceKey);
    }

    return { identifier: extractedId, distanceAtExtraction: minDistanceKey };
  }
  return null;
}

function evaluatePathImprovement(currentVertex, neighborVertex, weightsMap) {
  const pathWeight = weightsMap.get(currentVertex.identifier).get(neighborVertex.identifier);
  if (currentVertex.currentDistance !== Number.POSITIVE_INFINITY &&
      neighborVertex.currentDistance > currentVertex.currentDistance + pathWeight) {
    neighborVertex.currentDistance = currentVertex.currentDistance + pathWeight;
    neighborVertex.predecessor = currentVertex.identifier;
    placeNodeInQueue(neighborVertex.identifier, neighborVertex.currentDistance);
  }
}

function calculateShortestPaths(weightsMap) {
  const startNode = nodeRegistry.get(0);
  if (startNode) {
    placeNodeInQueue(startNode.identifier, startNode.currentDistance);
  }

  while (true) {
    const extractedInfo = retrieveMinimumNode();
    if (extractedInfo === null) {
      break;
    }

    const currentId = extractedInfo.identifier;
    const distFromQueue = extractedInfo.distanceAtExtraction;
    const currentVertex = nodeRegistry.get(currentId);

    if (currentVertex.currentDistance < distFromQueue) {
      continue;
    }

    const neighbors = weightsMap.get(currentId);
    if (neighbors) {
      for (const [neighborId, weight] of neighbors) {
        const neighborVertex = nodeRegistry.get(neighborId);
        if (neighborVertex) {
          evaluatePathImprovement(currentVertex, neighborVertex, weightsMap);
        }
      }
    }
  }
}

calculateShortestPaths(adjacencyMatrix);

for (const [nodeId, nodeDetails] of nodeRegistry) {
  console.log("%s %d", nodeId, nodeDetails.currentDistance);
}
