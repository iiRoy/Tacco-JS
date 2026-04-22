const characterBitOffset = 'a'.charCodeAt(0);

function convertCharToMask(character) {
    return 1 << (character.charCodeAt(0) - characterBitOffset);
}

function countSetBitsInMask(numericMask) {
    let tally = 0;
    while (numericMask > 0) {
        numericMask &= (numericMask - 1);
        tally++;
    }
    return tally;
}

class CharacterRangeManager {
    constructor(initialString) {
        this.sequenceSize = initialString.length;
        this.treeStorage = new Array(4 * this.sequenceSize).fill(0);
        this.currentSequence = Array.from(initialString);
        this.constructTree(1, 0, this.sequenceSize - 1);
    }

    constructTree(nodeIndex, rangeStart, rangeEnd) {
        if (rangeStart === rangeEnd) {
            this.treeStorage[nodeIndex] = convertCharToMask(this.currentSequence[rangeStart]);
            return;
        }
        const midPoint = Math.floor((rangeStart + rangeEnd) / 2);
        this.constructTree(2 * nodeIndex, rangeStart, midPoint);
        this.constructTree(2 * nodeIndex + 1, midPoint + 1, rangeEnd);
        this.treeStorage[nodeIndex] = this.treeStorage[2 * nodeIndex] | this.treeStorage[2 * nodeIndex + 1];
    }

    modifyElement(targetPosition, newCharacter) {
        this.currentSequence[targetPosition] = newCharacter;
        this.updateTree(1, 0, this.sequenceSize - 1, targetPosition, newCharacter);
    }

    updateTree(nodeIndex, rangeStart, rangeEnd, targetPosition, newCharacter) {
        if (rangeStart === rangeEnd) {
            this.treeStorage[nodeIndex] = convertCharToMask(newCharacter);
            return;
        }
        const midPoint = Math.floor((rangeStart + rangeEnd) / 2);
        if (targetPosition <= midPoint) {
            this.updateTree(2 * nodeIndex, rangeStart, midPoint, targetPosition, newCharacter);
        } else {
            this.updateTree(2 * nodeIndex + 1, midPoint + 1, rangeEnd, targetPosition, newCharacter);
        }
        this.treeStorage[nodeIndex] = this.treeStorage[2 * nodeIndex] | this.treeStorage[2 * nodeIndex + 1];
    }

    queryUniqueCount(queryLeft, queryRight) {
        if (queryLeft > queryRight || queryLeft >= this.sequenceSize || queryRight < 0) {
            return 0;
        }
        const combinedMask = this.fetchMask(1, 0, this.sequenceSize - 1, queryLeft, queryRight);
        return countSetBitsInMask(combinedMask);
    }

    fetchMask(nodeIndex, segmentStart, segmentEnd, queryLeft, queryRight) {
        if (segmentEnd < queryLeft || segmentStart > queryRight) {
            return 0;
        }

        if (queryLeft <= segmentStart && segmentEnd <= queryRight) {
            return this.treeStorage[nodeIndex];
        }

        const midPoint = Math.floor((segmentStart + segmentEnd) / 2);
        const leftMask = this.fetchMask(2 * nodeIndex, segmentStart, midPoint, queryLeft, queryRight);
        const rightMask = this.fetchMask(2 * nodeIndex + 1, midPoint + 1, segmentEnd, queryLeft, queryRight);
        return leftMask | rightMask;
    }
}

function executeProgram(dataStream) {
    const inputLineIterator = (function*(text) {
        const lines = text.split('\n');
        let currentIdx = 0;
        return {
            next: () => {
                if (currentIdx < lines.length) {
                    return { value: lines[currentIdx++], done: false };
                }
                return { value: undefined, done: true };
            }
        };
    })(dataStream);

    const initialLength = parseInt(inputLineIterator.next().value, 10);
    const baseString = inputLineIterator.next().value;
    const totalOperations = parseInt(inputLineIterator.next().value, 10);

    const managerInstance = new CharacterRangeManager(baseString);

    Array.from({ length: totalOperations }).forEach(() => {
        const operationComponents = inputLineIterator.next().value.split(' ');
        const operationKind = parseInt(operationComponents[0], 10);

        if (operationKind === 1) {
            const targetIndex = parseInt(operationComponents[1], 10) - 1;
            const newChar = operationComponents[2];
            managerInstance.modifyElement(targetIndex, newChar);
        } else if (operationKind === 2) {
            const startBoundary = parseInt(operationComponents[1], 10) - 1;
            const endBoundary = parseInt(operationComponents[2], 10) - 1;
            const uniqueCharacterCount = managerInstance.queryUniqueCount(startBoundary, endBoundary);
            console.log(uniqueCharacterCount);
        }
    });
}

executeProgram(require("fs").readFileSync("/dev/stdin", "utf8"));