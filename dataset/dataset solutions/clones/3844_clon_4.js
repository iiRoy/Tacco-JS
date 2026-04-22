"use strict";
function digestData(rawText) {
    const lines = rawText.split("\n");
    const dimensions = lines[0].split(" ").map(Number);
    const nodeCount = dimensions[0];
    const edgeCount = dimensions[1];
    const elementPermutation = lines[1].split(" ").map(Number);
    const connections = lines.slice(2).map(connectionLine => {
        const parts = connectionLine.split(" ").map(Number);
        return { initial: parts[0], terminal: parts[1] };
    });
    return {
        countNodes: nodeCount,
        countEdges: edgeCount,
        elementMap: elementPermutation,
        edgeList: connections
    };
}
class ConnectivityHandler {
    constructor(totalNodes) {
        this.parentRegistry = Array(totalNodes + 1).fill(0).map((_, idx) => idx);
        this.componentSizes = Array(totalNodes + 1).fill(1);
    }
    findRepresentative(nodeIdentifier) {
        if (this.parentRegistry[nodeIdentifier] === nodeIdentifier) {
            return nodeIdentifier;
        }
        this.parentRegistry[nodeIdentifier] = this.findRepresentative(this.parentRegistry[nodeIdentifier]);
        return this.parentRegistry[nodeIdentifier];
    }
    uniteComponents(firstNode, secondNode) {
        let rootA = this.findRepresentative(firstNode);
        let rootB = this.findRepresentative(secondNode);
        if (rootA !== rootB) {
            if (this.componentSizes[rootA] < this.componentSizes[rootB]) {
                [rootA, rootB] = [rootB, rootA];
            }
            this.parentRegistry[rootB] = rootA;
            this.componentSizes[rootA] += this.componentSizes[rootB];
            return true;
        }
        return false;
    }
    checkEquivalence(firstNode, secondNode) {
        return this.findRepresentative(firstNode) === this.findRepresentative(secondNode);
    }
}
function solveProblem(rawInputData) {
    const { countNodes, countEdges, elementMap, edgeList } = digestData(rawInputData);
    const network = new ConnectivityHandler(countNodes);
    edgeList.forEach(link => network.uniteComponents(link.initial, link.terminal));
    let matchingCount = 0;
    for (let currentPos = 0; currentPos < countNodes; currentPos++) {
        const mappedValue = elementMap[currentPos];
        const originalIndex = currentPos + 1;
        if (network.checkEquivalence(mappedValue, originalIndex)) {
            matchingCount++;
        }
    }
    return String(matchingCount);
}
function runAtCoderSolution(inputData) {
    console.log(solveProblem(inputData));
}
try {
    runAtCoderSolution(require("fs").readFileSync("/dev/stdin", "utf8"));
} catch (e) {
}