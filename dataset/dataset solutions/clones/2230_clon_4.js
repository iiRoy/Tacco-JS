"use strict";
const obtainData = (function() {
  let sourceLines = [];
  let currentLineIndex = 0;

  const populateSource = (rawInputText) => {
    sourceLines = rawInputText.trim().split("\n");
    currentLineIndex = 0;
  };

  const fetchNextNumber = () => {
    if (currentLineIndex >= sourceLines.length) {
      throw new Error("Input exhaustion.");
    }

    let currentLineData = sourceLines[currentLineIndex];

    if (typeof currentLineData === "string") {
      sourceLines[currentLineIndex] = currentLineData.split(" ").reverse();
      currentLineData = sourceLines[currentLineIndex];
    }

    if (!Array.isArray(currentLineData)) {
        throw new Error("Unexpected line data type.");
    }

    const valueToken = currentLineData.pop();

    if (currentLineData.length === 0) {
      currentLineIndex++;
    }

    return +valueToken;
  };

  return {
    supply: populateSource,
    grabNumerical: fetchNextNumber,
  };
})();

const fabricateMultiArray = (dimensions, initializationValue) => {
  if (dimensions.length === 0) {
    return initializationValue;
  }
  const currentDimensionSize = dimensions[0];
  const remainingDimensions = dimensions.slice(1);
  return Array.from({ length: currentDimensionSize }, () =>
    fabricateMultiArray(remainingDimensions, initializationValue)
  );
};

const discoverRoute = (startNode, endNode, connectionMap) => {
  const traversalQueue = [{ node: startNode, path: [startNode] }];
  const visitedNodes = new Set([startNode]);

  let queueHead = 0;
  while (queueHead < traversalQueue.length) {
    const { node: currentPoint, path: currentPathSegment } = traversalQueue[queueHead++];

    if (currentPoint === endNode) {
      return currentPathSegment;
    }

    for (const adjacentPoint of connectionMap.get(currentPoint) || []) {
      if (!visitedNodes.has(adjacentPoint)) {
        visitedNodes.add(adjacentPoint);
        traversalQueue.push({ node: adjacentPoint, path: currentPathSegment.concat(adjacentPoint) });
      }
    }
  }
  return null;
};

const processInputAndCompute = (dataSource) => {
  const nodeCount = dataSource.grabNumerical();
  const storedEdgePairs = [];
  const nodeConnections = new Map();
  const edgeBitFlags = fabricateMultiArray([nodeCount - 1], 0);

  for (let i = 0; i < nodeCount; i++) {
    nodeConnections.set(i, new Set());
  }

  for (let i = 0; i < nodeCount - 1; i++) {
    const primaryNode = dataSource.grabNumerical() - 1;
    const secondaryNode = dataSource.grabNumerical() - 1;

    const orderedPrimary = Math.min(primaryNode, secondaryNode);
    const orderedSecondary = Math.max(primaryNode, secondaryNode);
    storedEdgePairs.push({ u: orderedPrimary, v: orderedSecondary, edgeIndex: i });

    nodeConnections.get(primaryNode).add(secondaryNode);
    nodeConnections.get(secondaryNode).add(primaryNode);
  }

  const queryCount = dataSource.grabNumerical();

  for (let i = 0; i < queryCount; i++) {
    const queryOrigin = dataSource.grabNumerical() - 1;
    const queryDestination = dataSource.grabNumerical() - 1;
    const currentQueryBit = 1 << i;

    const foundPath = discoverRoute(queryOrigin, queryDestination, nodeConnections);

    if (!foundPath) throw new Error("Path discovery failed for query.");

    for (let j = 1; j < foundPath.length; j++) {
      const point1 = foundPath[j - 1];
      const point2 = foundPath[j];

      const orderedPoint1 = Math.min(point1, point2);
      const orderedPoint2 = Math.max(point1, point2);

      const edgeEntry = storedEdgePairs.find(
        (edge) => edge.u === orderedPoint1 && edge.v === orderedPoint2
      );
      if (!edgeEntry) throw new Error("Edge mapping failed.");

      edgeBitFlags[edgeEntry.edgeIndex] |= currentQueryBit;
    }
  }

  const totalMaskStates = 1 << queryCount;
  let currentAccumulatedWays = fabricateMultiArray([totalMaskStates], 0);
  currentAccumulatedWays[0] = 1;

  const finalAccumulatedWays = Array.from({ length: nodeCount - 1 }, (_, iterationIndex) => iterationIndex)
    .reduce((previousWays, currentEdgeIterationIndex) => {
      const nextWays = fabricateMultiArray([totalMaskStates], 0);
      previousWays.forEach((numWays, currentMaskState) => {
        if (numWays === 0) return;

        const edgeSpecificMask = edgeBitFlags[currentEdgeIterationIndex];

        if (edgeSpecificMask === 0) {
          nextWays[currentMaskState] += numWays * 2; // Exclude or include, mask unchanged
        } else {
          nextWays[currentMaskState] += numWays; // Exclude edge, mask unchanged
          nextWays[currentMaskState | edgeSpecificMask] += numWays; // Include edge, mask updated
        }
      });
      return nextWays;
    }, currentAccumulatedWays);

  return finalAccumulatedWays[totalMaskStates - 1];
};

obtainData.supply(require("fs").readFileSync("/dev/stdin", "utf8"));
const programResult = processInputAndCompute(obtainData);
if (programResult !== undefined) {
  console.log(programResult);
}