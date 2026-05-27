class DataQueue {
    constructor(initialItems = []) {
        this.items = initialItems;
        this.currentReadIndex = 0;
        this.queueSize = initialItems.length;
    }

    enqueue(item) {
        this.items.push(item);
        this.queueSize++;
    }

    dequeue() {
        if (this.currentReadIndex >= this.items.length) {
            return undefined;
        }
        const dequeuedItem = this.items[this.currentReadIndex];
        this.currentReadIndex++;
        this.queueSize--;
        return dequeuedItem;
    }
}

class InputProcessor {
    constructor(inputTokens) {
        this.tokenQueue = new DataQueue(inputTokens);
    }

    dequeueToken() {
        return this.tokenQueue.dequeue();
    }

    readInt() {
        const token = this.tokenQueue.dequeue();
        if (token === undefined) {
            throw new Error("Attempted to read integer from empty input queue.");
        }
        return parseInt(token, 10);
    }

    enqueueToken(token) {
        this.tokenQueue.enqueue(token);
    }
}

function computeDistancesFromSource(startNodeIndex, totalNodes, adjacencyList) {
    const distances = new Array(totalNodes).fill(-1);
    const traversalStack = [[startNodeIndex, 0]];

    distances[startNodeIndex] = 0;

    while (traversalStack.length > 0) {
        const [currentNode, currentDist] = traversalStack.pop();

        for (let i = 0; i < adjacencyList[currentNode].length; i++) {
            const neighborEdge = adjacencyList[currentNode][i];
            const neighborNode = neighborEdge[0];
            const edgeWeight = neighborEdge[1];

            if (distances[neighborNode] === -1) {
                const newDistance = currentDist + edgeWeight;
                distances[neighborNode] = newDistance;
                traversalStack.push([neighborNode, newDistance]);
            }
        }
    }
    return distances;
}

(function() {
    "use strict";

    const fs = require("fs");

    const rawInputContent = fs.readFileSync("/dev/stdin", "utf8");
    const inputTokensArray = rawInputContent.split(/\s+/g);
    const inputReaderInstance = new InputProcessor(inputTokensArray);

    const totalNodes = inputReaderInstance.readInt();
    const graphAdjacencyList = Array.from({ length: totalNodes }, () => []);

    for (let edgeIndex = 0; edgeIndex < totalNodes - 1; edgeIndex++) {
        const nodeA_oneBased = inputReaderInstance.readInt();
        const nodeB_oneBased = inputReaderInstance.readInt();
        const edgeWeight = inputReaderInstance.readInt();

        const nodeA_zeroBased = nodeA_oneBased - 1;
        const nodeB_zeroBased = nodeB_oneBased - 1;

        graphAdjacencyList[nodeA_zeroBased].push([nodeB_zeroBased, edgeWeight]);
        graphAdjacencyList[nodeB_zeroBased].push([nodeA_zeroBased, edgeWeight]);
    }

    const numQueries = inputReaderInstance.readInt();
    const sourceNodeOneBased = inputReaderInstance.readInt();
    const sourceNodeZeroBased = sourceNodeOneBased - 1;

    const distancesFromSource = computeDistancesFromSource(
        sourceNodeZeroBased,
        totalNodes,
        graphAdjacencyList
    );

    for (let queryCounter = 0; queryCounter < numQueries; queryCounter++) {
        const queryNode1_oneBased = inputReaderInstance.readInt();
        const queryNode2_oneBased = inputReaderInstance.readInt();

        const queryNode1_zeroBased = queryNode1_oneBased - 1;
        const queryNode2_zeroBased = queryNode2_oneBased - 1;

        const combinedDistance = distancesFromSource[queryNode1_zeroBased] + distancesFromSource[queryNode2_zeroBased];
        console.log(combinedDistance);
    }
})();

module.exports = {};
