let nodeCount, adjList;

function runSolver() {
    while (true) {
        let edgeCount = readInputToken();
        nodeCount = readInputToken();

        if (nodeCount === 0 && edgeCount === 0) {
            break;
        }

        adjList = Array.from({ length: nodeCount }, () => []);
        readGraphEdges(edgeCount);

        let queryCount = readInputToken();
        processQueries(queryCount);
    }
}

function readGraphEdges(numEdges) {
    for (let i = 0; i < numEdges; ++i) {
        let nodeU = readInputToken() - 1;
        let nodeV = readInputToken() - 1;
        let costA = readInputToken();
        let costB = readInputToken();
        adjList[nodeU].push([costA, costB, nodeV]);
        adjList[nodeV].push([costA, costB, nodeU]);
    }
}

function processQueries(numQueries) {
    for (let i = 0; i < numQueries; ++i) {
        let sourceNode = readInputToken() - 1;
        let targetNode = readInputToken() - 1;
        let costMetricType = readInputToken();
        outputResult(findShortestPath(sourceNode, targetNode, costMetricType));
    }
}

function findShortestPath(sourceNode, targetNode, costMetricType) {
    const createMinPriorityQueue = () => {
        const pq = [];

        const push = (item) => {
            let i = pq.length;
            pq.push(item);
            while (i > 0) {
                const p = (i - 1) >> 1;
                if (pq[p][0] <= item[0]) break;
                pq[i] = pq[p];
                i = p;
            }
            pq[i] = item;
        };

        const pop = () => {
            const result = pq[0];
            const lastItem = pq.pop();
            if (!pq.length) return result;

            let i = 0;
            while (i * 2 + 1 < pq.length) {
                let leftChildIdx = i * 2 + 1;
                let rightChildIdx = i * 2 + 2;
                let smallestChildIdx = leftChildIdx;

                if (rightChildIdx < pq.length && pq[rightChildIdx][0] < pq[leftChildIdx][0]) {
                    smallestChildIdx = rightChildIdx;
                }

                if (pq[smallestChildIdx][0] >= lastItem[0]) break;

                pq[i] = pq[smallestChildIdx];
                i = smallestChildIdx;
            }
            pq[i] = lastItem;
            return result;
        };

        const isEmpty = () => pq.length === 0;

        return { push, pop, isEmpty };
    };

    const minPriorityQueue = createMinPriorityQueue();
    const MAX_DIST = Infinity;
    let distances = Array(nodeCount).fill(MAX_DIST);

    distances[sourceNode] = 0;
    minPriorityQueue.push([0, sourceNode]);

    while (!minPriorityQueue.isEmpty()) {
        const currentVertexData = minPriorityQueue.pop();
        const currentDist = currentVertexData[0];
        const u = currentVertexData[1];

        if (currentDist > distances[u]) {
            continue;
        }

        for (const neighborEdge of adjList[u]) {
            const edgeCost = neighborEdge[costMetricType];
            const neighborV = neighborEdge[2];
            const newDist = currentDist + edgeCost;

            if (newDist < distances[neighborV]) {
                distances[neighborV] = newDist;
                minPriorityQueue.push([newDist, neighborV]);
            }
        }
    }

    return distances[targetNode];
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

let rawInputBuffer = '';
let currentTokenIndex = 0;

function readInputToken(type) {
    if (type === 'string') {
        return rawInputBuffer[currentTokenIndex++];
    } else {
        return +rawInputBuffer[currentTokenIndex++];
    }
}

function outputResult(value) {
    console.log(value);
}

process.stdin.on('data', function(chunk) {
    rawInputBuffer += chunk;
});
process.stdin.on('end', function() {
    rawInputBuffer = rawInputBuffer.split(/\s+/);
    runSolver();
});
