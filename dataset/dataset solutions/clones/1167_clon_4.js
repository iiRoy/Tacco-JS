let networkConduits = [];
let vertexCount = 0;
let initialEdgeCount = 0;

const establishConnection = (originIndex, targetIndex, capacityValue) => {
    const forwardLink = { destination: targetIndex, currentCapacity: capacityValue, backReference: networkConduits[targetIndex].length };
    const backwardLink = { destination: originIndex, currentCapacity: 0, backReference: networkConduits[originIndex].length };

    networkConduits[originIndex].push(forwardLink);
    networkConduits[targetIndex].push(backwardLink);
};

const findAugmentingPath = (sourceNode, sinkNode, totalNodes) => {
    const pathParent = new Array(totalNodes).fill(null); // Stores { previousNode: number, edgeIndex: number } for BFS path reconstruction
    const pathFlowLimit = new Array(totalNodes).fill(0); // Stores bottleneck capacity to reach this node
    const bfsQueue = [];

    bfsQueue.push(sourceNode);
    pathFlowLimit[sourceNode] = Number.MAX_SAFE_INTEGER; // Effectively infinity for path capacity

    while (bfsQueue.length > 0) {
        const currentVertex = bfsQueue.shift();

        if (currentVertex === sinkNode) {
            break; // Path found to the sink
        }

        for (let idx = 0; idx < networkConduits[currentVertex].length; ++idx) {
            const edgeObject = networkConduits[currentVertex][idx];
            const nextVertex = edgeObject.destination;

            // If not visited yet (pathParent[nextVertex] is null) and capacity available
            if (pathParent[nextVertex] === null && edgeObject.currentCapacity > 0) {
                pathParent[nextVertex] = { previousNode: currentVertex, edgeIdx: idx };
                pathFlowLimit[nextVertex] = Math.min(pathFlowLimit[currentVertex], edgeObject.currentCapacity);
                bfsQueue.push(nextVertex);
            }
        }
    }

    // If sinkNode was not reached, no augmenting path exists
    if (pathParent[sinkNode] === null) {
        return 0;
    }

    // Reconstruct path and update capacities
    const pathValue = pathFlowLimit[sinkNode];
    let current = sinkNode;
    while (current !== sourceNode) {
        const { previousNode, edgeIdx } = pathParent[current];
        const forwardEdge = networkConduits[previousNode][edgeIdx];
        const backwardEdge = networkConduits[current][forwardEdge.backReference];

        forwardEdge.currentCapacity -= pathValue;
        backwardEdge.currentCapacity += pathValue;

        current = previousNode;
    }

    return pathValue;
};

const calculateMaxThroughput = (sourceNode, sinkNode, totalNodes) => {
    let totalThroughput = 0;
    while (true) {
        const pathValue = findAugmentingPath(sourceNode, sinkNode, totalNodes);
        if (pathValue === 0) {
            break; // No more augmenting paths
        }
        totalThroughput += pathValue;
    }
    return totalThroughput;
};

// Input processing
let accumulatedInput = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', chunk => {
    accumulatedInput += chunk;
});

process.stdin.on('end', () => {
    const inputLines = accumulatedInput.split('\n').filter(line => line.trim() !== ''); // Filter out empty lines

    if (inputLines.length === 0) {
        console.log(0);
        return;
    }

    const [firstLine, ...edgeSpecificationLines] = inputLines;

    const [vCount, eCount] = firstLine.split(' ').map(Number);
    vertexCount = vCount;
    initialEdgeCount = eCount;

    // Initialize graph structure for all vertices
    for (let i = 0; i < vertexCount; ++i) {
        networkConduits[i] = [];
    }

    edgeSpecificationLines.forEach(line => {
        const [u, v, c] = line.split(' ').map(Number);
        // Only add if it's a valid edge line (3 numbers)
        if (!isNaN(u) && !isNaN(v) && !isNaN(c)) {
            establishConnection(u, v, c);
        }
    });

    console.log(calculateMaxThroughput(0, vertexCount - 1, vertexCount));
});