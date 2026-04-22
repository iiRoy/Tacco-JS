"use strict";
const acquireData = require("fs").readFileSync("/dev/stdin", "utf8");
const tokenPile = acquireData.split(/ |\n/);
let tokenPointer = 0;

function grabNumber() {
    return +tokenPile[tokenPointer++];
}

function grabSymbol() {
    return tokenPile[tokenPointer++];
}

function createSegmentTree(sizeOfData) {
    const treeStorage = new Array(4 * sizeOfData).fill(0);
    const maximumIndex = sizeOfData;

    function adjustNodeValue(currentNodeIndex, currentSegmentStart, currentSegmentEnd, targetPosition, changeAmount) {
        if (currentSegmentStart === currentSegmentEnd) {
            treeStorage[currentNodeIndex] += changeAmount;
            return;
        }

        const midPoint = Math.floor((currentSegmentStart + currentSegmentEnd) / 2);

        if (targetPosition <= midPoint) {
            adjustNodeValue(2 * currentNodeIndex, currentSegmentStart, midPoint, targetPosition, changeAmount);
        } else {
            adjustNodeValue(2 * currentNodeIndex + 1, midPoint + 1, currentSegmentEnd, targetPosition, changeAmount);
        }

        treeStorage[currentNodeIndex] = treeStorage[2 * currentNodeIndex] + treeStorage[2 * currentNodeIndex + 1];
    }

    function retrieveRangeSum(currentNodeIndex, currentSegmentStart, currentSegmentEnd, queryStart, queryEnd) {
        if (queryStart > currentSegmentEnd || queryEnd < currentSegmentStart) {
            return 0;
        }
        if (queryStart <= currentSegmentStart && queryEnd >= currentSegmentEnd) {
            return treeStorage[currentNodeIndex];
        }
        const midPoint = Math.floor((currentSegmentStart + currentSegmentEnd) / 2);
        const leftChildSum = retrieveRangeSum(2 * currentNodeIndex, currentSegmentStart, midPoint, queryStart, queryEnd);
        const rightChildSum = retrieveRangeSum(2 * currentNodeIndex + 1, midPoint + 1, currentSegmentEnd, queryStart, queryEnd);
        return leftChildSum + rightChildSum;
    }

    return {
        updatePosition: function(position, valueChange) {
            adjustNodeValue(1, 1, maximumIndex, position, valueChange);
        },
        queryRange: function(rangeStart, rangeEnd) {
            return retrieveRangeSum(1, 1, maximumIndex, rangeStart, rangeEnd);
        }
    };
}

function executeProgram() {
    const stringLength = grabNumber();
    const initialStringContent = grabSymbol();
    const queryCount = grabNumber();

    const currentCharacterStates = initialStringContent.split('');

    const charSegmentTrees = Array(26).fill(null).map(() => createSegmentTree(stringLength));

    for (let charIndex = 0; charIndex < stringLength; charIndex++) {
        const charCodeOffset = currentCharacterStates[charIndex].charCodeAt(0) - 97;
        charSegmentTrees[charCodeOffset].updatePosition(charIndex + 1, 1);
    }

    const collectedResults = [];

    for (let queryIdx = 0; queryIdx < queryCount; queryIdx++) {
        const queryType = grabNumber();

        if (queryType === 1) {
            const modificationPosition = grabNumber();
            const newCharacter = grabSymbol();

            const oldCharacter = currentCharacterStates[modificationPosition - 1];

            charSegmentTrees[oldCharacter.charCodeAt(0) - 97].updatePosition(modificationPosition, -1);
            charSegmentTrees[newCharacter.charCodeAt(0) - 97].updatePosition(modificationPosition, 1);

            currentCharacterStates[modificationPosition - 1] = newCharacter;

        } else {
            const rangeStart = grabNumber();
            const rangeEnd = grabNumber();

            let distinctCharacterTally = 0;
            for (let charCodeOffset = 0; charCodeOffset < 26; charCodeOffset++) {
                const countInRange = charSegmentTrees[charCodeOffset].queryRange(rangeStart, rangeEnd);
                if (countInRange > 0) {
                    distinctCharacterTally++;
                }
            }
            collectedResults.push(distinctCharacterTally);
        }
    }
    return collectedResults.join("\n");
}

const programOutput = executeProgram();
if (programOutput !== undefined) {
    console.log(programOutput);
}