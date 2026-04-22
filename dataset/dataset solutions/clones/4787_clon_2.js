process.stdin.resume();
process.stdin.setEncoding('utf8');

var incomingData = '';
var parsedLines = [];
var currentLineIndex = 0;

/* Event listener for incoming data chunks */
process.stdin.on('data', function (chunk) {
  incomingData += chunk;
});

/* Event listener for end of input stream */
process.stdin.on('end', function () {
  parsedLines = incomingData.split('\n');
  executeProgram();
});

function getNextLine() {
  return parsedLines[currentLineIndex++];
}

function executeProgram() {
  var dimensions = getNextLine().split(' ');
  var nodeCount = parseInt(dimensions[0]),
    edgeCount = parseInt(dimensions[1]);

  var sourceNodes = [],
    targetNodes = [],
    edgeWeights = [];

  // Loop to read all edge definitions
  for (var edgeIdx = 0; edgeIdx < edgeCount; edgeIdx++) {
    var edgeParts = getNextLine().split(' ');
    var startNode = parseInt(edgeParts[0]) - 1;
    var endNode = parseInt(edgeParts[1]) - 1;
    var weightVal = parseInt(edgeParts[2]);
    sourceNodes.push(startNode);
    targetNodes.push(endNode);
    edgeWeights.push(weightVal);
  }

  var distanceMatrix = [];
  /* Initialize the adjacency matrix for all-pairs shortest path */
  for (var rowIdx = 0; rowIdx < nodeCount; rowIdx++) {
    distanceMatrix[rowIdx] = [];
    for (var colIdx = 0; colIdx < nodeCount; colIdx++) {
      if (rowIdx !== colIdx)
        distanceMatrix[rowIdx].push(1000000000); // Represents infinity
      else
        distanceMatrix[rowIdx].push(0); // Distance to self is zero
    }
  }

  // Populate initial distances from given edges
  for (var currentEdge = 0; currentEdge < edgeCount; currentEdge++) {
    if (distanceMatrix[sourceNodes[currentEdge]][targetNodes[currentEdge]] > edgeWeights[currentEdge])
      distanceMatrix[sourceNodes[currentEdge]][targetNodes[currentEdge]] = edgeWeights[currentEdge];
    if (distanceMatrix[targetNodes[currentEdge]][sourceNodes[currentEdge]] > edgeWeights[currentEdge])
      distanceMatrix[targetNodes[currentEdge]][sourceNodes[currentEdge]] = edgeWeights[currentEdge];
  }

  // Floyd-Warshall algorithm to find all-pairs shortest paths
  for (var intermediateNode = 0; intermediateNode < nodeCount; intermediateNode++) {
    for (var startNodeIdx = 0; startNodeIdx < nodeCount; startNodeIdx++) {
      for (var endNodeIdx = 0; endNodeIdx < nodeCount; endNodeIdx++) {
        if (distanceMatrix[startNodeIdx][endNodeIdx] > distanceMatrix[startNodeIdx][intermediateNode] + distanceMatrix[intermediateNode][endNodeIdx]) {
          distanceMatrix[startNodeIdx][endNodeIdx] = distanceMatrix[startNodeIdx][intermediateNode] + distanceMatrix[intermediateNode][endNodeIdx];
        }
      }
    }
  }

  var redundantEdges = edgeCount;
  // Check for redundant edges
  for (var idx = 0; idx < edgeCount; idx++) {
    var isOptimalPath = false;
    for (var checkNode = 0; checkNode < nodeCount; checkNode++) {
      if (distanceMatrix[checkNode][sourceNodes[idx]] + edgeWeights[idx] === distanceMatrix[checkNode][targetNodes[idx]]) {
        isOptimalPath = true;
        break; // Found one path, so this edge is not redundant for this checkNode
      }
    }
    if (isOptimalPath === true) redundantEdges--;
  }
  console.log(redundantEdges);

  process.exit();
}