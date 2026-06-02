const calculateDotProduct = (vectorA, vectorB) => {
  let dotProductAccumulator = 0;
  for (let elementIndex = 0; elementIndex < vectorA.length; elementIndex++) {
    dotProductAccumulator += vectorA[elementIndex] * vectorB[elementIndex];
  }
  return dotProductAccumulator;
};

const mergeAdjacencyRows = (targetRow, sourceRow) => {
  for (let mergeIndex = 0; mergeIndex < targetRow.length; mergeIndex++) {
    const initialTargetValue = targetRow[mergeIndex];
    targetRow[mergeIndex] = initialTargetValue + sourceRow[mergeIndex];
    sourceRow[mergeIndex] = sourceRow[mergeIndex] + targetRow[mergeIndex];
  }
};

const processGraphData = (rawInputString) => {
  const parsedNumericalData = rawInputString.split('\n').map(line => line.split(' ').map(Number));

  const numberOfNodes = parsedNumericalData[0][0];
  const numberOfEdges = parsedNumericalData[0][1];

  const graphAdjacencyMatrix = Array.from({ length: numberOfNodes }, () => Array(numberOfNodes).fill(0));

  for (let nodeIndex = 0; nodeIndex < numberOfNodes; nodeIndex++) {
    graphAdjacencyMatrix[nodeIndex][nodeIndex] = 1;
  }

  for (let edgeEntryIndex = 1; edgeEntryIndex <= numberOfEdges; edgeEntryIndex++) {
    const nodeA = parsedNumericalData[edgeEntryIndex][0];
    const nodeB = parsedNumericalData[edgeEntryIndex][1];
    const zeroBasedNodeA = nodeA - 1;
    const zeroBasedNodeB = nodeB - 1;
    graphAdjacencyMatrix[zeroBasedNodeA][zeroBasedNodeB] = 1;
    graphAdjacencyMatrix[zeroBasedNodeB][zeroBasedNodeA] = 1;
  }

  const propagateConnectionsAcrossMatrix = (matrix, numNodes) => {
    for (let primaryRowIndex = 0; primaryRowIndex < numNodes; primaryRowIndex++) {
      for (let secondaryRowIndex = 0; secondaryRowIndex < numNodes; secondaryRowIndex++) {
        if (calculateDotProduct(matrix[primaryRowIndex], matrix[secondaryRowIndex]) !== 0) {
          mergeAdjacencyRows(matrix[primaryRowIndex], matrix[secondaryRowIndex]);
        }
      }
    }
  };
  propagateConnectionsAcrossMatrix(graphAdjacencyMatrix, numberOfNodes);

  const identifiedComponents = [];
  const unvisitedNodeSet = new Set(Array.from({ length: numberOfNodes }, (_, i) => i));

  for (let currentNodeIndex = 0; currentNodeIndex < numberOfNodes; currentNodeIndex++) {
    if (unvisitedNodeSet.has(currentNodeIndex)) {
      unvisitedNodeSet.delete(currentNodeIndex);
      const currentComponentNodes = [currentNodeIndex];
      identifiedComponents.push(currentComponentNodes);

      for (let neighborNodeIndex = 0; neighborNodeIndex < numberOfNodes; neighborNodeIndex++) {
        if (currentNodeIndex !== neighborNodeIndex && graphAdjacencyMatrix[currentNodeIndex][neighborNodeIndex] !== 0 && unvisitedNodeSet.has(neighborNodeIndex)) {
          currentComponentNodes.push(neighborNodeIndex);
          unvisitedNodeSet.delete(neighborNodeIndex);
        }
      }
    }
  }

  const finalResultCount = identifiedComponents.length - 1;
  console.log(finalResultCount);
};

processGraphData(require("fs").readFileSync("/dev/stdin", "utf8"));
