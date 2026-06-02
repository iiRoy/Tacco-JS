function processGraphData(rawData) {
    const lines = rawData.split("\n");
    const [nodeCountStr, edgeCountStr] = lines[0].split(" ");
    const nodeCount = parseInt(nodeCountStr, 10);
    const edgeCount = parseInt(edgeCountStr, 10);

    const existingEdges = new Set();
    for (let edgeIndex = 1; edgeIndex <= edgeCount; edgeIndex++) {
        const [uStr, vStr] = lines[edgeIndex].split(" ");
        const u = parseInt(uStr, 10) - 1;
        const v = parseInt(vStr, 10) - 1;
        existingEdges.add(`${Math.min(u, v)}-${Math.max(u, v)}`);
    }

    const complementAdjacencyLists = Array.from({ length: nodeCount }, () => new Set());

    for (let uVertex = 0; uVertex < nodeCount; uVertex++) {
        for (let vVertex = uVertex + 1; vVertex < nodeCount; vVertex++) {
            if (!existingEdges.has(`${uVertex}-${vVertex}`)) {
                complementAdjacencyLists[uVertex].add(vVertex);
                complementAdjacencyLists[vVertex].add(uVertex);
            }
        }
    }

    const nodeColors = Array(nodeCount).fill(0);
    const partitionSizesCollection = [];

    for (let currentComponentRoot = 0; currentComponentRoot < nodeCount; currentComponentRoot++) {
        if (nodeColors[currentComponentRoot] === 0) {
            let currentPartitionA = 0;
            let currentPartitionB = 0;
            const traversalQueue = [currentComponentRoot];
            nodeColors[currentComponentRoot] = 1;
            currentPartitionA++;

            let queueReadPointer = 0;
            while (queueReadPointer < traversalQueue.length) {
                const processingVertex = traversalQueue[queueReadPointer++];

                for (const neighborVertex of complementAdjacencyLists[processingVertex]) {
                    if (nodeColors[neighborVertex] === 0) {
                        nodeColors[neighborVertex] = 3 - nodeColors[processingVertex];
                        if (nodeColors[neighborVertex] === 1) {
                            currentPartitionA++;
                        } else {
                            currentPartitionB++;
                        }
                        traversalQueue.push(neighborVertex);
                    } else if (nodeColors[neighborVertex] === nodeColors[processingVertex]) {
                        console.log(-1);
                        return;
                    }
                }
            }
            partitionSizesCollection.push({ p1: currentPartitionA, p2: currentPartitionB });
        }
    }

    let achievablePartitionSums = new Set([0]);

    for (const { p1, p2 } of partitionSizesCollection) {
        const nextAchievableSums = new Set();
        for (const currentSum of achievablePartitionSums) {
            if (currentSum + p1 <= nodeCount) {
                nextAchievableSums.add(currentSum + p1);
            }
            if (currentSum + p2 <= nodeCount) {
                nextAchievableSums.add(currentSum + p2);
            }
        }
        achievablePartitionSums = nextAchievableSums;
    }

    let bestPartitionSize = 0;
    for (const currentSum of achievablePartitionSums) {
        bestPartitionSize = Math.max(bestPartitionSize, Math.min(currentSum, nodeCount - currentSum));
    }

    const totalCliqueEdges = bestPartitionSize * (bestPartitionSize - 1) / 2 +
                             (nodeCount - bestPartitionSize) * (nodeCount - bestPartitionSize - 1) / 2;
    console.log(totalCliqueEdges);
}

processGraphData(require("fs").readFileSync("/dev/stdin", "utf8"));
