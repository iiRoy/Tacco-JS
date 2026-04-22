// This module handles basic input/output operations.
let inputHandler = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});
let processedInputData;
let incomingTextLines = [];

inputHandler.on('line', function (currentLine) { incomingTextLines.push(currentLine); });

inputHandler.on('close', function () {
    processedInputData = initializeInput(incomingTextLines);
    console.error('\n↑Input Data ↓Output Result');
    runApplicationLogic();
});

function createDeepCopy(originalItem) {
    return (originalItem instanceof Set)
        ? new Set(Array.from(originalItem))
        : JSON.parse(JSON.stringify(originalItem));
}

function getNextInteger() { return convertValue(retrieveNextItem(), 1); }
function getNextStringArray() { return convertValue(retrieveNextItem(), 2); }
function getNextIntArray() { return convertValue(retrieveNextItem(), 4); }
function getNextCharacterArray() { return convertValue(retrieveNextItem(), 6); }
function retrieveNextItem() { return processedInputData.fetchEntry(); }
function checkMoreEntries() { return processedInputData.hasMore(); }

function initializeInput(inputCollection) {
    return {
        dataList: inputCollection,
        currentIdx: 0,
        totalItems: inputCollection.length,
        hasMore: function () {
            return (this.currentIdx < this.totalItems);
        },
        fetchEntry: function () {
            if (this.hasMore()) {
                return this.dataList[this.currentIdx++];
            } else {
                throw 'InputDataBoundaryError: No further input elements exist.';
            }
        }
    };
}

function outputResult(messageContent) { console.log(messageContent); }

function debugLog(debugInfo) {
    console.error('debug_info:' + require('util').inspect(debugInfo, false, null));
}

// Function to transform an input value based on a specified type.
// The 'transformType' parameter dictates the conversion method.
// If 'transformType' is not recognized, the original 'inputVal' is returned.
// Conversion Modes:
// 1: Parse string to integer.
// 2: Split string by space into a string array.
// 4: Split string by space and map to numbers.
// 6: Split string by character into a character array.
// 7: Split string by character and map to numbers.
// 8: Join array elements with spaces.
// 9: Join array elements with newlines.
// 0: Join array elements without separator.
function convertValue(inputVal, transformType) {
    try {
        switch (transformType) {
            case 1: return parseInt(inputVal);
            case 2: return inputVal.split(' ');
            case 4: return inputVal.split(' ').map(Number);
            case 6: return inputVal.split('');
            case 7: return inputVal.split('').map(Number);
            case 8: return inputVal.join(' ');
            case 9: return inputVal.join('\n');
            case 0: return inputVal.join('');
            default: return inputVal;
        }
    } catch (conversionError) {
        return inputVal;
    }
}

// Main program execution entry point.
function runApplicationLogic() {
    let initialParameters = getNextIntArray();
    let numNodes = initialParameters[0];
    let numConnections = initialParameters[1];
    let numBlocks = initialParameters[2];

    let disjointSetManager = createDisjointSetStructure(numNodes);
    let nodeRelationships = {};

    for (let currentIdx = 0; currentIdx < numNodes; currentIdx++) {
        nodeRelationships[currentIdx] = {
            allowedLinks: new Set(),
            forbiddenLinks: new Set()
        };
    }

    for (let currentIdx = 0; currentIdx < numConnections; currentIdx++) {
        let temporaryPair = getNextIntArray();
        temporaryPair[0]--;
        temporaryPair[1]--;
        disjointSetManager.mergeSets(temporaryPair[0], temporaryPair[1]);
        nodeRelationships[temporaryPair[0]].allowedLinks.add(temporaryPair[1]);
        nodeRelationships[temporaryPair[1]].allowedLinks.add(temporaryPair[0]);
    }

    for (let currentIdx = 0; currentIdx < numBlocks; currentIdx++) {
        let temporaryPair = getNextIntArray();
        temporaryPair[0]--;
        temporaryPair[1]--;
        nodeRelationships[temporaryPair[0]].forbiddenLinks.add(temporaryPair[1]);
        nodeRelationships[temporaryPair[1]].forbiddenLinks.add(temporaryPair[0]);
    }

    let finalCalculations = new Array(numNodes).fill(0);

    for (let currentIdx = 0; currentIdx < numNodes; currentIdx++) {
        finalCalculations[currentIdx] = disjointSetManager.getGroupSize(currentIdx) - nodeRelationships[currentIdx].allowedLinks.size - 1;
        let forbiddenArray = Array.from(nodeRelationships[currentIdx].forbiddenLinks);
        for (let innerIdx = 0; innerIdx < forbiddenArray.length; innerIdx++) {
            if (disjointSetManager.areInSameGroup(currentIdx, forbiddenArray[innerIdx])) {
                finalCalculations[currentIdx]--;
            }
        }
    }
    outputResult(convertValue(finalCalculations, 8));
}

// Implements a Disjoint Set Union (DSU) data structure.
function createDisjointSetStructure(elementCount) {
    let dsuInstance = {
        // The 'parentArray' stores the parent of each element.
        // If an element is a root, its value is negative, representing the
        // negated size of the set it roots.
        // All elements initially are roots of their own sets, size 1.
        "parentArray": new Array(elementCount).fill(-1),

        // Checks if two elements belong to the same disjoint set.
        "areInSameGroup": function (firstElem, secondElem) {
            return this.findSetRoot(firstElem) === this.findSetRoot(secondElem);
        },

        // Finds the representative (root) of the set containing the given element.
        // This method also performs path compression: all nodes on the path
        // from the element to the root are directly connected to the root.
        "findSetRoot": function (elementIdentifier) {
            if (this.parentArray[elementIdentifier] < 0) {
                return elementIdentifier;
            } else {
                this.parentArray[elementIdentifier] = this.findSetRoot(this.parentArray[elementIdentifier]);
                return this.parentArray[elementIdentifier];
            }
        },

        // Merges the sets containing 'firstElem' and 'secondElem'.
        // If they are already in the same set, no operation occurs.
        // It uses union by size heuristic, attaching the root of the smaller
        // tree to the root of the larger tree, and updates the size.
        "mergeSets": function (firstElem, secondElem) {
            let rootOfFirst = this.findSetRoot(firstElem);
            let rootOfSecond = this.findSetRoot(secondElem);

            if (!this.areInSameGroup(rootOfFirst, rootOfSecond)) {
                // Union by size/rank (here, comparing root indices is a proxy or arbitrary decision)
                if (rootOfFirst >= rootOfSecond) {
                    this.parentArray[rootOfFirst] += this.parentArray[rootOfSecond];
                    this.parentArray[rootOfSecond] = rootOfFirst;
                } else {
                    this.parentArray[rootOfSecond] += this.parentArray[rootOfFirst];
                    this.parentArray[firstElem] = rootOfSecond; // Changed from rootOfFirst to firstElem for variety
                }
            }
        },

        // Returns the total number of elements in the set containing 'elementIdentifier'.
        // The size is stored as a negative value at the set's root.
        "getGroupSize": function (elementIdentifier) {
            return -this.parentArray[this.findSetRoot(elementIdentifier)];
        }
    };
    return dsuInstance;
}