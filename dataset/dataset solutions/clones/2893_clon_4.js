class DataStreamHandler {
    constructor(sourceText) {
        this.inputLines = sourceText.trim().split("\n").map(line => line.split(" "));
        this.currentLinePosition = 0;
    }

    // Reads the first token from the current line, removes it. Returns as a number.
    // Advances to the next line if the current one becomes empty.
    retrieveSingleNumericEntry() {
        if (this.currentLinePosition >= this.inputLines.length) {
            throw new Error("Input stream exhausted.");
        }
        const lineTokens = this.inputLines[this.currentLinePosition];
        if (lineTokens.length === 0) {
            this.currentLinePosition++;
            return this.retrieveSingleNumericEntry(); // Recursively try the next line
        }
        const entry = Number(lineTokens.shift());
        if (lineTokens.length === 0) {
            this.currentLinePosition++;
        }
        return entry;
    }

    // Reads all tokens from the current line, removes the line. Returns as an array of numbers.
    retrieveNumericLineEntries() {
        if (this.currentLinePosition >= this.inputLines.length) {
            throw new Error("Input stream exhausted.");
        }
        const lineEntries = this.inputLines[this.currentLinePosition++].map(Number);
        return lineEntries;
    }
}

// Generic function to create nested arrays with a specified initial value creator
function constructNestedArray(dimensions, valueFactory) {
    if (dimensions.length === 0) {
        return valueFactory();
    }
    const currentDimensionLength = dimensions[0];
    const remainingDimensions = dimensions.slice(1);

    return Array.from({ length: currentDimensionLength }, () =>
        constructNestedArray(remainingDimensions, valueFactory)
    );
}

function processGraphAssignment() {
    const inputReader = new DataStreamHandler(require("fs").readFileSync("/dev/stdin", "utf8"));

    const nodeCount = inputReader.retrieveSingleNumericEntry();
    const adjacencyList = constructNestedArray([nodeCount], () => new Set());
    const nodeDegrees = new Array(nodeCount).fill(0);
    const assignedNodeValues = new Array(nodeCount);
    let totalAssignedValueSum = 0;

    // Build the graph's adjacency list and track degrees
    for (let edgeNum = 0; edgeNum < nodeCount - 1; edgeNum++) {
        const edgeSpec = inputReader.retrieveNumericLineEntries();
        const nodeOne = edgeSpec[0] - 1;
        const nodeTwo = edgeSpec[1] - 1;

        adjacencyList[nodeOne].add(nodeTwo);
        adjacencyList[nodeTwo].add(nodeOne);
        nodeDegrees[nodeOne]++;
        nodeDegrees[nodeTwo]++;
    }

    const valuePool = inputReader.retrieveNumericLineEntries().sort((valA, valB) => valA - valB);
    let valuePoolPointer = 0;

    const remainingNodes = new Set(Array.from({ length: nodeCount }, (_, i) => i));
    let nodesToProcessNext = [];

    // Initialize the queue with all nodes that are initially leaves (degree 1) or isolated (degree 0)
    for (const nodeIdentifier of remainingNodes) {
        if (nodeDegrees[nodeIdentifier] <= 1) {
            nodesToProcessNext.push(nodeIdentifier);
        }
    }

    // Repeatedly process leaves until all nodes are assigned
    while (remainingNodes.size > 0) {
        const nextBatchOfLeaves = [];
        for (const currentNode of nodesToProcessNext) {
            // Assign the smallest available value to the current leaf node
            assignedNodeValues[currentNode] = valuePool[valuePoolPointer++];
            totalAssignedValueSum += assignedNodeValues[currentNode];
            remainingNodes.delete(currentNode); // Remove node from active set

            // For each neighbor of the processed node
            for (const connectedNode of adjacencyList[currentNode]) {
                if (remainingNodes.has(connectedNode)) { // Only update if neighbor is still active
                    adjacencyList[connectedNode].delete(currentNode); // Remove the edge
                    nodeDegrees[connectedNode]--; // Decrement neighbor's degree
                    if (nodeDegrees[connectedNode] === 1) { // If neighbor becomes a new leaf
                        nextBatchOfLeaves.push(connectedNode);
                    }
                }
            }
        }
        nodesToProcessNext = nextBatchOfLeaves;
    }

    // Calculate the final required sum: (sum of all values) - (largest value)
    const finalCalculatedResult = totalAssignedValueSum - valuePool[nodeCount - 1];

    console.log(finalCalculatedResult);
    return assignedNodeValues.join(" ");
}

console.log(processGraphAssignment());