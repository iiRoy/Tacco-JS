let receivedData = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(dataFragment) {
  receivedData += dataFragment;
});
process.stdin.on('end', function() {
  processAllCases(receivedData.split('\n'));
});

function processAllCases(dataLines) {
  let traversalLimit, nodeCount;
  let currentIdx;
  while ((traversalLimit = Number(dataLines.shift())) !== 0) {
    let nodeValues = [];
    nodeCount = Number(dataLines.shift());
    nodeValues[0] = 0;
    nodeValues[nodeCount + 1] = 0;
    for (currentIdx = 1; currentIdx <= nodeCount; currentIdx++) {
      nodeValues[currentIdx] = Number(dataLines.shift());
    }
    console.info(determineFeasibility(traversalLimit, nodeCount, nodeValues) ? 'OK' : 'NG');
  }
}

function constructAdjacencyMatrix(size) {
  let rowIdx, colIdx, matrix;
  matrix = [];
  for (rowIdx = 0; rowIdx < size; rowIdx++) {
    matrix[rowIdx] = [];
    for (colIdx = 0; colIdx < size; colIdx++) {
      matrix[rowIdx][colIdx] = rowIdx === colIdx ? 0 : Infinity;
    }
  }
  return matrix;
}

function computeAllPairsShortestPaths(distancesMatrix) {
  let i_vertex, j_vertex, k_intermediate, matrixDimension = distancesMatrix.length;
  for (k_intermediate = 0; k_intermediate < matrixDimension; k_intermediate++) {
    for (i_vertex = 0; i_vertex < matrixDimension; i_vertex++) {
      for (j_vertex = 0; j_vertex < matrixDimension; j_vertex++) {
        distancesMatrix[i_vertex][j_vertex] = Math.min(
          distancesMatrix[i_vertex][j_vertex],
          distancesMatrix[i_vertex][k_intermediate] + distancesMatrix[k_intermediate][j_vertex]
        );
      }
    }
  }
  return distancesMatrix;
}

function determineFeasibility(limitValue, numNodes, nodeData) {
  let graphMatrix = constructAdjacencyMatrix(numNodes + 2);
  let currentSource, currentStep;
  let computedDestination;
  for (currentSource = 0; currentSource <= numNodes; currentSource++) {
    for (currentStep = 1; currentStep <= limitValue; currentStep++) {
      computedDestination = currentSource + currentStep + (
        (currentSource + currentStep < numNodes + 1) ?
        nodeData[currentSource + currentStep] :
        0
      );
      computedDestination = Math.min(
        Math.max(computedDestination, 0),
        numNodes + 1
      );
      if (computedDestination !== currentSource) {
        graphMatrix[currentSource][computedDestination] = 1;
      }
    }
  }
  computeAllPairsShortestPaths(graphMatrix);
  for (currentSource = 0; currentSource <= numNodes; currentSource++) {
    if (graphMatrix[0][currentSource] < Infinity && graphMatrix[currentSource][numNodes + 1] === Infinity) {
      return false;
    }
  }
  return true;
}