const createInputReader = (function() {
    // Helper function to safely parse a string to a number
    function parseNumericValue(value) {
        return Number(value);
    }

    // InputReader class (renamed from g) manages the input source
    function InputReader(sourceString) {
        this._sourceLinesCache = sourceString.trim().split("\n");
        this._currentLinePointer = 0; // Tracks the index of the current line being processed
        this._currentLineTokens = []; // Cache for tokens of the current line, for `readSingleValue`
    }

    // Method to read a single value (number or string) from the current line
    InputReader.prototype.readSingleValue = function(asString) {
        // If current line tokens are exhausted, load the next line's tokens
        if (this._currentLineTokens.length === 0) {
            if (this._currentLinePointer >= this._sourceLinesCache.length) {
                // This scenario implies unexpected end of input based on problem constraints
                throw new Error("Attempted to read past end of input data.");
            }
            // Split the current line into tokens. The original `a` method effectively
            // consumed tokens from the beginning of the line using `reverse().pop()`.
            this._currentLineTokens = this._sourceLinesCache[this._currentLinePointer].split(" ");
        }
        const token = this._currentLineTokens.shift(); // Consume the first token

        // Only increment the line pointer if all tokens from the current line have been consumed
        if (this._currentLineTokens.length === 0) {
            this._currentLinePointer++;
        }
        return asString ? token : parseNumericValue(token);
    };

    // Method to read an entire line of values
    InputReader.prototype.readLineValues = function(asString) {
        if (this._currentLinePointer >= this._sourceLinesCache.length) {
            throw new Error("Attempted to read past end of input data.");
        }
        // Get the current line, split it, and then advance the line pointer
        const lineTokens = this._sourceLinesCache[this._currentLinePointer].split(" ");
        this._currentLinePointer++; // Advance to the next line immediately
        // Clear any remaining tokens from the previous `readSingleValue` call if any
        this._currentLineTokens = [];
        return asString ? lineTokens : lineTokens.map(parseNumericValue);
    };

    // Method to read a matrix (n lines of space-separated values)
    InputReader.prototype.readMatrixValues = function(numRows, asString) {
        const matrixRows = [];
        for (let i = 0; i < numRows; i++) {
            if (this._currentLinePointer >= this._sourceLinesCache.length) {
                throw new Error("Attempted to read past end of input data for matrix.");
            }
            const lineTokens = this._sourceLinesCache[this._currentLinePointer].split(" ");
            this._currentLinePointer++;
            matrixRows.push(asString ? lineTokens : lineTokens.map(parseNumericValue));
        }
        // Clear any remaining tokens from the previous `readSingleValue` call if any
        this._currentLineTokens = [];
        return matrixRows;
    };

    // Method to read raw lines (n lines as strings or numbers)
    InputReader.prototype.readRawLines = function(numLines, asString) {
        const rawLines = [];
        for (let i = 0; i < numLines; i++) {
            if (this._currentLinePointer >= this._sourceLinesCache.length) {
                throw new Error("Attempted to read past end of input data for raw lines.");
            }
            rawLines.push(this._sourceLinesCache[this._currentLinePointer]);
            this._currentLinePointer++;
        }
        // Clear any remaining tokens from the previous `readSingleValue` call if any
        this._currentLineTokens = [];
        // Original `r` method converts to numbers if `asString` is false
        return asString ? rawLines : rawLines.map(parseNumericValue);
    };

    // The factory function that creates an InputReader instance
    function readerFactory(sourceString) {
        return new InputReader(sourceString);
    }

    return readerFactory;
})();

// Renamed `o` to `inputData` for clarity
const inputData = createInputReader(require("fs").readFileSync("/dev/stdin", "utf8"));

// Renamed `xArray` to `createMultiDimArray`
function createMultiDimArray(fillValueExpression) {
    const dimensions = arguments;
    let dimIndex = dimensions.length - 1;
    // Construct the string for eval, starting from the innermost array
    let arrayCreationString = "Array(dimensions[" + dimIndex + "]).fill(0).map(x=>{return " + fillValueExpression + ";})";
    while (--dimIndex) {
        const currentDimSize = "dimensions[" + dimIndex + "]";
        arrayCreationString = "Array(" + currentDimSize + ").fill(0).map(x=>" + arrayCreationString + ")";
    }
    // Use a temporary constant for the final eval string for better readability
    const finalEvalString = arrayCreationString;
    return eval(finalEvalString);
}

// Helper function to perform a Breadth-First Search (BFS)
// Returns the farthest node found and its distance from the startNode
function performBFS(startNodeId, graphAdjacencyList) {
    let currentMaxDistance = 0;
    let farthestNodeInBFS = startNodeId;

    let currentLevelQueue = [[startNodeId, -1]]; // Queue for nodes in the current level: [nodeId, parentId]
    let nextLevelQueue = []; // Queue for nodes in the next level

    // Loop continues as long as there are nodes to process in current or next level
    while (currentLevelQueue.length > 0 || nextLevelQueue.length > 0) {
        // If the current level is exhausted, move to the next level
        if (currentLevelQueue.length === 0) {
            currentMaxDistance++; // Increment distance for the new level
            currentLevelQueue = nextLevelQueue; // Promote next level to current
            nextLevelQueue = []; // Clear the next level queue for new nodes
            // Update farthestNodeInBFS to the first node of the new deepest level.
            // This is crucial for finding one end of the diameter in the first BFS.
            farthestNodeInBFS = currentLevelQueue[0][0];
        }

        const currentNodeInfo = currentLevelQueue.pop(); // Get a node from the current level
        const currentNodeId = currentNodeInfo[0];
        const parentOfCurrentNode = currentNodeInfo[1];

        // Iterate through neighbors of the current node
        for (let neighborIndex = 0; neighborIndex < graphAdjacencyList[currentNodeId].length; neighborIndex++) {
            const neighborNodeId = graphAdjacencyList[currentNodeId][neighborIndex];
            // Avoid going back to the parent node to prevent infinite loops in undirected graphs
            if (parentOfCurrentNode !== neighborNodeId) {
                nextLevelQueue.push([neighborNodeId, currentNodeId]); // Add neighbor to the next level queue
            }
        }
    }
    return { farthestNode: farthestNodeInBFS, distance: currentMaxDistance };
}

// Renamed `treeDia` to `calculateTreeDiameter`
function calculateTreeDiameter(graphAdjacencyList) {
    // Step 1: Perform the first BFS from an arbitrary node (node 0)
    // to find one of the farthest nodes in the tree.
    const firstBFSResult = performBFS(0, graphAdjacencyList);
    const oneEndOfDiameterNode = firstBFSResult.farthestNode;

    // Step 2: Perform the second BFS starting from the farthest node found in the first BFS.
    // The maximum distance found in this second BFS is the tree's diameter.
    const secondBFSResult = performBFS(oneEndOfDiameterNode, graphAdjacencyList);
    const diameterLength = secondBFSResult.distance;

    return diameterLength;
}

// Main execution logic
console.log(main());

function main() {
    const NODE_OFFSET_FOR_INPUT = 1; // Input node IDs are 1-indexed, convert to 0-indexed

    const nodeCount = inputData.readSingleValue(); // Read N, the number of nodes
    
    // `placeholderArray` is unused in the original logic, but kept for structural similarity
    const placeholderArray = createMultiDimArray(NODE_OFFSET_FOR_INPUT, nodeCount);
    
    // Initialize adjacency list for the graph/tree. Each element is an empty array.
    const adjacencyList = createMultiDimArray("[]", nodeCount);

    // Loop to read N-1 edges and build the adjacency list
    for (let edgeIndex = 0; edgeIndex < nodeCount - NODE_OFFSET_FOR_INPUT; edgeIndex++) {
        // Read a line with two node IDs, then convert them to 0-indexed
        const currentEdgeNodes = inputData.readLineValues().map(nodeId => nodeId - NODE_OFFSET_FOR_INPUT);
        
        const nodeA = currentEdgeNodes[0];
        const nodeB = currentEdgeNodes[1];

        // Add bidirectional edges to the adjacency list
        adjacencyList[nodeA].push(nodeB);
        adjacencyList[nodeB].push(nodeA);
    }

    // Calculate the tree diameter using the two-BFS approach
    const treeDiameterValue = calculateTreeDiameter(adjacencyList);

    // Determine the output based on the diameter modulo 3
    // If (diameter % 3) is 1, output "Second", otherwise "First"
    return treeDiameterValue % 3 === NODE_OFFSET_FOR_INPUT ? "Second" : "First";
}
