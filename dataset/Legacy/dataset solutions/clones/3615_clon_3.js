const parseLineOfNumbers = (lineString) => lineString.split(" ").map(Number);

const findUpperBoundIndex = (sortedArr, startIndex, endIndex, targetValue) => {
  let currentLow = startIndex;
  let currentHigh = endIndex;

  while (1 < currentHigh - currentLow) {
    const midPoint = (currentLow + currentHigh) / 2 | 0;
    if (sortedArr[midPoint] <= targetValue) {
      currentLow = midPoint;
    } else {
      currentHigh = midPoint;
    }
  }

  return sortedArr[currentLow] <= targetValue ? currentHigh : currentLow;
};

const processInputData = (inputStr) => {
  const lines = inputStr.split("\n");

  const initialConfigLine = parseLineOfNumbers(lines[0]);
  const N_nodes = initialConfigLine[0];
  const M_edges = initialConfigLine[1];
  const Q_queries = initialConfigLine[2];

  const createAdjacencyList = (size) => Array.from({ length: size + 1 }, () => []);
  const adjList = createAdjacencyList(N_nodes);

  for (let edgeIndex = 0; edgeIndex < M_edges; edgeIndex++) {
    const edgeData = parseLineOfNumbers(lines[edgeIndex + 1]);
    const sourceNode = edgeData[0];
    const targetNode = edgeData[1];
    adjList[sourceNode].push(targetNode);
  }

  for (let nodeIndex = 1; nodeIndex <= N_nodes; nodeIndex++) {
    adjList[nodeIndex].sort((valA, valB) => valA - valB);
  }

  const executeQuery = (queryLineIndex) => {
    const queryRange = parseLineOfNumbers(lines[queryLineIndex]);
    const queryStartNode = queryRange[0];
    const queryEndNode = queryRange[1];
    let currentCount = 0;

    for (let currentNode = queryStartNode; currentNode <= queryEndNode; currentNode++) {
      const nodeConnections = adjList[currentNode];
      currentCount += findUpperBoundIndex(nodeConnections, 0, nodeConnections.length, queryEndNode);
    }
    return currentCount;
  };

  const queryResults = [];
  for (let queryIndex = 0; queryIndex < Q_queries; queryIndex++) {
    const queryLineOffset = M_edges + 1;
    queryResults[queryIndex] = executeQuery(queryIndex + queryLineOffset);
  }

  console.log(queryResults.join("\n"));
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
