'use strict';

function Main(inputData) {
    const lines = inputData.split("\n");
    const dimensions = lines[0].split(" ");
    const widthVal = parseInt(dimensions[0]);
    const heightVal = parseInt(dimensions[1]);

    const horizontalCosts = [];
    for (let i = 0; i < widthVal; i++) {
        horizontalCosts.push(lines[1 + i]);
    }

    const verticalCosts = [];
    for (let i = 0; i < heightVal; i++) {
        verticalCosts.push(lines[1 + widthVal + i]);
    }

    // Disjoint Set Union (DSU) structure
    let parentSets;
    let setRanks;

    function initializeDSU(nodeCount) {
        parentSets = Array(nodeCount).fill(0).map((_, idx) => idx);
        setRanks = Array(nodeCount).fill(0);
    }

    function findRoot(idx) {
        if (parentSets[idx] === idx) {
            return idx;
        }
        parentSets[idx] = findRoot(parentSets[idx]); // Path compression
        return parentSets[idx];
    }

    function uniteSets(idxA, idxB) {
        let rootA = findRoot(idxA);
        let rootB = findRoot(idxB);

        if (rootA !== rootB) {
            // Union by rank
            if (setRanks[rootA] < setRanks[rootB]) {
                parentSets[rootA] = rootB;
            } else if (setRanks[rootA] > setRanks[rootB]) {
                parentSets[rootB] = rootA;
            } else {
                parentSets[rootB] = rootA;
                setRanks[rootA]++;
            }
            return true; // A merge occurred
        }
        return false; // Already in the same set
    }

    // Generate all possible edges with their costs
    const allEdges = [];
    const numCols = widthVal + 1; // Number of nodes horizontally
    const numRows = heightVal + 1; // Number of nodes vertically
    const totalNodes = numCols * numRows;

    // Horizontal edges: (y, x) to (y, x+1)
    // These edges exist for 0 <= y <= heightVal and 0 <= x < widthVal
    for (let yCoord = 0; yCoord < numRows; yCoord++) {
        for (let xCoord = 0; xCoord < widthVal; xCoord++) {
            const nodeIdxU = yCoord * numCols + xCoord;
            const nodeIdxV = yCoord * numCols + (xCoord + 1);
            const edgeWeight = parseInt(horizontalCosts[xCoord]);
            allEdges.push({ u: nodeIdxU, v: nodeIdxV, w: edgeWeight });
        }
    }

    // Vertical edges: (y, x) to (y+1, x)
    // These edges exist for 0 <= y < heightVal and 0 <= x <= widthVal
    for (let xCoord = 0; xCoord < numCols; xCoord++) {
        for (let yCoord = 0; yCoord < heightVal; yCoord++) {
            const nodeIdxU = yCoord * numCols + xCoord;
            const nodeIdxV = (yCoord + 1) * numCols + xCoord;
            const edgeWeight = parseInt(verticalCosts[yCoord]);
            allEdges.push({ u: nodeIdxU, v: nodeIdxV, w: edgeWeight });
        }
    }

    // Sort all edges by weight in ascending order
    allEdges.sort((edgeA, edgeB) => edgeA.w - edgeB.w);

    // Initialize DSU for all nodes
    initializeDSU(totalNodes);

    let totalMstCost = 0;
    let edgeCount = 0; // Number of edges added to the MST

    // Kruskal's algorithm
    for (const currentEdge of allEdges) {
        if (uniteSets(currentEdge.u, currentEdge.v)) {
            totalMstCost += currentEdge.w;
            edgeCount++;
            // An MST for N nodes has N-1 edges.
            // If totalNodes is 0 or 1, totalNodes - 1 is -1 or 0, which is handled correctly.
            if (edgeCount === totalNodes - 1) {
                break;
            }
        }
    }

    console.log(totalMstCost);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
