const UNREACHABLE_PATH_WEIGHT = Number.MAX_SAFE_INTEGER;
const INITIAL_COLOR_NODE = "0";
const ALTERNATE_COLOR_NODE = "1";

let inputBuffer = [];

const ioHandlerModule = require('readline');

const inputProcessor = ioHandlerModule.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

inputProcessor.on('line', (currentInputLine) => {
    inputBuffer.push(currentInputLine.trim());
});

function parseNumbersFromString(lineString) {
    return lineString.split(" ").map(segment => parseInt(segment, 10));
}

function getFlippedColor(originalColor) {
    return originalColor === INITIAL_COLOR_NODE ? ALTERNATE_COLOR_NODE : INITIAL_COLOR_NODE;
}

inputProcessor.on('close', () => {
    if (inputBuffer.length === 0) {
        console.error("Error: No input lines provided. Exiting.");
        return;
    }

    const numNodes = parseInt(inputBuffer[0], 10);

    if (isNaN(numNodes) || numNodes <= 0) {
        console.error(`Error: Invalid number of nodes '${inputBuffer[0]}' specified. Must be a positive integer.`);
        return;
    }

    const remainingInputLines = inputBuffer.slice(1);

    const edgeDefinitions = remainingInputLines.map(line => parseNumbersFromString(line));

    let adjacencyMatrix = Array(numNodes).fill(null).map(() => Array(numNodes).fill(UNREACHABLE_PATH_WEIGHT));

    for (let nodeVertexIndex = 0; nodeVertexIndex < numNodes; nodeVertexIndex++) {
        adjacencyMatrix[nodeVertexIndex][nodeVertexIndex] = 0;
    }

    for (let edgeIndex = 0; edgeIndex < edgeDefinitions.length; edgeIndex++) {
        const currentEdge = edgeDefinitions[edgeIndex];
        if (currentEdge.length < 3) {
            console.warn(`Warning: Malformed edge definition on line ${edgeIndex + 2}. Skipping.`);
            continue;
        }

        const [sourceVtxRaw, targetVtxRaw, edgeVal] = currentEdge;

        const sourceVtx = sourceVtxRaw - 1;
        const targetVtx = targetVtxRaw - 1;

        if (sourceVtx < 0 || sourceVtx >= numNodes || targetVtx < 0 || targetVtx >= numNodes) {
             console.warn(`Warning: Edge connects to out-of-bounds node index (${sourceVtxRaw}, ${targetVtxRaw}). Skipping.`);
             continue;
        }

        adjacencyMatrix[sourceVtx][targetVtx] = edgeVal;
        adjacencyMatrix[targetVtx][sourceVtx] = edgeVal;
    }

    let outputColors = Array(numNodes).fill("");

    const startingVertex = 0; // The problem implies starting from node 0 (1-based in input, 0-based here)

    outputColors[startingVertex] = INITIAL_COLOR_NODE;

    let traversalStack = [[startingVertex, outputColors[startingVertex]]];

    while (traversalStack.length > 0) {
        const currentTraversalItem = traversalStack.pop();
        const activeNodeIdx = currentTraversalItem[0];
        const assignedColor = currentTraversalItem[1];

        for (let neighborIdx = 0; neighborIdx < numNodes; neighborIdx++) {
            const edgeWeightToNeighbor = adjacencyMatrix[activeNodeIdx][neighborIdx];

            const isNeighborAlreadyColored = outputColors[neighborIdx] !== "";
            const isNoDirectEdge = edgeWeightToNeighbor === UNREACHABLE_PATH_WEIGHT;

            if (isNeighborAlreadyColored || isNoDirectEdge) {
                continue;
            }

            let newColorForNeighbor;
            if (edgeWeightToNeighbor % 2 === 0) {
                newColorForNeighbor = assignedColor;
            } else {
                newColorForNeighbor = getFlippedColor(assignedColor);
            }

            outputColors[neighborIdx] = newColorForNeighbor;
            traversalStack.push([neighborIdx, newColorForNeighbor]);
        }
    }

    for (let nodeVertexIndex = 0; nodeVertexIndex < outputColors.length; nodeVertexIndex++) {
        console.log(outputColors[nodeVertexIndex]);
    }
});