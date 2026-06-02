class PriorityQueue {
    constructor() {
        this.entries = [];
    }

    addEntry(item) {
        const [newDistance, newNodeIdentifier] = item;
        let insertionPoint = this.entries.length;

        for (let i = 0; i < this.entries.length; i++) {
            if (newDistance < this.entries[i][0]) {
                insertionPoint = i;
                break;
            }
        }
        this.entries.splice(insertionPoint, 0, item);
    }

    retrieveMin() {
        if (this.isEmpty()) {
            return undefined;
        }
        return this.entries.shift();
    }

    isEmpty() {
        return this.entries.length === 0;
    }
}

function processGraphTraversal(inputData) {
    const dataLines = inputData.split("\n");
    const totalNodes = parseInt(dataLines[0], 10);

    const adjacencyLists = Array.from({ length: totalNodes }, () => new Map());

    for (let i = 0; i < totalNodes; i++) {
        const currentLineParts = dataLines[i + 1].split(" ");
        const originNode = parseInt(currentLineParts[0], 10);
        const connectedEdges = parseInt(currentLineParts[1], 10);

        for (let j = 0; j < connectedEdges; j++) {
            const destinationNode = parseInt(currentLineParts[j * 2 + 2], 10);
            const edgeCost = parseInt(currentLineParts[j * 2 + 3], 10);
            adjacencyLists[originNode].set(destinationNode, edgeCost);
        }
    }

    const shortestPaths = new Map();
    const visitedNodes = new Set();
    const pathQueue = new PriorityQueue();

    shortestPaths.set(0, 0);
    pathQueue.addEntry([0, 0]);

    while (!pathQueue.isEmpty() && visitedNodes.size < totalNodes) {
        const currentPathDetails = pathQueue.retrieveMin();
        if (!currentPathDetails) {
            break;
        }
        const [currentDistance, currentNode] = currentPathDetails;

        if (visitedNodes.has(currentNode)) {
            continue;
        }

        if (currentDistance > (shortestPaths.get(currentNode) || Infinity)) {
            continue;
        }

        visitedNodes.add(currentNode);

        const neighbors = adjacencyLists[currentNode];
        if (neighbors) {
            for (const [neighborNode, edgeWeight] of neighbors.entries()) {
                const newCalculatedDistance = currentDistance + edgeWeight;
                const existingShortestDistance = shortestPaths.get(neighborNode) || Infinity;

                if (newCalculatedDistance < existingShortestDistance) {
                    shortestPaths.set(neighborNode, newCalculatedDistance);
                    pathQueue.addEntry([newCalculatedDistance, neighborNode]);
                }
            }
        }
    }

    for (let i = 0; i < totalNodes; i++) {
        const finalDistance = shortestPaths.get(i);
        console.log(`${i} ${finalDistance !== undefined ? finalDistance : 1000000000}`);
    }
}

processGraphTraversal(require("fs").readFileSync("/dev/stdin", "utf8"));
