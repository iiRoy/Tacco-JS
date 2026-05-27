function readInputFromStdin() {
    const fileSystem = require('fs');
    const standardInputDescriptor = process.stdin.fd;
    const inputByteLength = fileSystem.fstatSync(standardInputDescriptor).size;
    const dataBuffer = Buffer.alloc(inputByteLength);
    const actualBytesRead = fileSystem.readSync(standardInputDescriptor, dataBuffer, 0, inputByteLength, 0);
    return dataBuffer.toString('utf8', 0, actualBytesRead).split('\n');
}

(function executeGraphAnalysis() {
    let rawInputLines = readInputFromStdin();

    const initialConfigParts = rawInputLines.shift().split(' ');
    const numNodes = parseInt(initialConfigParts[0], 10);
    const numEdges = parseInt(initialConfigParts[1], 10);

    const adjacencyList = Array.from({ length: numNodes }, () => []);
    const reverseAdjacencyList = Array.from({ length: numNodes }, () => []);
    const longestPathLengths = Array(numNodes).fill(0);
    const storedEdges = [];

    for (let edgeIndex = 0; edgeIndex < numEdges; edgeIndex++) {
        const currentEdgeData = rawInputLines[edgeIndex].split(' ');
        const sourceNodeId = parseInt(currentEdgeData[0], 10) - 1;
        const targetNodeId = parseInt(currentEdgeData[1], 10) - 1;

        storedEdges[edgeIndex] = [sourceNodeId, targetNodeId];
        adjacencyList[sourceNodeId].push(targetNodeId);
        reverseAdjacencyList[targetNodeId].push(sourceNodeId);
    }

    for (let currentNode = 0; currentNode < numNodes; currentNode++) {
        const neighbors = adjacencyList[currentNode];
        for (let neighborIdx = 0; neighborIdx < neighbors.length; neighborIdx++) {
            const neighborNode = neighbors[neighborIdx];
            const candidatePathLength = longestPathLengths[currentNode] + 1;
            if (longestPathLengths[neighborNode] < candidatePathLength) {
                longestPathLengths[neighborNode] = candidatePathLength;
            }
        }
    }

    const overallMaxPathLength = Math.max(...longestPathLengths);

    const isNodeOnLongestPath = Array(numNodes).fill(false);
    const pathCountAtSpecificLength = Array(numNodes).fill(0);

    for (let nodeIdentifier = 0; nodeIdentifier < numNodes; nodeIdentifier++) {
        if (longestPathLengths[nodeIdentifier] === overallMaxPathLength) {
            isNodeOnLongestPath[nodeIdentifier] = true;
        }
    }

    for (let nodeIdentifier = numNodes - 1; nodeIdentifier >= 0; nodeIdentifier--) {
        if (isNodeOnLongestPath[nodeIdentifier]) {
            const predecessors = reverseAdjacencyList[nodeIdentifier];
            for (let predIndex = 0; predIndex < predecessors.length; predIndex++) {
                const predecessorNode = predecessors[predIndex];
                if (longestPathLengths[predecessorNode] + 1 === longestPathLengths[nodeIdentifier]) {
                    isNodeOnLongestPath[predecessorNode] = true;
                    pathCountAtSpecificLength[longestPathLengths[predecessorNode]]++;
                }
            }
        }
    }

    for (let edgeOutputIndex = 0; edgeOutputIndex < numEdges; edgeOutputIndex++) {
        const currentEdge = storedEdges[edgeOutputIndex];
        const edgeSourceNode = currentEdge[0];
        const edgeTargetNode = currentEdge[1];

        const sourceNodePathLength = longestPathLengths[edgeSourceNode];

        if (isNodeOnLongestPath[edgeSourceNode] && isNodeOnLongestPath[edgeTargetNode] && pathCountAtSpecificLength[sourceNodePathLength] === 1) {
            console.log(edgeOutputIndex + 1);
        }
    }
})();
