"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

function solveProblem(rawData) {
    const { totalElements, connectionCount, permutationMap, linkPairs } = processRawData(rawData);

    const groupHandler = new UnionFindSystem(totalElements);

    linkPairs.forEach(({ firstNode, secondNode }) => {
        groupHandler.uniteSets(firstNode, secondNode);
    });

    let finalTally = 0;
    for (let i = 0; i < totalElements; i++) {
        if (groupHandler.areConnected(permutationMap[i], i + 1)) {
            finalTally++;
        }
    }

    console.log(finalTally);
    return finalTally;
}
exports.Equals = solveProblem;

class UnionFindSystem {
    constructor(size) {
        this.nodeParents = Array.from({ length: size + 1 }, (_, i) => i);
        this.nodeRanks = Array(size + 1).fill(0);
    }

    findRoot(element) {
        if (this.nodeParents[element] === element) {
            return element;
        }
        this.nodeParents[element] = this.findRoot(this.nodeParents[element]);
        return this.nodeParents[element];
    }

    uniteSets(element1, element2) {
        let rootA = this.findRoot(element1);
        let rootB = this.findRoot(element2);

        if (rootA !== rootB) {
            if (this.nodeRanks[rootA] < this.nodeRanks[rootB]) {
                [rootA, rootB] = [rootB, rootA];
            }
            this.nodeParents[rootB] = rootA;
            if (this.nodeRanks[rootA] === this.nodeRanks[rootB]) {
                this.nodeRanks[rootA]++;
            }
            return true;
        }
        return false;
    }

    areConnected(element1, element2) {
        return this.findRoot(element1) === this.findRoot(element2);
    }
}

function processRawData(inputString) {
    const lines = inputString.split("\n");

    const [initialLine, mappingLine, ...remainingLines] = lines;

    const [totalElements, connectionCount] = parseNumericSequence(initialLine);
    const permutationMap = parseNumericSequence(mappingLine);

    const linkPairs = remainingLines.reduce((acc, currentLine) => {
        if (currentLine.trim() === "") return acc;
        const [xVal, yVal] = parseNumericSequence(currentLine);
        acc.push({ firstNode: xVal, secondNode: yVal });
        return acc;
    }, []);

    return { totalElements, connectionCount, permutationMap, linkPairs };
}

function parseNumericSequence(textLine) {
    return textLine.split(" ").map(Number);
}

solveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
