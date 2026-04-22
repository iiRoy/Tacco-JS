function graphPathColoring(rawDataInput) {
    const lines = rawDataInput.split("\n");

    const vertexCount = parseInt(lines[0], 10);

    const adjacencyList = new Map();
    for (let currentId = 0; currentId < vertexCount; currentId++) {
        adjacencyList.set(currentId, new Set());
    }

    for (let k = 1; k < vertexCount; k++) {
        const edgeParts = lines[k].split(" ").map(Number);
        const endpointA = edgeParts[0] - 1;
        const endpointB = edgeParts[1] - 1;
        adjacencyList.get(endpointA).add(endpointB);
        adjacencyList.get(endpointB).add(endpointA);
    }

    const { ancestorMap, levelMap } = establishTreeHierarchy(vertexCount, adjacencyList);

    const constraintCount = parseInt(lines[vertexCount], 10);
    const constraintPathEdges = [];
    for (let k = 0; k < constraintCount; k++) {
        const constraintLineIndex = vertexCount + 1 + k;
        const constraintParts = lines[constraintLineIndex].split(" ").map(Number);
        const constraintA = constraintParts[0] - 1;
        const constraintB = constraintParts[1] - 1;
        constraintPathEdges.push(findEdgePath(constraintA, constraintB, ancestorMap, levelMap));
    }

    const unionEdgeMappings = aggregateConstraintEdges(constraintPathEdges);

    let exclusionTerm = 0;
    const allSubsetMasks = Array.from(unionEdgeMappings.keys());

    for (const subsetMask of allSubsetMasks) {
        const numSetBits = countBitsSet(subsetMask);
        const currentUnionSize = unionEdgeMappings.get(subsetMask).size;

        if (numSetBits % 2 === 1) {
            exclusionTerm += Math.pow(2, vertexCount - (1 + currentUnionSize));
        } else {
            exclusionTerm -= Math.pow(2, vertexCount - (1 + currentUnionSize));
        }
    }

    console.log(Math.pow(2, vertexCount - 1) - exclusionTerm);
}

function establishTreeHierarchy(vCount, adjList) {
    const parentTracker = new Map();
    const levelTracker = new Map();

    const queue = [];

    parentTracker.set(0, null);
    levelTracker.set(0, 0);
    queue.push(0);

    let head = 0;
    while (head < queue.length) {
        const currentVertex = queue[head++];

        for (const connectedVertex of adjList.get(currentVertex)) {
            if (!parentTracker.has(connectedVertex)) {
                parentTracker.set(connectedVertex, currentVertex);
                levelTracker.set(connectedVertex, levelTracker.get(currentVertex) + 1);
                queue.push(connectedVertex);
            }
        }
    }
    return { ancestorMap: parentTracker, levelMap: levelTracker };
}

function findEdgePath(vertexA, vertexB, ancestorMap, levelMap) {
    const pathEdges = new Set();

    let currentA = vertexA;
    let currentB = vertexB;
    let levelA = levelMap.get(currentA);
    let levelB = levelMap.get(currentB);

    while (levelA > levelB) {
        const ancestorA = ancestorMap.get(currentA);
        pathEdges.add(formatEdge(currentA, ancestorA));
        currentA = ancestorA;
        levelA--;
    }
    while (levelB > levelA) {
        const ancestorB = ancestorMap.get(currentB);
        pathEdges.add(formatEdge(currentB, ancestorB));
        currentB = ancestorB;
        levelB--;
    }

    while (currentA !== currentB) {
        const ancestorA = ancestorMap.get(currentA);
        const ancestorB = ancestorMap.get(currentB);
        
        pathEdges.add(formatEdge(currentA, ancestorA));
        pathEdges.add(formatEdge(currentB, ancestorB));

        currentA = ancestorA;
        currentB = ancestorB;
    }

    return pathEdges;
}

function formatEdge(u, v) {
    return u < v ? `${u}-${v}` : `${v}-${u}`;
}

function aggregateConstraintEdges(allConstraintPaths) {
    const subsetUnionMap = new Map();
    const totalConstraints = allConstraintPaths.length;

    for (let i = 1; i < (1 << totalConstraints); i++) {
        const currentUnion = new Set();
        for (let j = 0; j < totalConstraints; j++) {
            if ((i >> j) & 1) {
                for (const edge of allConstraintPaths[j]) {
                    currentUnion.add(edge);
                }
            }
        }
        subsetUnionMap.set(i, currentUnion);
    }
    return subsetUnionMap;
}

function countBitsSet(numberValue) {
    let count = 0;
    let tempValue = numberValue;
    while (tempValue > 0) {
        tempValue &= (tempValue - 1);
        count++;
    }
    return count;
}

graphPathColoring(require("fs").readFileSync("/dev/stdin", "utf8"));