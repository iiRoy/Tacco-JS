const primarySource = require("fs").readFileSync("/dev/stdin", "utf8");
let dataElements = primarySource.split(/\s+/).filter(Boolean); // Filter out empty strings from split
let elementPointer = 0;

function acquireNumeric() {
    return Number(dataElements[elementPointer++]);
}

function acquireString() {
    return dataElements[elementPointer++];
}

function acquireBigNumeric() {
    return BigInt(dataElements[elementPointer++]);
}

function acquireMultipleNumerics(count, parseAsNumbers = true) {
    const subset = dataElements.slice(elementPointer, elementPointer + count);
    elementPointer += count;
    return parseAsNumbers ? subset.map(val => Number(val)) : subset;
}

function acquireSortedNumerics(count, descending = false) {
    const subset = dataElements.slice(elementPointer, elementPointer + count).map(val => Number(val));
    elementPointer += count;
    return descending ? subset.sort((x, y) => y - x) : subset.sort((x, y) => x - y);
}

function acquireGrid(rows, columns, parseAsNumbers = true) {
    const grid = [];
    for (let current = 0; current < rows; current++) {
        const row = dataElements.slice(elementPointer, elementPointer + columns);
        elementPointer += columns;
        grid.push(parseAsNumbers ? row.map(val => Number(val)) : row);
    }
    return grid;
}

function constructMultiArray(initialValue, ...dimensions) {
    if (dimensions.length === 0) {
        return initialValue;
    }
    const createDim = (dimIndex) => {
        const currentDimSize = dimensions[dimIndex];
        return Array(currentDimSize).fill(null).map(() => {
            if (dimIndex === dimensions.length - 1) {
                return initialValue;
            } else {
                return createDim(dimIndex + 1);
            }
        });
    };
    return createDim(0);
}

let outputVault = [];
function publishResult(content) {
    outputVault.push(content);
}

const MIN_INDEX = 0;
const MAX_INDEX = 300000;
const TOTAL_RANGE_SIZE = MAX_INDEX + 1;

class RangeUpdater {
    constructor(maxPossibleIndex) {
        const capacity = maxPossibleIndex + 1; // Number of distinct indices from 0 to maxPossibleIndex
        this.treeStore = new Array(4 * capacity).fill(0); // Stores max value for segment
        this.lazyPropagation = new Array(4 * capacity).fill(0); // Stores lazy max value to propagate
        this.upperBound = maxPossibleIndex;
    }

    // Applies lazy updates to the current node and pushes them to children
    propagateUpdates(nodePosition, segmentStart, segmentEnd) {
        if (this.lazyPropagation[nodePosition] !== 0) {
            // Apply lazy value to current node's actual stored value
            this.treeStore[nodePosition] = Math.max(this.treeStore[nodePosition], this.lazyPropagation[nodePosition]);

            // If not a leaf node, push lazy value to children
            if (segmentStart !== segmentEnd) {
                this.lazyPropagation[2 * nodePosition + 1] = Math.max(this.lazyPropagation[2 * nodePosition + 1], this.lazyPropagation[nodePosition]);
                this.lazyPropagation[2 * nodePosition + 2] = Math.max(this.lazyPropagation[2 * nodePosition + 2], this.lazyPropagation[nodePosition]);
            }
            // Reset lazy value for current node
            this.lazyPropagation[nodePosition] = 0;
        }
    }

    // Recursively applies a maximum value update to a given range
    performRangeUpdate(nodePosition, segmentStart, segmentEnd, queryStart, queryEnd, newValue) {
        this.propagateUpdates(nodePosition, segmentStart, segmentEnd); // Ensure current node is up-to-date

        // If the current segment is completely outside the query range
        if (segmentStart > queryEnd || segmentEnd < queryStart) {
            return;
        }

        // If the current segment is completely inside the query range
        if (queryStart <= segmentStart && segmentEnd <= queryEnd) {
            this.treeStore[nodePosition] = Math.max(this.treeStore[nodePosition], newValue);
            // Mark children for lazy propagation
            if (segmentStart !== segmentEnd) {
                this.lazyPropagation[2 * nodePosition + 1] = Math.max(this.lazyPropagation[2 * nodePosition + 1], newValue);
                this.lazyPropagation[2 * nodePosition + 2] = Math.max(this.lazyPropagation[2 * nodePosition + 2], newValue);
            }
            return;
        }

        // If the current segment is partially inside, recurse
        const midPoint = Math.floor((segmentStart + segmentEnd) / 2);
        this.performRangeUpdate(2 * nodePosition + 1, segmentStart, midPoint, queryStart, queryEnd, newValue);
        this.performRangeUpdate(2 * nodePosition + 2, midPoint + 1, segmentEnd, queryStart, queryEnd, newValue);

        // After children updates, update the parent node's value as the maximum of its children
        this.treeStore[nodePosition] = Math.max(this.treeStore[2 * nodePosition + 1], this.treeStore[2 * nodePosition + 2]);
    }

    // Recursively retrieves the value at a specific index
    retrievePointValue(nodePosition, segmentStart, segmentEnd, targetIndex) {
        this.propagateUpdates(nodePosition, segmentStart, segmentEnd); // Ensure path to target is up-to-date

        // If we reached a leaf node
        if (segmentStart === segmentEnd) {
            return this.treeStore[nodePosition];
        }

        const midPoint = Math.floor((segmentStart + segmentEnd) / 2);
        if (targetIndex <= midPoint) {
            return this.retrievePointValue(2 * nodePosition + 1, segmentStart, midPoint, targetIndex);
        } else {
            return this.retrievePointValue(2 * nodePosition + 2, midPoint + 1, segmentEnd, targetIndex);
        }
    }

    // Public method to update a range [startIndex, endIndex] with a new maximum value
    updateRange(startIndex, endIndex, value) {
        startIndex = Math.max(MIN_INDEX, startIndex);
        endIndex = Math.min(this.upperBound, endIndex);
        if (startIndex > endIndex) return;
        this.performRangeUpdate(0, MIN_INDEX, this.upperBound, startIndex, endIndex, value);
    }

    // Public method to query the maximum value at a specific index
    queryValueAtIndex(index) {
        index = Math.max(MIN_INDEX, index);
        index = Math.min(this.upperBound, index);
        return this.retrievePointValue(0, MIN_INDEX, this.upperBound, index);
    }
}

function processSolution() {
    const [itemCount, differenceThreshold] = acquireMultipleNumerics(2);
    const inputSequence = acquireMultipleNumerics(itemCount);

    const updaterStructure = new RangeUpdater(MAX_INDEX);

    for (let i = 0; i < itemCount; i++) {
        const currentItemValue = inputSequence[i];
        const lowerBound = Math.max(MIN_INDEX, currentItemValue - differenceThreshold);
        const upperBound = Math.min(MAX_INDEX, currentItemValue + differenceThreshold);

        // Get the current maximum length of a k-beautiful subsequence ending at 'currentItemValue'
        const currentMaxLen = updaterStructure.queryValueAtIndex(currentItemValue);

        // Update the range [lowerBound, upperBound] with (currentMaxLen + 1)
        // This signifies that any value in this range can extend a subsequence of length (currentMaxLen + 1)
        updaterStructure.updateRange(lowerBound, upperBound, currentMaxLen + 1);
    }

    let finalResult = 0;
    // Iterate through all possible values to find the overall maximum length
    for (let i = MIN_INDEX; i <= MAX_INDEX; i++) {
        finalResult = Math.max(finalResult, updaterStructure.queryValueAtIndex(i));
    }
    return finalResult;
}

const programOutcome = processSolution();
if (programOutcome !== undefined) console.log(String(programOutcome));
if (outputVault.length) console.log(outputVault.join("\n"));