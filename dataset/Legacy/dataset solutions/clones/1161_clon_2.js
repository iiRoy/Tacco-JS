var printMsg = console.log;
if (typeof process !== "undefined") {
	var receivedData = "";
	process.stdin.resume();
	process.stdin.setEncoding('utf8');
	process.stdin.on('data', function (dataSegment) {
		receivedData += dataSegment;
	});
	process.stdin.on('end', function () {
		var inputLines = receivedData.split("\n");
		processGraphData(inputLines);
	});
}


function processGraphData(inputLines){
	// Check if the last line is empty, if not, push an undefined element
	// This maintains the original behavior of `pop()` and `push()`
	if(inputLines.pop() !== ""){
		inputLines.push();
	}
	// Convert all input lines to arrays of numbers
	inputLines = inputLines.map(function(currentLine){
		return currentLine.split(" ").map(function(elementStr){
			return Number(elementStr);
		});
	});

	// Extract graph dimensions from the first line
	var firstLineData = inputLines.shift();
	var numVertices = firstLineData[0];
	var numEdges = firstLineData[1];

	// Initialize data structures for graph traversal and bridge detection
	var adjacencyList = []; // Stores actual graph edges
	var virtualEdges = [];  // Declared but not used in original, keeping for Type II
	var visitedNodes = [];  // Marks if a node has been visited during DFS
	var nodeStatus = [];    // Declared but not used in original, keeping for Type II
	var discoveryOrder = [];// Stores the discovery time (ord) of each node
	var lowLinkValue = [];  // Stores the low-link value of each node
	var foundBridges = [];  // Stores identified bridges
	var edgeVisited = [];   // Marks if an edge (u,v) has been traversed in DFS

	// Initialize arrays for each vertex
	for(var vertexIndex = 0; vertexIndex < numVertices ; vertexIndex++){
		adjacencyList[vertexIndex] = [];
		visitedNodes[vertexIndex] = false;
		// Initialize discovery order and low-link values
		// discoveryOrder will store the DFS entry time for a node
		// lowLinkValue will store the lowest discovery order reachable from this node
		discoveryOrder[vertexIndex] = 0;
		lowLinkValue[vertexIndex] = numVertices; // Initialize with a value larger than any possible discovery order
		foundBridges[vertexIndex] = [];
		// Initialize edgeVisited matrix
		edgeVisited[vertexIndex] = [];
		for(var neighborIndex = 0; neighborIndex < numVertices ; neighborIndex++){
			edgeVisited[vertexIndex][neighborIndex]= false;
		}
	}

	// Populate the adjacency list from input edges
	inputLines.forEach(function(currentEdge){
		var nodeA = currentEdge[0];
		var nodeB = currentEdge[1];
		adjacencyList[nodeA].push(nodeB);
		adjacencyList[nodeB].push(nodeA);
	});

	var discoveryCounter = 0; // Counter for discovery order
	var previousNode = 0;     // Declared but not used in original, keeping for Type II

	// Depth-First Search function to find bridges
	function exploreGraph(currentNode){
		// currentNode: The node currently being visited
		// visitedFlags: Reference to the global visitedNodes array
		var currentVertex = currentNode;
		var visitedFlags = visitedNodes;
		var adjacentNodes = adjacencyList[currentVertex];

		visitedFlags[currentVertex] = true;
		discoveryOrder[currentVertex] = discoveryCounter;
		lowLinkValue[currentVertex] = discoveryCounter;
		discoveryCounter++;

		adjacentNodes.forEach(function(neighborNode){
			if(!visitedFlags[neighborNode]){
				// If the neighbor has not been visited, it's a tree edge
				// Mark the edge as used in both directions
				edgeVisited[currentVertex][neighborNode]=true;
				edgeVisited[neighborNode][currentVertex]=true;
				exploreGraph(neighborNode); // Recurse on the neighbor
				// After returning from recursion, update low-link value
				// The low-link of currentVertex is the minimum of its own low-link
				// and the low-link of its child (neighborNode)
				lowLinkValue[currentVertex] = Math.min(lowLinkValue[currentVertex],lowLinkValue[neighborNode]);
			} else if(!edgeVisited[neighborNode][currentVertex]){
				// If the neighbor has been visited and this is not the parent edge (back edge)
				// Update low-link value using the discovery order of the visited neighbor
				lowLinkValue[currentVertex] = Math.min(lowLinkValue[currentVertex],discoveryOrder[neighborNode]);
			}
		});
	}

	// Start DFS from node 0 (assuming connected graph or handling multiple components if needed)
	exploreGraph(0);

	// After DFS, iterate through edges to identify bridges
	inputLines.forEach(function(graphEdge){
		var nodeU = graphEdge[0];
		var nodeV = graphEdge[1];

		// Ensure nodeU has a smaller discovery order than nodeV for consistent processing
		if(discoveryOrder[nodeU] > discoveryOrder[nodeV]){
			var tempNode = nodeU;
			nodeU = nodeV;
			nodeV = tempNode;
		}

		// An edge (nodeU, nodeV) is a bridge if discoveryOrder[nodeU] < lowLinkValue[nodeV]
		if(discoveryOrder[nodeU] < lowLinkValue[nodeV]){
			// This edge is a bridge
			var smallerNode = Math.min(nodeU,nodeV);
			var largerNode = Math.max(nodeU,nodeV);
			foundBridges[smallerNode].push(largerNode);
		}
	});

	// Sort the bridges for each starting node in descending order
	foundBridges = foundBridges.map(function(bridgeList){
		return bridgeList.sort(function(valA,valB){
			return valB < valA; // Sorts in descending order
		});
	});

	// Output the identified bridges
	for(var startNode = 0 ; startNode < numVertices ; startNode++){
		var listLength = foundBridges[startNode].length;
		for(var bridgeIndex = 0 ; bridgeIndex < listLength ;bridgeIndex++){
			var endNode = foundBridges[startNode][bridgeIndex];
			printMsg(startNode + " " + endNode);
		}
	}
}
