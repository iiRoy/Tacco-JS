const fileSystem = require('fs');
const fileSize = fileSystem.fstatSync(process.stdin.fd).size;
const dataBuffer = Buffer.alloc(fileSize);
const actualBytesRead = fileSystem.readSync(process.stdin.fd, dataBuffer, 0, fileSize, 0);
const rawInputLines = dataBuffer.toString('utf8', 0, actualBytesRead).split('\n');

processGraphData();

function processGraphData() {
    const firstLineParts = rawInputLines.shift().split(' ');
    const nodeCount = +firstLineParts[0];
    const edgeCount = +firstLineParts[1];

    const adjacencyList = Array.from({ length: nodeCount }, () => []);
    const incomingEdgeCounts = Array(nodeCount).fill(0);
    const longestPathLengths = Array(nodeCount).fill(0);

    for (let edgeIdx = 0; edgeIdx < edgeCount; edgeIdx++) {
        const currentEdgeParts = rawInputLines[edgeIdx].split(' ');
        const sourceNode = +currentEdgeParts[0];
        const targetNode = +currentEdgeParts[1];
        const edgeWeight = +currentEdgeParts[2];

        adjacencyList[sourceNode].push([targetNode, edgeWeight]);
        incomingEdgeCounts[targetNode]++;
    }

    const topologicalQueue = [];
    for (let nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++) {
        if (incomingEdgeCounts[nodeIdx] === 0) {
            topologicalQueue.push(nodeIdx);
        }
    }

    let queueHead = 0;
    while (queueHead < topologicalQueue.length) {
        const currentNode = topologicalQueue[queueHead++];

        for (const [neighborNode, weight] of adjacencyList[currentNode]) {
            longestPathLengths[neighborNode] = Math.max(
                longestPathLengths[neighborNode],
                longestPathLengths[currentNode] + weight
            );

            incomingEdgeCounts[neighborNode]--;
            if (incomingEdgeCounts[neighborNode] === 0) {
                topologicalQueue.push(neighborNode);
            }
        }
    }

    console.log(longestPathLengths[nodeCount - 1]);
}
