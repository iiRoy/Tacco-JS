function InputParser(sourceText) {
	// Reference to the current instance of the parser.
	var instanceRef = this;
	// Tracks the current position in the tokenized string array.
	instanceRef.currentIndex = 0;
	// Stores the original input string for potential future use.
	instanceRef.originalString = sourceText;
	// Processes the input string into an array of tokens.
	instanceRef.tokenizedStrings = (function(inputData) {
		var parsedTokens = []; // Array to hold the processed tokens.
		// Replace multiple whitespace characters (newline, space, tab) with a single space.
		var cleanedInput = inputData.replace(/[\n \t]+/g, " ");
		// Split the cleaned string by spaces to get individual tokens.
		var splitParts = cleanedInput.split(" ");
		// Iterate through the split parts and add them to the result array.
		for (var idx = 0, lengthVal = splitParts.length; idx < lengthVal; idx++) {
			parsedTokens.push(splitParts[idx]);
		}
		return parsedTokens; // Return the array of tokens.
	}(sourceText)); // Immediately invoke the anonymous function with the source text.

	// Method to retrieve the next string token.
	instanceRef.getNextToken = function() {
		var currentResult = instanceRef.tokenizedStrings[instanceRef.currentIndex];
		instanceRef.currentIndex++; // Advance the token pointer.
		return (currentResult != null) ? currentResult : null; // Return token or null if none.
	}

	// Method to retrieve the next integer token.
	instanceRef.getNextInteger = function() {
		var currentResult = instanceRef.tokenizedStrings[instanceRef.currentIndex];
		instanceRef.currentIndex++; // Advance the token pointer.
		return (currentResult != null) ? parseInt(currentResult) : null; // Parse and return integer.
	}

	// Method to retrieve the next floating-point number token.
	instanceRef.getNextDecimal = function() {
		var currentResult = instanceRef.tokenizedStrings[instanceRef.currentIndex];
		instanceRef.currentIndex++; // Advance the token pointer.
		return (currentResult != null) ? parseFloat(currentResult) : null; // Parse and return float.
	}
	
	// Method to retrieve the next byte token (conceptual, as JS doesn't have direct bytes like Java).
	instanceRef.getNextByte = function() {
		var currentResult = instanceRef.tokenizedStrings[instanceRef.currentIndex];
		instanceRef.currentIndex++; // Advance the token pointer.
		// In JavaScript, this might represent an array of 8-bit signed integers.
		return (currentResult != null) ? new Int8Array(currentResult) : null;
	}

}

function ProcessGraph(dataReader) {

	var nodeCount = dataReader.getNextInteger(); // Read the total number of nodes.
	var finalResults = []; // Array to store the final computed results.
	
	var nodeValuesMap = {}; // Map to store values associated with each node ID.
	// Populate the nodeValuesMap with values read from input.
	for (var loopIndex = 0; loopIndex < nodeCount; loopIndex++) {
		nodeValuesMap[loopIndex + 1] = dataReader.getNextInteger();
	}
	
	var adjacencyList = {}; // Represents the graph's adjacency list.
	// Build the adjacency list from the input pairs representing edges.
	for (var loopIndex = 0; loopIndex < nodeCount - 1; loopIndex++) {
		var nodeA = dataReader.getNextInteger();
		var nodeB = dataReader.getNextInteger();
		// Add bidirectional connections.
		if (!adjacencyList[nodeA]) adjacencyList[nodeA] = [nodeB];
		else adjacencyList[nodeA].push(nodeB);
		if (!adjacencyList[nodeB]) adjacencyList[nodeB] = [nodeA];
		else adjacencyList[nodeB].push(nodeA);
	}
	
	// Data structures for graph traversal.
	var pathValuesMap = {}; // Stores the list of values encountered on the path to each node.
	var traversalQueue = []; // Queue for breadth-first-like traversal.
	
	// Function to explore a node and its path.
	var exploreNodePath = function (targetNodeId, parentNodeId) {
		// Copy the path values from the parent node, or start fresh if no parent.
		var currentPathValues = (pathValuesMap[parentNodeId]) ? pathValuesMap[parentNodeId].concat() : [];
		// Add the current node's value to the path.
		currentPathValues.push(nodeValuesMap[targetNodeId]);
		// Store the updated path for the current node.
		pathValuesMap[targetNodeId] = currentPathValues;
		
		var connectedNodes = adjacencyList[targetNodeId]; // Get neighbors of the current node.
		if (connectedNodes) {
			// Iterate through neighbors to add them to the traversal queue.
			for (var loopIndex = 0; loopIndex < connectedNodes.length; loopIndex++) {
				var neighborNodeId = connectedNodes[loopIndex];
				// Avoid going back to the immediate parent node.
				if (parentNodeId != neighborNodeId) {
					traversalQueue.push([neighborNodeId, targetNodeId]); // Add neighbor and current node as its parent.
				}
			}
		}
	}
	
	// Start traversal from node 1, with a dummy parent -1.
	traversalQueue.push([1, -1]);
	// Loop to process the traversal queue. A large upper bound to prevent infinite loops.
	for (var debugCounter = 0; debugCounter < 10000000; debugCounter++) {
		var queueItem = traversalQueue.shift(); // Get the next item from the queue.
		exploreNodePath(queueItem[0], queueItem[1]); // Process the node.
		if (traversalQueue.length == 0) break; // Stop if the queue is empty.
	}
	
	// The original code has a `console.log` here and then `return;`
	// This means the subsequent loop for LIS calculation is unreachable.
	// This behavior must be preserved for Type II cloning.
	console.log(currentPathValues); // This `currentPathValues` refers to the last `wrtnNos` from the last `exploreNodePath` call.
	return; // Exit the function here, as per original behavior.
	
	// The following code block is unreachable due to the `return;` above.
	// It is kept for structural equivalence, but will never execute.
	for (var loopIndex = 1; loopIndex <= nodeCount; loopIndex++) {
		
		var currentPathList = pathValuesMap[loopIndex];
		var longestIncreasingSubsequence = [];

		for (var innerLoopIndex = 0; innerLoopIndex < currentPathList.length; innerLoopIndex++) {
			var currentValue = currentPathList[innerLoopIndex];
			if (longestIncreasingSubsequence.length == 0) {
				longestIncreasingSubsequence.push(currentValue);
			}
			// If current value is greater than the last element of LIS, append it.
			else if (currentValue > longestIncreasingSubsequence[longestIncreasingSubsequence.length - 1]) {
				longestIncreasingSubsequence.push(currentValue);
			}
			// If current value is less than or equal to the first element of LIS, replace the first element.
			else if (currentValue <= longestIncreasingSubsequence[0]) {
				longestIncreasingSubsequence[0] = currentValue;
			}
			// Otherwise, find the smallest element in LIS that is greater than or equal to currentValue
			// and replace it. This maintains the increasing property and potentially shortens the sequence.
			else {
				for (var subsequenceIndex = 1; subsequenceIndex < longestIncreasingSubsequence.length; subsequenceIndex++) {
					if (longestIncreasingSubsequence[subsequenceIndex-1] < currentValue && currentValue <= longestIncreasingSubsequence[subsequenceIndex]) {
						longestIncreasingSubsequence[subsequenceIndex] = currentValue;
						break;
					}
				}
			}
		}
		finalResults.push(longestIncreasingSubsequence.length);
	}
	
	console.log(finalResults.join("\n")); // This line is also unreachable.
}

// Execute the main processing function with an instance of the InputParser.
// Reads input from standard input using Node.js 'fs' module.
ProcessGraph(new InputParser(require("fs").readFileSync("/dev/stdin", "utf8")));

// Example usage of the InputParser (commented out in original, preserved here).
// ProcessGraph(new InputParser("33"));

// Further commented-out examples from the original, demonstrating parser methods.
// var stringValue = dataReader.getNextToken(); // Get a string.
// var integerValue = dataReader.getNextInteger(); // Get an integer.
// var decimalValue = dataReader.getNextDecimal(); // Get a floating-point number.
// var byteValue = dataReader.getNextByte(); // Get a byte array (conceptual).
// for (var delayLoop = 0; delayLoop < 1000000000; delayLoop++) var dummyVar = "some_text"; // A loop for artificial delay.
// console.log(currentPathValues); return; // Another example of logging and returning.
