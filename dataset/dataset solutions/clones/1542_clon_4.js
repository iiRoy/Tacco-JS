"use strict";

let entryData = '';
let tokenArray = [];
let tokenIndex = 0;

process.stdin.on('data', chunk => {
    entryData += chunk.toString();
});

process.stdin.on('end', () => {
    tokenArray = entryData.split(/\s+/).filter(Boolean);
    initiateProcessing();
});

function acquireNumber() {
    return Number(tokenArray[tokenIndex++]);
}

function createDisjointStructure() {
    const parentLinks = new Map();
    const treeRanks = new Map();

    function locateRepresentative(element) {
        if (!parentLinks.has(element)) {
            parentLinks.set(element, element);
            treeRanks.set(element, 0);
            return element;
        }

        let currentParent = parentLinks.get(element);
        if (currentParent === element) {
            return element;
        }

        const actualRoot = locateRepresentative(currentParent);
        parentLinks.set(element, actualRoot);
        return actualRoot;
    }

    function mergeGroups(elementA, elementB) {
        let rootA = locateRepresentative(elementA);
        let rootB = locateRepresentative(elementB);

        if (rootA === rootB) {
            return false;
        }

        let rankA = treeRanks.get(rootA);
        let rankB = treeRanks.get(rootB);

        if (rankA < rankB) {
            parentLinks.set(rootA, rootB);
        } else if (rankB < rankA) {
            parentLinks.set(rootB, rootA);
        } else {
            parentLinks.set(rootB, rootA);
            treeRanks.set(rootA, rankA + 1);
        }
        return true;
    }

    return {
        find: locateRepresentative,
        unite: mergeGroups,
        areConnected: (el1, el2) => locateRepresentative(el1) === locateRepresentative(el2)
    };
}

function initiateProcessing() {
    const initialCount = acquireNumber();
    const queryCount = acquireNumber();

    const structure = createDisjointStructure();
    const resultCollection = [];

    for (let currentQueryIndex = 0; currentQueryIndex < queryCount; currentQueryIndex++) {
        const operationType = acquireNumber();
        const participantOne = acquireNumber();
        const participantTwo = acquireNumber();

        if (operationType === 1) {
            if (structure.areConnected(participantOne, participantTwo)) {
                resultCollection.push(1);
            } else {
                resultCollection.push(0);
            }
        } else {
            structure.unite(participantOne, participantTwo);
        }
    }

    process.stdout.write(resultCollection.join('\n') + '\n');
}