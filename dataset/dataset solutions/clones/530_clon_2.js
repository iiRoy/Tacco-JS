/* This JavaScript code implements a Bellman-Ford-like algorithm
   to solve a system of difference constraints. */
function executeProgram(  ) {
	// Read the number of nodes (vertices) for the graph
	var nodeCount = retrieveInput();
	// Read the number of constraints (edges)
	var edgeCount = retrieveInput();

	// Initialize an array to store direct inequalities (e.g., x - y <= C)
	var inequalitiesList = [  ];
	// Initialize an array to store ambiguous constraints (e.g., |x - y| <= C)
	var ambiguousConstraints = [ ];

	// Process each constraint given in the input
	iterateRange(edgeCount, function(  ) {
		// Get the constraint string
		var constraintString = retrieveInput('string');

		// Parse the constraint string to extract node indices and constant value
		// Delimiters are <=, >=, *, +, -
		var parsedParts = constraintString.split(/<=|>=|\*|\+|-/);
		// Adjust node indices to be 0-based
		parsedParts[0] = +parsedParts[0] - 1;
		parsedParts[1] = +parsedParts[1] - 1;
		// Convert the constant value to a number
		parsedParts[2] = +parsedParts[2];

		// Determine the type of constraint (e.g., <=, >=, *)
		var constraintType;
		if (constraintString.indexOf('*') !== -1) {
			// Absolute difference constraint |x - y| <= C
			constraintType = 2;
		}
		else {
			// Directional inequality: 0 for <=, 1 for >=
			constraintType = +(constraintString.indexOf('<=') === -1);
		}

		// Determine the sign direction based on '+' or '-'
		// 0 for '+', 1 for '-' (implicitly, if '+' is not found)
		var signDirection = +(constraintString.indexOf('+') === -1);

		// Based on constraint type, add corresponding edges to the graph
		if (constraintType == 0) { // x - y <= C (or y - x <= -C)
			if (signDirection == 0) { // x - y <= C (interpreted as y - x <= -C)
				inequalitiesList[inequalitiesList.length] = [parsedParts[1], parsedParts[0], -parsedParts[2]];
			}
			else { // x - y <= C (interpreted as y - x <= 0 and x - y <= C)
				inequalitiesList[inequalitiesList.length] = [parsedParts[1], parsedParts[0], 0];
				inequalitiesList[inequalitiesList.length] = [parsedParts[0], parsedParts[1], parsedParts[2]];
			}
		}
		else if (constraintType == 1) { // x - y >= C (or x - y <= -C)
			if (signDirection == 0) { // x - y >= C (interpreted as x - y <= -C)
				inequalitiesList[inequalitiesList.length] = [parsedParts[0], parsedParts[1], -parsedParts[2]];
			}
			else { // x - y >= C (interpreted as y - x <= C and x - y <= 0)
				inequalitiesList[inequalitiesList.length] = [parsedParts[1], parsedParts[0], parsedParts[2]];
				inequalitiesList[inequalitiesList.length] = [parsedParts[0], parsedParts[1], 0];
			}
		}
		else { // |x - y| <= C (absolute difference)
			if (signDirection == 0) { // |x - y| <= C (interpreted as x - y <= C and y - x <= C)
				ambiguousConstraints[ambiguousConstraints.length] = [[parsedParts[0], parsedParts[1], -parsedParts[2]], [parsedParts[1], parsedParts[0], -parsedParts[2]]];
			}
			else { // |x - y| <= C (interpreted as x - y <= C and y - x <= C)
				inequalitiesList[inequalitiesList.length] = [parsedParts[1], parsedParts[0], parsedParts[2]];
				inequalitiesList[inequalitiesList.length] = [parsedParts[0], parsedParts[1], parsedParts[2]];
			}
		}
	});

	// Initialize the final result to negative infinity
	var finalResult = -Infinity;
	// Iterate through all possible combinations for ambiguous constraints
	iterateRange(1 << ambiguousConstraints.length, function(combinationIndex) {
		// Create a new graph edge list by copying the direct inequalities
		var currentGraphEdges = [ ].concat(inequalitiesList);
		// For each ambiguous constraint, add one of its two possibilities based on the current combination
		iterateRange(ambiguousConstraints.length, function(currentIdx) {
			currentGraphEdges[currentGraphEdges.length] = ambiguousConstraints[currentIdx][(combinationIndex >> currentIdx) & 1];
		});

		// Initialize distances for Bellman-Ford algorithm
		var distanceArray = [ ];
		iterateRange(nodeCount, function(currentIdx) {
			distanceArray[currentIdx] = Infinity;
		});
		// Set distance to source node (node 0) to 0
		distanceArray[0] = 0;

		// Relax edges 'nodeCount' times using Bellman-Ford
		iterateRange(nodeCount, function(  ) {
			iterateRange(currentGraphEdges.length, function(currentIdx) {
				var graphEdge = currentGraphEdges[currentIdx];
				// Update distance if a shorter path is found
				distanceArray[graphEdge[1]] = Math.min(distanceArray[graphEdge[0]] + graphEdge[2], distanceArray[graphEdge[1]]);
			});
		});

		// Check for negative cycles reachable from source node 0
		// If d[0] is still 0, it means no negative cycle affects the source
		if (distanceArray[0] == 0) {
			// Update the final result with the maximum distance found in the current combination
			finalResult = Math.max(finalResult, Math.max.apply(null, distanceArray));
		}
	});

	// Output the final result
	if (finalResult === Infinity) {
		displayOutput('inf'); // Indicates that distances can be arbitrarily large
	}
	else if (finalResult === -Infinity) {
		displayOutput(-1); // Indicates no valid solution or unreachable nodes
	}
	else {
		displayOutput(finalResult); // The maximum possible distance
	}
}

/* A utility function for iterating a specified number of times or over a range.
   Can be called as iterateRange(count, callback) or iterateRange(start, end, callback). */
function iterateRange(startVal, endVal, loopCallback) {
	// If only two arguments are provided, assume startVal is count and endVal is callback
	if (loopCallback == null) {
		loopCallback = endVal;
		endVal = startVal;
		startVal = 0; // Default starting index is 0
	}
	// Loop from startVal (inclusive) up to endVal (exclusive)
	for (var currentIdx = startVal; currentIdx < endVal; ++currentIdx) {
		loopCallback(currentIdx); // Execute the provided callback for each iteration
	}
}

// Set up standard input processing
process.stdin.resume();
process.stdin.setEncoding('utf8');

// Buffer to store incoming input data
var dataBuffer = '';
// Index to track the current position in the processed input array
var bufferPosition = 0;

/* Function to retrieve the next piece of input.
   If 'string' is specified, returns a string; otherwise, returns a number. */
function retrieveInput(dataType) {
	if (dataType === 'string') {
		return dataBuffer[bufferPosition++];
	}
	else {
		return +dataBuffer[bufferPosition++]; // Convert to number
	}
}

/* Function to display output to the console. */
function displayOutput(outputValue) {
	console.log(outputValue);
}

// Event listener for incoming data chunks
process.stdin.on('data', function(dataChunk) {
	dataBuffer += dataChunk; // Append chunk to the buffer
});

// Event listener for end of input
process.stdin.on('end', function() {
	// Split the accumulated input by whitespace into an array
	dataBuffer = dataBuffer.split(/\s+/);
	// Start the main program execution
	executeProgram();
});