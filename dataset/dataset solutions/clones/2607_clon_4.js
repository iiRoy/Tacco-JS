class DataStream {
    #lineBuffer;
    #currentLinePosition = 0;
    #currentTokenBuffer = []; // Tokens for the current line
    #currentTokenPosition = 0;

    constructor(sourceString) {
        this.#lineBuffer = sourceString.trim().split("\n");
    }

    #loadNextLine() {
        if (this.#currentLinePosition >= this.#lineBuffer.length) {
            throw new Error("End of input has been reached.");
        }
        this.#currentTokenBuffer = this.#lineBuffer[this.#currentLinePosition].split(" ");
        this.#currentTokenPosition = 0;
        this.#currentLinePosition++;
    }

    extractSingleValue(asString = false) {
        if (this.#currentTokenBuffer.length === 0 || this.#currentTokenPosition >= this.#currentTokenBuffer.length) {
            this.#loadNextLine();
        }
        const extracted = this.#currentTokenBuffer[this.#currentTokenPosition++];
        return asString ? extracted : Number(extracted);
    }

    extractLineValues(asString = false) {
        this.#loadNextLine(); // Ensure a new line is loaded
        const currentLineTokens = this.#currentTokenBuffer;
        this.#currentTokenBuffer = []; // Clear for next operation
        this.#currentTokenPosition = 0;
        return asString ? currentLineTokens : currentLineTokens.map(Number);
    }

    extractMultipleLines(count, asString = false) {
        const collectedResults = [];
        for (let i = 0; i < count; i++) {
            collectedResults.push(this.extractLineValues(asString));
        }
        return collectedResults;
    }
}

function createNestedArray(dimensions, initializerFunction) {
    if (dimensions.length === 0) {
        return typeof initializerFunction === 'function' ? initializerFunction() : initializerFunction;
    }
    const currentDimensionSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);
    const arrayInstance = new Array(currentDimensionSize);
    for (let i = 0; i < currentDimensionSize; i++) {
        arrayInstance[i] = createNestedArray(remainingDimensions, initializerFunction);
    }
    return arrayInstance;
}

function mapPairToUniqueScalar(valueA, valueB) {
    const larger = Math.max(valueA, valueB);
    const smaller = Math.min(valueA, valueB);
    return (larger * (larger - 1) >>> 1) + smaller;
}

function performDAGAnalysis(nodeConnections) {
    const totalNodes = nodeConnections.length;
    const nodeVisitStatus = new Array(totalNodes).fill(0); // 0: unvisited, 1: visiting, 2: visited
    const reverseTopologicalOrder = []; // Stores nodes in reverse topological order
    let graphContainsCycle = false;

    // Depth-First Search for cycle detection and reverse topological ordering
    function depthFirstSearch(currentIdentifier) {
        nodeVisitStatus[currentIdentifier] = 1; // Mark as visiting

        for (const nextIdentifier of nodeConnections[currentIdentifier].to) {
            if (nodeVisitStatus[nextIdentifier] === 1) { // Node is currently in recursion stack -> cycle detected
                graphContainsCycle = true;
                return;
            }
            if (nodeVisitStatus[nextIdentifier] === 0) { // Unvisited
                depthFirstSearch(nextIdentifier);
                if (graphContainsCycle) return; // Propagate cycle detection
            }
        }
        nodeVisitStatus[currentIdentifier] = 2; // Mark as visited
        reverseTopologicalOrder.push(currentIdentifier); // Add to list after all successors are processed
    }

    // Initiate DFS for all unvisited nodes to cover all connected components
    for (let i = 0; i < totalNodes; i++) {
        if (nodeVisitStatus[i] === 0) {
            depthFirstSearch(i);
            if (graphContainsCycle) return -1; // Return -1 immediately if a cycle is found
        }
    }

    // If no cycle, proceed to calculate longest paths
    const maxPathToNode = new Array(totalNodes).fill(0);
    const topologicalSequence = reverseTopologicalOrder.reverse(); // Get actual topological order

    // Iterate through nodes in topological order to calculate longest paths
    for (const currentId of topologicalSequence) {
        for (const successorId of nodeConnections[currentId].to) {
            maxPathToNode[successorId] = Math.max(
                maxPathToNode[successorId],
                maxPathToNode[currentId] + 1
            );
        }
    }

    // Format output as an array of [nodeIndex, pathLength] pairs
    return topologicalSequence.map(node => [node, maxPathToNode[node]]);
}

const inputSource = require("fs").readFileSync("/dev/stdin", "utf8");
const dataInputProcessor = new DataStream(inputSource);

function orchestrateProcessing() {
    const totalItems = dataInputProcessor.extractSingleValue(); // Reads 'n' from input

    // Initialize graph structure: an array where each element is an object representing a node
    // The number of nodes corresponds to unique pairs, (totalItems * (totalItems - 1)) / 2
    const totalPairingsInGraph = totalItems * (totalItems - 1) / 2;
    const relationshipStructure = createNestedArray([totalPairingsInGraph], () => ({ from: [], to: [] }));

    for (let currentItemIndex = 0; currentItemIndex < totalItems; currentItemIndex++) {
        const currentLineValues = dataInputProcessor.extractLineValues(); // Reads 't' from input
        let previousPairIdentifier = mapPairToUniqueScalar(currentLineValues[0] - 1, currentItemIndex); // Calculates 'b'

        for (let j = 1; j < totalItems - 1; j++) {
            const currentPairIdentifier = mapPairToUniqueScalar(currentLineValues[j] - 1, currentItemIndex); // Calculates 'a'
            relationshipStructure[previousPairIdentifier].to.push(currentPairIdentifier);
            relationshipStructure[currentPairIdentifier].from.push(previousPairIdentifier);
            previousPairIdentifier = currentPairIdentifier;
        }
    }

    const pathComputationResults = performDAGAnalysis(relationshipStructure);

    if (pathComputationResults === -1) return -1;

    // The result requires the depth of the last node in the topological sort order + 1
    return pathComputationResults[pathComputationResults.length - 1][1] + 1;
}

console.log(orchestrateProcessing());