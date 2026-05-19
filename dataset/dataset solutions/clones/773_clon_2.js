/*
 * This script processes graph data from standard input.
 * It calculates shortest paths using the Floyd-Warshall algorithm
 * to find a specific minimum path cost.
 */
var fileSys = require('fs'),
    dataLen = fileSys.fstatSync(process.stdin.fd).size,
    dataBuf = new Buffer(dataLen),
    readBytes = fileSys.readSync(process.stdin.fd, dataBuf, 0, dataLen, 0),
    rawInputLines = dataBuf.toString('utf8', 0, readBytes).split('\n');

processGraphData();

function processGraphData() {
  // Extract initial graph parameters from the first line of input
  var tmpArr = rawInputLines.shift().split(' ');
  var nodeCount = +tmpArr[0]; // Total number of vertices
  var edgeCount = +tmpArr[1]; // Total number of edges
  var startNode = +tmpArr[2] - 1; // Starting vertex (0-indexed)
  var goal1 = +tmpArr[3] - 1; // First destination vertex (0-indexed)
  var goal2 = +tmpArr[4] - 1; // Second destination vertex (0-indexed)

  // Initialize the distance matrix for all-pairs shortest path
  var distMatrix = [];
  var iterA, iterB, iterC; // Loop variables for matrix traversal

  for (iterA = 0; iterA < nodeCount; iterA++) {
    distMatrix[iterA] = [];
    for (iterB = 0; iterB < nodeCount; iterB++) {
      distMatrix[iterA][iterB] = (iterA === iterB) ? 0 : Infinity;
    }
  }

  // Populate the distance matrix with direct edge weights
  for (iterA = 0; iterA < edgeCount; iterA++) {
    tmpArr = rawInputLines[iterA].split(' ');
    distMatrix[+tmpArr[0] - 1][+tmpArr[1] - 1] = +tmpArr[2];
  }

//  while (edgeCount/*rawInputLines[0] !== '0 0 0 0 0'*/) {
//    tmpArr = rawInputLines.shift().split(' ');
//    distMatrix[tmpArr[0] - 1][tmpArr[1] - 1] = +tmpArr[2];
//  }

  // Execute the Floyd-Warshall algorithm to find all-pairs shortest paths
  for (iterC = 0; iterC < nodeCount; iterC++) { // Intermediate vertex
    for (iterA = 0; iterA < nodeCount; iterA++) { // Source vertex
      for (iterB = 0; iterB < nodeCount; iterB++) { // Destination vertex
        distMatrix[iterA][iterB] = Math.min(distMatrix[iterA][iterB], distMatrix[iterA][iterC] + distMatrix[iterC][iterB]);
      }
    }
  }

//  console.log(distMatrix);

  // Calculate the minimum cost to travel from startNode to an intermediate node (iterC),
  // then from iterC to goal1, and from iterC to goal2.
  var minPathCost = Infinity;
  for (iterC = 0; iterC < nodeCount; iterC++) {
    minPathCost = Math.min(minPathCost, distMatrix[startNode][iterC] + distMatrix[iterC][goal1] + distMatrix[iterC][goal2]);
  }

  // Output the final computed minimum path cost
  console.log(minPathCost);
}
