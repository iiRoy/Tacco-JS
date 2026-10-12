var InputReaderFactory = (function() {
    function Reader(inputString) {
        this._lines = inputString.trim().split("\n");
        this._currentLineIndex = 0;
        this._currentLineTokensBuffer = []; // Stores tokens of the current line, reversed, used only by 'a'
    }

    // a: Read one item (token) from the current line, right-to-left.
    // If the current line's tokens are exhausted, it prepares the next line.
    // If 'l', 'm', or 'r' are called, they will reset this buffer.
    Reader.prototype.a = function(returnAsString) {
        if (this._currentLineTokensBuffer.length === 0) {
            if (this._currentLineIndex >= this._lines.length) {
                return undefined; // No more lines
            }
            const lineContent = this._lines[this._currentLineIndex].trim();
            this._currentLineTokensBuffer = lineContent.split(" ").reverse();
        }
        
        const tokenValue = this._currentLineTokensBuffer.pop();
        
        if (this._currentLineTokensBuffer.length === 0) {
            this._currentLineIndex++; // Line exhausted, advance to next line
        }
        
        return returnAsString ? tokenValue : +tokenValue;
    };

    // l: Read one full line, split by space, left-to-right.
    // This method always reads a new line and increments the line index.
    // It also clears any partially consumed line tokens from 'a'.
    Reader.prototype.l = function(returnAsString) {
        if (this._currentLineIndex >= this._lines.length) {
            return [];
        }
        // Clear any pending tokens from 'a' as 'l' reads a fresh line
        this._currentLineTokensBuffer = []; 
        const lineContent = this._lines[this._currentLineIndex++].trim();
        const parts = lineContent.split(' ');
        return returnAsString ? parts : parts.map(Number);
    };

    // m: Read n lines, split each by space, returning a 2D array.
    // Uses 'l' internally, so it also handles line index advancement and token buffer clearing.
    Reader.prototype.m = function(numLines, returnAsString) {
        const resultMatrix = [];
        for (let i = 0; i < numLines; i++) {
            resultMatrix.push(this.l(returnAsString));
        }
        return resultMatrix;
    };

    // r: Read n lines, each as a single string/number.
    // This method always reads new lines and increments the line index.
    // It also clears any partially consumed line tokens from 'a'.
    Reader.prototype.r = function(numLines, returnAsString) {
        const resultList = [];
        // Clear any pending tokens from 'a' as 'r' reads fresh lines
        this._currentLineTokensBuffer = []; 
        for (let i = 0; i < numLines; i++) {
            if (this._currentLineIndex >= this._lines.length) {
                resultList.push(undefined); 
            } else {
                const lineContent = this._lines[this._currentLineIndex++].trim();
                resultList.push(returnAsString ? lineContent : +lineContent);
            }
        }
        return resultList;
    };

    return function(inputString) {
        return new Reader(inputString);
    };
})();

// Helper to create multi-dimensional arrays without eval
function makeMultiArray(initialValueProducer, ...dimensions) {
    if (dimensions.length === 0) {
        return typeof initialValueProducer === 'function' ? initialValueProducer() : initialValueProducer;
    }
    const currentDimensionSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);
    const resultContainer = new Array(currentDimensionSize);
    for (let i = 0; i < currentDimensionSize; i++) {
        resultContainer[i] = makeMultiArray(initialValueProducer, ...remainingDimensions);
    }
    return resultContainer;
}

var inputParser = InputReaderFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(processGraphAlgorithm());

function processGraphAlgorithm() {
    var nodeCount = inputParser.a();
    
    // Graph representation: Map for adjacency lists, Array for degrees
    var graphAdjacency = new Map();
    var nodeDegrees = new Array(nodeCount).fill(0);

    // Initialize adjacency map with empty sets for all nodes
    for (let i = 0; i < nodeCount; i++) {
        graphAdjacency.set(i, new Set());
    }

    // Set to keep track of nodes that have not yet been assigned a value
    var unassignedNodes = new Set(Array.from({length: nodeCount}, (_, i) => i));
    
    // Read edges and build the graph's adjacency lists and degree counts
    for (var edgeIteration = 1; edgeIteration < nodeCount; edgeIteration++) {
        var currentEdgePair = inputParser.l();
        var firstNode = currentEdgePair[0] - 1;
        var secondNode = currentEdgePair[1] - 1;
        
        graphAdjacency.get(firstNode).add(secondNode);
        graphAdjacency.get(secondNode).add(firstNode);
        nodeDegrees[firstNode]++;
        nodeDegrees[secondNode]++;
    }
    
    var sortedValues = inputParser.l().sort((valA, valB) => valA - valB);
    
    var valueAssignmentIndex = 0;
    var totalAssignedValueSum = 0;
    var nodeAssignments = new Array(nodeCount);
    
    // Core algorithm: Iterative removal of "leaf" nodes (nodes with degree <= 1)
    while (unassignedNodes.size > 0) {
        var currentLayerLeaves = [];
        
        // Identify all nodes in the current set of unassigned nodes that are "leaves"
        // A node is considered a leaf if its degree is 1 (in a tree) or 0 (if it's an isolated node, e.g., for n=1)
        for (let nodeId of unassignedNodes) {
            if (nodeDegrees[nodeId] <= 1) { 
                currentLayerLeaves.push(nodeId);
            }
        }
        
        // Sort the identified leaves by their node ID to ensure consistent assignment order
        // This is crucial for matching the original's implicit iteration order.
        currentLayerLeaves.sort((idA, idB) => idA - idB);
        
        // Assign values from the sorted list to the current layer of leaves
        for (let leafNodeId of currentLayerLeaves) {
            nodeAssignments[leafNodeId] = sortedValues[valueAssignmentIndex++];
            totalAssignedValueSum += nodeAssignments[leafNodeId];
            unassignedNodes.delete(leafNodeId); // Mark node as assigned
        }
        
        // Update the graph by removing the assigned leaves and decrementing neighbors' degrees
        for (let assignedLeafId of currentLayerLeaves) {
            // Iterate over a copy of the set to avoid issues with modifying during iteration
            for (let neighborId of Array.from(graphAdjacency.get(assignedLeafId) || [])) {
                if (unassignedNodes.has(neighborId)) { // Only update if neighbor is still active (unassigned)
                    graphAdjacency.get(neighborId).delete(assignedLeafId); // Remove edge from neighbor's adjacency list
                    nodeDegrees[neighborId]--; // Decrement neighbor's degree
                }
            }
        }
    }
    
    // The final calculation: total sum minus the largest assigned value
    console.log(totalAssignedValueSum - sortedValues[nodeCount - 1]);
    return nodeAssignments.join(" ");
}
