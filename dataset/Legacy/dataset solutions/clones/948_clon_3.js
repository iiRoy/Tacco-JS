(function executeGraphTraversal() {
  const fileSystemModule = require('fs');
  const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
  const inputLines = rawInputContent.trim().split('\n');

  const firstLine = inputLines.shift();
  const nodeCount = Number(firstLine);

  const adjacencyStructure = [];
  for (let i = 0; i < nodeCount; i++) {
    adjacencyStructure.push([]);
  }

  inputLines.forEach((currentLine, lineIndex) => {
    const lineParts = currentLine.split(' ');
    const neighborStrings = lineParts.slice(2);
    for (const neighborIndexStr of neighborStrings) {
      const neighborNodeId = Number(neighborIndexStr);
      adjacencyStructure[lineIndex].push(neighborNodeId - 1);
    }
  });

  const discoveryTimes = [];
  const finishTimes = [];

  performDepthFirstSearch(adjacencyStructure, discoveryTimes, finishTimes);

  const outputLines = [];
  for (let i = 0; i < nodeCount; i++) {
    const nodeIdentifier = i + 1;
    const nodeDiscoveryTime = discoveryTimes[i];
    const nodeFinishTime = finishTimes[i];
    outputLines.push(`${nodeIdentifier} ${nodeDiscoveryTime} ${nodeFinishTime}`);
  }
  const outputBuffer = outputLines.join('\n') + '\n';

  process.stdout.write(outputBuffer);
})();

function performDepthFirstSearch(graphAdjacency, discoveryTimestamps, finishTimestamps) {
  const NodeState = {
    UNVISITED: 0,
    VISITING: 1,
    VISITED: 2
  };

  const graphSize = graphAdjacency.length;
  const nodeStates = new Array(graphSize).fill(NodeState.UNVISITED);

  let currentTimeCounter = 0;

  function exploreNode(currentNodeIdx) {
    nodeStates[currentNodeIdx] = NodeState.VISITING;
    currentTimeCounter++;
    discoveryTimestamps[currentNodeIdx] = currentTimeCounter;

    const neighbors = graphAdjacency[currentNodeIdx];
    for (const adjacentNodeIdx of neighbors) {
      if (nodeStates[adjacentNodeIdx] === NodeState.UNVISITED) {
        exploreNode(adjacentNodeIdx);
      }
    }

    nodeStates[currentNodeIdx] = NodeState.VISITED;
    currentTimeCounter++;
    finishTimestamps[currentNodeIdx] = currentTimeCounter;
  }

  for (let i = 0; i < graphSize; i++) {
    if (nodeStates[i] === NodeState.UNVISITED) {
      exploreNode(i);
    }
  }
}
