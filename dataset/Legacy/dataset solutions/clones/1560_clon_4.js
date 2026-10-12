let inputString = "";
let currentLine = 0;
process.stdin.on("data", (data) => {
  inputString += data;
});
process.stdin.on("end", function () {
  inputString = inputString
    .trim()
    .split("\n")
    .map((str) => str.trim());
  processGraphData();
});
function readLine() {
  return inputString[currentLine++];
}

function processGraphData() {
  let [vertexCount, edgeCount] = readLine()
    .split(" ")
    .map((n) => parseInt(n));

  const adjacencyList = new Map();
  const processedPairs = new Set();

  for (let i = 0; i < edgeCount; i++) {
    let [nodeA, nodeB] = readLine()
      .split(" ")
      .map((n) => parseInt(n));

    const normalizedPairKey = nodeA < nodeB ? `${nodeA}-${nodeB}` : `${nodeB}-${nodeA}`;

    if (!processedPairs.has(normalizedPairKey)) {
      processedPairs.add(normalizedPairKey);

      if (!adjacencyList.has(nodeA)) adjacencyList.set(nodeA, new Set());
      if (!adjacencyList.has(nodeB)) adjacencyList.set(nodeB, new Set());

      adjacencyList.get(nodeA).add(nodeB);
      adjacencyList.get(nodeB).add(nodeA);
    }
  }

  let largestComponentSize = 0;
  const exploredNodes = new Set();

  for (const startVertex of adjacencyList.keys()) {
    if (!exploredNodes.has(startVertex)) {
      const currentComponentSize = traverseComponentBFS(startVertex, adjacencyList, exploredNodes);
      largestComponentSize = Math.max(largestComponentSize, currentComponentSize);
    }
  }
  
  console.log(largestComponentSize);
}

function traverseComponentBFS(startVertex, adjacencyList, exploredNodes) {
  let componentNodeCount = 0;
  const visitQueue = [startVertex];
  exploredNodes.add(startVertex);

  while (visitQueue.length > 0) {
    const currentVertex = visitQueue.shift();
    componentNodeCount++;

    const connectedVertices = adjacencyList.get(currentVertex);
    if (connectedVertices) {
      for (const adjacentVertex of connectedVertices) {
        if (!exploredNodes.has(adjacentVertex)) {
          exploredNodes.add(adjacentVertex);
          visitQueue.push(adjacentVertex);
        }
      }
    }
  }
  return componentNodeCount;
}
