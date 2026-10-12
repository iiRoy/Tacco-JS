"use strict";
process.stdin.resume();
process.stdin.setEncoding('utf8');
let inputBuffer = '';

process.stdin.on('data', function (chunk) {
    inputBuffer += chunk;
});

const parseNumericLine = function (lineContent) {
    const parts = lineContent.replace(/(^\s+)|(\s+$)/g, "").split(" ");
    return parts.map(Number);
};

const parseStringLine = function (lineContent) {
    const parts = lineContent.replace(/(^\s+)|(\s+$)/g, "").split(" ");
    return parts;
};

process.stdin.on('end', function () {
    const inputLines = inputBuffer.split('\n');
    const graphDimensions = parseNumericLine(inputLines[0]);
    const nodeCount = graphDimensions[0];
    const edgeCount = graphDimensions[1];

    let initialEdges = inputLines.splice(1).map(l => parseNumericLine(l));

    const adjacencies = new Map();
    for (let i = 0; i < nodeCount; ++i) {
        adjacencies.set(i, new Set());
    }

    for (const edgePair of initialEdges) {
        const firstNode = edgePair[0] - 1;
        const secondNode = edgePair[1] - 1;
        adjacencies.get(firstNode).add(secondNode);
        adjacencies.get(secondNode).add(firstNode);
    }

    const allDetectedCycles = new Set(); // Stores stringified canonical paths

    function getCanonicalCyclePath(cycleNodes) {
        if (cycleNodes.length === 0) return [];
        const n = cycleNodes.length;
        let minNode = cycleNodes[0];
        let minIdx = 0;
        for (let i = 1; i < n; i++) {
            if (cycleNodes[i] < minNode) {
                minNode = cycleNodes[i];
                minIdx = i;
            }
        }

        let forwardPath = cycleNodes.slice(minIdx).concat(cycleNodes.slice(0, minIdx));
        let backwardPath = [forwardPath[0]];
        for (let i = n - 1; i > 0; i--) {
            backwardPath.push(forwardPath[i]);
        }

        let chosenPath = forwardPath;
        for (let i = 1; i < n; i++) {
            if (chosenPath[i] < backwardPath[i]) {
                break;
            }
            if (chosenPath[i] > backwardPath[i]) {
                chosenPath = backwardPath;
                break;
            }
        }
        return chosenPath;
    }

    const visitedNodes = new Array(nodeCount).fill(false);
    const recursionStack = new Array(nodeCount).fill(false);

    function findGraphCyclesDFS(currentNode, parentNode, currentPath, graph) {
        visitedNodes[currentNode] = true;
        recursionStack[currentNode] = true;
        currentPath.push(currentNode);

        for (const neighbor of graph.get(currentNode) || []) {
            if (neighbor === parentNode) continue;

            if (recursionStack[neighbor]) {
                const cycleStartIndex = currentPath.indexOf(neighbor);
                const cycleNodes = currentPath.slice(cycleStartIndex);
                if (cycleNodes.length > 2) {
                    allDetectedCycles.add(JSON.stringify(getCanonicalCyclePath(cycleNodes)));
                }
            } else if (!visitedNodes[neighbor]) {
                findGraphCyclesDFS(neighbor, currentNode, currentPath, graph);
            }
        }

        currentPath.pop();
        recursionStack[currentNode] = false;
    }

    for (let i = 0; i < nodeCount; ++i) {
        if (!visitedNodes[i]) {
            findGraphCyclesDFS(i, -1, [], adjacencies);
        }
    }

    const edgesToEliminate = new Set();
    for (const cycleString of allDetectedCycles) {
        const cyclePath = JSON.parse(cycleString);
        const pathLength = cyclePath.length;
        for (let k = 0; k < pathLength; ++k) {
            const nodeA = cyclePath[k];
            const nodeB = cyclePath[(k + 1) % pathLength];
            const canonicalEdge = JSON.stringify([Math.min(nodeA, nodeB), Math.max(nodeA, nodeB)]);
            edgesToEliminate.add(canonicalEdge);
        }
    }

    let remainingEdges = initialEdges.filter(originalEdge => {
        const u = originalEdge[0] - 1;
        const v = originalEdge[1] - 1;
        const canonicalEdge = JSON.stringify([Math.min(u, v), Math.max(u, v)]);
        return !edgesToEliminate.has(canonicalEdge);
    });

    console.log(remainingEdges.length);
});
