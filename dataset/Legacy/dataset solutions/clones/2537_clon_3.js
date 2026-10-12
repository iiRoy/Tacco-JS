const parseTwoIntegers = (lineString) => {
  const parts = lineString.split(' ');
  return [parseInt(parts[0], 10), parseInt(parts[1], 10)];
};

const formatCycleOutput = (cyclePath) => {
  const pathWithoutStartNode = cyclePath.slice(1);
  return pathWithoutStartNode.length + "\n" + pathWithoutStartNode.join("\n");
};

function processGraphInput(rawInputData) {
  let inputLines = rawInputData.split("\n");

  if (inputLines[inputLines.length - 1] === '') {
    inputLines.pop();
  }

  const [nodeCount, edgeCount] = parseTwoIntegers(inputLines[0]);

  let graphAdjacencyList = Array.from({ length: nodeCount + 1 }, () => []);

  const numEdgeLines = inputLines.length - 1;
  for (let lineIndex = 1; lineIndex <= numEdgeLines; lineIndex++) {
    const [fromNode, toNode] = parseTwoIntegers(inputLines[lineIndex]);
    graphAdjacencyList[fromNode].push(toNode);
  }

  let activePaths = Array.from({ length: nodeCount }, (_, i) => [i + 1]);

  let nextIterationPaths;
  let foundCycleOutput = '';

  while (activePaths.length > 0) {
    foundCycleOutput = '';
    
    nextIterationPaths = activePaths.flatMap(currentPathSegment => {
      const lastNodeInSegment = currentPathSegment[currentPathSegment.length - 1];
      const possibleNextNodes = graphAdjacencyList[lastNodeInSegment];
      return possibleNextNodes.map(nextNodeId => currentPathSegment.concat([nextNodeId]));
    });

    activePaths = nextIterationPaths;

    for (const pathCandidate of activePaths) {
      const pathStartNode = pathCandidate[0];
      const pathEndNode = pathCandidate[pathCandidate.length - 1];

      if (pathEndNode === pathStartNode) {
        foundCycleOutput = formatCycleOutput(pathCandidate);
        break;
      }
    }

    if (foundCycleOutput !== '') {
      console.log(foundCycleOutput);
      return;
    }
  }

  const NO_CYCLE_RESULT = -1;
  console.log(NO_CYCLE_RESULT);
}

processGraphInput(require("fs").readFileSync("/dev/stdin", "utf8"));
