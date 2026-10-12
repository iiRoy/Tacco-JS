let rawInputData = "";
let lineIndex = 0;

process.stdin.on("data", (chunk) => {
  rawInputData += chunk;
});

process.stdin.on("end", function () {
  function processRawInputString(inputStr) {
    return inputStr
      .trim()
      .split("\n")
      .map((lineStr) => lineStr.trim());
  }
  rawInputData = processRawInputString(rawInputData);
  executeMainLogic();
});

function readNextLine() {
  return rawInputData[lineIndex++];
}

function calculateComponentSize(currentNodeId, adjMap, visitedTracker) {
  let currentComponentNodeCount = 0;
  visitedTracker[currentNodeId] = true;
  currentComponentNodeCount++;

  const connectedNodes = adjMap[currentNodeId];
  for (let neighborId in connectedNodes) {
    if (!visitedTracker[neighborId]) {
      currentComponentNodeCount += calculateComponentSize(neighborId, adjMap, visitedTracker);
    }
  }
  return currentComponentNodeCount;
}

function executeMainLogic() {
  const initialParams = readNextLine().split(" ");
  let numIndividuals = parseInt(initialParams[0], 10);
  let numRelations = parseInt(initialParams[1], 10);

  const adjacencyMap = {};
  const processedPairs = {};

  for (let i = 0; i < numRelations; i++) {
    const relationParts = readNextLine().split(" ");
    let personA = parseInt(relationParts[0], 10);
    let personB = parseInt(relationParts[1], 10);

    const pairIdentifier = `${personA}-${personB}`;

    if (!processedPairs[pairIdentifier]) {
      processedPairs[pairIdentifier] = true;

      adjacencyMap[personA] = adjacencyMap[personA] || {};
      adjacencyMap[personA][personB] = true;

      adjacencyMap[personB] = adjacencyMap[personB] || {};
      adjacencyMap[personB][personA] = true;
    }
  }

  let largestComponentSize = 0;
  const visitedNodesTracker = {};

  for (let nodeIdStr in adjacencyMap) {
    if (!visitedNodesTracker[nodeIdStr]) {
      largestComponentSize = Math.max(
        largestComponentSize,
        calculateComponentSize(nodeIdStr, adjacencyMap, visitedNodesTracker)
      );
    }
  }
  console.log(largestComponentSize);
}
