/*
 * This module provides utilities for tokenizing input data
 * and processing a specific graph traversal problem.
 */
function Tokenizer(textInput)
{
	// Reference to the current object instance
	const instance = this;
	
	// Current index for token retrieval
	instance.tokenIndex = 0;
	
	// The original raw text provided
	instance.originalText = textInput;
	
	// Process the input string into an array of tokens
	instance.parsedTokens = (function(sourceString) {
		// Array to store the resulting tokens
		let tokenArray = [ ];
		
		// Normalize whitespace: replace multiple newlines/spaces/tabs with a single space
		let normalizedString = sourceString.replace(/[\s\t\n]+/g, " ");
		
		// Split the normalized string by spaces to get individual parts
		let parts = normalizedString.split(" ");
		
		// Iterate through the parts and add them to the token array
		for (let idx = 0, totalParts = parts.length; idx < totalParts; idx++) {
			tokenArray.push(parts[idx]);
		}
		
		// Return the array of tokens
		return tokenArray;
	} (textInput)); // Immediately invoke with the original input
	
	/**
	 * Retrieves the next available token as a string.
	 * @returns {string|null} The next token or null if no more tokens.
	 */
	instance.getNextToken = function()
	{
		let currentElement = instance.parsedTokens[instance.tokenIndex];
		instance.tokenIndex++; // Advance the token index
		return (currentElement !== undefined) ? currentElement : null;
	};
	
	/**
	 * Retrieves the next available token and converts it to an integer.
	 * @returns {number|null} The next token as an integer or null if no more tokens.
	 */
	instance.getNextInteger = function() {
		let currentElement = instance.parsedTokens[instance.tokenIndex];
		instance.tokenIndex++;
		return (currentElement !== undefined) ? Number.parseInt(currentElement, 10) : null;
	};
	
	/**
	 * Retrieves the next available token and converts it to a floating-point number.
	 * @returns {number|null} The next token as a float or null if no more tokens.
	 */
	instance.getNextDecimal = function() {
		let currentElement = instance.parsedTokens[instance.tokenIndex];
		instance.tokenIndex++;
		return (currentElement !== undefined) ? Number.parseFloat(currentElement) : null;
	};
	
	/**
	 * Retrieves the next available token and attempts to create an Int8Array from it.
	 * Note: This might not behave as expected for single byte values.
	 * @returns {Int8Array|null} An Int8Array or null if no more tokens.
	 */
	instance.getNextByteValue = function() {
		let currentElement = instance.parsedTokens[instance.tokenIndex];
		instance.tokenIndex++;
		return (currentElement !== undefined) ? new Int8Array(currentElement) : null;
	};

}


// Main processing function for the problem
function ProcessInput(dataExtractor) {

	// Read the total number of nodes
	const countNodes = dataExtractor.getNextInteger();
	
	// Array to store the final computed results
	const finalResults = [];
	
	// Map to store values associated with each node ID
	let nodeValues = {};
	for (let idx = 0; idx < countNodes; idx++) {
		nodeValues[idx + 1] = dataExtractor.getNextInteger();
	}
	
	// Adjacency list representation of the graph (tree)
	let adjacencyList = {};
	// Process N-1 edges to build the graph
	for (let edgeIdx = 0; edgeIdx < countNodes - 1; edgeIdx++) {
		let nodeA = dataExtractor.getNextInteger();
		let nodeB = dataExtractor.getNextInteger();
		
		// Add connections for nodeA
		if (!adjacencyList[nodeA]) adjacencyList[nodeA] = [nodeB];
		else adjacencyList[nodeA].push(nodeB);
		
		// Add connections for nodeB (undirected graph)
		if (!adjacencyList[nodeB]) adjacencyList[nodeB] = [nodeA];
		else adjacencyList[nodeB].push(nodeA);
	}
	
	// Map to store accumulated path values for each node
	let pathAccumulations = {};
	// Queue for breadth-first traversal
	let traverseQueue = [];
	
	// Global variable to hold the last computed path values (due to original code's implicit global usage)
	let currentPathValuesGlobal;

	/**
	 * Recursively explores a path in the tree, accumulating node values.
	 * @param {number} currentNodeId The ID of the node currently being visited.
	 * @param {number} previousNodeId The ID of the node from which the current node was reached.
	 */
	let explorePath = function (currentNodeId, previousNodeId) {
		// Initialize path with values from the previous node, or an empty array
		currentPathValuesGlobal = (pathAccumulations[previousNodeId]) ? pathAccumulations[previousNodeId].slice() : [];
		
		// Add the current node's value to the path
		currentPathValuesGlobal.push(nodeValues[currentNodeId]);
		
		// Store the accumulated path for the current node
		pathAccumulations[currentNodeId] = currentPathValuesGlobal;
		
		// Get connected nodes from the adjacency list
		let connectedNodes = adjacencyList[currentNodeId];
		if (connectedNodes) {
			// Iterate through neighbors
			for (let neighborIdx = 0; neighborIdx < connectedNodes.length; neighborIdx++) {
				let neighborNode = connectedNodes[neighborIdx];
				// If the neighbor is not the node we just came from, add it to the queue for traversal
				if (previousNodeId !== neighborNode) {
					traverseQueue.push([neighborNode, currentNodeId]);
				}
			}
		}
	};
	
	// Start traversal from node 1, with -1 indicating no previous node
	traverseQueue.push([1, -1]);
	
	// Loop to process the traversal queue (simulating iterative BFS/DFS)
	for (let loopCounter = 0; loopCounter < 10000000; loopCounter++) { // Safety break for very large graphs
		let currentTraversal = traverseQueue.shift(); // Get the next node to visit
		explorePath(currentTraversal[0], currentTraversal[1]); // Process the current node
		if (traverseQueue.length === 0) break; // Exit if the queue is empty
	}
	
	// Output the last processed path (likely for debugging, replicating original behavior)
	console.log(currentPathValuesGlobal);
	
	// The following code block is unreachable due to the 'return;' statement above.
	// It is included to maintain the exact structure of the original code.
	return;
	
	// This part of the code calculates the length of the longest increasing subsequence
	// for each accumulated path, but it is currently unreachable.
	for (let nodeIdentifier = 1; nodeIdentifier <= countNodes; nodeIdentifier++) {
		
		let currentPathSequence = pathAccumulations[nodeIdentifier];
		let longestIncreasingSubsequence = [];

		for (let elementIdx = 0; elementIdx < currentPathSequence.length; elementIdx++) {
			let currentElement = currentPathSequence[elementIdx];
			
			// If the LIS is empty, just add the current element
			if (longestIncreasingSubsequence.length === 0) {
				longestIncreasingSubsequence.push(currentElement);
			}
			// If the current element is greater than the last element of LIS, append it
			else if (currentElement > longestIncreasingSubsequence[longestIncreasingSubsequence.length - 1]) {
				longestIncreasingSubsequence.push(currentElement);
			}
			// If the current element is less than or equal to the first element of LIS, replace the first element
			else if (currentElement <= longestIncreasingSubsequence[0]) {
				longestIncreasingSubsequence[0] = currentElement;
			}
			// If the current element falls somewhere in the middle, find the smallest element in LIS
			// that is greater than or equal to currentElement and replace it.
			else {
				for (let searchIdx = 1; searchIdx < longestIncreasingSubsequence.length; searchIdx++) {
					if (longestIncreasingSubsequence[searchIdx - 1] < currentElement && currentElement <= longestIncreasingSubsequence[searchIdx]) {
						longestIncreasingSubsequence[searchIdx] = currentElement;
						break;
					}
				}
			}
		}
		// Store the length of the computed LIS for this path
		finalResults.push(longestIncreasingSubsequence.length);
	}
	
	// Output the final results, joined by newlines
	console.log(finalResults.join("\n"));
}

// Entry point: Initialize the process with input from standard input
ProcessInput(new Tokenizer(require('fs').readFileSync('/dev/stdin', 'utf8')));

// Example usage with a hardcoded string input (commented out)
// ProcessInput(new Tokenizer("33"));


// --- Additional commented-out notes (for reference, replicating original comments) ---

// let stringValue = dataExtractor.getNextToken(); // Retrieve as a string
// let integerValue = dataExtractor.getNextInteger(); // Retrieve as an integer
// let decimalValue = dataExtractor.getNextDecimal(); // Retrieve as a floating-point number
// let byteArrayValue = dataExtractor.getNextByteValue(); // Retrieve as an 8-bit integer array
// for (let delayCount = 0; delayCount < 1000000000; delayCount++) { let tempVar = "dummy"; } // Introduce an artificial delay of approximately 1000ms
// console.log(currentPathValuesGlobal); // Replicating original debug output (global variable)
// return; // Replicating original early exit