// Input parsing utility for competitive programming
const InputDataProcessor = (function() {
    /**
     * Entry point for creating a new text data parser instance.
     * @param {string} sourceContent Raw string content to parse.
     * @returns {TextContentParser} A new parser object.
     */
    function createParserInstance(sourceContent) {
        // Basic validation: ensure sourceContent is a string
        if (typeof sourceContent !== 'string') {
            console.error("InputDataProcessor: Source content must be a string.");
            return new TextContentParser(""); // Return a safe empty parser
        }
        return new TextContentParser(sourceContent);
    }

    /**
     * Handles parsing of text content line by line.
     * @class
     */
    function TextContentParser(initialText) {
        // Normalize line endings and split into an array of lines.
        // Also, filter out any truly empty lines resulting from multiple newlines.
        this._rawInputLines = initialText.replace(/\r\n/g, '\n').trim().split('\n').filter(line => line.length > 0);
        this._currentLinePointer = 0; // Tracks the current line being processed.

        // Initialize a cache for tokens that are read one by one from a line
        this._currentTokenBuffer = [];
    }

    /**
     * Retrieves the next individual token from the input.
     * If the current line is exhausted, it moves to the next line.
     * @param {boolean} [returnAsString=false] If true, returns the token as a string; otherwise, attempts conversion to number.
     * @returns {string|number|null} The next token, or null if no more input.
     */
    TextContentParser.prototype.getNextScalar = function(returnAsString = false) {
        // Ensure the buffer is filled if empty or if we need to advance to the next line.
        if (this._currentTokenBuffer.length === 0) {
            if (this._currentLinePointer >= this._rawInputLines.length) {
                return null; // No more lines to process
            }
            // Split the current line into tokens and filter out empty strings.
            const currentLine = this._rawInputLines[this._currentLinePointer];
            this._currentTokenBuffer = currentLine.split(/\s+/).filter(token => token.length > 0);
            
            // Advance the line pointer after processing the line.
            this._currentLinePointer++; 
        }
        
        // Take the first token from the buffer.
        let nextToken = this._currentTokenBuffer.shift();

        if (nextToken === undefined) { 
             return null; // Should ideally not happen if buffer was just filled.
        }

        // Return based on desired type
        return returnAsString ? nextToken : Number(nextToken);
    };

    /**
     * Reads a full line of input and returns its space-separated tokens.
     * Advances the line pointer.
     * @param {boolean} [returnStrings=false] If true, returns tokens as strings; otherwise, attempts conversion to numbers.
     * @returns {Array<string|number>} An array of tokens from the line.
     */
    TextContentParser.prototype.readFullLineTokens = function(returnStrings = false) {
        if (this._currentLinePointer >= this._rawInputLines.length) {
            return []; // No more lines
        }
        const lineContent = this._rawInputLines[this._currentLinePointer++];
        const tokens = lineContent.split(/\s+/).filter(token => token.length > 0);
        
        // Clear any leftover tokens in the buffer as we're reading a full line
        this._currentTokenBuffer = []; 

        return returnStrings ? tokens : tokens.map(token => Number(token));
    };

    /**
     * Reads a specified number of lines and parses each into an array of tokens, forming a matrix.
     * @param {number} numLines The number of lines to read.
     * @param {boolean} [returnStrings=false] If true, returns tokens as strings; otherwise, attempts conversion to numbers.
     * @returns {Array<Array<string|number>>} A 2D array (matrix) of tokens.
     */
    TextContentParser.prototype.readBlockAsMatrix = function(numLines, returnStrings = false) {
        const matrixData = [];
        // Type III: Explicit loop instead of slice for structural change
        for (let i = 0; i < numLines; i++) {
            if (this._currentLinePointer >= this._rawInputLines.length) {
                break; // Ran out of lines prematurely
            }
            matrixData.push(this.readFullLineTokens(returnStrings));
        }
        return matrixData;
    };

    /**
     * Reads a specified number of lines directly as an array, without splitting into tokens.
     * @param {number} numLines The number of lines to read.
     * @param {boolean} [returnStrings=false] If true, returns lines as strings; otherwise, attempts conversion to numbers.
     * @returns {Array<string|number>} An array of lines.
     */
    TextContentParser.prototype.readBlockOfLines = function(numLines, returnStrings = false) {
        const lineBlock = [];
        // Type III: Explicit loop instead of slice for structural change
        for (let i = 0; i < numLines; i++) {
            if (this._currentLinePointer >= this._rawInputLines.length) {
                break; // Ran out of lines prematurely
            }
            const currentLine = this._rawInputLines[this._currentLinePointer++];
            lineBlock.push(returnStrings ? currentLine : Number(currentLine));
        }
        return lineBlock;
    };

    return createParserInstance;
})();

/**
 * Recursively creates a multi-dimensional array with specified dimensions,
 * initializing leaf elements using a provided factory function.
 * This function replaces the original `xArray` which used `eval`.
 * @param {function(): any} leafElementFactory A function that returns the desired initial value for each leaf element (e.g., `() => new Set()`).
 * @param {...number} dimensions A list of integers representing the size of each dimension.
 * @returns {Array<any>} A multi-dimensional array.
 */
function createNestedArray(leafElementFactory, ...dimensions) {
    // Type III: Added a guard for invalid dimensions.
    if (dimensions.some(dim => !Number.isInteger(dim) || dim < 0)) {
        console.error("createNestedArray: All dimensions must be non-negative integers.");
        return [];
    }

    // Base case: If no more dimensions, create the leaf element.
    if (dimensions.length === 0) {
        return leafElementFactory();
    }

    const currentDimensionSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);
    const resultArray = new Array(currentDimensionSize);

    for (let currentIdx = 0; currentIdx < currentDimensionSize; currentIdx++) {
        resultArray[currentIdx] = createNestedArray(leafElementFactory, ...remainingDimensions);
    }
    return resultArray;
}

// Initialize the input parser by reading from standard input.
const inputParserInstance = InputDataProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

// The main function encapsulating the problem's solution logic.
function solveGraphCostAssignment() {
    // Read the total number of nodes (N) from the input.
    const numberOfGraphNodes = inputParserInstance.getNextScalar();

    // Initialize an adjacency list for the graph. Each node gets a Set to store its neighbors.
    // Type III: Changed `xArray("new Set()",n)` to `createNestedArray(() => new Set(), numberOfGraphNodes)`.
    const graphAdjacencyLists = createNestedArray(() => new Set(), numberOfGraphNodes);

    // Keep track of nodes that are still active/unprocessed in the graph.
    const currentlyActiveNodes = new Set();
    
    // Add the first node (index 0) to the active set initially, if nodes exist.
    // Type III: Added a check for numberOfGraphNodes.
    if (numberOfGraphNodes > 0) {
        currentlyActiveNodes.add(0);
    }

    // Read N-1 edges and build the adjacency list.
    for (let nodeIdx = 1; nodeIdx < numberOfGraphNodes; nodeIdx++) {
        // Read two node indices for an edge. Adjust to 0-based indexing.
        const edgeDefinition = inputParserInstance.readFullLineTokens();
        
        // Type III: Input validation for edge data.
        if (!Array.isArray(edgeDefinition) || edgeDefinition.length < 2) {
            console.warn(`Skipping malformed edge definition at line ${inputParserInstance._currentLinePointer - 1}: ${edgeDefinition}`);
            continue; // Skip to the next iteration if input is bad
        }

        const nodeA_zeroBased = edgeDefinition[0] - 1;
        const nodeB_zeroBased = edgeDefinition[1] - 1;

        // Add bidirectional connections.
        graphAdjacencyLists[nodeA_zeroBased].add(nodeB_zeroBased);
        graphAdjacencyLists[nodeB_zeroBased].add(nodeA_zeroBased);
        
        // Add the current node index to the set of active nodes.
        currentlyActiveNodes.add(nodeIdx);
    }

    // Read the cost values and sort them in ascending order.
    // These costs will be assigned to nodes.
    const sortedCostValues = inputParserInstance.readFullLineTokens().sort((val1, val2) => val1 - val2);

    // `costPointer` tracks the next available cost value to assign.
    // `totalAssignedCostSum` accumulates the costs assigned to nodes.
    // `nodeCostAssignmentResults` stores the final cost assigned to each node.
    // Type III: Combined and clarified variable declarations from `var p = 0, ans = Array(n), x = 0;`
    let costPointer = 0;
    let totalAssignedCostSum = 0;
    const nodeCostAssignmentResults = new Array(numberOfGraphNodes);

    // The main loop: continues as long as there are costs to assign (and thus nodes to process).
    // This simulates removing leaves from the graph layer by layer.
    while (costPointer < numberOfGraphNodes) {
        // Collect nodes that are "leaves" in the current iteration (degree 1 or 0 if it's the last node).
        const nodesToProcessInCurrentPass = [];

        // Iterate through all currently active nodes.
        for (const currentNodeId of currentlyActiveNodes) {
            // A node is considered a "leaf" if it has 1 or fewer neighbors.
            // For N > 1, a leaf has 1 neighbor. If N == 1, the single node has 0 neighbors and is a leaf.
            const neighborCount = graphAdjacencyLists[currentNodeId].size;

            // Type III: More verbose check, potentially adding a debug print.
            if (neighborCount > 1) {
                // Not a leaf, skip for now.
                continue;
            }

            // This node is a leaf (or the last remaining isolated node).
            // Add it to the list for processing in this pass.
            nodesToProcessInCurrentPass.push(currentNodeId);
            
            // Assign the smallest available cost to this node.
            nodeCostAssignmentResults[currentNodeId] = sortedCostValues[costPointer++];
            
            // Add this assigned cost to the total sum.
            totalAssignedCostSum += nodeCostAssignmentResults[currentNodeId];
        }

        // Now, remove the processed "leaf" nodes and update their neighbors.
        for (const processedNodeId of nodesToProcessInCurrentPass) {
            // For each neighbor of the node being removed:
            for (const neighborId of graphAdjacencyLists[processedNodeId]) {
                // Remove the processed node from its neighbor's adjacency list.
                // Type III: Add a check to ensure the neighbor exists and has the processed node.
                if (graphAdjacencyLists[neighborId] && graphAdjacencyLists[neighborId].has(processedNodeId)) {
                    graphAdjacencyLists[neighborId].delete(processedNodeId);
                }
            }
            // Remove the processed node from the set of active nodes.
            currentlyActiveNodes.delete(processedNodeId);
        }
    }

    // The problem requires printing the total assigned cost minus the largest cost.
    // This is because the largest cost is effectively assigned to the "root" or last remaining node,
    // which in some problem interpretations is not counted towards a specific sum.
    const finalLargestCost = sortedCostValues[numberOfGraphNodes - 1];
    const adjustedTotalCost = totalAssignedCostSum - finalLargestCost;
    console.log(adjustedTotalCost);

    // Return the space-separated string of assigned costs for each node.
    return nodeCostAssignmentResults.join(" ");
}

// Execute the main logic and print its return value (the cost assignments).
console.log(solveGraphCostAssignment());