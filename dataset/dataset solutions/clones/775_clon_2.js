var inputBuffer = '', parsedLines;

process.stdin.resume();
process.stdin.setEncoding('utf-8');

process.stdin.on('data', function (dataSegment) {
  inputBuffer += dataSegment;
});

process.stdin.on('end', function () {
  parsedLines = inputBuffer.split('\n');
  processGraphData();
});

function processGraphData() {
  var initialParams = parsedLines[0].split(' ');
  var nodeCount = +initialParams[0];
  var edgeCount = +initialParams[1];
  var startNodeIdx = +initialParams[2] - 1;
  var goalNode1Idx = +initialParams[3] - 1;
  var goalNode2Idx = +initialParams[4] - 1;

  var distanceMatrix = new Array(nodeCount);
  var currentEdgeInfo;
  var rowIdx, colIdx, midIdx;

  for (rowIdx = 0; rowIdx < nodeCount; rowIdx++) {
    distanceMatrix[rowIdx] = new Array(nodeCount);
    for (colIdx = 0; colIdx < nodeCount; colIdx++) {
      distanceMatrix[rowIdx][colIdx] = rowIdx === colIdx ? 0 : Number.POSITIVE_INFINITY;
    }
  }

  rowIdx = 1;
  while (rowIdx <= edgeCount) {
    currentEdgeInfo = parsedLines[rowIdx].split(' ');
    distanceMatrix[+currentEdgeInfo[0] - 1][+currentEdgeInfo[1] - 1] = +currentEdgeInfo[2];
    rowIdx++;
  }

  for (midIdx = 0; midIdx < nodeCount; midIdx++) {
    for (rowIdx = 0; rowIdx < nodeCount; rowIdx++) {
      for (colIdx = 0; colIdx < nodeCount; colIdx++) {
        distanceMatrix[rowIdx][colIdx] = Math.min(distanceMatrix[rowIdx][colIdx], distanceMatrix[rowIdx][midIdx] + distanceMatrix[midIdx][colIdx]);
      }
    }
  }

  var minTotalDistance = Number.POSITIVE_INFINITY;
  for (rowIdx = 0; rowIdx < nodeCount; rowIdx++) {
    minTotalDistance = Math.min(minTotalDistance, distanceMatrix[startNodeIdx][rowIdx] + distanceMatrix[rowIdx][goalNode1Idx] + distanceMatrix[rowIdx][goalNode2Idx]);
  }
  console.log(minTotalDistance);
}
