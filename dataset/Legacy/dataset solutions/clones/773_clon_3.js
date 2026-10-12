var fs = require('fs');
var inputBufferLength = fs.fstatSync(process.stdin.fd).size;
var dataBuffer = new Buffer(inputBufferLength);
var bytesReadCount = fs.readSync(process.stdin.fd, dataBuffer, 0, inputBufferLength, 0);
var inputLines = dataBuffer.toString('utf8', 0, bytesReadCount).split('\n');

processInputData();

function processInputData() {
  var firstLine = inputLines.shift();
  var initialParameters = firstLine.split(' ');

  var numNodes = parseInt(initialParameters[0], 10);
  var numEdges = parseInt(initialParameters[1], 10);
  var startNodeIndex = parseInt(initialParameters[2], 10) - 1;
  var goal1NodeIndex = parseInt(initialParameters[3], 10) - 1;
  var goal2NodeIndex = parseInt(initialParameters[4], 10) - 1;

  var distanceMatrix = [];
  var rowIterator, colIterator, intermediateIterator;

  // Initialize the distance matrix
  var initialDistanceValue = Infinity;
  for (rowIterator = 0; rowIterator < numNodes; rowIterator++) {
    distanceMatrix[rowIterator] = [];
    for (colIterator = 0; colIterator < numNodes; colIterator++) {
      distanceMatrix[rowIterator][colIterator] = rowIterator === colIterator ? 0 : initialDistanceValue;
    }
  }

  // Populate the distance matrix with direct edge weights
  var edgeLineIterator;
  for (edgeLineIterator = 0; edgeLineIterator < numEdges; edgeLineIterator++) {
    var edgeData = inputLines[edgeLineIterator].split(' ');
    var sourceNode = parseInt(edgeData[0], 10) - 1;
    var destinationNode = parseInt(edgeData[1], 10) - 1;
    var edgeWeight = Number(edgeData[2]);
    distanceMatrix[sourceNode][destinationNode] = edgeWeight;
  }

  // Apply the Floyd-Warshall algorithm
  for (intermediateIterator = 0; intermediateIterator < numNodes; intermediateIterator++) {
    for (rowIterator = 0; rowIterator < numNodes; rowIterator++) {
      for (colIterator = 0; colIterator < numNodes; colIterator++) {
        var currentPathDistance = distanceMatrix[rowIterator][colIterator];
        var pathThroughIntermediate = distanceMatrix[rowIterator][intermediateIterator] + distanceMatrix[intermediateIterator][colIterator];
        distanceMatrix[rowIterator][colIterator] = Math.min(currentPathDistance, pathThroughIntermediate);
      }
    }
  }

  // Calculate the minimum total cost for the specific path S -> K -> G1 + S -> K -> G2
  var minimumTotalCost = Infinity;
  var meetingPointNode;

  for (meetingPointNode = 0; meetingPointNode < numNodes; meetingPointNode++) {
    var pathS_to_K = distanceMatrix[startNodeIndex][meetingPointNode];
    var pathK_to_G1 = distanceMatrix[meetingPointNode][goal1NodeIndex];
    var pathK_to_G2 = distanceMatrix[meetingPointNode][goal2NodeIndex];
    
    var currentCombinedPathCost = pathS_to_K + pathK_to_G1 + pathK_to_G2;
    minimumTotalCost = Math.min(minimumTotalCost, currentCombinedPathCost);
  }

  console.log(minimumTotalCost);
}
