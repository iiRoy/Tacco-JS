function executeProgram() {
  // Define a large number to represent infinity for path calculations.
  var infinityVal = 1e9;

  // Variables to hold parsed input line data.
  var currentLineData;

  // Variables for graph dimensions and edge properties.
  var numNodes, maxVertexId, vertexA, vertexB, edgeCost, edgeTime;

  // Variables for query parameters.
  var sourceVertex, destinationVertex, metricType;

  // Loop counters for various operations, including Floyd-Warshall.
  var outerLoopIdx, middleLoopIdx, innerLoopIdx; // For Floyd-Warshall
  var dataEntryIdx, queryIdx; // For other data processing loops

  // Main processing loop: continues until a specific termination condition is met.
  while (true) {
    // Read and parse the first line of each test case.
    currentLineData = rawDataInput.shift().split(' ').map(parseFloat);
    numNodes = currentLineData[0];
    maxVertexId = currentLineData[1];

    // Termination condition: if both N and M are zero, exit the loop.
    if (numNodes === 0 && maxVertexId === 0) {
      break;
    }

    // Initialize 2D arrays (adjacency matrices) for path costs and travel times.
    // These will store the shortest path costs and times between any two vertices.
    var pathCosts = [];
    var pathTimes = [];
    for (dataEntryIdx = 1; dataEntryIdx <= maxVertexId; dataEntryIdx++) {
      pathCosts[dataEntryIdx] = [];
      pathTimes[dataEntryIdx] = [];
    }

    // Read and populate initial direct edge costs and times.
    // N represents the number of direct edges provided.
    for (dataEntryIdx = 0; dataEntryIdx < numNodes; dataEntryIdx++) {
      currentLineData = rawDataInput.shift().split(' ').map(parseFloat);
      vertexA = currentLineData[0];
      vertexB = currentLineData[1];
      edgeCost = currentLineData[2];
      edgeTime = currentLineData[3];

      // Store the minimum cost and time for direct paths between vertexA and vertexB.
      // Handles cases where multiple edges exist between the same pair of nodes.
      pathCosts[vertexA][vertexB] = pathCosts[vertexB][vertexA] = Math.min(edgeCost, pathCosts[vertexA][vertexB] || infinityVal);
      pathTimes[vertexA][vertexB] = pathTimes[vertexB][vertexA] = Math.min(edgeTime, pathTimes[vertexA][vertexB] || infinityVal);
    }

    // Apply the Floyd-Warshall algorithm to find all-pairs shortest paths.
    // This algorithm iterates through all possible intermediate vertices (innerLoopIdx).
    for (innerLoopIdx = 1; innerLoopIdx <= maxVertexId; innerLoopIdx++) {
      // Then, it considers all possible starting vertices (outerLoopIdx).
      for (outerLoopIdx = 1; outerLoopIdx <= maxVertexId; outerLoopIdx++) {
        // And all possible ending vertices (middleLoopIdx).
        for (middleLoopIdx = 1; middleLoopIdx <= maxVertexId; middleLoopIdx++) {
          // Update the shortest path cost if a path through innerLoopIdx is shorter.
          pathCosts[outerLoopIdx][middleLoopIdx] = Math.min(
            pathCosts[outerLoopIdx][middleLoopIdx] || infinityVal,
            (pathCosts[outerLoopIdx][innerLoopIdx] || infinityVal) + (pathCosts[innerLoopIdx][middleLoopIdx] || infinityVal)
          );
          // Update the shortest path time similarly.
          pathTimes[outerLoopIdx][middleLoopIdx] = Math.min(
            pathTimes[outerLoopIdx][middleLoopIdx] || infinityVal,
            (pathTimes[outerLoopIdx][innerLoopIdx] || infinityVal) + (pathTimes[innerLoopIdx][middleLoopIdx] || infinityVal)
          );
        }
      }
    }

    // Read the number of queries for the current test case.
    var numQueries = parseFloat(rawDataInput.shift());
    // Process each query.
    for (queryIdx = 0; queryIdx < numQueries; queryIdx++) {
      currentLineData = rawDataInput.shift().split(' ').map(parseFloat);
      sourceVertex = currentLineData[0];
      destinationVertex = currentLineData[1];
      metricType = currentLineData[2]; // 0 for cost, 1 for time

      // Output the requested metric (cost or time) for the path between source and destination.
      console.log([pathCosts, pathTimes][metricType][sourceVertex][destinationVertex]);
    }
  }
}

// Global variable to accumulate all input data.
var rawDataInput = '';

// Set up standard input processing.
process.stdin.resume();
process.stdin.setEncoding('utf8');

// Event listener for incoming data chunks.
process.stdin.on('data', function(chunk) {
  rawDataInput += chunk;
});

// Event listener for the end of input stream.
process.stdin.on('end', function() {
  // Split the accumulated input into an array of lines.
  rawDataInput = rawDataInput.split('\n');
  // Record the start time for performance measurement.
  var startTimeStamp = Date.now();
  // Execute the main program logic.
  executeProgram();
  // Log the total execution time.
  console.log('time: ' + (Date.now() - startTimeStamp));
});
