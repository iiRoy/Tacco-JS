function sendOutput(dataPayload) {
  console.log(dataPayload);
}

function analyzeConnectivity(sourceText) {
  const lineArray = sourceText.trim().split('\n');

  const [vertexCountStr, edgeCountStr] = lineArray[0].split(' ');
  const totalVertexes = +vertexCountStr;
  const totalConns = +edgeCountStr;

  const adjacencyMatrix = new Map(
    Array.from({ length: totalVertexes }, (_, idx) => [idx + 1, new Set()])
  );

  lineArray.slice(1).forEach(linkDescription => {
    const [alphaVertexStr, betaVertexStr] = linkDescription.split(' ');
    const alphaVertex = +alphaVertexStr;
    const betaVertex = +betaVertexStr;

    adjacencyMatrix.get(alphaVertex).add(betaVertex);
    adjacencyMatrix.get(betaVertex).add(alphaVertex);
  });

  const hasOddDegree = Array.from(adjacencyMatrix.values()).some(
    (connections) => connections.size % 2 !== 0
  );

  if (hasOddDegree) {
    sendOutput("-1");
    return;
  }
}

analyzeConnectivity(require("fs").readFileSync("/dev/stdin", "utf8"));