const INF_DIST = Infinity;

function extractInitialParameters(lineStr) {
  const parts = lineStr.split(' ');
  const nodeCountVal = +parts[0];
  const edgeCountVal = +parts[1];
  const startNodeIndex = +parts[2] - 1;
  const goal1Index = +parts[3] - 1;
  const goal2Index = +parts[4] - 1;
  return {
    nodeCount: nodeCountVal,
    edgeCount: edgeCountVal,
    startNodeIdx: startNodeIndex,
    goal1Idx: goal1Index,
    goal2Idx: goal2Index
  };
}

function extractEdgeDetails(lineStr) {
  const parts = lineStr.split(' ');
  const fromNodeIndex = +parts[0] - 1;
  const toNodeIndex = +parts[1] - 1;
  const edgeWeightValue = +parts[2];
  return { fromNode: fromNodeIndex, toNode: toNodeIndex, edgeWeight: edgeWeightValue };
}

let accumulatedInputData = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(chunk) {
  accumulatedInputData += chunk;
});

process.stdin.on('end', function() {
  const allInputLines = accumulatedInputData.split('\n');

  const initialGraphParams = extractInitialParameters(allInputLines.shift());

  const nodeCount = initialGraphParams.nodeCount;
  const startNodeIdx = initialGraphParams.startNodeIdx;
  const goal1Idx = initialGraphParams.goal1Idx;
  const goal2Idx = initialGraphParams.goal2Idx;

  const distanceMatrix = Array.from({ length: nodeCount }, (_, rowIdx) =>
    Array.from({ length: nodeCount }, (_, colIdx) =>
      rowIdx === colIdx ? 0 : INF_DIST
    )
  );

  const INPUT_TERMINATOR_LINE = '0 0 0 0 0';

  while (allInputLines.length > 0 && allInputLines[0] !== INPUT_TERMINATOR_LINE) {
    const currentEdgeLine = allInputLines.shift();
    const { fromNode, toNode, edgeWeight } = extractEdgeDetails(currentEdgeLine);
    distanceMatrix[fromNode][toNode] = edgeWeight;
  }

  if (allInputLines.length > 0 && allInputLines[0] === INPUT_TERMINATOR_LINE) {
      allInputLines.shift();
  }

  for (let intermediateNode = 0; intermediateNode < nodeCount; intermediateNode++) {
    for (let sourceNode = 0; sourceNode < nodeCount; sourceNode++) {
      for (let destinationNode = 0; destinationNode < nodeCount; destinationNode++) {
        const pathThroughIntermediate = distanceMatrix[sourceNode][intermediateNode] + distanceMatrix[intermediateNode][destinationNode];
        distanceMatrix[sourceNode][destinationNode] = Math.min(distanceMatrix[sourceNode][destinationNode], pathThroughIntermediate);
      }
    }
  }

  let minimumCombinedDistance = INF_DIST;

  for (let potentialMeetingPoint = 0; potentialMeetingPoint < nodeCount; potentialMeetingPoint++) {
    const currentPathCombination =
      distanceMatrix[startNodeIdx][potentialMeetingPoint] +
      distanceMatrix[potentialMeetingPoint][goal1Idx] +
      distanceMatrix[potentialMeetingPoint][goal2Idx];

    minimumCombinedDistance = Math.min(minimumCombinedDistance, currentPathCombination);
  }

  console.log(minimumCombinedDistance);
});
