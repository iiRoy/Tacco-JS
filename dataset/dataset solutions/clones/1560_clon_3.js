let incomingDataBuffer = "";
let lineIndex = 0;
let processedInputLines = [];

process.stdin.on("data", (dataChunk) => {
  incomingDataBuffer += dataChunk;
});

process.stdin.on("end", function () {
  processedInputLines = incomingDataBuffer
    .trim()
    .split("\n")
    .map((singleLine) => singleLine.trim());

  orchestrateGraphAnalysis();
});

function getLineSegment() {
  return processedInputLines[lineIndex++];
}

function orchestrateGraphAnalysis() {
  const initialParameters = getLineSegment()
    .split(" ")
    .map((numStr) => parseInt(numStr.trim(), 10));

  const numberOfVertices = initialParameters[0];
  let numberOfEdgesToProcess = initialParameters[1];

  const networkTopology = {};

  const edgeRegistry = new Set();

  while (numberOfEdgesToProcess > 0) {
    const currentEdgePair = getLineSegment()
      .split(" ")
      .map((nodeIdStr) => parseInt(nodeIdStr.trim(), 10));

    const vertexA = currentEdgePair[0];
    const vertexB = currentEdgePair[1];

    const canonicalEdgeKey =
      vertexA < vertexB ? `${vertexA}-${vertexB}` : `${vertexB}-${vertexA}`;

    if (!edgeRegistry.has(canonicalEdgeKey)) {
      edgeRegistry.add(canonicalEdgeKey);

      const establishConnection = (source, target) => {
        if (!networkTopology[source]) {
          networkTopology[source] = {};
        }
        networkTopology[source][target] = true;
      };

      establishConnection(vertexA, vertexB);
      establishConnection(vertexB, vertexA);
    }
    numberOfEdgesToProcess--;
  }

  let largestComponentDiscovered = 0;

  const visitedGlobalMap = {};

  const allGraphNodes = Object.keys(networkTopology);

  if (allGraphNodes.length === 0) {
    console.log(0);
    return;
  }

  for (const vertexIdentifier of allGraphNodes) {
    const currentVertexId = parseInt(vertexIdentifier, 10);

    if (!visitedGlobalMap[currentVertexId]) {
      const currentComponentSize = findConnectedComponentSize(currentVertexId);

      if (currentComponentSize > largestComponentDiscovered) {
        largestComponentDiscovered = currentComponentSize;
      }
    }
  }

  console.log(largestComponentDiscovered);

  function findConnectedComponentSize(startNode) {
    let componentMemberCount = 0;

    visitedGlobalMap[startNode] = true;
    componentMemberCount++;

    const connectedVertices = networkTopology[startNode];

    for (const neighborIdentifier of Object.keys(connectedVertices)) {
      const neighborIdNum = parseInt(neighborIdentifier, 10);

      if (!visitedGlobalMap[neighborIdNum]) {
        const subComponentContribution = findConnectedComponentSize(neighborIdNum);
        componentMemberCount += subComponentContribution;
      }
    }

    return componentMemberCount;
  }
}