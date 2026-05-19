'use strict';

const getAllInputLines = () => require("fs").readFileSync("/dev/stdin", "utf8").split('\n');
const parseNumbersFromString = (textLine) => textLine.split(' ').map(Number);
const extractTableData = (linesArray, startIndex, rowCount) => 
    linesArray.slice(startIndex, startIndex + rowCount).map(line => parseNumbersFromString(line));

class ValueTypeMinHeap {
    constructor() {
        this.heapElements = [];
    }

    addEntry(entryValue, entryType) {
        const newEntry = { val: entryValue, typ: entryType };
        this.heapElements.push(newEntry);
        this.bubbleUp(this.heapElements.length - 1);
    }

    extractSmallest() {
        if (this.isEmpty()) return null;
        if (this.heapElements.length === 1) return this.heapElements.shift();

        const smallest = this.heapElements[0];
        this.heapElements[0] = this.heapElements.pop();
        this.sinkDown(0);
        return smallest;
    }

    peekSmallest() {
        if (this.isEmpty()) return null;
        return this.heapElements[0];
    }

    elementCount() {
        return this.heapElements.length;
    }

    isEmpty() {
        return this.heapElements.length === 0;
    }

    bubbleUp(index) {
        const currentElement = this.heapElements[index];
        while (index > 0) {
            let parentIndex = Math.floor((index - 1) / 2);
            let parentElement = this.heapElements[parentIndex];

            if (currentElement.val >= parentElement.val) break;

            this.heapElements[parentIndex] = currentElement;
            this.heapElements[index] = parentElement;
            index = parentIndex;
        }
    }

    sinkDown(index) {
        const totalLength = this.heapElements.length;
        const currentElement = this.heapElements[index];

        while (true) {
            let leftChildIdx = 2 * index + 1;
            let rightChildIdx = 2 * index + 2;
            let swapTargetIdx = null;
            let leftChild, rightChild;

            if (leftChildIdx < totalLength) {
                leftChild = this.heapElements[leftChildIdx];
                if (leftChild.val < currentElement.val) {
                    swapTargetIdx = leftChildIdx;
                }
            }

            if (rightChildIdx < totalLength) {
                rightChild = this.heapElements[rightChildIdx];
                if (rightChild.val < (swapTargetIdx === null ? currentElement.val : leftChild.val)) {
                    swapTargetIdx = rightChildIdx;
                }
            }

            if (swapTargetIdx === null) break;

            this.heapElements[index] = this.heapElements[swapTargetIdx];
            this.heapElements[swapTargetIdx] = currentElement;
            index = swapTargetIdx;
        }
    }
}

const runOptimization = () => {
    const allInputLines = getAllInputLines();
    let currentLineIndex = 0;

    const getNextParsedLine = () => parseNumbersFromString(allInputLines[currentLineIndex++]);

    const initialParameters = getNextParsedLine();
    const totalItemCount = initialParameters[0];
    const initialKSelection = initialParameters[1];

    const allItemData = extractTableData(allInputLines, currentLineIndex, totalItemCount);
    allItemData.sort((a, b) => b[1] - a[1]);

    const initialItemsSubset = allItemData.slice(0, initialKSelection);
    const typeOccurrenceMap = new Map();
    let currentTotalValue = 0;

    for (const itemEntry of initialItemsSubset) {
        const itemKind = itemEntry[0];
        const itemVal = itemEntry[1];
        typeOccurrenceMap.set(itemKind, (typeOccurrenceMap.get(itemKind) || 0) + 1);
        currentTotalValue += itemVal;
    }

    let currentDistinctKinds = typeOccurrenceMap.size;
    const recordedScores = new Map();
    recordedScores.set(currentDistinctKinds, currentTotalValue);

    const duplicateValueMinHeap = new ValueTypeMinHeap();
    for (const itemEntry of initialItemsSubset) {
        if (typeOccurrenceMap.get(itemEntry[0]) > 1) {
            duplicateValueMinHeap.addEntry(itemEntry[1], itemEntry[0]);
        }
    }

    let nextAvailableItemIndex = initialKSelection;

    while (duplicateValueMinHeap.elementCount() > 0 && nextAvailableItemIndex < totalItemCount) {
        const itemToPotentiallyRemove = duplicateValueMinHeap.peekSmallest();

        if (typeOccurrenceMap.get(itemToPotentiallyRemove.typ) <= 1) {
            duplicateValueMinHeap.extractSmallest();
            continue;
        }

        const removedItem = duplicateValueMinHeap.extractSmallest();

        let newItemCandidate = null;
        let searchForNewTypeIndex = nextAvailableItemIndex;

        while (searchForNewTypeIndex < totalItemCount) {
            const candidateForAddition = allItemData[searchForNewTypeIndex];
            if (!typeOccurrenceMap.has(candidateForAddition[0])) {
                newItemCandidate = { val: candidateForAddition[1], typ: candidateForAddition[0] };
                nextAvailableItemIndex = searchForNewTypeIndex + 1;
                break;
            }
            searchForNewTypeIndex++;
        }

        if (newItemCandidate === null) {
            break;
        }

        currentTotalValue = currentTotalValue - removedItem.val + newItemCandidate.val;
        typeOccurrenceMap.set(removedItem.typ, typeOccurrenceMap.get(removedItem.typ) - 1);
        typeOccurrenceMap.set(newItemCandidate.typ, 1);
        currentDistinctKinds++;
        recordedScores.set(currentDistinctKinds, currentTotalValue);
    }

    let finalMaxScore = 0;
    for (const [kindCount, sumValue] of recordedScores.entries()) {
        finalMaxScore = Math.max(finalMaxScore, sumValue + kindCount * kindCount);
    }

    console.log(finalMaxScore);
};

runOptimization();
