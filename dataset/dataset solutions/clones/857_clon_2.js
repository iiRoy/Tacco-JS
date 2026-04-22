var diskOps = require('fs')
   , contentSize = diskOps.fstatSync(process.stdin.fd).size
   , dataBuffer = new Buffer(contentSize)
   , octetsReceived = diskOps.readSync(process.stdin.fd, dataBuffer, 0, contentSize, 0)
   , lineData = dataBuffer.toString('utf8', 0, octetsReceived).split('\n');

executeProgram();

function executeProgram() {
	// Temporary storage for parsed line segments
	var segment = lineData.shift().split(' ');

	// Number of vertices in the graph structure
	var numVertices = segment[0];
	// Number of connections (edges) in the graph
	var numConnections = segment[1];

	// Array to hold all connection pairs
	var connectionPairs = new Array();

	// Adjacency list for forward traversal
	var forwardGraph = new Array();
	// Adjacency list for backward traversal
	var backwardGraph = new Array();

	// Array for dynamic programming calculations (e.g., longest path)
	var pathLengths = new Array();

	// Loop counters
	var idx, subIdx;
	// Loop iteration limit
	var limit;

	// Variables to store individual node identifiers
	var startNode, endNode;

	// Initialize graph structures and DP array
	for (idx = 0; idx < numVertices; idx++) {
		forwardGraph[idx] = [];
		backwardGraph[idx] = [];
		pathLengths[idx] = 0; // Default path length is zero
	}

	// Populate graph with connections
	for (idx = 0; idx < numConnections; idx++) {
		// Parse connection details from input
		segment = lineData[idx].split(' ');
		startNode = segment[0] - 1; // Adjust to 0-based indexing
		endNode = segment[1] - 1;   // Adjust to 0-based indexing

		// Store the connection pair
		connectionPairs[idx] = [startNode, endNode];
		// Add connection to forward graph
		forwardGraph[startNode].push(endNode);
		// Add connection to backward graph
		backwardGraph[endNode].push(startNode);
	}

	// Calculate longest path to each node using dynamic programming
	for (idx = 0; idx < numVertices; idx++) {
		for (subIdx = 0, limit = forwardGraph[idx].length; subIdx < limit; subIdx++) {
			// If a longer path is found, update the path length
			if (pathLengths[forwardGraph[idx][subIdx]] < pathLengths[idx] + 1) {
				pathLengths[forwardGraph[idx][subIdx]] = pathLengths[idx] + 1;
			}
		}
	}

	// Determine the maximum path length found
	var greatestLength = Math.max.apply(null, pathLengths);
	// Boolean array to mark nodes that are part of a critical path
	var criticalNodes = new Array();
	// Array to count paths at each level (for critical path analysis)
	var pathCounts = new Array();

	// Initialize criticalNodes and pathCounts arrays
	for (idx = 0; idx < numVertices; idx++) {
		criticalNodes[idx] = greatestLength === pathLengths[idx];
		pathCounts[idx] = 0; // Initialize path count for each level
	}

	// Propagate critical node status backwards from nodes with max path length
	for (idx = numVertices - 1; idx >= 0; idx--) {
		if (criticalNodes[idx]) {
			for (subIdx = 0, limit = backwardGraph[idx].length; subIdx < limit; subIdx++) {
				// If the predecessor node is on a critical path
				if (pathLengths[backwardGraph[idx][subIdx]] + 1 === pathLengths[idx]) {
					criticalNodes[backwardGraph[idx][subIdx]] = true;
					// Increment the count for the path length of the predecessor
					pathCounts[pathLengths[backwardGraph[idx][subIdx]]]++;
				}
			}
		}
	}

	// Identify and output specific connection indices based on critical path criteria
	for (idx = 0; idx < numConnections; idx++) {
		if (criticalNodes[connectionPairs[idx][0]] && criticalNodes[connectionPairs[idx][1]] && pathCounts[pathLengths[connectionPairs[idx][0]]] === 1) {
			console.log(idx + 1); // Output 1-based index of the connection
		}
	}
}