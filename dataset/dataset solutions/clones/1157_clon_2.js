// Main entry point for the graph processing algorithm.
function executeDijkstra()
{
	// This array will function as our min-priority queue.
	let priorityQueue = [ ] ;

	/*
	 * Inserts an element into the priority queue, maintaining the min-heap property.
	 * The elementToAdd is typically an array like [distance, nodeIndex].
	 */
	function enqueueItem( elementToAdd )
	{
		let currentIndex = priorityQueue.length ; // Start at the end of the array.

		// Bubble up the new element until the min-heap property is satisfied.
		while ( currentIndex > 0 )
		{
			let parentIndex = ( currentIndex - 1 ) >> 1 ; // Calculate the parent's index.

			// If the parent's value is already smaller or equal to the new element,
			// we have found the correct position for elementToAdd.
			if ( priorityQueue[ parentIndex ] <= elementToAdd )
			{
				break;
			}

			// Otherwise, move the parent element down to the current index.
			priorityQueue[ currentIndex ] = priorityQueue[ parentIndex ];
			currentIndex = parentIndex; // Move up to the parent's old position.
		}
		// Place the new element in its final, correct position.
		priorityQueue[ currentIndex ] = elementToAdd;
	}

	/*
	 * Extracts the smallest element (which is always at the root of the min-heap)
	 * from the priority queue. It then re-establishes the min-heap property.
	 */
	function extractMin()
	{
		let minElement = priorityQueue[ 0 ]; // The smallest element is always at index 0.

		let lastElement = priorityQueue.pop(); // Remove the last element to use as a temporary root.

		// If the queue becomes empty after removing the root, simply return the extracted min.
		if ( ! priorityQueue.length )
		{
			return minElement;
		}

		let currentPosition = 0; // Start bubbling down from the root (index 0).
		while ( currentPosition * 2 + 1 < priorityQueue.length )
		{
			let leftChild = currentPosition * 2 + 1;  // Index of the left child.
			let rightChild = currentPosition * 2 + 2; // Index of the right child.

			// Determine which child is smaller. Assume left child is smaller initially.
			// If right child exists and is smaller than the left child, then use the right child.
			if ( rightChild < priorityQueue.length && priorityQueue[ rightChild ] < priorityQueue[ leftChild ] )
			{
				leftChild = rightChild; // Update 'leftChild' to point to the smaller child.
			}

			// If the replacement element is smaller than or equal to the smallest child,
			// its correct position has been found.
			if ( priorityQueue[ leftChild ] >= lastElement )
			{
				break;
			}

			// Move the smallest child up to the current position.
			priorityQueue[ currentPosition ] = priorityQueue[ leftChild ];
			currentPosition = leftChild; // Move down to the child's position to continue bubbling.
		}
		// Place the `lastElement` in its final position after bubbling down.
		priorityQueue[ currentPosition ] = lastElement;

		return minElement; // Return the original minimum element that was extracted.
	}


	// Read initial configuration values: number of vertices, number of edges, and the starting vertex.
	const vertexCount = parseInput();
	const edgeCount = parseInput();
	const sourceVertex = parseInput();

	// Initialize the adjacency list structure for representing the graph.
	let graphConnections = [];
	iterateRange( vertexCount, function( vertexId )
	{
		graphConnections[ vertexId ] = []; // Each vertex gets an empty list for its connections.
	});

	// Populate the adjacency list by reading edge details for each edge.
	iterateRange( edgeCount, function()
	{
		let fromNode = parseInput(); // Starting node of the edge.
		let toNode = parseInput();   // Ending node of the edge.
		let weight = parseInput();   // Weight/cost of traversing this edge.

		graphConnections[ fromNode ].push( [ toNode, weight ] ); // Add the edge to the 'fromNode's list.
	});

	// Initialize the array to store shortest distances from the source vertex to all other vertices.
	let shortestDistances = [];
	iterateRange( vertexCount, function( nodeIndex )
	{
		shortestDistances[ nodeIndex ] = Infinity; // All distances are initially set to infinity.
	});

	shortestDistances[ sourceVertex ] = 0; // The distance from the source to itself is zero.
	enqueueItem( [ 0, sourceVertex ] ); // Add the source vertex to the priority queue with its distance.

	// Main loop for Dijkstra's algorithm. Continues as long as there are nodes to process in the queue.
	while ( priorityQueue.length )
	{
		let currentProcessingPair = extractMin(); // Get the vertex with the smallest known distance.

		// If we've already found a shorter path to this node than what's in the queue, skip it.
		// This handles outdated entries in the priority queue.
		if ( currentProcessingPair[ 0 ] > shortestDistances[ currentProcessingPair[ 1 ] ] )
		{
			continue;
		}

		// Iterate over all outgoing connections (edges) from the current vertex.
		iterateRange( graphConnections[ currentProcessingPair[ 1 ] ].length, function( connIndex )
		{
			let pathSegment = graphConnections[ currentProcessingPair[ 1 ] ][ connIndex ];
			// Relaxation step: Check if a shorter path to the neighbor (pathSegment[0]) can be found.
			if ( shortestDistances[ pathSegment[ 0 ] ] > shortestDistances[ currentProcessingPair[ 1 ] ] + pathSegment[ 1 ] )
			{
				// If a shorter path is found, update the distance.
				shortestDistances[ pathSegment[ 0 ] ] = shortestDistances[ currentProcessingPair[ 1 ] ] + pathSegment[ 1 ];
				// Add the updated neighbor to the priority queue for further processing.
				enqueueItem( [ shortestDistances[ pathSegment[ 0 ] ], pathSegment[ 0 ] ] );
			}
		});
	}

	// After Dijkstra's algorithm completes, output the calculated shortest distances.
	iterateRange( vertexCount, function( nodeId )
	{
		// If a node is unreachable (distance is still Infinity), print 'INF', otherwise print the distance.
		displayValue( shortestDistances[ nodeId ] !== Infinity ? shortestDistances[ nodeId ] : 'INF' );
	});
}

// A flexible utility function for iterating through a numeric range.
// It can be called with (end, callback) or (start, end, callback).
function iterateRange( startVal, endVal, iterationFunction )
{
	// Check if the 'startVal' parameter is actually the 'endVal' and 'endVal' is the callback.
	if ( iterationFunction == null )
	{
		iterationFunction = endVal; // Assign the second argument as the callback.
		endVal = startVal;         // Assign the first argument as the upper bound.
		startVal = 0;              // Default the starting value to 0.
	}
	// Loop from 'startVal' up to (but not including) 'endVal'.
	for ( let loopIndex = startVal; loopIndex < endVal; ++loopIndex )
	{
		iterationFunction( loopIndex ); // Execute the provided callback function with the current index.
	}
}

// Standard Node.js process input handling setup.
process.stdin.resume();
process.stdin.setEncoding( 'utf8' );

let bufferedInput = ''; // Buffer to accumulate all incoming standard input data.
let dataCursor = 0;   // Pointer to track the current position within the 'bufferedInput' array after splitting.

/*
 * Reads the next value from the pre-processed buffered input.
 * It can optionally take a 'dataTypeHint', but by default, it attempts to convert to a number.
 */
function parseInput( dataTypeHint )
{
	if ( dataTypeHint === 'string' )
	{
		return bufferedInput[ dataCursor++ ]; // Return the value as a string and advance the cursor.
	}
	else
	{
		return +bufferedInput[ dataCursor++ ]; // Convert the value to a number using unary plus and advance.
	}
}

// Outputs a given value to the console, followed by a newline.
function displayValue( contentToDisplay )
{
	console.log( contentToDisplay );
}

// Event listener for when data chunks are received from standard input.
process.stdin.on( 'data', function( incomingChunk )
{
	bufferedInput += incomingChunk; // Append each new chunk of data to the 'bufferedInput'.
});

// Event listener for when all standard input has been received.
process.stdin.on( 'end', function()
{
	// Once all input is received, split it by any whitespace character(s) into an array.
	bufferedInput = bufferedInput.split( /\s+/ );
	executeDijkstra(); // Call the main algorithm function to start processing the input.
});