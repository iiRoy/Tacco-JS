const inputProcessor = (() => {
    let rawLinesData = [];
    let currentDataIndex = 0;

    const extractNumericList = (lineContents) => lineContents.split(' ').map(Number);
    const extractSingleNumber = (lineContents) => parseInt(lineContents, 10);

    return {
        _supplyRawLines: (lines) => { rawLinesData = lines; },
        _hasMoreEntries: () => currentDataIndex < rawLinesData.length,
        _fetchNextEntry: () => {
            if (!inputProcessor._hasMoreEntries()) {
                throw new Error("No more data stream entries available.");
            }
            return rawLinesData[currentDataIndex++];
        },
        retrieveNodeEdgeCounts: () => {
            const parts = extractNumericList(inputProcessor._fetchNextEntry());
            return { graphNodes: parts[0], graphEdges: parts[1] };
        },
        retrieveConnectionDetails: () => extractNumericList(inputProcessor._fetchNextEntry()),
        retrievePathEndpoints: () => extractNumericList(inputProcessor._fetchNextEntry())
    };
})();

const outputHandler = {
    displayFinalOutcome: (data) => console.log(data),
    logDiagnostic: (data) => console.error("diagnostics: " + require("util").inspect(data, false, null))
};

class CustomQueueForTraversal {
    constructor() {
        this._elementsStorage = [];
        this._frontPointer = 0;
        this._backPointer = 0;
    }

    addElement(element) {
        this._elementsStorage[this._backPointer++] = element;
    }

    removeElement() {
        if (this._frontPointer === this._backPointer) return undefined;
        const element = this._elementsStorage[this._frontPointer];
        delete this._elementsStorage[this._frontPointer];
        this._frontPointer++;
        return element;
    }

    isEmpty() {
        return this._frontPointer === this._backPointer;
    }
}

const executeGraphProblemSolution = () => {
    const initialConfiguration = inputProcessor.retrieveNodeEdgeCounts();
    const numberOfNodes = initialConfiguration.graphNodes;
    const numberOfEdges = initialConfiguration.graphEdges;

    const primaryAdjacencyList = new Map(); // Map<number, Set<number>>
    for (let i = 0; i < numberOfNodes; ++i) {
        primaryAdjacencyList.set(i, new Set());
    }

    for (let i = 0; i < numberOfEdges; ++i) {
        const currentEdgeDefinition = inputProcessor.retrieveConnectionDetails();
        const originNode = currentEdgeDefinition[0] - 1;
        const destinationNode = currentEdgeDefinition[1] - 1;
        primaryAdjacencyList.get(originNode).add(destinationNode);
    }

    // Construct the reverse adjacency list for 3-step paths
    // This maps a node 'V' to a set of nodes 'U' such that there's a 3-step path from U to V.
    const threeStepReverseAdjacency = new Map(); // Map<number, Set<number>>
    for (let i = 0; i < numberOfNodes; ++i) {
        threeStepReverseAdjacency.set(i, new Set());
    }

    // Iteratively discover all 3-step paths
    for (let initialNode = 0; initialNode < numberOfNodes; ++initialNode) {
        const firstStepNeighbors = primaryAdjacencyList.get(initialNode);
        if (!firstStepNeighbors) continue;

        for (const secondNode of firstStepNeighbors) {
            const secondStepNeighbors = primaryAdjacencyList.get(secondNode);
            if (!secondStepNeighbors) continue;

            for (const thirdNode of secondStepNeighbors) {
                const thirdStepNeighbors = primaryAdjacencyList.get(thirdNode);
                if (!thirdStepNeighbors) continue;

                for (const finalNode of thirdStepNeighbors) {
                    // Path: initialNode -> secondNode -> thirdNode -> finalNode (length 3)
                    threeStepReverseAdjacency.get(finalNode).add(initialNode);
                }
            }
        }
    }

    const pathDefinition = inputProcessor.retrievePathEndpoints();
    const sourceNodeIndex = pathDefinition[0] - 1;
    const targetNodeIndex = pathDefinition[1] - 1;

    // Perform BFS on the threeStepReverseAdjacency graph
    // starting from targetNodeIndex to find sourceNodeIndex.
    // This effectively finds the shortest path from sourceNodeIndex to targetNodeIndex
    // in the graph where edges represent 3-step paths.
    const pathDistances = new Map(); // Maps node to its distance from targetNodeIndex
    const visitedNodesTracker = new Set(); // Keeps track of visited nodes

    const traversalQueue = new CustomQueueForTraversal();

    traversalQueue.addElement(targetNodeIndex);
    visitedNodesTracker.add(targetNodeIndex);
    pathDistances.set(targetNodeIndex, 0);

    let calculatedPathLength = -1;

    while (!traversalQueue.isEmpty()) {
        const currentVertex = traversalQueue.removeElement();
        const currentVertexDistance = pathDistances.get(currentVertex);

        if (currentVertex === sourceNodeIndex) {
            calculatedPathLength = currentVertexDistance;
            break;
        }

        const predecessorsInThreeStepGraph = threeStepReverseAdjacency.get(currentVertex);
        if (predecessorsInThreeStepGraph) {
            for (const predecessor of predecessorsInThreeStepGraph) {
                if (!visitedNodesTracker.has(predecessor)) {
                    visitedNodesTracker.add(predecessor);
                    pathDistances.set(predecessor, currentVertexDistance + 1);
                    traversalQueue.addElement(predecessor);
                }
            }
        }
    }

    outputHandler.displayFinalOutcome(calculatedPathLength);
};

// --- Input/Output System Integration (adapted from original boilerplate) ---
const systemInputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
let accumulatedInputLines = [];
systemInputReader.on('line', (incomingLine) => { accumulatedInputLines.push(incomingLine); });
systemInputReader.on('close', () => {
  inputProcessor._supplyRawLines(accumulatedInputLines);
  outputHandler.logDiagnostic("\n");
  const executionStartTime = Date.now();
  executeGraphProblemSolution();
  const executionEndTime = Date.now() - executionStartTime;
  outputHandler.logDiagnostic("processing duration: " + executionEndTime + "ms");
  outputHandler.logDiagnostic("allocated memory: " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});
// --- End Input/Output System Integration ---