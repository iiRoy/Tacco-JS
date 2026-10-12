var outputPrinter = console.log;
if (typeof process !== "undefined") {
	var rawInputString = "";
	process.stdin.resume();
	process.stdin.setEncoding('utf8');
	process.stdin.on('data', function (inputChunk) {
		rawInputString += inputChunk;
	});
	process.stdin.on('end', function () {
		var processedInputLines = rawInputString.split("\n");
		analyzeGraphBridges(processedInputLines);
	});
}


function analyzeGraphBridges(graphDataLines){
	// This block handles trailing newlines or modifies the last line.
	// It's crucial to replicate the exact original behavior, even if it seems unusual.
	// If the last line is not empty, it's removed and 'undefined' is added.
	// If the last line is empty, it's removed.
	var lastLineContent = graphDataLines.pop();
	if(lastLineContent !== ""){
		graphDataLines.push(undefined); // Replicates original behavior of lines.push()
	}

	// Process input lines: split by space and convert to numbers
	var numericGraphData = graphDataLines.map(function(lineContent){
		if (lineContent === undefined) { // Handle the 'undefined' case from above
			return [NaN, NaN]; // Replicate Number(undefined) behavior
		}
		return lineContent.split(" ").map(function(element){
			return Number(element);
		});
	});

	var graphConfig = numericGraphData.shift();
	var vertexCount = graphConfig[0];
	var edgeCount = graphConfig[1];

	// Initialize data structures for Tarjan's bridge-finding algorithm
	const adjacencyList = Array.from({ length: vertexCount }, () => []);
	const isVisited = Array(vertexCount).fill(false);
	const discoveryTime = Array(vertexCount).fill(0);
	const lowLinkTime = Array(vertexCount).fill(vertexCount); // Initialize with V
	const bridgeList = Array.from({ length: vertexCount }, () => []);
	const edgeTraversed = Array.from({ length: vertexCount }, () => Array(vertexCount).fill(false));

	// Populate adjacency list
	numericGraphData.forEach(function(currentEdgePair){
		var nodeOne = currentEdgePair[0];
		var nodeTwo = currentEdgePair[1];
		adjacencyList[nodeOne].push(nodeTwo);
		adjacencyList[nodeTwo].push(nodeOne);
	});

	var timeCounter = 0; // Global counter for discovery times

	// Depth-First Search function to find bridges
	function depthFirstSearch(currentNodeId){
		var currId = currentNodeId;
		var visitedStatus = isVisited;
		var currentNeighbors = adjacencyList[currId];

		visitedStatus[currId] = true;
		discoveryTime[currId] = timeCounter;
		lowLinkTime[currId] = timeCounter;
		timeCounter++;

		currentNeighbors.forEach(function(neighborNodeId){
			if(!visitedStatus[neighborNodeId]){
				// If neighbor is not visited, it's a tree edge
				edgeTraversed[currId][neighborNodeId] = true;
				edgeTraversed[neighborNodeId][currId] = true;
				depthFirstSearch(neighborNodeId);
				// After recursive call, update low-link value
				lowLinkTime[currId] = Math.min(lowLinkTime[currId], lowLinkTime[neighborNodeId]);
			} else if(!edgeTraversed[neighborNodeId][currId]){
				// If neighbor is visited and it's not the parent (back edge)
				// Update low-link value using discovery time of the visited neighbor
				lowLinkTime[currId] = Math.min(lowLinkTime[currId], discoveryTime[neighborNodeId]);
			}
		});
	}

	// Start DFS from vertex 0 (assuming graph is connected or we need to iterate over all vertices)
	// The problem context usually implies a connected graph or starting from 0 is sufficient.
	depthFirstSearch(0);

	// Identify bridges after DFS completion
	numericGraphData.forEach(function(currentEdgePair){
		var endpointA = currentEdgePair[0];
		var endpointB = currentEdgePair[1];

		// Ensure endpointA has a smaller discovery time for consistent comparison
		if(discoveryTime[endpointA] > discoveryTime[endpointB]){
			// Swap using array destructuring for a Type III modification
			[endpointA, endpointB] = [endpointB, endpointA];
		}

		// A bridge is found if the discovery time of endpointA is less than the low-link value of endpointB
		if(discoveryTime[endpointA] < lowLinkTime[endpointB]){
			var smallerNode = Math.min(endpointA, endpointB);
			var largerNode = Math.max(endpointA, endpointB);
			bridgeList[smallerNode].push(largerNode);
		}
	});

	// Sort bridges for consistent output
	bridgeList.forEach(function(bridgesFromSource){
		// Sort in ascending order. Original used `b<a` which evaluates to 1 or 0,
		// effectively `b-a` for ascending. Using `a-b` is standard and clearer.
		bridgesFromSource.sort((node1, node2) => node1 - node2);
	});

	// Output the identified bridges
	for(var sourceNode = 0 ; sourceNode < vertexCount ; sourceNode++){
		var numBridgesFromSource = bridgeList[sourceNode].length;
		for(var bridgeIterator = 0 ; bridgeIterator < numBridgesFromSource ; bridgeIterator++){
			var destinationNode = bridgeList[sourceNode][bridgeIterator];
			outputPrinter(sourceNode + " " + destinationNode);
		}
	}
}
