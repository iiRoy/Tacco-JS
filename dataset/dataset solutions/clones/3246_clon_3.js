const tryParseInt = (strValue, defaultValue = 0) => {
    const parsed = parseInt(strValue, 10);
    return isNaN(parsed) ? defaultValue : parsed;
};

class GraphEdge {
    constructor(src, trg) {
        this.sourceNodeId = src;
        this.targetNodeId = trg;
    }
}

function traceUpstreamSource(currentNodeId, reverseAdjacencyMap) {
    const pathTraversalQueues = [];
    const directPredecessorIds = [];
    const pathResolutionFlags = [];

    const incomingEdgesToCurrent = reverseAdjacencyMap[currentNodeId] || [];

    for (let k = 0; k < incomingEdgesToCurrent.length; k++) {
        const edge = incomingEdgesToCurrent[k];
        directPredecessorIds.push(edge.sourceNodeId);
        pathResolutionFlags[k] = false;

        const sourcesOfPredecessor = reverseAdjacencyMap[edge.sourceNodeId] || [];
        pathTraversalQueues.push([...sourcesOfPredecessor]);
    }

    const mutablePredecessorIds = [...directPredecessorIds];
    const numDirectPredecessors = directPredecessorIds.length;

    while (pathTraversalQueues.some(q => q.length > 0)) {
        for (let k = 0; k < numDirectPredecessors; k++) {
            const currentTraversalQueue = pathTraversalQueues[k];

            if (pathResolutionFlags[k] || currentTraversalQueue.length === 0) {
                continue;
            }

            const nextSegment = currentTraversalQueue.shift();

            if (mutablePredecessorIds.includes(nextSegment.sourceNodeId)) {
                pathResolutionFlags[k] = true;
                const indexToMark = mutablePredecessorIds.indexOf(nextSegment.sourceNodeId);
                if (indexToMark !== -1) {
                    mutablePredecessorIds[indexToMark] = -1;
                }
            }

            if (!pathResolutionFlags[k] && reverseAdjacencyMap[nextSegment.sourceNodeId]) {
                const upstreamEdges = reverseAdjacencyMap[nextSegment.sourceNodeId];
                for (let j = 0; j < upstreamEdges.length; j++) {
                    currentTraversalQueue.push(upstreamEdges[j]);
                }
            }
        }
    }
    return mutablePredecessorIds;
}

function processGraphData(rawDataLines) {
    if (!rawDataLines || rawDataLines.length === 0) {
        console.log("");
        return;
    }

    const firstLineTokens = rawDataLines[0].split(' ').filter(s => s.trim() !== '');
    if (firstLineTokens.length < 2) {
        console.log("");
        return;
    }

    const nodeCount = tryParseInt(firstLineTokens[0]);
    const additionalEdgesCount = tryParseInt(firstLineTokens[1]);

    if (nodeCount <= 0 || additionalEdgesCount < 0) {
        console.log("");
        return;
    }

    const totalEdgeInputLines = nodeCount - 1 + additionalEdgesCount;

    const incomingEdgesMap = {};

    for (let current = 1; current <= nodeCount; current++) {
        incomingEdgesMap[current] = [];
    }

    for (let k = 0; k < totalEdgeInputLines; k++) {
        if (k + 1 >= rawDataLines.length) {
            break;
        }
        const currentLineParts = rawDataLines[k + 1].split(' ').filter(s => s.trim() !== '');
        if (currentLineParts.length < 2) {
            continue;
        }

        const sourceId = tryParseInt(currentLineParts[0]);
        const targetId = tryParseInt(currentLineParts[1]);

        if (sourceId <= 0 || sourceId > nodeCount || targetId <= 0 || targetId > nodeCount) {
            continue;
        }

        const newEdge = new GraphEdge(sourceId, targetId);
        incomingEdgesMap[targetId].push(newEdge);
    }

    const parentAssignments = new Array(nodeCount).fill(0);

    for (let currentNode = 1; currentNode <= nodeCount; currentNode++) {
        const directIncomingEdges = incomingEdgesMap[currentNode];

        if (directIncomingEdges.length > 1) {
            const potentialSources = traceUpstreamSource(currentNode, incomingEdgesMap);
            const assignedParent = potentialSources.find(id => id >= 0);
            parentAssignments[currentNode - 1] = assignedParent !== undefined ? assignedParent : 0;
        } else if (directIncomingEdges.length === 1) {
            parentAssignments[currentNode - 1] = directIncomingEdges[0].sourceNodeId;
        } else {
            parentAssignments[currentNode - 1] = 0;
        }
    }

    console.log(parentAssignments.join('\n'));
}

let accumulatedInputBuffer = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(dataChunk) {
    accumulatedInputBuffer += dataChunk;
});

process.stdin.on('end', function() {
    const processedInputLines = accumulatedInputBuffer.split('\n');
    processGraphData(processedInputLines);
});