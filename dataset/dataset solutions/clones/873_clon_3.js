var fileSystemModule = require('fs');

function readStdinSync() {
  const stdinFileDescriptor = process.stdin.fd;
  const stdinBufferLength = fileSystemModule.fstatSync(stdinFileDescriptor).size;
  const stdinContentBuffer = Buffer.alloc(stdinBufferLength);
  const actualBytesReadCount = fileSystemModule.readSync(stdinFileDescriptor, stdinContentBuffer, 0, stdinBufferLength, 0);
  return stdinContentBuffer.toString('utf8', 0, actualBytesReadCount).split('\n');
}

var inputLines = readStdinSync();

solveGraphProblem();

function initialize2DArray(rows, cols, initialValue) {
  const newArray = [];
  for (let r = 0; r < rows; r++) {
    newArray[r] = [];
    for (let c = 0; c < cols; c++) {
      newArray[r][c] = initialValue;
    }
  }
  return newArray;
}

function DisjointSetUnion(size) {
  const parentOf = Array(size).fill(-1);

  function findSetRepresentative(elementIndex) {
    if (parentOf[elementIndex] < 0) {
      return elementIndex;
    }
    return parentOf[elementIndex] = findSetRepresentative(parentOf[elementIndex]);
  }

  function uniteComponents(elementX, elementY) {
    let rootX = findSetRepresentative(elementX);
    let rootY = findSetRepresentative(elementY);

    if (rootX !== rootY) {
      if (parentOf[rootX] < parentOf[rootY]) { // Union by size/rank
        parentOf[rootX] += parentOf[rootY];
        parentOf[rootY] = rootX;
      } else {
        parentOf[rootY] += parentOf[rootX];
        parentOf[rootX] = rootY;
      }
      return true; // Components were united
    }
    return false; // Already in the same component
  }

  function countDistinctComponents(activeNodesFlags) {
    let componentCount = 0;
    for (let i = 0; i < size; i++) {
      if (activeNodesFlags[i] && parentOf[i] < 0) {
        componentCount++;
      }
    }
    return componentCount;
  }

  return {
    uniteComponents: uniteComponents,
    findSetRepresentative: findSetRepresentative,
    countDistinctComponents: countDistinctComponents
  };
}

function solveGraphProblem() {
  let currentLineTokens, nodeCount, edgeCount;
  let nodeIdx1, nodeIdx2, edgeIdx;
  let nodeDayInfo, isNodeActive;
  let allEdges, adjMatrix;
  let dsuInstance;
  let minimumSpanningCost;

  while (true) {
    currentLineTokens = inputLines.shift().split(' ');
    nodeCount = parseInt(currentLineTokens[0], 10);
    edgeCount = parseInt(currentLineTokens[1], 10);

    if (nodeCount === 0 && edgeCount === 0) {
      break;
    }

    nodeDayInfo = [];
    isNodeActive = Array(nodeCount).fill(true);

    for (nodeIdx1 = 0; nodeIdx1 < nodeCount; nodeIdx1++) {
      nodeDayInfo[nodeIdx1] = {
        id: nodeIdx1,
        daysToLive: parseInt(inputLines.shift(), 10)
      };
    }

    allEdges = [];
    adjMatrix = initialize2DArray(nodeCount, nodeCount, Infinity);
    for (nodeIdx1 = 0; nodeIdx1 < nodeCount; nodeIdx1++) {
      adjMatrix[nodeIdx1][nodeIdx1] = 0;
    }

    for (edgeIdx = 0; edgeIdx < edgeCount; edgeIdx++) {
      currentLineTokens = inputLines.shift().split(' ');
      const u = parseInt(currentLineTokens[0], 10) - 1;
      const v = parseInt(currentLineTokens[1], 10) - 1;
      const weight = parseInt(currentLineTokens[2], 10);
      allEdges[edgeIdx] = [u, v, weight];
      adjMatrix[u][v] = adjMatrix[v][u] = weight;
    }

    nodeDayInfo.sort((a, b) => a.daysToLive - b.daysToLive);

    dsuInstance = DisjointSetUnion(nodeCount);
    for (nodeIdx1 = 0; nodeIdx1 < nodeCount; nodeIdx1++) {
      for (nodeIdx2 = 0; nodeIdx2 < nodeCount; nodeIdx2++) {
        if (nodeIdx1 !== nodeIdx2 && adjMatrix[nodeIdx1][nodeIdx2] !== Infinity) {
          dsuInstance.uniteComponents(nodeIdx1, nodeIdx2);
        }
      }
    }

    if (dsuInstance.countDistinctComponents(isNodeActive) > 1) {
      console.log(0);
      continue;
    }

    let lastRemovedNodeIndex = -1;
    for (nodeIdx1 = 0; nodeIdx1 < nodeCount; nodeIdx1++) {
      isNodeActive[nodeDayInfo[nodeIdx1].id] = false;

      while (nodeIdx1 < nodeCount - 1 && nodeDayInfo[nodeIdx1].daysToLive === nodeDayInfo[nodeIdx1 + 1].daysToLive) {
        nodeIdx1++;
        isNodeActive[nodeDayInfo[nodeIdx1].id] = false;
      }

      dsuInstance = DisjointSetUnion(nodeCount);
      for (nodeIdx2 = 0; nodeIdx2 < nodeCount; nodeIdx2++) {
        for (let nodeIdx3 = 0; nodeIdx3 < nodeCount; nodeIdx3++) {
          if (isNodeActive[nodeIdx3] && isNodeActive[nodeIdx2] && nodeIdx3 !== nodeIdx2 && adjMatrix[nodeIdx2][nodeIdx3] !== Infinity) {
            dsuInstance.uniteComponents(nodeIdx2, nodeIdx3);
          }
        }
      }

      if (dsuInstance.countDistinctComponents(isNodeActive) > 1) {
        isNodeActive[nodeDayInfo[nodeIdx1].id] = true;
        while (nodeIdx1 > 0 && nodeDayInfo[nodeIdx1].daysToLive === nodeDayInfo[nodeIdx1 - 1].daysToLive) {
          nodeIdx1--;
          isNodeActive[nodeDayInfo[nodeIdx1].id] = true;
        }
        lastRemovedNodeIndex = nodeIdx1;
        break;
      }
    }

    minimumSpanningCost = 0;
    dsuInstance = DisjointSetUnion(nodeCount);
    allEdges.sort((edgeA, edgeB) => edgeA[2] - edgeB[2]);

    for (edgeIdx = 0; edgeIdx < edgeCount; edgeIdx++) {
      const currentEdgeData = allEdges[edgeIdx];
      const u = currentEdgeData[0];
      const v = currentEdgeData[1];
      const weight = currentEdgeData[2];

      if (isNodeActive[u] && isNodeActive[v]) {
        if (dsuInstance.findSetRepresentative(u) !== dsuInstance.findSetRepresentative(v)) {
          dsuInstance.uniteComponents(u, v);
          minimumSpanningCost += weight;
        }
      }
    }

    for (let currentK = lastRemovedNodeIndex - 1; currentK >= 0; currentK--) {
      const nodesToReactivate = [];
      nodesToReactivate.push(nodeDayInfo[currentK].id);
      isNodeActive[nodeDayInfo[currentK].id] = true;

      while (currentK > 0 && nodeDayInfo[currentK].daysToLive === nodeDayInfo[currentK - 1].daysToLive) {
        currentK--;
        nodesToReactivate.push(nodeDayInfo[currentK].id);
        isNodeActive[nodeDayInfo[currentK].id] = true;
      }

      while (nodesToReactivate.length > 0) {
        const processedNodeId = nodesToReactivate.pop(); // This variable is not used in the inner loop, but kept for structural similarity.
        for (edgeIdx = 0; edgeIdx < edgeCount; edgeIdx++) {
          const currentEdgeData = allEdges[edgeIdx];
          const u = currentEdgeData[0];
          const v = currentEdgeData[1];
          const weight = currentEdgeData[2];

          if (isNodeActive[u] && isNodeActive[v]) {
            if (dsuInstance.findSetRepresentative(u) !== dsuInstance.findSetRepresentative(v)) {
              dsuInstance.uniteComponents(u, v);
              minimumSpanningCost += weight;
            }
          }
        }
      }
    }
    console.log(minimumSpanningCost);
  }
}
