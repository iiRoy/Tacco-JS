const appSettings = {};

if (process.platform === 'win32') {
  appSettings.lineSeparator = '\r\n';
} else {
  appSettings.lineSeparator = '\n';
}

appSettings.dataPath = 'tmp'; // Local testing input file
// appSettings.dataPath = '/dev/stdin'; // Standard input for Linux environments

const validate = require('assert');
const fileSystem = require('fs');

let totalNodes = 0;
const graphForward = {};
const graphBackward = {};

/**
 * Establishes a directed edge between two nodes in a graph with a given weight.
 * If the target graph object does not exist for the source node, it initializes it.
 * @param {object} targetGraph - The graph object (e.g., graphForward or graphBackward).
 * @param {number} sourceNode - The starting node of the edge.
 * @param {number} destNode - The ending node of the edge.
 * @param {number} weightVal - The weight or cost associated with traversing this edge.
 */
function addEdgeToGraph(targetGraph, sourceNode, destNode, weightVal) {
  if (typeof targetGraph !== 'object' || targetGraph === null) {
    console.error("Error: Invalid graph object provided to addEdgeToGraph.");
    return;
  }
  if (!targetGraph.hasOwnProperty(sourceNode)) {
    targetGraph[sourceNode] = {};
  }
  targetGraph[sourceNode][destNode] = weightVal;
}

try {
  const fileContents = fileSystem.readFileSync(appSettings.dataPath, 'ascii')
    .trim()
    .split(appSettings.lineSeparator);

  totalNodes = parseInt(fileContents.shift(), 10);

  if (isNaN(totalNodes) || totalNodes < 0) {
    console.error("Invalid number of nodes specified in input.");
    process.exit(1);
  }

  for (const entryLine of fileContents) {
    if (!entryLine.trim()) continue;
    const parsedLine = entryLine.split(/\s+/).map(str => parseInt(str, 10));

    if (parsedLine.length < 3 || isNaN(parsedLine[0]) || isNaN(parsedLine[1])) {
      console.warn(`Skipping malformed input line: "${entryLine}"`);
      continue;
    }

    const currentNodeId = parsedLine[0];

    for (let subIndex = 2; subIndex < parsedLine.length; subIndex += 2) {
      const neighborId = parsedLine[subIndex];
      const edgeWeight = parsedLine[subIndex + 1];

      if (isNaN(neighborId) || isNaN(edgeWeight) || subIndex + 1 >= parsedLine.length) {
        console.warn(`Skipping incomplete edge definition in line "${entryLine}" at index ${subIndex}`);
        continue;
      }
      
      addEdgeToGraph(graphForward, currentNodeId, neighborId, edgeWeight);
      addEdgeToGraph(graphBackward, neighborId, currentNodeId, edgeWeight);
    }
  }
} catch (error) {
  console.error(`Failed to read or parse input file: ${error.message}`);
  process.exit(1);
}

validate(graphForward !== null, "Forward graph must be initialized.");
validate(graphBackward !== null, "Backward graph must be initialized.");

let bfsIteration = 0;
const bfsLevels = Array.from({ length: totalNodes }, () => -1);
const shortestPaths = Array.from({ length: totalNodes }, () => Number.MAX_VALUE);

if (totalNodes > 0) {
  bfsLevels[0] = 0;
  shortestPaths[0] = 0;
} else {
  console.warn("No nodes to process. Exiting early.");
  process.exit(0);
}

let nodesDiscoveredInLevel;

while (true) {
  nodesDiscoveredInLevel = false;
  for (let mainIndex = 0; mainIndex < totalNodes; mainIndex++) {
    if (bfsLevels[mainIndex] !== bfsIteration) {
      continue;
    }

    const currentForwardEdges = graphForward[mainIndex];
    if (!currentForwardEdges) {
      continue;
    }

    for (const neighborNodeId in currentForwardEdges) {
      const neighborAsNumber = parseInt(neighborNodeId, 10);
      if (isNaN(neighborAsNumber) || neighborAsNumber < 0 || neighborAsNumber >= totalNodes) {
        console.warn(`Invalid neighbor ID ${neighborNodeId} encountered for node ${mainIndex}. Skipping.`);
        continue;
      }

      if (bfsLevels[neighborAsNumber] === -1) {
        bfsLevels[neighborAsNumber] = bfsIteration + 1;
        nodesDiscoveredInLevel = true;
      }
      
      shortestPaths[neighborAsNumber] = Math.min(
        shortestPaths[neighborAsNumber],
        shortestPaths[mainIndex] + currentForwardEdges[neighborNodeId]
      );
    }
  }

  if (!nodesDiscoveredInLevel) {
    break;
  }
  bfsIteration++;
}

validate(bfsLevels !== null, "BFS levels array must be initialized.");
validate(shortestPaths !== null, "Shortest paths array must be initialized.");

const nodesSortedByShortestPath = Array.from({ length: totalNodes }, (_, index) => index);

function compareNodesByShortestPath(nodeA, nodeB) {
  return shortestPaths[nodeA] - shortestPaths[nodeB];
}

nodesSortedByShortestPath.sort(compareNodesByShortestPath);

const nodeRankInSortedPaths = {};
for (let idx = 0; idx < totalNodes; idx++) {
  nodeRankInSortedPaths[nodesSortedByShortestPath[idx]] = idx;
}

validate(nodesSortedByShortestPath !== null, "Sorted nodes array must be initialized.");
validate(nodeRankInSortedPaths !== null, "Node rank map must be initialized.");

const dfsTraversalFlags = Array.from({ length: totalNodes }, () => false);
const dfsCurrentPath = new Array(totalNodes);
const dfsPendingBranches = new Array(totalNodes);

validate(dfsTraversalFlags !== null, "DFS visited flags must be initialized.");
validate(dfsCurrentPath !== null, "DFS current path stack must be initialized.");
validate(dfsPendingBranches !== null, "DFS pending branches stack must be initialized.");

/**
 * Performs a depth-first search-like traversal to find a minimum path segment.
 * This function simulates a recursive DFS using explicit stacks (dfsCurrentPath, dfsPendingBranches).
 * @param {number} segmentStartNode - The starting node for this path segment.
 * @param {number} targetNode - The node for which we are trying to find a shorter path.
 * @param {number} initialPathEstimate - An initial upper bound for the path cost.
 * @returns {number} The minimum path cost found within this segment traversal.
 */
function explorePathSegment(segmentStartNode, targetNode, initialPathEstimate) {
  let stackDepth = 0;
  let currentAccumulatedCost = 0;
  let segmentMinimum = initialPathEstimate;
  let nextNodeInPath;

  for (let k = 0; k < totalNodes; k++) {
    dfsTraversalFlags[k] = false;
  }

  dfsTraversalFlags[targetNode] = true;
  dfsTraversalFlags[segmentStartNode] = true;
  dfsCurrentPath[0] = segmentStartNode;
  
  const initialNeighbors = graphBackward[segmentStartNode] ? Array.from(Object.keys(graphBackward[segmentStartNode])) : [];
  dfsPendingBranches[0] = initialNeighbors;

  while (true) {
    if (dfsPendingBranches[stackDepth] && dfsPendingBranches[stackDepth].length === 0) {
      if (stackDepth === 0) {
        return segmentMinimum;
      }
      const previousNode = dfsCurrentPath[stackDepth - 1];
      const currentNode = dfsCurrentPath[stackDepth];
      if (graphBackward[previousNode] && graphBackward[previousNode][currentNode]) {
        currentAccumulatedCost -= graphBackward[previousNode][currentNode];
      } else {
        console.warn(`Graph inconsistency: Edge from ${previousNode} to ${currentNode} not found in backward graph.`);
      }
      stackDepth--;
      continue;
    }

    nextNodeInPath = parseInt(dfsPendingBranches[stackDepth].pop(), 10);
    if (isNaN(nextNodeInPath)) continue;

    if (dfsTraversalFlags[nextNodeInPath]) {
      continue;
    }

    const edgeWeightToNext = graphBackward[dfsCurrentPath[stackDepth]][nextNodeInPath];
    if (isNaN(edgeWeightToNext)) {
        console.warn(`Invalid edge weight for path ${dfsCurrentPath[stackDepth]} -> ${nextNodeInPath}. Skipping.`);
        continue;
    }

    if (currentAccumulatedCost + edgeWeightToNext >= segmentMinimum) {
      continue;
    }

    if (nodeRankInSortedPaths[nextNodeInPath] < nodeRankInSortedPaths[targetNode]) {
      segmentMinimum = Math.min(segmentMinimum, currentAccumulatedCost + edgeWeightToNext + shortestPaths[nextNodeInPath]);
      continue;
    }

    currentAccumulatedCost += edgeWeightToNext;
    stackDepth++;
    dfsCurrentPath[stackDepth] = nextNodeInPath;
    dfsTraversalFlags[nextNodeInPath] = true;

    dfsPendingBranches[stackDepth] = graphBackward[nextNodeInPath] ? Array.from(Object.keys(graphBackward[nextNodeInPath])) : [];
  }
}

for (const currentNodeId of nodesSortedByShortestPath) {
  const currentPredecessors = graphBackward[currentNodeId];
  if (!currentPredecessors) {
    continue;
  }

  for (const predecessorNodeIdStr in currentPredecessors) {
    const predecessorNodeId = parseInt(predecessorNodeIdStr, 10);
    if (isNaN(predecessorNodeId) || predecessorNodeId < 0 || predecessorNodeId >= totalNodes) {
      console.warn(`Invalid predecessor ID ${predecessorNodeIdStr} encountered for node ${currentNodeId}. Skipping.`);
      continue;
    }

    if (nodeRankInSortedPaths[predecessorNodeId] < nodeRankInSortedPaths[currentNodeId]) {
      shortestPaths[currentNodeId] = Math.min(
        shortestPaths[currentNodeId],
        shortestPaths[predecessorNodeId] + graphForward[predecessorNodeId][currentNodeId]
      );
    }
  }

  for (const predecessorNodeIdStr in currentPredecessors) {
    const predecessorNodeId = parseInt(predecessorNodeIdStr, 10);
    if (isNaN(predecessorNodeId) || predecessorNodeId < 0 || predecessorNodeId >= totalNodes) {
      continue;
    }

    if (nodeRankInSortedPaths[predecessorNodeId] > nodeRankInSortedPaths[currentNodeId]) {
      const pathFromSourceToPredecessorViaCurrent = explorePathSegment(
        predecessorNodeId,
        currentNodeId,
        shortestPaths[currentNodeId] - graphForward[predecessorNodeId][currentNodeId]
      );
      
      shortestPaths[currentNodeId] = Math.min(
        shortestPaths[currentNodeId],
        pathFromSourceToPredecessorViaCurrent + graphForward[predecessorNodeId][currentNodeId]
      );
    }
  }
}

validate(shortestPaths[0] === 0, "Shortest path from source to itself must be zero.");

console.log("--- Shortest Path Costs from Node 0 ---");
for (let nodeOutputIndex = 0; nodeOutputIndex < totalNodes; nodeOutputIndex++) {
  const pathCost = shortestPaths[nodeOutputIndex] === Number.MAX_VALUE ? "Unreachable" : shortestPaths[nodeOutputIndex];
  console.log(`Node ${nodeOutputIndex}: ${pathCost}`);
}
console.log("---------------------------------------");