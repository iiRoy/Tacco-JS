function InputProcessor(sourceData) {
    // Reference to the current instance of the input processor.
    let currentInstance = this;

    // Initialize the internal pointer for tokens.
    currentInstance.tokenPosition = 0;

    // Store the original raw input string.
    currentInstance.initialString = sourceData;

    // Immediately invoked function to parse the input string into an array of tokens.
    currentInstance.parsedTokens = (function(rawData) {
        // An array to accumulate the individual tokens.
        let tokenCollection = [];
        // Normalize whitespace: replace newlines, spaces, and tabs with a single space.
        let cleanedData = rawData.replace(/[\n \t]+/g, " ");
        // Split the cleaned string by spaces to get individual parts.
        let parts = cleanedData.split(" ");
        // Iterate through the parts and add each to the token collection.
        for (let partIndex = 0, totalParts = parts.length; partIndex < totalParts; partIndex++) {
            tokenCollection.push(parts[partIndex]);
        }
        return tokenCollection;
    }(sourceData)); // Pass the original source data to the IIFE.

    // Method to retrieve the next string token from the parsed list.
    currentInstance.retrieveNext = function() {
        let currentToken = currentInstance.parsedTokens[currentInstance.tokenPosition];
        currentInstance.tokenPosition++; // Advance the token pointer.
        // Return the token if it exists, otherwise return null.
        return (currentToken !== undefined && currentToken !== null) ? currentToken : null;
    };

    // Method to retrieve the next integer token.
    currentInstance.retrieveNextInt = function() {
        let currentToken = currentInstance.parsedTokens[currentInstance.tokenPosition];
        currentInstance.tokenPosition++; // Advance the token pointer.
        // Parse the token as an integer with base 10.
        return (currentToken !== undefined && currentToken !== null) ? parseInt(currentToken, 10) : null;
    };

    // Method to retrieve the next floating-point number token.
    currentInstance.retrieveNextFloat = function() {
        let currentToken = currentInstance.parsedTokens[currentInstance.tokenPosition];
        currentInstance.tokenPosition++; // Advance the token pointer.
        // Parse the token as a floating-point number.
        return (currentToken !== undefined && currentToken !== null) ? parseFloat(currentToken) : null;
    };

    // Method to retrieve the next token as an Int8Array (preserving original behavior).
    currentInstance.retrieveNextByte = function() {
        let currentToken = currentInstance.parsedTokens[currentInstance.tokenPosition];
        currentInstance.tokenPosition++; // Advance the token pointer.
        // Create a new Int8Array from the token.
        return (currentToken !== undefined && currentToken !== null) ? new Int8Array(currentToken) : null;
    };
}

function ExecuteAlgorithm(inputReader) {
    // Read the total number of nodes from the input.
    const totalNodes = inputReader.retrieveNextInt();
    // An array to store the final computed results for each node.
    const finalResults = [];

    // Object to store the value associated with each node ID.
    let nodeValueMap = {};
    // Populate the node value map by reading N integers.
    for (let nodeIndex = 0; nodeIndex < totalNodes; nodeIndex++) {
        nodeValueMap[nodeIndex + 1] = inputReader.retrieveNextInt();
    }

    // Object to represent the graph's adjacency list.
    let graphAdjacency = {};
    // Read N-1 edges to build the graph connections.
    for (let edgeIndex = 0; edgeIndex < totalNodes - 1; edgeIndex++) {
        const nodeOne = inputReader.retrieveNextInt();
        const nodeTwo = inputReader.retrieveNextInt();

        // Add nodeTwo to nodeOne's adjacency list.
        if (!graphAdjacency[nodeOne]) {
            graphAdjacency[nodeOne] = [nodeTwo];
        } else {
            graphAdjacency[nodeOne].push(nodeTwo);
        }

        // Add nodeOne to nodeTwo's adjacency list (for an undirected graph).
        if (!graphAdjacency[nodeTwo]) {
            graphAdjacency[nodeTwo] = [nodeOne];
        } else {
            graphAdjacency[nodeTwo].push(nodeOne);
        }
    }

    // Object to store the sequence of values encountered on the path from the root to each node.
    let pathValueSequences = {};

    // Recursive function to traverse the tree and collect path values.
    const traverseTree = function (currentNodeIdentifier, previousNodeIdentifier, currentPathValues) {
        // Create a shallow copy of the current path values to ensure independent paths for branches.
        let updatedPathValues = currentPathValues.slice();
        // Add the value of the current node to its path sequence.
        updatedPathValues.push(nodeValueMap[currentNodeIdentifier]);
        // Store the complete path value sequence for the current node.
        pathValueSequences[currentNodeIdentifier] = updatedPathValues;

        // Get the list of nodes connected to the current node.
        const neighbors = graphAdjacency[currentNodeIdentifier];

        // If the current node has neighbors, iterate through them.
        if (neighbors) {
            for (let neighborIndex = 0; neighborIndex < neighbors.length; neighborIndex++) {
                const nextNodeIdentifier = neighbors[neighborIndex];
                // Recursively call traverseTree for neighbors, avoiding the parent node.
                if (previousNodeIdentifier !== nextNodeIdentifier) {
                    traverseTree(nextNodeIdentifier, currentNodeIdentifier, updatedPathValues);
                }
            }
        }
    };

    // Initiate the tree traversal starting from node 1, with no parent (-1), and an empty path.
    traverseTree(1, -1, []);

    // Process the path value sequence for each node to compute the final result.
    for (let nodeId = 1; nodeId <= totalNodes; nodeId++) {
        const currentPath = pathValueSequences[nodeId];
        const processedSequence = []; // This array will store the modified sequence.

        // Iterate through each value in the current node's path.
        for (let valueIndex = 0; valueIndex < currentPath.length; valueIndex++) {
            const currentPathValue = currentPath[valueIndex];

            // If the processed sequence is empty, simply add the current value.
            if (processedSequence.length === 0) {
                processedSequence.push(currentPathValue);
            }
            // If the current value is greater than the last element in the processed sequence, append it.
            else if (currentPathValue > processedSequence[processedSequence.length - 1]) {
                processedSequence.push(currentPathValue);
            }
            // If the current value is less than or equal to the first element, replace the first element.
            else if (currentPathValue <= processedSequence[0]) {
                processedSequence[0] = currentPathValue;
            }
            // Otherwise, find the correct position to replace an element in the middle.
            else {
                for (let searchPosition = 1; searchPosition < processedSequence.length; searchPosition++) {
                    // Find the first element `processedSequence[searchPosition]` such that
                    // `processedSequence[searchPosition - 1] < currentPathValue <= processedSequence[searchPosition]`.
                    if (processedSequence[searchPosition - 1] < currentPathValue && currentPathValue <= processedSequence[searchPosition]) {
                        processedSequence[searchPosition] = currentPathValue;
                        break; // Exit the inner loop once a replacement is made.
                    }
                }
            }
        }
        // Add the length of the final processed sequence for the current node to the results.
        finalResults.push(processedSequence.length);
    }

    // Output the final results, with each result on a new line.
    console.log(finalResults.join("\n"));
}

// Execute the main algorithm by creating an InputProcessor instance
// that reads from standard input.
ExecuteAlgorithm(new InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8")));
