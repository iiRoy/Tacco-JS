"use strict";
class DisjointSet {
    // parentArray[k]: The parent index of element k.
    // For example, parentArray[3] = 2 means element 3's parent is 2.

    constructor(elementCount) { // Initialize all elements as their own root.
        this.parentArray = new Array(elementCount).fill(0).map((_val, index) => index);
    }

    findRepresentative(itemIndex) { // Recursively find the root of the set containing itemIndex.
        if (this.parentArray[itemIndex] === itemIndex) {
            return itemIndex;
        }
        return this.parentArray[itemIndex] = this.findRepresentative(this.parentArray[itemIndex]);
    }

    mergeSets(itemA, itemB) { // Combine the sets containing itemA and itemB.
        let repA = this.findRepresentative(itemA); // Get the representative of itemA.
        let repB = this.findRepresentative(itemB); // Get the representative of itemB.
        if (repA === repB) { // If they already have the same representative, they are in the same set.
            return;
        }
        this.parentArray[repA] = repB; // Otherwise, attach the representative of itemA's set to itemB's set.
    }

    areConnected(itemA, itemB) { // Check if two elements, itemA and itemB, belong to the same set.
        let repA = this.findRepresentative(itemA);
        let repB = this.findRepresentative(itemB);
        return repA === repB;
    }
}

function ProcessInput(rawData) {
    let inputLines = rawData.split("\n");
    let firstLineNumbers = inputLines.shift().split(/\s/).map((currentVal) => Number(currentVal));
    let totalElements = firstLineNumbers[0];
    let mergeOperations = firstLineNumbers[1];

    let disjointSetInstance = new DisjointSet(totalElements);
    let permutationArray = inputLines.shift().split(/\s/).map((currentVal) => Number(currentVal));

    for (let idx = 0; idx < mergeOperations; idx++) {
        let [valX, valY] = inputLines.shift().split(/\s/).map((currentVal) => Number(currentVal));
        disjointSetInstance.mergeSets(valX - 1, valY - 1); // Merge the sets containing (valX-1) and (valY-1).
    }

    let matchCount = 0;
    for (let idx = 0; idx < totalElements; idx++) {
        if (disjointSetInstance.areConnected(idx, permutationArray[idx] - 1)) { // If idx and (permutationArray[idx]-1) are in the same set, increment counter.
            matchCount++;
        }
    }

    console.log(matchCount);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
