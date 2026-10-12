"use strict";
class DisjointSet {
    constructor(elementCount) {
        this.parentMap = new Map();
        this.setSizes = new Map();

        Array.from({ length: elementCount }, (_, index) => {
            this.parentMap.set(index, index);
            this.setSizes.set(index, 1);
        });
    }

    findRepresentative(element) {
        let currentElement = element;
        while (this.parentMap.get(currentElement) !== currentElement) {
            currentElement = this.parentMap.get(currentElement);
        }

        let pathNode = element;
        while (this.parentMap.get(pathNode) !== currentElement) {
            let nextInPath = this.parentMap.get(pathNode);
            this.parentMap.set(pathNode, currentElement);
            pathNode = nextInPath;
        }
        return currentElement;
    }

    mergeSets(elementA, elementB) {
        let representativeA = this.findRepresentative(elementA);
        let representativeB = this.findRepresentative(elementB);

        if (representativeA === representativeB) {
            return;
        }

        let sizeA = this.setSizes.get(representativeA);
        let sizeB = this.setSizes.get(representativeB);

        if (sizeA < sizeB) {
            this.parentMap.set(representativeA, representativeB);
            this.setSizes.set(representativeB, sizeA + sizeB);
            this.setSizes.delete(representativeA);
        } else {
            this.parentMap.set(representativeB, representativeA);
            this.setSizes.set(representativeA, sizeA + sizeB);
            this.setSizes.delete(representativeB);
        }
    }

    areConnected(elementA, elementB) {
        return this.findRepresentative(elementA) === this.findRepresentative(elementB);
    }
}

function ProcessInput(rawInput) {
    const inputLines = rawInput.split("\n");

    const [nodeCount, operationCount] = inputLines.shift().split(/\s/).map(Number);
    const permutationArray = inputLines.shift().split(/\s/).map(Number);

    const setStructure = new DisjointSet(nodeCount);

    inputLines.slice(0, operationCount)
        .map(line => line.split(/\s/).map(Number))
        .forEach(([val1, val2]) => {
            setStructure.mergeSets(val1 - 1, val2 - 1);
        });

    const connectedCount = Array.from({ length: nodeCount }, (_, index) => index)
        .filter(idx => setStructure.areConnected(idx, permutationArray[idx] - 1))
        .length;

    console.log(connectedCount);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
