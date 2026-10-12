var inputBuffer = '', processedInputLines;

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (chunk) {
  inputBuffer += chunk;
});
process.stdin.on('end', function () {
  processedInputLines = inputBuffer.split('\n');
  executeGraphAnalysis(processedInputLines);
});

function parseInitialParameters(lineContent) {
  const parts = lineContent.split(' ');
  const nodeCount = +parts[0];
  const edgeCount = +parts[1];
  const startNode = +parts[2] - 1;
  const firstGoalNode = +parts[3] - 1;
  const secondGoalNode = +parts[4] - 1;
  return {
    numNodes: nodeCount,
    numEdges: edgeCount,
    startNodeIdx: startNode,
    goalNode1Idx: firstGoalNode,
    goalNode2Idx: secondGoalNode
  };
}

function createDistanceMatrix(size) {
  const matrix = new Array(size);
  for (let rowIdx = 0; rowIdx < size; rowIdx++) {
    matrix[rowIdx] = new Array(size);
    for (let colIdx = 0; colIdx < size; colIdx++) {
      matrix[rowIdx][colIdx] = (rowIdx === colIdx) ? 0 : Infinity;
    }
  }
  return matrix;
}

function executeGraphAnalysis(inputData) {
  const params = parseInitialParameters(inputData[0]);
  const numNodes = params.numNodes;
  const numEdges = params.numEdges;
  const startNodeIdx = params.startNodeIdx;
  const goalNode1Idx = params.goalNode1Idx;
  const goalNode2Idx = params.goalNode2Idx;

  const distanceMatrix = createDistanceMatrix(numNodes);

  for (let edgeLineIndex = 1; edgeLineIndex <= numEdges; edgeLineIndex++) {
    const edgeInfo = inputData[edgeLineIndex].split(' ');
    const sourceNode = +edgeInfo[0] - 1;
    const targetNode = +edgeInfo[1] - 1;
    const weight = +edgeInfo[2];
    distanceMatrix[sourceNode][targetNode] = weight;
  }

  for (let intermediateNode = 0; intermediateNode < numNodes; intermediateNode++) {
    for (let sourceNode = 0; sourceNode < numNodes; sourceNode++) {
      for (let targetNode = 0; targetNode < numNodes; targetNode++) {
        const pathThroughIntermediate = distanceMatrix[sourceNode][intermediateNode] + distanceMatrix[intermediateNode][targetNode];
        distanceMatrix[sourceNode][targetNode] = Math.min(distanceMatrix[sourceNode][targetNode], pathThroughIntermediate);
      }
    }
  }

  let minTotalDistance = Infinity;
  for (let currentNode = 0; currentNode < numNodes; currentNode++) {
    const currentPathSum = distanceMatrix[startNodeIdx][currentNode] + distanceMatrix[currentNode][goalNode1Idx] + distanceMatrix[currentNode][goalNode2Idx];
    minTotalDistance = Math.min(minTotalDistance, currentPathSum);
  }

  console.log(minTotalDistance);
}
