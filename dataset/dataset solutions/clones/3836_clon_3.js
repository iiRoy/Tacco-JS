"use strict";
class DisjointSet {
    constructor(size) {
        this.parentNodes = Array.from({ length: size }, (_, index) => index);
    }

    findRoot(nodeIndex) {
        const currentParent = this.parentNodes[nodeIndex];
        if (currentParent === nodeIndex) {
            return nodeIndex;
        }
        this.parentNodes[nodeIndex] = this.findRoot(currentParent);
        return this.parentNodes[nodeIndex];
    }

    unionSets(nodeA, nodeB) {
        const rootA = this.findRoot(nodeA);
        const rootB = this.findRoot(nodeB);

        if (rootA === rootB) {
            return;
        }
        this.parentNodes[rootA] = rootB;
    }

    areConnected(nodeA, nodeB) {
        const rootA = this.findRoot(nodeA);
        const rootB = this.findRoot(nodeB);
        return rootA === rootB;
    }
}

const parseNumberLine = (lineStr) => {
    return lineStr.split(/\s/).map(str => parseInt(str, 10));
};

function processInput(rawData) {
    let inputLines = rawData.split("\n");

    const firstLine = inputLines.shift();
    const initialParams = parseNumberLine(firstLine);
    const nodeCount = initialParams[0];
    const edgeCount = initialParams[1];

    const disjointSetInstance = new DisjointSet(nodeCount);

    const permutationLine = inputLines.shift();
    const permutationArray = parseNumberLine(permutationLine);

    for (let operationIdx = 0; operationIdx < edgeCount; operationIdx++) {
        const currentEdgeLine = inputLines.shift();
        const [nodeX, nodeY] = parseNumberLine(currentEdgeLine);
        disjointSetInstance.unionSets(nodeX - 1, nodeY - 1);
    }

    let matchingPairsCount = 0;
    for (let currentIdx = 0; currentIdx < nodeCount; currentIdx++) {
        const targetNodeInPermutation = permutationArray[currentIdx] - 1;
        if (disjointSetInstance.areConnected(currentIdx, targetNodeInPermutation)) {
            matchingPairsCount++;
        }
    }

    console.log(matchingPairsCount);
}

const readStdinContent = () => require("fs").readFileSync("/dev/stdin", "utf8");

processInput(readStdinContent());
