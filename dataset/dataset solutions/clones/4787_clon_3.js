process.stdin.resume();
process.stdin.setEncoding('ascii');

let rawInputData = "";
let inputLines = [];
let currentLineIndex = 0;

process.stdin.on('data', (dataChunk) => {
    rawInputData += dataChunk;
});

process.stdin.on('end', () => {
    inputLines = rawInputData.split("\n");
    processGraphData();
});

const fetchNextLine = () => {
    return inputLines[currentLineIndex++];
};

const parseTwoInts = (line) => {
    const parts = line.split(" ");
    return [parseInt(parts[0]), parseInt(parts[1])];
};

const parseEdgeDetails = (line) => {
    const parts = line.split(" ");
    return [parseInt(parts[0]) - 1, parseInt(parts[1]) - 1, parseInt(parts[2])];
};

const GRAPH_INFINITY = 1000000000;

const isEdgeEssential = (edgeIndex, sources, destinations, weights, nodeCount, distMatrix) => {
    const currentSource = sources[edgeIndex];
    const currentDest = destinations[edgeIndex];
    const currentWeight = weights[edgeIndex];

    for (let checkNode = 0; checkNode < nodeCount; checkNode++) {
        const pathThroughThisEdge = distMatrix[checkNode][currentSource] + currentWeight;
        if (pathThroughThisEdge === distMatrix[checkNode][currentDest]) {
            return true;
        }
    }
    return false;
};

function processGraphData() {
    const [numNodes, numEdges] = parseTwoInts(fetchNextLine());
    
    const edgeSources = [];
    const edgeDestinations = [];
    const edgeWeights = [];

    for (let edgeIdx = 0; edgeIdx < numEdges; edgeIdx++) {
        const [sourceNodeIdx, destNodeIdx, weightValue] = parseEdgeDetails(fetchNextLine());
        edgeSources.push(sourceNodeIdx);
        edgeDestinations.push(destNodeIdx);
        edgeWeights.push(weightValue);
    }
    
    const distanceMatrix = Array.from({ length: numNodes }, (_, r) =>
        Array.from({ length: numNodes }, (_, c) => (r === c ? 0 : GRAPH_INFINITY))
    );
    
    for (let k = 0; k < numEdges; k++) {
        const currentSource = edgeSources[k];
        const currentDest = edgeDestinations[k];
        const currentWeight = edgeWeights[k];

        distanceMatrix[currentSource][currentDest] = Math.min(distanceMatrix[currentSource][currentDest], currentWeight);
        distanceMatrix[currentDest][currentSource] = Math.min(distanceMatrix[currentDest][currentSource], currentWeight);
    }
    
    for (let intermediateNode = 0; intermediateNode < numNodes; intermediateNode++) {
        for (let startNode = 0; startNode < numNodes; startNode++) {
            for (let endNode = 0; endNode < numNodes; endNode++) {
                const pathThroughIntermediate = distanceMatrix[startNode][intermediateNode] + distanceMatrix[intermediateNode][endNode];
                if (distanceMatrix[startNode][endNode] > pathThroughIntermediate) {
                    distanceMatrix[startNode][endNode] = pathThroughIntermediate;
                }
            }
        }
    }
    
    let essentialEdgesCount = 0;
    for (let edgeIndex = 0; edgeIndex < numEdges; edgeIndex++) {
        if (isEdgeEssential(edgeIndex, edgeSources, edgeDestinations, edgeWeights, numNodes, distanceMatrix)) {
            essentialEdgesCount++;
        }
    }
    
    const redundantEdgesCount = numEdges - essentialEdgesCount;
    console.log(redundantEdgesCount);
    
    process.exit();
}
