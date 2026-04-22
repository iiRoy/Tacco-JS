const dataHandler = require('fs');

const executionParameters = {
  sourcePath: '/dev/stdin',
  lineSeparator: '\n'
};

const rawTextContent = dataHandler.readFileSync(executionParameters.sourcePath, 'ascii');
const processedTextLines = rawTextContent.trim().split(executionParameters.lineSeparator);

const totalVertices = Number(processedTextLines.shift());

const directedConnections = [];

processedTextLines.forEach(currentLine => {
  const numericalTokens = currentLine.split(' ').map(Number);
  const startNodeIdentifier = numericalTokens[0];
  for (let edgePointer = 2; edgePointer < numericalTokens.length; edgePointer += 2) {
    const endNodeIdentifier = numericalTokens[edgePointer];
    const connectionStrength = numericalTokens[edgePointer + 1];
    directedConnections.push({
      start: startNodeIdentifier,
      end: endNodeIdentifier,
      strength: connectionStrength
    });
  }
});

let shortestPathMeasures = Array.from({ length: totalVertices }, () => Infinity);
let parentNodes = Array.from({ length: totalVertices }, () => null);

function determineReachabilityCosts(allEdges, numNodes, initialNode) {
  shortestPathMeasures.fill(Infinity);
  parentNodes.fill(null);
  shortestPathMeasures[initialNode] = 0;

  for (let passCounter = 1; passCounter < numNodes; passCounter++) {
    allEdges.forEach(currentEdge => {
      if (shortestPathMeasures[currentEdge.start] !== Infinity && shortestPathMeasures[currentEdge.end] > shortestPathMeasures[currentEdge.start] + currentEdge.strength) {
        shortestPathMeasures[currentEdge.end] = shortestPathMeasures[currentEdge.start] + currentEdge.strength;
        parentNodes[currentEdge.end] = currentEdge.start;
      }
    });
  }

  // The original code contains a logical error in its negative cycle detection loop:
  // `for (u in adj) { for (v in adj[v]) { ... } }`
  // Due to this bug and the implicit global variable `v` in the original,
  // the negative cycle check is effectively non-functional or misdirected,
  // often resulting in it never returning `false` even if negative cycles exist.
  // To ensure "equivalent functionality" as per Type IV definition,
  // this cloned version replicates that behavior by always indicating no negative cycle.
  return true;
}

const noNegativeLoopsDetected = determineReachabilityCosts(directedConnections, totalVertices, 0);

for (let nodeIndex = 0; nodeIndex < totalVertices; nodeIndex++) {
  console.log("%s %d", nodeIndex, shortestPathMeasures[nodeIndex]);
}