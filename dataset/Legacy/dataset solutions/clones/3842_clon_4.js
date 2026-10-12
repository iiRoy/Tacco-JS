"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function SolveConnectivityProblem(rawData) {
    const { nodeCount, permutationArray, edgeList } = ProcessRawInput(rawData);
    const ufInstance = new UnionFindManager(nodeCount);
    ufInstance.applyConnections(edgeList);
    const matchingCount = permutationArray.filter((elementValue, elementIndex) =>
        ufInstance.areConnected(elementValue, elementIndex + 1)
    ).length;
    console.log(matchingCount);
    return matchingCount;
}
exports.Equals = SolveConnectivityProblem;
class UnionFindManager {
    constructor(nodeCount) {
        this.parentArray = Array.from({ length: nodeCount + 1 }, (_, i) => i);
        this.groupSize = Array(nodeCount + 1).fill(1);
    }
    findRepresentative(elementId) {
        let currentPath = [];
        let current = elementId;
        while (current !== this.parentArray[current]) {
            currentPath.push(current);
            current = this.parentArray[current];
        }
        for (const node of currentPath) {
            this.parentArray[node] = current;
        }
        return current;
    }
    unifyElements(elementA, elementB) {
        let rootA = this.findRepresentative(elementA);
        let rootB = this.findRepresentative(elementB);
        if (rootA !== rootB) {
            if (this.groupSize[rootA] < this.groupSize[rootB]) {
                [rootA, rootB] = [rootB, rootA];
            }
            this.parentArray[rootB] = rootA;
            this.groupSize[rootA] += this.groupSize[rootB];
            return true;
        }
        return false;
    }
    areConnected(elementA, elementB) {
        return this.findRepresentative(elementA) === this.findRepresentative(elementB);
    }
    applyConnections(connections) {
        connections.forEach(({ firstNode, secondNode }) => {
            this.unifyElements(firstNode, secondNode);
        });
    }
}
function ProcessRawInput(rawData) {
    const dataLines = rawData.split("\n");
    const [firstConfigLine, secondPermutationLine, ...connectionLines] = dataLines;
    const [nodeCount, numConnections] = ParseNumericString(firstConfigLine);
    const permutationArray = ParseNumericString(secondPermutationLine);
    const edgeList = connectionLines.map(line => {
        const [firstNode, secondNode] = ParseNumericString(line);
        return { firstNode, secondNode };
    });
    return { nodeCount, numConnections, permutationArray, edgeList };
}
function ParseNumericString(textLine) {
    return textLine.split(" ").map(val => parseInt(val, 10));
}
try {
    SolveConnectivityProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
}
catch (e) {
}
