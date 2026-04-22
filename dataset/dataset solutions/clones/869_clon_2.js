var fileSystemHandler = require('fs')
  , standardInputFileDescriptor = process.stdin.fd
  , fileSizeInBytes = fileSystemHandler.fstatSync(standardInputFileDescriptor).size
  , inputDataBuffer = new Buffer(fileSizeInBytes)
  , totalBytesRead = fileSystemHandler.readSync(standardInputFileDescriptor, inputDataBuffer, 0, fileSizeInBytes, 0)
  , dataLinesArray = inputDataBuffer.toString('utf8', 0, totalBytesRead).split('\n');

// Initiate the primary graph processing function.
processWeightedGraph();

/**
 * Main function to process graph data and compute longest path.
 */
function processWeightedGraph() {

  // Parse the first line to get graph dimensions.
  var currentLineTokens = dataLinesArray.shift().split(' ')
    , nodeCount = +currentLineTokens[0]
    , edgeCount = +currentLineTokens[1]
    , connectionMap = []
    , distanceValues = []
    , loopIndexA, loopIndexB;

  // Initialize graph adjacency list and distance array.
  for (loopIndexA = 0; loopIndexA < nodeCount; loopIndexA++) {
    connectionMap[loopIndexA] = [];
    distanceValues[loopIndexA] = 0;
  }

  // Populate the graph with edges and their weights.
  for (loopIndexA = 0; loopIndexA < edgeCount; loopIndexA++) {
    currentLineTokens = dataLinesArray[loopIndexA].split(' ');
    // Add an edge from source to destination with its weight.
    connectionMap[currentLineTokens[0] - 0].push([currentLineTokens[1] - 0, currentLineTokens[2] - 0]);
  }

  // Perform a traversal to find the longest path (Bellman-Ford like approach for DAGs or specific types of graphs).
  var visitQueue = [0]
    , currentVertex
    , neighborVertex;

  // Continue as long as there are nodes to process in the queue.
  while (visitQueue.length) {
    currentVertex = visitQueue.pop(); // Get the next vertex to process.

    // Iterate over all neighbors of the current vertex.
    for (loopIndexA = 0; loopIndexA < connectionMap[currentVertex].length; loopIndexA++) {
      neighborVertex = connectionMap[currentVertex][loopIndexA][0];

      // If a longer path to the neighbor is found, update it and add the neighbor to the queue.
      if (distanceValues[neighborVertex] < distanceValues[currentVertex] + connectionMap[currentVertex][loopIndexA][1]) {
        distanceValues[neighborVertex] = distanceValues[currentVertex] + connectionMap[currentVertex][loopIndexA][1];
        visitQueue.push(neighborVertex);
      }
    }
  }
  // Output the final computed distances.
  console.log(distanceValues);

}