const rawData = require("fs").readFileSync("/dev/stdin", "utf8");

((incomingText) => {
    const contentLines = incomingText.split('\n');

    const firstLineNumbers = contentLines[0].split(' ').map(Number);
    const totalVertices = firstLineNumbers[0];
    const totalEdges = firstLineNumbers[1];

    const connectionPairs = contentLines
        .slice(1, totalEdges + 1)
        .map(lineContent => lineContent.split(' ').map(Number));

    const adjacencyStructure = new Map();
    for (let currentId = 1; currentId <= totalVertices; currentId++) {
        adjacencyStructure.set(currentId, new Set());
    }

    connectionPairs.forEach(([sourceNode, targetNode]) => {
        adjacencyStructure.get(sourceNode).add(targetNode);
        adjacencyStructure.get(targetNode).add(sourceNode);
    });

    const traversalQueue = [1];
    const visitedSet = new Set();
    visitedSet.add(1);

    const parentMap = new Map();

    let currentPointer = 0;
    while (currentPointer < traversalQueue.length) {
        const activeVertex = traversalQueue[currentPointer++];

        const linkedVertices = adjacencyStructure.get(activeVertex);
        for (const linkedNode of linkedVertices) {
            if (!visitedSet.has(linkedNode)) {
                visitedSet.add(linkedNode);
                parentMap.set(linkedNode, activeVertex);
                traversalQueue.push(linkedNode);
            }
        }
    }

    const finalVertexParents = new Array(totalVertices).fill(undefined);

    for (let nodeIndex = 2; nodeIndex <= totalVertices; nodeIndex++) {
        if (parentMap.has(nodeIndex)) {
            finalVertexParents[nodeIndex - 1] = parentMap.get(nodeIndex);
        }
    }

    console.log('Yes');

    for (let outputIndex = 1; outputIndex < totalVertices; outputIndex++) {
        console.log(finalVertexParents[outputIndex]);
    }

})(rawData);