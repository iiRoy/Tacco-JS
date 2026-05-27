(function(inputData) {
  const inputLines = inputData.trim().split('\n');
  const nodeCountString = inputLines.shift();
  const nodeCount = parseInt(nodeCountString, 10);

  const adjacencyLists = [];
  const nodeStates = new Array(nodeCount);
  const discoveryTimes = new Array(nodeCount);
  const finishTimes = new Array(nodeCount);

  const STATE_UNVISITED = 'WHITE';
  const STATE_VISITING = 'GRAY';
  const STATE_VISITED = 'BLACK';

  for (let nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++) {
    const currentLine = inputLines[nodeIdx];
    const lineParts = currentLine.split(' ');
    const numericValues = lineParts.map(Number);
    const neighborIdentifiers = numericValues.slice(2);
    adjacencyLists.push(neighborIdentifiers);
    nodeStates[nodeIdx] = STATE_UNVISITED;
  }

  let currentGlobalTime = 0;

  function performDepthFirstSearch(startNodeId) {
    const zeroBasedIndex = startNodeId - 1;

    nodeStates[zeroBasedIndex] = STATE_VISITING;
    currentGlobalTime++;
    discoveryTimes[zeroBasedIndex] = currentGlobalTime;

    const neighbors = adjacencyLists[zeroBasedIndex];
    for (const neighborId of neighbors) {
      const neighborZeroBasedIndex = neighborId - 1;
      if (nodeStates[neighborZeroBasedIndex] === STATE_UNVISITED) {
        performDepthFirstSearch(neighborId);
      }
    }

    nodeStates[zeroBasedIndex] = STATE_VISITED;
    currentGlobalTime++;
    finishTimes[zeroBasedIndex] = currentGlobalTime;
  }

  performDepthFirstSearch(1);

  for (let outputIndex = 0; outputIndex < nodeCount; outputIndex++) {
    const displayNodeId = outputIndex + 1;
    const dTimeValue = discoveryTimes[outputIndex];
    const fTimeValue = finishTimes[outputIndex];
    console.log(`${displayNodeId} ${dTimeValue} ${fTimeValue}`);
  }
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
