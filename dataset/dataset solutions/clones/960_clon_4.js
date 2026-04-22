function createPriorityQueue() {
    let store = [];

    function supply(entry) {
        store.push(entry);
        ascend(store.length - 1);
    }

    function extractSmallest() {
        if (store.length === 0) return undefined;
        if (store.length === 1) return store.pop();

        const minimum = store[0];
        store[0] = store.pop();
        descend(0);
        return minimum;
    }

    function ascend(idx) {
        while (idx > 0) {
            let parentIdx = Math.floor((idx - 1) / 2);
            if (store[idx][0] < store[parentIdx][0]) {
                [store[idx], store[parentIdx]] = [store[parentIdx], store[idx]];
                idx = parentIdx;
            } else {
                break;
            }
        }
    }

    function descend(idx) {
        let leftChild, rightChild, minimalChild;
        while (true) {
            leftChild = 2 * idx + 1;
            rightChild = 2 * idx + 2;
            minimalChild = idx;

            if (leftChild < store.length && store[leftChild][0] < store[minimalChild][0]) {
                minimalChild = leftChild;
            }
            if (rightChild < store.length && store[rightChild][0] < store[minimalChild][0]) {
                minimalChild = rightChild;
            }

            if (minimalChild !== idx) {
                [store[idx], store[minimalChild]] = [store[minimalChild], store[idx]];
                idx = minimalChild;
            } else {
                break;
            }
        }
    }

    function isVacant() {
        return store.length === 0;
    }

    return { supply, extractSmallest, isVacant };
}

let dataSource = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
let inputRows = dataSource.split('\n');

let vertexCount = Number(inputRows.shift());
let routeMap = new Map();

for (let node = 0; node < vertexCount; node++) {
    routeMap.set(node, []);
}

for (let rowIdx = 0; rowIdx < vertexCount; rowIdx++) {
    let rowData = inputRows.shift().trim().split(' ').map(Number);
    let sourceNodeId = rowData[0];
    let edgeCount = rowData[1];

    for (let edgeIdx = 0; edgeIdx < edgeCount; edgeIdx++) {
        let connectedNode = rowData[2 + edgeIdx * 2];
        let edgeWeight = rowData[2 + edgeIdx * 2 + 1];
        routeMap.get(sourceNodeId).push({ destination: connectedNode, weight: edgeWeight });
    }
}

let pathValues = new Map();
for (let node = 0; node < vertexCount; node++) {
    pathValues.set(node, Number.MAX_SAFE_INTEGER);
}
pathValues.set(0, 0);

let finalizedSet = new Set();
let priorityHeap = createPriorityQueue();
priorityHeap.supply([0, 0]);

while (!priorityHeap.isVacant()) {
    let [currentDist, currentVertex] = priorityHeap.extractSmallest();

    if (finalizedSet.has(currentVertex)) {
        continue;
    }
    finalizedSet.add(currentVertex);

    let neighbors = routeMap.get(currentVertex) || [];

    for (let edge of neighbors) {
        let neighborNode = edge.destination;
        let edgeWeight = edge.weight;

        let potentialNewDist = currentDist + edgeWeight;

        if (potentialNewDist < pathValues.get(neighborNode)) {
            pathValues.set(neighborNode, potentialNewDist);
            priorityHeap.supply([potentialNewDist, neighborNode]);
        }
    }
}

for (let outputIdx = 0; outputIdx < vertexCount; outputIdx++) {
    console.log(outputIdx, pathValues.get(outputIdx));
}