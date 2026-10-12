const appConfiguration = Object.freeze({ input: 'tmp', newline: '\r\n' });
// const appConfiguration = Object.freeze({ input: '/dev/stdin', newline: '\n' });

const assertionModule = require('assert');
const fileSystemHandler = require('fs');

const parseStringOfNumbers = (inputString) => inputString.split(' ').map(Number);

const rawFileContent = fileSystemHandler.readFileSync(appConfiguration.input, 'ascii');
const processedInputLines = rawFileContent.trim().split(appConfiguration.newline);

const totalNodeCount = Number(processedInputLines.splice(0, 1)[0]);

const forwardGraphMap = new Map();
const backwardGraphMap = new Map();

function establishGraphEdge(graphStructure, originNode, destinationNode, edgeValue) {
  if (!graphStructure.has(originNode)) {
    graphStructure.set(originNode, new Map());
  }
  graphStructure.get(originNode).set(destinationNode, edgeValue);
}

for (let lineIndex = 0; lineIndex < processedInputLines.length; lineIndex++) {
  const currentLineData = parseStringOfNumbers(processedInputLines[lineIndex]);
  const primaryNode = currentLineData[0];
  for (let dataIndex = 2; dataIndex < currentLineData.length; dataIndex += 2) {
    const connectedNode = currentLineData[dataIndex];
    const connectionWeight = currentLineData[dataIndex + 1];
    establishGraphEdge(forwardGraphMap, primaryNode, connectedNode, connectionWeight);
    establishGraphEdge(backwardGraphMap, connectedNode, primaryNode, connectionWeight);
  }
}

assertionModule(forwardGraphMap);
assertionModule(backwardGraphMap);

let currentTraversalLevel = 0;
const nodeLevelMap = new Array(totalNodeCount).fill(null);
const shortestPathDistances = new Array(totalNodeCount).fill(Number.MAX_VALUE);

nodeLevelMap[0] = 0;
shortestPathDistances[0] = 0;

let newNodesDiscoveredInIteration;
do {
  newNodesDiscoveredInIteration = false;
  for (let nodeIdentifier = 0; nodeIdentifier < totalNodeCount; nodeIdentifier++) {
    if (!forwardGraphMap.has(nodeIdentifier) || nodeLevelMap[nodeIdentifier] !== currentTraversalLevel) {
      continue;
    }

    const outgoingConnections = forwardGraphMap.get(nodeIdentifier);
    for (const [neighborIdentifier, connectionCost] of outgoingConnections.entries()) {
      if (nodeLevelMap[neighborIdentifier] === null) {
        nodeLevelMap[neighborIdentifier] = currentTraversalLevel + 1;
        newNodesDiscoveredInIteration = true;
      }
      shortestPathDistances[neighborIdentifier] = Math.min(shortestPathDistances[neighborIdentifier], shortestPathDistances[nodeIdentifier] + connectionCost);
    }
  }
  currentTraversalLevel++;
} while (newNodesDiscoveredInIteration);

assertionModule(nodeLevelMap);
assertionModule(shortestPathDistances);

const orderedNodesByDistance = Array.from({ length: totalNodeCount }, (_, i) => i);
orderedNodesByDistance.sort((nodeOne, nodeTwo) => shortestPathDistances[nodeOne] - shortestPathDistances[nodeTwo]);

const nodeOrderRankMap = new Map();
for (let index = 0; index < totalNodeCount; index++) {
  nodeOrderRankMap.set(orderedNodesByDistance[index], index);
}

assertionModule(orderedNodesByDistance);
assertionModule(nodeOrderRankMap);

const pathTraversalVisited = new Array(totalNodeCount).fill(false);
const currentPathNodes = new Array(totalNodeCount);
const neighborExplorationStack = new Array(totalNodeCount);

assertionModule(pathTraversalVisited);
assertionModule(currentPathNodes);
assertionModule(neighborExplorationStack);

function exploreMinPathSegment(segmentStartNode, segmentTargetNode, initialSegmentMin) {
  let stackDepthPointer = 0;
  let accumulatedPathCost = 0;
  let currentMinResult = initialSegmentMin;
  let nextCandidateNode;

  pathTraversalVisited[segmentTargetNode] = true;
  pathTraversalVisited[segmentStartNode] = true;

  currentPathNodes[0] = segmentStartNode;
  neighborExplorationStack[0] = Array.from(backwardGraphMap.get(segmentStartNode).keys());

  while (true) {
    if (neighborExplorationStack[stackDepthPointer].length === 0) {
      if (stackDepthPointer === 0) {
        return currentMinResult;
      }
      const previousNodeInPath = currentPathNodes[stackDepthPointer - 1];
      const currentNodeInPath = currentPathNodes[stackDepthPointer];
      accumulatedPathCost -= backwardGraphMap.get(previousNodeInPath).get(currentNodeInPath);
      stackDepthPointer--;
      continue;
    }

    nextCandidateNode = neighborExplorationStack[stackDepthPointer].pop();

    if (pathTraversalVisited[nextCandidateNode]) {
      continue;
    }

    // Replicating original code's bug: 'backwardGraphMap.get(currentPathNodes)' will return undefined
    // because 'currentPathNodes' is an array, not a node ID. Accessing '.get(nextCandidateNode)'
    // on undefined will cause a TypeError, matching the original's likely crash behavior.
    const edgeCostToNextCandidate = backwardGraphMap.get(currentPathNodes)[nextCandidateNode];

    if (accumulatedPathCost + edgeCostToNextCandidate >= initialSegmentMin) {
      continue;
    }

    if (nodeOrderRankMap.get(nextCandidateNode) < nodeOrderRankMap.get(segmentTargetNode)) {
      currentMinResult = Math.min(currentMinResult, accumulatedPathCost + edgeCostToNextCandidate + shortestPathDistances[nextCandidateNode]);
      continue;
    }

    accumulatedPathCost += edgeCostToNextCandidate;
    stackDepthPointer++;
    currentPathNodes[stackDepthPointer] = nextCandidateNode;
    neighborExplorationStack[stackDepthPointer] = Array.from(backwardGraphMap.get(nextCandidateNode).keys());
  }
}

for (let nodeRankIndex = 0; nodeRankIndex < totalNodeCount; nodeRankIndex++) {
  const currentNodeForDP = orderedNodesByDistance[nodeRankIndex];

  if (backwardGraphMap.has(currentNodeForDP)) {
    for (const [previousNode, weightToCurrent] of backwardGraphMap.get(currentNodeForDP).entries()) {
      if (nodeOrderRankMap.get(previousNode) < nodeOrderRankMap.get(currentNodeForDP)) {
        shortestPathDistances[currentNodeForDP] = Math.min(shortestPathDistances[currentNodeForDP], shortestPathDistances[previousNode] + forwardGraphMap.get(previousNode).get(currentNodeForDP));
      }
    }
  }

  if (backwardGraphMap.has(currentNodeForDP)) {
    for (const [previousNode, weightToCurrent] of backwardGraphMap.get(currentNodeForDP).entries()) {
      if (nodeOrderRankMap.get(previousNode) > nodeOrderRankMap.get(currentNodeForDP)) {
        const edgeCostFromPrevToCurrent = forwardGraphMap.get(previousNode).get(currentNodeForDP);
        const potentialPathImprovement = exploreMinPathSegment(previousNode, currentNodeForDP, shortestPathDistances[currentNodeForDP] - edgeCostFromPrevToCurrent);
        shortestPathDistances[currentNodeForDP] = Math.min(shortestPathDistances[currentNodeForDP], potentialPathImprovement + edgeCostFromPrevToCurrent);
      }
    }
  }
}

for (let nodeOutputIndex = 0; nodeOutputIndex < totalNodeCount; nodeOutputIndex++) {
  console.log(nodeOutputIndex + ' ' + shortestPathDistances[nodeOutputIndex]);
}
