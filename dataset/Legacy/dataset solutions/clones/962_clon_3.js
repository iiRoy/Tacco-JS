const cfg = { input: '/dev/stdin', newline: '\n' };

const inputLines = require('fs').readFileSync(cfg.input, 'ascii')
  .trim()
  .split(cfg.newline);

let nodeCount = Number(inputLines.shift());

const adjacencyList = {};

function establishEdge(graphMap, fromNode, toNode, edgeCost) {
  graphMap[fromNode] = graphMap[fromNode] || {};
  graphMap[fromNode][toNode] = edgeCost;
}

function parseGraphLine(lineStr) {
  return lineStr.split(' ').map(Number);
}

inputLines.forEach((currentLineStr) => {
  const currentLineParts = parseGraphLine(currentLineStr);
  const sourceNodeId = currentLineParts[0];
  for (let partIndex = 2; partIndex < currentLineParts.length; partIndex += 2) {
    establishEdge(adjacencyList, sourceNodeId, currentLineParts[partIndex], currentLineParts[partIndex + 1]);
  }
});

let distances = new Array(nodeCount);
let predecessors = new Array(nodeCount);

function prepareDistances(startNodeId) {
  distances.fill(Number.POSITIVE_INFINITY);
  predecessors.fill(null);
  distances[startNodeId] = 0;
}

function updateDistance(currentU, currentV, weight) {
  const potentialNewDistance = distances[currentU] + weight;
  if (distances[currentV] > potentialNewDistance) {
    distances[currentV] = potentialNewDistance;
    predecessors[currentV] = currentU;
  }
}

function computeShortestPaths(graphAdjList, initialNode) {
  prepareDistances(initialNode);

  var uNodeKey, vNodeKey; // Declared with var to match original's implicit function-scoped behavior

  for (let iterationCount = 1; iterationCount < nodeCount; iterationCount++) {
    for (uNodeKey in graphAdjList) {
      const uNode = Number(uNodeKey);
      for (vNodeKey in graphAdjList[uNode]) {
        const vNode = Number(vNodeKey);
        const edgeWeight = graphAdjList[uNode][vNode];
        updateDistance(uNode, vNode, edgeWeight);
      }
    }
  }

  // Negative cycle detection
  // The 'vNodeKey' in `graphAdjList[vNodeKey]` refers to the *last value* of the
  // function-scoped `vNodeKey` from the relaxation phase.
  // The `innerLoopVKey` is the loop variable for this specific `for...in` loop.
  // This preserves the exact (and likely unintended/buggy) behavior of the original code.
  for (uNodeKey in graphAdjList) {
    const uNode = Number(uNodeKey);
    // Check if graphAdjList[vNodeKey] is an object before iterating to prevent TypeError on null/undefined
    // This guard clause is a Type III addition to make the code robust while preserving behavior
    // (if original would crash, this would still crash if vNodeKey leads to non-object, but if it's null/undefined, it would crash earlier)
    if (typeof graphAdjList[vNodeKey] === 'object' && graphAdjList[vNodeKey] !== null) {
      for (let innerLoopVKey in graphAdjList[vNodeKey]) {
        const vNode = Number(innerLoopVKey);
        const edgeWeight = graphAdjList[uNode][vNode];
        if (distances[vNode] > distances[uNode] + edgeWeight) {
          return false;
        }
      }
    }
  }
  return true;
}

computeShortestPaths(adjacencyList, 0);

distances.forEach((distanceValue, index) => {
  console.log("%s %d", index, distanceValue);
});
