function InputParser(sourceText) {
    // Initialize the parser instance
    const instance = this;
    instance.currentIndex = 0; // Tracks the current token position
    instance.originalString = sourceText; // Stores the raw input string

    // Immediately process the input string into an array of tokens
    instance.tokenizedStrings = (function(processingTarget) {
        const parsedTokens = []; // Array to hold the cleaned and split tokens
        // Replace multiple newlines, spaces, and tabs with a single space
        const cleanedTarget = processingTarget.replace(/[\n \t]+/g, ' ');
        // Split the cleaned string by spaces
        const splitParts = cleanedTarget.split(' ');
        // Populate the parsedTokens array
        for (let idx = 0, totalLength = splitParts.length; idx < totalLength; idx++) {
            parsedTokens.push(splitParts[idx]);
        }
        return parsedTokens;
    }(sourceText)); // Pass the original sourceText to the IIFE

    /**
     * Retrieves the next string token from the input.
     * @returns {string|null} The next token or null if no more tokens.
     */
    instance.getNextToken = function() {
        const tokenValue = instance.tokenizedStrings[instance.currentIndex];
        instance.currentIndex++; // Advance the token pointer
        return (tokenValue !== null && tokenValue !== undefined) ? tokenValue : null;
    };

    /**
     * Retrieves the next token as an integer.
     * @returns {number|null} The next integer or null if no more tokens.
     */
    instance.getNextInteger = function() {
        const tokenValue = instance.tokenizedStrings[instance.currentIndex];
        instance.currentIndex++; // Advance the token pointer
        return (tokenValue !== null && tokenValue !== undefined) ? parseInt(tokenValue, 10) : null;
    };

    /**
     * Retrieves the next token as a floating-point number (BigDecimal equivalent).
     * @returns {number|null} The next float or null if no more tokens.
     */
    instance.getNextDecimal = function() {
        const tokenValue = instance.tokenizedStrings[instance.currentIndex];
        instance.currentIndex++; // Advance the token pointer
        return (tokenValue !== null && tokenValue !== undefined) ? parseFloat(tokenValue) : null;
    };

    /**
     * Retrieves the next token as a byte array (Int8Array).
     * Note: This interpretation might be specific to the original problem context.
     * @returns {Int8Array|null} The next byte array or null.
     */
    instance.getNextByte = function() {
        const tokenValue = instance.tokenizedStrings[instance.currentIndex];
        instance.currentIndex++; // Advance the token pointer
        return (tokenValue !== null && tokenValue !== undefined) ? new Int8Array(tokenValue) : null;
    };
}

function ProcessGraph(dataReader) {
    // Read the total number of nodes in the graph
    const nodeCount = dataReader.getNextInteger();
    const finalResults = []; // Array to store the final computed lengths (though currently unreachable)

    // Map to store the value associated with each node ID
    // Using a global-like variable as in the original, though 'let' or 'const' would be better practice.
    nodeValues = {};
    for (let loopIndex = 0; loopIndex < nodeCount; loopIndex++) {
        nodeValues[loopIndex + 1] = dataReader.getNextInteger();
    }

    // Adjacency list representation of the graph (undirected)
    adjacencyMap = {};
    for (let loopIndex = 0; loopIndex < nodeCount - 1; loopIndex++) {
        const nodeA = dataReader.getNextInteger();
        const nodeB = dataReader.getNextInteger();

        // Add edge (nodeA, nodeB)
        if (!adjacencyMap[nodeA]) {
            adjacencyMap[nodeA] = [nodeB];
        } else {
            adjacencyMap[nodeA].push(nodeB);
        }

        // Add edge (nodeB, nodeA) for undirected graph
        if (!adjacencyMap[nodeB]) {
            adjacencyMap[nodeB] = [nodeA];
        } else {
            adjacencyMap[nodeB].push(nodeA);
        }
    }

    // Data structures for graph traversal and path value accumulation
    // Stores the concatenated string of values encountered on the path to a node
    pathValueStrings = {};
    // Queue for nodes to visit in a BFS-like manner, storing [currentNodeId, previousNodeId]
    nodesToVisit = [];

    /**
     * Recursively (or iteratively via queue) traverses the graph,
     * accumulating node values along paths.
     * @param {number} currentNodeId - The ID of the node currently being processed.
     * @param {number} previousNodeId - The ID of the node from which currentNodeId was reached.
     */
    traverseNode = function (currentNodeId, previousNodeId) {
        // Get the accumulated path values from the previous node, or an empty string if starting
        let currentPathValues = (pathValueStrings[previousNodeId]) ? pathValueStrings[previousNodeId] : '';

        // Append the current node's value to the path string and store it
        currentPathValues += (nodeValues[currentNodeId] + ',');
        pathValueStrings[currentNodeId] = currentPathValues;

        // Get neighbors of the current node
        const connectedNodes = adjacencyMap[currentNodeId];

        if (connectedNodes) {
            // Iterate through neighbors
            for (let loopIndex = 0; loopIndex < connectedNodes.length; loopIndex++) {
                const neighborNodeId = connectedNodes[loopIndex];
                // If the neighbor hasn't been visited (i.e., its path string hasn't been set yet)
                if (!pathValueStrings[neighborNodeId]) {
                    // Add it to the queue for future processing
                    nodesToVisit.push([neighborNodeId, currentNodeId]);
                }
            }
        }
    };

    // Start the traversal from node 1, with -1 indicating no previous node
    nodesToVisit.push([1, -1]);

    // Loop to process nodes from the queue. The large iterationGuard is a safeguard
    // against infinite loops in case of graph issues, effectively acting as a while(true) with a limit.
    for (let iterationGuard = 0; iterationGuard < 10_000_000; iterationGuard++) {
        const currentTraversalPair = nodesToVisit.shift(); // Get the next node to process
        traverseNode(currentTraversalPair[0], currentTraversalPair[1]); // Process it
        if (nodesToVisit.length === 0) {
            break; // Exit if no more nodes to visit
        }
    }

    // The original code has a 'return;' statement here, making the subsequent LIS calculation unreachable.
    // This behavior must be preserved.
    return;

    // The following block is unreachable due to the 'return;' above.
    // It calculates the length of the Longest Increasing Subsequence (LIS) for each path.
    for (let loopIndex = 1; loopIndex <= nodeCount; loopIndex++) {
        const pathTokens = pathValueStrings[loopIndex].split(',');
        pathTokens.pop(); // Remove the last empty string resulting from the trailing comma
        const longestIncreasingSubsequence = []; // Stores the LIS for the current path

        for (let tokenIndex = 0; tokenIndex < pathTokens.length; tokenIndex++) {
            const currentValue = parseInt(pathTokens[tokenIndex], 10); // Convert token to number
            if (longestIncreasingSubsequence.length === 0) {
                longestIncreasingSubsequence.push(currentValue);
            }
            // If current value is greater than the last element of LIS, extend LIS
            else if (currentValue > longestIncreasingSubsequence[longestIncreasingSubsequence.length - 1]) {
                longestIncreasingSubsequence.push(currentValue);
            }
            // If current value is less than or equal to the first element of LIS, replace the first element
            else if (currentValue <= longestIncreasingSubsequence[0]) {
                longestIncreasingSubsequence[0] = currentValue;
            }
            // Otherwise, find the smallest element in LIS that is greater than or equal to currentValue
            // and replace it. This maintains the LIS property while keeping it as short as possible.
            else {
                for (let lisIndex = 1; lisIndex < longestIncreasingSubsequence.length; lisIndex++) {
                    if (longestIncreasingSubsequence[lisIndex - 1] < currentValue && currentValue <= longestIncreasingSubsequence[lisIndex]) {
                        longestIncreasingSubsequence[lisIndex] = currentValue;
                        break;
                    }
                }
            }
        }
        finalResults.push(longestIncreasingSubsequence.length);
    }

    // Output the results, each on a new line.
    console.log(finalResults.join('\n'));
}

// Main execution block:
// Creates an InputParser instance with content read from standard input,
// then passes it to the ProcessGraph function.
ProcessGraph(new InputParser(require('fs').readFileSync('/dev/stdin', 'utf8')));

// Original commented-out lines (preserved as comments)
// Main(new Scanner("33"));

// var str1 = sc.next(); // Stringで取得
// var int1 = sc.nextInt(); // intで取得
// var bd1 = sc.nextBigDecimal(); // BigDecimalで取得
// var byte1 = sc.nextByte(); // byteで取得
// for (var i = 0; i < 1000000000; i++) var toDelay = "aaa"; // 1000msくらいの遅延
// console.log(wrtnNos); return;
