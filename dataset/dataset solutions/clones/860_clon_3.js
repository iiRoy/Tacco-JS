const readStdinContent = () => {
    const fs = require('fs');
    const fileDescriptor = process.stdin.fd;
    const stats = fs.fstatSync(fileDescriptor);
    const totalLength = stats.size;
    const inputBuffer = Buffer.alloc(totalLength);
    const bytesReadCount = fs.readSync(fileDescriptor, inputBuffer, 0, totalLength, 0);
    return inputBuffer.toString('utf8', 0, bytesReadCount).split('\n');
};

const rawInputLines = readStdinContent();
main();

function main() {
    const initialParamsLine = rawInputLines.shift();
    const initialParams = initialParamsLine.split(' ');

    const nodeCount = parseInt(initialParams[0], 10);
    const edgeCount = parseInt(initialParams[1], 10);

    const allEdges = [];
    const adjacencyList = Array.from({ length: nodeCount }, () => []);
    const reverseAdjacencyList = Array.from({ length: nodeCount }, () => []);
    const longestPathLengths = Array.from({ length: nodeCount }, () => 0);

    const parseEdgeLine = (line) => {
        const parts = line.split(' ');
        const u = parseInt(parts[0], 10) - 1;
        const v = parseInt(parts[1], 10) - 1;
        return [u, v];
    };

    for (let edgeIdx = 0; edgeIdx < edgeCount; edgeIdx++) {
        const currentEdgeData = parseEdgeLine(rawInputLines[edgeIdx]);
        const sourceNode = currentEdgeData[0];
        const targetNode = currentEdgeData[1];

        allEdges[edgeIdx] = [sourceNode, targetNode];
        adjacencyList[sourceNode].push(targetNode);
        reverseAdjacencyList[targetNode].push(sourceNode);
    }

    for (let currentNodeIdx = 0; currentNodeIdx < nodeCount; currentNodeIdx++) {
        const currentNeighbors = adjacencyList[currentNodeIdx];
        const numNeighbors = currentNeighbors.length;

        for (let neighborIterator = 0; neighborIterator < numNeighbors; neighborIterator++) {
            const neighborNode = currentNeighbors[neighborIterator];
            const potentialNewLength = longestPathLengths[currentNodeIdx] + 1;

            if (longestPathLengths[neighborNode] < potentialNewLength) {
                longestPathLengths[neighborNode] = potentialNewLength;
            }
        }
    }

    const overallMaxPathLength = Math.max(...longestPathLengths);
    const isNodeOnLongestPath = Array.from({ length: nodeCount }, (_, idx) => longestPathLengths[idx] === overallMaxPathLength);
    const incomingLongestPathCounts = Array.from({ length: nodeCount }, () => 0);

    for (let currentNodeIdx = nodeCount - 1; currentNodeIdx >= 0; currentNodeIdx--) {
        if (isNodeOnLongestPath[currentNodeIdx]) {
            const predecessors = reverseAdjacencyList[currentNodeIdx];
            const numPredecessors = predecessors.length;

            for (let predIterator = 0; predIterator < numPredecessors; predIterator++) {
                const predecessorNode = predecessors[predIterator];
                const pathLengthToPredecessor = longestPathLengths[predecessorNode];
                const pathLengthToCurrent = longestPathLengths[currentNodeIdx];

                if (pathLengthToPredecessor + 1 === pathLengthToCurrent) {
                    isNodeOnLongestPath[predecessorNode] = true;
                    incomingLongestPathCounts[pathLengthToPredecessor]++;
                }
            }
        }
    }

    let hasFoundUniqueEdge = true;

    const checkEdgeForUniqueness = (edgeSource, edgeTarget, sourcePathLength) => {
        const isSourceOnLongestPath = isNodeOnLongestPath[edgeSource];
        const isTargetOnLongestPath = isNodeOnLongestPath[edgeTarget];
        const sourceIncomingCount = incomingLongestPathCounts[sourcePathLength];

        return isSourceOnLongestPath && isTargetOnLongestPath && sourceIncomingCount === 1;
    };

    for (let edgeIdx = 0; edgeIdx < edgeCount; edgeIdx++) {
        const currentEdgeSource = allEdges[edgeIdx][0];
        const currentEdgeTarget = allEdges[edgeIdx][1];
        const currentSourcePathLength = longestPathLengths[currentEdgeSource];

        if (checkEdgeForUniqueness(currentEdgeSource, currentEdgeTarget, currentSourcePathLength)) {
            console.log(edgeIdx + 1);
            hasFoundUniqueEdge = false;
        }
    }

    if (hasFoundUniqueEdge = true) {
        console.log(-1);
    }
}
